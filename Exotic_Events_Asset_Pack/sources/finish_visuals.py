from pathlib import Path
import numpy as np,cv2,json,math,io
from PIL import Image,ImageDraw,ImageFont,ImageFilter
ROOT=Path(__file__).resolve().parents[1];A=ROOT/'public/assets/exotic'
# Original high dynamic range softbox environment. It is not venue photography.
y,x=np.mgrid[0:256,0:512];hdr=np.zeros((256,512,3),np.float32)+.055
for cx,cy,sx,sy,power,col in [(120,70,24,42,9,[1,.84,.59]),(370,90,32,48,7,[.75,.86,1]),(260,25,110,12,4,[1,.96,.85])]:
 g=np.exp(-.5*(((x-cx)/sx)**2+((y-cy)/sy)**2))*power
 hdr+=g[...,None]*np.array(col,dtype=np.float32)
cv2.imwrite(str(A/'textures/studio-softbox.hdr'),hdr[:,:,::-1])
tone=hdr/(hdr+1);Image.fromarray((tone**(1/2.2)*255).astype('uint8')).save(A/'textures/studio-softbox-preview.png')
# Foreground compositions from the actual original model renders.
flower=Image.open(A/'model-renders/pearl-blossom.png');leaf=Image.open(A/'model-renders/botanical-leaf.png')
for mirror,name in [(False,'floral-corner-left'),(True,'floral-corner-right')]:
 out=Image.new('RGBA',(1000,1100))
 for x,y,s,rot in [(-90,620,460,-70),(-160,420,500,-40),(120,780,450,-125),(260,870,380,-145),(-100,780,420,-15)]:
  im=leaf.copy();im.thumbnail((s,s));im=im.rotate(rot,resample=Image.Resampling.BICUBIC,expand=True);out.alpha_composite(im,(x,y))
 for x,y,s,rot in [(-60,660,440,0),(80,850,370,35),(-120,450,340,-15),(290,880,300,70),(20,980,340,-15)]:
  im=flower.copy();im.thumbnail((s,s));im=im.rotate(rot,resample=Image.Resampling.BICUBIC,expand=True);out.alpha_composite(im,(x,y))
 if mirror:out=out.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
 out.save(A/'overlays'/f'{name}.png')
# Selected GIF motion previews. The JSON and animated SVG sources remain separate.
import sys;sys.path.insert(0,str(ROOT/'sources'));import render_animations as ra
import cairosvg
for name in ['exotic-emblem-orbit','petal-bloom','navratri-rhythm','booking-success']:
 doc=json.loads((A/'lottie'/f'{name}.json').read_text());frames=[]
 for t in range(0,120,4):
  svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#0B100D"/>'+ra.body(doc,t)+'</svg>'
  frame=Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode(),output_width=300,output_height=300))).convert('RGB');frames.append(frame)
 frames[0].save(ROOT/'previews'/f'{name}.gif',save_all=True,append_images=frames[1:],duration=133,loop=0 if doc['meta']['loopRecommended'] else 1)
