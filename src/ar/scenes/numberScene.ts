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
*{margin:0;padding:0}html,body{width:100%;height:100%;background:transparent;overflow:hidden}canvas{position:absolute;top:0;left:0}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
var cv=document.getElementById('c');
var ctx=cv.getContext('2d');
cv.width=window.innerWidth;cv.height=window.innerHeight;
var W=cv.width,H=cv.height;
var NUM='${num}',LABEL='${label}',COLOR='${color}',DOTS='${num === 0 ? '∅' : dots}';
var FS=Math.min(W,H)*0.52;
var rotY=0,touching=false,lastX=0,vel=0;
var stars=[];
for(var i=0;i<60;i++){
  stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2.5+0.5,a:Math.random()});
}

cv.addEventListener('touchstart',function(e){touching=true;lastX=e.touches[0].clientX;vel=0;},{passive:true});
cv.addEventListener('touchmove',function(e){var dx=e.touches[0].clientX-lastX;vel=dx*0.008;rotY+=vel;lastX=e.touches[0].clientX;},{passive:true});
cv.addEventListener('touchend',function(){touching=false;},{passive:true});

var frame=0;
function draw(){
  ctx.clearRect(0,0,W,H);
  frame++;
  if(!touching)rotY+=0.016; else rotY+=vel,vel*=0.92;
  var cosY=Math.cos(rotY);
  var cx=W/2,cy=H/2-FS*0.05;

  // Twinkling stars
  stars.forEach(function(s){
    var a=0.3+0.5*Math.abs(Math.sin(frame*0.03+s.a*10));
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,'+a+')';
    ctx.fill();
  });

  // Drop shadow
  ctx.save();
  ctx.translate(cx,cy+FS*0.56);
  ctx.scale(Math.abs(cosY)*0.85,0.15);
  ctx.beginPath();ctx.arc(0,0,FS*0.42,0,Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fill();
  ctx.restore();

  // 3D extrusion
  var depth=32,sinY=Math.sin(rotY);
  for(var i=depth;i>0;i--){
    ctx.save();
    ctx.translate(cx,cy);
    ctx.transform(cosY,0,0,1,-sinY*i*0.65,i*0.42);
    ctx.globalAlpha=(i/depth)*0.15;
    ctx.fillStyle='#000';
    ctx.font='900 '+FS+'px Arial';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(NUM,0,0);
    ctx.restore();
  }

  // Glow
  ctx.save();ctx.translate(cx,cy);ctx.transform(cosY,0,0,1,0,0);
  ctx.shadowColor=COLOR;ctx.shadowBlur=40;
  ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=5;
  ctx.font='900 '+FS+'px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.strokeText(NUM,0,0);ctx.restore();

  // Main number
  ctx.save();ctx.translate(cx,cy);ctx.transform(cosY,0,0,1,0,0);
  var grad=ctx.createLinearGradient(0,-FS/2,0,FS/2);
  grad.addColorStop(0,'#ffffff');
  grad.addColorStop(0.35,'#ffe4e1');
  grad.addColorStop(1,COLOR);
  ctx.fillStyle=grad;
  ctx.font='900 '+FS+'px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(NUM,0,0);ctx.restore();

  // Counting dots
  ctx.fillStyle=COLOR;
  ctx.font='bold '+(W*0.055)+'px Arial';
  ctx.textAlign='center';
  ctx.fillText(DOTS,W/2,H/2+FS*0.6);

  // Word label
  ctx.fillStyle='rgba(255,255,255,0.85)';
  ctx.font='bold '+(W*0.06)+'px Arial';
  ctx.fillText(LABEL,W/2,H/2+FS*0.6+W*0.1);

  // Hint
  ctx.fillStyle='rgba(255,255,255,0.3)';
  ctx.font=(W*0.032)+'px Arial';
  ctx.fillText('drag to rotate',W/2,H-44);

  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>`;
}
