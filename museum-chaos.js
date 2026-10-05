(()=>{
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const STORE={views:"trash-viewed-items",smell:"trash-smell-count"};
  const jokes=[
    "闻起来像周一早上的 TODO。",
    "闻起来像 README 写完了，功能还在路上。",
    "闻起来像测试全绿，用户全红。",
    "闻起来像凌晨三点还在说“最后改一下”。",
    "闻起来像一个被 if 越修越大的项目。",
    "闻起来像服务器重启后突然拥有了人格。",
    "闻起来像 Git commit 写着“final_final2”。",
    "闻起来像需求改了，但会议纪要没改。",
    "闻起来像缓存清了八遍，Bug 还是原住民。",
    "闻起来像“先上线再说”的技术债。",
    "闻起来像生产环境里的一只野生 console.log。",
    "闻起来像产品经理说的“很简单”。"
  ];
  const titles=[
    ["初级拾荒者",10,"已经能从互联网垃圾场里捡出第一批标本。"],
    ["高级拾荒者",30,"你的鞋底已经开始沾上馆藏气味。"],
    ["臭味研究员",50,"你开始主动寻找别人不愿打开的页面。"],
    ["终身臭学家",100,"恭喜，你已经彻底理解互联网为什么会长这样。"],
    ["馆长候补",200,"你和馆长之间，只差一张桌子和一堆垃圾。"]
  ];
  function getJSON(k,f){try{const x=JSON.parse(localStorage.getItem(k)||"null");return x??f}catch(e){return f}}
  function setJSON(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function toast(msg,kind="normal"){
    let el=$("#museumToast");
    if(!el){el=document.createElement("div");el.id="museumToast";el.className="museum-toast";document.body.appendChild(el)}
    el.textContent=msg;el.classList.remove("show","good","bad");void el.offsetWidth;el.classList.add("show",kind);
    clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.remove("show"),2800);
  }
  const flyLayer=document.createElement("div");flyLayer.id="flyLayer";flyLayer.setAttribute("aria-hidden","true");document.body.appendChild(flyLayer);
  let mx=innerWidth*.5,my=innerHeight*.38,scrollY0=scrollY;
  addEventListener("pointermove",e=>{mx=e.clientX;my=e.clientY},{passive:true});
  const flies=[];
  function flyCount(){
    const max=Math.min(24,3+Math.floor((scrollY/(Math.max(1,document.documentElement.scrollHeight-innerHeight)))*21));
    return max;
  }
  function spawnFly(){
    const el=document.createElement("i");el.className="pixel-fly";
    flies.push({el,x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:0,vy:0,phase:Math.random()*Math.PI*2,orbit:70+Math.random()*220});
    flyLayer.appendChild(el);
  }
  function syncFlies(){
    const want=flyCount();
    while(flies.length<want)spawnFly();
    while(flies.length>want){const f=flies.pop();f.el.remove()}
  }
  syncFlies();addEventListener("scroll",syncFlies,{passive:true});
  let flyLast=performance.now();
  function flyTick(t){
    const dt=Math.min(34,t-flyLast);flyLast=t;
    const bottom=Math.max(1,document.documentElement.scrollHeight-innerHeight),p=scrollY/bottom;
    flies.forEach((f,i)=>{
      f.phase+=.0018*dt+(i%3)*.0005;
      const bottomMode=p>.88,rx=bottomMode?48+f.orbit*.35:100+f.orbit*.55,ry=bottomMode?34+f.orbit*.24:80+f.orbit*.42;
      const tx=mx+Math.cos(f.phase+i*.72)*rx+Math.sin(t*.001+i)*18;
      const ty=my+Math.sin(f.phase+i*.63)*ry;
      f.vx+=(tx-f.x)*.0028*dt;f.vy+=(ty-f.y)*.0028*dt;f.vx*=.88;f.vy*=.88;f.x+=f.vx;f.y+=f.vy;
      if(f.x<-40)f.x=innerWidth+20;if(f.x>innerWidth+40)f.x=-20;if(f.y<-40)f.y=innerHeight+20;if(f.y>innerHeight+40)f.y=-20;
      f.el.style.transform="translate3d("+f.x+"px,"+f.y+"px,0)";
    });
    scrollY0=scrollY;requestAnimationFrame(flyTick);
  }
  requestAnimationFrame(flyTick);

  function infectCard(card){
    if(card.dataset.smellReady)return;card.dataset.smellReady="1";
    const score=Number(card.dataset.odor||0),count=Math.min(10,Math.max(2,score+1));
    card.style.setProperty("--odor-power",String(score));
    const layer=document.createElement("span");layer.className="stink-layer";layer.setAttribute("aria-hidden","true");
    for(let i=0;i<count;i++){
      const w=document.createElement("i");w.className="stink-wisp";w.style.setProperty("--i",i);w.style.setProperty("--delay",(i*.23)+"s");w.style.setProperty("--drift",(i%2?"-":"")+(9+score*3+i*2)+"px");layer.appendChild(w);
    }
    card.appendChild(layer);if(score>=6)card.classList.add("contamination-max");
  }
  function infectAll(){$$(".card[data-odor]").forEach(infectCard)}
  const grid=$("#grid");if(grid)new MutationObserver(infectAll).observe(grid,{childList:true,subtree:true});infectAll();

  function playGag(){
    try{
      const c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();
      o.type="sawtooth";o.frequency.setValueAtTime(250,c.currentTime);o.frequency.exponentialRampToValueAtTime(78,c.currentTime+.42);
      g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.045,c.currentTime+.03);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.48);
      o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.5);setTimeout(()=>c.close(),700);
    }catch(e){}
  }
  function checkMaxOdor(){
    const max=$("[data-max-odor]");document.body.classList.toggle("max-odor-shake",!!max);
    if(max&&!max.dataset.gagged){max.dataset.gagged="1";document.body.classList.add("gag-flash");setTimeout(()=>document.body.classList.remove("gag-flash"),900);playGag()}
  }
  new MutationObserver(checkMaxOdor).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["data-max-odor"]});checkMaxOdor();

  const toolbar=$(".toolbar");
  if(toolbar&&!$("#sniffBtn")){
    const b=document.createElement("button");b.id="sniffBtn";b.className="random smell-btn";b.type="button";b.textContent="👃 闻一闻";toolbar.appendChild(b);
    b.onclick=()=>{
      const n=Number(localStorage.getItem(STORE.smell)||0)+1;localStorage.setItem(STORE.smell,String(n));
      const joke=jokes[Math.floor(Math.random()*jokes.length)];toast("💨 "+joke+"  ·  你已被熏晕 "+n+" 次","bad");
      document.body.classList.add("smell-hit");setTimeout(()=>document.body.classList.remove("smell-hit"),620);
    };
  }

  function currentTitle(n){
    let x={name:"空气闻闻员",desc:"先在门口看看，暂时还没正式下场。",next:10};
    for(const t of titles){if(n>=t[1])x={name:t[0],desc:t[2],next:null};else{x.next=t[1];break}}
    return x;
  }
  function ensureBadge(){
    const wrap=$(".hero .wrap");if(!wrap||$("#rankBadge"))return;
    const box=document.createElement("section");box.id="rankBadge";box.className="rank-badge";
    box.innerHTML='<div><span class="rank-kicker">🏅 馆藏身份</span><strong id="rankName">空气闻闻员</strong><small id="rankDesc"></small></div><div class="rank-actions"><span id="viewProgress"></span><button id="certificateBtn" class="random" type="button">📜 生成臭学家证书</button></div>';
    wrap.appendChild(box);$("#certificateBtn").onclick=makeCertificate;updateRank();
  }
  function markViewed(i){
    if(!Number.isInteger(i))return;const a=getJSON(STORE.views,[]);if(!a.includes(i)){a.push(i);setJSON(STORE.views,a)}updateRank();
  }
  function updateRank(){
    const n=getJSON(STORE.views,[]).length,t=currentTitle(n);const name=$("#rankName"),desc=$("#rankDesc"),prog=$("#viewProgress");
    if(name)name.textContent=t.name;if(desc)desc.textContent=t.desc;if(prog)prog.textContent=t.next?"还差 "+Math.max(0,t.next-n)+" 件解锁下一称号":"称号已达最高级";
  }
  ensureBadge();
  if(grid)grid.addEventListener("click",e=>{const card=e.target.closest?.(".card");if(card)markViewed(Number(card.dataset.i))});

  function makeCertificate(){
    const n=getJSON(STORE.views,[]).length,t=currentTitle(n),c=document.createElement("canvas"),W=1200,H=840,ctx=c.getContext("2d");
    c.width=W;c.height=H;const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,"#111914");g.addColorStop(1,"#272014");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="#b8ff4a";ctx.lineWidth=6;ctx.strokeRect(32,32,W-64,H-64);ctx.fillStyle="#c9ffa0";ctx.font="700 28px system-ui";ctx.fillText("INTERNET TRASH ARCHIVE",80,104);
    ctx.fillStyle="#fff";ctx.font="800 58px system-ui";ctx.fillText("互联网臭学家认证书",80,192);ctx.fillStyle="#d4d8df";ctx.font="400 30px system-ui";ctx.fillText("兹证明该观众已完成馆藏考古浏览",80,260);
    ctx.fillStyle="#b8ff4a";ctx.font="900 64px system-ui";ctx.fillText(t.name,80,370);ctx.fillStyle="#9ea6b2";ctx.font="400 28px system-ui";ctx.fillText("已浏览不同展品："+n+" 件",80,440);
    ctx.fillStyle="#fff";ctx.font="600 24px system-ui";ctx.fillText("互联网臭狗屎博物馆 · 馆长办公室",80,520);ctx.fillStyle="#7f8793";ctx.font="400 20px system-ui";ctx.fillText(new Date().toLocaleDateString("zh-CN"),80,578);
    const url=c.toDataURL("image/png");
    if(navigator.share){
      c.toBlob(blob=>{try{navigator.share({title:"互联网臭学家证书",text:"我在互联网臭狗屎博物馆拿到了「"+t.name+"」称号。",files:blob?[new File([blob],"臭学家证书.png",{type:"image/png"})]:[]}).catch(()=>openCert(url,t))}catch(e){openCert(url,t)}});
    }else openCert(url,t);
  }
  function openCert(url,t){
    const w=window.open("");if(!w){toast("浏览器拦截了证书窗口，请允许弹窗。","bad");return}
    w.document.write('<title>互联网臭学家证书</title><body style="margin:0;background:#111;display:grid;place-items:center;min-height:100vh"><img style="max-width:94vw;max-height:94vh" src="'+url+'" alt="'+t.name+'"></body>');
  }

  const random=$("#randomBtn");
  if(random)random.addEventListener("click",runFlush,true);
  function runFlush(){
    const old=$("#flushOverlay");if(old)old.remove();
    const o=document.createElement("div");o.id="flushOverlay";o.className="flush-overlay";
    o.innerHTML='<div class="toilet-wrap"><div class="toilet-lid"></div><div class="toilet-bowl">💩</div><div class="flush-swirl"></div></div><strong>正在冲走理智……</strong><small>下一坨正在管道里翻滚</small>';
    document.body.appendChild(o);setTimeout(()=>o.classList.add("done"),20);setTimeout(()=>o.remove(),1250);playFlush();
  }
  function playFlush(){
    try{
      const c=new (window.AudioContext||window.webkitAudioContext)(),gain=c.createGain(),o=c.createOscillator(),buf=c.createBuffer(1,c.sampleRate*.65,c.sampleRate),d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);
      const noise=c.createBufferSource(),ng=c.createGain(),lp=c.createBiquadFilter();noise.buffer=buf;lp.type="lowpass";lp.frequency.setValueAtTime(420,c.currentTime);lp.frequency.exponentialRampToValueAtTime(90,c.currentTime+.65);
      ng.gain.setValueAtTime(.0001,c.currentTime);ng.gain.exponentialRampToValueAtTime(.18,c.currentTime+.04);ng.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.7);noise.connect(lp);lp.connect(ng);ng.connect(c.destination);
      o.type="sine";o.frequency.setValueAtTime(210,c.currentTime);o.frequency.exponentialRampToValueAtTime(46,c.currentTime+.75);gain.gain.setValueAtTime(.0001,c.currentTime);gain.gain.exponentialRampToValueAtTime(.055,c.currentTime+.06);gain.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.8);o.connect(gain);gain.connect(c.destination);noise.start();o.start();o.stop(c.currentTime+.82);setTimeout(()=>{try{c.close()}catch(e){}},1200);
    }catch(e){}
  }

  function dailyQuote(){
    const articles=$$(".chaos-grid article");if(!articles.length)return;const day=Math.floor(Date.now()/86400000),idx=day%articles.length;
    articles.forEach((a,i)=>a.classList.toggle("today-quote",i===idx));
    const head=$(".chaos-head p");if(head)head.textContent="今日臭语录 · "+(articles[idx]?.querySelector("b")?.textContent||"馆藏污染")+" · 每天自动轮换，明天再臭一条。";
  }
  dailyQuote();
  const note=$(".notice");if(note&&!$("#chaosNoticeExtra")){const x=document.createElement("span");x.id="chaosNoticeExtra";x.textContent=" 👃 点击“闻一闻”会累计熏晕次数；浏览不同展品会升级馆藏称号。";note.appendChild(x)}
})();