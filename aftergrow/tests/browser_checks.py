"""Chromium checks against the real HTML/CSS/JS, in an isolated inline document.
No network is required. Storage-success tests use a named in-memory localStorage
adapter because about:blank has no persistent origin. A separate test covers
the native blocked-storage path. Install Playwright and a Chromium executable.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import argparse, json, time, traceback, shutil

ROOT=Path(__file__).resolve().parents[1]/"src"
REPORT=ROOT.parent/"tests"/"last-run.json"
PREVIEWS=ROOT.parent/"docs"/"previews"
parser=argparse.ArgumentParser()
parser.add_argument("--browser",default=shutil.which("chromium"))
parser.add_argument("--screenshots",action="store_true")
args=parser.parse_args()
results=[]
errors=[]
def check(name, fn):
    started=time.perf_counter()
    try:
        detail=fn()
        results.append({"name":name,"passed":True,"seconds":round(time.perf_counter()-started,3),"detail":detail})
        print("PASS",name, flush=True)
    except Exception as e:
        results.append({"name":name,"passed":False,"error":str(e)})
        print("FAIL",name,str(e),flush=True)
        traceback.print_exc()
def expect(value, message="Assertion failed"):
    assert value, message

def document(debug=True,storage=True,saved=None):
    html=(ROOT/"index.html").read_text(encoding="utf-8")
    html=html.replace('<link rel="stylesheet" href="styles.css">',"<style>"+(ROOT/"styles.css").read_text(encoding="utf-8")+"</style>")
    if storage:
        values={} if saved is None else {"clockout.office.v1":json.dumps(saved,ensure_ascii=False)}
        mock="""<script>
        window.__testStorageValues=%s;
        Object.defineProperty(window,'localStorage',{configurable:true,value:{
          getItem(k){return Object.prototype.hasOwnProperty.call(__testStorageValues,k)?__testStorageValues[k]:null},
          setItem(k,v){__testStorageValues[k]=String(v)},removeItem(k){delete __testStorageValues[k]},clear(){window.__testStorageValues={}}
        }});
        </script>"""%json.dumps(values,ensure_ascii=False)
        html=html.replace('<script src="js/content.js"></script>',mock+'<script src="js/content.js"></script>')
    for name in ["content","storage","art","audio","engine","app"]:
        js=(ROOT/"js"/(name+".js")).read_text(encoding="utf-8")
        js=js.replace("new URLSearchParams(location.search).has('debug')","true" if debug else "false")
        html=html.replace('<script src="js/'+name+'.js"></script>',"<script>"+js+"</script>")
    return html

with sync_playwright() as playwright:
    browser=playwright.chromium.launch(executable_path=args.browser,headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
    context=browser.new_context(viewport={"width":1440,"height":1000},device_scale_factor=1)
    context.set_default_timeout(6000)
    page=context.new_page()
    page.on("pageerror",lambda e:errors.append(str(e)))
    def load(p=page,**kwargs):
        p.set_content(document(**kwargs))
        p.wait_for_function("window.AG && document.querySelector('.hero')",timeout=20000)
    load()
    def js(source):return page.evaluate(source)
    def start(character="rook",chapter=0):
        js(f"__AG_TEST__.start({json.dumps(character)},{chapter}); __AG_TEST__.game.manual=true;")
    def quiet():
        js("""(()=>{const g=__AG_TEST__.game;g.enemies=[];g.spawnClock=999;g.player.invuln=1000;g.player.nextXp=1e9;g.storyDone=true;})()""")
    def snap():return js("__AG_TEST__.snapshot()")
    def screen(name,p=page,full=False):
        if args.screenshots:
            p.wait_for_timeout(600)
            p.screenshot(path=str(PREVIEWS/name),full_page=full)
    PREVIEWS.mkdir(parents=True,exist_ok=True)
    check("01. Home loads and all four sprite images decode",lambda:expect(js("Object.values(AG.Art.sprites).length===4 && Object.values(AG.Art.sprites).every(i=>i&&i.naturalWidth>0)&&Object.values(AG.Art.enemies).every(i=>i&&i.naturalWidth>0)")))
    screen("01-home-desktop.png",full=True)

    def routes():
        for route in ["roster","map","archive","workshop","home"]:
            js(f"__AG_TEST__.go('{route}')")
            expect(js("document.documentElement.scrollWidth <= innerWidth+1"),route+" overflows")
        return "Five routes, 1440 px"
    check("02. All desktop menu routes render without horizontal overflow",routes)
    def roster():
        js("__AG_TEST__.go('roster')")
        for c in ["rook","lumen","briar","io"]:
            page.click(f'[data-action="select-char"][data-id="{c}"]')
            expect(js(f"AG.Store.data.selected==='{c}'"))
            expect(js("(()=>{const a=document.querySelector('.roster-portrait').getBoundingClientRect(),b=document.querySelector('.roster-portrait img').getBoundingClientRect();return b.height<=a.height+1&&b.width<=a.width+1})()"),"portrait exceeds frame")
        page.click('[data-action="select-char"][data-id="rook"]')
    check("03. Four selectable characters and bounded portraits",roster)
    screen("02-roster-desktop.png",full=True)
    page.click('[data-action="select-char"][data-id="lumen"]')
    screen("03-lumen-desktop.png",full=True)
    js("__AG_TEST__.go('map')")
    screen("04-map-desktop.png",full=True)

    def intro():
        page.click('[data-action="begin-intro"]')
        expect(js("__AG_TEST__.overlay==='intro'"))
        for _ in range(3):page.click('[data-action="next-intro"]')
        expect(snap()["state"]=="playing")
        js("__AG_TEST__.game.manual=true")
    check("04. Three-page prologue enters the selected expedition",intro)
    def attacks():
        info={}
        for c,typ in [("rook","bullets"),("lumen","bullets"),("briar","slashes"),("io","beams")]:
            start(c);quiet()
            js("""(()=>{const g=__AG_TEST__.game;for(let i=0;i<3;i++){const e=g.spawn('spore');e.x=g.player.x+75+i*35;e.y=g.player.y;e.hp=e.maxHp=1000;}g.attack();})()""")
            value=js(f"__AG_TEST__.game.{typ}.length")
            expect(value>0,c+" has no attack")
            info[c]=value
        return info
    check("05. Four primary weapons create their distinct combat effects",attacks)
    def skills():
        start("rook");quiet();expect(js("__AG_TEST__.game.skill() && __AG_TEST__.game.player.buff===6"))
        start("lumen");quiet()
        expect(js("""(()=>{const g=__AG_TEST__.game,e=g.spawn('brute');e.x=g.player.x+80;e.y=g.player.y;e.hp=500;g.enemyBullet(e,0,50,10);g.skill();return e.hp<500&&g.enemyShots.length===0})()"""))
        start("briar");quiet();js("__AG_TEST__.game.player.hp=50; __AG_TEST__.game.skill()")
        expect(snap()["player"]["hp"]==68 and snap()["player"]["invuln"]==4)
        start("io");quiet()
        expect(js("""(()=>{const g=__AG_TEST__.game,e=g.spawn('brute');e.x=g.player.x+300;e.y=g.player.y;e.hp=1000;g.fireClock=999;g.skill();const x=e.x;g.step(.5);return g.player.freeze>4&&e.x===x})()"""))
        return "Overcharge, projectile clear, heal/shield, freeze"
    check("06. All four active skills have measurable distinct effects",skills)
    def movement():
        start();quiet()
        return js("""(()=>{const g=__AG_TEST__.game;let x=g.player.x,y=g.player.y;g.setInput(1,0);g.step(.5);const a=Math.hypot(g.player.x-x,g.player.y-y);x=g.player.x;y=g.player.y;g.setInput(1,1);g.step(.5);const b=Math.hypot(g.player.x-x,g.player.y-y);if(Math.abs(a-b)>1)throw Error('Diagonal speed');g.player.x=2140;g.player.y=1550;g.step(.4);if(g.player.x>2134||g.player.y>1534)throw Error('World boundary');return {axis:a,diagonal:b}})()""")
    check("07. Movement normalizes diagonals and clamps arena edges",movement)
    def dash():
        start();quiet()
        expect(js("""(()=>{const g=__AG_TEST__.game,x=g.player.x;const first=g.dash(),second=g.dash();g.step(.18);return first&&!second&&g.player.x-x>110&&g.player.dashCd>2&&g.player.invuln>0})()"""))
    check("08. Dash moves, protects, and respects cooldown",dash)
    def pause():
        start();quiet();page.keyboard.press("p");before=snap()
        js("__AG_TEST__.step(2)");expect(snap()["time"]==before["time"])
        page.click('[data-action="resume"]');expect(snap()["state"]=="playing")
        page.keyboard.press("Escape");expect(snap()["state"]=="paused")
    check("09. Keyboard and button pause freeze simulation",pause)

    def upgrades():
        start();js("__AG_TEST__.xp(5)")
        s=snap();expect(s["state"]=="upgrade" and len(set(s["choices"]))==3)
        page.click('[data-action="reroll"]');expect(snap()["rerolls"]==0)
        before=snap()["choices"];expect(not js("__AG_TEST__.game.reroll()"));expect(snap()["choices"]==before)
        page.wait_for_timeout(230);page.keyboard.press("1");expect(snap()["state"]=="playing")
        return s["choices"]
    check("10. Level-up, three choices, keyboard pick and single reroll",upgrades)
    def help_restore():
        start();js("__AG_TEST__.xp(5)");before=snap()["choices"]
        page.keyboard.press("F1");expect(snap()["state"]=="help")
        page.keyboard.press("Escape");expect(snap()["state"]=="upgrade" and snap()["choices"]==before)
        page.keyboard.press("Tab")
        expect(js("document.getElementById('overlay').contains(document.activeElement)"))
    check("11. Help restores a pending upgrade and retains modal focus",help_restore)
    screen("06-upgrade-desktop.png")
    def evolution(eid,needs):
        start("rook");quiet()
        for name,n in needs.items():js(f"__AG_TEST__.grant('{name}',{n})")
        js("__AG_TEST__.game.player.nextXp=5;__AG_TEST__.xp(5)")
        expect(eid in snap()["choices"],"Evolution missing")
        index=snap()["choices"].index(eid);js(f"__AG_TEST__.choose({index})")
        expect(snap()["evolved"][eid])
        if eid=="dawn":
            expect(js("""(()=>{const g=__AG_TEST__.game;g.bullets=[];const e=g.spawn('brute');e.x=g.player.x+100;e.y=g.player.y;g.attack();return g.bullets.length===3&&g.bullets.every(b=>b.pierce===3)})()"""))
        elif eid=="hive":
            expect(js("""(()=>{const g=__AG_TEST__.game;g.player.nextXp=1e9;g.bullets=[];const e=g.spawn('brute');e.x=g.player.x+300;e.y=g.player.y;e.hp=2000;g.droneClock=0;g.step(.02);return g.bullets.filter(b=>b.drone).length===4})()"""))
        else:
            expect(js("""(()=>{const g=__AG_TEST__.game,e=g.spawn('brute');e.x=g.player.x+150;e.y=g.player.y;e.hp=2000;g.pulseClock=0;g.step(.02);return e.slow>1.9&&g.rings.some(r=>r.r===211)})()"""))
    check("12. Dawn evolution changes the primary weapon to piercing multishot",lambda:evolution("dawn",{"weapon":3,"rapid":2}))
    check("13. Hive evolution doubles companion drones",lambda:evolution("hive",{"drone":2,"magnet":2}))
    check("14. Eden evolution enlarges and slows with the pulse",lambda:evolution("eden",{"pulse":2,"hull":2}))

    def node():
        start();quiet()
        expect(js("""(()=>{const g=__AG_TEST__.game,n=g.nodes[0];g.player.hp=30;g.player.x=n.x;g.player.y=n.y;const e=g.spawn('brute');e.x=n.x+160;e.y=n.y;e.hp=e.maxHp=2000;g.fireClock=999;g.step(2.1);return g.nodesRestored===1&&g.player.hp===66&&n.cooldown>22&&e.hp<2000&&g.player.xp>=5})()"""))
    check("15. Node channel grants healing, XP, damage and cooldown",node)
    def stories():
        details=[]
        for ch in range(3):
            for option in range(2):
                start("rook",ch);quiet()
                js("__AG_TEST__.game.storyDone=false;__AG_TEST__.game.time=64.99;__AG_TEST__.step(.03)")
                expect(snap()["state"]=="story")
                before=snap()["time"];js("__AG_TEST__.step(2)");expect(snap()["time"]==before)
                page.click(f'[data-action="story-choice"][data-id="{option}"]')
                expect(js("__AG_TEST__.overlay==='story-reply'"))
                expect(snap()["choice"] is not None)
                page.click('[data-action="story-continue"]');expect(snap()["state"]=="playing")
                details.append({"chapter":ch,"choice":snap()["choice"],"bonus":snap()["bonus"]})
        return details
    check("16. All six story choices pause, apply effects and resume",stories)
    # Save an actual story overlay for the review gallery.
    start("io",1);quiet();js("__AG_TEST__.game.storyDone=false;__AG_TEST__.game.time=65;__AG_TEST__.step(.02)")
    screen("07-story-desktop.png")

    def bosses():
        info=[]
        for ch in range(3):
            start("rook",ch);quiet()
            js("__AG_TEST__.game.time=144.99;__AG_TEST__.step(.03);__AG_TEST__.game.boss.cd=0;__AG_TEST__.step(.02)")
            d=js("({hazards:__AG_TEST__.game.hazards.length,shots:__AG_TEST__.game.enemyShots.length,windup:__AG_TEST__.game.boss.windup})")
            if ch==0:expect(d["hazards"]==3 and d["shots"]==0)
            if ch==1:expect(d["shots"]==10)
            if ch==2:expect(d["shots"]==8 and d["hazards"]==3 and d["windup"]>0)
            info.append(d)
        return info
    check("17. Three guardians use different real attack patterns",bosses)
    def win_rules():
        start();quiet();js("__AG_TEST__.game.time=144.99;__AG_TEST__.step(.03)")
        js("__AG_TEST__.game.time=180;__AG_TEST__.step(.05)")
        expect(snap()["state"]=="playing","Timer alone must not win")
        js("__AG_TEST__.game.hit(__AG_TEST__.game.boss,99999,0);__AG_TEST__.step(.05)")
        expect(snap()["state"]=="result" and snap()["bossDefeated"])
        expect(js("AG.Store.data.clears.glass>0&&AG.Store.data.archive.includes('letter-glass')&&AG.Store.data.archive.includes('rook')"))
    check("18. Victory requires both survival time and guardian defeat",win_rules)
    def defeat():
        start();quiet()
        before=js("AG.Store.data.runs")
        js("__AG_TEST__.game.player.invuln=0;__AG_TEST__.game.damage(999);__AG_TEST__.game.finish(false)")
        expect(snap()["state"]=="result" and snap()["player"]["hp"]==0)
        expect(js("AG.Store.data.runs")==before+1,"Award duplicated")
    check("19. Defeat awards once and records the run",defeat)
    def research():
        js("AG.Store.data.seeds=0;AG.Store.data.research.vitality=0")
        expect(not js("AG.Store.buy('vitality')"))
        js("AG.Store.data.seeds=1000")
        for _ in range(3):expect(js("AG.Store.buy('vitality')"))
        expect(not js("AG.Store.buy('vitality')"))
        expect(js("AG.Store.data.seeds===820"))
        start();expect(snap()["player"]["maxHp"]==140)
        return "Costs 30/60/90, maximum 3, +30 starting HP"
    check("20. Research checks cost, cap and next-run stat application",research)
    def save_restore():
        saved=js("JSON.parse(localStorage.getItem('clockout.office.v1'))")
        new=context.new_page();load(new,saved=saved)
        expect(new.evaluate("AG.Store.data.research.vitality===3&&AG.Store.data.archive.includes('letter-glass')"))
        new.close()
        return "In-memory storage adapter, new document"
    check("21. Save data round-trips through the storage adapter",save_restore)
    def bad_save():
        new=context.new_page();load(new,saved={"version":2,"seeds":-100,"research":{"vitality":900},"archive":["not-a-record"],"selected":"invalid","chapter":80})
        expect(new.evaluate("AG.Store.data.seeds===0&&AG.Store.data.research.vitality===3&&AG.Store.data.selected==='rook'&&AG.Store.data.chapter===2&&AG.Store.data.archive.length===1"))
        new.close()
    check("22. Invalid save data is clamped and unknown IDs are discarded",bad_save)
    def blocked_save():
        new=context.new_page();local_errors=[];new.on("pageerror",lambda e:local_errors.append(str(e)))
        load(new,storage=False);expect(new.evaluate("!AG.Store.available"));new.evaluate("__AG_TEST__.start('rook',0)")
        expect(new.evaluate("__AG_TEST__.snapshot().state==='playing'"));expect(not local_errors);new.close()
    check("23. Native blocked storage still permits gameplay",blocked_save)
    def normal_mode():
        new=context.new_page();load(new,debug=False)
        expect(new.evaluate("!window.__AG_TEST__"));new.close()
    check("24. Debug API is absent in normal play",normal_mode)

    def mobile_test():
        mobile_context=browser.new_context(viewport={"width":390,"height":844},device_scale_factor=1,is_mobile=True,has_touch=True)
        mobile=mobile_context.new_page();mobile.on("pageerror",lambda e:errors.append(str(e)));load(mobile)
        screen("08-home-mobile.png",mobile,True)
        for route in ["roster","map","archive","workshop"]:
            mobile.evaluate(f"__AG_TEST__.go('{route}')")
            expect(mobile.evaluate("document.documentElement.scrollWidth<=innerWidth+1"),route+" mobile overflow")
        mobile.evaluate("__AG_TEST__.go('roster')")
        mobile.click('[data-action="select-char"][data-id="briar"]')
        screen("09-roster-mobile.png",mobile,True)
        mobile.evaluate("__AG_TEST__.start('lumen',0);__AG_TEST__.game.manual=true;__AG_TEST__.game.player.invuln=1000;__AG_TEST__.game.player.nextXp=1e9;")
        r=mobile.locator("#game").bounding_box();x=r["x"]+90;y=r["y"]+r["height"]*.6
        before=mobile.evaluate("__AG_TEST__.snapshot().player.x")
        cdp=mobile_context.new_cdp_session(mobile)
        point=lambda x,y:{"x":x,"y":y,"id":0,"radiusX":5,"radiusY":5,"force":1}
        cdp.send("Input.dispatchTouchEvent",{"type":"touchStart","touchPoints":[point(x,y)]})
        cdp.send("Input.dispatchTouchEvent",{"type":"touchMove","touchPoints":[point(x+40,y)]})
        mobile.evaluate("__AG_TEST__.step(.3)")
        expect(mobile.evaluate("__AG_TEST__.snapshot().player.x")>before+40,"Touch drag failed")
        cdp.send("Input.dispatchTouchEvent",{"type":"touchEnd","touchPoints":[]})
        expect(mobile.evaluate("__AG_TEST__.game.input.x===0"))
        mobile.locator("#skill-btn").tap()
        expect(mobile.evaluate("__AG_TEST__.snapshot().player.skillCd>0"))
        mobile.evaluate("document.getElementById('chapter-cut').hidden=true;")
        screen("10-gameplay-mobile.png",mobile)
        mobile.evaluate("__AG_TEST__.game.player.nextXp=5;__AG_TEST__.xp(5)")
        screen("11-upgrade-mobile.png",mobile)
        cards=mobile.locator(".upgrade-card")
        for i in range(3):
            box=cards.nth(i).bounding_box();expect(box["x"]>=0 and box["x"]+box["width"]<=391)
        mobile_context.close()
        return "390x844, trusted CDP touch drag and tap"
    check("25. Mobile routes, real touch joystick, skill tap and upgrade layout",mobile_test)

    def small():
        small_context=browser.new_context(viewport={"width":320,"height":568},device_scale_factor=1,is_mobile=True,has_touch=True)
        small=small_context.new_page();load(small)
        for route in ["home","roster","map","archive","workshop"]:
            small.evaluate(f"__AG_TEST__.go('{route}')")
            expect(small.evaluate("document.documentElement.scrollWidth<=innerWidth+1"),route+" small overflow")
        small.evaluate("__AG_TEST__.start();__AG_TEST__.game.manual=true;__AG_TEST__.xp(5)")
        expect(small.locator(".upgrade-card").count()==3)
        last=small.locator(".upgrade-card").nth(2);last.click()
        expect(small.evaluate("__AG_TEST__.snapshot().state==='playing'"))
        small_context.close()
    check("26. Small 320x568 screens keep all menus and choices usable",small)

    def stress():
        start("io",2);quiet()
        data=js("""(()=>{const g=__AG_TEST__.game;g.time=100;g.spawnClock=999;for(let i=0;i<120;i++){const e=g.spawn(i%4===0?'shooter':'spore');e.x=700+(i%12)*65;e.y=400+Math.floor(i/12)*63;}g.levels.drone=3;g.levels.pulse=3;g.levels.spread=2;const t=performance.now();for(let i=0;i<300;i++){g.setInput(Math.cos(i*.025),Math.sin(i*.025));g.update(1/60);}g.render();return {milliseconds:performance.now()-t,enemies:g.enemies.length,kills:g.kills}})()""")
        expect(data["enemies"]<=145);expect(data["milliseconds"]<10000)
        return data
    check("27. Crowded simulation completes 300 ticks without an exception",stress)

    def autoplay():
        out=[]
        js("AG.Store.data.research={vitality:0,focus:0,gather:0};AG.Store.save()")
        # A simple node-seeking player. No invincibility, extra XP,
        # instant kills or stat grants are used for these balance smoke runs.
        for c in ["rook","lumen","briar","io"]:
            start(c,0)
            data=js("""(()=>{const g=__AG_TEST__.game;let guard=0;const preference=['dawn','weapon','rapid','drone','hive','power','pulse','hull','magnet','speed','crit','spread','thorn','memory'];while(g.state!=='result'&&guard++<1100){
              if(g.state==='upgrade'){const choices=g.choices;let index=0,best=999;for(let i=0;i<choices.length;i++){const rank=preference.indexOf(choices[i].id);if(rank>=0&&rank<best){best=rank;index=i;}}__AG_TEST__.choose(index);continue;}
              if(g.state==='story'){__AG_TEST__.story(0);continue;}
              if(g.state!=='playing')break;
              const p=g.player;let target=null;
              if(g.boss&&!g.boss.dead){const d=g.distance(p,g.boss);const desired=g.character.style==='slash'?100:260;const a=Math.atan2(p.y-g.boss.y,p.x-g.boss.x)+.14;target={x:g.boss.x+Math.cos(a)*desired,y:g.boss.y+Math.sin(a)*desired};}
              else{const active=g.nodes.filter(n=>n.cooldown<=0).sort((a,b)=>g.distance(a,p)-g.distance(b,p));if(active.length)target=active[0];else if(g.gems.length)target=g.gems.reduce((a,b)=>g.distance(a,p)<g.distance(b,p)?a:b);else target={x:1080+Math.cos(g.time*.05)*320,y:780+Math.sin(g.time*.05)*280};}
              const d=g.distance(p,target);g.setInput(d<10?0:(target.x-p.x)/d,d<10?0:(target.y-p.y)/d);
              if(p.skillCd<=0)g.skill();if(g.enemies.filter(e=>g.distance(e,p)<50).length>2)g.dash();
              g.step(.25);
            }return {character:g.character.id,time:g.time,kills:g.kills,level:g.player.level,hp:g.player.hp,boss:g.bossDefeated,state:g.state,evolutions:g.evolved};})()""")
            expect(data["state"]=="result","Autoplay did not terminate")
            out.append(data)
        return out
    check("28. Four unassisted-stat autoplay runs terminate and record balance outcomes",autoplay)

    # Create a representative combat screenshot from an explicit showcase fixture.
    # This is a QA fixture, not a claim that a human earned this build.
    start("lumen",0);quiet()
    js("""(()=>{const g=__AG_TEST__.game;g.time=112;g.levels={weapon:3,power:2,rapid:2,spread:2,drone:2,pulse:2,magnet:2,speed:1,hull:1,crit:1,thorn:1,memory:0};g.evolved={dawn:true,hive:true,eden:false};g.player.level=16;g.player.maxHp=140;g.player.hp=113;g.kills=185;g.nodesRestored=3;for(let i=0;i<62;i++){const a=i*2.39996,r=140+i*6,e=g.spawn(['spore','runner','brute','shooter','beetle'][i%5]);e.x=g.player.x+Math.cos(a)*r;e.y=g.player.y+Math.sin(a)*r;e.hp*=3;}g.spawnClock=999;g.setInput(.3,-.2);g.step(.8);g.fireClock=0;g.update(.02);document.getElementById('chapter-cut').hidden=true;document.getElementById('battle-toast').classList.remove('visible');g.emit('modules');__AG_TEST__.updateHud();})()""")
    screen("05-gameplay-desktop.png")
    check("29. No uncaught JavaScript errors across browser scenarios",lambda:expect(not errors,str(errors)))
    def endings():
        for ch in range(3):
            for choice in range(2):
                start("rook",ch);quiet()
                js("__AG_TEST__.game.storyDone=false;__AG_TEST__.game.time=65;__AG_TEST__.step(.02)")
                js(f"__AG_TEST__.story({choice});__AG_TEST__.end(true)")
                key="endCare" if choice==0 else "endSignal"
                expect(js(f"document.querySelector('.result-copy').textContent.includes(AG.Content.chapters[{ch}].{key})"))
                expect(js("document.querySelector('.ending-line').textContent===AG.Content.characters[0].ending"))
        for character in ["rook","lumen","briar","io"]:
            start(character,0);js("__AG_TEST__.end(true)")
        expect(js("AG.Store.data.archive.length===9&&AG.Store.data.archive.includes('ending')"))
        js("__AG_TEST__.go('archive')")
        return "6 chapter/choice endings, 4 character records, final archive unlocked"
    check("30. Distinct endings and all nine archive records unlock correctly",endings)

    def preferences():
        start();quiet();page.keyboard.press("m")
        expect(js("AG.Audio.enabled && AG.Store.data.settings.sound"))
        page.keyboard.press("m");expect(js("!AG.Audio.enabled"))
        page.keyboard.press("p")
        page.locator("#motion-toggle").uncheck()
        expect(js("!AG.Store.data.settings.motion&&!__AG_TEST__.game.motion&&document.body.classList.contains('low-motion')"))
        page.locator("#motion-toggle").check()
        expect(js("AG.Store.data.settings.motion&&__AG_TEST__.game.motion"))
        return "Sound toggle and saved reduced-motion preference"
    check("31. Sound and motion controls change runtime and saved settings",preferences)
    check("32. Final complete run has no uncaught JavaScript errors",lambda:expect(not errors,str(errors)))
    browser.close()

report={"mode":"inline actual app; in-memory localStorage adapter for save-success tests","browser":args.browser,"passed":sum(r["passed"] for r in results),"total":len(results),"uncaught_errors":errors,"checks":results}
REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"passed":report["passed"],"total":report["total"]}))
raise SystemExit(0 if report["passed"]==report["total"] else 1)
