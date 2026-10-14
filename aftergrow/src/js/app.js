/* Accessible DOM screens, input routing, and persistence integration. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id),C=AG.Content,S=AG.Store,A=AG.Art;
  const icon=A.icon,escape=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const fmt=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
  let route='home',overlayKind=null,helpReturn=null,selectedArchive='origin',introPage=0,toastTimer,battleTimer,cutTimer,inputGuard=0;
  let game=null,ready=false;
  const keys=new Set();let stick={active:false,id:null,x:0,y:0,ox:0,oy:0};
  const char=()=>C.characters.find(c=>c.id===S.data.selected)||C.characters[0];
  const chapter=()=>C.chapters[S.data.chapter]||C.chapters[0];
  const weaponIcon={seed:'stamp',orbit:'badge',slash:'shield',chain:'bolt'};
  const palette={green:'#ffcf40',amber:'#ff77a6',blue:'#79e5e3',pink:'#9da6ff',yellow:'#ffcf40',cyan:'#79e5e3'};
  function toast(text){
    $('site-toast').textContent=text;$('site-toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('site-toast').classList.remove('visible'),3500);
  }
  function battleToast(text){
    $('battle-toast').textContent=text;$('battle-toast').classList.add('visible');clearTimeout(battleTimer);battleTimer=setTimeout(()=>$('battle-toast').classList.remove('visible'),4200);
  }
  function tools(){
    $('wallet').innerHTML=icon('badge')+S.data.seeds;
    $('sound-btn').innerHTML=icon(AG.Audio.enabled?'sound':'mute');
    $('sound-btn').setAttribute('aria-pressed',String(AG.Audio.enabled));
    $('sound-btn').setAttribute('aria-label',AG.Audio.enabled?'소리 끄기':'소리 켜기');
    document.body.classList.toggle('low-motion',!S.data.settings.motion);
  }
  function clearInput(){
    keys.clear();stick={active:false,id:null,x:0,y:0,ox:0,oy:0};$('touch-stick').hidden=true;game?.setInput(0,0);
  }
  function controls(){
    let x=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
    let y=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0);
    if(stick.active){x=stick.x;y=stick.y;}game?.setInput(x,y);
  }
  function setOverlay(html,kind){
    clearInput();overlayKind=kind;$('overlay').hidden=false;$('overlay').className='overlay'+(kind==='intro'?' dialogue':'');
    $('overlay').innerHTML=html;$('overlay').setAttribute('role','dialog');$('overlay').setAttribute('aria-modal','true');$('overlay').setAttribute('aria-labelledby','dialog-title');
    inputGuard=performance.now()+200;requestAnimationFrame(()=>$('overlay').querySelector('button:not(:disabled)')?.focus({preventScroll:true}));
  }
  function hideOverlay(){
    overlayKind=null;$('overlay').hidden=true;$('overlay').innerHTML='';clearInput();
    if(game?.state==='playing')$('game').focus({preventScroll:true});
  }
  function heading(kicker,title,description,counter=''){
    return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1></div>${description?`<p>${description}</p>`:''}${counter?`<span class="page-counter">${counter}</span>`:''}</div>`;
  }
  function go(next,scroll=true){
    if(next==='help'){openHelp();return;}
    if(game&&['playing','paused','upgrade','story','help'].includes(game.state)&&!$('play-view').hidden){
      if(game.state==='playing')game.pause();
      else if(game.state==='paused')showPause();
      else toast('지금 열린 선택을 마친 뒤 작전을 일시정지할 수 있어요.');
      return;
    }
    hideOverlay();clearInput();if(game)game.state='idle';route=next;
    document.body.classList.remove('in-game');$('menu').hidden=false;$('play-view').hidden=true;$('footer').hidden=false;
    document.querySelectorAll('.nav-link').forEach(b=>{b.classList.toggle('active',b.dataset.nav===next);b.setAttribute('aria-current',b.dataset.nav===next?'page':'false');});
    const renders={home:renderHome,roster:renderRoster,map:renderMap,archive:renderArchive,workshop:renderWorkshop};
    $('menu').innerHTML=(renders[next]||renderHome)();tools();if(scroll)window.scrollTo({top:0,behavior:'instant'});
  }
  function renderHome(){
    const done=C.chapters.filter(c=>S.data.clears[c.id]).length;
    return `<div class="hero">
      <div class="hero-art"><img src="${A.scenes[0]}" alt="야근에 맞서 싸우는 네 명의 직장인과 네온 빛 회사 전경"></div>
      <div class="hero-copy"><div class="eyebrow">OFFICE SURVIVAL ACTION / 2026</div><p class="hero-wordmark">CLOCK OUT! <span class="hero-stamp">퇴근 승인 대기</span></p><h1>퇴근이<br><em>전쟁이다.</em></h1>
      <p class="hero-description">퇴근 3분 전, 회사가 미쳐버렸다.<br>끝없는 회의, 쏟아지는 업무, 폭주한 야근 시스템.<br>동료들과 함께 모든 마감을 뚫고 퇴근하라!</p>
      <div class="button-row"><button class="primary" data-nav="roster">직장인 선택하기 ${icon('arrow')}</button><button class="secondary" data-action="quick">바로 출근(?) ${icon('bolt')}</button></div>
      <div class="hero-detail"><span>${icon('badge')} 4 PLAYABLE STAFF</span><span>${icon('map')} 3 OFFICE ZONES</span><span>${icon('coffee')} 03:00 TO ESCAPE</span></div></div>
      <div class="hero-caption"><span class="micro">EMPLOYEE HANDBOOK / #000</span><strong>NO MORE OVERTIME.</strong><span class="micro">정시퇴근을 위해, 반격을 시작한다.</span></div>
      <div class="hero-bottom"><span class="status">SECURITY ALERT · 퇴근 시스템 오류</span><span>${S.data.runs?`${S.data.runs}번의 작전 · ${done}/3 구역 돌파 · 사내 기록 ${S.data.archive.length}/9`:'NO LOGIN · NO INSTALL · JUST SURVIVE'}</span><span>MEET YOUR CREW ↓</span></div>
    </div><section class="home-after"><div><span class="section-kicker">MEET THE OVERWORKED CREW</span><h2>누구와 탈출할 것인가?</h2><p>대리 · 기획자 · 팀장 · 개발자. 각자 다른 무기와 필살기.</p></div><div class="mini-roster">${C.characters.map(c=>`<button class="mini-character" data-action="character" data-id="${c.id}" style="--accent:${c.color}" aria-label="${c.name}, ${c.title} 자세히 보기"><img src="${A.portraits[c.id]}" alt=""><span><strong>${c.name}</strong><small>${c.code} / ${c.en}</small></span></button>`).join('')}</div></section>`;
  }
  function renderRoster(){
    const c=char();
    return `<section class="page">${heading('SELECT YOUR EMPLOYEE','네 명의 직장인. 단 하나의 목표.','겉모습만 다른 캐릭터가 아닙니다.<br>서류 투척부터 디버그 체인까지, 무기와 전용 스킬이 다릅니다.')}
      <div class="roster-tabs" role="group" aria-label="직장인 선택">${C.characters.map(v=>`<button class="roster-tab ${v.id===c.id?'selected':''}" data-action="select-char" data-id="${v.id}" style="--accent:${v.color}" aria-pressed="${v.id===c.id}"><img src="${A.portraits[v.id]}" alt=""><span><strong>${v.name}</strong><small>${v.title}</small></span><span class="tab-check">✓</span></button>`).join('')}</div>
      <div class="roster-layout" style="--accent:${c.color}"><div class="roster-portrait"><img src="${A.portraits[c.id]}" alt="${c.name}의 전신 일러스트"><div class="portrait-caption"><span>EMPLOYEE PORTRAIT / ${c.code}</span><span>OFF THE CLOCK? NOT YET.</span></div></div>
        <div class="character-info"><div class="micro muted">${c.en}</div><div class="character-name"><h2>${c.name}</h2><span class="pill">${c.code} / ${({seed:'DOCUMENT',orbit:'STICKY NOTE',slash:'SIGN OFF',chain:'DEBUG'})[c.style]}</span></div><p class="character-title">${c.title}</p><p class="character-quote">${c.quote}</p><p class="character-bio">${c.bio}</p>
          <div class="character-stats">${['공격','기동','생존'].map((label,i)=>`<div class="stat-row"><span>${label}</span><span class="stat-pips">${Array.from({length:5},(_,j)=>`<i class="${j<c.stats[i]?'on':''}"></i>`).join('')}</span></div>`).join('')}</div>
          <div class="trait-grid"><div class="trait">${icon(weaponIcon[c.style])}<div><label>STARTING WEAPON</label><strong>${c.weapon}</strong><p>${c.weaponDesc}</p></div></div><div class="trait">${icon('star')}<div><label>UNIQUE SKILL / E · ${c.cooldown}S</label><strong>${c.skill}</strong><p>${c.skillDesc}</p></div></div></div>
          <div class="trait" style="margin-bottom:21px">${icon('shield')}<div><label>PASSIVE / ${c.passive}</label><p>${c.passiveDesc}</p></div></div>
          <button class="primary" data-nav="map">${c.name}와 함께 출발하기 ${icon('arrow')}</button></div></div></section>`;
  }
  function renderMap(){
    const c=char(),ch=chapter();
    return `<section class="page">${heading('THREE LEVELS. ONE EXIT.','어느 층부터 뚫을까?','모든 층이 처음부터 열려 있습니다.<br>1층부터 차례로 플레이하면 퇴근 전쟁의 진상을 알 수 있어요.')}
      <div class="chapter-grid">${C.chapters.map((v,i)=>`<button class="chapter-card ${S.data.chapter===i?'selected':''}" data-action="select-chapter" data-id="${i}" style="--accent:${v.color}" aria-pressed="${S.data.chapter===i}"><div class="chapter-picture"><img src="${A.scenes[i]}" alt="${v.name}의 풍경"><span class="chapter-number">${v.no}</span><span class="chapter-stamp">${S.data.clears[v.id]?'CLEARED':'LOCKDOWN'}</span></div><div class="chapter-info"><span class="micro">${v.en}</span><h2>${v.name}</h2><p>${v.description}</p><div class="chapter-meta"><span>03:00 · ${i===0?'마감의 시작':i===1?'무한 회의':'마지막 배포'}</span>${icon(S.data.chapter===i?'check':'arrow')}</div></div></button>`).join('')}</div>
      <div class="expedition-bar" style="--accent:${c.color}"><img src="${A.portraits[c.id]}" alt=""><div class="expedition-copy"><span class="micro muted">OPERATION ${ch.no} / ${c.code}</span><h3>${c.name} · ${ch.name}</h3><p>${ch.danger} / 보스: ${ch.boss}</p></div><button class="text-button" data-nav="roster">직장인 변경</button><button class="primary" data-action="begin-intro">작전 개시 ${icon('arrow')}</button></div>
      <p class="map-note">자동 공격 · 이동 + 돌진 + 전용 스킬 · 작전 중 만나는 편지의 선택이 능력과 결말을 바꿉니다.</p></section>`;
  }
  function unlockHint(a){
    const c=C.characters.find(c=>c.id===a.id);if(c)return `${c.name}로 구역 하나를 처리하면 열립니다.`;
    if(a.id==='ending')return '세 구역을 모두 처리하면 마지막 기록이 열립니다.';
    return '해당 구역의 보스를 처치하면 사내 기록이 열립니다.';
  }
  function renderArchive(){
    const a=C.archives.find(a=>a.id===selectedArchive&&S.data.archive.includes(a.id))||C.archives[0];
    return `<section class="page">${heading('PERSONNEL FILE / CLASSIFIED','기록은 거짓말하지 않는다.','돌파한 구역과 함께한 동료의 기록이 쌓입니다.<br>진행 상황은 이 브라우저에 자동 저장됩니다.')}
      <div class="archive-layout"><div class="archive-list">${C.archives.map(v=>{const open=S.data.archive.includes(v.id);return `<button class="archive-item ${v.id===a.id?'selected':''} ${open?'':'locked'}" data-action="read" data-id="${v.id}" aria-label="${v.title}${open?'':' · '+unlockHint(v)}">${icon(open?'letter':'lock')}<span><small>${v.tag}</small><strong>${open?v.title:'아직 닿지 않은 기록'}</strong></span></button>`;}).join('')}</div>
      <article class="archive-page paper-grain"><div class="archive-decoration"><span class="micro">EMPLOYEE RECORDS<br>COLLECTED ${S.data.archive.length} / ${C.archives.length}</span>${icon('badge')}</div><span class="micro" style="display:block;margin-top:25px">${a.tag}</span><h2>${a.title}</h2><p>${a.text}</p><div class="archive-sign">NO MORE OVERTIME.<br>THE OFFICE CREW.</div></article></div></section>`;
  }
  function renderWorkshop(){
    return `<section class="page">${heading('PREPARE FOR YOUR NEXT SHIFT','커피 한 잔, 다음 작전.','작전에서 모은 업무 포인트로 모든 직장인을 영구 강화하세요.<br>업그레이드는 이 브라우저에 저장됩니다.')}
      <div class="workshop-grid">${C.research.map(r=>{const lv=S.data.research[r.id],cost=r.cost*(lv+1),full=lv>=r.max;return `<article class="research-card">${icon(r.icon)}<span class="micro muted">PERMANENT RESEARCH / ${lv} OF ${r.max}</span><h2>${r.name}</h2><p>${r.desc}</p><div class="stat-pips">${Array.from({length:3},(_,i)=>`<i class="${i<lv?'on':''}"></i>`).join('')}</div><button class="secondary" data-action="buy" data-id="${r.id}" ${full||S.data.seeds<cost?'disabled':''}>${full?'연구 완료':icon('sprout')+cost+' 업무 포인트으로 연구'}</button></article>`;}).join('')}</div>
      <p class="map-note">작전를 마치면 최소 5 업무 포인트을 받습니다. 처리한 개체·노드·구역 완료에 따라 보상이 늘어납니다. ${S.available?'자동 저장 중':'브라우저 저장이 차단되어 이번 세션에서만 유지됩니다.'}</p>
      <div class="recipe-section"><div class="section-kicker">EVOLUTION FIELD NOTES</div><h2>장비가 쌓이면 퇴근이 빨라진다.</h2><div class="recipe-grid">${C.evolutions.map(e=>`<article class="recipe">${icon(e.icon)}<div><strong>${e.name}</strong><p>${e.desc}</p><span class="micro">${Object.entries(e.needs).map(([id,lv])=>C.modules.find(m=>m.id===id).name+' '+lv+'단계').join(' + ')}</span></div></article>`).join('')}</div><p class="map-note">작전 중 조건을 갖추면 다음 레벨 업 선택지에 진화 카드가 우선 등장합니다. 휴게실에서 미리 구매하는 방식은 아닙니다.</p></div></section>`;
  }
  function beginIntro(){
    if(!ready)return;introPage=0;showIntro();
  }
  function showIntro(){
    const c=char(),ch=chapter(),line=ch.intro[introPage],self=line.speaker==='self';
    const text=line.text==='$intro'?c.intro:line.text;
    setOverlay(`<div class="dialogue-stage" style="--accent:${c.color}">
      <div class="dialogue-portrait">${self?`<img src="${A.portraits[c.id]}" alt="${c.name}">`:`<div class="radio-art">${icon('monitor')}</div>`}</div>
      <article class="dialogue-paper"><span class="micro">CHAPTER ${ch.no} / ${ch.tag}</span><h2 id="dialog-title">${self?c.name:line.name}</h2><p class="dialogue-text">${text}</p><div class="dialogue-controls"><span class="dialogue-dots">${ch.intro.map((_,i)=>`<i class="${i<=introPage?'on':''}"></i>`).join('')}</span><button class="text-button" data-action="skip-intro">브리핑 건너뛰기</button><button class="primary" data-action="next-intro">${introPage===ch.intro.length-1?'작전 시작':'다음'} ${icon('arrow')}</button></div></article>
    </div><button class="tool-button overlay-close" data-action="cancel-intro" aria-label="준비 화면으로 돌아가기">${icon('close')}</button>`,'intro');
  }
  function startGame(){
    hideOverlay();clearInput();document.body.classList.add('in-game');$('menu').hidden=true;$('play-view').hidden=false;$('footer').hidden=true;
    $('play-view').style.setProperty('--accent',char().color);game.motion=S.data.settings.motion;game.start(char(),chapter());
    $('game').focus({preventScroll:true});AG.Audio.init();showCut('CHAPTER '+chapter().no,chapter().name,chapter().tag);updateHud();updateModules();
  }
  function showCut(kicker,title,desc){
    $('chapter-cut').hidden=false;$('chapter-cut').innerHTML=`<span class="micro">${kicker}</span><h2>${title}</h2><p>${desc}</p>`;
    $('chapter-cut').style.animation='none';void $('chapter-cut').offsetWidth;$('chapter-cut').style.animation='';
    clearTimeout(cutTimer);cutTimer=setTimeout(()=>$('chapter-cut').hidden=true,3000);
  }
  function showUpgrade(){
    const p=game.player;
    setOverlay(`<section class="modal"><div class="modal-top"><div class="eyebrow">LEVEL UP / NEW PERK</div><h2 id="dialog-title">이번 야근, 어떻게 버틸까?</h2><p>LEVEL ${String(p.level).padStart(2,'0')} · 장비를 하나 고르세요. 선택하는 동안 시간은 멈춥니다.</p></div><div class="upgrade-cards">${game.choices.map((m,i)=>`<button class="upgrade-card ${m.needs?'evolution':''}" data-action="upgrade" data-id="${i}" style="--accent:${palette[m.color]}" aria-label="${m.name}, ${m.desc}"><span class="card-key">${i+1}</span><span class="card-art">${icon(m.icon)}</span><span class="micro">${m.kind}${m.needs?' / NEW FORM':''}</span><h3>${m.name}</h3><p>${m.desc}</p><span class="card-bottom"><span>${m.needs?'EVOLUTION READY':game.levels[m.id]?'LEVEL '+game.levels[m.id]+' → '+(game.levels[m.id]+1):'NEW PERK'}</span>${icon('arrow')}</span></button>`).join('')}</div><div class="modal-foot"><span>숫자 1 · 2 · 3으로 선택할 수 있어요</span><button data-action="reroll" ${game.rerolls?'':'disabled'}>다시 뽑기 ${game.rerolls}/1</button></div></section>`,'upgrade');
  }
  function showStory(reply=false){
    const e=game.chapter.event;
    setOverlay(`<section class="story-choice">${icon('monitor','story-icon')}<div class="eyebrow">${e.kicker}</div><h2 id="dialog-title">${e.title}</h2><p>${e.text}</p>
      ${reply?`<p class="story-reply">${game.choice.reply}</p><div class="button-row"><button class="primary" data-action="story-continue">선택 완료, 다시 전진 ${icon('arrow')}</button></div>`:`<div class="story-options">${e.choices.map((c,i)=>`<button class="story-option" data-action="story-choice" data-id="${i}"><strong>${c.label} ${icon('arrow')}</strong><small>${c.description}</small></button>`).join('')}</div><div class="modal-foot">당신의 선택은 이번 작전의 능력과 결말에 남습니다.</div>`}</section>`,reply?'story-reply':'story');
  }
  function showPause(){
    setOverlay(`<section class="compact-modal"><div class="eyebrow">PAUSED / TAKE FIVE</div><h2 id="dialog-title">커피 브레이크.</h2><p>잠깐 쉬어도 됩니다.<br>회사는 도망가지 않아요.</p><div class="micro">${game.character.name} · ${game.chapter.name} · ${fmt(game.time)}</div><button class="primary" data-action="resume">업무 재개 ${icon('arrow')}</button><button class="secondary" data-action="help">조작법 보기</button><label class="motion-control"><input type="checkbox" id="motion-toggle" ${S.data.settings.motion?'checked':''}> 배경 움직임과 화면 흔들림</label><button class="text-button" data-action="abandon">작전 포기하고 귀가하기</button></section>`,'pause');
  }
  function showResult(result){
    const reward=S.finish(result);tools();
    const isFirst=result.choice===result.chapter.event.choices[0];
    const text=result.win?(isFirst?result.chapter.endCare:result.chapter.endSignal):'정시퇴근에 실패했습니다. 모은 업무 포인트는 그대로! 휴게실에서 장비를 강화하고 재도전하세요.';
    setOverlay(`<section class="result-modal"><div class="result-art"><img src="${A.portraits[result.character.id]}" alt="${result.character.name}"></div><div class="result-copy"><div class="eyebrow">${result.win?'CLOCK-OUT APPROVED':'MISSION FAILED / RETRY'}</div><h2 id="dialog-title">${result.win?'퇴근 승인 완료!':'아직 퇴근할 수 없다.'}</h2><p>${text}</p>${result.win?`<p class="ending-line">${result.character.ending}</p>`:''}<div class="result-stats"><div><label>버틴 시간</label><strong>${fmt(result.time)}</strong></div><div><label>처리 업무</label><strong>${result.kills}</strong></div><div><label>성장 레벨</label><strong>${result.level}</strong></div><div><label>커피 보충</label><strong>${result.nodes}</strong></div></div><div class="reward-line">${icon('badge')} +${reward} 업무 포인트 ${result.win?'· 새로운 사내 기록이 열렸습니다.':''}</div><div class="button-row"><button class="primary" data-action="${result.win&&S.data.chapter<2?'next-chapter':'retry'}">${result.win&&S.data.chapter<2?'다음 층 돌파':'다시 출근하기'} ${icon('arrow')}</button><button class="secondary" data-action="result-workshop">휴게실로</button><button class="text-button" data-action="result-home">${result.win?'사내 기록 보기':'로비로 돌아가기'}</button></div></div></section>`,'result');
    if(result.win)AG.Audio.sfx('upgrade');
  }
  function openHelp(){
    if(overlayKind==='help')return;
    helpReturn={html:$('overlay').innerHTML,kind:overlayKind,state:game?.state};
    if(game&&game.state!=='idle'&&game.state!=='result')game.state='help';
    setOverlay(`<section class="help-modal"><div class="eyebrow">EMPLOYEE TRAINING / QUICK START</div><h2 id="dialog-title">야근에서 살아남는 법.</h2><div class="help-rows">
      <div class="help-row"><span><kbd>W A S D</kbd><kbd>↑ ↓ ← →</kbd></span><div><strong>움직임이 곧 전략</strong><p>공격은 자동입니다. 모바일과 마우스는 게임 화면을 드래그해 이동합니다.</p></div></div>
      <div class="help-row"><span><kbd>SPACE</kbd></span><div><strong>무적 돌진</strong><p>바라보는 방향으로 빠르게 빠져나옵니다. 기본 대기시간 3초.</p></div></div>
      <div class="help-row"><span><kbd>E</kbd></span><div><strong>직장인 전용 필살기</strong><p>마감 부스터, 회의 취소, 종료 선언, 시스템 프리즈! 직군마다 다릅니다.</p></div></div>
      <div class="help-row"><span>업무 포인트 · 장비</span><div><strong>성장과 진화</strong><p>업무 포인트를 모아 레벨업 카드 중 하나를 고릅니다. 결재 도장 3 + 업무 가속 매크로 2로 무기가 각성합니다.</p></div></div>
      <div class="help-row"><span>커피 머신</span><div><strong>카페인 충전</strong><p>커피 머신 원 안에서 2초 머무르면 체력·충격파·경험치를 얻습니다. 23초 뒤 재충전됩니다.</p></div></div>
    </div><p class="help-tip"><strong>목표:</strong> 3분을 버티고, 2분 25초에 등장하는 보스를 처치하세요.<br>무한 회의실의 캘린더 구역에서는 느려집니다. 바닥 경보와 알림 탄환을 피하세요.<br><kbd>P / ESC</kbd> 일시정지 · <kbd>M</kbd> 소리 · 선택과 이야기 중에는 전투가 멈춥니다.<br>진행도는 이 브라우저에 저장됩니다. ${S.available?'다른 기기로 자동 동기화되지는 않습니다.':'현재 저장이 차단되어 세션 종료 시 사라질 수 있습니다.'}</p><button class="primary" data-action="close-help">정시퇴근 도전 ${icon('check')}</button></section>`,'help');
  }
  function closeHelp(){
    const back=helpReturn;helpReturn=null;
    if(game&&back?.state)game.state=back.state;
    if(back?.kind)setOverlay(back.html,back.kind);else hideOverlay();
  }
  function updateModules(){
    if(!game?.player)return;
    const slots=[{name:game.character.weapon,icon:weaponIcon[game.character.style],level:1+game.levels.weapon}];
    for(const m of C.modules)if(m.id!=='weapon'&&game.levels[m.id])slots.push({name:m.name,icon:m.icon,level:game.levels[m.id]});
    for(const e of C.evolutions)if(game.evolved[e.id])slots.push({name:e.name,icon:e.icon,level:'✧',evolution:true});
    $('module-rack').innerHTML=slots.map(s=>`<div class="module-slot ${s.evolution?'evolution':''}" title="${s.name} ${s.level}" aria-label="${s.name} ${s.level}">${icon(s.icon)}<small>${s.level}</small></div>`).join('');
  }
  function updateHud(){
    if(!game?.player||$('play-view').hidden)return;
    const p=game.player;
    $('hp-fill').style.width=Math.max(0,p.hp/p.maxHp*100)+'%';$('hp-text').textContent=Math.ceil(p.hp)+' / '+p.maxHp;$('lv-text').textContent='LV '+String(p.level).padStart(2,'0');
    $('clock').textContent=game.time<game.chapter.duration?fmt(Math.ceil(game.chapter.duration-game.time)):'처리 중';
    $('clock').style.fontSize=game.time<game.chapter.duration?'':'22px';
    $('objective').textContent=game.bossDefeated?'퇴근 시간까지 생존하세요':game.bossSpawned?'최종 관리자를 처치하세요':'퇴근까지 남은 시간';
    $('kill-text').textContent=String(game.kills).padStart(3,'0');$('xp-fill').style.width=Math.min(100,p.xp/p.nextXp*100)+'%';$('xp-text').textContent=Math.floor(p.xp)+' / '+p.nextXp;
    $('nodes-text').textContent='커피 보충 '+game.nodesRestored+'회';
    $('skill-cd').textContent=p.skillCd>0?p.skillCd.toFixed(1)+'s':p.buff>0?'스킬 발동 중':'준비 완료';
    $('dash-cd').textContent=p.dashCd>0?p.dashCd.toFixed(1)+'s':'준비 완료';
    $('skill-cover').style.height=p.skillCd/game.character.cooldown*100+'%';$('dash-cover').style.height=p.dashCd/Math.max(1.3,3-game.levels.speed*.3-game.bonus.dash)*100+'%';
    $('skill-btn').classList.toggle('ready',p.skillCd<=0);$('dash-btn').classList.toggle('ready',p.dashCd<=0);
    $('skill-btn').setAttribute('aria-label',game.character.skill+' '+(p.skillCd>0?'대기 중':'사용 가능'));$('dash-btn').setAttribute('aria-label','돌진 '+(p.dashCd>0?'대기 중':'사용 가능'));
    const boss=game.boss;$('boss-hud').hidden=!boss||boss.dead;
    if(boss&&!boss.dead){$('boss-name').textContent=game.chapter.boss;$('boss-percent').textContent=Math.max(0,Math.ceil(boss.hp/boss.maxHp*100))+'%';$('boss-fill').style.width=Math.max(0,boss.hp/boss.maxHp*100)+'%';}
  }
  function gameEvent(type,payload){
    if(type==='start'){
      $('hud-portrait').src=A.portraits[game.character.id];$('hud-name').textContent=game.character.code+' / '+game.character.name;
      $('chapter-label').textContent='CH. '+game.chapter.no+' / '+game.chapter.name;
      $('skill-name').textContent=game.character.skill;$('skill-icon').innerHTML=icon(weaponIcon[game.character.style]);$('dash-icon').innerHTML=icon('wind');
      $('mission-text').textContent=game.chapter.id==='rain'?'캘린더 구역을 피하고 커피 머신 안에서 2초 머무르세요.':'커피 머신의 원 안에서 2초 머무르세요.';
    }
    if(type==='upgrade')showUpgrade();
    if(type==='pause')showPause();
    if(type==='story')showStory();
    if(type==='result')showResult(payload);
    if(type==='toast')battleToast(payload.text);
    if(type==='modules')updateModules();
    if(type==='boss')showCut('BOSS INCOMING / FINAL TASK',game.chapter.boss,game.chapter.bossTitle);
  }
  function selectChar(id){
    if(!C.characters.some(c=>c.id===id))return;
    S.data.selected=id;S.save();go('roster',false);
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('button');if(!target||target.disabled)return;
    if(target.dataset.nav){AG.Audio.sfx('click');go(target.dataset.nav);return;}
    const action=target.dataset.action,id=target.dataset.id;
    if(!action)return;AG.Audio.sfx('click');
    switch(action){
      case 'character':S.data.selected=id;S.save();go('roster');break;
      case 'select-char':selectChar(id);break;
      case 'select-chapter':S.data.chapter=Number(id);S.save();go('map',false);break;
      case 'quick':case 'begin-intro':beginIntro();break;
      case 'next-intro':if(++introPage>=chapter().intro.length)startGame();else showIntro();break;
      case 'skip-intro':startGame();break;
      case 'cancel-intro':hideOverlay();go('map');break;
      case 'upgrade':if(game.choose(Number(id))){hideOverlay();updateHud();}break;
      case 'reroll':game.reroll();break;
      case 'story-choice':if(game.applyStory(Number(id)))showStory(true);break;
      case 'story-continue':game.resume();hideOverlay();break;
      case 'resume':game.resume();hideOverlay();break;
      case 'help':openHelp();break;
      case 'close-help':closeHelp();break;
      case 'abandon':game.state='playing';game.finish(false);break;
      case 'read':{const a=C.archives.find(a=>a.id===id);if(!a)break;if(!S.data.archive.includes(id))toast(unlockHint(a));else{selectedArchive=id;go('archive',false);}break;}
      case 'buy':{if(S.buy(id)){go('workshop',false);toast('강화 완료. 다음 작전부터 모든 직장인에게 적용됩니다.');}else toast('업무 포인트가 부족하거나 이미 완료한 강화입니다.');break;}
      case 'retry':startGame();break;
      case 'next-chapter':S.data.chapter=Math.min(2,S.data.chapter+1);S.save();game.state='idle';hideOverlay();beginIntro();break;
      case 'result-workshop':go('workshop');break;
      case 'result-home':{const win=game.player.hp>0&&game.bossDefeated;if(win)selectedArchive=game.chapter.note;go(win?'archive':'home');break;}
    }
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='motion-toggle'){S.data.settings.motion=e.target.checked;S.save();game.motion=e.target.checked;tools();}
  });
  $('sound-btn').addEventListener('click',()=>{AG.Audio.toggle();tools();});
  $('help-btn').addEventListener('click',()=>{if(ready)openHelp();});
  $('pause-btn').addEventListener('click',()=>game?.pause());
  for(const [id,fn] of [['skill-btn',()=>game?.skill()],['dash-btn',()=>game?.dash()]]){
    $(id).addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fn();});
    $(id).addEventListener('click',e=>{if(e.detail===0)fn();});
  }
  const tracked=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
  document.addEventListener('keydown',e=>{
    if(!ready)return;
    if(e.code==='Tab'&&overlayKind){
      const els=[...$('overlay').querySelectorAll('button:not(:disabled),input:not(:disabled),a[href]')];const first=els[0],last=els.at(-1);
      if(e.shiftKey&&(document.activeElement===first||!$('overlay').contains(document.activeElement))){e.preventDefault();last?.focus();}
      if(!e.shiftKey&&(document.activeElement===last||!$('overlay').contains(document.activeElement))){e.preventDefault();first?.focus();}
    }
    if(!e.repeat){
      if(e.code==='KeyM'){AG.Audio.toggle();tools();}
      if(e.code==='F1'){e.preventDefault();if(overlayKind==='help')closeHelp();else openHelp();}
      if(e.code==='Escape'||e.code==='KeyP'){
        e.preventDefault();
        if(overlayKind==='help')closeHelp();
        else if(overlayKind==='pause'){game.resume();hideOverlay();}
        else if(overlayKind==='intro'){hideOverlay();if(game)game.state='idle';go('map');}
        else if(game?.state==='playing')game.pause();
      }
      if(overlayKind==='upgrade'&&performance.now()>inputGuard&&/^Digit[123]$/.test(e.code)){if(game.choose(Number(e.code.slice(-1))-1)){hideOverlay();updateHud();}}
      if(overlayKind==='story'&&performance.now()>inputGuard&&/^Digit[12]$/.test(e.code)){if(game.applyStory(Number(e.code.slice(-1))-1))showStory(true);}
      if(game?.state==='playing'&&e.code==='Space'){e.preventDefault();game.dash();}
      if(game?.state==='playing'&&e.code==='KeyE'){e.preventDefault();game.skill();}
    }
    if(game?.state==='playing'&&tracked.includes(e.code)){e.preventDefault();keys.add(e.code);controls();}
  });
  document.addEventListener('keyup',e=>{keys.delete(e.code);controls();});
  $('game').addEventListener('pointerdown',e=>{
    if(game?.state!=='playing'||stick.active||e.button>0)return;e.preventDefault();
    const r=$('game').getBoundingClientRect();stick={active:true,id:e.pointerId,x:0,y:0,ox:e.clientX-r.left,oy:e.clientY-r.top};
    $('game').setPointerCapture(e.pointerId);$('touch-stick').hidden=false;$('touch-stick').style.left=(stick.ox-47)+'px';$('touch-stick').style.top=(stick.oy-47)+'px';$('touch-knob').style.transform='translate(0,0)';
  });
  $('game').addEventListener('pointermove',e=>{
    if(!stick.active||e.pointerId!==stick.id)return;e.preventDefault();
    const r=$('game').getBoundingClientRect(),dx=e.clientX-r.left-stick.ox,dy=e.clientY-r.top-stick.oy,len=Math.hypot(dx,dy),factor=len>34?34/len:1;
    stick.x=dx*factor/34;stick.y=dy*factor/34;$('touch-knob').style.transform=`translate(${dx*factor}px,${dy*factor}px)`;controls();
  });
  const release=e=>{if(stick.id===e.pointerId){stick.active=false;stick.id=null;stick.x=stick.y=0;$('touch-stick').hidden=true;controls();}};
  for(const event of ['pointerup','pointercancel','lostpointercapture'])$('game').addEventListener(event,release);
  $('game').addEventListener('contextmenu',e=>e.preventDefault());
  window.addEventListener('blur',()=>{clearInput();if(game?.state==='playing')game.pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(game?.state==='playing')game.pause();}if(game)game.last=performance.now();});
  async function init(){
    $('brand-icon').innerHTML=icon('sprout');$('help-btn').innerHTML=icon('help');tools();
    $('menu').innerHTML='<section class="page"><div class="eyebrow">CONNECTING TO OFFICE NETWORK</div><h1 style="font:32px Georgia;margin-top:24px">회사 시스템에 접속하고 있어요.</h1></section>';
    try{
      await A.prepare();game=new AG.Engine($('game'),gameEvent);ready=true;go('home');
      setInterval(updateHud,100);
      if(!S.available)toast('브라우저 저장이 차단되어 진행도가 이번 세션에서만 유지됩니다.');
      if(new URLSearchParams(location.search).has('debug')){
        window.__AG_TEST__={game,store:S,get route(){return route;},get overlay(){return overlayKind;},
          snapshot:()=>game.snapshot(),
          start:(id='rook',index=0)=>{S.data.selected=id;S.data.chapter=index;startGame();},
          grant:(id,n=1)=>{const m=C.modules.find(m=>m.id===id);if(!m)throw new Error('Unknown module');
            for(let i=0;i<n&&game.levels[id]<m.max;i++){game.levels[id]++;if(id==='hull'){game.player.maxHp+=20;game.heal(30);}}updateModules();},
          xp:n=>{game.gainXp(n);game.checkLevel();},
          step:n=>{game.step(n);updateHud();},
          choose:i=>{const ok=game.choose(i);if(ok)hideOverlay();updateHud();return ok;},
          story:(i=0)=>{if(game.applyStory(i)){game.resume();hideOverlay();}},
          end:win=>game.finish(win),
          updateHud,go};
      }
    }catch(err){
      console.error(err);$('menu').innerHTML=`<section class="page"><h1>출근 준비 중 문제가 생겼어요.</h1><p style="margin:20px 0">페이지를 새로 고치거나 최신 브라우저로 열어 주세요.</p><pre style="white-space:pre-wrap">${escape(err.message)}</pre></section>`;
    }
  }
  init();
})();
