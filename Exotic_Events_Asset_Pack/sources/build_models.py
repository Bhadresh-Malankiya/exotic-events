from pathlib import Path
import numpy as np, trimesh, math, json, collections, copy
from PIL import Image
import vtk
from vtk.util.numpy_support import numpy_to_vtk, numpy_to_vtkIdTypeArray

ROOT=Path(__file__).resolve().parents[1]
AS=ROOT/'public/assets/exotic'
for p in ['models','models/mobile','model-renders','model-thumbnails','backgrounds','textures']:(AS/p).mkdir(parents=True,exist_ok=True)
META=[]
PALETTE={
 'gold':([.76,.57,.24,1],.82,.25),'champagne':([.87,.75,.47,1],.7,.3),
 'ivory':([.92,.865,.75,1],0,.62),'petal':([.89,.68,.65,1],0,.52),
 'rose':([.46,.12,.19,1],0,.65),'sage':([.24,.35,.23,1],0,.75),
 'dark':([.044,.052,.047,1],.25,.4),'pearl':([.9,.94,.95,1],.25,.15),
 'amber':([1,.64,.19,1],.2,.22),'paper':([.93,.90,.83,1],0,.95),
}
MATS={k:trimesh.visual.material.PBRMaterial(name=k,baseColorFactor=np.array(c),metallicFactor=m,roughnessFactor=r,doubleSided=True) for k,(c,m,r) in PALETTE.items()}
LOD=False

def transformed(mesh,pos=(0,0,0),scale=None,rot=None):
 m=mesh.copy()
 if scale is not None:m.apply_scale(scale)
 if rot is not None:m.apply_transform(trimesh.transformations.euler_matrix(*rot))
 m.apply_translation(pos);return m

def box(ext,pos=(0,0,0)):return transformed(trimesh.creation.box(extents=ext),pos)
def sph(scale=(1,1,1),pos=(0,0,0),sub=None):return transformed(trimesh.creation.icosphere(subdivisions=(1 if LOD else 2) if sub is None else sub,radius=1),pos,scale)
def cyl(radius,h,pos=(0,0,0),n=None):return transformed(trimesh.creation.cylinder(radius,h,sections=n or (16 if LOD else 40)),pos,rot=(math.pi/2,0,0))
def lathe(profile,n=None):
 n=n or (20 if LOD else 56);v=[];f=[]
 for r,y in profile:
  for i in range(n):
   a=2*math.pi*i/n;v.append([max(r,1e-5)*math.cos(a),y,max(r,1e-5)*math.sin(a)])
 for j in range(len(profile)-1):
  for i in range(n):
   a=j*n+i;b=j*n+(i+1)%n;c=b+n;d=a+n;f.extend([[a,c,b],[a,d,c]])
 return trimesh.Trimesh(v,f,process=True)
def tube(points,r=.025,sides=None):
 pts=np.array(points,float);sides=sides or (6 if LOD else 10);v=[];faces=[]
 for i,p in enumerate(pts):
  t=pts[min(i+1,len(pts)-1)]-pts[max(i-1,0)];t/=max(np.linalg.norm(t),1e-10)
  ref=np.array([0,0,1.]) if abs(t[2])<.85 else np.array([0,1.,0]);u=np.cross(t,ref);u/=np.linalg.norm(u);w=np.cross(t,u)
  for j in range(sides):v.append(p+r*(u*np.cos(j*2*np.pi/sides)+w*np.sin(j*2*np.pi/sides)))
 for i in range(len(pts)-1):
  for j in range(sides):a=i*sides+j;b=i*sides+(j+1)%sides;faces.extend([[a,b,b+sides],[a,b+sides,a+sides]])
 v += [pts[0],pts[-1]];s=len(v)-2;e=len(v)-1
 for j in range(sides):faces.extend([[s,(j+1)%sides,j],[e,(len(pts)-1)*sides+j,(len(pts)-1)*sides+(j+1)%sides]])
 return trimesh.Trimesh(v,faces,process=True)
