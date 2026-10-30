import * as THREE from './vendor/three.module.js';

// A small original set. The objects are navigation, not a model of quantum motion.
export function createRoom(canvas, onSelect) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setClearColor(0x071416);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x071416, .025);
  const camera = new THREE.PerspectiveCamera(48, 1, .1, 80);
  const position = new THREE.Vector3(8,5.4,10);
  const look = new THREE.Vector3(-.2,1.5,-2);
  camera.position.copy(position);
  const desiredPosition = position.clone(), desiredLook = look.clone();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mat=(color,roughness=.65,metalness=.2)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const dark=mat(0x182b2d), steel=mat(0x39504e,.35,.7), floor=mat(0x112023,.4,.4);
  const teal=new THREE.MeshBasicMaterial({color:0x8ce0c6});
  const amber=new THREE.MeshBasicMaterial({color:0xe7af66});
  const objects=[];
  function box(w,h,d,x,y,z,material=dark,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);parent.add(o);return o;}
  function label(text,w,h,color='#9ae0cc',bg='#0a2024'){
    const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);
    const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.strokeRect(12,12,c.width-24,c.height-24);
    ctx.font='32px monospace';ctx.fillStyle=color;
    text.split('\n').forEach((line,i)=>ctx.fillText(line,40,60+i*58));
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
    return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));
  }
  scene.add(new THREE.HemisphereLight(0xb8f6e4,0x071012,1.4));
  const lamp=new THREE.PointLight(0x80ecd0,75,18,2);lamp.position.set(0,4,-1);scene.add(lamp);
  const warm=new THREE.PointLight(0xf0ad69,38,14,2);warm.position.set(-5,2,-2);scene.add(warm);
  const key=new THREE.DirectionalLight(0xc0e2e7,2);key.position.set(4,7,6);scene.add(key);
  box(22,.2,18,0,-.12,-2,floor);
  const grid=new THREE.GridHelper(22,22,0x36534e,0x203b3b);grid.position.y=.01;scene.add(grid);
  box(20,7,.25,0,3.4,-7,mat(0x132a2d));
  box(.3,7,16,-9,3.4,-1,mat(0x132a2d));
  for(let i=-8;i<10;i+=3){box(.12,6.8,.2,i,3.4,-6.8,steel);box(2.6,.025,.04,i+1.25,.3,-6.6,teal);}
  for(let i=-6;i<8;i+=4){box(.08,.08,11,i,5.7,-2,steel);box(.035,.03,7,i,5.65,-2,teal);}
  const wallTitle=label('Q / COHERENCE LAB\nMEASUREMENT DIVISION   •   01',7,1.2);wallTitle.position.set(-.6,4.6,-6.8);scene.add(wallTitle);
  const panel=label('TWO PREPARATIONS\nONE MISSING DIFFERENCE\n\nSIMULATION / FOUR QUBITS',3.2,2.1,'#8da9a1');panel.position.set(5.8,3.2,-6.7);scene.add(panel);
  function station(name,x,z){const group=new THREE.Group();group.position.set(x,0,z);group.userData.station=name;scene.add(group);objects.push(group);return group;}
  const archive=station('archive',-4,-2.7);
  box(2.6,.2,1.5,0,1.2,0,steel,archive);box(2.3,1.1,1.2,0,.6,0,dark,archive);
  box(1.6,1.1,.15,0,2,-.3,dark,archive);
  const archiveText=label('01 / ARCHIVE\nA: 0000  1111\nB: 0000  1111\nRECORD FOUND',1.45,.95,'#edbc7e');archiveText.position.set(0,2,-.2);archive.add(archiveText);
  for(let i=0;i<3;i++)box(.6,.04,.4,.7,1.35+i*.05,.3,mat(0xa6b9ad),archive);
  box(.18,.12,.25,-.7,1.37,.4,amber,archive);
  const bench=station('bench',.3,-2.5);
  box(4.3,.2,2.1,0,1.25,0,steel,bench);box(3.8,1.2,1.6,0,.6,0,dark,bench);
  const rings=[];
  for(let i=0;i<4;i++){
    const x=-1.35+i*.9;
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.32,.025,12,52),i%2?amber:teal);ring.position.set(x,2.1,0);bench.add(ring);rings.push(ring);
    box(.035,.7,.035,x,1.7,0,steel,bench);
    const base=new THREE.Mesh(new THREE.CylinderGeometry(.32,.35,.12,24),dark);base.position.set(x,1.4,0);bench.add(base);
    box(.08,.025,.08,x,1.48,.45,teal,bench);
  }
  const benchText=label('02 / MEASUREMENT\nZ                 X',2.7,.5);benchText.position.set(0,1.07,1.06);bench.add(benchText);
  const reveal=station('reveal',4.4,-3.6);
  box(2.1,2.5,.18,0,2.2,0,dark,reveal);
  const revealText=label('03 / ANALYSIS\n\nRECORDS & NOTES\n\nINSPECT AFTER TEST',1.9,2.25);revealText.position.set(0,2.2,.1);reveal.add(revealText);
  box(.12,1.2,.12,0,.6,0,steel,reveal);box(1.6,.1,1,0,.08,0,steel,reveal);
  const motes=new THREE.BufferGeometry();const coords=[];
  // Decorative dust, deliberately separate from all experiment data.
  for(let i=0;i<100;i++)coords.push(Math.random()*18-9,Math.random()*6,Math.random()*13-7);
  motes.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));scene.add(new THREE.Points(motes,new THREE.PointsMaterial({color:0x99bfb4,size:.017,transparent:true,opacity:.25})));
  const ray=new THREE.Raycaster();
  canvas.addEventListener('click',event=>{
    const bounds=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1),camera);
    const hit=ray.intersectObjects(objects,true)[0];if(!hit)return;
    let object=hit.object;while(object&&!object.userData.station)object=object.parent;
    if(object)onSelect(object.userData.station);
  });
  function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}resize();addEventListener('resize',resize);
  let pulse=0,last=0;
  function frame(t){const dt=Math.min((t-last)/1000,.05);last=t;
    if(!document.hidden){
      const blend=reduced?1:1-Math.exp(-dt*3);camera.position.lerp(desiredPosition,blend);look.lerp(desiredLook,blend);camera.lookAt(look);
      pulse=Math.max(0,pulse-dt);rings.forEach((r,i)=>r.scale.setScalar(1+(!reduced?pulse*.07*Math.sin(t*.01+i):0)));
      lamp.intensity=75+pulse*28;renderer.render(scene,camera);
    }
    requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
  return {
    focus(name){const views={archive:[[-.5,3.1,5],[-3,1.5,-3]],bench:[[5,3.7,6],[-.9,1.5,-2.8]],reveal:[[8,3.5,4],[2.7,2,-3.5]],overview:[[8,5.4,10],[-.2,1.5,-2]]};const v=views[name]||views.overview;desiredPosition.set(...v[0]);desiredLook.set(...v[1]);},
    flash(){pulse=1;}
  };
}
