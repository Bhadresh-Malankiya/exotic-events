// Idempotent addition of editable planning examples; never replaces owner prices.
import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
const base=process.env.QA_BASE_URL||'http://localhost:3001';
const password=(await fs.readFile('.private/admin-access.txt','utf8')).match(/Password: (.+)/)[1];
const auth=await fetch(base+'/api/admin/session',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify({password})});if(!auth.ok)throw Error('Sign-in failed');
const cookie=auth.headers.get('set-cookie').split(';')[0];
const get=async p=>{const r=await fetch(base+p,{headers:{cookie}});if(!r.ok)throw Error('Read failed');return r.json();};
const {workspace}=await get('/api/admin/business'),content=await get('/api/admin/content');
await fs.mkdir('.private/qa',{recursive:true});await fs.writeFile(`.private/qa/workspace-before-starters-${Date.now()}.json`,JSON.stringify(workspace));
const w=workspace.value;
const definitions=[['Floral backdrop','Décor',15000,25000,30000,50000,'setup'],['Mandap styling','Weddings',30000,55000,65000,100000,'setup'],['Guest seating','Hospitality',80,150,200,350,'guest'],['Ambient lighting','Production',8000,15000,22000,40000,'event'],['Sound system & technician','Production',12000,20000,30000,50000,'day'],['Stage platform','Production',18000,30000,40000,65000,'setup'],['Welcome signage','Décor',2500,5000,6000,10000,'piece'],['Guest assistance team','Hospitality',1800,2500,3000,4500,'staff / day'],['Event coordination','Planning',15000,25000,35000,60000,'day'],['Photo corner','Celebrations',8000,15000,18000,30000,'setup'],['Transport & setup','Logistics',5000,10000,12000,20000,'event'],['Artist coordination','Entertainment',5000,10000,15000,25000,'event']];
let added=0;
for(const [name,category,lo,hi,plo,phi,unit] of definitions){if(w.catalog.some(c=>c.name.toLowerCase()===name.toLowerCase()))continue;w.catalog.push({id:randomUUID(),name,category,description:'Starter planning allowance. Confirm specification, availability and agreed price before sending.',active:true,variants:[{id:randomUUID(),name:'Standard',price:lo,maxPrice:hi,unit},{id:randomUUID(),name:'Premium',price:plo,maxPrice:phi,unit}]});added++;}
let calculators=0;
for(const s of content.value.published.servicePages.items.filter(s=>s.enabled)){if(w.estimates.some(e=>e.serviceSlug===s.slug))continue;const isDestination=s.slug.includes('destination'),isWedding=s.slug.includes('wedding'),isCorporate=s.slug.includes('corporate');w.estimates.push({id:randomUUID(),serviceSlug:s.slug,title:'Explore a planning budget',enabled:true,baseMin:isDestination?100000:isWedding?50000:isCorporate?40000:15000,baseMax:isDestination?250000:isWedding?120000:isCorporate?100000:45000,note:'Illustrative planning allowance, not a fixed quote. Venue, catering, travel, artists and taxes are excluded. We confirm scope and local vendor prices with you.',factors:[{id:randomUUID(),title:'Guest seating & basic guest support',unit:'guests',min:20,max:1000,defaultValue:100,low:100,high:300},{id:randomUUID(),title:'Styled décor areas',unit:'areas',min:1,max:10,defaultValue:1,low:8000,high:25000}]});calculators++;}
if(added||calculators){const r=await fetch(base+'/api/admin/business',{method:'POST',headers:{origin:base,cookie,'content-type':'application/json'},body:JSON.stringify({action:'workspace',value:w,etag:workspace.etag})});if(!r.ok)throw Error(await r.text());}
console.log(`Added ${added} editable starter items and ${calculators} service calculators. Existing settings/prices preserved.`);
