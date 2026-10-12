const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'..')+'/';
const elements=new Map(), listeners=new Map(), storage=new Map();
function element(selector) {if (!elements.has(selector)) elements.set(selector,{textContent:'',innerHTML:'',open:false,style:{},classList:{contains(){return false},toggle(){},add(){},remove(){}},addEventListener(name,fn){listeners.set(selector+':'+name,fn)},showModal(){this.open=true},close(){this.open=false}});return elements.get(selector);}
const globals={console, URL, URLSearchParams, AbortSignal, FormData, Date, setTimeout:()=>0,clearTimeout(){}, navigator:{},location:{search:'',origin:'https://onecardwiser.com',pathname:'/'},
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
  document:{documentElement:{lang:'en'},querySelector:element,querySelectorAll:()=>[],addEventListener:(name,fn)=>{const previous=listeners.get('document:'+name);listeners.set('document:'+name,event=>{previous?.(event);fn(event)})}},
  fetch:async()=>{throw new Error('network offline')}};
globals.window=globals;globals.scrollTo=()=>{};globals.addEventListener=(name,fn)=>listeners.set('window:'+name,fn);
const ctx=vm.createContext(globals);
for(const file of ['analytics-config.js','content.js','locales.js','content-el.js','content-ru.js','content-ro.js','extra-content.js','i18n.js','features.js','review.js','experience.js','app.js','progress.js'])vm.runInContext(fs.readFileSync(root+file,'utf8'),ctx,{filename:file});
const run=code=>vm.runInContext(code,ctx);
const click=attributes=>listeners.get('document:click')({target:{closest:selector=>attributes[selector]||null}});
assert.equal(run('todaysCards().length'),3);
assert.equal(element('#welcome-panel').hidden,false,'First visit offers a sample without a blocking modal');
assert.equal(element('#session-complete').hidden,true);
const initialState=run('JSON.stringify(state)');
run('state.onboardingSeen=true;renderToday()');assert.equal(element('#welcome-panel').hidden,true);
run('state.completionLog[dateKey()]=todaysCards().map(c=>c.id);renderToday()');
assert.equal(element('#session-complete').hidden,false);assert.equal(element('#daily-progress').hidden,true);
assert.match(element('#session-complete').innerHTML,/You completed 3 ideas today/);
assert.match(run('sessionNextAction(todaysCards()[0])'),/data-session-summary/);
run('state.completionLog[dateKey()].splice(1,1);renderToday()');
assert.equal(element('#session-complete').hidden,true);assert.match(run('sessionNextAction(todaysCards()[0])'),/data-next-idea/);
run('state=JSON.parse('+JSON.stringify(initialState)+');renderToday()');
run('applyLanguage("ru")');assert.equal(run('t("You completed {n} ideas today.",{n:3})'),'Сегодня вы завершили 3 карточки.');run('applyLanguage("en")');
const report=run('feedbackReport("A sample usability report","bug")');assert.match(report,/Bug/);assert.match(report,/Language: en/);assert.doesNotMatch(report,/saved|completionLog|quizAnswers/);

assert.equal(run('sourcePreviewText({hook:"A definition (e.",concept:"g., branding) includes 0.",example:"5 percent."})'),'A definition (e.g., branding) includes 0.5 percent.');
assert.equal(run('sourcePreviewText({excerptVersion:2,concept:"Dr. Smith used e.g. and 3.14.\\nThe final sentence has no period"})'),'Dr. Smith used e.g. and 3.14.\nThe final sentence has no period');
assert.equal(run('CARDS.length'),96);
assert.equal(run('t("Last 7 days: {n} cards completed · {d} days of learning",{n:1,d:1})'),'Last 7 days: 1 card completed · 1 day of learning');
assert.equal(run('new Set(CARDS.map(c=>c.id)).size'),96);
assert.equal(run('Object.keys(TOPICS).every(id=>CARDS.filter(c=>c.topic===id).length===8)'),true);
assert.equal(run('todaysCards()[0].id'),'econ-opportunity-cost');

run('currentFilter="psychology";librarySearch="";renderLibrary()');assert.equal(element('#library-count').textContent,'8 ideas');
run('currentFilter="all";librarySearch="binary";renderLibrary()');assert.equal(element('#library-count').textContent,'1 idea');
run('librarySearch="no-such-idea-xyz";renderLibrary()');assert.match(element('#library-grid').innerHTML,/No matching ideas/);
run('librarySearch="";currentFilter="all";renderLibrary()');assert.equal(element('#library-count').textContent,'96 ideas');