def ring(r=.5,t=.025,y=0,plane='xz'):
 a=np.linspace(0,2*np.pi,40 if LOD else 88);p=np.c_[r*np.cos(a),np.zeros_like(a)+y,r*np.sin(a)]
 if plane=='xy':p=np.c_[r*np.cos(a),r*np.sin(a)+y,np.zeros_like(a)]
 return tube(p,t)

def combine(objs,name='object'):
 grouped=collections.defaultdict(list)
 for n,m,mat in objs:grouped[(n,mat)].append(m)
 return [(n,trimesh.util.concatenate(ms),mat) for (n,mat),ms in grouped.items()]
def move(objs,pos=(0,0,0),scale=None,rot=None,prefix=''):
 return [(prefix+n,transformed(m,pos,scale,rot),mat) for n,m,mat in objs]
def part(n,m,mat='gold'):return (n,m,mat)

def blossom(mat='ivory'):
 out=[]
 for count,rad,l,w,z in [(7,.14,.145,.084,0),(5,.077,.108,.073,.043)]:
  for i in range(count):
   a=2*np.pi*i/count+(0 if count==7 else .25)
   p=sph((l,w,.045),sub=1 if LOD else 2);p.apply_transform(trimesh.transformations.rotation_matrix(a,[0,0,1]));p.apply_translation([rad*np.cos(a),rad*np.sin(a),z])
   out.append(part('petals',p,mat))
 out.append(part('heart',sph((.075,.075,.05),(0,0,.08)), 'champagne' if mat=='gold' else 'ivory'))
 return combine(out)
def leaf():
 n=8 if LOD else 18;v=[];f=[]
 for i in range(n+1):
  t=i/n;w=.18*np.sin(np.pi*t);y=.8*t;z=.10*np.sin(np.pi*t)
  v.extend([[-w,y,z-.025],[0,y,z+.035],[w,y,z-.025]])
 for i in range(n):
  for j in range(2):a=i*3+j;f.extend([[a,a+1,a+4],[a,a+4,a+3]])
 return [part('leaf',trimesh.Trimesh(v,f,process=True),'sage'),part('vein',tube([[0,.02,0],[0,.4,.14],[0,.8,0]],.006),'champagne')]
def arch(triple=False,floral=False):
 out=[]
 for j in range(3 if triple else 1):
  z=-j*.22;r=1.4+j*.025;post=1.65
  pts=[[-r,0,z],[-r,post,z]]+[[r*np.cos(a),post+r*np.sin(a),z] for a in np.linspace(np.pi,0,30 if LOD else 70)]+[[r,0,z]]
  out.append(part('arch-frame',tube(pts,.045),'champagne'))
  for x in [-r,r]:out.append(part('feet',box((.45,.1,.48),(x,.05,z)),'dark'))
 if floral:
  for i,a in enumerate(np.linspace(.1,np.pi-.08,18 if LOD else 27)):
   pos=[1.4*np.cos(a),1.65+1.4*np.sin(a),.06]
   out+=move(blossom('petal' if i%6==0 else 'ivory'),pos,scale=1.1,rot=(.05*np.sin(i),.12*np.cos(i),i))
   if i%2==0:out+=move(leaf(),pos,scale=.65,rot=(0,0,a-np.pi/2))
  for side in [-1,1]:
   for i in range(4):out+=move(blossom(),(1.4*side,1.4-i*.3,.04),scale=.9,rot=(0,0,i))
 return combine(out)
def ribbon(loop=False):
 n=55 if LOD else 170;v=[];f=[]
 for i in range(n+1):
  t=i/n
  if loop:
   a=t*2*np.pi;center=np.array([1.0*np.cos(a),1.3+1.1*np.sin(a),.2*np.sin(2*a)]);vec=np.array([.26*np.cos(a),.26*np.sin(a),.12*np.cos(2*a)])
  else:
   a=t*3*np.pi;center=np.array([.65*np.sin(a),2.8*t,.28*np.cos(a)]);vec=np.array([.24*np.cos(a*.55),.03,.16*np.sin(a*.55)])
  v.extend([center-vec,center+vec])
 for i in range(n):a=2*i;f.extend([[a,a+1,a+3],[a,a+3,a+2]])
 return [part('ribbon',trimesh.Trimesh(v,f,process=True),'champagne')]
