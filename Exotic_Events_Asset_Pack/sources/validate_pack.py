from pathlib import Path
import json,struct,hashlib,math,numpy as np,xml.etree.ElementTree as ET
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];A=ROOT/'public/assets/exotic'
report={'checks':{},'warnings':[],'failures':[]}
models=[]
for p in (A/'models').rglob('*.glb'):
 try:
  b=p.read_bytes();magic,version,total=struct.unpack_from('<4sII',b,0);assert magic==b'glTF' and version==2 and total==len(b)
  offset=12;j=None;binary=None
  while offset<len(b):
   length,typ=struct.unpack_from('<II',b,offset);assert length%4==0;offset+=8;chunk=b[offset:offset+length];assert len(chunk)==length
   if typ==0x4e4f534a:j=json.loads(chunk)
   if typ==0x004e4942:binary=chunk
   offset+=length
  assert j and binary and j['asset']['version']=='2.0';assert j['buffers'][0]['byteLength']<=len(binary)
  for v in j['bufferViews']:assert v.get('byteOffset',0)+v['byteLength']<=len(binary)
  arrays=[]
  for a in j['accessors']:
   nc={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']];dt={5126:'<f4',5125:'<u4',5123:'<u2',5121:'u1'}[a['componentType']];v=j['bufferViews'][a['bufferView']];item=np.dtype(dt).itemsize;stride=v.get('byteStride',item*nc);off=v.get('byteOffset',0)+a.get('byteOffset',0);assert a.get('byteOffset',0)+(a['count']-1)*stride+item*nc<=v['byteLength'];arr=np.ndarray((a['count'],nc),dtype=dt,buffer=binary,offset=off,strides=(stride,item)).copy();assert np.isfinite(arr).all();arrays.append(arr)
  triangles=0
  for mesh in j['meshes']:
   for pr in mesh['primitives']:
    pos=arrays[pr['attributes']['POSITION']];idx=arrays[pr['indices']];assert idx.max()<len(pos);assert idx.size%3==0;triangles+=idx.size//3;assert 'NORMAL' in pr['attributes'];norm=arrays[pr['attributes']['NORMAL']];lens=np.linalg.norm(norm,axis=1);assert np.allclose(lens[lens>1e-5],1,atol=.002)
  for mat in j.get('materials',[]):
   prm=mat['pbrMetallicRoughness'];assert all(0<=v<=1 for v in prm.get('baseColorFactor',[1,1,1,1]));assert 0<=prm.get('metallicFactor',1)<=1;assert 0<=prm.get('roughnessFactor',1)<=1
  assert not any('uri' in buf for buf in j.get('buffers',[]));assert not j.get('images')
  for anim in j.get('animations',[]):
   for sampler in anim['samplers']:
    times=arrays[sampler['input']].ravel();assert np.all(np.diff(times)>0);assert len(times)==len(arrays[sampler['output']])
   for chan in anim['channels']:assert 0<=chan['target']['node']<len(j['nodes'])
  models.append({'file':str(p.relative_to(ROOT)),'triangles':int(triangles),'clips':len(j.get('animations',[])),'bytes':len(b),'status':'structurally checked'})
 except Exception as e:report['failures'].append({'file':str(p),'error':repr(e)})
report['checks']['glb']={'count':len(models),'details':models,'method':'Custom GLB header, chunk alignment, embedded buffers, accessor/index bounds, finite positions, unit normals, material ranges and animation channel/timestamp checks; not Khronos validator certification.'}
svg_count=0
for p in A.rglob('*.svg'):
 try:
  tree=ET.fromstring(p.read_bytes());assert tree.tag.endswith('svg');assert tree.get('viewBox');assert '<script' not in p.read_text();svg_count+=1
 except Exception as e:report['failures'].append({'file':str(p),'error':repr(e)})
report['checks']['svg']={'count':svg_count,'xml_parse':'pass','scripts':'none'}
lot=[]
for p in (A/'lottie').glob('*.json'):
 try:
  j=json.loads(p.read_text());assert j['fr']==30 and j['w']==512 and j['h']==512 and j['op']>j['ip'];assert j['assets']==[];assert j['layers'];
  for l in j['layers']:
   assert l['ty']==4 and l['shapes'];assert l['op']==j['op']
   for name,prop in l['ks'].items():
    if prop.get('a'):
     times=[f['t'] for f in prop['k']];assert times==sorted(set(times))
     if name in ['p','s','a']:
      assert all(len(k['s'])==3 for k in prop['k'])
    elif name in ['p','s','a']:assert len(prop['k'])==3
  lot.append(p.stem)
 except Exception as e:report['failures'].append({'file':str(p),'error':repr(e)})
report['checks']['lottie']={'count':len(lot),'json_and_expected_structure':'checked','external_assets':'none','production_lottie_player_tested':False}
imgs=0;alpha=[]
for p in A.rglob('*'):
 if p.suffix.lower() in ['.png','.webp','.jpg']:
  try:
   im=Image.open(p);im.verify();imgs+=1
   if p.parent.name in ['model-renders','overlays']:
    im=Image.open(p);assert im.mode=='RGBA' and im.getchannel('A').getextrema()==(0,255) if p.parent.name=='model-renders' else im.mode=='RGBA';alpha.append(str(p.relative_to(ROOT)))
  except Exception as e:report['failures'].append({'file':str(p),'error':repr(e)})
report['checks']['images']={'decode_checked':imgs,'transparent_model_renders_and_overlays':len(alpha)}
for row in json.loads((ROOT/'catalogue-data.json').read_text()):
 for key in ['src','image','secondary','animation']:
  if row.get(key) and not (ROOT/row[key]).is_file():report['failures'].append({'catalogue':row['id'],'missing':row[key]})
report['checks']['catalogue_links']='All listed local asset files exist'
report['warnings']=['Not a finished application: production Next.js/R3F/Motion integration has not been built or tested.','Lottie JSON was structurally checked; playback in the actual production Lottie runtime remains untested. Animated-SVG alternatives are separately previewable.','Logo SVGs are approximate traces of a low-resolution screenshot, not an official master vector.','The 3D assets are newly built stylized originals, not recovered authoring files behind the earlier image collage.']
(ROOT/'QUALITY_CHECKS.json').write_text(json.dumps(report,indent=2));print('GLBs',len(models),'SVGs',svg_count,'Lottie',len(lot),'images',imgs,'FAILURES',report['failures'])
