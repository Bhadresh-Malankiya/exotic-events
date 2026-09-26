// Exercises only synthetic records; removes exactly those records afterward.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {del} from '@vercel/blob';
const base=process.env.QA_BASE_URL||'http://localhost:3001';
const password=(await fs.readFile('.private/admin-access.txt','utf8')).match(/Password: (.+)/)[1];
const login=await fetch(base+'/api/admin/session',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify({password})});assert.equal(login.status,200);
const cookie=login.headers.get('set-cookie').split(';')[0];
const cleanup=[];
async function req(path,body,expected=200,auth=true){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{origin:base,'content-type':'application/json',...(auth?{cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});const txt=await r.text();assert.equal(r.status,expected,`${path}: ${r.status} ${txt.slice(0,300)}`);return txt?JSON.parse(txt):null;}
async function document(id){return (await req('/api/admin/business')).documents.find(d=>d.id===id);}
const call=(b,status=200)=>req('/api/admin/business',b,status);
const input={kind:'quotation',clientName:'QA Sample — Not a Client',clientEmail:'',clientPhone:'',clientAddress:'Test-only address',event:'Quality assurance sample',eventDate:'2026-12-20',dueDate:'2026-12-01',enquiryId:'',lines:[{id:randomUUID(),catalogId:'',name:'Floral decoration',variant:'Premium',description:'White flowers with seasonal greenery',quantity:2,unit:'arrangements',rate:15000.25},{id:randomUUID(),catalogId:'',name:'Event lighting',variant:'Warm amber',description:'Setup, operation and collection',quantity:1,unit:'event',rate:10000}],discount:1000,taxRate:18,notes:'SYNTHETIC TEST — NOT A REAL QUOTATION',terms:'For software validation only. No booking or payment is requested.'};
try{
 await req('/api/admin/business',null,401,false);
 const csrf=await fetch(base+'/api/admin/business',{method:'POST',headers:{origin:'https://wrong.example',cookie,'content-type':'application/json'},body:'{}'});assert.equal(csrf.status,401);
 await call({action:'create',value:{...input,discount:999999}},400);
 let q=(await call({action:'create',value:input})).document;cleanup.push('business/documents/'+q.id+'.json');q=await document(q.id);
 await call({action:'update',id:q.id,etag:'stale',value:input},409);
 await call({action:'invoice',id:q.id,etag:q.etag},400);
 q=(await call({action:'share',id:q.id,etag:q.etag})).document;cleanup.push('business/links/'+q.token+'.json');q=await document(q.id);
 await call({action:'update',id:q.id,etag:q.etag,value:input},400);
 const publicPage=await fetch(base+'/documents/'+q.token);assert.equal(publicPage.status,200);const html=await publicPage.text();assert(!html.includes('partnerEmails'));assert(html.includes('Quality assurance sample'));
 await req('/api/documents/'+q.token,{name:'QA Tester',action:'approve',agree:true},200,false);
 await req('/api/documents/'+q.token,{name:'QA Tester',action:'approve',agree:true},409,false);
 q=await document(q.id);assert.equal(q.status,'approved');
 let inv=(await call({action:'invoice',id:q.id,etag:q.etag})).document;cleanup.push('business/documents/'+inv.id+'.json');q=await document(q.id);const again=await call({action:'invoice',id:q.id,etag:q.etag});assert.equal(again.document.id,inv.id);
 inv=await document(inv.id);inv=(await call({action:'share',id:inv.id,etag:inv.etag})).document;cleanup.push('business/links/'+inv.token+'.json');inv=await document(inv.id);
 await call({action:'payment',id:inv.id,etag:inv.etag,payment:{id:randomUUID(),amount:99999999,date:'2026-09-27',reference:'QA overpayment',method:'UPI'}},400);
 await call({action:'payment',id:inv.id,etag:inv.etag,payment:{id:randomUUID(),amount:5000,date:'2026-09-27',reference:'QA test reference only',method:'UPI'}});
 inv=await document(inv.id);assert.equal(inv.payments.length,1);
 const pdf=await fetch(base+'/api/documents/'+inv.token+'/pdf');assert.equal(pdf.status,200);const bytes=Buffer.from(await pdf.arrayBuffer());assert.equal(bytes.subarray(0,4).toString(),'%PDF');await fs.mkdir('.private/qa',{recursive:true});await fs.writeFile('.private/qa/invoice.pdf',bytes);
 await call({action:'cancel',id:inv.id,etag:inv.etag},400);
 console.log('PASS: authentication, origin guard, totals validation, stale-write rejection, locked shared documents, private approval, duplicate approval rejection, single invoice conversion, overpayment rejection, payment tracking, public PDF.');
} finally { if(cleanup.length) await del(cleanup); console.log('Removed '+cleanup.length+' synthetic document/link objects.'); }