def podium():return [part('body',cyl(.65,.6,(0,.3,0)),'dark'),part('upper-rim',cyl(.68,.05,(0,.625,0)),'champagne'),part('lower-rim',cyl(.68,.04,(0,.02,0)))]
def podiums():
 return move(podium(),(-.85,0,0),scale=.65)+move(podium(),(.85,0,0),scale=.85)+move(podium(),(0,0,-.3),scale=1.15)
def stage():
 out=[]
 for i in range(3):
  r=1.95-i*.27;y=.12+i*.15;out.extend([part('stage',cyl(r,.17,(0,y,0)),'ivory'),part('gold-trims',ring(r,.018,y+.085),'champagne')])
 return combine(out)
def candle():
 return [part('wax',cyl(.13,.7,(0,.42,0)),'ivory'),part('base',cyl(.165,.06,(0,.04,0)),'gold'),part('wick',cyl(.008,.055,(0,.787,0)),'dark'),part('flame',sph((.039,.102,.028),(0,.89,0)), 'amber')]
def candles():
 return move(candle(),(-.27,0,0),scale=.7)+move(candle(),(.06,0,-.1),scale=1.2)+move(candle(),(.35,0,.15),scale=.9)
def lantern():
 out=[part('base',box((.56,.07,.56),(0,.04,0))),part('roof',lathe([(0,1.14),(.2,1.04),(.4,.91),(.36,.88)],n=4),'champagne')]
 for x in [-.235,.235]:
  for z in [-.235,.235]:out.append(part('posts',tube([[x,.04,z],[x,.92,z]],.025)))
 out+=move(candle(),(0,.08,0),scale=.84)
 out.append(part('handle',ring(.085,.017,1.2,'xy'),'gold'))
 return combine(out)
def chandelier():
 out=[part('frame',tube([[0,.65,0],[0,2.1,0]],.035)),part('frame',ring(.76,.03,1.08)),part('frame',ring(.4,.025,1.55))]
 for i in range(8):
  a=2*np.pi*i/8;x,z=np.cos(a),np.sin(a)
  out.append(part('frame',tube([[0,1.5,0],[.35*x,1.2,.35*z],[.76*x,1.08,.76*z]],.025)))
  out+=move(candle(),(.76*x,1.06,.76*z),scale=.28)
  out.append(part('crystals',sph((.055,.16,.055),(.68*x,.84,.68*z)), 'pearl'))
 for i in range(16):
  a=2*np.pi*i/16;x,z=np.cos(a),np.sin(a)
  out.append(part('chains',tube([[.4*x,1.55,.4*z],[.7*x,1.18,.7*z]],.009),'champagne'))
  out.append(part('crystals',sph((.035,.10,.035),(.4*x,1.44,.4*z)), 'pearl'))
 return combine(out)
def halo():
 out=[]
 for r,y in [(1.05,.7),(.8,.95),(.55,1.15)]:
  out.append(part('halo-rings',ring(r,.036,y),'champagne'))
  out.append(part('light-diffuser',ring(r,.016,y-.025),'ivory'))
  for a in np.linspace(0,2*np.pi,5)[:-1]:out.append(part('suspension',tube([[r*np.cos(a),y,r*np.sin(a)],[0,2.0,0]],.006)))
 return combine(out)
def cloche():
 p=[(0,.8),(.05,.77),(.25,.70),(.44,.51),(.53,.28),(.55,.14),(.58,.12),(.58,.08),(.05,.08)]
 return [part('dome',lathe(p),'champagne'),part('handle',sph((.055,.08,.055),(0,.86,0)),'gold'),part('tray',cyl(.64,.045,(0,.04,0)),'gold')]
def flute():
 p=[(0,0),(.18,0),(.2,.015),(.18,.04),(.03,.09),(.022,.52),(.095,.56),(.13,.69),(.145,1.02),(.13,1.02),(.11,.73),(.07,.60),(.025,.56)]
 return [part('flute',lathe(p),'champagne')]
