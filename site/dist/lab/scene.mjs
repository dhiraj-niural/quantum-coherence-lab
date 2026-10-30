import * as THREE from './vendor/three.module.js';

// Original theatrical set. Light, dust and props do not represent quantum states.
export function createRoom(canvas, onSelect) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setClearColor(0x0b0807);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0807, .055);
  const camera = new THREE.PerspectiveCamera(48, 1, .1, 45);
  const look = new THREE.Vector3(0,1.65,-1.4);
  camera.position.set(0,2.85,6.4);
  const desiredPosition = camera.position.clone(), desiredLook = look.clone();
  let current='overview', solved=false, pulse=0, last=0, raf;
  const objects=[], flames=[], candleLights=[], indicators=[];
  const material=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const iron=material(0x282725,.4,.65), brass=material(0x927044,.4,.65);
  const wax=material(0xe4cf9b), paper=material(0xc9b88d), leather=material(0x351c16);
  const black=material(0x0d1010,.5,.3), wall=material(0x252017);
  const ember=new THREE.MeshBasicMaterial({color:0xffb34b});
  const pale=new THREE.MeshBasicMaterial({color:0xffe8ad});

  function woodTexture(){
    const c=document.createElement('canvas');c.width=512;c.height=512;
    const g=c.getContext('2d');g.fillStyle='#493022';g.fillRect(0,0,512,512);
    let seed=17;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
    for(let i=0;i<500;i++){
      const y=random()*512;g.strokeStyle=`rgba(${random()>.5?'8,5,2':'169,116,66'},${random()*.24})`;
      g.lineWidth=random()*2+.3;g.beginPath();g.moveTo(0,y);
      g.bezierCurveTo(150,y+random()*12,300,y-random()*12,512,y);g.stroke();
    }
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
  }
  const oak=new THREE.MeshStandardMaterial({map:woodTexture(),color:0xb99166,roughness:.8});
  function mesh(geometry,mat,x,y,z,parent=scene){const o=new THREE.Mesh(geometry,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function box(w,h,d,x,y,z,mat=oak,parent=scene){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);}
  function cylinder(r1,r2,h,x,y,z,mat,parent=scene){return mesh(new THREE.CylinderGeometry(r1,r2,h,24),mat,x,y,z,parent);}
  function sphere(r,x,y,z,mat,parent=scene){return mesh(new THREE.SphereGeometry(r,16,12),mat,x,y,z,parent);}
  function station(name,x,z){const g=new THREE.Group();g.position.set(x,0,z);g.userData.station=name;scene.add(g);objects.push(g);return g;}
  function candle(x,y,z,height=.55){
    cylinder(.13,.16,.06,x,y,z,brass);
    cylinder(.065,.075,height,x,y+height/2,z,wax);
    box(.013,.07,.013,x,y+height,z,black);
    const flame=sphere(.065,x,y+height+.08,z,ember);flame.scale.set(.6,1.8,.6);flame.castShadow=false;flames.push(flame);
    const inner=sphere(.031,x,y+height+.06,z,pale);inner.scale.set(.6,1.9,.6);inner.castShadow=false;
    const light=new THREE.PointLight(0xffb568,13,6,2);light.position.set(x,y+height+.15,z);scene.add(light);candleLights.push(light);
  }
  function letter(text,x,y,z,parent){
    const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
    g.fillStyle='#d2b378';g.textAlign='center';g.textBaseline='middle';g.font='72px Georgia';g.fillText(text,64,68);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
    const o=mesh(new THREE.PlaneGeometry(.3,.3),new THREE.MeshBasicMaterial({map:t,transparent:true}),x,y,z,parent);o.castShadow=false;
  }

  scene.add(new THREE.HemisphereLight(0xe1c4a1,0x15100c,.8));
  const key=new THREE.SpotLight(0xffd8a3,45,20,.8,.7,1.5);key.position.set(-2,5,2);key.target.position.set(0,1,-1);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key,key.target);
  const moon=new THREE.DirectionalLight(0x6c8b9d,.8);moon.position.set(-4,4,-3);scene.add(moon);
  // A narrow old room, built from visible boards rather than a textured backdrop.
  for(let i=0;i<15;i++)box(.79,.15,15,-5.6+i*.8,-.08,-1,oak);
  box(12,6,.25,0,3,-6,wall);box(.25,6,13,-6,3,0,wall);box(.25,6,13,6,3,0,wall);
  for(let i=-5;i<=5;i+=2){box(.2,5.6,.24,i,2.8,-5.8,oak);}
  box(11.8,.22,.3,0,4.8,-5.7,oak);
  for(let i=0;i<5;i++)box(11.9,.055,.07,0,.3+i*.28,-5.82,oak);
  // Blue window and its bars provide a little orientation in the darkness.
  box(1.7,2.1,.07,-3.6,3.35,-5.82,black);
  const windowGlow=material(0x374b5e);windowGlow.emissive=new THREE.Color(0x1f3343);windowGlow.emissiveIntensity=.65;
  box(1.45,1.85,.03,-3.6,3.35,-5.76,windowGlow);
  for(const x of [-4.05,-3.6,-3.15])box(.045,1.92,.05,x,3.35,-5.71,iron);
  box(1.5,.05,.05,-3.6,3.35,-5.7,iron);

  // The shared table keeps the investigation physically coherent across viewpoints.
  for(let i=0;i<5;i++)box(5.8,.2,.55,0,1.32,-2.1+i*.56,oak);
  for(const x of [-2.5,2.5])for(const z of [-2,.2])box(.25,1.25,.25,x,.65,z,oak);
  box(5.4,.15,.12,0,.55,-1.8,oak);
  candle(-2.45,1.46,-1.75,.75);candle(2.25,1.46,-1.9,.5);candle(2.55,1.46,-1.55,.85);

  const archive=station('archive',-1.95,-.25);
  const journal=box(1.05,.13,.82,0,1.49,0,leather,archive);journal.rotation.y=-.15;
  box(.94,.065,.72,0,1.58,0,paper,archive).rotation.y=-.15;
  box(.025,.025,.74,0,1.62,0,leather,archive).rotation.y=-.15;
  // No wall of in-world words: a simple diagram invites opening the journal.
  for(const x of [-.26,.25])for(let i=0;i<4;i++){
    const dot=cylinder(.025,.025,.008,x-.09+i*.065,1.62,-.13,iron,archive);dot.rotation.y=-.15;
  }
  const bookmark=box(.09,.015,.35,.32,1.63,.35,material(0x8a3b23),archive);bookmark.rotation.y=-.15;
  const bench=station('bench',0,-1.1);
  for(const [index,x] of [[0,-.68],[1,.68]]){
    box(1.02,.72,.86,x,1.85,0,oak,bench);
    box(1.08,.09,.91,x,2.25,0,black,bench);
    for(const offset of [-.41,.41])box(.055,.75,.9,x+offset,1.86,0,brass,bench);
    box(.93,.06,.04,x,1.62,.46,brass,bench);
    letter(index?'B':'A',x,1.97,.46,bench);
    for(let j=0;j<4;j++){
      const m=new THREE.MeshStandardMaterial({color:0x44321a,emissive:0xffad41,emissiveIntensity:.1});
      const indicator=sphere(.038,x-.24+j*.16,1.73,.46,m,bench);indicator.castShadow=false;indicators.push(m);
    }
    const handle=mesh(new THREE.TorusGeometry(.13,.025,8,24,Math.PI),brass,x,2.3,0,bench);handle.rotation.x=.1;
  }
  // A physical lever invites changing the experiment, rather than reading a form.
  cylinder(.22,.27,.08,0,1.48,.62,iron,bench);
  const lever=box(.055,.48,.055,0,1.72,.62,brass,bench);lever.rotation.z=.3;
  sphere(.09,-.07,1.96,.62,leather,bench);

  const reveal=station('reveal',3.85,-5.67);
  const doorGlowMat=new THREE.MeshBasicMaterial({color:0xf7d997,transparent:true,opacity:.02});
  const doorGlow=mesh(new THREE.PlaneGeometry(1.75,3.15),doorGlowMat,0,1.6,-.02,reveal);doorGlow.castShadow=false;
  for(const x of [-1,1])box(.18,3.5,.3,x,1.75,.1,oak,reveal);box(2.2,.2,.3,0,3.5,.1,oak,reveal);
  const hinge=new THREE.Group();hinge.position.set(-.91,0,.09);reveal.add(hinge);
  for(let i=0;i<6;i++)box(.29,3.25,.16,.145+i*.303,1.63,0,oak,hinge);
  for(const y of [.5,2.75])box(1.82,.12,.06,.91,y,.12,iron,hinge);
  const lock=mesh(new THREE.TorusGeometry(.105,.025,8,24),brass,1.56,1.5,.15,hinge);
  const exitLight=new THREE.PointLight(0xffce80,0,8,2);exitLight.position.set(3.8,2.4,-5);scene.add(exitLight);
  // A small squash is seasonal scenery, never a reward or a physics symbol.
  const pumpkin=station('decoration',-4.3,-3.9);objects.pop();delete pumpkin.userData.station;
  for(let i=0;i<8;i++){const angle=i*Math.PI/4;const lobe=sphere(.31,Math.sin(angle)*.17,.34,Math.cos(angle)*.17,material(0x8d431a),pumpkin);lobe.scale.set(.8,1.05,.8);}
  const stem=cylinder(.05,.075,.18,0,.71,0,material(0x3b3a20),pumpkin);stem.rotation.z=-.2;
  candle(-3.3,.1,-4.5,.8);

  const dust=new THREE.BufferGeometry(), coords=[];
  for(let i=0;i<70;i++)coords.push(Math.sin(i*27.13)*5,1+(i%19)*.2,Math.cos(i*13.1)*5-1);
  dust.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));
  const motes=new THREE.Points(dust,new THREE.PointsMaterial({color:0xceb484,size:.014,transparent:true,opacity:.23}));scene.add(motes);
  const ray=new THREE.Raycaster();
  function hitStation(event){
    const r=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1),camera);
    const hit=ray.intersectObjects(objects,true)[0];if(!hit)return null;
    let o=hit.object;while(o&&!o.userData.station)o=o.parent;return o?.userData.station??null;
  }
  const click=e=>{const name=hitStation(e);if(name)onSelect(name);};
  const hover=e=>{canvas.style.cursor=hitStation(e)?'pointer':'default';};
  canvas.addEventListener('click',click);canvas.addEventListener('pointermove',hover);
  const views={
    overview:[[0,2.85,6.4],[0,1.65,-1.4]],
    archive:[[-2.9,2.65,2.4],[-1.2,1.5,-.7]],
    bench:[[0,2.9,3.2],[0,1.8,-1.05]],
    reveal:[[2.7,2.65,.7],[3.55,1.75,-5.5]]
  };
  function focus(name){current=Object.hasOwn(views,name)?name:'overview';const v=views[current];desiredPosition.set(...v[0]);desiredLook.set(...v[1]);return current;}
  function move(direction){
    if(direction==='back'||direction==='down')return focus('overview');
    if(direction==='forward'||direction==='up')return focus(current==='overview'?'bench':current);
    const order=['archive','bench','reveal'];let i=order.indexOf(current);if(i<0)i=1;
    return focus(order[(i+(direction==='left'?-1:1)+order.length)%order.length]);
  }
  function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
  resize();addEventListener('resize',resize);
  function frame(t){
    const dt=Math.min((t-last)/1000,.05);last=t;
    if(!document.hidden){
      const blend=reduced?1:1-Math.exp(-dt*3.7);camera.position.lerp(desiredPosition,blend);look.lerp(desiredLook,blend);camera.lookAt(look);
      pulse=Math.max(0,pulse-dt);indicators.forEach(m=>m.emissiveIntensity=.12+pulse*1.7);
      flames.forEach((f,i)=>{const flicker=reduced?1:1+.07*Math.sin(t*.004+i*2)+.025*Math.sin(t*.017+i);f.scale.y=1.8*flicker;candleLights[i].intensity=13*flicker;});
      hinge.rotation.y+=( (solved?-1.25:0)-hinge.rotation.y)*blend;
      doorGlowMat.opacity=solved?.65:.02;exitLight.intensity=solved?20:0;
      lock.rotation.z=solved?-.5:0;
      renderer.render(scene,camera);
    }
    raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
  return {focus,move,flash(){pulse=.65;},setSolved(value){solved=Boolean(value);},get current(){return current;},dispose(){cancelAnimationFrame(raf);removeEventListener('resize',resize);canvas.removeEventListener('click',click);canvas.removeEventListener('pointermove',hover);renderer.dispose();}};
}
