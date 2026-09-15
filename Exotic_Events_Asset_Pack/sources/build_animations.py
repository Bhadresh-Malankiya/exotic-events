from pathlib import Path
import json,math,numpy as np,struct,copy
ROOT=Path(__file__).resolve().parents[1];A=ROOT/'public/assets/exotic'
for p in ['lottie','lottie-posters','animated-svg','models/animated']:(A/p).mkdir(parents=True,exist_ok=True)
G=[214/255,183/255,107/255,1];IV=[241/255,235/255,221/255,1];RO=[.66,.39,.43,1]
FR=30;N=120

def prop(x):return {'a':0,'k':x}
def key(frames):
 frames=list(sorted(dict(frames).items()))
 out=[]
 for i,(t,v) in enumerate(frames):
  val=v if isinstance(v,list) else [v]
  row={'t':t,'s':val}
  if i<len(frames)-1:
   end=frames[i+1][1];row.update({'e':end if isinstance(end,list) else [end], 'i':{'x':[.67],'y':[1]},'o':{'x':[.33],'y':[0]}})
  out.append(row)
 return {'a':1,'k':out}
def shape_path(points,closed=False):return {'ty':'sh','ks':prop({'v':points,'i':[[0,0] for _ in points],'o':[[0,0] for _ in points],'c':closed}),'nm':'Custom path'}
def bezier_path(v,i,o,closed=False):return {'ty':'sh','ks':prop({'v':v,'i':i,'o':o,'c':closed}),'nm':'Curved path'}
def ellipse(w,h=None,pos=(0,0)):return {'ty':'el','p':prop(list(pos)),'s':prop([w,h or w]),'d':1,'nm':'Ellipse'}
def rect(w,h,r=0,pos=(0,0)):return {'ty':'rc','p':prop(list(pos)),'s':prop([w,h]),'r':prop(r),'d':1,'nm':'Rectangle'}
def fill(c):return {'ty':'fl','c':prop(c),'o':prop(100),'r':2,'nm':'Fill'}
def stroke(c,w=3):return {'ty':'st','c':prop(c),'o':prop(100),'w':prop(w),'lc':2,'lj':2,'ml':4,'nm':'Stroke'}
def trim(start=0,end=None):return {'ty':'tm','s':prop(start),'e':end or key([(0,0),(70,100),(120,100)]),'o':prop(0),'m':1,'nm':'Path reveal'}
def tr():return {'ty':'tr','p':prop([0,0]),'a':prop([0,0]),'s':prop([100,100]),'r':prop(0),'o':prop(100),'sk':prop(0),'sa':prop(0)}
def layer(name,shapes,pos=(256,256),rot=0,opacity=100,scale=(100,100),anchor=(0,0)):
 def cv(v):return v if isinstance(v,dict) else prop(v)
 def d3(v,z):
  if isinstance(v,dict):
   v=copy.deepcopy(v)
   if v.get('a'):
    for k in v['k']:
     for q in ['s','e']:
      if q in k and len(k[q])==2:k[q].append(z)
   elif len(v['k'])==2:v['k'].append(z)
   return v
  return list(v)+([z] if len(v)==2 else [])
 pos=d3(pos,0);scale=d3(scale,100);anchor=d3(anchor,0)
 return {'ddd':0,'ind':0,'ty':4,'nm':name,'sr':1,'ks':{'o':cv(opacity),'r':cv(rot),'p':cv(list(pos) if not isinstance(pos,dict) else pos),'a':prop(list(anchor)),'s':cv(list(scale) if not isinstance(scale,dict) else scale)},'ao':0,'shapes':[{'ty':'gr','it':shapes+[tr()],'nm':name}],'ip':0,'op':N,'st':0,'bm':0}