def vase():
 p=[(0,0),(.22,0),(.25,.035),(.21,.14),(.15,.46),(.12,.73),(.19,.92),(.26,1.0),(.25,1.04),(.23,1.03),(.21,.98),(.15,.92)]
 return [part('vase',lathe(p),'champagne')]
def centerpiece():
 out=vase()
 for i in range(8):
  a=i*2*np.pi/8
  out+=move(blossom(),(.32*np.cos(a),1.05+.10*np.cos(a*2),.32*np.sin(a)),scale=.72,rot=(-np.pi/2+.4*np.sin(a),.4*np.cos(a),a))
 out+=move(blossom(),(0,1.3,0),scale=.85,rot=(-np.pi/2,0,0))
 return combine(out)
def invitation():
 return [part('envelope',box((.92,.018,.65),(0,.02,0)),'paper'),part('card',box((.78,.02,.52),(0,.048,-.02)),'dark'),part('gold-border',box((.79,.004,.53),(0,.038,-.02)),'gold'),part('seal',cyl(.09,.035,(0,.069,.04)),'gold'),part('seal-ring',ring(.06,.007,.09),'champagne')]
def chair():
 out=[part('cushion',box((.56,.10,.55),(0,.55,0)),'ivory'),part('back-cushion',box((.51,.58,.06),(0,.98,-.26)),'ivory')]
 for x in [-.25,.25]:
  for z in [-.23,.23]:out.append(part('legs',tube([[x,0,z],[x,.57,z]],.018),'gold'))
 for x in [-.28,.28]:out.append(part('back-frame',tube([[x,.55,-.26],[x,1.32,-.26]],.023),'gold'))
 out.append(part('back-frame',tube([[-.28,1.32,-.26],[0,1.39,-.26],[.28,1.32,-.26]],.023),'champagne'))
 return combine(out)
def table():
 return [part('top',cyl(.64,.05,(0,1.02,0)),'dark'),part('rim',ring(.65,.017,1.04),'champagne'),part('stem',cyl(.033,1,(0,.53,0))),part('base',cyl(.32,.05,(0,.035,0)),'dark')]
def dandiya():
 out=[]
 for j,a in enumerate([-.5,.5]):
  arr=[part('wood',cyl(.038,1.7,(0,.86,0)),'rose')]
  for y in np.linspace(.1,1.62,9):arr.append(part('bands',cyl(.042,.035,(0,y,0)),'gold'))
  for y in [0,1.72]:arr.append(part('finials',sph((.053,.053,.053),(0,y,0)),'champagne'))
  out+=move(arr,(-.42 if j==0 else .42,0,j*.1),rot=(0,0,a))
 return combine(out)
def dhol():
 out=[part('drum',lathe([(.36,0),(.40,.18),(.43,.48),(.40,.85),(.36,1.03)]),'rose'),part('skin',cyl(.355,.025,(0,1.03,0)),'ivory')]
 for y in [.025,1.02]:out.append(part('rims',ring(.375,.025,y),'champagne'))
 for i in range(12):
  a=i*2*np.pi/12;b=a+.27
  out.append(part('cords',tube([[.375*np.cos(a),.04,.375*np.sin(a)],[.435*np.cos(b),.51,.435*np.sin(b)],[.375*np.cos(a),1.0,.375*np.sin(a)]],.007),'ivory'))
 return combine(out)
def umbrella():
 out=[part('pole',cyl(.025,2.0,(0,1,0)),'gold')]
 n=24 if LOD else 64;v=[[0,2.03,0]];f=[]
 for rad,y in [(.38,1.94),(.72,1.72)]:
  for i in range(n):a=i*2*np.pi/n;v.append([rad*np.cos(a),y,rad*np.sin(a)])
 for i in range(n):
  j=(i+1)%n;f.append([0,1+i,1+j]);f.extend([[1+i,1+n+i,1+n+j],[1+i,1+n+j,1+j]])
 out.append(part('canopy',trimesh.Trimesh(v,f,process=True),'rose'))
 out.append(part('rim',ring(.72,.011,1.72),'champagne'))
 for a in np.linspace(0,2*np.pi,13)[:-1]:
  out.append(part('spokes',tube([[0,2.035,0],[.38*np.cos(a),1.945,.38*np.sin(a)],[.72*np.cos(a),1.725,.72*np.sin(a)]],.006),'champagne'))
  out.append(part('tassels',tube([[.72*np.cos(a),1.72,.72*np.sin(a)],[.72*np.cos(a),1.57,.72*np.sin(a)]],.006),'gold'))
  out.append(part('tassels',sph((.025,.044,.025),(.72*np.cos(a),1.53,.72*np.sin(a))),'champagne'))
 return combine(out)
