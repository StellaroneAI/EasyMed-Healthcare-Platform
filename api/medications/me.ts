import { getDb } from '../_lib/mongo.js';
import { json, methodNotAllowed } from '../_lib/response.js';
import { requireRole } from '../_lib/authz.js';
import { audit } from '../_lib/audit.js';

const clean=(v:unknown,max=200)=>typeof v==='string'?v.trim().slice(0,max):'';
export async function GET(request:Request):Promise<Response>{
 const a=requireRole(request,['patient','doctor','admin']); if(a instanceof Response)return a;
 const db=await getDb(); const filter=a.userType==='patient'?{patientId:a.userId}:a.userType==='doctor'?{doctorId:a.userId}:{};
 const medications=await db.collection('medications').find(filter).sort({createdAt:-1}).limit(100).toArray();
 return json({medications});
}
export async function POST(request:Request):Promise<Response>{
 const a=requireRole(request,['doctor','admin']); if(a instanceof Response)return a;
 try{const b=await request.json(); const patientId=clean(b?.patientId,100),name=clean(b?.name,160),dosage=clean(b?.dosage,100);
 if(!patientId||!name||!dosage)return json({error:'patientId, name and dosage are required.'},{status:400});
 const med={id:crypto.randomUUID(),patientId,doctorId:a.userType==='doctor'?a.userId:clean(b?.doctorId,100),name,dosage,frequency:clean(b?.frequency,100),times:Array.isArray(b?.times)?b.times.filter((x:unknown)=>typeof x==='string').slice(0,8):[],instructions:clean(b?.instructions,1000),startDate:clean(b?.startDate,30)||new Date().toISOString().slice(0,10),endDate:clean(b?.endDate,30)||undefined,active:true,createdBy:a.userId,createdAt:new Date(),updatedAt:new Date()};
 const db=await getDb(); await db.collection('medications').insertOne(med); await audit({actorId:a.userId,actorRole:a.userType,action:'medications.create',resource:med.id,outcome:'success'}); return json({success:true,medication:med},{status:201});
 }catch{return json({error:'Unable to create medication.'},{status:500})}
}
export async function PATCH(request:Request):Promise<Response>{
 const a=requireRole(request,['doctor','admin']); if(a instanceof Response)return a;
 try{const b=await request.json(); if(typeof b?.id!=='string')return json({error:'Medication id is required.'},{status:400}); const db=await getDb(); const existing=await db.collection('medications').findOne({id:b.id}); if(!existing)return json({error:'Medication not found.'},{status:404}); if(a.userType==='doctor'&&existing.doctorId!==a.userId)return json({error:'Forbidden.'},{status:403});
 const updates:Record<string,unknown>={updatedAt:new Date()}; for(const k of ['name','dosage','frequency','instructions','startDate','endDate'])if(typeof b[k]==='string')updates[k]=clean(b[k],k==='instructions'?1000:160); if(typeof b.active==='boolean')updates.active=b.active; if(Object.keys(updates).length===1)return json({error:'No valid changes.'},{status:400}); await db.collection('medications').updateOne({id:b.id},{$set:updates}); await audit({actorId:a.userId,actorRole:a.userType,action:'medications.update',resource:b.id,outcome:'success'}); return json({success:true});
 }catch{return json({error:'Unable to update medication.'},{status:500})}
}
export function PUT(){return methodNotAllowed(['GET','POST','PATCH']);} export function DELETE(){return methodNotAllowed(['GET','POST','PATCH']);}
