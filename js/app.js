(function(){
/* 想改的設定都在這裡 */
var CONFIG={
 // 每 7 天一輪的倒數起點（台灣時間）。第一版小說上線日確定後，改成那天的日期時間。
 updateAnchor:'2026-10-28T00:00:00+08:00',
 // false = 只顯示已公開上線的作品（工具雙胞胎）；true = 連同遊戲與文件的私人預覽卡片一起顯示
 showArchive:false
};

var L=(function(){try{var v=localStorage.getItem('olab-lang');if(v==='zh'||v==='en')return v}catch(e){}return /^zh/i.test(navigator.language||'zh')?'zh':'en'})();
var T={
zh:{h1:'onholdlab 等候空間：下一件作品，正在醞釀。',tag:'一個人，用 AI 把想法做成作品。',
 lede:'進來看看、試用，或留下來等待下一次更新。等候區是正在發生的事，完成品區是已經離開等待的作品。',
 cap0:'窗口關著，鈴鐺靜置。敲一下試試。',cap1:'叮。窗口打開了，工具雙胞胎已經完成。',capLink:'走到窗口 →',bell:'敲響服務鈴',
 hw:'等候區',hws:'正在發生',cdl:'下次更新倒數・每 7 天一版',cdn:'每 7 天換一版。',units:['天','時','分','秒'],
 nvp:'籌備中',nvt:'本週小說',nvd:'第一版上線時會出現在這裡。每七天換一版，舊版會消失，只留下標題與日期。',
 nxl:'下一件作品',nxt:'還不知道會是什麼',nxd:'想看到什麼、哪裡壞了，直接寫在這裡。',nxa:'或到 GitHub 回報 →',fbm:'你的想法或問題',fbc:'想收到回覆的話，留 email 或 IG（可不填）',fbs:'送出',fbok:'收到了，謝謝。',fbempty:'先寫點什麼再送出。',fberr:'沒送出去，稍後再試一次。',fbing:'送出中…',
 hd:'完成品區',hds:'已離開等待',hdm:'試玩區',hdms:'還會修改',hl:'線上公開',hn:'新作',hns:'10/18 新增',hg:'更早的遊戲',ht:'工具與文件',hf:'幕後數字',
 open:'打開 →',newTag:'新',liveTag:'線上版',openLive:'開啟線上版 →',src:'原始碼', foot:'',
 slot:'下一件完成品的位置，還空著。',
 petnote:'在頁面底部走動的小生物是你專屬的訪客：它只存在你的瀏覽器裡，不會上傳任何資料。可以拖著它走、拋出去，或點一下。'},
en:{h1:'onholdlab waiting space: the next creation is taking shape.',tag:'Ideas on hold. Creations in progress.',
 lede:'Look around, try things out, or stay for the next update. The waiting room is what is happening now; the finished works are the things that already left the queue.',
 cap0:'The window is shut and the bell is still. Try ringing it.',cap1:'Ding. The window is open: Tool Twins is done.',capLink:'Walk to the window →',bell:'Ring the service bell',
 hw:'Waiting room',hws:'happening now',cdl:'Next update in · every 7 days',cdn:'A new version every 7 days.',units:['d','h','m','s'],
 nvp:'in preparation',nvt:'This week\'s novel',nvd:'The first version will appear here. It changes every seven days; old versions vanish, leaving only a title and a date.',
 nxl:'The next work',nxt:'Not known yet',nxd:'What you want to see, or what broke — write it here.',nxa:'Or report on GitHub →',fbm:'Your idea or problem',fbc:'Email or IG if you want a reply (optional)',fbs:'Send',fbok:'Got it, thank you.',fbempty:'Write something first.',fberr:'It didn\'t go through. Try again later.',fbing:'Sending…',
 hd:'Finished works',hds:'out of the queue',hdm:'Demo',hdms:'still changing',hl:'Live now',hn:'New',hns:'added Oct 18',hg:'Earlier games',ht:'Tools and documents',hf:'Behind the numbers',
 open:'Open →',newTag:'new',liveTag:'live',openLive:'Open the live tool →',src:'Source', foot:'',
 slot:'Room for the next finished work. Still empty.',
 petnote:'The small creature wandering along the bottom of the page is your own visitor. It lives only in your browser and nothing is uploaded. Drag it, toss it, or tap it.'}};

/* 作品資料在 data/projects.js；section 決定放在哪一區：live（線上公開大卡）、demo（試玩區方格）、new、games、tools */
var P=window.PROJECTS;
if(!Array.isArray(P)){console.warn('onholdlab: data/projects.js 沒有載入或有語法錯誤（看上一則 SyntaxError 的行號），作品區會是空的');P=[]}
function pick(s){return P.filter(function(x){return x.section===s})}
var LIVE=pick('live')[0],NEW=pick('new'),DEMO=pick('demo'),GAMES=pick('games'),TOOLS=pick('tools');
var FACTS={zh:[],en:[]};

function $(id){return document.getElementById(id)}
/* 少填 tags 或 tagline 時當成空的，避免 render() 中途停下讓倒數、服務鈴說明一起壞掉 */
function tags(x){return '<div class="tags">'+(x.tags||[]).map(function(g){return '<span>'+g+'</span>'}).join('')+'</div>'}
function card(x,t,isNew){return '<a class="card" target="_blank" rel="noopener" href="'+x.url+'"><div class="th">'+(x.thumbnail?'<img src="'+x.thumbnail+'" alt="" loading="lazy" width="420" height="333">':'<span class="ic" aria-hidden="true">'+x.icon+'</span>')+(isNew?'<span class="new">'+t.newTag+'</span>':'')+'</div><div class="bd"><h3>'+x.title[L]+'</h3><p>'+((x.tagline||{})[L]||'')+'</p>'+tags(x)+'<span class="go">'+t.open+'</span></div></a>'}

var open=false;
function caption(){var t=T[L];$('capt').textContent=open?t.cap1:t.cap0;var a=$('caplink');a.hidden=!open||!LIVE;a.textContent=t.capLink;if(LIVE)a.href=LIVE.url;
 var b=$('bell');b.setAttribute('aria-label',t.bell);b.setAttribute('aria-pressed',open?'true':'false')}

function render(){var t=T[L];document.documentElement.lang=L==='zh'?'zh-Hant':'en';$('fbml').textContent=$('fbm').placeholder=t.fbm;$('fbcl').textContent=$('fbc').placeholder=t.fbc;
 ['h1','tag','lede','hw','hws','cdl','cdn','nvp','nvt','nvd','nxl','nxt','nxd','nxa','fbs','hd','hds','hdm','hdms','hl','hn','hns','hg','ht','hf','foot','petnote','slot'].forEach(function(k){$(k).textContent=t[k]});
 $('feature').innerHTML=LIVE?'<div class="fi" aria-hidden="true">'+LIVE.icon+'</div><div class="fb"><h3>'+LIVE.title[L]+' <span class="live">'+t.liveTag+'</span></h3><p>'+((LIVE.tagline||{})[L]||'')+'</p>'+tags(LIVE)+'<div class="btns"><a class="btn p" target="_blank" rel="noopener" href="'+LIVE.url+'">'+t.openLive+'</a>'+(LIVE.repo?'<a class="btn" target="_blank" rel="noopener" href="'+LIVE.repo+'">'+t.src+'</a>':'')+'</div></div>':'';
 $('newgames').innerHTML=NEW.map(function(x){return card(x,t,true)}).join('');
 $('games').innerHTML=GAMES.map(function(x){return card(x,t)}).join('');
 $('demo').innerHTML=DEMO.map(function(x){return '<a class="tile" target="_blank" rel="noopener" href="'+x.url+'" title="'+x.title[L]+'"><span class="ic" aria-hidden="true">'+x.icon+'</span><b>'+x.title[L]+'</b></a>'}).join('');
 $('tools').innerHTML=TOOLS.map(function(x){return card(x,t)}).join('');
 $('facts').innerHTML=FACTS[L].map(function(f){return '<div class="fact"><b>'+f[0]+'</b><span>'+f[1]+'</span></div>'}).join('');
 var arch=CONFIG.showArchive;
 [$('hg'),$('games'),$('ht'),$('tools'),$('hf').parentNode,$('foot')].forEach(function(n){n.hidden=!arch});
 [$('hn').parentNode,$('newgames')].forEach(function(n){n.hidden=!(arch||NEW.length)});
 $('slot').hidden=arch||!!NEW.length;
 var cells=$('cd').children;for(var i=0;i<4;i++)cells[i].lastChild.textContent=t.units[i];
 document.querySelectorAll('#seg button').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-l')===L?'true':'false')});
 caption();tick();fit();}
document.querySelectorAll('#seg button').forEach(function(b){b.onclick=function(){L=b.getAttribute('data-l');try{localStorage.setItem('olab-lang',L)}catch(e){}render()}});

/* weekly countdown */
var ANCHOR=Date.parse(CONFIG.updateAnchor),WEEK=6048e5;
function tick(){var now=Date.now(),next=now<=ANCHOR?ANCHOR:ANCHOR+Math.ceil((now-ANCHOR)/WEEK)*WEEK,d=Math.max(0,next-now);
 var v=[Math.floor(d/864e5),Math.floor(d%864e5/36e5),Math.floor(d%36e5/6e4),Math.floor(d%6e4/1e3)];
 var cells=$('cd').children;for(var i=0;i<4;i++)cells[i].firstChild.textContent=(i?('0'+v[i]).slice(-2):v[i]);}
setInterval(tick,1000);

/* desktop: the scene is the whole page; fit its content into the space above the panels */
var wide=window.matchMedia('(min-width:1024px)'),svg=$('scene'),world=$('world');
function fit(){
 if(!wide.matches){svg.setAttribute('viewBox','0 0 640 400');svg.setAttribute('preserveAspectRatio','xMidYMid slice');world.removeAttribute('transform');return}
 var W=innerWidth,H=innerHeight;
 svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.setAttribute('preserveAspectRatio','none');
 var panelsTop=Math.min($('layout').getBoundingClientRect().top+scrollY,H*.72);
 var avail=panelsTop-56;                                 // room between the top row and the panels
 var S=Math.max(.8,Math.min(avail/320,.72*W/450,2.3));    // content is ~296 high, ~450 wide in scene units
 var tx=.49*W-320*S,ty=64-56*S+Math.max(0,(avail-296*S)/2);
 world.setAttribute('transform','translate('+tx.toFixed(1)+' '+ty.toFixed(1)+') scale('+S.toFixed(3)+')');
}
var fitT=0;function fitSoon(){cancelAnimationFrame(fitT);fitT=requestAnimationFrame(fit)}
addEventListener('resize',fitSoon);addEventListener('load',fit);
if(wide.addEventListener)wide.addEventListener('change',fit);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);

/* bell: opens / closes the window */
var stage=$('stage'),AC;
function ding(){try{var A=window.AudioContext||window.webkitAudioContext;if(!A)return;AC=AC||new A();if(AC.state==='suspended')AC.resume();var t=AC.currentTime;
 [[1318,.09],[1976,.04],[2637,.02]].forEach(function(p){var o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=p[0];g.gain.setValueAtTime(p[1],t);g.gain.exponentialRampToValueAtTime(.0001,t+1.2);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+1.25)})}catch(e){}}