def garland():
 out=[]
 for i in range(25 if not LOD else 15):
  t=i/(24 if not LOD else 14);p=[-1.5+3*t,1.0-.5*np.sin(np.pi*t),0]
  out+=move(blossom('gold'),p,scale=.34,rot=(0,0,i*.4))
  if i%2==0:out+=move(leaf(),(p[0],p[1]-.05,-.04),scale=.31,rot=(0,0,np.pi))
 return combine(out)
def crown():
 n=72 if not LOD else 36;v=[];f=[]
 for i in range(n):
  a=i*2*np.pi/n;h=.45+.32*(.5+.5*np.cos(6*a))
  v.extend([[.52*np.cos(a),.06,.52*np.sin(a)],[.59*np.cos(a),h,.59*np.sin(a)]])
 for i in range(n):a=2*i;b=2*((i+1)%n);f.extend([[a,b,b+1],[a,b+1,a+1]])
 out=[part('crown',trimesh.Trimesh(v,f,process=True),'champagne'),part('base',ring(.525,.03,.06),'gold')]
 for a in np.linspace(0,2*np.pi,7)[:-1]:out.append(part('tips',sph((.045,.045,.045),(.59*np.cos(a),.78,.59*np.sin(a))),'gold'))
 return combine(out)
def sparkle():
 v=[[0,.6,0],[.10,.10,0],[.48,0,0],[.10,-.10,0],[0,-.6,0],[-.10,-.1,0],[-.48,0,0],[-.1,.1,0],[0,0,.11],[0,0,-.11]];f=[]
 for i in range(8):f += [[8,i,(i+1)%8],[9,(i+1)%8,i]]
 return [part('star',transformed(trimesh.Trimesh(v,f,process=True),(0,.6,0)),'champagne')]
def rings_pair():
 out=[]
 for x,a in [(-.3,.4),(.3,-.4)]:out.append(part('ring-left' if x<0 else 'ring-right',transformed(ring(.48,.075,.58,'xy'),(x,0,0),rot=(.22,a,0)),'gold'))
 return out

def wedding():
 out=stage()+move(arch(floral=True),(0,.35,-.58),scale=.85)+move(chandelier(),(0,1.08,-.38),scale=.7)
 out+=move(candles(),(-1.25,.22,.75),scale=.85)+move(candles(),(1.25,.22,.75),scale=.85)
 out+=move(centerpiece(),(-1.62,.12,-.25),scale=.7)+move(centerpiece(),(1.62,.12,-.25),scale=.7)
 return combine(out)
def festive():
 out=arch()+move(garland(),(0,2.10,0),scale=.8)+move(umbrella(),(-1.9,0,.25),scale=.7)+move(umbrella(),(1.9,0,.25),scale=.7)
 out+=move(dhol(),(0,0,.4),scale=.65)+move(lantern(),(-.9,0,.45),scale=.55)+move(lantern(),(.9,0,.45),scale=.55)
 return combine(out)
def hospitality():
 out=table()+move(centerpiece(),(0,1.05,0),scale=.4)+move(chair(),(-1.15,0,0),rot=(0,-.55,0))+move(chair(),(1.15,0,0),rot=(0,.55,0))+move(halo(),(0,1.25,0),scale=.9)
 return combine(out)
