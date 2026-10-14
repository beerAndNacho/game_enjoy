window.AG = window.AG || {};
AG.Store = (() => {
  const KEY='clockout.office.v1';
  const finite=(v,max=1e7)=>Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
  const defaults=()=>({version:2,seeds:0,runs:0,kills:0,clears:{},research:{vitality:0,focus:0,gather:0},archive:['origin'],selected:'rook',chapter:0,choices:{},best:{},settings:{sound:false,motion:!matchMedia('(prefers-reduced-motion: reduce)').matches,tutorialSeen:false}});
  let data=defaults(), available=true;
  try {
    const raw=JSON.parse(localStorage.getItem(KEY)||'null');
    if(raw && raw.version===2){
      for(const k of ['seeds','runs','kills'])data[k]=finite(raw[k]);
      for(const k of ['vitality','focus','gather'])data.research[k]=finite(raw.research?.[k],3);
      data.selected=AG.Content.characters.some(c=>c.id===raw.selected)?raw.selected:'rook';
      data.chapter=finite(raw.chapter,2);
      data.archive=Array.isArray(raw.archive)?[...new Set(['origin',...raw.archive.filter(x=>AG.Content.archives.some(a=>a.id===x))])]:['origin'];
      for(const c of AG.Content.chapters){
        data.clears[c.id]=finite(raw.clears?.[c.id]);
        data.best[c.id]=finite(raw.best?.[c.id]);
      }
      if(raw.choices&&typeof raw.choices==='object'){
        for(const c of AG.Content.chapters)for(const ch of AG.Content.characters){
          const key=ch.id+':'+c.id,v=raw.choices[key];
          if(c.event.choices.some(x=>x.id===v))data.choices[key]=v;
        }
      }
      if(typeof raw.settings?.sound==='boolean')data.settings.sound=raw.settings.sound;
      if(typeof raw.settings?.motion==='boolean')data.settings.motion=raw.settings.motion;
      if(typeof raw.settings?.tutorialSeen==='boolean')data.settings.tutorialSeen=raw.settings.tutorialSeen;
    }
    localStorage.setItem(KEY,JSON.stringify(data));
  } catch(_){ available=false; }
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data));return true;}catch(_){available=false;return false;}};
  const unlock=id=>{if(!data.archive.includes(id)){data.archive.push(id);save();}};
  return {get data(){return data;},get available(){return available;},save,unlock,
    buy(id){const r=AG.Content.research.find(x=>x.id===id);if(!r)return false;const lv=data.research[id],cost=r.cost*(lv+1);if(lv>=r.max||data.seeds<cost)return false;data.seeds-=cost;data.research[id]++;save();return true;},
    finish(result){
      const reward=Math.max(5,Math.floor(result.kills/6)+result.nodes*3+(result.win?35:0));
      data.runs++;data.kills+=result.kills;data.seeds+=reward;data.best[result.chapter.id]=Math.max(data.best[result.chapter.id]||0,result.kills);
      if(result.win){
        data.clears[result.chapter.id]=(data.clears[result.chapter.id]||0)+1;
        unlock(result.chapter.note);unlock(result.character.id);
        if(AG.Content.chapters.every(c=>data.clears[c.id]))unlock('ending');
      }
      if(result.choice)data.choices[result.character.id+':'+result.chapter.id]=result.choice.id;
      save();return reward;
    }
  };
})();