function ringBell(){stage.classList.remove('ring');void stage.offsetWidth;stage.classList.add('ring','rung');open=!open;stage.classList.toggle('open',open);if(open)ding();caption();document.dispatchEvent(new Event('olab:bell'))}
var bell=$('bell');bell.addEventListener('click',ringBell);
bell.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();ringBell()}});

/* parallax: pointer on desktop, slow idle sway on touch / when nobody is hovering */
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduce){
 var tx=0,ty=0,cx=0,cy=0,hover=false,visible=true,raf=0;
 function frame(t){raf=0;if(!visible||document.hidden)return;
  if(!hover){tx=Math.sin(t/4200)*.6;ty=Math.cos(t/5300)*.35}
  cx+=(tx-cx)*.06;cy+=(ty-cy)*.06;
  stage.style.setProperty('--mx',cx.toFixed(3));stage.style.setProperty('--my',cy.toFixed(3));
  raf=requestAnimationFrame(frame)}
 function go(){if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(frame)}
 document.addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;hover=true;var r=stage.getBoundingClientRect();
  tx=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));ty=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.5)*2))});
 document.documentElement.addEventListener('mouseleave',function(){hover=false});
 document.addEventListener('visibilitychange',go);
 if('IntersectionObserver' in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting;go()}).observe(stage);
 go();
}