def mandap():
 out=stage()
 for x in [-1.05,1.05]:
  for z in [-.8,.8]:
   out.append(part('columns',cyl(.065,2.5,(x,1.7,z)),'champagne'))
   for y in [.52,2.8]:out.append(part('capitals',cyl(.16,.12,(x,y,z)),'gold'))
   out+=move(blossom(),(x,2.80,z),scale=1.1)
 out.append(part('canopy-rim',tube([[-1.1,2.95,-.85],[1.1,2.95,-.85],[1.1,2.95,.85],[-1.1,2.95,.85],[-1.1,2.95,-.85]],.055),'gold'))
 out+=move(chandelier(),(0,1.35,0),scale=.67)
 return combine(out)
def drapery():
 n=32 if LOD else 80;rows=12;v=[];f=[]
 for j in range(rows+1):
  t=j/rows;y=3*(1-t)
  for i in range(n+1):
   s=i/n;x=-1.3+2.6*s;z=.1*np.sin(10*np.pi*s)+.4*np.sin(np.pi*t)*(s-.5)
   v.append([x*(1-.48*np.sin(np.pi*t)),y,z])
 for j in range(rows):
  for i in range(n):a=j*(n+1)+i;f.extend([[a,a+1,a+n+2],[a,a+n+2,a+n+1]])
 return [part('silk',trimesh.Trimesh(v,f,process=True),'ivory')]

BUILDERS={
 'pearl-blossom':blossom,'gold-blossom':lambda:blossom('gold'),'botanical-leaf':leaf,
 'portal-arch':arch,'portal-arch-triple':lambda:arch(triple=True),'floral-arch':lambda:arch(floral=True),
 'sculptural-ribbon':ribbon,'ribbon-loop':lambda:ribbon(True),'podium-single':podium,'podium-trio':podiums,
 'ceremony-stage':stage,'candle-single':candle,'candle-trio':candles,'heritage-lantern':lantern,
 'crystal-chandelier':chandelier,'suspended-halo':halo,'hospitality-cloche':cloche,'champagne-flute':flute,
 'fluted-vase':vase,'floral-centerpiece':centerpiece,'invitation-suite':invitation,'guest-chair':chair,
 'cocktail-table':table,'dandiya-pair':dandiya,'festive-dhol':dhol,'festive-umbrella':umbrella,
 'marigold-garland':garland,'celebration-crown':crown,'gold-sparkle':sparkle,
 'wedding-rings':rings_pair,'silk-drapery':drapery,'mandap-pavilion':mandap,
 'scene-wedding-portal':wedding,'scene-festive-entry':festive,'scene-hospitality':hospitality,
}

def scene_for(parts):
 s=trimesh.Scene()
 for i,(name,m,mat) in enumerate(combine(parts)):
  m=m.copy();m.visual=trimesh.visual.TextureVisuals(material=MATS[mat]);s.add_geometry(m,node_name=f'{name}-{i}',geom_name=f'{name}-{i}')
 return s