assert.equal(run('CARDS.every(c=>safeUrl(c.sourceUrl)&&QUIZZES[c.id]&&QUIZZES[c.id].options.length===3)'),true);
click({'[data-quiz-choice]':{dataset:{quizCard:'econ-opportunity-cost',quizChoice:'1'}}});
assert.equal(run('state.quizAnswers["econ-opportunity-cost"]'),1);
click({'[data-complete]':{dataset:{complete:'econ-opportunity-cost'}}});
assert.equal(element('#daily-progress-label').textContent,'1 / 3');
assert.equal(run('calculateStreak()'),1);
click({'[data-save]':{dataset:{save:'econ-opportunity-cost'}}});
assert.equal(run('state.saved[0]'),'econ-opportunity-cost');
assert.equal(run('loadState().saved[0]'),'econ-opportunity-cost');


const backupBefore=run('JSON.stringify(state)');
const exported=run('JSON.stringify(makeProgressBackup())');
assert.equal(JSON.parse(exported).format,'one-card-wiser');
assert.equal(JSON.parse(exported).state.saved[0],'econ-opportunity-cost');
assert.ok(!exported.includes('ocw-analytics-consent'));
run('this.parsedBackup=readProgressBackup('+JSON.stringify(exported)+')');
assert.equal(run('parsedBackup.state.quizAnswers["econ-opportunity-cost"]'),1);
run('this.fresh=JSON.parse(JSON.stringify(DEFAULT_STATE));fresh.dailyCardIds[dateKey()]={economics:"econ-inflation"};this.transferred=mergeProgressBackup(fresh,parsedBackup.state)');
assert.equal(run('transferred.dailyCardIds[dateKey()].economics'),'econ-opportunity-cost','A fresh device restores the backup daily selection');
assert.equal(run('transferred.saved.includes("econ-opportunity-cost")'),true);
assert.equal(run('transferred.quizAnswers["econ-opportunity-cost"]'),1);

assert.throws(()=>run('readProgressBackup("invalid JSON")'),/valid/);
const malformed=JSON.parse(exported);malformed.state.completed['econ-opportunity-cost']='2026-02-31';
assert.throws(()=>run('readProgressBackup('+JSON.stringify(JSON.stringify(malformed))+')'),/invalid progress/);
malformed.state.completed['econ-opportunity-cost']='2026-99-99';
assert.throws(()=>run('readProgressBackup('+JSON.stringify(JSON.stringify(malformed))+')'),/invalid progress/);
malformed.state.completed['not-available-card']='2026-10-01';delete malformed.state.completed['econ-opportunity-cost'];
assert.throws(()=>run('readProgressBackup('+JSON.stringify(JSON.stringify(malformed))+')'),/unavailable cards/);
const futureBackup=JSON.parse(exported);futureBackup.version=2;
assert.throws(()=>run('readProgressBackup('+JSON.stringify(JSON.stringify(futureBackup))+')'),/supported/);
run('this.incoming=JSON.parse(JSON.stringify(parsedBackup.state));incoming.saved.push("art-negative-space");incoming.quizAnswers["econ-opportunity-cost"]=0;incoming.completionLog["2026-01-01"]=["art-negative-space"];incoming.completed["art-negative-space"]="2026-01-01";');
run('this.merged=mergeProgressBackup(state,incoming)');
assert.equal(run('merged.saved.includes("art-negative-space")&&merged.saved.includes("econ-opportunity-cost")'),true);
assert.equal(run('merged.quizAnswers["econ-opportunity-cost"]'),1,'Existing answer takes priority');
assert.equal(run('merged.completed["art-negative-space"]'),'2026-01-01');
assert.equal(run('JSON.stringify(mergeProgressBackup(merged,incoming))===JSON.stringify(merged)'),true,'Repeated restore is idempotent');
const originalWrite=globals.localStorage.setItem;globals.localStorage.setItem=()=>{throw new Error('storage full')};
assert.throws(()=>run('restoreProgressBackup(parsedBackup)'),/storage full/);
assert.equal(run('JSON.stringify(state)'),backupBefore,'Failed persistence must preserve the current session');
globals.localStorage.setItem=originalWrite;
assert.equal(run('JSON.stringify(state)'),backupBefore);