def anim(name,layers,loop=True):
 for i,l in enumerate(layers):l['ind']=i+1
 return {'v':'5.12.2','fr':FR,'ip':0,'op':N,'w':512,'h':512,'nm':name,'ddd':0,'assets':[],'layers':layers,'markers':[{'tm':0,'cm':'loop' if loop else 'play-once','dr':N}],'meta':{'generator':'Exotic original procedural vector animation','loopRecommended':loop,'posterFrame':90,'reducedMotion':'Show poster frame; no looping or scroll scrubbing'}}

def logo_shapes():
 data=json.loads((ROOT/'sources/emblem-contours.json').read_text());w,h=data['w'],data['h'];s=1.12
 return [shape_path([[(x-w/2)*s,(y-h/2)*s] for x,y in pts],True) for pts in data['paths']]+[fill(G)]
def arc(radius=170):
 points=[[radius*math.cos(a),radius*math.sin(a)] for a in np.linspace(-.9,1.3,48)]
 return [shape_path(points),stroke(G,4)]
AN={}
AN['exotic-emblem-orbit']=anim('Exotic / Emblem orbit',[
 layer('Original-emblem-approximate-trace',logo_shapes(),opacity=95),
 layer('Orbit-track',[ellipse(366),stroke(G,1.4)],opacity=24),
 layer('Orbit-light',arc(183),rot=key([(0,0),(120,360)])),
 layer('Small-orbit-dot',[ellipse(7,pos=(183,0)),fill(IV)],rot=key([(0,0),(120,360)])),
])
AN['exotic-emblem-reveal']=anim('Exotic / Emblem reveal',[
 layer('Original-emblem-approximate-trace',logo_shapes(),scale=key([(0,[75,75]),(42,[100,100]),(120,[100,100])]),opacity=key([(0,0),(30,100),(120,100)])),
 layer('Celebration-circle',[ellipse(360),stroke(G,2),trim()],opacity=70),
],False)
ls=[]
for i in range(8):
 # Petals use shared center, radial elliptic forms.
 ls.append(layer(f'Petal-{i+1}',[ellipse(65,148,pos=(0,-80)),stroke(G,2.5)],rot=i*45,opacity=key([(0,12),(10+i*5,12),(28+i*5,100),(85,100),(120,12)]),scale=key([(0,[80,80]),(65,[100,100]),(120,[80,80])])))
ls.append(layer('Bloom-heart',[ellipse(30),fill(G)]));AN['petal-bloom']=anim('Exotic / Petal bloom',ls)
ls=[]
for i,r in enumerate([92,140,180]):
 ls+=[layer(f'Orbit-{i}',[ellipse(r*2),stroke(G,1)],opacity=30),layer(f'Light-{i}',[ellipse(10,pos=(r,0)),fill(G)],rot=key([(0,i*50),(120,i*50+(-360 if i%2 else 360))]))]
