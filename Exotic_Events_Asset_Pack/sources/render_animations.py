from pathlib import Path
import json,html,math
import cairosvg
ROOT=Path(__file__).resolve().parents[1];A=ROOT/'public/assets/exotic'

def val(p,frame=90):
 if not p.get('a'):return p['k']
 keys=p['k'];last=keys[0]['s']
 for i,k in enumerate(keys):
  if frame>=k['t']:last=k['s']
  if i<len(keys)-1 and k['t']<=frame<keys[i+1]['t']:
   end=k.get('e',keys[i+1]['s']);u=(frame-k['t'])/max(keys[i+1]['t']-k['t'],1e-5);u=u*u*(3-2*u);last=[a+(b-a)*u for a,b in zip(k['s'],end)];break
 return last

def scalar(x):return x[0] if isinstance(x,list) else x

def pathdata(p):
 v=p['v'];ii=p['i'];oo=p['o'];d=f'M{v[0][0]:.3f},{v[0][1]:.3f}'
 for k in range(1,len(v)):
  a,b=v[k-1],v[k];cp=[a[0]+oo[k-1][0],a[1]+oo[k-1][1],b[0]+ii[k][0],b[1]+ii[k][1]]
  d+=f' C{cp[0]:.3f},{cp[1]:.3f} {cp[2]:.3f},{cp[3]:.3f} {b[0]:.3f},{b[1]:.3f}'
 if p['c']:d+=' Z'
 return d

def animtag(p,attr,typ='',factor=1,duration=4,loop=True):
 if not p.get('a'):return ''
 keys=p['k'];times=[k['t']/120 for k in keys];values=[]
 for k in keys:
  vals=k['s'];vals=vals[:2] if typ in ['translate','scale'] else vals;vals=[v*factor for v in vals];values.append(' '.join(f'{v:.6g}' for v in vals) if attr=='transform' else f'{vals[0]:.6g}')
 if times[0]>0:times.insert(0,0);values.insert(0,values[0])
 if times[-1]<1:times.append(1);values.append(values[-1])
 tag='animateTransform' if attr=='transform' else 'animate';extra=f' type="{typ}"' if typ else ''
 return f'<{tag} attributeName="{attr}"{extra} dur="{duration}s" values="'+ ';'.join(values)+'" keyTimes="'+';'.join(str(t) for t in times)+f'" repeatCount="{"indefinite" if loop else "1"}" fill="freeze" calcMode="linear"/>'

def color(p):return '#'+''.join(f'{max(0,min(255,round(x*255))):02x}' for x in val(p)[:3])

def body(doc,frame=90,animated=False):
 out=[];loop=doc['meta']['loopRecommended']
 for layer in reversed(doc['layers']):
  group=layer['shapes'][0]['it'];fill=next((x for x in group if x['ty']=='fl'),None);stroke=next((x for x in group if x['ty']=='st'),None);trim=next((x for x in group if x['ty']=='tm'),None)
  paint=f'fill="{color(fill["c"]) if fill else "none"}" fill-rule="evenodd"'
  if stroke:paint+=f' stroke="{color(stroke["c"])}" stroke-width="{scalar(val(stroke["w"]))}" stroke-linecap="round" stroke-linejoin="round"'
  geom=[];paths=[]
  for s in group:
   ty=s['ty']
   if ty=='sh':paths.append(pathdata(val(s['ks'])))
   elif ty in ['el','rc']:
    p=val(s['p']);sz=val(s['s'])
    if ty=='el':geom.append(f'<ellipse cx="{p[0]}" cy="{p[1]}" rx="{sz[0]/2}" ry="{sz[1]/2}" {paint}/>')
    else:geom.append(f'<rect x="{p[0]-sz[0]/2}" y="{p[1]-sz[1]/2}" width="{sz[0]}" height="{sz[1]}" rx="{scalar(val(s["r"]))}" {paint}/>')
  if paths:
   attrs='';tag=''
   if trim:
    frac=scalar(val(trim['e'],frame))/100;attrs=f' pathLength="100" stroke-dasharray="100" stroke-dashoffset="{100-frac*100}"'
    if animated and trim['e'].get('a'):
     k=trim['e']['k'];vals=[100-scalar(x['s']) for x in k];times=[x['t']/120 for x in k]
     tag='<animate attributeName="stroke-dashoffset" dur="4s" values="'+';'.join(map(str,vals))+'" keyTimes="'+';'.join(map(str,times))+f'" repeatCount="{"indefinite" if loop else "1"}" fill="freeze"/>'
   geom.insert(0,f'<path d="{" ".join(paths)}" {paint}{attrs}>{tag}</path>')
  ks=layer['ks'];p=val(ks['p'],frame);sc=val(ks['s'],frame);r=scalar(val(ks['r'],frame));op=scalar(val(ks['o'],frame))/100
  chain=[('opacity',f'opacity="{op}"',animtag(ks['o'],'opacity',factor=.01,loop=loop) if animated else ''),('position',f'transform="translate({p[0]} {p[1]})"',animtag(ks['p'],'transform','translate',loop=loop) if animated else ''),('rotation',f'transform="rotate({r})"',animtag(ks['r'],'transform','rotate',loop=loop) if animated else ''),('scale',f'transform="scale({sc[0]/100} {sc[1]/100})"',animtag(ks['s'],'transform','scale',factor=.01,loop=loop) if animated else '')]
  text=''.join(geom)
  for _,attrs,tags in reversed(chain):text=f'<g {attrs}>{tags}{text}</g>'
  out.append(text)
 return ''.join(out)
for file in (A/'lottie').glob('*.json'):
 doc=json.loads(file.read_text());static=body(doc);dyn=body(doc,0,True)
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>{html.escape(doc["nm"])}</title>{static}</svg>'
 (A/'lottie-posters'/f'{file.stem}.svg').write_text(svg);cairosvg.svg2png(bytestring=svg.encode(),write_to=str(A/'lottie-posters'/f'{file.stem}.png'),output_width=512,output_height=512)
 animated=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>{html.escape(doc["nm"])}</title><style>.reduced{{display:none}}@media(prefers-reduced-motion:reduce){{.animated{{display:none}}.reduced{{display:inline}}}}</style><g class="animated">{dyn}</g><g class="reduced">{static}</g></svg>'
 (A/'animated-svg'/f'{file.stem}.svg').write_text(animated)
print('Rendered 14 Lottie posters and 14 standalone animated SVG alternatives')
