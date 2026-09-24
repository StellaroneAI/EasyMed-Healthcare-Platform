import { describe, expect, it } from "vitest";
import { createSession, getSession, sessionCookie } from "../api/_lib/session";

describe("session security",()=>{\n  process.env.SESSION_SECRET="test-session-secret";
  it("round-trips a signed session cookie",()=>{
    const session=createSession({userId:"u1",userType:"patient",name:"Test User"});
    const request=new Request("https://example.test",{headers:{cookie:session.cookie}});
    expect(getSession(request)?.userId).toBe("u1");
  });
  it("rejects a tampered cookie",()=>{
    const session=createSession({userId:"u1",userType:"patient",name:"Test User"});
    const tampered=session.cookie.replace(/.$/,"x");
    const request=new Request("https://example.test",{headers:{cookie:sessionCookie(tampered)}});
    expect(getSession(request)).toBeNull();
  });
});
