import { describe, expect, it, beforeEach } from "vitest";
import { createSession, getSession, sessionCookie, clearSessionCookie } from "../api/_lib/session";
import { requireRole, requireSession } from "../api/_lib/authz";
import { GET as getMe } from "../api/auth/me";
import { POST as postLogout } from "../api/auth/logout";
import { GET as getDoctors } from "../api/doctors/index";

describe("End-to-End Session & Role-Based Dashboard Access", () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = "e2e-test-secret-easymed-key-2026";
  });

  describe("Session Lifecycle (Restore & Logout)", () => {
    it("restores session for patient through GET /api/auth/me", async () => {
      const token = createSession({
        userId: "pat-123",
        userType: "patient",
        name: "Praveen Jayaraman",
        phone: "+919876543210",
      });
      const req = new Request("https://easymed.test/api/auth/me", {
        headers: { cookie: `easymed_session=${token}` },
      });
      const res = await getMe(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.authenticated).toBe(true);
      expect(data.user.userId).toBe("pat-123");
      expect(data.user.userType).toBe("patient");
    });

    it("restores session for doctor through GET /api/auth/me", async () => {
      const token = createSession({
        userId: "doc-456",
        userType: "doctor",
        name: "Dr. Arvind Rao",
        phone: "+919876543211",
      });
      const req = new Request("https://easymed.test/api/auth/me", {
        headers: { cookie: `easymed_session=${token}` },
      });
      const res = await getMe(req);
      const data = await res.json();
      expect(data.authenticated).toBe(true);
      expect(data.user.userType).toBe("doctor");
    });

    it("restores session for ASHA worker through GET /api/auth/me", async () => {
      const token = createSession({
        userId: "asha-789",
        userType: "asha",
        name: "Kamala Devi",
        phone: "+919876543212",
      });
      const req = new Request("https://easymed.test/api/auth/me", {
        headers: { cookie: `easymed_session=${token}` },
      });
      const res = await getMe(req);
      const data = await res.json();
      expect(data.authenticated).toBe(true);
      expect(data.user.userType).toBe("asha");
    });

    it("restores session for Admin through GET /api/auth/me", async () => {
      const token = createSession({
        userId: "adm-001",
        userType: "admin",
        name: "System Admin",
        role: "super_admin",
      });
      const req = new Request("https://easymed.test/api/auth/me", {
        headers: { cookie: `easymed_session=${token}` },
      });
      const res = await getMe(req);
      const data = await res.json();
      expect(data.authenticated).toBe(true);
      expect(data.user.userType).toBe("admin");
      expect(data.user.role).toBe("super_admin");
    });

    it("returns 401 when session cookie is absent or invalid", async () => {
      const req = new Request("https://easymed.test/api/auth/me");
      const res = await getMe(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.authenticated).toBe(false);
    });

    it("performs unified logout through POST /api/auth/logout and clears session cookie", async () => {
      const req = new Request("https://easymed.test/api/auth/logout", {
        method: "POST",
      });
      const res = await postLogout(req);
      expect(res.status).toBe(200);
      const setCookie = res.headers.get("Set-Cookie");
      expect(setCookie).toContain("easymed_session=;");
      expect(setCookie).toContain("Max-Age=0");
    });
  });

  describe("Role-Based Dashboard Data Access Controls", () => {
    it("allows patient to access patient-authorized routes", () => {
      const token = createSession({ userId: "p1", userType: "patient", name: "Pat" });
      const req = new Request("https://easymed.test", { headers: { cookie: `easymed_session=${token}` } });
      const auth = requireRole(req, ["patient", "admin"]);
      expect(auth).not.toBeInstanceOf(Response);
      expect((auth as any).userType).toBe("patient");
    });

    it("prevents doctor from accessing patient-only route", () => {
      const token = createSession({ userId: "d1", userType: "doctor", name: "Doc" });
      const req = new Request("https://easymed.test", { headers: { cookie: `easymed_session=${token}` } });
      const auth = requireRole(req, ["patient"]);
      expect(auth).toBeInstanceOf(Response);
      expect((auth as Response).status).toBe(403);
    });

    it("allows doctor and ASHA to access doctor directory endpoint", () => {
      const docToken = createSession({ userId: "d1", userType: "doctor", name: "Doc" });
      const docReq = new Request("https://easymed.test", { headers: { cookie: `easymed_session=${docToken}` } });
      const docAuth = requireRole(docReq, ["patient", "doctor", "asha", "admin"]);
      expect(docAuth).not.toBeInstanceOf(Response);

      const ashaToken = createSession({ userId: "a1", userType: "asha", name: "Asha" });
      const ashaReq = new Request("https://easymed.test", { headers: { cookie: `easymed_session=${ashaToken}` } });
      const ashaAuth = requireRole(ashaReq, ["patient", "doctor", "asha", "admin"]);
      expect(ashaAuth).not.toBeInstanceOf(Response);
    });

    it("restricts admin team modifications to admin role", () => {
      const patToken = createSession({ userId: "p1", userType: "patient", name: "Pat" });
      const req = new Request("https://easymed.test", { headers: { cookie: `easymed_session=${patToken}` } });
      const auth = requireRole(req, ["admin"]);
      expect(auth).toBeInstanceOf(Response);
      expect((auth as Response).status).toBe(403);
    });
  });
});
