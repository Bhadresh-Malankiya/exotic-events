import { makePdf } from '../src/lib/business/pdf';
import { settingsSchema,type BusinessDocument } from '../src/lib/business/schema';
import { PDFDocument } from 'pdf-lib';
import {randomUUID} from 'node:crypto';
import fs from 'node:fs/promises';
async function main(){
 const names=['Floral backdrop','Mandap styling','Ambient lighting','Sound system','Stage platform','Guest seating','Welcome signage','Event coordination'];
 const doc:BusinessDocument={id:randomUUID(),number:'INV-2026-SAMPLE',kind:'invoice',status:'issued',clientName:'Sample Client · Preview Only',clientEmail:'client@example.com',clientPhone:'+91 90000 00000',clientAddress:'Surat, Gujarat',event:'Wedding celebration',eventDate:'2026-12-20',dueDate:'2026-12-10',enquiryId:'',lines:names.map((name,i)=>({id:randomUUID(),catalogId:'',name,variant:i%2?'Premium':'Standard',description:'Setup, styling and collection included.',quantity:1,unit:'event',rate:5000+i*2500})),discount:5000,taxRate:18,notes:'Design preview only. Not a payment request.',terms:'Dates are confirmed after the agreed advance payment. Any change in scope will be quoted separately.',business:{...settingsSchema.parse({}),upiId:'preview@example',payeeName:'Sample Preview Only',email:'hello@example.com'},payments:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
 const bytes=await makePdf(doc);await fs.writeFile('.private/qa/branded-invoice.pdf',bytes);const pdf=await PDFDocument.load(bytes);if(pdf.getPageCount()!==1)throw Error('Typical eight-item invoice should fit on one A4 page');
 const long={...doc,lines:Array.from({length:35},(_,i)=>({...doc.lines[i%8],id:randomUUID(),name:`${i+1} ${doc.lines[i%8].name}`}))};const multi=await makePdf(long);await fs.writeFile('.private/qa/branded-invoice-long.pdf',multi);console.log('A4 checks: typical invoice = 1 page; extended invoice = '+(await PDFDocument.load(multi)).getPageCount()+' pages.');
}
main();
