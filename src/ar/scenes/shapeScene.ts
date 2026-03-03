export type ShapeId = 'cube' | 'sphere' | 'cone' | 'cylinder' | 'pyramid';

export const SHAPES: { id: ShapeId; label: string; emoji: string; color: string }[] = [
  { id: 'cube', label: 'Cube', emoji: '📦', color: '#6c63ff' },
  { id: 'sphere', label: 'Sphere', emoji: '🌐', color: '#06b6d4' },
  { id: 'cone', label: 'Cone', emoji: '🔺', color: '#f97316' },
  { id: 'cylinder', label: 'Cylinder', emoji: '🥫', color: '#22c55e' },
  { id: 'pyramid', label: 'Pyramid', emoji: '🔷', color: '#f59e0b' },
];

export function getShapeSceneHTML(shapeId: ShapeId, label: string, color: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:100%;height:100%;background:transparent;overflow:hidden;}
canvas{position:absolute;top:0;left:0;}
#controls{
  position:absolute;bottom:130px;right:16px;
  display:flex;flex-direction:column;gap:10px;
  z-index:10;
}
.ctrl-btn{
  background:rgba(10,10,30,0.75);
  color:#fff;
  border:2px solid rgba(255,255,255,0.25);
  border-radius:28px;
  padding:10px 18px;
  font-size:13px;
  font-weight:800;
  font-family:Arial,sans-serif;
  letter-spacing:0.5px;
  cursor:pointer;
  -webkit-tap-highlight-color:transparent;
  transition:background 0.2s;
}
.ctrl-btn.active{
  background:rgba(108,99,255,0.85);
  border-color:#a78bfa;
}
#hint{
  position:absolute;top:16px;left:50%;transform:translateX(-50%);
  background:rgba(0,0,0,0.55);
  color:rgba(255,255,255,0.75);
  font-family:Arial,sans-serif;font-size:12px;font-weight:600;
  padding:6px 16px;border-radius:20px;white-space:nowrap;
  z-index:10;pointer-events:none;
}
#reset-btn{
  position:absolute;top:12px;left:16px;
  background:rgba(0,0,0,0.55);color:rgba(255,255,255,0.7);
  border:1.5px solid rgba(255,255,255,0.2);border-radius:20px;
  padding:7px 14px;font-size:12px;font-weight:700;font-family:Arial,sans-serif;
  z-index:10;cursor:pointer;-webkit-tap-highlight-color:transparent;
}
</style>
</head>
<body>
<canvas id="c"></canvas>

<div id="hint">✋ Move • 🔄 Rotate • 🤏 Pinch to resize</div>
<button id="reset-btn" onclick="reset()">↺ Reset</button>

<div id="controls">
  <button class="ctrl-btn active" id="btnMove"   onclick="setMode('move')">✋ Move</button>
  <button class="ctrl-btn"        id="btnRotate" onclick="setMode('rotate')">🔄 Rotate</button>
</div>

<script>
var cv=document.getElementById('c');
var ctx=cv.getContext('2d');
cv.width=window.innerWidth;
cv.height=window.innerHeight;
var W=cv.width,H=cv.height;
var SHAPE='${shapeId}',LABEL='${label}',COLOR='${color}';

// ── AR PLACEMENT STATE ──
var posX=W/2, posY=H*0.42;
var rX=0.38, rY=0.35;
var scl=1.0;
var mode='move';  // 'move' | 'rotate'
var S=Math.min(W,H)*0.18;

// ── TOUCH STATE ──
var t1={x:0,y:0}, touching=false, pinchDist=0;
var vX=0,vY=0;

function setMode(m){
  mode=m;
  document.getElementById('btnMove').className='ctrl-btn'+(m==='move'?' active':'');
  document.getElementById('btnRotate').className='ctrl-btn'+(m==='rotate'?' active':'');
}

function reset(){
  posX=W/2;posY=H*0.42;rX=0.38;rY=0.35;scl=1.0;vX=0;vY=0;
}

// ── TOUCH HANDLERS ──
cv.addEventListener('touchstart',function(e){
  touching=true;vX=0;vY=0;
  if(e.touches.length===1){
    t1={x:e.touches[0].clientX,y:e.touches[0].clientY};
  } else if(e.touches.length===2){
    var dx=e.touches[0].clientX-e.touches[1].clientX;
    var dy=e.touches[0].clientY-e.touches[1].clientY;
    pinchDist=Math.sqrt(dx*dx+dy*dy);
  }
},{passive:true});

