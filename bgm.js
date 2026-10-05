(function(){
  "use strict";
  const root=document.getElementById("bgmPlayer");
  if(!root)return;
  const toggle=root.querySelector("#bgmToggle"),status=root.querySelector("#bgmStatus"),volume=root.querySelector("#bgmVolume");
  let ctx=null,master=null,timer=null,playing=false,step=0;
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  function ensureAudio(){
    if(ctx)return true;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC){status.textContent="浏览器不支持 Web Audio";return false;}
    ctx=new AC();
    master=ctx.createGain();
    master.gain.value=Number(volume.value||0.18);
    const comp=ctx.createDynamicsCompressor();
    comp.threshold.value=-26; comp.knee.value=18; comp.ratio.value=9; comp.attack.value=.004; comp.release.value=.16;
    master.connect(comp).connect(ctx.destination);
    return true;
  }
  function tone(freq,duration,type,gain,when,detune){
    const osc=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
    osc.type=type||"sawtooth"; osc.frequency.setValueAtTime(freq,when); if(detune)osc.detune.value=detune;
    f.type="lowpass"; f.frequency.setValueAtTime(clamp(freq*5,260,2600),when);
    g.gain.setValueAtTime(.0001,when); g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),when+.012); g.gain.exponentialRampToValueAtTime(.0001,when+duration);
    osc.connect(f).connect(g).connect(master); osc.start(when); osc.stop(when+duration+.03);
  }
  function noise(duration,gain,when){
    const buffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,.6);
    const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();
    src.buffer=buffer; filter.type="bandpass"; filter.frequency.value=850; filter.Q.value=.7;
    g.gain.setValueAtTime(gain,when); g.gain.exponentialRampToValueAtTime(.0001,when+duration);
    src.connect(filter).connect(g).connect(master); src.start(when); src.stop(when+duration+.02);
  }
  function tick(){
    if(!playing||!ctx)return;
    const now=ctx.currentTime+.02, bass=[58.27,58.27,65.41,51.91,58.27,43.65,65.41,55], f=bass[step%bass.length];
    tone(f,.38,"sawtooth",.075,now,step%2?7:-5);
    if(step%2===0)tone(f*2,.12,"square",.028,now+.08,-12);
    if(step%4===3)noise(.16,.045,now+.14);
    if(step%8===6)tone(f*.5,.75,"triangle",.035,now+.02,21);
    if(step%16===15)tone(740,.09,"square",.018,now+.22,0);
    step++;
  }
  async function start(){
    if(!ensureAudio())return;
    if(ctx.state==="suspended")await ctx.resume();
    if(playing)return;
    playing=true; step=0; status.textContent="正在播放 · SHIT SYMPHONY 01"; toggle.textContent="⏸️ 停止大便交响曲";
    tick(); timer=setInterval(tick,430);
  }
  function stop(){
    playing=false; if(timer)clearInterval(timer); timer=null;
    status.textContent="已暂停 · 安静得令人不安"; toggle.textContent="💩 播放大便交响曲";
  }
  toggle.addEventListener("click",()=>playing?stop():start());
  volume.addEventListener("input",()=>{if(master)master.gain.value=Number(volume.value);});
  status.textContent="点击按钮后开始 · 原创 Web Audio";
})();