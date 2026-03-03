export function getAlphabetSceneHTML(letter: string, word: string, emoji: string, color: string): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0}
html,body{width:100%;height:100%;background:transparent;overflow:hidden}
canvas{position:absolute;top:0;left:0}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
var cv=document.getElementById('c');
var ctx=cv.getContext('2d');
cv.width=window.innerWidth;
cv.height=window.innerHeight;
var W=cv.width,H=cv.height;
var LETTER='${letter}',WORD='${word}',EMOJI='${emoji}',COLOR='${color}';
var FS=Math.min(W,H)*0.44;
var rotY=0,touching=false,lastX=0,vel=0;

cv.addEventListener('touchstart',function(e){
  touching=true;lastX=e.touches[0].clientX;vel=0;
},{passive:true});
cv.addEventListener('touchmove',function(e){
  var dx=e.touches[0].clientX-lastX;
  vel=dx*0.008;rotY+=vel;lastX=e.touches[0].clientX;
},{passive:true});
cv.addEventListener('touchend',function(){touching=false;},{passive:true});

function draw(){
  ctx.clearRect(0,0,W,H);
  if(!touching){rotY+=0.016;} else {rotY+=vel;vel*=0.92;}
  var cosY=Math.cos(rotY);
  var sinY=Math.sin(rotY);
  var cx=W/2, cy=H/2-FS*0.1;

  // Drop shadow
  ctx.save();
  ctx.translate(cx,cy+FS*0.52);
  ctx.scale(Math.abs(cosY)*0.9,0.18);
  ctx.beginPath();
  ctx.arc(0,0,FS*0.4,0,Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,0.35)';
  ctx.fill();
  ctx.restore();

  // 3D Extrusion side depth
  var depth=28;
  if(sinY>0.05){
    for(var i=depth;i>0;i--){
      var alpha=(i/depth)*0.18;
      ctx.save();
      ctx.translate(cx,cy);
      ctx.transform(cosY,0,0,1,-sinY*i*0.7,i*0.45);
      ctx.globalAlpha=alpha;
      ctx.fillStyle='#000';
      ctx.font='900 '+FS+'px Arial';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText(LETTER,0,0);
      ctx.restore();
    }
  } else if(sinY<-0.05){
    for(var i=depth;i>0;i--){
      var alpha=(i/depth)*0.18;
      ctx.save();
      ctx.translate(cx,cy);
      ctx.transform(cosY,0,0,1,-sinY*i*0.7,i*0.45);
      ctx.globalAlpha=alpha;
      ctx.fillStyle='#000';
      ctx.font='900 '+FS+'px Arial';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText(LETTER,0,0);
      ctx.restore();
    }
  }

  // Glowing outline
  ctx.save();
  ctx.translate(cx,cy);
  ctx.transform(cosY,0,0,1,0,0);
  ctx.shadowColor=COLOR;
  ctx.shadowBlur=30;
  ctx.font='900 '+FS+'px Arial';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.strokeStyle='rgba(255,255,255,0.6)';
  ctx.lineWidth=4;
  ctx.strokeText(LETTER,0,0);
  ctx.restore();

  // Main letter gradient fill
  ctx.save();
  ctx.translate(cx,cy);
  ctx.transform(cosY,0,0,1,0,0);
  ctx.font='900 '+FS+'px Arial';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  var grad=ctx.createLinearGradient(0,-FS/2,0,FS/2);
  grad.addColorStop(0,'#ffffff');
  grad.addColorStop(0.4,'#e8e0ff');
  grad.addColorStop(1,COLOR);
  ctx.fillStyle=grad;
  ctx.fillText(LETTER,0,0);
  ctx.restore();

  // Emoji
  ctx.font=(FS*0.32)+'px Arial';
  ctx.textAlign='center';
  ctx.fillText(EMOJI,W/2,H/2+FS*0.62);

  // Word
  ctx.fillStyle='rgba(255,255,255,0.9)';
  ctx.font='bold '+(W*0.055)+'px Arial';
  ctx.textAlign='center';
  ctx.fillText(WORD,W/2,H/2+FS*0.62+W*0.12);

  // Hint
  ctx.fillStyle='rgba(255,255,255,0.35)';
  ctx.font=(W*0.032)+'px Arial';
  ctx.fillText('drag to rotate',W/2,H-44);

  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>`;
}

export const ALPHABET_DATA: Record<string, { word: string; emoji: string; color: string }> = {
    A: { word: 'Apple', emoji: '🍎', color: '#ef4444' },
    B: { word: 'Ball', emoji: '🏀', color: '#f97316' },
    C: { word: 'Cat', emoji: '🐱', color: '#eab308' },
    D: { word: 'Dog', emoji: '🐕', color: '#22c55e' },
    E: { word: 'Elephant', emoji: '🐘', color: '#14b8a6' },
    F: { word: 'Fish', emoji: '🐟', color: '#3b82f6' },
    G: { word: 'Grapes', emoji: '🍇', color: '#8b5cf6' },
    H: { word: 'Hat', emoji: '🎩', color: '#ec4899' },
    I: { word: 'Ice Cream', emoji: '🍦', color: '#06b6d4' },
    J: { word: 'Jar', emoji: '🫙', color: '#84cc16' },
    K: { word: 'Kite', emoji: '🪁', color: '#f43f5e' },
    L: { word: 'Lion', emoji: '🦁', color: '#f59e0b' },
    M: { word: 'Moon', emoji: '🌙', color: '#6366f1' },
    N: { word: 'Nest', emoji: '🪺', color: '#10b981' },
    O: { word: 'Orange', emoji: '🍊', color: '#f97316' },
    P: { word: 'Parrot', emoji: '🦜', color: '#22c55e' },
    Q: { word: 'Queen', emoji: '👑', color: '#a855f7' },
    R: { word: 'Rabbit', emoji: '🐇', color: '#ec4899' },
    S: { word: 'Sun', emoji: '☀️', color: '#eab308' },
    T: { word: 'Tiger', emoji: '🐯', color: '#f97316' },
    U: { word: 'Umbrella', emoji: '☂️', color: '#3b82f6' },
    V: { word: 'Violin', emoji: '🎻', color: '#8b5cf6' },
    W: { word: 'Whale', emoji: '🐋', color: '#06b6d4' },
    X: { word: 'Xylophone', emoji: '🎵', color: '#ec4899' },
    Y: { word: 'Yak', emoji: '🐂', color: '#84cc16' },
    Z: { word: 'Zebra', emoji: '🦓', color: '#6366f1' },
};