cv.addEventListener('touchmove',function(e){
  if(e.touches.length===1){
    var dx=e.touches[0].clientX-t1.x;
    var dy=e.touches[0].clientY-t1.y;
    if(mode==='move'){
      posX+=dx; posY+=dy;
    } else {
      vX=dy*0.009; vY=dx*0.009;
      rX+=vX; rY+=vY;
    }
    t1={x:e.touches[0].clientX,y:e.touches[0].clientY};
  } else if(e.touches.length===2){
    var dx=e.touches[0].clientX-e.touches[1].clientX;
    var dy=e.touches[0].clientY-e.touches[1].clientY;
    var nd=Math.sqrt(dx*dx+dy*dy);
    if(pinchDist>0) scl=Math.max(0.25,Math.min(3.5,scl*(nd/pinchDist)));
    pinchDist=nd;
  }
},{passive:true});

cv.addEventListener('touchend',function(e){
  if(e.touches.length===0) touching=false;
  if(e.touches.length===1){
    pinchDist=0;
    t1={x:e.touches[0].clientX,y:e.touches[0].clientY};
  }
},{passive:true});

// ── 3D MATH ──
function rotPt(x,y,z){
  var x1=x*Math.cos(rY)+z*Math.sin(rY);
  var z1=-x*Math.sin(rY)+z*Math.cos(rY);
  var y2=y*Math.cos(rX)-z1*Math.sin(rX);
  var z2=y*Math.sin(rX)+z1*Math.cos(rX);
  return[x1,y2,z2];
}
function prj(x,y,z){
  var d=5, sc=d/(d+z)*S*scl;
  return{px:posX+x*sc, py:posY+y*sc, z:z};
}
function cross2d(p,a,b){
  return(a.px-p.px)*(b.py-p.py)-(a.py-p.py)*(b.px-p.px);
}
function avgZ(pts){return pts.reduce(function(s,p){return s+p.z;},0)/pts.length;}
function shade(hex,pct){
  var n=parseInt(hex.slice(1),16);
  var r=Math.min(255,Math.max(0,((n>>16)&255)+pct));
  var g=Math.min(255,Math.max(0,((n>>8)&255)+pct));
  var b=Math.min(255,Math.max(0,(n&255)+pct));
  return'rgba('+r+','+g+','+b+',0.93)';
}

function drawFace(verts,fill,lbl){
  var pts=verts.map(function(v){
    var r=rotPt(v[0],v[1],v[2]);
    return Object.assign(prj(r[0],r[1],r[2]),{z:r[2]});
  });
  if(pts.length>=3&&cross2d(pts[0],pts[1],pts[2])>0)return-999;
  ctx.beginPath();
  pts.forEach(function(p,i){i?ctx.lineTo(p.px,p.py):ctx.moveTo(p.px,p.py);});
  ctx.closePath();
  ctx.fillStyle=fill;ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.22)';ctx.lineWidth=1.5;ctx.stroke();
  if(lbl){
    var cx2=pts.reduce(function(s,p){return s+p.px;},0)/pts.length;
    var cy2=pts.reduce(function(s,p){return s+p.py;},0)/pts.length;
    ctx.fillStyle='rgba(255,255,255,0.92)';
    ctx.font='bold '+(S*scl*0.2)+'px Arial';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(lbl,cx2,cy2);
  }
  return avgZ(pts);
}

// ── SHAPE GEOMETRY ──
var C_VERTS=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
var C_FACES=[
  {i:[4,5,6,7],c:shade(COLOR,50), t:LABEL},
  {i:[0,1,2,3],c:shade(COLOR,-50),t:''},
  {i:[0,1,5,4],c:shade(COLOR,-20),t:''},
  {i:[3,2,6,7],c:shade(COLOR,20), t:''},
  {i:[0,3,7,4],c:shade(COLOR,-60),t:''},
  {i:[1,2,6,5],c:shade(COLOR,60), t:''},
];
var SEGS=16;
var cylTop=[],cylBot=[],coneBase=[];
for(var i=0;i<SEGS;i++){
  var a=i/SEGS*Math.PI*2;
  cylTop.push([Math.cos(a),-1,Math.sin(a)]);
  cylBot.push([Math.cos(a), 1,Math.sin(a)]);
  coneBase.push([Math.cos(a),1,Math.sin(a)]);
}
var PYR_V=[[-1,1,-1],[1,1,-1],[1,1,1],[-1,1,1],[0,-1,0]];
var PYR_F=[
  {i:[0,1,2,3],c:shade(COLOR,-30),t:''},
  {i:[0,1,4],  c:shade(COLOR,50), t:LABEL},
  {i:[1,2,4],  c:shade(COLOR,15), t:''},
  {i:[2,3,4],  c:shade(COLOR,-10),t:''},
  {i:[3,0,4],  c:shade(COLOR,30), t:''},
];

