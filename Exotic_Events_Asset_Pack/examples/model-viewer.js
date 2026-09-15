/* Original, dependency-free GLB geometry inspector for this asset pack.
   Supports its embedded positions, normals, indices and base-color materials.
   This is NOT a full glTF renderer: PBR reflections and animation playback belong
   in your production Three.js / React Three Fiber implementation. */
const canvas=document.querySelector('canvas');
const gl=canvas.getContext('webgl2',{alpha:false,antialias:true});
const status=document.querySelector('#status');
const $=s=>document.querySelector(s);
let primitives=[],yaw=.35,pitch=.14,zoom=1,drag=null,center=[0,1,0],extent=3;
const program=gl?gl.createProgram():null;
const vertex=`#version 300 es
in vec3 position;in vec3 normal;uniform mat4 mvp;uniform mat3 normMat;out vec3 N;
void main(){N=normMat*normal;gl_Position=mvp*vec4(position,1.0);}`;
const frag=`#version 300 es
precision highp float;in vec3 N;uniform vec3 color;out vec4 outColor;
void main(){vec3 n=normalize(N); if(!gl_FrontFacing)n=-n;float a=max(dot(n,normalize(vec3(-.5,.8,.9))),0.);float b=max(dot(n,normalize(vec3(.8,.1,-.4))),0.);float s=pow(max(dot(reflect(-normalize(vec3(-.5,.8,.9)),n),vec3(0,0,1)),0.),35.);vec3 c=color*(.27+.65*a+.2*b)+vec3(1.,.9,.65)*s*.28;outColor=vec4(pow(c,vec3(.86)),1.);}`;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
if(gl){gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);gl.enable(gl.DEPTH_TEST);}
else status.textContent='WebGL 2 is unavailable. Open a PNG in model-renders instead.';
function multiply(a,b){let c=new Float32Array(16);for(let r=0;r<4;r++)for(let col=0;col<4;col++)for(let k=0;k<4;k++)c[col*4+r]+=a[k*4+r]*b[col*4+k];return c;}
function identity(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);}
function transformMatrix(node){
 if(node.matrix)return new Float32Array(node.matrix);
 const t=node.translation||[0,0,0],q=node.rotation||[0,0,0,1],s=node.scale||[1,1,1], [x,y,z,w]=q;
 return new Float32Array([(1-2*y*y-2*z*z)*s[0],(2*x*y+2*z*w)*s[0],(2*x*z-2*y*w)*s[0],0,(2*x*y-2*z*w)*s[1],(1-2*x*x-2*z*z)*s[1],(2*y*z+2*x*w)*s[1],0,(2*x*z+2*y*w)*s[2],(2*y*z-2*x*w)*s[2],(1-2*x*x-2*y*y)*s[2],0,...t,1]);
}
function draw(){if(!gl)return;const d=Math.min(devicePixelRatio,1.5),w=Math.round(canvas.clientWidth*d),h=Math.round(canvas.clientHeight*d);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.clearColor(.034,.046,.038,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch),rotY=new Float32Array([cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1]),rotX=new Float32Array([1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1]),rot=multiply(rotX,rotY),tr=identity();tr[12]=-center[0];tr[13]=-center[1];tr[14]=-center[2];
 const m=multiply(rot,tr),scale=2/(extent*1.4/zoom),ar=w/h,proj=new Float32Array([scale/ar,0,0,0,0,scale,0,0,0,0,-.2/extent,0,0,0,0,1]);const mvp=multiply(proj,m),nm=new Float32Array([rot[0],rot[1],rot[2],rot[4],rot[5],rot[6],rot[8],rot[9],rot[10]]);
 gl.uniformMatrix4fv(gl.getUniformLocation(program,'mvp'),false,mvp);gl.uniformMatrix3fv(gl.getUniformLocation(program,'normMat'),false,nm);
 for(const p of primitives){gl.bindVertexArray(p.vao);gl.uniform3fv(gl.getUniformLocation(program,'color'),p.color);gl.drawElements(gl.TRIANGLES,p.count,gl.UNSIGNED_INT,0);}gl.bindVertexArray(null);
}
function accessor(doc,binary,index){const a=doc.accessors[index],v=doc.bufferViews[a.bufferView],nc={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],bytes={5126:4,5125:4,5123:2,5121:1}[a.componentType];if(!nc||!bytes)throw Error('Unsupported accessor');const data=new DataView(binary);const method={5126:'getFloat32',5125:'getUint32',5123:'getUint16',5121:'getUint8'}[a.componentType];const out=new (a.componentType===5126?Float32Array:Uint32Array)(a.count*nc);for(let i=0;i<a.count;i++)for(let k=0;k<nc;k++)out[i*nc+k]=data[method]((v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||bytes*nc)+k*bytes,true);return out;}
async function load(buffer,name='Model'){
 if(!gl)return;status.textContent='Reading model…';const view=new DataView(buffer);if(view.getUint32(0,true)!==0x46546c67)throw Error('Not a GLB file');let offset=12,doc,binary;while(offset<buffer.byteLength){const length=view.getUint32(offset,true),type=view.getUint32(offset+4,true);offset+=8;if(type===0x4e4f534a)doc=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,offset,length)));if(type===0x004e4942)binary=buffer.slice(offset,offset+length);offset+=length;}if(!doc||!binary)throw Error('Missing GLB data');
 for(const p of primitives){gl.deleteVertexArray(p.vao);for(const b of p.buffers)gl.deleteBuffer(b);}primitives=[];let lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity],tri=0;
 function visit(index,parent){const node=doc.nodes[index],matrix=multiply(parent,transformMatrix(node));if(node.mesh!==undefined){for(const pr of doc.meshes[node.mesh].primitives){let p=accessor(doc,binary,pr.attributes.POSITION),n=pr.attributes.NORMAL!==undefined?accessor(doc,binary,pr.attributes.NORMAL):new Float32Array(p.length),idx=accessor(doc,binary,pr.indices);if(pr.attributes.NORMAL===undefined)throw Error('This preview expects normals');for(let i=0;i<p.length;i+=3){let v=[p[i],p[i+1],p[i+2]],nn=[n[i],n[i+1],n[i+2]];for(let j=0;j<3;j++){p[i+j]=matrix[j]*v[0]+matrix[4+j]*v[1]+matrix[8+j]*v[2]+matrix[12+j];n[i+j]=matrix[j]*nn[0]+matrix[4+j]*nn[1]+matrix[8+j]*nn[2];lo[j]=Math.min(lo[j],p[i+j]);hi[j]=Math.max(hi[j],p[i+j]);}}
 const vao=gl.createVertexArray(),buffers=[];gl.bindVertexArray(vao);for(const [attr,data]of [['position',p],['normal',n]]){const b=gl.createBuffer();buffers.push(b);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);const at=gl.getAttribLocation(program,attr);gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,3,gl.FLOAT,false,0,0);}const ib=gl.createBuffer();buffers.push(ib);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(idx),gl.STATIC_DRAW);const mat=doc.materials?.[pr.material]?.pbrMetallicRoughness;primitives.push({vao,buffers,count:idx.length,color:mat?.baseColorFactor?.slice(0,3)||[1,1,1]});tri+=idx.length/3;}}
 for(const child of node.children||[])visit(child,matrix);}
 for(const i of doc.scenes[doc.scene||0].nodes)visit(i,identity());center=lo.map((v,i)=>(v+hi[i])/2);extent=Math.max(...lo.map((v,i)=>hi[i]-v));zoom=1;yaw=.32;pitch=.12;status.textContent=`${name} · ${tri.toLocaleString()} triangles · ${primitives.length} draw groups${doc.animations?.length?' · embedded animation (static preview)':''}`;window.exoticPreview={loaded:true,name,triangles:tri,groups:primitives.length};draw();
}
canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.008;pitch=Math.max(-1.1,Math.min(1.1,pitch+(e.clientY-drag[1])*.008));drag=[e.clientX,e.clientY];draw()});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.35,Math.min(3,zoom*Math.exp(-e.deltaY*.001)));draw()},{passive:false});canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=.1;if(e.key==='ArrowRight')yaw+=.1;if(e.key==='ArrowUp')pitch-=.1;if(e.key==='ArrowDown')pitch+=.1;if(e.key==='+')zoom=Math.min(3,zoom*1.1);if(e.key==='-')zoom=Math.max(.35,zoom/1.1);draw()});
$('#file').addEventListener('change',async e=>{const f=e.target.files?.[0];if(f)try{await load(await f.arrayBuffer(),f.name)}catch(err){status.textContent=err.message}});$('#reset').onclick=()=>{yaw=.32;pitch=.12;zoom=1;draw()};new ResizeObserver(draw).observe(canvas);
const url=new URLSearchParams(location.search).get('model');if(url){const safe=/^\.\.\/public\/assets\/exotic\/models\/(mobile\/|animated\/)?[a-z0-9-]+\.glb$/.test(url);if(safe)fetch(url).then(r=>{if(!r.ok)throw Error('Serve this folder locally, or choose a GLB with the file picker.');return r.arrayBuffer()}).then(b=>load(b,url.split('/').pop())).catch(e=>status.textContent=e.message);}draw();