AN['gold-orbit']=anim('Exotic / Gold orbit',ls)
AN['invitation-open']=anim('Exotic / Invitation opens',[
 layer('Envelope',[rect(290,180,10),stroke(G,3)],pos=(256,295)),
 layer('Invitation-card',[rect(230,155,5),fill(IV)],pos=key([(0,[256,295]),(45,[256,220]),(95,[256,220]),(120,[256,295])])),
 layer('Card-seal',[ellipse(28),fill(G)],pos=key([(0,[256,285]),(45,[256,200]),(95,[256,200]),(120,[256,285])])),
 layer('Fold-lines',[shape_path([[-145,-80],[0,20],[145,-80]]),stroke(G,3)],pos=(256,295)),
])
AN['curtain-reveal']=anim('Exotic / Curtains opening',[
 layer('Stage-arch',[shape_path([[-145,140],[-145,-55],[-140,-95],[-100,-140],[0,-170],[100,-140],[140,-95],[145,-55],[145,140]]),stroke(G,3)]),
 layer('Left-curtain',[rect(165,325,8),fill(G)],pos=key([(0,[174,256]),(65,[50,256]),(120,[50,256])])),
 layer('Right-curtain',[rect(165,325,8),fill(G)],pos=key([(0,[338,256]),(65,[462,256]),(120,[462,256])])),
],False)
AN['navratri-rhythm']=anim('Exotic / Navratri rhythm',[
 layer('Dandiya-left',[rect(17,255,8),fill(G)],rot=key([(0,-32),(30,-52),(60,-32),(90,-52),(120,-32)]),pos=(231,256)),
 layer('Dandiya-right',[rect(17,255,8),fill(RO)],rot=key([(0,32),(30,52),(60,32),(90,52),(120,32)]),pos=(281,256)),
 layer('Rhythm-glow',[ellipse(35),stroke(G,3)],pos=(256,135),scale=key([(0,[50,50]),(30,[100,100]),(60,[50,50]),(90,[100,100]),(120,[50,50])]),opacity=key([(0,25),(30,100),(60,25),(90,100),(120,25)])),
])
ls=[layer('Chandelier-frame',[shape_path([[0,-150],[0,0]]),shape_path([[-140,20],[0,-50],[140,20]]),ellipse(280,65,pos=(0,20)),stroke(G,3)])]
for i,x in enumerate([-120,-60,0,60,120]):
 ls.append(layer(f'Crystal-{i}',[shape_path([[0,0],[-12,35],[0,70],[12,35]],True),fill(IV)],pos=(256+x,294),opacity=key([(0,35),(20+i*7,100),(60+i*5,35),(100,100),(120,35)])))
AN['chandelier-glow']=anim('Exotic / Chandelier glow',ls)
ls=[layer('Journey-route',[shape_path([[-190,15],[-95,-20],[0,15],[95,45],[190,0]]),stroke(G,3),trim()])]
for i,(x,y) in enumerate([(-190,15),(-95,-20),(0,15),(95,45),(190,0)]):
 ls.append(layer(f'Step-{i}',[ellipse(14),fill(IV)],pos=(256+x,256+y),opacity=key([(0,12),(i*16,12),(min(i*16+15,110),100),(120,100)])))
AN['journey-draw']=anim('Exotic / Planning journey',ls,False)
wave=bezier_path([[-190,0],[0,0],[190,0]],[[0,0],[-90,90],[-90,-90]],[[90,-90],[90,90],[0,0]])
AN['gold-ribbon-flow']=anim('Exotic / Ribbon flow',[
 layer('Ribbon-line',[wave,stroke(G,7)],rot=key([(0,-8),(60,8),(120,-8)])),
 layer('Ribbon-shadow',[wave,stroke(IV,1.5)],pos=(256,269),rot=key([(0,-6),(60,6),(120,-6)]),opacity=50),
])
AN['booking-success']=anim('Exotic / Booking confirmation',[
 layer('Success-circle',[ellipse(265),stroke(G,4)],scale=key([(0,[70,70]),(28,[100,100]),(120,[100,100])]),opacity=key([(0,0),(24,100),(120,100)])),
 layer('Check-mark',[shape_path([[-60,0],[-15,44],[72,-58]]),stroke(G,9),trim(end=key([(0,0),(30,0),(62,100),(120,100)]))]),
],False)
ls=[]
for i in range(3):ls.append(layer(f'Dot-{i}',[ellipse(22),fill(G)],pos=(196+i*60,256),opacity=key([(0,25),(10+i*10,25),(30+i*10,100),(65+i*10,25),(120,25)]),scale=key([(0,[80,80]),(30+i*10,[115,115]),(65+i*10,[80,80]),(120,[80,80])])))
AN['loading-dots']=anim('Exotic / Loading dots',ls)
AN['scroll-cue']=anim('Exotic / Scroll cue',[
 layer('Scroll-track',[rect(64,112,30),stroke(G,3)]),
 layer('Scroll-dot',[ellipse(8),fill(G)],pos=key([(0,[256,230]),(70,[256,273]),(120,[256,230])]),opacity=key([(0,100),(70,10),(120,100)])),
])
ls=[]
for i,(x,y,s) in enumerate([(130,155,.7),(325,170,.4),(250,290,1),(380,330,.45),(120,360,.32)]):
 pts=[[0,-45],[9,-9],[45,0],[9,9],[0,45],[-9,9],[-45,0],[-9,-9]]
 ls.append(layer(f'Sparkle-{i}',[shape_path(pts,True),fill(G)],pos=(x,y),scale=(s*100,s*100),opacity=key([(0,20),(15+i*12,100),(75+i*5,20),(120,20)])))