// ── SPHERE ──
function buildSpherePatches(){
  var N=14,bands=[];
  for(var lat=0;lat<N;lat++){
    var t1=Math.PI*lat/N-Math.PI/2,t2=Math.PI*(lat+1)/N-Math.PI/2;
    for(var lon=0;lon<N;lon++){
      var p1=lon/N*Math.PI*2,p2=(lon+1)/N*Math.PI*2;
      bands.push({
        v:[[Math.cos(t1)*Math.cos(p1),Math.sin(t1),Math.cos(t1)*Math.sin(p1)],
           [Math.cos(t1)*Math.cos(p2),Math.sin(t1),Math.cos(t1)*Math.sin(p2)],
           [Math.cos(t2)*Math.cos(p2),Math.sin(t2),Math.cos(t2)*Math.sin(p2)],
           [Math.cos(t2)*Math.cos(p1),Math.sin(t2),Math.cos(t2)*Math.sin(p1)]],
        br:Math.round((lat/N)*80-40)
      });
    }
  }
  return bands;
}
var SPHERE_PATCHES=buildSpherePatches();

function drawSphere(){
  var sorted=SPHERE_PATCHES.map(function(b){
    var avgz=b.v.reduce(function(s,v){var r=rotPt(v[0],v[1],v[2]);return s+r[2];},0)/4;
    return{b:b,z:avgz};
  }).sort(function(a,b2){return a.z-b2.z;});

  sorted.forEach(function(item){
    var pts=item.b.v.map(function(v){
      var r=rotPt(v[0],v[1],v[2]);
      return Object.assign(prj(r[0],r[1],r[2]),{z:r[2]});
    });
    if(cross2d(pts[0],pts[1],pts[2])>0)return;
    ctx.beginPath();
    pts.forEach(function(p,i){i?ctx.lineTo(p.px,p.py):ctx.moveTo(p.px,p.py);});
    ctx.closePath();
    ctx.fillStyle=shade(COLOR,item.b.br);ctx.fill();
  });
  var cp=prj(0,0,1);
  ctx.fillStyle='rgba(255,255,255,0.88)';
  ctx.font='bold '+(S*scl*0.2)+'px Arial';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(LABEL,cp.px,cp.py);
}

function drawPolyShape(faceList,vertList){
  var fd=faceList.map(function(f){
    var verts=f.i.map(function(i){return vertList[i];});
    var avgz=verts.reduce(function(s,v){var r=rotPt(v[0],v[1],v[2]);return s+r[2];},0)/verts.length;
    return{verts:verts,c:f.c,t:f.t,z:avgz};
  }).sort(function(a,b){return a.z-b.z;});
  fd.forEach(function(f){drawFace(f.verts,f.c,f.t);});
}

function drawCylinder(){
  var faces=[];
  for(var i=0;i<SEGS;i++){
    var n=(i+1)%SEGS;
    var br=Math.round(Math.cos(i/SEGS*Math.PI*2)*70);
    faces.push({i:[cylTop[i],cylTop[n],cylBot[n],cylBot[i]],c:shade(COLOR,br),t:i===0?LABEL:'',z:0});
  }
  faces.push({i:cylTop.slice(),c:shade(COLOR,50),t:'',z:0});
  faces.push({i:cylBot.slice(),c:shade(COLOR,-50),t:'',z:0});
  faces.sort(function(a,b){
    var za=a.i.reduce(function(s,v){var r=rotPt(v[0],v[1],v[2]);return s+r[2];},0)/a.i.length;
    var zb=b.i.reduce(function(s,v){var r=rotPt(v[0],v[1],v[2]);return s+r[2];},0)/b.i.length;
    return za-zb;
  });
  faces.forEach(function(f){
    var pts=f.i.map(function(v){var r=rotPt(v[0],v[1],v[2]);return Object.assign(prj(r[0],r[1],r[2]),{z:r[2]});});
    if(pts.length>=3&&cross2d(pts[0],pts[1],pts[2])>0)return;
    ctx.beginPath();pts.forEach(function(p,i){i?ctx.lineTo(p.px,p.py):ctx.moveTo(p.px,p.py);});
    ctx.closePath();ctx.fillStyle=f.c;ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;ctx.stroke();
    if(f.t){
      var cx2=pts.reduce(function(s,p){return s+p.px;},0)/pts.length;
      var cy2=pts.reduce(function(s,p){return s+p.py;},0)/pts.length;
      ctx.fillStyle='rgba(255,255,255,0.9)';ctx.font='bold '+(S*scl*0.2)+'px Arial';
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(f.t,cx2,cy2);
    }
  });
}

