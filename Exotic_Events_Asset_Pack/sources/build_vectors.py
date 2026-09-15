from pathlib import Path
import numpy as np, math, json, cv2, shutil, random
from PIL import Image, ImageDraw, ImageFilter
import cairosvg
ROOT=Path(__file__).resolve().parents[1];A=ROOT/'public/assets/exotic'
for p in ['logos','icons/gold','icons/current-color','ornaments','overlays','textures','favicons','tokens','animated-svg']:(A/p).mkdir(parents=True,exist_ok=True)
G='#D6B76B';I='#F1EBDD';D='#111711'
logo=Image.open(str(ROOT/'sources/logo-input.png')).convert('RGB')
logo.save(A/'logos/logo-original-reference.png')
arr=np.asarray(logo).astype(float);r,g,b=arr[...,0],arr[...,1],arr[...,2]
alpha=np.clip((r-b-7)/16,0,1)*np.clip((g-b-6)/14,0,1)
alpha[190:]=0
rgba=np.dstack([arr,alpha*255]).astype('uint8');im=Image.fromarray(rgba);bbox=im.getbbox();im=im.crop(bbox);im.save(A/'logos/logo-transparent-native.png')
emblem=Image.fromarray(rgba).crop((32,12,295,119));emblem.save(A/'logos/emblem-transparent-native.png')
for name,obj in [('logo',im),('emblem',emblem)]:
 for col,label in [((214,183,107),'champagne'),((255,255,255),'white'),((246,195,38),'gold')]:
  c=Image.new('RGBA',obj.size,col+(255,));c.putalpha(obj.getchannel('A'));c.save(A/'logos'/f'{name}-{label}.png')
 # Explicit approximate contour vector trace of the low-resolution screenshot.
 mask=(np.asarray(obj.getchannel('A'))>135).astype('uint8')*255
 contours,h=cv2.findContours(mask,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
 paths=[]
 for cnt in contours:
  if cv2.contourArea(cnt)<.4:continue
  pts=cv2.approxPolyDP(cnt,.28,True).reshape(-1,2)
  if len(pts)>2:paths.append('M '+' L '.join(f'{x},{y}' for x,y in pts)+' Z')
 w,h=obj.size
 s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="{G}"><title>Exotic {name} — approximate silhouette trace</title><path fill-rule="evenodd" d="'+ ' '.join(paths)+'"/></svg>'
 (A/'logos'/f'{name}-trace.svg').write_text(s)
 if name=='emblem':(ROOT/'sources/emblem-contours.json').write_text(json.dumps({'w':w,'h':h,'paths':[cv2.approxPolyDP(c,.28,True).reshape(-1,2).tolist() for c in contours if cv2.contourArea(c)>.4]}))
for size in [32,48,96,180,192,512]:
 c=Image.new('RGBA',(size,size),(17,23,17,255));e=emblem.copy();e.thumbnail((int(size*.87),int(size*.87)));e=e.resize((int(size*.87),int(size*.87*emblem.height/emblem.width)),Image.Resampling.LANCZOS);c.alpha_composite(e,((size-e.width)//2,(size-e.height)//2));c.save(A/'favicons'/f'exotic-{size}.png')

ICON={
'arrow-right':'<path d="M4 12h15m-6-6 6 6-6 6"/>',
'arrow-up-right':'<path d="M6 18 18 6M6 6h12v12"/>',
'arrow-left':'<path d="M20 12H5m6-6-6 6 6 6"/>',
'chevron-down':'<path d="m5 9 7 7 7-7"/>',
'chevron-right':'<path d="m9 5 7 7-7 7"/>',
'plus':'<path d="M12 5v14M5 12h14"/>',
'minus':'<path d="M5 12h14"/>',
'menu':'<path d="M4 6h16M4 12h16M4 18h16"/>',
'close':'<path d="m6 6 12 12M18 6 6 18"/>',
'play':'<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>',
'pause':'<circle cx="12" cy="12" r="9"/><path d="M9 8v8m6-8v8"/>',
'check':'<path d="m4 12 5 5L20 6"/>',
'calendar':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18M7 14h1m4 0h1m4 0h1M7 17h1m4 0h1"/>',
'location':'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
'email':'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
'phone':'<path d="m7 3 3 5-3 2c2 4 3 5 7 7l2-3 5 3c-1 4-4 5-7 3C7 17 3 12 3 7c0-2 2-4 4-4Z"/>',
'globe':'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/>',
'plane':'<path d="m3 11 8-2 4-6h2l-2 7 6 3v2l-7-1-3 6H9l1-7-7 1Z"/>',
'guests':'<circle cx="12" cy="7" r="3"/><path d="M6 21v-4a6 6 0 0 1 12 0v4ZM5 4a3 3 0 0 0 0 6m14-6a3 3 0 0 1 0 6M2 20v-4a4 4 0 0 1 3-4m17 8v-4a4 4 0 0 0-3-4"/>',
'wedding-rings':'<circle cx="8" cy="14" r="6"/><circle cx="16" cy="14" r="6"/><path d="m5 6 3-3 3 3-3 2-3-2m8 0 3-3 3 3-3 2-3-2"/>',
'navratri':'<path d="m4 3 16 18M20 3 4 21M7 5l-2 2m5 2-2 2m5 2-2 2m5 2-2 2M17 5l2 2m-5 2 2 2M8 17l2 2"/>',
'corporate':'<path d="M4 21V4h10v17m0-13h6v13M2 21h20M7 7h1m3 0h1M7 11h1m3 0h1M7 15h1m3 0h1m6-3h1m-1 4h1M8 21v-3h3v3"/>',
'hospitality':'<path d="M3 17a9 9 0 0 1 18 0M2 20h20M12 5V3m-2 0h4M3 17h18"/>',
'mandap':'<path d="M3 21h18M5 19V8m14 11V8M3 8h18L12 2 3 8ZM8 8v3m8-3v3M8 19h8"/>',
'floral-decor':'<path d="M12 21V11m0 6c-5 0-7-2-7-5 4 0 6 2 7 5Zm0-3c5 0 7-2 7-5-4 0-6 2-7 5Z"/><circle cx="12" cy="7" r="2"/><path d="M12 5c-5-5-8 1-4 3-4 4 2 7 4 2 2 5 8 2 4-2 4-2 1-8-4-3Z"/>',
'crown':'<path d="M4 17 2 6l6 5 4-8 4 8 6-5-2 11H4Zm0 4h16"/>',
'leaf':'<path d="M4 20C1 9 9 3 21 3c1 12-6 20-17 17ZM4 20 17 7m-8 8V9m4 2h5"/>',
'star':'<path d="m12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1Z"/>',
'sparkle':'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
'heart':'<path d="M12 21 3 12C-2 5 7-1 12 6c5-7 14-1 9 6Z"/>',
'camera':'<path d="M8 5 10 2h4l2 3h5v16H3V5Z"/><circle cx="12" cy="13" r="4"/>',
'music':'<path d="M9 18V5l12-3v13M9 9l12-3"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="18" cy="15" rx="3" ry="2.5"/>',
'lightbulb':'<path d="M8 17C-1 7 7-1 13 3c7 1 8 9 3 14H8Zm1 3h6m-5 3h4"/>',
'palette':'<path d="M12 3C1 3 0 20 11 21c3 0 5-2 3-5s4-3 6-4c4-3-1-9-8-9Z"/><circle cx="7" cy="9" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="17" cy="9" r="1"/>',
'process':'<circle cx="4" cy="5" r="2"/><circle cx="20" cy="19" r="2"/><path d="M6 5h9a5 5 0 0 1 0 10H9a2 2 0 0 0 0 4h9"/>',
'quote':'<path d="M3 13V9a5 5 0 0 1 5-5M3 13h6v7H3Zm12 0V9a5 5 0 0 1 5-5m-5 9h6v7h-6Z"/>',
'shield':'<path d="m12 2 9 4v7c0 5-9 9-9 9s-9-4-9-9V6Zm-5 10 3 3 7-7"/>',
'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
'gift':'<rect x="3" y="10" width="18" height="4"/><path d="M5 14v7h14v-7M12 10v11m0-11C-1 10 5-2 12 10Zm0 0C25 10 19-2 12 10Z"/>',
'balloons':'<ellipse cx="8" cy="8" rx="5" ry="6"/><ellipse cx="17" cy="10" rx="4" ry="5"/><path d="M8 14c5 3-4 5 1 8m8-7c-4 2 1 4-2 7"/>',
'lantern':'<path d="M7 8h10l2 4-2 8H7l-2-8 2-4ZM5 21h14M6 7l6-4 6 4M12 3V1m0 10v6m-2 0h4"/>',
'chair':'<path d="M5 14V3h14v11M4 14h16v4H4Zm2 4v4m12-4v4M8 6h8m-8 4h8"/>',
'table':'<ellipse cx="12" cy="6" rx="10" ry="3"/><path d="M12 9v12m-5 0h10"/>',
'curtain':'<path d="M2 3h20M3 4v17h7L6 12c5-3 6-7 6-9 0 2 1 6 6 9l-4 9h7V4M3 12h4m10 0h4"/>',
'pin':'<path d="m9 2 6 0-1 6 5 5v2H5v-2l5-5-1-6ZM12 15v7"/>',
'search':'<circle cx="10" cy="10" r="7"/><path d="m15 15 7 7"/>',
'filter':'<path d="M3 4h18l-7 8v7l-4 2v-9Z"/>',
'download':'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
'scroll':'<rect x="7" y="2" width="10" height="17" rx="5"/><path d="M12 5v4m-3 12 3 2 3-2"/>',
'volume-off':'<path d="M3 9h4l5-5v16l-5-5H3Zm13-1 6 8m0-8-6 8"/>',
'accessibility':'<circle cx="12" cy="4" r="2"/><path d="M3 8h18M12 8v7m-5 7 5-7 5 7"/>',
'globe-route':'<circle cx="11" cy="12" r="9"/><path d="M2 12h18M11 3c-5 6-5 12 0 18 2-3 3-6 3-9M16 4l6 1-3 5m3-5-9 6"/>',
}
for name,body in ICON.items():
 for color,folder in [(G,'gold'),('currentColor','current-color')]:
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><title>{name.replace("-"," ").title()}</title>{body}</svg>'
  (A/'icons'/folder/f'{name}.svg').write_text(svg)

# Custom editorial ornaments, with a common metallic gradient.
def wrap(body,w=1200,h=400):
 return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="none"><defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#826020"/><stop offset=".35" stop-color="#F4DE9D"/><stop offset=".65" stop-color="#BD9447"/><stop offset="1" stop-color="#F2D896"/></linearGradient><radialGradient id="light"><stop stop-color="#F8D788" stop-opacity=".8"/><stop offset="1" stop-color="#F8D788" stop-opacity="0"/></radialGradient></defs>{body}</svg>'''
orn={}
orn['divider-diamond']=wrap('<path d="M40 200h510m100 0h510m-560-27 27 27-27 27-27-27Z" stroke="url(#gold)" stroke-width="2"/>',1200,400)
orn['divider-botanical']=wrap('<path d="M80 210h420m200 0h420M500 210q100-90 200 0M525 195q-10-60 40-40-3 45-40 40m42-28q20-70 47-24-10 43-47 24m40-8q55-55 65-4-32 32-65 4" stroke="url(#gold)" stroke-width="2"/>')
orn['divider-constellation']=wrap('<path d="M100 210 360 170 600 220 840 170 1100 210" stroke="url(#gold)"/><g fill="#D6B76B">'+''.join(f'<circle cx="{x}" cy="{y}" r="4"/>' for x,y in [(100,210),(360,170),(600,220),(840,170),(1100,210)])+'</g>')
orn['triple-arch']=wrap('<g stroke="url(#gold)" stroke-width="2">'+''.join(f'<path d="M{x} 1000V450a{500-x} {500-x} 0 0 1 {1000-2*x} 0v550"/>' for x in [100,120,140])+'</g>',1000,1100)
orn['circle-halo']=wrap('<g stroke="url(#gold)"><ellipse cx="600" cy="200" rx="510" ry="130"/><ellipse cx="600" cy="200" rx="490" ry="110"/><ellipse cx="600" cy="200" rx="530" ry="150" opacity=".35"/></g>')
orn['gold-ribbon-wide']=wrap('<path d="M-80 340C160-110 480 520 760 140S1040-90 1300 260L1300 310C980-35 970 85 760 175S250-35-80 390Z" fill="url(#gold)"/>')
orn['gold-ribbon-tall']=wrap('<path d="M370-60C-70 200 650 360 270 590S650 800 150 1200L205 1220C700 800 120 810 310 620S50 200 420-40Z" fill="url(#gold)"/>',600,1200)
orn['corner-filigree']=wrap('<g stroke="url(#gold)" stroke-width="2"><path d="M60 600V60h540M90 500V90h410M60 270C300 260 240 110 145 170c-65 70 75 95 55 35M270 60C260 300 110 240 170 145c70-65 95 75 35 55"/><path d="m60 60 20 20-20 20-20-20Z"/></g>',600,600)
orn['frame-editorial']=wrap('<path d="M30 100V30h80m580 0h80v70M30 900v70h80m580 0h80v-70" stroke="url(#gold)" stroke-width="2"/>',800,1000)
orn['seal-outline']=wrap('<circle cx="300" cy="300" r="210" stroke="url(#gold)" stroke-width="2"/><circle cx="300" cy="300" r="190" stroke="url(#gold)" stroke-dasharray="1 10" stroke-width="3"/><path d="m300 180 30 90 90 30-90 30-30 90-30-90-90-30 90-30Z" stroke="url(#gold)"/>',600,600)
orn['petal-rosette']=wrap('<g stroke="url(#gold)" stroke-width="2">'+''.join(f'<ellipse cx="300" cy="220" rx="45" ry="100" transform="rotate({i*45} 300 300)"/>' for i in range(8))+'</g>',600,600)
orn['mandala-navratri']=wrap('<g stroke="url(#gold)" stroke-width="1.7">'+''.join(f'<path d="M400 80Q550 230 400 400Q250 230 400 80Z" transform="rotate({i*30} 400 400)"/>' for i in range(12))+'<circle cx="400" cy="400" r="75"/><circle cx="400" cy="400" r="330" stroke-dasharray="1 12"/></g>',800,800)
orn['hanging-lights']=wrap('<path d="M-20 20Q600 340 1220 20" stroke="url(#gold)" stroke-width="3"/>'+''.join(f'<g><path d="M{x} {20+300*(1-((x-600)/620)**2)/2:.1f}v26" stroke="#D6B76B"/><circle cx="{x}" cy="{46+300*(1-((x-600)/620)**2)/2:.1f}" r="12" fill="#F9D57E"/></g>' for x in range(40,1200,95)))
orn['progress-journey']=wrap('<path d="M80 220C350 20 700 400 1120 170" stroke="url(#gold)" stroke-width="2"/><g fill="#D6B76B">'+''.join(f'<circle cx="{x}" cy="{y}" r="8"/>' for x,y in [(80,220),(320,148),(570,220),(830,248),(1120,170)])+'</g>')
orn['laurel-left']=wrap('<g stroke="url(#gold)" stroke-width="2"><path d="M360 690Q30 400 300 60"/>'+''.join(f'<path d="M{205+abs(i-4)*8} {100+i*60}q-110-60-85-110 95 15 85 110q120-50 125-90-100-15-125 90"/>' for i in range(8))+'</g>',500,760)
orn['champagne-arc']=wrap('<path d="M-10 380C420-130 790-70 1210 380" stroke="url(#gold)" stroke-width="8"/><path d="M-10 390C420-120 790-60 1210 390" stroke="url(#gold)" stroke-width="1" opacity=".45"/>')
for name,svg in orn.items():
 (A/'ornaments'/f'{name}.svg').write_text(svg)
 cairosvg.svg2png(bytestring=svg.encode(),write_to=str(A/'ornaments'/f'{name}.png'),output_width=1000)

# Transparent overlays, designed as isolated layers (not flattened UI screenshots).
rng=np.random.default_rng(19)
for name,kind in [('gold-bokeh','bokeh'),('warm-light-bloom','light'),('gold-dust','dust'),('blush-petals','petals'),('champagne-confetti','confetti'),('ivory-petals','ivory'),('soft-vignette','vignette'),('hero-left-shade','shade')]:
 w,h=1600,1000;y,x=np.mgrid[0:h,0:w];arr=np.zeros((h,w,4),np.float32)
 if kind=='bokeh':
  for i in range(35):
   cx,cy=rng.uniform(0,w),rng.uniform(0,h);rad=rng.uniform(9,80);op=rng.uniform(.08,.4);aa=np.exp(-((x-cx)**2+(y-cy)**2)/(2*rad**2))*op;arr[...,3]=np.maximum(arr[...,3],aa)
  arr[...,:3]=[242,199,103]
 elif kind=='light':
  aa=np.exp(-(((x-w*.78)/(w*.28))**2+((y-h*.16)/(h*.27))**2)*2)*.75;arr[...,:3]=[255,215,137];arr[...,3]=aa
 elif kind in ['vignette','shade']:
  arr[...,:3]=[9,13,10];arr[...,3]=np.clip((np.sqrt(((x-w/2)/(w/2))**2+((y-h/2)/(h/2))**2)-.25)*.85,0,.8) if kind=='vignette' else np.clip(.95-x/w,0,.85)
 else:
  overlay=Image.new('RGBA',(w,h));dr=ImageDraw.Draw(overlay)
  count=250 if kind=='dust' else 34 if kind in ['petals','ivory'] else 70
  for _ in range(count):
   px=int(rng.uniform(0,w));py=int(rng.uniform(0,h));r=int(rng.uniform(1,3) if kind=='dust' else rng.uniform(5,17));color=(238,199,109,int(rng.uniform(80,210)))
   if kind in ['petals','ivory']:color=(240,183,181,190) if kind=='petals' else (246,238,220,195);dr.ellipse((px-r,py-r/2,px+r,py+r/2),fill=color)
   elif kind=='dust':dr.ellipse((px-r,py-r,px+r,py+r),fill=color)
   else:dr.polygon([(px-r,py),(px,py-r/2),(px+r,py+r),(px,py+r*1.4)],fill=color)
  overlay.save(A/'overlays'/f'{name}.png');continue
 arr[...,3]*=255;Image.fromarray(arr.astype('uint8')).save(A/'overlays'/f'{name}.png')

# Map-ready procedural textures, deliberately modest texture resolutions.
w=h=1024;y,x=np.mgrid[0:h,0:w];rng=np.random.default_rng(72);noise=rng.normal(0,1,(h,w))
for name,base,typ in [('charcoal-grain',[20,26,21],'noise'),('ivory-paper',[233,226,210],'noise'),('gold-brushed',[182,146,68],'brush'),('sage-linen',[94,111,86],'linen'),('black-marble',[20,24,21],'marble'),('champagne-silk',[179,145,83],'silk'),('rose-velvet',[95,31,46],'silk'),('champagne-gradient',[196,163,96],'gradient')]:
 if typ=='noise':v=noise*2.1
 elif typ=='brush':v=noise*1.5+np.sin(y*.7)*2+np.sin(x/90)*7
 elif typ=='linen':v=noise+np.sin(x*1.8)*2+np.sin(y*1.8)*2
 elif typ=='marble':v=np.clip(4-np.abs(np.sin(x*.009+np.sin(y*.012)*1.5+np.sin((x+y)*.002)))*100,0,4)*12+noise
 elif typ=='silk':v=np.sin(x*.011+y*.003+np.sin(y*.004)) * 18+noise
 else:v=(np.sin((x+y)/380)*.5+.5)*25-10
 img=np.clip(np.array(base)[None,None,:]+v[...,None],0,255).astype('uint8');im=Image.fromarray(img);im.save(A/'textures'/f'{name}.png');im.save(A/'textures'/f'{name}.webp',quality=88)
# scalar PBR roughness maps and neutral normal map, explicitly data not sRGB.
Image.fromarray(np.full((256,256),72,dtype=np.uint8)).save(A/'textures/gold-roughness.png')
Image.fromarray(np.full((256,256),195,dtype=np.uint8)).save(A/'textures/fabric-roughness.png')
normal=np.empty((256,256,3),np.uint8);normal[:]=[128,128,255];Image.fromarray(normal).save(A/'textures/flat-normal.png')
TOKENS={'colors':{'background':'#0B100D','surface':'#151D17','gold':'#D6B76B','goldBright':'#EED69A','ivory':'#F1EBDD','muted':'#A3AA9F','rose':'#9B5C65','sage':'#667B5B'},'spacing':{'desktopSection':'clamp(88px, 8vw, 144px)','mobileSection':'64px','contentMax':'1360px','pageGutter':'clamp(20px,4vw,72px)'},'motion':{'fastMs':180,'standardMs':320,'revealMs':700,'staggerMs':75,'easing':[.22,1,.36,1]},'radii':{'card':'18px','button':'999px'}}
(A/'tokens/design-tokens.json').write_text(json.dumps(TOKENS,indent=2))
(A/'tokens/exotic-tokens.css').write_text(':root{\n'+''.join(f'  --exotic-{k}: {v};\n' for k,v in TOKENS['colors'].items())+'  --exotic-content:1360px;\n  --exotic-section:clamp(88px,8vw,144px);\n  --exotic-gutter:clamp(20px,4vw,72px);\n  --exotic-ease:cubic-bezier(.22,1,.36,1);\n}\n@media(prefers-reduced-motion:reduce){[data-exotic-animated]{animation:none!important;transition:none!important}}\n')
(ROOT/'vectors-manifest.json').write_text(json.dumps({'icons':list(ICON),'ornaments':list(orn),'notes':'Icons are custom stroke geometry. current-color variants are intended to be inlined or used with CSS masks. Approximate logo trace is NOT an exact original vector.'},indent=2))
print('DONE',len(ICON),'icons x2;',len(orn),'ornaments x2')