def render(parts,out,size=(680,680),transparent=True,scene=False):
 ren=vtk.vtkRenderer();ren.SetBackground(.040,.050,.044);ren.SetBackgroundAlpha(0 if transparent else 1)
 allv=[]
 for name,mesh,mat in combine(parts):
  pts=vtk.vtkPoints();pts.SetData(numpy_to_vtk(np.array(mesh.vertices,dtype=np.float32),deep=True))
  arr=np.c_[np.full(len(mesh.faces),3,dtype=np.int64),mesh.faces].ravel();ca=vtk.vtkCellArray();ca.SetCells(len(mesh.faces),numpy_to_vtkIdTypeArray(arr,deep=True))
  poly=vtk.vtkPolyData();poly.SetPoints(pts);poly.SetPolys(ca)
  normals=vtk.vtkPolyDataNormals();normals.SetInputData(poly);normals.SetFeatureAngle(55);normals.SplittingOff();normals.ConsistencyOn();normals.Update()
  mapper=vtk.vtkPolyDataMapper();mapper.SetInputConnection(normals.GetOutputPort());actor=vtk.vtkActor();actor.SetMapper(mapper)
  color,metal,rough=PALETTE[mat];p=actor.GetProperty();p.SetColor(*color[:3]);p.SetAmbient(.23);p.SetDiffuse(.72 if metal<.3 else .62);p.SetSpecular(.2+metal*.65);p.SetSpecularPower(18+70*(1-rough));p.SetInterpolationToPhong();ren.AddActor(actor);allv.append(mesh.vertices)
 v=np.concatenate(allv);lo=v.min(0);hi=v.max(0);center=(lo+hi)/2;extent=max(hi-lo)
 for pos,intensity,col in [((3,6,5),1.0,(1,.91,.74)),((-4,3,2),.7,(.86,.92,1)),((2,4,-5),.9,(1,.84,.53))]:
  light=vtk.vtkLight();light.SetLightTypeToSceneLight();light.SetPosition(*(center+np.array(pos)*extent));light.SetFocalPoint(*center);light.SetIntensity(intensity);light.SetColor(*col);ren.AddLight(light)
 cam=ren.GetActiveCamera();cam.SetViewUp(0,1,0);cam.SetFocalPoint(*center);cam.SetPosition(*(center+np.array([.55,.33,1.5])*extent));cam.ParallelProjectionOn();cam.SetParallelScale(max((hi[1]-lo[1])*.63,(hi[0]-lo[0])*.59,extent*.50))
 if size[0]>size[1]:cam.SetParallelScale(max((hi[1]-lo[1])*.66,extent*.42))
 win=vtk.vtkRenderWindow();win.SetOffScreenRendering(1);win.SetAlphaBitPlanes(1);win.SetMultiSamples(4);win.AddRenderer(ren);win.SetSize(*size);ren.ResetCameraClippingRange();win.Render()
 w=vtk.vtkWindowToImageFilter();w.SetInput(win);w.SetInputBufferTypeToRGBA();w.ReadFrontBufferOff();w.Update()
 writer=vtk.vtkPNGWriter();writer.SetFileName(str(out));writer.SetInputConnection(w.GetOutputPort());writer.Write();win.Finalize()

if __name__=='__main__':
 import sys
 mode=sys.argv[1] if len(sys.argv)>1 else 'all'
 names=list(BUILDERS)
 if mode=='all':
  for name,fn in BUILDERS.items():
   LOD=False;parts=combine(fn());sc=scene_for(parts)
   out=AS/'models'/f'{name}.glb';out.write_bytes(sc.export(file_type='glb',include_normals=True))
   row={'id':name,'title':name.replace('-',' ').title(),'path':str(out.relative_to(ROOT)),'triangles':sum(len(m.faces) for n,m,ma in parts),'nodes':len(parts),'bounds':sc.bounds.tolist(),'type':'model','units':'metres','upAxis':'+Y','front':'+Z','style':'original procedural stylized geometry','animated':False}
   render(parts,AS/'model-renders'/f'{name}.png')
   im=Image.open(AS/'model-renders'/f'{name}.png');im.thumbnail((320,320));im.save(AS/'model-thumbnails'/f'{name}.webp',quality=84)
   LOD=True;lo=scene_for(fn());mobile=AS/'models/mobile'/f'{name}.glb';mobile.write_bytes(lo.export(file_type='glb',include_normals=True));row['mobilePath']=str(mobile.relative_to(ROOT));row['mobileTriangles']=sum(len(g.faces) for g in lo.geometry.values());row['poster']=str((AS/'model-renders'/f'{name}.png').relative_to(ROOT));META.append(row)
   print(name,row['triangles'],row['mobileTriangles'],flush=True)
  (ROOT/'models-manifest.json').write_text(json.dumps(META,indent=2))
  LOD=False
  # Uncluttered, text-free 3D illustrations; not client event photography.
  for name,fn in [('wedding-portal',wedding),('festival-entry',festive),('hospitality',hospitality),('mandap',mandap),('sculptural-gold',lambda:move(ribbon(),(0,0,0))),('invitation',invitation)]:
   parts=fn();render(parts,AS/'backgrounds'/f'{name}-3d.png',size=(1600,1000),transparent=False)
   im=Image.open(AS/'backgrounds'/f'{name}-3d.png').convert('RGB');im.save(AS/'backgrounds'/f'{name}-3d.webp',quality=90)
  print('DONE',len(META),flush=True)
