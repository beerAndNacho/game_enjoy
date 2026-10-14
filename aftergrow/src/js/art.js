/* Original vector illustration for CLOCK OUT! — no third-party image assets. */
window.AG = window.AG || {};
AG.Art = (() => {
  const icons = {
    sprout:'<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M9 5V3h6v2m-3 8v3m-3-2h6"/>',
    badge:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 3v-2h8v2m-7 6a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM8 16q4-5 8 0"/>',
    stamp:'<path d="M9 4a3 3 0 1 1 6 0v4l3 4v3H6v-3l3-4Zm-5 13h16v4H4z"/>',
    coffee:'<path d="M4 7h13v7a6 6 0 0 1-12 0V7Zm13 2h3a3 3 0 0 1 0 6h-3M3 21h17M8 4V2m5 2V2"/>',
    bolt:'<path d="m14 2-9 12h7l-2 8 9-12h-7Z"/>',
    monitor:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v4m-6 0h12M5 7h14"/>',
    robot:'<rect x="4" y="6" width="16" height="14" rx="3"/><path d="M12 2v4m-4 6h.1m8 0h.1M8 16h8M2 11h2m16 0h2"/>',
    pulse:'<circle cx="12" cy="12" r="3"/><path d="M6 6a8.5 8.5 0 0 0 0 12m12-12a8.5 8.5 0 0 1 0 12M3 3a13 13 0 0 0 0 18M21 3a13 13 0 0 1 0 18"/>',
    magnet:'<path d="M5 3v9a7 7 0 0 0 14 0V3h-4v9a3 3 0 0 1-6 0V3ZM5 7h4m6 0h4"/>',
    wind:'<path d="M2 8h13c5 0 5-7 1-6M2 12h18c5 0 4 8 0 7M4 16h8c4 0 4 6 0 6"/>',
    shield:'<path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Zm-4 9 3 3 5-6"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 2v5m0 10v5m-10-10h5m10 0h5"/>',
    star:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
    thorns:'<path d="M4 4h16v16H4zM8 9h8m-8 4h6M8 17h5"/>',
    book:'<path d="M12 5C8 2 3 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-3-2-7-1-10 1Zm0 0v16M5 8l4 1m-4 3 4 1m6-4 4-1m-4 5 4-1"/>',
    flower:'<path d="M4 5h16v14H4zM7 9h10M7 13h6M12 2v3M9 21h6"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
    prism:'<path d="m12 2 10 19H2Zm0 0v19M2 21l10-8 10 8"/>',
    moth:'<rect x="4" y="6" width="16" height="14" rx="3"/><path d="M12 2v4m-4 6h.1m8 0h.1M8 16h8"/>',
    arrow:'<path d="M4 12h16m-7-7 7 7-7 7"/>',
    close:'<path d="m5 5 14 14M5 19 19 5"/>',
    sound:'<path d="m3 9 5-1 5-5v18l-5-5-5-1Zm14-3c4 3 4 9 0 12m3-15c6 5 6 13 0 18"/>',
    mute:'<path d="m3 9 5-1 5-5v18l-5-5-5-1Zm14-1 5 8m-5 0 5-8"/>',
    help:'<circle cx="12" cy="12" r="10"/><path d="M9 8c0-4 7-4 7 0 0 3-4 3-4 6m0 3v1"/>',
    map:'<path d="m2 5 6-3 8 3 6-3v17l-6 3-8-3-6 3Zm6-3v17m8-14v17"/>',
    check:'<path d="m4 12 5 5L20 5"/>',
    letter:'<rect x="2" y="5" width="20" height="15" rx="2"/><path d="m2 6 10 8L22 6"/>',
    lock:'<rect x="4" y="10" width="16" height="12" rx="3"/><path d="M7 10V7a5 5 0 0 1 10 0v3m-5 5v3"/>'
  };
  const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${icons[name]||icons.badge}</svg>`;
  const ink='#131427';
  const defs=`
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ec5398"/><stop offset=".48" stop-color="#792f7f"/><stop offset="1" stop-color="#1c2249"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#78e2e4"/><stop offset="1" stop-color="#384c85"/></linearGradient>
    <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffdbb5"/><stop offset="1" stop-color="#d89988"/></linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e6e7ff"/><stop offset=".5" stop-color="#bdc8ff"/><stop offset="1" stop-color="#899bd3"/></linearGradient>
    <linearGradient id="deep" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#425079"/><stop offset="1" stop-color="#1a1b3f"/></linearGradient>
    <linearGradient id="neon" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff3a0"/><stop offset="1" stop-color="#ffb832"/></linearGradient>
    <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="#fff" opacity=".14"/></pattern>
    <pattern id="tiles" width="86" height="86" patternUnits="userSpaceOnUse"><path d="M86 0H0V86" fill="none" stroke="#151b37" stroke-width="2" opacity=".65"/></pattern>
    <filter id="shade" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="8" dy="12" stdDeviation="0" flood-color="#111327" flood-opacity=".75"/></filter>`;
  function wrap(body,viewBox,extra=''){
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ${extra}><defs>${defs}</defs>${body}</svg>`;
  }
  const stroke=`stroke="${ink}" stroke-width="5" stroke-linejoin="round"`;
  const configs={
    rook:{skin:'#f3b691',hair:'#1b2547',jacket:'#f3d24e',trousers:'#2d3d61',shirt:'#f8efe5',accent:'#f55869',body:'suit'},
    lumen:{skin:'#edbbad',hair:'#653061',jacket:'#fa69a4',trousers:'#483054',shirt:'#ffe6f0',accent:'#f9cf4c',body:'suit'},
    briar:{skin:'#b77f6a',hair:'#d7e8df',jacket:'#50d2c5',trousers:'#254f5d',shirt:'#eff8f1',accent:'#f58c62',body:'suit'},
    io:{skin:'#dcad9a',hair:'#22294e',jacket:'#797de5',trousers:'#292b51',shirt:'#cae0fa',accent:'#88e8fb',body:'hood'}
  };
  function figure(id){
    const c=configs[id]||configs.rook;
    let hair='';let props='';let accessory='';
    if(id==='rook'){
      hair=`<path d="M-51-181q-9-61 38-70 53-14 72 30l-10 44-12-31q-41 12-78 17Z" fill="${c.hair}" ${stroke}/><path d="m-42-236 24-12m3 7 32-15m7 10 24-12" stroke="#617599" stroke-width="6"/>`;
      props=`<g transform="translate(75 -5) rotate(-16)"><rect x="-30" y="-43" width="62" height="84" rx="6" fill="#e8efee" ${stroke}/><rect x="-16" y="-49" width="34" height="13" rx="4" fill="#ffcf40" ${stroke}/><path d="M-16-20h33M-16-5h33M-16 10h24" stroke="#354b67" stroke-width="4"/><path d="m-14 23 9 8 18-16" stroke="#eb5665" stroke-width="6" fill="none"/></g>`;
      accessory=`<path d="m-5-80 13 0-4 21 14 31-14 19-15-21 13-29Z" fill="#ee5367" ${stroke}/>`;
    }else if(id==='lumen'){
      hair=`<path d="M-63-196q-4-63 52-65 60-3 68 68l15 75-39-6-7-90q-29-18-60 6l-8 87-40 7Z" fill="${c.hair}" ${stroke}/><path d="M-55-229q27-35 76-26" stroke="#bd6da7" stroke-width="7" fill="none"/>`;
      props=`<g transform="translate(76 -20) rotate(12)"><rect x="-38" y="-42" width="76" height="95" rx="8" fill="#292c52" ${stroke}/><rect x="-27" y="-31" width="54" height="71" rx="3" fill="#f8cee5"/><path d="M-18-18h36M-18-4h36M-18 10h36M-18 24h26" stroke="#aa6396" stroke-width="4"/><rect x="-27" y="-31" width="54" height="11" fill="#ffce3f"/></g>`;
      accessory=`<path d="M-14-91 0-59l17-32" fill="none" stroke="#ffcf40" stroke-width="7"/><circle cx="0" cy="-61" r="5" fill="#ffcf40"/>`;
    }else if(id==='briar'){
      hair=`<path d="M-55-177q-21-66 37-76 67-18 79 61l-9-3q-13-36-29-35-18 18-71 20Z" fill="${c.hair}" ${stroke}/><path d="M-48-238q47-21 75-7" stroke="#fff8e8" stroke-width="7"/>`;
      props=`<g transform="translate(82 -8) rotate(-12)"><rect x="-34" y="-35" width="70" height="73" rx="7" fill="#ffca40" ${stroke}/><path d="M-18-13h35M-18 1h35M-18 16h25" stroke="#614a62" stroke-width="5"/><rect x="-25" y="-47" width="54" height="14" rx="4" fill="#49bcae" ${stroke}/></g>`;
      accessory=`<path d="M-35-171h31m5 0h34" stroke="#1d2346" stroke-width="4"/><rect x="-45" y="-187" width="39" height="27" rx="7" fill="none" stroke="#253353" stroke-width="5"/><rect x="4" y="-187" width="40" height="27" rx="7" fill="none" stroke="#253353" stroke-width="5"/><path d="m-22-134 26 8 27-8" stroke="#653f3b" stroke-width="5" fill="none"/>`;
    }else{
      hair=`<path d="M-52-187q-9-65 45-73 51-10 69 57l-18 25-14-51q-24 23-82 23Z" fill="${c.hair}" ${stroke}/><path d="M51-233q34 15 36 54l-14 8-28-41" fill="#374875" ${stroke}/>`;
      props=`<g transform="translate(81 -11) rotate(6)"><rect x="-48" y="-30" width="91" height="63" rx="6" fill="#2b355c" ${stroke}/><rect x="-40" y="-22" width="76" height="43" rx="2" fill="#78dce9"/><path d="M-33-13h20m-16 9h32m-25 9h18" stroke="#28576d" stroke-width="5"/><path d="M-53 36h106l-8 11h-90Z" fill="#b0bbdf" ${stroke}/></g>`;
      accessory=`<path d="M-53-200q-25 10-23 45v18h16v-17q0-29 11-31m99-15q24 11 23 45v18H57v-18q0-27-9-30" stroke="#7aebf2" stroke-width="8" fill="none"/><rect x="-76" y="-157" width="17" height="34" rx="8" fill="#343b63" ${stroke}/><rect x="57" y="-157" width="17" height="34" rx="8" fill="#343b63" ${stroke}/>`;
    }
    const collar=id==='io'?`<path d="m-43-87 37 50L42-86" fill="none" stroke="#b6c7ff" stroke-width="9"/>`:`<path d="m-36-89 36 43 31-43" fill="none" stroke="${c.shirt}" stroke-width="14"/>`;
    return `
      <!-- legs, boots -->
      <path d="M-59-29-57 79q18 21 41 5l16-66 13 67q27 19 42-9l-3-107Z" fill="${c.trousers}" ${stroke}/>
      <path d="M-57 65h40l-3 23q-27 14-48-1Zm72 0h39l11 24q-30 12-51-4Z" fill="#13172f" ${stroke}/>
      <!-- shoulders and arms -->
      <path d="M-47-116q-34-1-44 32l-10 55q3 21 20 22l43-13 12-76Z" fill="${c.jacket}" ${stroke}/>
      <path d="M47-116q39-1 44 34l13 51q-4 22-25 22l-42-18-5-73Z" fill="${c.jacket}" ${stroke}/>
      <path d="M-82-36q-18 10-19 19l16 20 23-13Zm162 0q18 3 22 20L87 2 67-16Z" fill="url(#skin)" ${stroke}/>
      <!-- torso jacket -->
      <path d="M-44-117 0-130 47-117 63 22Q2 40-62 21Z" fill="${c.jacket}" ${stroke}/>
      <path d="M-30-112Q0-78 26-111l-6 100h-36Z" fill="${c.shirt}" ${stroke}/>
      ${collar}${accessory}
      <path d="M-44-117-3-52-37-21 7 24l-54-4-10-120Zm89 0L3-52 38-21-7 24l54-4 13-120Z" fill="${c.jacket}" ${stroke}/>
      <path d="M-43-94-16-52-38-34m80-60L14-52l24 18" stroke="#fff" opacity=".27" stroke-width="7" fill="none"/>
      <!-- neck/head -->
      <path d="M-19-131v32q18 19 39 0v-34Z" fill="${c.skin}" ${stroke}/>
      <path d="M-58-193q0-61 58-64 56 2 59 62l-6 34q-4 53-49 58-51-3-56-60Z" fill="url(#skin)" ${stroke}/>
      <ellipse cx="-56" cy="-172" rx="10" ry="16" fill="${c.skin}" ${stroke}/><ellipse cx="57" cy="-172" rx="10" ry="16" fill="${c.skin}" ${stroke}/>
      ${hair}
      <path d="M-36-181q13-7 25 1m20-1q13-7 25 1" stroke="${ink}" stroke-width="4" fill="none"/>
      <circle cx="-24" cy="-164" r="4.8" fill="${ink}"/><circle cx="24" cy="-164" r="4.8" fill="${ink}"/>
      <path d="m-3-158-4 19 10 3" fill="none" stroke="#b5716c" stroke-width="3.5"/>
      <path d="M-17-123q19 15 35-2" fill="none" stroke="#823c50" stroke-width="4" stroke-linecap="round"/>
      <path d="M-36-144q-8 3-10 8m76-9q8 3 11 8" stroke="#ed7f87" opacity=".7" stroke-width="5"/>
      ${id==='io'||id==='briar'?accessory:''}${props}
      <!-- badge -->
      <rect x="-51" y="-10" width="33" height="31" rx="3" fill="#ffffff" ${stroke}/><rect x="-46" y="-5" width="23" height="7" fill="${c.accent}"/><path d="M-45 9h18m-18 6h12" stroke="#55566b" stroke-width="3"/>
    `;
  }
  function portrait(id){
    const ch=AG.Content.characters.find(c=>c.id===id)||AG.Content.characters[0];
    const color=ch.color;
    return wrap(`
      <path d="M51 61 454 10 471 470 114 551Z" fill="${color}" opacity=".1"/>
      <circle cx="249" cy="272" r="186" fill="none" stroke="${color}" stroke-width="9" opacity=".9"/>
      <circle cx="249" cy="272" r="157" fill="url(#dots)"/>
      <path d="M70 440 445 82" stroke="${color}" opacity=".45" stroke-width="5"/>
      <path d="M73 97h107M72 113h67M373 445h71m-42-27h42" stroke="${color}" stroke-width="6"/>
      <text x="252" y="537" font-family="Impact,Arial Black,sans-serif" font-weight="900" font-style="italic" text-anchor="middle" font-size="72" fill="${color}" opacity=".3">${ch.code}</text>
      <ellipse cx="251" cy="530" rx="120" ry="20" fill="#0a0d22" opacity=".55"/>
      <g transform="translate(250 394) scale(1.32)" filter="url(#shade)">${figure(id)}</g>
      <rect x="31" y="32" width="70" height="32" fill="${color}"/><text x="66" y="54" fill="#151625" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="16">STAFF</text>
    `,'0 0 500 570');
  }
  const sprite=id=>wrap(`<g transform="translate(142 299)">${figure(id)}</g>`,'0 0 284 402');
  const enemyShapes={
    spore:`<g transform="rotate(-8)"><rect x="-36" y="-40" width="72" height="75" rx="4" fill="#ffd33b" ${stroke}/><path d="M17-40h19v20L17-40" fill="#fff7bf" ${stroke}/><path d="M-19-5h12m13 0h13" stroke="#312039" stroke-width="6"/><path d="m-13 17 13-7 13 7" fill="none" stroke="#b63454" stroke-width="5"/><text x="0" y="-23" text-anchor="middle" fill="#b23b50" font-family="Arial" font-size="9" font-weight="900">ASAP</text></g>`,
    runner:`<circle cy="-7" r="37" fill="#ff779d" ${stroke}/><circle cy="-7" r="29" fill="#f9d1d9" ${stroke}/><path d="M0-7v-20M0-7l15 9" stroke="#24243d" stroke-width="6"/><path d="m-34-24-13-13m79 13 13-13" stroke="#f6ca38" stroke-width="9"/><path d="M-18 30-28 47m45-17 25 17" stroke="#1c2945" stroke-width="7"/>`,
    brute:`<rect x="-42" y="-50" width="86" height="90" rx="9" fill="#7486da" ${stroke}/><rect x="-54" y="-57" width="93" height="90" rx="8" fill="#f6d44d" ${stroke}/><rect x="-40" y="-67" width="89" height="88" rx="8" fill="#f18d69" ${stroke}/><path d="M-21-48h40m-40 11h25m-25 11h40" stroke="#fff0b8" stroke-width="6"/><path d="M-17-4h11M7-4h10" stroke="#21203b" stroke-width="7"/><path d="M-10 15h20" stroke="#21203b" stroke-width="5"/>`,
    shooter:`<rect x="-45" y="-52" width="90" height="98" rx="12" fill="#20284b" ${stroke}/><rect x="-35" y="-40" width="70" height="73" rx="4" fill="#8de7ea"/><path d="M-35-40h70v18h-70" fill="#ff719b"/><circle cx="-24" cy="-31" r="3" fill="#ffdb4e"/><circle cx="-13" cy="-31" r="3" fill="#ffdb4e"/><path d="M-17-9h10m14 0h10M-10 14l11-10 11 10" stroke="#222449" stroke-width="5" fill="none"/>`,
    beetle:`<path d="m-24-9-14-12m8 28-17 8m65-24 16-13m-2 30 15 8" stroke="#1a2648" stroke-width="6"/><path d="M-36-25h72v57h-72Z" fill="#f1e9d9" ${stroke}/><path d="m-36-25 36 29 36-29" fill="none" stroke="#d85f7f" stroke-width="6"/><path d="M-17 15h11m12 0h11" stroke="#30233e" stroke-width="5"/>`
  };
  function enemy(type,chapter=0){
    let shape=enemyShapes[type];
    if(type==='boss'){
      const shades=['#ffcf40','#ff77a6','#79e5e3'];
      const col=shades[chapter];
      shape=`<path d="M-65 79-95 105m159-26 32 27" stroke="#14182f" stroke-width="18"/>
      <rect x="-94" y="-98" width="188" height="190" rx="15" fill="#202544" ${stroke}/>
      <rect x="-79" y="-83" width="158" height="156" rx="6" fill="${col}" ${stroke}/>
      <rect x="-79" y="-83" width="158" height="28" fill="#f7e2d1"/><circle cx="-59" cy="-68" r="7" fill="#e75c76"/><circle cx="-35" cy="-68" r="7" fill="#eec540"/>
      ${chapter===0?'<path d="M-48-30h96M-48-11h96M-48 8h55" stroke="#503a5a" stroke-width="9"/><text x="0" y="53" fill="#432241" text-anchor="middle" font-family="Arial" font-size="27" font-weight="900">DUE!</text>':chapter===1?'<rect x="-49" y="-38" width="98" height="74" fill="#ffd8eb" stroke="#79355f" stroke-width="6"/><circle cx="-22" cy="-10" r="12" fill="#c75288"/><path d="M0-7h35m-35 17h35M-30 26h60" stroke="#9e5080" stroke-width="6"/>':'<rect x="-48" y="-40" width="96" height="83" fill="#1f2c4b" stroke="#b3f6e9" stroke-width="5"/><path d="m-28 0 14-16-14-16m35 30h22" stroke="#78eecb" stroke-width="7" fill="none"/><text x="0" y="59" text-anchor="middle" fill="#243e5b" font-family="Arial" font-size="15" font-weight="900">404 HOME</text>'}
      <path d="M-36-105h73l-13-18h-46Z" fill="#f2e9d5" ${stroke}/>`;
    }
    return wrap(`<g transform="translate(125 ${type==='boss'?129:160}) scale(${type==='boss'?1:.86})">${shape}</g>`,type==='boss'?'0 0 250 250':'72 87 106 117');
  }
  function scene(chapter=0,cast=true){
    const pal=[['#d65795','#263763','#ffc73d'],['#a83e95','#25224a','#ff7bac'],['#304f92','#0c1738','#7bebe0']][chapter];
    const [sun,dark,accent]=pal;
    let s=`<rect width="1400" height="840" fill="${dark}"/>
      <path d="M0 0h1400v570L488 730 0 486Z" fill="url(#sky)"/>
      <path d="M515-20h920v645l-915 58Z" fill="${dark}" opacity=".17"/>
      <circle cx="990" cy="195" r="190" fill="${accent}" opacity=".17"/>
      <circle cx="990" cy="195" r="140" fill="${accent}" opacity=".13"/>
      <path d="M0 740 1400 490v350H0Z" fill="#23253e"/>
      <path d="M0 786 1400 540" stroke="${accent}" stroke-opacity=".13" stroke-width="15"/>
      <path d="M445 0 435 840m330-840 5 840m315-840 4 840" stroke="#0c1730" stroke-width="22" opacity=".7"/>`;
    // Distant city in huge office windows.
    for(let i=0;i<18;i++){
      const x=520+i*51;const h=155+(i*37)%250;
      s+=`<rect x="${x}" y="${470-h}" width="${43+i%3*5}" height="${h+60}" fill="${i%3?'#1d244b':'#202b59'}" stroke="#121a39" stroke-width="4"/>`;
      for(let yy=485-h;yy<476;yy+=24)for(let xx=x+8;xx<x+38;xx+=14)if((Math.round(xx+yy)+i)%5!==0)s+=`<rect x="${xx}" y="${yy}" width="7" height="10" fill="${accent}" opacity="${.1+((i+xx)%4)*.1}"/>`;
    }
    s+=`<path d="M430 0v513H1400" fill="none" stroke="#151a33" stroke-width="22"/><path d="M740 0v500M1050 0v500" stroke="#151a33" stroke-width="15"/>`;
    if(chapter===0){
      // open office desks, monitor screens, swivel chairs
      for(let i=0;i<5;i++){
        const x=535+i*177,y=545+i%2*38;
        s+=`<g transform="translate(${x} ${y})"><path d="M-60 60h153v14H-60Z" fill="#e2a767" stroke="#222543" stroke-width="8"/><rect x="-26" y="-38" width="81" height="57" rx="6" fill="#1d294a" stroke="#121729" stroke-width="7"/><rect x="-18" y="-30" width="64" height="39" fill="${i%2?'#fc9ca7':'#84c7de'}"/><path d="M14 20v40" stroke="#1d294a" stroke-width="10"/><path d="M-34 76v59m110-59v59" stroke="#181c35" stroke-width="9"/></g>`;
      }
    }else if(chapter===1){
      s+=`<rect x="700" y="130" width="550" height="300" rx="10" fill="#1c2141" stroke="#f7a1c4" stroke-width="13"/><rect x="720" y="150" width="510" height="260" fill="#4e477b"/>
        <path d="M770 232h390m-390 55h290m-290 55h345" stroke="#ffaec7" stroke-width="10" opacity=".55"/>
        <circle cx="1158" cy="190" r="21" fill="#ffce40"/>
        <path d="M550 626 980 511l305 105-460 194Z" fill="#e1a5b2" stroke="#222344" stroke-width="15"/><path d="M640 610 830 562l322 78" stroke="#714d85" stroke-width="8"/>`;
    }else{
      for(let i=0;i<7;i++){
        const x=542+i*114;
        s+=`<rect x="${x}" y="175" width="96" height="390" rx="6" fill="#131b35" stroke="#45588d" stroke-width="10"/>`;
        for(let k=0;k<10;k++)s+=`<rect x="${x+15}" y="${192+k*34}" width="67" height="21" rx="2" fill="#283962" stroke="#5674a6" stroke-width="3"/><circle cx="${x+70}" cy="${204+k*34}" r="4" fill="${k%4?'#72dce0':'#ff818c'}"/>`;
      }
      s+=`<path d="M580 740h720" stroke="#5eead7" stroke-width="8" opacity=".35"/>`;
    }
    s+=`<path d="M465 705 1400 619v221H465Z" fill="#25233f" opacity=".85"/><path d="M480 725 1380 648" stroke="${accent}" stroke-opacity=".31" stroke-width="5"/>`;
    // Comic panel accents and speed lines.
    for(let i=0;i<18;i++)s+=`<path d="M${920+i*24} ${40+i*10} 1400 ${30+i*39}" stroke="${accent}" stroke-width="${i%3===0?5:2}" opacity=".16"/>`;
    if(cast){
      s+=`<path d="M695 680 1223 588l123 80-643 133Z" fill="#070b1e" opacity=".45"/>
        <g transform="translate(865 641) scale(.8) rotate(-8)" filter="url(#shade)">${figure('lumen')}</g>
        <g transform="translate(1153 647) scale(.82) rotate(8)" filter="url(#shade)">${figure(chapter===2?'io':'briar')}</g>
        <g transform="translate(999 666) scale(1.18)" filter="url(#shade)">${figure(chapter===1?'lumen':'rook')}</g>`;
    }
    s+=`<path d="M482 97h145v9H482Zm0 22h91v8h-91Z" fill="${accent}" opacity=".65"/>
      <path d="M1315 560l50 30-50 30" stroke="${accent}" stroke-width="10" fill="none" opacity=".5"/>
      <rect x="0" y="0" width="1400" height="840" fill="url(#dots)" opacity=".28"/>`;
    return wrap(s,'0 0 1400 840','preserveAspectRatio="xMidYMid slice"');
  }
  const uri=svg=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  const portraits={},sprites={},enemies={},scenes={};
  function load(source){return new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=source;});}
  async function prepare(){
    const tasks=[];
    for(const c of AG.Content.characters){portraits[c.id]=uri(portrait(c.id));tasks.push(load(uri(sprite(c.id))).then(im=>sprites[c.id]=im));}
    for(const type of [...Object.keys(enemyShapes),'boss'])for(let i=0;i<(type==='boss'?3:1);i++)tasks.push(load(uri(enemy(type,i))).then(im=>enemies[type+(type==='boss'?i:'')]=im));
    for(let i=0;i<3;i++)scenes[i]=uri(scene(i,true));
    await Promise.all(tasks);
  }
  return {icon,figure,portrait,sprite,enemy,scene,uri,prepare,portraits,sprites,enemies,scenes};
})();