AN['sparkle-field']=anim('Exotic / Sparkles',ls)
for name,d in AN.items():(A/'lottie'/f'{name}.json').write_text(json.dumps(d,separators=(',',':')))
(ROOT/'lottie-manifest.json').write_text(json.dumps([{'id':k,'title':v['nm'],'path':f'public/assets/exotic/lottie/{k}.json','durationSeconds':v['op']/v['fr'],'loopRecommended':v['meta']['loopRecommended'],'posterFrame':90} for k,v in AN.items()],indent=2))

# True embedded glTF animation clips for four selected pieces (not PNGs).
def write_clip(name,kind):
 b=(A/'models'/f'{name}.glb').read_bytes();n=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+n]);off=20+n;bn,bt=struct.unpack_from('<II',b,off);binary=bytearray(b[off+8:off+8+bn]);binary=binary[:j['buffers'][0]['byteLength']]
 def append(arr,typ,mins=None,maxs=None):
  while len(binary)%4:binary.append(0)
  start=len(binary);buf=np.asarray(arr,dtype='<f4').tobytes();binary.extend(buf);idx=len(j['bufferViews']);j['bufferViews'].append({'buffer':0,'byteOffset':start,'byteLength':len(buf)})
  acc={'bufferView':idx,'componentType':5126,'count':len(arr),'type':typ}
  if mins is not None:acc['min']=mins;acc['max']=maxs
  ai=len(j['accessors']);j['accessors'].append(acc);return ai
 times=[0,1,2,3,4];tidx=append(times,'SCALAR',[0],[4]);clip={'name':kind,'channels':[],'samplers':[]}
 # World/root node has no matrix and is a valid transform animation target.
 if kind=='Float':values=[[0,0,0],[0,.06,0],[0,0,0],[0,-.06,0],[0,0,0]];typ='VEC3';path='translation'
 else:
  angles=[0,.035,0,-.035,0] if kind=='GentleSway' else [0,np.pi/2,np.pi,3*np.pi/2,2*np.pi]
  axis=np.array([0,0,1]) if kind=='GentleSway' else np.array([0,1,0]);values=[[*list(axis*np.sin(a/2)),float(np.cos(a/2))] for a in angles];typ='VEC4';path='rotation'
 idx=append(values,typ);clip['samplers'].append({'input':tidx,'output':idx,'interpolation':'LINEAR'});clip['channels'].append({'sampler':0,'target':{'node':0,'path':path}});j['animations']=[clip];j['buffers'][0]['byteLength']=len(binary);j['asset']['generator']='Exotic procedural asset source + original animation'
 raw=json.dumps(j,separators=(',',':')).encode();raw+=b' '*((-len(raw))%4);binary+=b'\x00'*((-len(binary))%4)
 glb=struct.pack('<4sII',b'glTF',2,12+8+len(raw)+8+len(binary))+struct.pack('<II',len(raw),0x4e4f534a)+raw+struct.pack('<II',len(binary),0x004e4942)+binary
 (A/'models/animated'/f'{name}.glb').write_bytes(glb)
for n,k in [('wedding-rings','SlowTurn'),('sculptural-ribbon','Float'),('crystal-chandelier','GentleSway'),('gold-sparkle','SlowTurn')]:write_clip(n,k)
print('DONE',len(AN),'Lottie animations; 4 animated GLBs')