function drawCone(){
  var apex=[0,-1,0];
  var faces=[];
  for(var i=0;i<SEGS;i++){
    var n=(i+1)%SEGS;
    var br=Math.round(Math.cos(i/SEGS*Math.PI*2)*70);
    faces.push({i:[coneBase[i],coneBase[n],apex],c:shade(COLOR,br),t:i===0?LABEL:'',z:0});
  }
  faces.push({i:coneBase.slice(),c:shade(COLOR,-50),t:'',z:0});
  faces.sort(function(a,b){
    var za=a.i.reduce(function(s,v){var r=rotPt(v[0],v[1],v[2]);return s+r[2];},0)/a.i.length;
    var zb=b.i.reduce(function(s,v){var r=rotPt(v[0],v[1],v[2]);return s+r[2];},0)/b.i.length;
    return za-zb;
  });
  faces.forEach(function(f){
    var pts=f.i.map(function(v){var r=rotPt(v[0],v[1],v[2]);return Object.assign(prj(r[0],r[1],r[2]),{z:r[2]});});
    if(pts.length>=3&&cross2d(pts[0],pts[1],pts[2])>0)return;
    ctx.beginPath();pts.forEach(function(p,i){i?ctx.lineTo(p.px,p.py):ctx.moveTo(p.px,p.py);});
    ctx.closePath();ctx.fillStyle=f.c;ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;ctx.stroke();
    if(f.t){
      var cx2=pts.reduce(function(s,p){return s+p.px;},0)/pts.length;
      var cy2=pts.reduce(function(s,p){return s+p.py;},0)/pts.length;
      ctx.fillStyle='rgba(255,255,255,0.9)';ctx.font='bold '+(S*scl*0.2)+'px Arial';
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(f.t,cx2,cy2);
    }
  });
}

// ── MAIN DRAW LOOP ──
function draw(){
  ctx.clearRect(0,0,W,H);

  // Auto-slow rotate only in rotate mode when not touching
  if(mode==='rotate'&&!touching){rY+=0.012;rX+=0.005;}
  if(mode==='rotate'&&touching){rX+=vX*0.1;rY+=vY*0.1;}

  // Ground shadow - anchors shape to the "real world surface"
  var shadowW=S*scl*1.1, shadowH=S*scl*0.22;
  var shadowY=posY+S*scl*1.15;
  ctx.save();
  var grd=ctx.createRadialGradient(posX,shadowY,0,posX,shadowY,shadowW);
  grd.addColorStop(0,'rgba(0,0,0,0.45)');
  grd.addColorStop(1,'rgba(0,0,0,0)');
  ctx.scale(1,shadowH/shadowW);
  ctx.beginPath();
  ctx.arc(posX,shadowY*(shadowW/shadowH),shadowW,0,Math.PI*2);
  ctx.fillStyle=grd;
  ctx.fill();
  ctx.restore();

  // Placement ring (shows where shape is "rooted")
  ctx.beginPath();
  ctx.ellipse(posX,posY+S*scl*1.1,S*scl*0.65,S*scl*0.13,0,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,255,255,0.18)';
  ctx.lineWidth=1.5;
  ctx.setLineDash([6,5]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw 3D shape
  if(SHAPE==='cube')      {polySort(C_FACES,C_VERTS);}
  else if(SHAPE==='sphere')    {drawSphere();}
  else if(SHAPE==='cone')      {drawCone();}
  else if(SHAPE==='cylinder')  {drawCylinder();}
  else if(SHAPE==='pyramid')   {polySort(PYR_F,PYR_V);}

  // Mode indicator inside canvas
  ctx.fillStyle='rgba(255,255,255,0.28)';
  ctx.font='bold '+(W*0.03)+'px Arial';
  ctx.textAlign='center';
  ctx.fillText(mode==='move'?'✋ MOVE MODE':'🔄 ROTATE MODE',W/2,H-130);

  requestAnimationFrame(draw);
}

function polySort(faceList,vertList){
  var fd=faceList.map(function(f){
    var verts=f.i.map(function(i){return vertList[i];});
    var avgz=verts.reduce(function(s,v){var r=rotPt(v[0],v[1],v[2]);return s+r[2];},0)/verts.length;
    return{verts:verts,c:f.c,t:f.t,z:avgz};
  }).sort(function(a,b){return a.z-b.z;});
  fd.forEach(function(f){drawFace(f.verts,f.c,f.t);});
}

draw();
</script>
</body>
</html>`;
}