/* visitor creature: the seed lives in this browser, same seed = same creature */
(function(){
 var el=$('pet');if(!el)return;
 var seed=0;try{seed=parseInt(localStorage.getItem('olab-seed'),10)||0}catch(e){}
 if(!seed){seed=(Math.random()*4294967295>>>0)||1;try{localStorage.setItem('olab-seed',String(seed))}catch(e){}}
 var a=seed;function rnd(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}
 var hue=[250,215,190,285,330,40][Math.floor(rnd()*6)],bt=Math.floor(rnd()*4),ft=Math.floor(rnd()*5),twoEyes=rnd()<.5,mk=Math.floor(rnd()*3);
 var top=[23,18,18,14][bt],ey=top+15;
 var feat=[
  '<circle class="dk" cx="21" cy="'+(top+3)+'" r="5.5"/><circle class="dk" cx="43" cy="'+(top+3)+'" r="5.5"/>',
  '<path class="ln" d="M32 '+top+'L32 '+(top-9)+'"/><circle class="dk" cx="32" cy="'+(top-11)+'" r="3.2"/>',
  '<path class="dk" d="M21 '+(top+5)+'L18 '+(top-6)+'L29 '+(top+1)+'Z"/><path class="dk" d="M43 '+(top+5)+'L46 '+(top-6)+'L35 '+(top+1)+'Z"/>',
  '<path class="ln" d="M49 52Q60 48 58 37"/>',''][ft];
 var body=['<ellipse class="bd" cx="32" cy="41" rx="19" ry="17"/>','<rect class="bd" x="18" y="18" width="28" height="42" rx="14"/>','<circle class="bd" cx="32" cy="40" r="20"/>','<path class="bd" d="M32 14C48 30 50 58 32 58C14 58 16 30 32 14Z"/>'][bt];
 var mark=[ '','<ellipse class="lt" cx="32" cy="51" rx="9" ry="6.5"/>','<circle class="lt" cx="21.5" cy="'+(ey+8)+'" r="2.6"/><circle class="lt" cx="42.5" cy="'+(ey+8)+'" r="2.6"/>'][mk];
 var eyes=twoEyes?'<circle class="eye" cx="25" cy="'+ey+'" r="3.9"/><circle class="pu" cx="26" cy="'+ey+'" r="1.9"/><circle class="eye" cx="39" cy="'+ey+'" r="3.9"/><circle class="pu" cx="40" cy="'+ey+'" r="1.9"/>':'<circle class="eye" cx="32" cy="'+ey+'" r="5.3"/><circle class="pu" cx="33.4" cy="'+ey+'" r="2.5"/>';
 el.style.setProperty('--ch',hue);
 el.innerHTML='<div class="pf"><div class="pi"><svg viewBox="0 0 64 64"><ellipse class="sh" cx="32" cy="60" rx="15" ry="3"/>'+feat+body+mark+'<g class="blink">'+eyes+'</g><text class="zz" x="46" y="12">z</text></svg></div></div>';

 var x=0,y=0,vx=0,vy=0,tx=0,state='idle',until=0,last=0,idleSince=0,drag=null,raf=0,tm=0,flip=false,lastT='';
 function now(){return performance.now()}
 function size(){return el.offsetWidth||48}
 function maxX(){return Math.max(0,innerWidth-size())}
 function cl(v,lo,hi){return Math.max(lo,Math.min(hi,v))}
 function put(){var s='translate('+x.toFixed(1)+'px,'+(-y).toFixed(1)+'px)';if(s!==lastT){lastT=s;el.style.transform=s}}
 function set(s){state=s;el.classList.toggle('walk',s==='walk');el.classList.toggle('sleep',s==='sleep')}
 function setFlip(f){if(f!==flip){flip=f;el.classList.toggle('flip',f)}}
 function kick(){if(!raf&&!document.hidden){last=now();raf=requestAnimationFrame(frame)}}
 function touchAct(){idleSince=now();if(state==='sleep'){set('idle');until=now()+1500}}
 function frame(t){raf=0;var dt=Math.min(.05,(t-last)/1000);last=t;
  if(!drag){
   if(y>0||vy>0){vy-=1500*dt;y+=vy*dt;if(y<=0){y=0;vy=vy<-250?-vy*.28:0}}
   if(Math.abs(vx)>1){x+=vx*dt;if(y<=0)vx*=Math.pow(.015,dt);if(x<0){x=0;vx=-vx*.4}else if(x>maxX()){x=maxX();vx=-vx*.4}}else vx=0;
   if(y<=0&&!vx){
    if(state==='walk'){var d=tx-x,dir=d<0?-1:1;x+=dir*34*dt;setFlip(dir<0);if(Math.abs(tx-x)<2){set('idle');until=t+2500+Math.random()*4500}}
    else if(t>=until){
     if(t-idleSince>25000){set('sleep');until=t+1e9}
     else if(!reduce){tx=Math.random()*maxX();set('walk')}
     else until=t+6000}
   }
  }
  put();
  if(state==='walk'||y>0||vy>0||Math.abs(vx)>1||drag){raf=requestAnimationFrame(frame)}
  else{clearTimeout(tm);if(!document.hidden)tm=setTimeout(kick,Math.min(2e4,Math.max(60,until-now())))}
 }
 el.addEventListener('pointerdown',function(e){
  var r=el.getBoundingClientRect();
  drag={base:r.bottom+y,t:now(),moved:false,vx:0,vy:0,px:e.clientX,py:e.clientY};
  try{el.setPointerCapture(e.pointerId)}catch(_){}
  el.classList.add('drag');set('idle');vx=0;vy=0;touchAct();e.preventDefault();kick()});
 el.addEventListener('pointermove',function(e){if(!drag)return;
  var s=size(),nx=cl(e.clientX-s/2,0,maxX()),ny=cl(drag.base-(e.clientY+s/2),0,innerHeight-s),n=now(),dt=Math.max(.008,(n-drag.t)/1000);
  drag.vx=.6*drag.vx+.4*(nx-x)/dt;drag.vy=.6*drag.vy+.4*(ny-y)/dt;drag.t=n;
  if(Math.abs(e.clientX-drag.px)+Math.abs(e.clientY-drag.py)>6)drag.moved=true;
  if(nx!==x)setFlip(nx<x);
  x=nx;y=ny;put()});
 function up(){if(!drag)return;var d=drag;drag=null;el.classList.remove('drag');touchAct();
  if(d.moved){vx=cl(d.vx,-900,900);vy=cl(d.vy,-700,700)}else if(!reduce){vy=380}
  until=now()+3000;kick()}
 el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
 el.addEventListener('contextmenu',function(e){e.preventDefault()});
 document.addEventListener('olab:bell',function(){touchAct();if(!reduce&&y<=0&&!drag){vy=340}kick()});
 document.addEventListener('visibilitychange',function(){if(!document.hidden)kick()});
 addEventListener('resize',function(){x=cl(x,0,maxX());put();kick()});
 x=Math.random()*maxX();put();until=now()+1500;idleSince=now();kick();
(function(){var f=document.getElementById('fb');if(!f)return;var busy=false;
f.addEventListener('submit',function(e){e.preventDefault();if(busy)return;var t=T[L],st=document.getElementById('fbst'),m=document.getElementById('fbm'),c=document.getElementById('fbc'),b=document.getElementById('fbs');
 if(!m.value.trim()){st.textContent=t.fbempty;m.focus();return}
 if(!window.onholdFeedback){st.textContent=t.fberr;return}
 busy=true;b.disabled=true;st.textContent=t.fbing;
 onholdFeedback.send({source:'home',message:m.value,contact:c.value}).then(function(r){busy=false;b.disabled=false;
  if(r.ok){m.value='';c.value='';st.textContent=T[L].fbok}else{st.textContent=T[L].fberr}})});
})();
})();
render();
})();

