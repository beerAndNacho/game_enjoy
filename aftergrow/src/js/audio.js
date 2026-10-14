window.AG=window.AG||{};
AG.Audio=(()=>{
  let ctx=null,enabled=AG.Store.data.settings.sound,last=0,beat=0;
  function init(){try{ctx ||= new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume().catch(()=>{});return true;}catch(_){return false;}}
  function tone(f,d=.12,type='sine',v=.02,end=f){
    if(!enabled||!init())return;
    const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+d);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+d+.03);o.onended=()=>{o.disconnect();g.disconnect();};
  }
  function sfx(name){
    if(name==='shot'){const now=performance.now();if(now-last<110)return;last=now;tone(470,.06,'triangle',.009,240);}
    if(name==='hit')tone(100,.16,'triangle',.04,45);
    if(name==='dash')tone(260,.18,'sine',.035,65);
    if(name==='xp')tone(1100+Math.random()*200,.045,'sine',.007);
    if(name==='upgrade'){tone(392,.3,'sine',.026);tone(587,.4,'sine',.019);tone(784,.5,'sine',.016);}
    if(name==='skill'){tone(196,.5,'sine',.04,590);tone(392,.6,'triangle',.012);}
    if(name==='node'){tone(293,.6,'sine',.04);tone(440,.7,'sine',.024);}
    if(name==='boss')tone(65,.8,'triangle',.04,120);
    if(name==='click')tone(700,.065,'sine',.012,560);
  }
  function ambience(dt){
    if(!enabled)return;beat-=dt;if(beat>0)return;beat=1.65;
    const notes=[146.83,196,220,293.66,329.63,392];
    tone(notes[Math.floor(Math.random()*notes.length)],1.5,'sine',.009);
  }
  return{get enabled(){return enabled;},init,tone,sfx,ambience,toggle(){enabled=!enabled;if(enabled&&!init())enabled=false;AG.Store.data.settings.sound=enabled;AG.Store.save();if(enabled)sfx('upgrade');return enabled;}};
})();