const progressBefore=run('JSON.stringify(state)'),englishTitle=run('CARDS[0].title');
for(const language of ['el','ru','ro','en']){
 listeners.get('document:change')({target:{matches:()=>true,value:language}});
 assert.equal(run('currentLanguage'),language);assert.equal(storage.get('ocw-language'),language);
 assert.equal(globals.document.documentElement.lang,language);assert.equal(run('initialLanguage()'),language);
 assert.equal(run('JSON.stringify(state)'),progressBefore,'Language change preserves all progress');
 assert.equal(run('CARDS.every(c=>QUIZZES[c.id].answer===ORIGINAL_CONTENT.QUIZZES[c.id].answer)'),true);
 if(language!=='en'){
  assert.notEqual(run('CARDS[0].title'),englishTitle);
  assert.equal(run('Object.keys(CONTENT_LOCALES[currentLanguage]).length'),96);
  assert.equal(run('CARDS.every(c=>{const row=CONTENT_LOCALES[currentLanguage][c.id];return row.length===8&&row.slice(0,6).every(v=>typeof v==="string"&&v.length>0)&&row[6].length===3&&row[6].every(v=>typeof v==="string"&&v.length>0)&&typeof row[7]==="string"})'),true);
  assert.equal(run('publicCardUrl(CARDS[0])'),'https://onecardwiser.com/'+language+'/cards/econ-opportunity-cost/');
  assert.ok(run('quizMarkup(CARDS[0])').includes(run('QUIZZES[CARDS[0].id].question')));
 }
}
assert.equal(run('CARDS[0].title'),englishTitle);
globals.location.search='?lang=ro&card=econ-opportunity-cost';assert.equal(run('initialLanguage()'),'ro');
globals.location.search='?lang=invalid';storage.set('ocw-language','invalid');assert.equal(run('initialLanguage()'),'en');globals.location.search='';storage.set('ocw-language','en');
const source=['app.js','features.js','i18n.js','review.js'].map(f=>fs.readFileSync(root+f,'utf8')).join('\n');
for(const match of source.matchAll(/\bt\("([^"\n]+)"/g))assert.equal(run('Object.hasOwn(UI_TRANSLATIONS,'+JSON.stringify(match[1])+')'),true,'Missing translation: '+match[1]);


const beforeReview=run('JSON.stringify(state)');
run('state.completed={};state.quizAnswers={};state.reviewLog={};state.quizAnswers["psychology-anchoring"]=0;state.completed["science-sleep"]=dateKey(new Date(Date.now()-4*86400000))');
assert.equal(run('reviewQueue()[0].id'),'psychology-anchoring','Missed questions have priority');
assert.ok(run('reviewQueue().some(c=>c.id==="science-sleep")'),'Older ideas return after three days');
element('#review-view').classList.contains=()=>true;
run('openCard("psychology-anchoring")');
assert.equal(run('state.quizAnswers["psychology-anchoring"]'),0,'Opening review preserves previous answer');
assert.equal(run('activeReviewAnswer'),null);
click({'[data-quiz-choice]':{dataset:{quizCard:'psychology-anchoring',quizChoice:'1'}}});
assert.equal(run('activeReviewAnswer'),1);assert.equal(run('state.quizAnswers["psychology-anchoring"]'),0,'Review stays separate until finished');
click({'[data-reviewed]':{dataset:{reviewed:'psychology-anchoring'}}});
assert.equal(run('state.quizAnswers["psychology-anchoring"]'),1);
assert.equal(run('state.reviewLog["psychology-anchoring"]'),run('dateKey()'));
assert.equal(run('reviewQueue().some(c=>c.id==="psychology-anchoring")'),false);
assert.equal(run('Boolean(state.completed["psychology-anchoring"])'),false,'Review does not count as daily completion');
assert.equal(run('loadState().reviewLog["psychology-anchoring"]'),run('dateKey()'));
element('#review-view').classList.contains=()=>false;
run('state='+beforeReview+';activeReviewId=null;activeReviewAnswer=null');

run('const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);state.completionLog[dateKey(yesterday)]=["econ-opportunity-cost"];state.dailyCardIds[dateKey(yesterday)]=state.dailyCardIds[dateKey()];delete state.dailyCardIds[dateKey()];state.completed["econ-opportunity-cost"]=dateKey(yesterday);state.completionLog[dateKey()]=[];ensureDailyCards()');
assert.equal(run('todaysCards()[0].id'),'econ-compounding');
assert.equal(element('#daily-progress-label').textContent,'0 / 3');
click({'[data-complete]':{dataset:{complete:'econ-opportunity-cost'}}});
assert.equal(run('calculateStreak()'),2);
click({'[data-complete]':{dataset:{complete:'econ-opportunity-cost'}}});
assert.equal(run('calculateStreak()'),1);
assert.equal(run('state.completed["econ-opportunity-cost"]'),run('dateKey(yesterday)'));
run('state.topics=Object.keys(TOPICS);ensureDailyCards()');
assert.equal(run('todaysCards().length'),12);
storage.set('daily-knowledge-v1',JSON.stringify({topics:['science','bad'],saved:['science-sleep'],completed:{'science-sleep':'2026-10-08'},onboardingSeen:true}));
assert.equal(run('loadState().topics.join()'),'science');
assert.equal(run('loadState().completionLog["2026-10-08"][0]'),'science-sleep');
storage.set('daily-knowledge-v1','broken-json');assert.equal(run('loadState().topics.length'),3);
storage.set('daily-knowledge-v1',JSON.stringify({topics:'bad',dailyCardIds:[],discoveredCards:[null,{}]}));assert.equal(run('loadState().discoveredCards.length'),0);
run('state.discoveredCards=[{...CARDS[0],id:"old-source",discovered:true}];state.topics=["economics"];state.saved.push("old-source");state.dailyCardIds[dateKey()].economics="old-source";ensureDailyCards()');
assert.equal(run('todaysCards()[0].discovered'),undefined);
assert.equal(run('state.saved.includes("old-source")'),true);
run('state.dailyCardIds[dateKey()].economics="old-source";state.completionLog[dateKey()]=["old-source"];ensureDailyCards()');
assert.equal(run('todaysCards()[0].id'),'old-source');
run('fetchKnowledgeCard=async(topic)=>({...CARDS[0],id:"existing-source",topic,discovered:true});state.discoveredCards=[{...CARDS[0],id:"existing-source",discovered:true}];state.topics=["economics"]');
(async()=>{
  await run('discoverFreshCard()');assert.equal(run('state.discoveredCards.length'),1);assert.match(element('#toast').textContent,/No new source preview/);
  globals.localStorage.setItem=()=>{throw new Error('quota')};run('saveState()');assert.match(element('#toast').textContent,/could not save/);
  assert.equal(run('publicCardUrl(CARDS[0])'),'https://onecardwiser.com/cards/econ-opportunity-cost/');
  assert.equal(run('analyticsConfigured()'),true);
  // Verify the real consent handlers before enabling the configured measurement ID.
  const gaStorage=new Map(), gaScripts=[], gaListeners={}; let gaDialog=null;
  const gaElement={addEventListener(){},hidden:true};
  const gaContext=vm.createContext({
    languageSelectMarkup:()=>'',t:key=>key,localePath:p=>'/'+p,URL,Date,navigator:{},location:{origin:'https://onecardwiser.com',pathname:'/',hostname:'onecardwiser.com'},
    localStorage:{getItem:k=>gaStorage.get(k)||null,setItem:(k,v)=>gaStorage.set(k,v)},
    document:{
      cookie:'',
      querySelector:s=>s==='#analytics-dialog'?gaDialog:gaElement,
      addEventListener:(n,fn)=>gaListeners[n]=fn,
      createElement:tag=>tag==='script'?{}:{
        addEventListener(n,fn){this[n]=fn},
        showModal(){},
        close(){this.closeEvent?.()},
        remove(){gaDialog=null}
      },
      head:{append:s=>gaScripts.push(s)},
      body:{append:d=>{gaDialog=d;d.closeEvent=()=>d.remove()}}
    },
    addEventListener(){}
  });
  vm.runInContext('window=globalThis',gaContext);
  vm.runInContext(fs.readFileSync(root+'analytics-config.js','utf8'),gaContext);
  vm.runInContext(fs.readFileSync(root+'features.js','utf8'),gaContext);
  gaListeners.DOMContentLoaded();
  assert.equal(gaScripts.length,0,'No Google script before consent');
  const choose=choice=>gaDialog.click({target:{closest:()=>({dataset:{consent:choice}})}});
  choose('no');assert.equal(gaScripts.length,0,'Decline must not load Google');
  vm.runInContext('analyticsChoices()',gaContext);choose('yes');
  assert.equal(gaScripts.length,1);
  assert.equal(gaScripts[0].src,'https://www.googletagmanager.com/gtag/js?id=G-GXCH42NMMJ');
  vm.runInContext('trackEvent("card_complete",{topic:"science"})',gaContext);
  const eventCount=gaContext.dataLayer.length;
  vm.runInContext('analyticsChoices()',gaContext);choose('no');
  vm.runInContext('trackEvent("card_complete",{topic:"science"})',gaContext);
  assert.equal(gaContext.dataLayer.length,eventCount,'Withdrawal prevents further events');
  assert.equal(gaContext['ga-disable-G-GXCH42NMMJ'],true);
  vm.runInContext('analyticsChoices()',gaContext);choose('yes');
  assert.equal(gaScripts.length,1,'Re-enabling must not duplicate the tag');
  assert.equal(gaContext['ga-disable-G-GXCH42NMMJ'],false);
  const xml=fs.readFileSync(root+'sitemap.xml','utf8');const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
  assert.equal(urls.length,449);assert.equal(new Set(urls).size,449);
  for(const url of urls){const p=new URL(url).pathname,filename=root+p.replace(/^\//,'')+'index.html';assert.ok(fs.existsSync(filename),p);if(p!=='/'){const page=fs.readFileSync(filename,'utf8');assert.equal([...page.matchAll(/rel="alternate" hreflang=/g)].length,4,p);assert.ok(page.includes('rel="canonical" href="'+url+'"'));const lang=/^\/(el|ru|ro)\//.exec(p)?.[1]||'en';assert.ok(page.includes('<html lang="'+lang+'"'));}}
  const html=fs.readFileSync(root+'index.html','utf8');
  for(const match of html.matchAll(/(?:href|src)="\.\/([^"]+)"/g)){const file=root+match[1].split('?')[0];assert.ok(fs.existsSync(file),file);}
  const manifest=JSON.parse(fs.readFileSync(root+'manifest.webmanifest','utf8'));for(const icon of manifest.icons)assert.ok(fs.existsSync(root+icon.src.replace(/^\.\//,'')));
  // Test service worker cache install, offline navigation and third-party exclusion.
  const swEvents={},cache=new Map();let responsePromise;
  const sw=vm.createContext({URL,Response,Promise,self:{location:new URL('https://onecardwiser.com/sw.js'),addEventListener:(name,fn)=>swEvents[name]=fn},caches:{open:async()=>({addAll:async paths=>paths.forEach(p=>cache.set(p,new Response('cached '+p))),match:async p=>cache.get(p),put:async()=>{}}),keys:async()=>['ocw-shell-v2'],delete:async()=>true,match:async request=>cache.get(new URL(request.url).pathname)},fetch:async()=>{throw new Error('offline')}});
  vm.runInContext(fs.readFileSync(root+'sw.js','utf8'),sw);let install;swEvents.install({waitUntil:p=>install=p});await install;
  swEvents.fetch({request:{method:'GET',mode:'navigate',url:'https://onecardwiser.com/'},respondWith:p=>responsePromise=p});assert.match(await (await responsePromise).text(),/cached/);
  swEvents.fetch({request:{method:'GET',mode:'navigate',url:'https://onecardwiser.com/topics/art/'},respondWith:p=>responsePromise=p});assert.match(await (await responsePromise).text(),/You are offline/);
  let intercepted=false;swEvents.fetch({request:{method:'GET',url:'https://en.wikipedia.org/w/api.php'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
  console.log('PASS: four languages, remembered preference, preserved progress and quiz answer indices, reciprocal language pages; all 96 cards have source links and quizzes; daily allocation, all 12 topics, completion, streak retention, undo, save, legacy migration, invalid state, duplicate rejection, storage failures, sharing URLs, analytics consent and withdrawal, 449 sitemap pages, manifest assets and offline service worker.');
})().catch(error=>{console.error(error);process.exitCode=1});

