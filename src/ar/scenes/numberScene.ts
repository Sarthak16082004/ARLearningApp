export function getNumberSceneHTML(num: number): string {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  const color = colors[num] || '#6c63ff';
  const dots = Array(Math.max(num, 1)).fill('●').join(' ');
  const label = num === 0 ? 'Zero' : num === 1 ? 'One' : num === 2 ? 'Two' : num === 3 ? 'Three' :
    num === 4 ? 'Four' : num === 5 ? 'Five' : num === 6 ? 'Six' :
      num === 7 ? 'Seven' : num === 8 ? 'Eight' : 'Nine';

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:100%;height:100%;background:transparent;overflow:hidden;}
canvas{position:absolute;top:0;left:0;}
#info{position:absolute;bottom:130px;left:0;right:0;text-align:center;
  color:rgba(255,255,255,0.35);font:bold 11px Arial;letter-spacing:0.5px;
  pointer-events:none;}
#reset{position:absolute;bottom:130px;right:16px;
  background:rgba(0,0,0,0.6);color:#fff;border:1.5px solid rgba(255,255,255,0.25);
  border-radius:24px;padding:9px 16px;font:bold 12px Arial;cursor:pointer;
  -webkit-tap-highlight-color:transparent;}
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="info">☝ Drag to move &amp; rotate • Pinch to resize</div>
<button id="reset" onclick="doReset()">↺ Reset</button>
<script>
var cv=document.getElementById('c');
var ctx=cv.getContext('2d');
cv.width=window.innerWidth;cv.height=window.innerHeight;
var W=cv.width,H=cv.height;
var NUM='${num}',LABEL='${label}',COLOR='${color}',DOTS='${num === 0 ? '∅' : dots}';
var FS=Math.min(W,H)*0.52;

// ── AR STATE (Like Shapes) ──
var posX=W/2,posY=H*0.42;
var rX=0,rY=0,scl=1.0;
var vX=0,vY=0,vRX=0,vRY=0;
var touching=false,t1={x:0,y:0};
var pinchDist=0,prevAngle=null;

var stars=[];
for(var i=0;i<60;i++){
  stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2.5+0.5,a:Math.random()});
}

function doReset(){posX=W/2;posY=H*0.42;rX=0;rY=0;scl=1.0;vX=vY=vRX=vRY=0;}

// ── MULTI-TOUCH INTERACTION (Like Shapes) ──
cv.addEventListener('touchstart',function(e){
  touching=true;vX=vY=vRX=vRY=0;
  if(e.touches.length===1){
    t1={x:e.touches[0].clientX,y:e.touches[0].clientY};
  } else if(e.touches.length===2){
    var dx=e.touches[0].clientX-e.touches[1].clientX;
    var dy=e.touches[0].clientY-e.touches[1].clientY;
    pinchDist=Math.sqrt(dx*dx+dy*dy);
    prevAngle=Math.atan2(dy,dx);
  }
},{passive:true});

cv.addEventListener('touchmove',function(e){
  if(e.touches.length===1){
    var dx=e.touches[0].clientX-t1.x;
    var dy=e.touches[0].clientY-t1.y;

    // SIMULTANEOUS: move + rotate
    posX+=dx;
    posY+=dy;
    vRY=dx*0.007; rY+=vRY;
    vRX=dy*0.005; rX+=vRX;

    vX=dx;vY=dy;
    t1={x:e.touches[0].clientX,y:e.touches[0].clientY};
  } else if(e.touches.length===2){
    var dx=e.touches[0].clientX-e.touches[1].clientX;
    var dy=e.touches[0].clientY-e.touches[1].clientY;
    var nd=Math.sqrt(dx*dx+dy*dy);
    if(pinchDist>0) scl=Math.max(0.25,Math.min(3.5,scl*(nd/pinchDist)));
    var angle=Math.atan2(dy,dx);
    if(prevAngle!==null) rY+=(angle-prevAngle)*1.8;
    prevAngle=angle;pinchDist=nd;
  }
},{passive:true});

cv.addEventListener('touchend',function(e){
  if(e.touches.length===0){touching=false;prevAngle=null;}
  else if(e.touches.length===1){
    t1={x:e.touches[0].clientX,y:e.touches[0].clientY};
    pinchDist=0;prevAngle=null;
  }
},{passive:true});

var frame=0;
function draw(){
  ctx.clearRect(0,0,W,H);
  frame++;
  
  // Physics & Animation
  if(!touching){ 
    rY+=0.010; rX*=(0.98); // Slow rotation back to upright
    vRY*=0.92; vRX*=0.92;
    posX+=vX*0.08; posY+=vY*0.08;
    rY+=vRY*0.08; rX+=vRX*0.08;
    vX*=0.88; vY*=0.88;
  }

  // Twinkling stars
  stars.forEach(function(s){
    var a=0.3+0.5*Math.abs(Math.sin(frame*0.03+s.a*10));
    ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.fill();
  });

  var curFS=FS*scl;
  var cosY=Math.cos(rY),sinY=Math.sin(rY);

  // Drop shadow
  ctx.save();
  ctx.translate(posX,posY+curFS*0.56);
  ctx.scale(Math.abs(cosY)*1.1,0.2);
  ctx.beginPath();ctx.arc(0,0,curFS*0.45,0,Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fill();
  ctx.restore();

  // Draw 3D Extrusion
  var depth=26;
  for(var i=depth;i>0;i--){
    ctx.save();
    ctx.translate(posX,posY);
    // Mimic the shapes rotation style
    ctx.transform(cosY, Math.sin(rX)*0.24, 0, 1, -sinY*i*0.55, i*0.4);
    ctx.globalAlpha=(i/depth)*0.1;
    ctx.fillStyle='#000';
    ctx.font='900 '+curFS+'px Arial';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(NUM,0,0);
    ctx.restore();
  }

  // Main Number Front
  ctx.save();
  ctx.translate(posX,posY);
  ctx.transform(cosY, Math.sin(rX)*0.24, 0, 1, 0, 0);
  
  // Glow effect
  ctx.shadowColor=COLOR;ctx.shadowBlur=30*scl;
  ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=4*scl;
  ctx.font='900 '+curFS+'px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.strokeText(NUM,0,0);
  
  // Gradient fill
  var grad=ctx.createLinearGradient(0,-curFS/2,0,curFS/2);
  grad.addColorStop(0,'#ffffff');grad.addColorStop(1,COLOR);
  ctx.fillStyle=grad;
  ctx.fillText(NUM,0,0);
  ctx.restore();

  // Counting dots & Labels (Fixed to screen bottom, following posX)
  ctx.save();
  var labelAlpha=Math.max(0.2, 1-(Math.abs(posY-H/2)/(H/2)));
  ctx.globalAlpha=labelAlpha;
  ctx.fillStyle=COLOR;
  ctx.font='bold '+(W*0.065)+'px Arial';
  ctx.textAlign='center';
  ctx.fillText(DOTS,posX,posY+curFS*0.7);
  
  ctx.fillStyle='rgba(255,255,255,0.9)';
  ctx.font='900 '+(W*0.075)+'px Arial';
  ctx.fillText(LABEL,posX,posY+curFS*0.7+W*0.12);
  ctx.restore();

  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>`;
}

