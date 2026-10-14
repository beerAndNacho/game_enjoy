/* Deterministic-layout, fixed-step Canvas simulation. DOM/UI lives in app.js. */
window.AG=window.AG||{};
AG.Engine=class OfficeEngine {
  constructor(canvas,onEvent=()=>{}){
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});
    if(!this.ctx)throw new Error('This browser does not provide Canvas 2D.');
    this.onEvent=onEvent;this.world={w:2160,h:1560};this.state='idle';this.width=1;this.height=1;
    this.dpr=1;this.input={x:0,y:0};this.time=0;this.ambient=0;this.manual=false;
    this.camera={x:1080,y:780};this.motion=AG.Store.data.settings.motion;this.floor=null;
    this.last=0;this.running=true;this.raf=0;
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);
    this.frame=this.frame.bind(this);this.raf=requestAnimationFrame(this.frame);
  }
  clamp(n,a,b){return Math.max(a,Math.min(b,n));}
  distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
  random(a,b){return a+Math.random()*(b-a);}
  emit(type,payload={}){this.onEvent(type,payload);}
  resize(){
    const r=this.canvas.getBoundingClientRect();if(r.width<1||r.height<1)return;
    this.width=r.width;this.height=r.height;this.dpr=Math.min(devicePixelRatio||1,2);
    this.canvas.width=Math.round(this.width*this.dpr);this.canvas.height=Math.round(this.height*this.dpr);
  }
  start(character,chapter){
    this.character=character;this.chapter=chapter;this.chapterIndex=AG.Content.chapters.indexOf(chapter);
    this.time=0;this.kills=0;this.nodesRestored=0;this.wave=0;this.nextId=0;this.storyDone=false;this.choice=null;this.ended=false;
    this.enemies=[];this.bullets=[];this.enemyShots=[];this.gems=[];this.particles=[];this.rings=[];this.floaters=[];this.hazards=[];this.slashes=[];this.beams=[];
    this.levels=Object.fromEntries(AG.Content.modules.map(m=>[m.id,0]));this.evolved={dawn:false,hive:false,eden:false};
    this.bonus={power:0,speed:0,xp:0,armor:0,dash:0};this.grid=new Map();this.choices=[];this.rerolls=1;
    const hp=character.hp+AG.Store.data.research.vitality*10;
    this.player={x:1080,y:780,r:16,hp,maxHp:hp,xp:0,nextXp:5,level:1,invuln:1.6,dashCd:0,dashTime:0,dx:1,dy:0,skillCd:0,buff:0,freeze:0,aim:0,moving:false,stride:0,shots:0};
    this.nodes=[
      {x:1230,y:800,id:'A',charge:0,cooldown:0},
      {x:750,y:530,id:'B',charge:0,cooldown:0},
      {x:1350,y:1110,id:'C',charge:0,cooldown:0}
    ];
    this.puddles=chapter.id==='rain'?[{x:980,y:640,r:120},{x:1280,y:990,r:110},{x:640,y:1010,r:115},{x:1570,y:510,r:115}]:[];
    this.camera={x:1080,y:780};this.spawnClock=.85;this.fireClock=.15;this.droneClock=.65;this.pulseClock=3;this.thornClock=.7;
    this.boss=null;this.bossDefeated=false;this.bossSpawned=false;this.shake=0;
    this.input={x:0,y:0};this.floor=this.makeFloor();this.resize();this.state='playing';
    for(let i=0;i<5;i++){const e=this.spawn(i===4?'runner':'spore');const a=i*Math.PI*2/5;e.x=1080+Math.cos(a)*this.random(270,400);e.y=780+Math.sin(a)*this.random(260,380);}
    this.emit('start');this.emit('toast',{text:'업무 포인트를 모으세요. 커피 머신에서 체력과 경험치를 회복하세요.'});
  }
  power(){return (1+this.levels.power*.18+this.bonus.power+AG.Store.data.research.focus*.05)*(this.player.buff>0&&this.character.id==='rook'?1.3:1);}
  setInput(x,y){const l=Math.hypot(x,y);this.input={x:l>1?x/l:x,y:l>1?y/l:y};}
  pause(){if(this.state==='playing'){this.state='paused';this.setInput(0,0);this.emit('pause');}}
  resume(){if(['paused','story'].includes(this.state)){this.state='playing';this.setInput(0,0);}}
  dash(){
    if(this.state!=='playing'||this.player.dashCd>0)return false;
    const p=this.player,len=Math.hypot(this.input.x,this.input.y);
    if(len>.08){p.dx=this.input.x/len;p.dy=this.input.y/len;}
    p.dashTime=.19;p.dashCd=Math.max(1.3,3-this.levels.speed*.3-this.bonus.dash);p.invuln=Math.max(p.invuln,.38);
    this.burst(p.x,p.y,this.character.color,14,150);AG.Audio.sfx('dash');return true;
  }
  skill(){
    if(this.state!=='playing'||this.player.skillCd>0)return false;
    const p=this.player;p.skillCd=this.character.cooldown;
    if(this.character.id==='rook'){p.buff=6;this.ring(p.x,p.y,130,this.character.color,.5);}
    if(this.character.id==='lumen'){this.area(p,300,100+this.levels.weapon*15,200);this.ring(p.x,p.y,300,'#ff77a6',.8);this.enemyShots=[];}
    if(this.character.id==='briar'){this.heal(18);p.invuln=4;this.area(p,210,75,240);this.ring(p.x,p.y,220,'#79e5e3',.7);}
    if(this.character.id==='io'){p.freeze=5;for(const e of this.enemies)if(!e.dead&&this.distance(p,e)<650)this.hit(e,45*this.power(),0);this.ring(p.x,p.y,650,'#9da6ff',1);}
    this.burst(p.x,p.y,this.character.color,28,180);this.emit('toast',{text:this.character.skill+' · '+this.character.skillDesc});AG.Audio.sfx('skill');return true;
  }
  heal(n){if(this.player)this.player.hp=Math.min(this.player.maxHp,this.player.hp+n);}
  damage(n,origin){
    if(this.player.invuln>0||this.state!=='playing')return;
    const amount=Math.max(1,n-this.character.armor-this.bonus.armor),p=this.player;
    p.hp=Math.max(0,p.hp-amount);p.invuln=.75;this.shake=this.motion?5:0;
    this.burst(p.x,p.y,'#ff778e',13,135);this.float(p.x,p.y-40,'−'+Math.round(amount),'#ffbbae');AG.Audio.sfx('hit');
    if(origin){const a=Math.atan2(p.y-origin.y,p.x-origin.x);p.x=this.clamp(p.x+Math.cos(a)*12,25,2135);p.y=this.clamp(p.y+Math.sin(a)*12,25,1535);}
    if(p.hp<=0)this.finish(false);
  }
  spawn(type){
    const p=this.player,t=this.time,a=Math.random()*Math.PI*2,rad=this.clamp(Math.max(this.width,this.height)*.52,350,650);
    let x=this.clamp(p.x+Math.cos(a)*rad,35,2125),y=this.clamp(p.y+Math.sin(a)*rad,35,1525);
    if(Math.hypot(x-p.x,y-p.y)<230){x=this.clamp(p.x-Math.cos(a)*rad,35,2125);y=this.clamp(p.y-Math.sin(a)*rad,35,1525);}
    if(!type){
      const r=Math.random();
      type=t>75&&r<.13?'brute':t>40&&r<.27?'shooter':t>25&&r<.40?'beetle':t>15&&r<.62?'runner':'spore';
    }
    const stats={
      spore:{hp:26+t*.11,r:17,speed:47,damage:10,xp:1},
      runner:{hp:23+t*.1,r:13,speed:95,damage:9,xp:1},
      brute:{hp:120+t*.24,r:27,speed:34,damage:17,xp:4},
      shooter:{hp:51+t*.14,r:18,speed:35,damage:10,xp:2},
      beetle:{hp:62+t*.12,r:20,speed:62,damage:13,xp:2},
      boss:{hp:1350*this.chapter.difficulty,r:51,speed:32,damage:22,xp:24}
    }[type]||{hp:26,r:17,speed:47,damage:10,xp:1};
    const e={...stats,id:++this.nextId,type,x,y,hp:stats.hp*(type==='boss'?1:this.chapter.difficulty),maxHp:stats.hp*(type==='boss'?1:this.chapter.difficulty),phase:Math.random()*6.28,hit:0,dead:false,kx:0,ky:0,cd:type==='shooter'?this.random(1,3):2.5,orbCd:0,slow:0,charge:0,chargeAngle:0,windup:0};
    this.enemies.push(e);return e;
  }
  hit(e,damage,force=35,origin=this.player,allowCrit=true){
    if(e.dead)return;
    const crit=allowCrit&&Math.random()<this.levels.crit*.12;
    if(crit)damage*=1.8;
    e.hp-=damage;e.hit=.11;
    const a=Math.atan2(e.y-origin.y,e.x-origin.x);e.kx+=Math.cos(a)*force;e.ky+=Math.sin(a)*force;
    if(crit||e.type==='boss'||Math.random()<.25)this.float(e.x,e.y-e.r-20,''+Math.round(damage),crit?'#ffd356':'#dfe8ff',crit);
    if(e.hp<=0){
      e.dead=true;this.kills++;
      this.burst(e.x,e.y,e.type==='runner'?'#ef71a1':'#ffd35f',e.type==='boss'?60:8,e.type==='boss'?230:80);
      this.gem(e.x,e.y,e.xp);
      if(Math.random()<.05)this.gem(e.x+11,e.y+8,0,true);
      if(e.type==='boss'){this.bossDefeated=true;this.ring(e.x,e.y,360,'#ffdf63',1.1);this.emit('toast',{text:this.chapter.boss+' 처리 완료! 퇴근 시간까지 버티세요.'});AG.Audio.sfx('upgrade');}
    }
  }
  area(origin,r,damage,force=70,slow=0){
    for(const e of this.enemies)if(!e.dead&&this.distance(origin,e)<r+e.r){this.hit(e,damage*this.power(),force,origin);e.slow=Math.max(e.slow,slow);}
  }
  gem(x,y,value,health=false){
    if(this.gems.length>400&&!health){const g=this.gems.find(v=>!v.health);if(g){g.value+=value;return;}}
    this.gems.push({x,y,value,health,phase:Math.random()*6.28,taken:false,magnetized:false});
  }
  gainXp(n){this.player.xp+=n*(this.character.xp+this.levels.memory*.15+this.bonus.xp);}
  nearest(x,y,range=750,except=new Set()){
    let target=null,best=range*range;
    for(const e of this.enemies){if(e.dead||except.has(e.id))continue;const d=(e.x-x)**2+(e.y-y)**2;if(d<best){target=e;best=d;}}
    return target;
  }
  shoot(x,y,target,damage,drone=false,angleOffset=0){
    const a=Math.atan2(target.y-y,target.x-x)+angleOffset,speed=drone?500:650;
    this.bullets.push({x,y,px:x,py:y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:1.3,damage:damage*this.power(),drone,r:drone?3:4.5,dead:false,pierce:!drone&&this.evolved.dawn&&this.character.style==='seed'?3:1,hitIds:new Set(),homing:!drone&&this.character.style==='orbit'});
  }
  attack(){
    const p=this.player,target=this.nearest(p.x,p.y);
    if(!target){this.fireClock=.1;return;}
    const angle=Math.atan2(target.y-p.y,target.x-p.x),w=1+this.levels.weapon*.25;
    p.aim=angle;p.shots++;
    if(this.character.style==='seed'){
      const count=1+this.levels.spread+(this.evolved.dawn?2:0);
      const used=new Set();
      for(let i=0;i<count;i++){const aim=this.nearest(p.x,p.y,730,used)||target;used.add(aim.id);this.shoot(p.x+Math.cos(angle)*18,p.y+Math.sin(angle)*18,aim,25*w,false,aim===target&&i>0?(i%2?.07:-.07):0);}
    }
    if(this.character.style==='orbit')this.shoot(p.x,p.y,target,21*w);
    if(this.character.style==='slash'){
      const range=153+this.levels.spread*24+(this.evolved.dawn?35:0);
      for(const e of this.enemies)if(!e.dead&&this.distance(p,e)<range+e.r){
        const da=Math.abs(Math.atan2(Math.sin(Math.atan2(e.y-p.y,e.x-p.x)-angle),Math.cos(Math.atan2(e.y-p.y,e.x-p.x)-angle)));
        if(this.evolved.dawn||da<1.3)this.hit(e,43*w*this.power(),120);
      }
      this.slashes.push({x:p.x,y:p.y,angle,r:range,life:.25,max:.25,full:this.evolved.dawn});
    }
    if(this.character.style==='chain'){
      const count=(this.evolved.dawn?6:3)+this.levels.spread,used=new Set();
      let from=p,to=target;
      for(let i=0;i<count&&to;i++){
        this.beams.push({x:from.x,y:from.y,tx:to.x,ty:to.y,life:.22,max:.22});
        this.hit(to,27*w*(this.evolved.dawn?1.25:1)*this.power(),18,from);used.add(to.id);from=to;to=this.nearest(to.x,to.y,210,used);
      }
    }
    const base={seed:.5,orbit:.64,slash:.67,chain:.86}[this.character.style];
    this.fireClock=base*Math.pow(.87,this.levels.rapid)*(p.buff>0&&this.character.id==='rook'?.45:1);AG.Audio.sfx('shot');
  }
  buildGrid(){
    this.grid.clear();
    for(const e of this.enemies)if(!e.dead){const key=Math.floor(e.x/100)+','+Math.floor(e.y/100);if(!this.grid.has(key))this.grid.set(key,[]);this.grid.get(key).push(e);}
  }
  nearby(x,y,cb){
    const cx=Math.floor(x/100),cy=Math.floor(y/100);
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const cell=this.grid.get((cx+i)+','+(cy+j));if(cell)for(const e of cell)cb(e);}
  }
  activateNode(n){
    n.cooldown=23;n.charge=0;this.nodesRestored++;
    const heal=26+(this.character.id==='rook'?10:0);this.heal(heal);this.gainXp(5);
    this.area(n,260,100,220);this.ring(n.x,n.y,260,'#d7e5a3',.9);this.burst(n.x,n.y,'#c5dfba',33,200);
    for(const g of this.gems)if(this.distance(n,g)<380)g.magnetized=true;
    this.emit('toast',{text:'커피 머신 '+n.id+' 가동 · 체력 +'+heal+' · 카페인 충격파'});AG.Audio.sfx('node');
  }
  options(exclude=[]){
    const evolves=AG.Content.evolutions.filter(e=>!this.evolved[e.id]&&Object.entries(e.needs).every(([id,lv])=>this.levels[id]>=lv));
    let pool=AG.Content.modules.filter(m=>this.levels[m.id]<m.max);
    const fresh=pool.filter(m=>!exclude.includes(m.id));if(fresh.length>=3)pool=fresh;
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    return [...evolves,...pool].slice(0,3);
  }
  checkLevel(){
    const p=this.player;if(this.state!=='playing'||p.xp<p.nextXp)return;
    p.xp-=p.nextXp;p.level++;p.nextXp=5+(p.level-1)*3;this.heal(6);
    this.choices=this.options();if(!this.choices.length){this.heal(30);return;}
    this.state='upgrade';this.setInput(0,0);this.emit('upgrade',{choices:this.choices});AG.Audio.sfx('upgrade');
  }
  reroll(){
    if(this.state!=='upgrade'||!this.rerolls)return false;
    this.rerolls--;this.choices=this.options(this.choices.map(m=>m.id));this.emit('upgrade',{choices:this.choices});return true;
  }
  choose(index){
    if(this.state!=='upgrade'||!this.choices[index])return false;
    const m=this.choices[index];
    if(m.needs){this.evolved[m.id]=true;this.emit('toast',{text:'무기 진화 · '+m.name});}
    else {this.levels[m.id]++;if(m.id==='hull'){this.player.maxHp+=20;this.heal(30);}if(m.id==='magnet')this.heal(12);if(m.id==='pulse')this.pulseClock=.35;this.emit('toast',{text:m.name+' · '+this.levels[m.id]+'단계'});}
    this.choices=[];this.state='playing';this.emit('modules');AG.Audio.sfx('upgrade');return true;
  }
  applyStory(index){
    if(this.state!=='story'||this.choice)return false;
    const choice=this.chapter.event.choices[index];if(!choice)return false;
    this.choice=choice;
    if(choice.effect==='care'){this.player.maxHp+=20;this.heal(30);}
    if(choice.effect==='signal')this.bonus.power+=.18;
    if(choice.effect==='memory'){this.bonus.xp+=.25;this.heal(15);}
    if(choice.effect==='wind'){this.bonus.speed+=.12;this.bonus.dash+=.5;}
    if(choice.effect==='shelter'){this.bonus.armor+=2;this.heal(35);}
    if(choice.effect==='bloom'){this.bonus.power+=.22;this.bonus.xp+=.15;}
    AG.Audio.sfx('node');return true;
  }
  finish(win){
    if(this.ended)return;this.ended=true;this.state='result';this.input={x:0,y:0};
    const result={win,time:this.time,kills:this.kills,nodes:this.nodesRestored,level:this.player.level,character:this.character,chapter:this.chapter,choice:this.choice,evolved:{...this.evolved}};
    this.emit('result',result);
  }
  enemyAttack(e,dt){
    const p=this.player;e.cd-=dt;
    if(e.type==='shooter'&&e.cd<=0){this.enemyBullet(e,Math.atan2(p.y-e.y,p.x-e.x),120,10);e.cd=3.1;}
    if(e.type!=='boss')return;
    if(e.windup>0){e.windup-=dt;if(e.windup<=0)e.charge=.7;}
    if(e.charge>0){e.charge-=dt;e.x+=Math.cos(e.chargeAngle)*390*dt;e.y+=Math.sin(e.chargeAngle)*390*dt;}
    if(e.cd>0)return;
    if(this.chapterIndex===0||this.chapterIndex===2){
      for(let i=0;i<3;i++)this.hazards.push({x:this.clamp(p.x+this.random(-130,130),40,2120),y:this.clamp(p.y+this.random(-105,105),40,1520),r:40,life:2.5,warning:1.05});
    }
    if(this.chapterIndex===1||this.chapterIndex===2){
      const count=this.chapterIndex===1?10:8;
      for(let i=0;i<count;i++)this.enemyBullet(e,i*Math.PI*2/count+this.time*.3,105,12);
    }
    if(this.chapterIndex===2){e.windup=.9;e.chargeAngle=Math.atan2(p.y-e.y,p.x-e.x);}
    e.cd=this.chapterIndex===2?4.2:3.6;
  }
  enemyBullet(e,a,speed,damage){if(this.enemyShots.length>150)return;this.enemyShots.push({x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:7,r:6,damage,dead:false});}
  update(dt){
    if(this.state!=='playing')return;
    this.time+=dt;const p=this.player,u=this.input;
    for(const key of ['invuln','dashCd','dashTime','skillCd','buff','freeze'])p[key]=Math.max(0,p[key]-dt);
    p.moving=Math.hypot(u.x,u.y)>.08;
    if(p.dashTime>0){p.x+=p.dx*790*dt;p.y+=p.dy*790*dt;if(this.motion)this.burst(p.x,p.y,this.character.color,1,25);}
    else{
      let speed=this.character.speed*(1+this.levels.speed*.1+this.bonus.speed);
      if(this.puddles.some(q=>this.distance(p,q)<q.r))speed*=.68;
      p.x+=u.x*speed*dt;p.y+=u.y*speed*dt;
      if(p.moving){const len=Math.hypot(u.x,u.y);p.dx=u.x/len;p.dy=u.y/len;}
    }
    p.x=this.clamp(p.x,26,2134);p.y=this.clamp(p.y,26,1534);if(p.moving)p.stride+=dt*15;
    this.heal((this.levels.hull*.3+(this.evolved.hive?.6:0))*dt);
    const cx=this.clamp(p.x,Math.min(this.width/2,1080),Math.max(1080,2160-this.width/2)),cy=this.clamp(p.y,Math.min(this.height/2,780),Math.max(780,1560-this.height/2));
    this.camera.x+=(cx-this.camera.x)*Math.min(1,dt*9);this.camera.y+=(cy-this.camera.y)*Math.min(1,dt*9);this.shake=Math.max(0,this.shake-dt*20);
    this.spawnClock-=dt;
    if(this.spawnClock<=0&&this.enemies.length<145&&this.time<this.chapter.duration){
      const count=this.time<24?1:this.time<85?2:this.time<135?3:4;
      for(let i=0;i<count;i++)this.spawn();this.spawnClock=Math.max(.42,1.05-this.time*.0032);
    }
    const wave=this.time>=this.chapter.bossAt?3:this.time>=100?2:this.time>=35?1:0;
    if(wave!==this.wave){this.wave=wave;if(wave<3)this.emit('toast',{text:wave===1?'업무 알림이 폭주합니다. E 스킬로 돌파하세요.':'최종 관리자가 접근합니다. 커피 머신에서 회복하세요.'});}
    if(!this.bossSpawned&&this.time>=this.chapter.bossAt){this.bossSpawned=true;this.boss=this.spawn('boss');this.emit('boss');AG.Audio.sfx('boss');}
    this.fireClock-=dt;if(this.fireClock<=0)this.attack();
    const drones=this.levels.drone*(this.evolved.hive?2:1);
    this.droneClock-=dt;
    if(drones&&this.droneClock<=0){
      for(let i=0;i<drones;i++){const a=this.time*1.6+i*Math.PI*2/drones,x=p.x+Math.cos(a)*68,y=p.y+Math.sin(a)*48,target=this.nearest(x,y,590);if(target)this.shoot(x,y,target,18,true);}
      this.droneClock=this.evolved.hive?.49:.81;
    }
    if(this.character.style==='orbit'){
      const count=2+this.levels.spread+(this.evolved.dawn?3:0);
      for(const e of this.enemies)if(!e.dead){
        e.orbCd=Math.max(0,e.orbCd-dt);if(e.orbCd>0)continue;
        for(let i=0;i<count;i++){const a=this.time*2.4+i*Math.PI*2/count,r=this.evolved.dawn?(i%2?126:85):86,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;
          if(Math.hypot(e.x-x,e.y-y)<e.r+16){this.hit(e,(21+this.levels.weapon*7)*this.power(),35,{x,y});e.orbCd=.46;break;}
        }
      }
    }
    this.pulseClock-=dt;
    if(this.levels.pulse&&this.pulseClock<=0){
      const r=109+this.levels.pulse*21+(this.evolved.eden?60:0);
      this.area(p,r,(24+this.levels.pulse*14)*(this.evolved.eden?1.5:1),145,this.evolved.eden?2:0);
      this.ring(p.x,p.y,r,this.evolved.eden?'#e0e7b0':'#b1d8c1',.55);this.pulseClock=4.5-this.levels.pulse*.3;
    }
    this.thornClock-=dt;
    if(this.levels.thorn&&this.thornClock<=0){this.area(p,51,13+this.levels.thorn*11,70);this.thornClock=.7;this.ring(p.x,p.y,55,'#c8b69a',.3);}
    for(const n of this.nodes){
      if(n.cooldown>0){n.cooldown=Math.max(0,n.cooldown-dt);continue;}
      if(this.distance(p,n)<63){n.charge+=dt;if(n.charge>=2)this.activateNode(n);}
      else n.charge=Math.max(0,n.charge-dt*.7);
    }
    this.buildGrid();
    for(const e of this.enemies){
      if(e.dead)continue;e.hit=Math.max(0,e.hit-dt);e.slow=Math.max(0,e.slow-dt);
      const a=Math.atan2(p.y-e.y,p.x-e.x),distance=this.distance(p,e);
      let speed=e.speed*(e.slow>0?.5:1)*(p.freeze>0?0:1),vx=Math.cos(a)*speed,vy=Math.sin(a)*speed;
      if(e.type==='shooter'&&distance<260){vx*=distance<170?-.7:0;vy*=distance<170?-.7:0;}
      if(e.windup>0||e.charge>0){vx=0;vy=0;}
      if(p.freeze<=0)this.nearby(e.x,e.y,other=>{
        if(other===e||other.dead)return;
        const dx=e.x-other.x,dy=e.y-other.y,dsq=dx*dx+dy*dy,r=(e.r+other.r)*.85;
        if(dsq>.001&&dsq<r*r){const d=Math.sqrt(dsq),f=(r-d)*1.9;vx+=dx/d*f;vy+=dy/d*f;}
      });
      e.x=this.clamp(e.x+(vx+e.kx)*dt,23,2137);e.y=this.clamp(e.y+(vy+e.ky)*dt,23,1537);
      e.kx*=Math.max(0,1-dt*7);e.ky*=Math.max(0,1-dt*7);
      if(p.freeze<=0)this.enemyAttack(e,dt);
      if(this.distance(e,p)<e.r+p.r-4)this.damage(e.damage,e);
      if(this.state!=='playing')return;
    }
    this.buildGrid();
    for(const b of this.bullets){
      b.px=b.x;b.py=b.y;
      if(b.homing){const target=this.nearest(b.x,b.y,180,b.hitIds);if(target){const a=Math.atan2(target.y-b.y,target.x-b.x);b.vx+=(Math.cos(a)*560-b.vx)*dt*4;b.vy+=(Math.sin(a)*560-b.vy)*dt*4;}}
      b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0){b.dead=true;continue;}
      this.nearby(b.x,b.y,e=>{
        if(b.dead||e.dead||b.hitIds.has(e.id))return;
        const dx=b.x-b.px,dy=b.y-b.py,den=dx*dx+dy*dy,t=den?this.clamp(((e.x-b.px)*dx+(e.y-b.py)*dy)/den,0,1):0;
        if((e.x-b.px-dx*t)**2+(e.y-b.py-dy*t)**2<(e.r+b.r)**2){
          this.hit(e,b.damage,35,{x:b.px,y:b.py});b.hitIds.add(e.id);b.pierce--;if(b.pierce<=0)b.dead=true;
        }
      });
    }
    for(const b of this.enemyShots){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(this.distance(p,b)<p.r+b.r){this.damage(b.damage,b);b.dead=true;}if(this.state!=='playing')return;}
    for(const g of this.gems){
      const d=this.distance(p,g),r=78+this.levels.magnet*40+AG.Store.data.research.gather*12;
      if(d<r||g.magnetized){g.magnetized=true;const step=Math.min(d,480*dt);if(d>.001){g.x+=(p.x-g.x)/d*step;g.y+=(p.y-g.y)/d*step;}}
      if(this.distance(p,g)<20){g.taken=true;if(g.health){this.heal(15);this.float(p.x,p.y-35,'+15','#b8ddb4');}else this.gainXp(g.value);if(Math.random()<.3)AG.Audio.sfx('xp');}
    }
    for(const h of this.hazards){h.life-=dt;h.warning-=dt;if(h.warning<=0&&this.distance(p,h)<h.r+p.r-5)this.damage(14,h);if(this.state!=='playing')return;}
    this.enemies=this.enemies.filter(e=>!e.dead);this.bullets=this.bullets.filter(b=>!b.dead);this.enemyShots=this.enemyShots.filter(b=>!b.dead&&b.life>0);this.gems=this.gems.filter(g=>!g.taken);this.hazards=this.hazards.filter(h=>h.life>0);
    this.effects(dt);AG.Audio.ambience(dt);
    if(this.time>=this.chapter.duration&&this.bossDefeated){this.finish(true);return;}
    if(!this.storyDone&&this.time>=65){this.storyDone=true;this.state='story';this.setInput(0,0);this.emit('story');return;}
    this.checkLevel();
  }
  burst(x,y,color,n=8,force=90){
    if(!this.motion)n=Math.min(n,4);
    for(let i=0;i<n&&this.particles.length<360;i++){const a=Math.random()*6.28,s=this.random(force*.2,force),life=this.random(.22,.7);this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life,max:life,size:this.random(1.5,3.8),color,angle:a});}
  }
  ring(x,y,r,color,life=.5){this.rings.push({x,y,r,max:life,life,color});}
  float(x,y,text,color,big=false){if(this.floaters.length<65)this.floaters.push({x,y,text,color,life:.7,big});}
  effects(dt){
    for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-dt*2;p.vy*=1-dt*2;}
    this.particles=this.particles.filter(p=>p.life>0);
    for(const a of [this.rings,this.slashes,this.beams]){for(const e of a)e.life-=dt;}
    this.rings=this.rings.filter(e=>e.life>0);this.slashes=this.slashes.filter(e=>e.life>0);this.beams=this.beams.filter(e=>e.life>0);
    for(const f of this.floaters){f.life-=dt;f.y-=dt*28;}this.floaters=this.floaters.filter(f=>f.life>0);
  }
  makeFloor(){
    const c=document.createElement('canvas');c.width=2160;c.height=1560;const g=c.getContext('2d'),ch=this.chapter;
    let seed=28112+this.chapterIndex*17;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const accent=ch.accent;
    g.fillStyle=ch.floor;g.fillRect(0,0,2160,1560);
    // Fluorescent ceiling tiles and thick comic-book panel borders.
    for(let y=0;y<1560;y+=96)for(let x=0;x<2160;x+=96){
      g.fillStyle=(Math.floor(x/96)+Math.floor(y/96))%2?'#ffffff04':'#00000009';g.fillRect(x+2,y+2,91,91);
      g.strokeStyle='#11172d55';g.lineWidth=2;g.strokeRect(x+.5,y+.5,95,95);
    }
    // Long illuminated hallway running through the arena.
    g.fillStyle='#708eb011';g.fillRect(70,670,2020,225);
    g.strokeStyle=accent+'33';g.lineWidth=8;g.strokeRect(66,666,2028,233);
    g.strokeStyle='#0d1537';g.lineWidth=32;g.strokeRect(14,14,2132,1532);
    g.strokeStyle=accent+'7a';g.lineWidth=5;g.strokeRect(29,29,2100,1501);
    const round=(x,y,w,h,r,fill,outline='#10152d',lw=5)=>{
      g.beginPath();g.roundRect(x,y,w,h,r);g.fillStyle=fill;g.fill();if(outline){g.lineWidth=lw;g.strokeStyle=outline;g.stroke();}
    };
    this.decor=[];
    for(let y=175;y<1500;y+=325)for(let x=194;x<2000;x+=352){
      if(Math.hypot(x-1080,y-780)<265||this.nodes.some(n=>Math.hypot(n.x-x,n.y-y)<150))continue;
      g.save();g.translate(x,y);
      if(this.chapterIndex===0){
        // Desk island + monitor + office chair + post-it notes.
        round(-92,-32,184,83,9,'#4b536e','#151b39',7);round(-76,-53,91,58,4,'#111b38','#10142b',6);
        round(-69,-45,77,40,2,['#80dce2','#ed9ac4','#ffd35c'][(Math.floor(x/352)+Math.floor(y/325))%3],null);
        g.fillStyle='#192347';g.fillRect(-42,4,15,29);round(-78,34,78,12,3,'#252a47');
        round(39,-13,35,45,2,'#f7ddb4');g.fillStyle='#ef6992';g.fillRect(46,-6,21,9);g.fillStyle='#20203a';g.fillRect(46,8,18,3);
        round(-40,85,78,15,4,'#283452','#13172c');
        g.strokeStyle='#34456c';g.lineWidth=7;g.beginPath();g.moveTo(0,98);g.lineTo(0,126);g.moveTo(-24,126);g.lineTo(24,126);g.stroke();
      }else if(this.chapterIndex===1){
        // Meeting room: presentation tables and coffee mugs.
        round(-100,-36,200,100,17,'#9c618b','#21152e',8);round(-87,-29,173,83,13,'#b783a6',null);
        round(-91,88,56,24,8,'#323c69','#11172c');round(33,88,56,24,8,'#323c69','#11172c');
        round(-41,-22,75,51,4,'#2d356b','#11152f');round(-35,-16,63,37,3,'#fcadc9',null);
        round(56,-12,25,30,6,'#f6cf47','#432c4f');g.fillStyle='#f8eada';g.fillRect(66,-4,6,12);
      }else{
        // Midnight server room: ominous cooling racks.
        round(-105,-65,202,125,9,'#151d3b','#0c142c',9);
        for(let i=0;i<4;i++){
          round(-93,-53+i*26,175,21,2,'#3a4c70','#11172b',3);
          for(let j=0;j<3;j++){g.fillStyle=j===0?'#ff708d':'#76ebdf';g.fillRect(-79+j*11,-45+i*26,5,5);}
          g.fillStyle='#b4ccdb';g.fillRect(-14,-46+i*26,78,4);
        }
        round(-30,83,59,32,4,'#1b315a','#11172d');
      }
      g.restore();this.decor.push({x,y});
    }
    // Directional floor arrows and caution tape.
    for(let i=0;i<12;i++){
      const x=166+i*172,y=i%2?950:590;
      g.save();g.translate(x,y);g.fillStyle=accent+'35';g.beginPath();g.moveTo(-23,-10);g.lineTo(2,-10);g.lineTo(2,-22);g.lineTo(29,0);g.lineTo(2,22);g.lineTo(2,10);g.lineTo(-23,10);g.closePath();g.fill();g.restore();
    }
    for(const q of this.puddles){
      g.fillStyle='#ff77aa20';g.strokeStyle='#ff87ba75';g.lineWidth=6;g.beginPath();g.arc(q.x,q.y,q.r,0,6.283);g.fill();g.stroke();
      g.font='bold 12px monospace';g.fillStyle='#ffadd2';g.textAlign='center';g.fillText('MEETING ZONE',q.x,q.y);
    }
    // Colored strip-lights and readable center floor label.
    g.strokeStyle=accent+'17';g.lineWidth=17;
    for(let i=0;i<5;i++){g.beginPath();g.moveTo(i*540-200,0);g.lineTo(i*540+310,1560);g.stroke();}
    g.fillStyle=accent+'80';g.textAlign='center';g.font='900 28px Arial,sans-serif';g.fillText('CLOCK OUT! / FLOOR '+ch.no,1080,560);
    g.font='bold 12px monospace';g.fillStyle='#ffffff4d';g.fillText('NO OVERTIME  •  EMERGENCY EXIT',1080,592);
    return c;
  }
  circle(x,y,r,fill,stroke,lw=1){
    const g=this.ctx;g.beginPath();g.arc(x,y,Math.max(0,r),0,Math.PI*2);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.stroke();}
  }
  line(x,y,tx,ty,color,width=1){const g=this.ctx;g.beginPath();g.moveTo(x,y);g.lineTo(tx,ty);g.strokeStyle=color;g.lineWidth=width;g.stroke();}
  glow(x,y,r,color){
    const g=this.ctx,gradient=g.createRadialGradient(x,y,0,x,y,r);gradient.addColorStop(0,color);gradient.addColorStop(1,color.slice(0,7)+'00');this.circle(x,y,r,gradient);
  }
  visible(x,y,r=100){return Math.abs(x-this.camera.x)<this.width/2+r&&Math.abs(y-this.camera.y)<this.height/2+r;}
  drawNode(n){
    const g=this.ctx,ready=n.cooldown<=0,col=ready?'#ffdb54':'#7d7e94',pulse=this.motion?Math.sin(this.ambient*2+n.x)*3:0;
    if(ready)this.glow(n.x,n.y,100,'#ffd55226');
    this.circle(n.x,n.y,63+pulse,ready?'#ffd45512':null,col+'70',2);
    g.save();g.translate(n.x,n.y);g.rotate(-Math.PI/2);
    if(n.charge>0){g.beginPath();g.arc(0,0,64,0,Math.PI*2*n.charge/2);g.strokeStyle='#fff0a6';g.lineWidth=5;g.stroke();}
    g.restore();
    // Coffee vending machine (interactive restorative point).
    g.save();g.translate(n.x,n.y-10);
    g.fillStyle=ready?'#ffcb46':'#7c7c8c';g.strokeStyle='#13182d';g.lineWidth=5;
    g.beginPath();g.roundRect(-25,-29,50,61,5);g.fill();g.stroke();
    g.fillStyle='#222643';g.fillRect(-17,-21,34,24);
    g.fillStyle='#fdf0c7';g.fillRect(-10,-16,20,11);
    g.fillStyle='#fe7a9d';g.fillRect(-17,9,34,4);
    g.fillStyle='#252541';g.fillRect(-11,14,22,9);g.fillStyle='#fff5ca';g.fillRect(-7,16,14,7);
    g.fillStyle='#191d36';g.fillRect(-14,29,28,5);g.restore();
    g.font='bold 10px monospace';g.textAlign='center';g.fillStyle=ready?'#fff0b0':'#a0a2b5';g.fillText(ready?'COFFEE '+n.id:Math.ceil(n.cooldown)+'s',n.x,n.y+53);
  }
  drawEnemy(e){
    if(!this.visible(e.x,e.y,150))return;
    const g=this.ctx,isBoss=e.type==='boss';
    const image=AG.Art.enemies[e.type+(isBoss?this.chapterIndex:'')];
    const size=isBoss?195:e.type==='brute'?88:e.type==='runner'?65:e.type==='shooter'?82:76;
    g.save();g.translate(e.x,e.y);g.fillStyle='#071f1740';g.beginPath();g.ellipse(0,5,e.r*1.1,e.r*.4,0,0,Math.PI*2);g.fill();
    if(this.player.freeze>0){this.circle(0,-10,e.r+15,'#b8dbe318','#c5e6e44a',1);}
    const bob=this.motion&&this.player.freeze<=0?Math.sin(this.time*(isBoss?2:6)+e.phase)*(isBoss?2:2.5):0;
    if(image){if(e.hit>0)g.filter='brightness(1.8)';g.drawImage(image,-size/2,-size*.61+bob,size,size);g.filter='none';}
    else this.circle(0,-10,e.r,'#a1b67f');
    if(!isBoss&&e.hp<e.maxHp){g.fillStyle='#122d20';g.fillRect(-17,-size*.42,34,3);g.fillStyle='#b0c58b';g.fillRect(-17,-size*.42,34*Math.max(0,e.hp/e.maxHp),3);}
    if(e.windup>0){g.rotate(e.chargeAngle);g.fillStyle='#efbd7b26';g.fillRect(0,-21,275,42);this.line(0,-22,275,-22,'#f2c18a99',2);this.line(0,22,275,22,'#f2c18a99',2);}
    g.restore();
  }
  drawPlayer(){
    const p=this.player,g=this.ctx,im=AG.Art.sprites[this.character.id],bob=p.moving&&this.motion?Math.sin(p.stride)*1.8:0;
    g.save();g.translate(p.x,p.y);
    g.fillStyle='#071c1566';g.beginPath();g.ellipse(0,6,27,11,0,0,6.28);g.fill();
    this.circle(0,0,25,null,this.character.color+'49',1);
    if(p.invuln>.8||p.buff>0)this.glow(0,-17,60,this.character.color+'26');
    if(p.invuln>1.4&&this.character.id==='briar')this.circle(0,-16,42,'#ddcba41a','#e2d4ad80',2);
    if(p.invuln>0&&p.invuln<.7&&Math.floor(p.invuln*15)%2)g.globalAlpha=.6;
    if(im){if(p.dx<-.1)g.scale(-1,1);g.drawImage(im,-39,-88+bob,78,110);}
    g.restore();
    if(this.character.style==='orbit'){
      const count=2+this.levels.spread+(this.evolved.dawn?3:0);
      for(let i=0;i<count;i++){const a=this.time*2.4+i*Math.PI*2/count,r=this.evolved.dawn?(i%2?126:85):86,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;
        this.glow(x,y,22,'#edd19544');this.circle(x,y,5,'#f4dfaa');this.circle(x-6,y-3,3,'#e7d9a578');this.circle(x+6,y-3,3,'#e7d9a578');
      }
    }
    const count=this.levels.drone*(this.evolved.hive?2:1);
    for(let i=0;i<count;i++){const a=this.time*1.6+i*Math.PI*2/count,x=p.x+Math.cos(a)*68,y=p.y+Math.sin(a)*48-8;
      g.save();g.translate(x,y);g.fillStyle='#d5e0b978';g.beginPath();g.ellipse(-7,-4,8,4,-.4,0,6.28);g.ellipse(7,-4,8,4,.4,0,6.28);g.fill();this.circle(0,0,7,'#ddc381','#536c4c',2);this.line(-1,-5,-1,5,'#6a7851',3);g.restore();
    }
  }
  drawMinimap(){
    if(this.width<720)return;
    const g=this.ctx,x=this.width-150,y=this.height-171,w=119,h=85,sx=w/2160,sy=h/1560;
    g.fillStyle='#141831e6';g.fillRect(x,y,w,h);g.strokeStyle='#85e8ef50';g.lineWidth=1;g.strokeRect(x,y,w,h);
    g.strokeStyle='#86dbed28';g.strokeRect(x+(this.camera.x-this.width/2)*sx,y+(this.camera.y-this.height/2)*sy,Math.min(w,this.width*sx),Math.min(h,this.height*sy));
    for(const n of this.nodes)this.circle(x+n.x*sx,y+n.y*sy,2.5,n.cooldown>0?'#6f896b':'#ffd34f');
    if(this.boss&&!this.boss.dead)this.circle(x+this.boss.x*sx,y+this.boss.y*sy,3.5,'#ff77a6');
    this.circle(x+this.player.x*sx,y+this.player.y*sy,3,'#f3e8bd');
    g.fillStyle='#b4c9ef';g.textAlign='left';g.font='7px monospace';g.fillText('FLOOR '+this.chapter.no,x+5,y+11);
  }
  nodeArrow(){
    const p=this.player,n=this.nodes.filter(n=>n.cooldown<=0).sort((a,b)=>this.distance(a,p)-this.distance(b,p))[0];
    if(!n||this.visible(n.x,n.y,-55))return;
    const a=Math.atan2(n.y-this.camera.y,n.x-this.camera.x),cx=this.width/2,cy=this.height/2,r=Math.min(cx-35,cy-48);
    const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r,g=this.ctx;
    g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(10,0);g.lineTo(-5,-6);g.lineTo(-5,6);g.closePath();g.fillStyle='#ffd350';g.fill();g.restore();
    g.textAlign='center';g.font='8px monospace';g.fillStyle='#ffd350';g.fillText('COFFEE '+n.id,x,y+20);
  }
  render(){
    if(!this.player||!this.floor||this.state==='idle')return;
    const g=this.ctx;g.setTransform(this.dpr,0,0,this.dpr,0,0);g.fillStyle=this.chapter.floor;g.fillRect(0,0,this.width,this.height);
    g.save();g.translate(this.width/2-this.camera.x+(this.shake?this.random(-this.shake,this.shake):0),this.height/2-this.camera.y);
    g.drawImage(this.floor,0,0);
    for(const n of this.nodes)if(this.visible(n.x,n.y))this.drawNode(n);
    for(const h of this.hazards){
      this.circle(h.x,h.y,h.r,h.warning>0?'#e9b17516':'#d7866348',h.warning>0?'#e6b484ae':'#e4a279',2);
      const progress=1-Math.max(0,h.warning)/1.05;this.circle(h.x,h.y,h.r*progress,null,'#edd1a176',1);
      for(let i=0;i<6;i++){const a=i*Math.PI/3;this.line(h.x+Math.cos(a)*(h.r-8),h.y+Math.sin(a)*(h.r-8),h.x+Math.cos(a)*(h.r+3),h.y+Math.sin(a)*(h.r+3),'#f0c99988',2);}
      if(h.warning<=0){for(let i=0;i<4;i++){const x=h.x+Math.sin(i*4)*h.r*.6,y=h.y+Math.cos(i*4)*h.r*.55;g.beginPath();g.moveTo(x-6,y+5);g.lineTo(x,y-20);g.lineTo(x+8,y+4);g.fillStyle='#c58b66';g.fill();}}
    }
    for(const gem of this.gems)if(this.visible(gem.x,gem.y,20)){
      const y=gem.y+(this.motion?Math.sin(this.time*3+gem.phase)*2:0);
      if(gem.health){this.circle(gem.x,y,7,'#a0efff','#224e68',2);this.line(gem.x-3,y,gem.x+3,y,'#f0ecd0',2);this.line(gem.x,y-3,gem.x,y+3,'#f0ecd0',2);}
      else{g.save();g.translate(gem.x,y);g.rotate(Math.PI/4);g.fillStyle=gem.value>2?'#ff9bb7':'#ffd25a';g.fillRect(-3.5,-3.5,7,7);g.strokeStyle='#fff7c666';g.lineWidth=1;g.strokeRect(-3.5,-3.5,7,7);g.restore();}
    }
    const drawables=this.enemies.map(e=>({y:e.y,e}));drawables.push({y:this.player.y,player:true});drawables.sort((a,b)=>a.y-b.y);
    for(const item of drawables)if(item.player)this.drawPlayer();else this.drawEnemy(item.e);
    for(const s of this.slashes){g.globalAlpha=Math.max(0,s.life/s.max);g.beginPath();g.arc(s.x,s.y,s.r,s.full?0:s.angle-1.2,s.full?Math.PI*2:s.angle+1.2);g.strokeStyle=this.evolved.dawn?'#ffd350':'#ff77a6';g.lineWidth=9;g.stroke();g.beginPath();g.arc(s.x,s.y,s.r-15,s.angle-1.1,s.angle+1.1);g.strokeStyle='#75dfe666';g.lineWidth=3;g.stroke();}g.globalAlpha=1;
    for(const beam of this.beams){g.globalAlpha=beam.life/beam.max;const mx=(beam.x+beam.tx)/2+Math.sin(beam.x)*12,my=(beam.y+beam.ty)/2+Math.cos(beam.ty)*12;this.line(beam.x,beam.y,mx,my,'#73e7f366',8);this.line(mx,my,beam.tx,beam.ty,'#73e7f366',8);this.line(beam.x,beam.y,mx,my,'#92f7e5',2);this.line(mx,my,beam.tx,beam.ty,'#92f7e5',2);}g.globalAlpha=1;
    for(const b of this.bullets)if(this.visible(b.x,b.y,20)){const c=b.drone?'#ff87b7':this.character.color;this.line(b.x-b.vx*.025,b.y-b.vy*.025,b.x,b.y,c+'66',b.r*1.5);this.circle(b.x,b.y,b.r,c);this.circle(b.x-1,b.y-1,1.5,'#faf5d7');}
    for(const b of this.enemyShots){this.circle(b.x,b.y,8,'#ff6c9f32');this.circle(b.x,b.y,5,'#ff779a','#ffd4dc',1.5);}
    for(const r of this.rings){g.globalAlpha=r.life/r.max;const radius=r.r*(1-(r.life/r.max)**2);this.circle(r.x,r.y,radius,null,r.color,2.5);this.circle(r.x,r.y,Math.max(1,radius-9),null,r.color+'55',5);}g.globalAlpha=1;
    for(const p of this.particles){g.globalAlpha=p.life/p.max;g.save();g.translate(p.x,p.y);g.rotate(p.angle+p.life);g.fillStyle=p.color;g.beginPath();g.ellipse(0,0,p.size,p.size*.45,0,0,6.28);g.fill();g.restore();}g.globalAlpha=1;
    for(const f of this.floaters){g.globalAlpha=Math.min(1,f.life*2);g.textAlign='center';g.font=(f.big?'bold 16px':'11px')+' monospace';g.fillStyle='#10132bb5';g.fillText(f.text,f.x+1,f.y+1);g.fillStyle=f.color;g.fillText(f.text,f.x,f.y);}g.globalAlpha=1;
    // Subtle electrical pixels are visual only.
    if(this.motion){
      for(let i=0;i<36;i++){const x=(i*137+this.ambient*6)%2160,y=(i*283+Math.sin(this.ambient*.5+i)*20)%1560;if(this.visible(x,y,10))this.circle(x,y,1+i%2*.5,'#78e8e544');}
      if(this.chapterIndex===1){for(let i=0;i<65;i++){const x=(i*179+this.ambient*10)%2160,y=(i*293+this.ambient*90)%1560;if(this.visible(x,y,20))this.line(x,y,x-3,y+14,'#f099cb20',1);}}
    }
    g.restore();this.nodeArrow();this.drawMinimap();
  }
  frame(now){
    if(!this.running)return;
    const dt=Math.min(.05,this.last?(now-this.last)/1000:0);this.last=now;
    if(this.state!=='idle'){
      if(this.state==='playing'&&!this.manual){this.ambient+=dt;let left=dt;while(left>.000001&&this.state==='playing'){const step=Math.min(left,1/60);this.update(step);left-=step;}}
      this.render();
    }
    this.raf=requestAnimationFrame(this.frame);
  }
  snapshot(){
    return {state:this.state,time:this.time,kills:this.kills,nodesRestored:this.nodesRestored,player:this.player?{...this.player}:null,character:this.character?.id,chapter:this.chapter?.id,levels:{...this.levels},evolved:{...this.evolved},bonus:{...this.bonus},choices:this.choices?.map(x=>x.id),enemies:this.enemies?.map(e=>({...e})),bullets:this.bullets?.length,enemyShots:this.enemyShots?.length,nodes:this.nodes?.map(n=>({...n})),bossSpawned:this.bossSpawned,bossDefeated:this.bossDefeated,choice:this.choice?.id,rerolls:this.rerolls};
  }
  step(seconds){for(let t=0;t<seconds&&this.state==='playing';t+=1/60)this.update(Math.min(1/60,seconds-t));this.render();}
  destroy(){this.running=false;cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();}
};
