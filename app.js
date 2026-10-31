import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const places = [
  { id:'entrance', name:'Main Entrance', category:'Starting point', icon:'⌂', x:-7, z:5, description:'Main entry' },
  { id:'cafe', name:'Cafe', category:'Food & drink', icon:'☕', x:6, z:5, description:'Coffee and snacks' },
  { id:'restroom', name:'Restrooms', category:'Facilities', icon:'♧', x:7, z:-3, description:'Public restrooms' },
  { id:'helpdesk', name:'Help Desk', category:'Visitor services', icon:'i', x:-6, z:-4, description:'Information and assistance' },
  { id:'meeting', name:'Meeting Room', category:'Rooms', icon:'▣', x:1, z:-6, description:'Meeting and collaboration' },
  { id:'lounge', name:'Lounge', category:'Relaxation', icon:'◇', x:1, z:4, description:'Seating area' },
  { id:'shop', name:'Store', category:'Shopping', icon:'▤', x:-2, z:-2, description:'Convenience store' }
];
const obstacles = [
  {x:-3.7,z:0,w:3.2,d:1.0}, {x:2.8,z:0.4,w:3.5,d:1.0},
  {x:-5.4,z:-1.7,w:1.0,d:2.5}, {x:5.3,z:2.0,w:1.0,d:2.0},
  {x:0,z:-3.8,w:2.5,d:1.0}, {x:-1.0,z:2.5,w:2.8,d:.75},
  {x:3.4,z:-5.0,w:2.4,d:.8}
];
const GRID = { minX:-9, maxX:9, minZ:-7, maxZ:7, step:.5 };
let scene, camera, renderer, controls, floorGroup, routeGroup, labelGroup, placeGroup, youMarker;
let selectedId = null, routeVisible = true, labelsVisible = true, currentRoute = [];
let toastTimer;
const wrap = document.getElementById('sceneWrap');
function showToast(message) {
  const el = document.getElementById('toast');
  el.textContent = message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function isBlocked(x,z) {
  return obstacles.some(o => x >= o.x-o.w/2-.12 && x <= o.x+o.w/2+.12 && z >= o.z-o.d/2-.12 && z <= o.z+o.d/2+.12);
}
function key(x,z){return `${Math.round((x-GRID.minX)/GRID.step)},${Math.round((z-GRID.minZ)/GRID.step)}`;}
function coords(k){const [gx,gz]=k.split(',').map(Number);return {x:GRID.minX+gx*GRID.step,z:GRID.minZ+gz*GRID.step};}
function nearestFree(x,z) {
  let best={x,z}, bestD=Infinity;
  for(let gx=0;gx<=Math.round((GRID.maxX-GRID.minX)/GRID.step);gx++){
    for(let gz=0;gz<=Math.round((GRID.maxZ-GRID.minZ)/GRID.step);gz++){
      const p={x:GRID.minX+gx*GRID.step,z:GRID.minZ+gz*GRID.step};
      const d=(p.x-x)**2+(p.z-z)**2;
      if(!isBlocked(p.x,p.z)&&d<bestD){bestD=d;best=p;}
    }
  }
  return best;
}
function findPath(start,end) {
  const s=nearestFree(start.x,start.z), e=nearestFree(end.x,end.z);
  const sk=key(s.x,s.z), ek=key(e.x,e.z);
  const open=new Set([sk]), came=new Map(), g=new Map([[sk,0]]), f=new Map([[sk,heuristic(s,e)]]);
  const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  let loops=0;
  while(open.size && loops++<20000){
    let cur=null, low=Infinity;
    for(const k of open){const val=f.get(k)??Infinity;if(val<low){low=val;cur=k;}}
    if(cur===ek){
      const out=[coords(cur)];let c=cur;
      while(came.has(c)){c=came.get(c);out.push(coords(c));}
      return simplifyPath(out.reverse());
    }
    open.delete(cur);const cp=coords(cur);
    for(const [dx,dz] of dirs){
      const np={x:cp.x+dx*GRID.step,z:cp.z+dz*GRID.step};
      if(np.x<GRID.minX||np.x>GRID.maxX||np.z<GRID.minZ||np.z>GRID.maxZ||isBlocked(np.x,np.z))continue;
      if(dx&&dz&&(isBlocked(cp.x+dx*GRID.step,cp.z)||isBlocked(cp.x,cp.z+dz*GRID.step)))continue;
      const nk=key(np.x,np.z), tentative=(g.get(cur)??Infinity)+((dx&&dz)?1.4142:1);
      if(tentative<(g.get(nk)??Infinity)){came.set(nk,cur);g.set(nk,tentative);f.set(nk,tentative+heuristic(np,e));open.add(nk);}
    }
  }
  return [];
}
function heuristic(a,b){return Math.hypot(a.x-b.x,a.z-b.z)/GRID.step;}
function simplifyPath(path){
  if(path.length<3)return path;
  const out=[path[0]];let lastDir=null;
  for(let i=1;i<path.length;i++){
    const prev=path[i-1],cur=path[i],dir=[Math.sign(cur.x-prev.x),Math.sign(cur.z-prev.z)].join(',');
    if(lastDir!==null&&dir!==lastDir)out.push(prev);
    lastDir=dir;
  }
  out.push(path[path.length-1]);return out;
}
function distance(path){let d=0;for(let i=1;i<path.length;i++)d+=Math.hypot(path[i].x-path[i-1].x,path[i].z-path[i-1].z);return d;}
function init3D(){
  scene=new THREE.Scene();scene.background=new THREE.Color('#f3f5fb');
  camera=new THREE.PerspectiveCamera(38,wrap.clientWidth/wrap.clientHeight,.1,150);
  camera.position.set(15,18,19);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setSize(wrap.clientWidth,wrap.clientHeight);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  wrap.appendChild(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=true;controls.dampingFactor=.07;controls.maxPolarAngle=Math.PI/2.08;controls.minDistance=10;controls.maxDistance=36;
  scene.add(new THREE.HemisphereLight(0xffffff,0xc7cee0,2.0));
  const sun=new THREE.DirectionalLight(0xffffff,2.3);sun.position.set(-8,18,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
  floorGroup=new THREE.Group();scene.add(floorGroup);routeGroup=new THREE.Group();scene.add(routeGroup);labelGroup=new THREE.Group();scene.add(labelGroup);placeGroup=new THREE.Group();scene.add(placeGroup);
  buildFloor();buildObstacles();buildPlaces();buildYouMarker();
  document.getElementById('loading').classList.add('hidden');
  window.addEventListener('resize',onResize);animate();
}
function material(color,roughness=.8){return new THREE.MeshStandardMaterial({color,roughness});}
function box(parent,w,h,d,x,y,z,color,opts={}){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));
  mesh.position.set(x,y,z);mesh.castShadow=opts.shadow!==false;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function buildFloor(){
  const slab=box(floorGroup,19,.25,15,0,-.18,0,'#ffffff');slab.receiveShadow=true;
  const grid=new THREE.GridHelper(18,36,'#dfe4ef','#e8ebf3');grid.position.y=-.045;floorGroup.add(grid);
  box(floorGroup,19,.8,.18,0,.28,-7.45,'#dce2ef');box(floorGroup,19,.8,.18,0,.28,7.45,'#dce2ef');
  box(floorGroup,.18,.8,15,-9.45,.28,0,'#dce2ef');box(floorGroup,.18,.8,15,9.45,.28,0,'#dce2ef');
  box(floorGroup,5,.12,.22,-5,-.035,7.43,'#a8b3c9',{shadow:false});box(floorGroup,5,.12,.22,5,-.035,7.43,'#a8b3c9',{shadow:false});
  const zones=[{x:-6.5,z:-4.7,w:4.7,d:3.6,c:'#f0edff'},{x:5.8,z:4.7,w:5.8,d:3.8,c:'#e7faf4'},{x:1.2,z:-5.5,w:4.7,d:2.4,c:'#fff4e5'}];
  for(const z of zones){const m=new THREE.Mesh(new THREE.PlaneGeometry(z.w,z.d),new THREE.MeshBasicMaterial({color:z.c,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(z.x,-.045,z.z);floorGroup.add(m);}
  for(const [x,z] of [[-8,-6],[-8,6],[8,-6],[8,6],[-.5,-6.4],[.5,6.4]])box(floorGroup,.28,1.15,.28,x,.45,z,'#c9d2e2');
}
function buildObstacles(){obstacles.forEach((o,i)=>{const c=i%2?'#d9e0ec':'#cbd5e5';box(floorGroup,o.w,.85,o.d,o.x,.35,o.z,c);box(floorGroup,o.w+.06,.08,o.d+.06,o.x,.82,o.z,'#eef1f7',{shadow:false});});}
function makeLabel(text,color='#344054'){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');
  ctx.fillStyle='rgba(255,255,255,0.94)';roundRect(ctx,12,16,488,96,24);ctx.fill();
  ctx.font='600 38px DM Sans, Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,256,64,450);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));sprite.scale.set(2.35,.59,1);return sprite;
}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function buildPlaces(){
  places.forEach(p=>{
    const g=new THREE.Group();g.position.set(p.x,0,p.z);g.userData.placeId=p.id;const isStart=p.id==='entrance';const color=isStart?'#36cba2':'#795ff0';
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.62,12),material(color));stem.position.y=.31;g.add(stem);
    const orb=new THREE.Mesh(new THREE.SphereGeometry(.19,20,16),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.2}));orb.position.y=.68;orb.castShadow=true;g.add(orb);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.27,.035,8,24),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7}));ring.rotation.x=Math.PI/2;ring.position.y=.12;g.add(ring);
    const label=makeLabel(p.name,isStart?'#178968':'#5742c9');label.position.set(0,1.45,0);label.userData.labelFor=p.id;labelGroup.add(label);placeGroup.add(g);
  });
}
function buildYouMarker(){
  youMarker=new THREE.Group();youMarker.position.set(places[0].x,.08,places[0].z);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(.48,32),new THREE.MeshBasicMaterial({color:'#39cba2',transparent:true,opacity:.2}));disc.rotation.x=-Math.PI/2;disc.position.y=.02;youMarker.add(disc);
  const pin=new THREE.Mesh(new THREE.SphereGeometry(.18,18,16),new THREE.MeshStandardMaterial({color:'#22bd91',emissive:'#22bd91',emissiveIntensity:.25}));pin.position.y=.45;youMarker.add(pin);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.3,.035,8,32),new THREE.MeshBasicMaterial({color:'#22bd91'}));halo.rotation.x=Math.PI/2;halo.position.y=.08;youMarker.add(halo);scene.add(youMarker);
}
function animate(){requestAnimationFrame(animate);controls?.update();renderer?.render(scene,camera);}
function onResize(){if(!renderer)return;const w=wrap.clientWidth,h=wrap.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}
function clearGroup(g){while(g.children.length){const o=g.children.pop();if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}}}
function drawRoute(target){
  clearGroup(routeGroup);currentRoute=[];if(!target||target.id==='entrance'){updateRouteInfo(null);return;}
  const start=places.find(p=>p.id==='entrance');const path=findPath(start,target);
  if(!path.length){showToast('No route found. Try another destination.');updateRouteInfo(null);return;}
  currentRoute=path;const pts=path.map(p=>new THREE.Vector3(p.x,.055,p.z));const curve=new THREE.CatmullRomCurve3(pts);
  const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(24,path.length*4),.075,8,false),new THREE.MeshStandardMaterial({color:'#795ff0',emissive:'#4f35d6',emissiveIntensity:.25,roughness:.35}));routeGroup.add(tube);
  path.forEach((p,i)=>{if(i===0||i===path.length-1||i%3===0){const dot=new THREE.Mesh(new THREE.SphereGeometry(.09,12,10),new THREE.MeshBasicMaterial({color:i===path.length-1?'#a28fff':'#795ff0'}));dot.position.set(p.x,.13,p.z);routeGroup.add(dot);}});
  const d=distance(path);updateRouteInfo(d);if(routeVisible)routeGroup.visible=true;showToast(`Route ready to ${target.name}`);
}
function updateRouteInfo(d){
  document.getElementById('destinationLabel').textContent=selectedId?places.find(p=>p.id===selectedId)?.name:'Choose a place';
  document.getElementById('routeDistance').textContent=d==null?'— m':`${Math.round(d*1.25)} m`;
  document.getElementById('routeTime').textContent=d==null?'— min walk':`${Math.max(1,Math.ceil(d/1.25))} min walk`;
}
function choosePlace(id){
  const p=places.find(x=>x.id===id);if(!p)return;selectedId=id;
  document.querySelectorAll('.place-button').forEach(b=>b.classList.toggle('selected',b.dataset.id===id));
  document.getElementById('destinationLabel').textContent=p.name;drawRoute(p);
  controls.target.set((places[0].x+p.x)/2,0,(places[0].z+p.z)/2);
  document.getElementById('searchInput').value=p.name;document.getElementById('searchResults').hidden=true;
  if(id==='entrance')showToast('You are already at the Main Entrance.');
}
function renderPlaceList(){
  const list=document.getElementById('placeList');
  list.innerHTML=places.map(p=>`<button class="place-button ${p.id===selectedId?'selected':''}" type="button" data-id="${p.id}"><span class="place-icon">${p.icon}</span><span class="place-info"><strong>${p.name}</strong><small>${p.category}</small></span><span class="place-arrow">›</span></button>`).join('');
  list.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>choosePlace(b.dataset.id)));
}
function renderSearchResults(query){
  const result=document.getElementById('searchResults');const q=query.trim().toLowerCase();if(!q){result.hidden=true;return;}
  const matches=places.filter(p=>`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q));
  if(!matches.length){result.innerHTML='<div class="search-result"><span>No matching places</span><small>Try another term</small></div>';result.hidden=false;return;}
  result.innerHTML=matches.map(p=>`<button class="search-result" type="button" data-id="${p.id}"><span>${p.icon} &nbsp; ${p.name}</span><small>${p.category}</small></button>`).join('');
  result.hidden=false;result.querySelectorAll('button[data-id]').forEach(b=>b.addEventListener('click',()=>choosePlace(b.dataset.id)));
}
function setupUI(){
  renderPlaceList();const input=document.getElementById('searchInput');
  input.addEventListener('input',e=>renderSearchResults(e.target.value));input.addEventListener('focus',e=>{if(e.target.value)renderSearchResults(e.target.value);});
  document.addEventListener('click',e=>{if(!e.target.closest('.side-section'))document.getElementById('searchResults').hidden=true;});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();input.focus();}if(e.key==='Escape'){document.getElementById('searchResults').hidden=true;document.getElementById('helpModal').hidden=true;}});
  document.getElementById('clearRoute').addEventListener('click',()=>{selectedId=null;renderPlaceList();document.getElementById('searchInput').value='';document.getElementById('destinationLabel').textContent='Choose a place';clearGroup(routeGroup);updateRouteInfo(null);showToast('Route cleared');});
  document.getElementById('toggleLabels').addEventListener('click',e=>{labelsVisible=!labelsVisible;labelGroup.visible=labelsVisible;e.currentTarget.classList.toggle('active',labelsVisible);});
  document.getElementById('toggleRoute').addEventListener('click',e=>{routeVisible=!routeVisible;routeGroup.visible=routeVisible;e.currentTarget.classList.toggle('active',routeVisible);});
  document.getElementById('resetView').addEventListener('click',()=>{camera.position.set(15,18,19);controls.target.set(0,0,0);controls.update();showToast('View reset');});
  document.getElementById('zoomIn').addEventListener('click',()=>{camera.position.multiplyScalar(.88);controls.update();});document.getElementById('zoomOut').addEventListener('click',()=>{camera.position.multiplyScalar(1.12);controls.update();});
  const modal=document.getElementById('helpModal');document.getElementById('helpButton').addEventListener('click',()=>modal.hidden=false);
  document.getElementById('closeHelp').addEventListener('click',()=>modal.hidden=true);document.getElementById('closeHelpBottom').addEventListener('click',()=>modal.hidden=true);
  modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true;});document.getElementById('floorSelect').addEventListener('change',()=>showToast('Only Level 1 is included in this demo.'));
}
try{init3D();setupUI();}catch(err){console.error(err);document.getElementById('loading').innerHTML='<span>Could not start the 3D view. Check your internet connection and open this page using Live Server.</span>';}
