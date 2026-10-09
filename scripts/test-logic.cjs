const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'..')+'/';
const elements=new Map(), listeners=new Map(), storage=new Map();
function element(selector) {if (!elements.has(selector)) elements.set(selector,{textContent:'',innerHTML:'',open:false,style:{},classList:{toggle(){},add(){},remove(){}},addEventListener(name,fn){listeners.set(selector+':'+name,fn)},showModal(){this.open=true},close(){this.open=false}});return elements.get(selector);}
const globals={console, URL, URLSearchParams, AbortSignal, FormData, Date, setTimeout:()=>0,clearTimeout(){}, navigator:{},location:{search:'',origin:'https://onecardwiser.com',pathname:'/'},
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
  document:{querySelector:element,querySelectorAll:()=>[],addEventListener:(name,fn)=>listeners.set('document:'+name,fn)},
  fetch:async()=>{throw new Error('network offline')}};
globals.window=globals;globals.scrollTo=()=>{};globals.addEventListener=(name,fn)=>listeners.set('window:'+name,fn);
const ctx=vm.createContext(globals);
for(const file of ['analytics-config.js','features.js','content.js','app.js'])vm.runInContext(fs.readFileSync(root+file,'utf8'),ctx,{filename:file});
const run=code=>vm.runInContext(code,ctx);
const click=attributes=>listeners.get('document:click')({target:{closest:selector=>attributes[selector]||null}});
assert.equal(run('todaysCards().length'),3);
assert.equal(run('todaysCards()[0].id'),'econ-opportunity-cost');
assert.equal(run('CARDS.every(c=>safeUrl(c.sourceUrl)&&QUIZZES[c.id]&&QUIZZES[c.id].options.length===3)'),true);
click({'[data-quiz-choice]':{dataset:{quizCard:'econ-opportunity-cost',quizChoice:'1'}}});
assert.equal(run('state.quizAnswers["econ-opportunity-cost"]'),1);
click({'[data-complete]':{dataset:{complete:'econ-opportunity-cost'}}});
assert.equal(element('#daily-progress-label').textContent,'1 / 3');
assert.equal(run('calculateStreak()'),1);
click({'[data-save]':{dataset:{save:'econ-opportunity-cost'}}});
assert.equal(run('state.saved[0]'),'econ-opportunity-cost');
assert.equal(run('loadState().saved[0]'),'econ-opportunity-cost');
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
  assert.equal(run('analyticsConfigured()'),false);
  const xml=fs.readFileSync(root+'sitemap.xml','utf8');const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
  assert.equal(urls.length,50);assert.equal(new Set(urls).size,50);
  for(const url of urls){const p=new URL(url).pathname;assert.ok(fs.existsSync(root+p.replace(/^\//,'')+'index.html'),p);}
  const html=fs.readFileSync(root+'index.html','utf8');
  for(const match of html.matchAll(/(?:href|src)="\.\/([^"]+)"/g)){const file=root+match[1];assert.ok(fs.existsSync(file),file);}
  const manifest=JSON.parse(fs.readFileSync(root+'manifest.webmanifest','utf8'));for(const icon of manifest.icons)assert.ok(fs.existsSync(root+icon.src.replace(/^\.\//,'')));
  // Test service worker cache install, offline navigation and third-party exclusion.
  const swEvents={},cache=new Map();let responsePromise;
  const sw=vm.createContext({URL,Response,Promise,self:{location:new URL('https://onecardwiser.com/sw.js'),addEventListener:(name,fn)=>swEvents[name]=fn},caches:{open:async()=>({addAll:async paths=>paths.forEach(p=>cache.set(p,new Response('cached '+p))),match:async p=>cache.get(p),put:async()=>{}}),keys:async()=>['ocw-shell-v2'],delete:async()=>true,match:async request=>cache.get(new URL(request.url).pathname)},fetch:async()=>{throw new Error('offline')}});
  vm.runInContext(fs.readFileSync(root+'sw.js','utf8'),sw);let install;swEvents.install({waitUntil:p=>install=p});await install;
  swEvents.fetch({request:{method:'GET',mode:'navigate',url:'https://onecardwiser.com/'},respondWith:p=>responsePromise=p});assert.match(await (await responsePromise).text(),/cached/);
  swEvents.fetch({request:{method:'GET',mode:'navigate',url:'https://onecardwiser.com/topics/art/'},respondWith:p=>responsePromise=p});assert.match(await (await responsePromise).text(),/You are offline/);
  let intercepted=false;swEvents.fetch({request:{method:'GET',url:'https://en.wikipedia.org/w/api.php'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
  console.log('PASS: all 33 cards have source links and quizzes; daily allocation, all 12 topics, completion, streak retention, undo, save, legacy migration, invalid state, duplicate rejection, storage failures, sharing URLs, analytics disabled, 50 sitemap pages, manifest assets and offline service worker.');
})().catch(error=>{console.error(error);process.exitCode=1});