# Contact sheets use installed fonts ONLY to rasterize text. No font file is included.
font_dir=Path('/usr/share/fonts/truetype/dejavu')
f=lambda n:ImageFont.truetype(str(font_dir/'DejaVuSans.ttf'),n)
serif=lambda n:ImageFont.truetype(str(font_dir/'DejaVuSerif.ttf'),n)
models=json.loads((ROOT/'models-manifest.json').read_text());cols=5;cw=278;ch=322;pad=38;rows=math.ceil(len(models)/cols)
board=Image.new('RGB',(cols*cw+pad*2,rows*ch+215+pad),(11,16,13));d=ImageDraw.Draw(board)
d.text((pad,30),'EXOTIC / ORIGINAL 3D COLLECTION',font=f(18),fill='#D6B76B');d.text((pad,65),'35 models. Real geometry.',font=serif(44),fill='#F1EBDD');d.text((pad,132),'Full + mobile GLB variants • Separate transparent PNG renders • Four animated GLB variants',font=f(18),fill='#A7AEA1');d.text((pad,165),'Stylized, procedural designs — not the original editable sources behind the earlier image collage.',font=f(16),fill='#A7AEA1')
for i,m in enumerate(models):
 x=pad+(i%cols)*cw;y=210+(i//cols)*ch
 d.rounded_rectangle((x,y,x+cw-14,y+ch-14),radius=15,fill='#172019',outline='#303c2d')
 im=Image.open(ROOT/m['poster']);im.thumbnail((250,232));board.paste(im,(x+int((cw-14-im.width)/2),y+8),im)
 title=m['title'];d.text((x+14,y+247),title,font=f(16),fill='#F1EBDD');d.text((x+14,y+274),f"{m['triangles']:,} / {m['mobileTriangles']:,} triangles",font=f(12),fill='#ABB1A4')
board.save(ROOT/'previews/3d-models-contact-sheet.jpg',quality=92)
# Smaller overview sheet for the package.
board=Image.new('RGB',(1440,1320),(11,16,13));d=ImageDraw.Draw(board)
d.text((48,42),'EXOTIC / WEBSITE ASSET LIBRARY',font=f(18),fill='#D6B76B');d.text((48,83),'Choose the detail. Create the feeling.',font=serif(42),fill='#F1EBDD');d.text((48,150),'A usable source pack — models, icons, animation, texture, foreground layers and implementation guidance.',font=f(16),fill='#A7AEA1')
featured=['scene-wedding-portal','scene-festive-entry','scene-hospitality','sculptural-ribbon']
for i,name in enumerate(featured):
 x=48+i*340;y=205;d.rounded_rectangle((x,y,x+320,y+330),radius=15,fill='#172019')
 im=Image.open(A/'model-renders'/f'{name}.png');im.thumbnail((310,275));board.paste(im,(x+(320-im.width)//2,y+10),im);d.text((x+15,y+292),name.replace('-',' ').title(),font=f(16),fill='#F1EBDD')
d.text((48,575),'CUSTOM VECTOR ICONS',font=f(17),fill='#D6B76B')
for i,name in enumerate(['wedding-rings','navratri','hospitality','corporate','mandap','guests','floral-decor','crown','globe','calendar','location','phone']):
 im=Image.open(io.BytesIO(cairosvg.svg2png(url=str(A/'icons/gold'/f'{name}.svg'),output_width=60,output_height=60)));x=52+i*111;board.paste(im,(x,620),im)
d.text((48,724),'CUSTOM LOADERS + MICRO-ANIMATION',font=f(17),fill='#D6B76B')
for i,name in enumerate(['exotic-emblem-orbit','petal-bloom','invitation-open','navratri-rhythm','chandelier-glow','booking-success']):
 x=48+i*226;y=770;d.rounded_rectangle((x,y,x+210,y+230),radius=14,fill='#172019');im=Image.open(A/'lottie-posters'/f'{name}.png');im.thumbnail((195,175));board.paste(im,(x+8,y+5),im);d.text((x+12,y+191),name.replace('-',' ').title()[:23],font=f(13),fill='#F1EBDD')
d.text((48,1050),'35 MODEL DESIGNS  /  52 ICON DESIGNS  /  14 LOTTIE ANIMATIONS',font=f(19),fill='#D6B76B');d.text((48,1100),'Also included: lighter model variants, embedded animation clips, ornaments, PNG layers,',font=f(19),fill='#F1EBDD');d.text((48,1132),'textures, HDR environment, logo derivatives, favicons, design tokens and a multipage build prompt.',font=f(19),fill='#F1EBDD');d.text((48,1220),'START_HERE.html  →  Browse  →  Select  →  Copy public/assets/exotic into your project',font=f(20),fill='#D6B76B')
board.save(ROOT/'previews/asset-pack-overview.jpg',quality=93)
print('Environment, PNG foregrounds, animation GIF previews and contact sheets created.')
