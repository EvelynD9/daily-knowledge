'use strict';
const KEY='ocw:web-beta:v1';
const defaultState={results:{},points:0,claimed:{},topicActivity:[],interests:[],theme:'dark',filter:'all',locale:'en'};
let state;try{state={...defaultState,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{state={...defaultState}};
let localizedQuestions=new Map(),localizedCards=new Map(),learningCards=[],questions=[],daily=[],step=0,score=0,selected=null,practiceMode=false,chaosMode=false,roundAnswers=[],readingIndex=0,practiceCategory=null,libraryLimit=60;
const $=id=>document.getElementById(id);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
const dayKey=(d=new Date())=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const dayIndex=()=>Math.floor(new Date(dayKey()+'T12:00:00').getTime()/86400000);
const getStreak=()=>{let date=new Date();date.setHours(12,0,0,0);if(!state.results[dayKey(date)])date.setDate(date.getDate()-1);let n=0;while(state.results[dayKey(date)]){n++;date.setDate(date.getDate()-1)}return n};
const level=()=>1+Math.floor((Number(state.points)||0)/10);
const h=(tag,attrs={},value='')=>{const el=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==='className')el.className=v;else if(k==='textContent')el.textContent=v;else el.setAttribute(k,v)}if(value)el.textContent=value;return el};
const escapeText=x=>String(x??'');

const currentLocale=()=>typeof OCW_LOCALES!=='undefined'&&Object.hasOwn(OCW_LOCALES,state.locale)?state.locale:'en';
const t=key=>(typeof OCW_COPY!=='undefined'&&(OCW_COPY[currentLocale()]?.[key]||OCW_COPY.en?.[key]))||key;
const displayQuestion=q=>{const localized=localizedQuestions.get(q.id)?.[currentLocale()];return localized?{...q,...localized}:q};
const displayCard=card=>{const localized=localizedCards.get(card.id)?.[currentLocale()];return localized?{...card,...localized}:card};
const hasQuestionTranslation=q=>currentLocale()==='en'||!!localizedQuestions.get(q.id)?.[currentLocale()];
function translateStatic(){
 document.documentElement.lang=currentLocale();
 document.querySelectorAll('[data-i18n]').forEach(node=>{node.textContent=t(node.getAttribute('data-i18n'))});
 document.querySelectorAll('[data-i18n-placeholder]').forEach(node=>{node.setAttribute('placeholder',t(node.getAttribute('data-i18n-placeholder')))});
 $('headerLanguage').value=currentLocale();$('profileLanguage').value=currentLocale();
 $('themeToggle').textContent='◑ '+(state.theme==='dark'?t('dark'):t('light'));
 $('libraryLoadMore').textContent=t('loadMore')+' ↗';
 const coverage=$('localeFallbackNote');if(coverage)coverage.textContent=currentLocale()==='en'?'':t('localeNote');
}
function setLocale(locale){
 if(!Object.hasOwn(OCW_LOCALES,locale))return;
 state.locale=locale;save();renderNav();translateStatic();
 const active=document.querySelector('.view.active')?.id;
 if(active==='challenge'){if($('finish').classList.contains('hidden')){if(selected===null)renderQuestion();else{const q=daily[step],copy=displayQuestion(q);$('question').textContent=copy.prompt;[...$('answers').children].forEach((b,i)=>b.textContent=String.fromCharCode(65+i)+'.  '+copy.answers[i]);$('reveal').replaceChildren(h('strong',{},selected===q.correct?t('correct'):t('incorrect')),h('p',{},copy.reveal),h('p',{className:'muted'},copy.takeaway));}}}
 if(active==='today')renderHome();
 if(active==='learn')renderLearn();
 if(active==='seasonal')renderSeasonal();
 if(active==='topics')renderTopics();
 if(active==='library')renderLibrary();
 if(active==='profile')renderProfile();
 if(active==='progress')renderProgress();
}
function setupLanguages(){
 for(const id of ['headerLanguage','profileLanguage']){
  const select=$(id);select.replaceChildren(...Object.entries(OCW_LOCALES).map(([code,label])=>h('option',{value:code},label)));
  select.onchange=()=>setLocale(select.value);
 }
 translateStatic();
}

function renderNav(){const tabs=[['today',t('today')],['challenge',t('challenge')],['library',t('library')],['progress',t('progress')],['profile',t('profile')]];for(const id of ['nav','mobileNav']){$(id).replaceChildren(...tabs.map(([key,label])=>{const b=h('button',{type:'button','data-view':key,className:key==='today'?'active':''},label);return b}))}}
function show(view){if(view==='challenge'){startChallenge();return}document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id===view));document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.getAttribute('data-view')===view));if(view==='library')renderLibrary();if(view==='progress')renderProgress();if(view==='today')renderHome();if(view==='profile')renderProfile();if(view==='learn')renderLearn();if(view==='topics')renderTopics();if(view==='seasonal')renderSeasonal();scrollTo({top:0,behavior:'auto'})}
function dailyQuestionSet(){const len=questions.length;if(!len)return [];const idx=dayIndex();const used=new Set();return Array.from({length:3},(_,i)=>{let n=((idx*7+i*31)%len+len)%len;while(used.has(n))n=(n+1)%len;used.add(n);return questions[n]})}
function startChallenge(isPractice=false,isChaos=false,category=null){practiceMode=!!isPractice;chaosMode=!!isChaos;practiceCategory=category;if(!questions.length){alert('Questions could not be loaded. Please refresh.');return}daily=practiceMode?practiceSet(chaosMode,practiceCategory):dailyQuestionSet();step=0;score=0;selected=null;roundAnswers=[];document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id==='challenge'));document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.getAttribute('data-view')==='challenge'));$('finish').classList.add('hidden');if(!practiceMode&&state.results[dayKey()]){showFinished(true)}else renderQuestion();scrollTo(0,0)}
function practiceSet(chaos=false,category=null){const chaosLabels=new Set(['logic','trap','pattern','onePercent','twist','science','perception','riddle']);const bank=category?questions.filter(q=>q.category===category):chaos?questions.filter(q=>q.id&&chaosLabels.has(q.label)):questions;const pool=bank.length>=3?bank:questions;const len=pool.length;const n=Number(state.practiceCount)||0;const used=new Set();return Array.from({length:Math.min(3,len)},(_,i)=>{let k=((n*19+dayIndex()*5+i*17)%len+len)%len;while(used.has(k))k=(k+1)%len;used.add(k);return pool[k]})}
function renderQuestion(){selected=null;const q=daily[step];$('phase').textContent=chaosMode?'CHAOS · '+String(q.label||['TRAP','TWIST','REALITY CHECK'][step]).replace('onePercent','1% QUESTION').toUpperCase():practiceCategory?practiceCategory.toUpperCase()+' · '+(step+1)+'/3':['WARM-UP','THINK DEEPER','STRETCH'][step];$('counter').textContent=(step+1)+' / 3';$('bar').style.width=((step+1)/3*100)+'%';const copy=displayQuestion(q);$('question').textContent=copy.prompt;$('questionFallbackNote').textContent=hasQuestionTranslation(q)?'':t('noTranslation');$('answers').replaceChildren(...copy.answers.map((answer,i)=>{const b=h('button',{type:'button',className:'answer'},String.fromCharCode(65+i)+'.  '+answer);b.addEventListener('click',()=>answerQuestion(i));return b}));$('reveal').classList.add('hidden');$('challengeReflection').classList.add('hidden');$('continue').classList.add('hidden')}
function answerQuestion(i){if(selected!==null)return;selected=i;const q=daily[step],copy=displayQuestion(q);roundAnswers[step]={category:q.category,correct:i===q.correct};if(i===q.correct)score++;for(const [j,btn] of [...$('answers').children].entries()){btn.disabled=true;if(j===q.correct)btn.classList.add('good');else if(j===i)btn.classList.add('bad')}$('reveal').replaceChildren(h('strong',{},i===q.correct?t('correct'):t('incorrect')),h('p',{},copy.reveal),h('p',{className:'muted'},copy.takeaway));renderReflection(q);$('reveal').classList.remove('hidden');$('continue').textContent=step===2?t('seeResults')+' →':t('next')+' →';$('continue').classList.remove('hidden')}
function renderReflection(q){
 const panel=$('challengeReflection');panel.classList.remove('hidden');
 $('reflectionQuestion').textContent='Did this explanation challenge what you expected?';
 const choices=[['Yes — that surprised me','Then keep the takeaway in mind. Surprises make excellent memory hooks.'],['Not this time','Good. Try explaining it to someone else without looking — that is another level of understanding.']];
 $('reflectionOptions').replaceChildren(...choices.map(([label,feedback])=>{
  const button=h('button',{type:'button'},label);
  button.onclick=()=>{[...$('reflectionOptions').children].forEach(b=>b.disabled=true);$('reflectionFeedback').textContent=feedback+' No extra points are awarded.'};
  return button;
 }));
 $('reflectionFeedback').textContent='Optional reflection · no additional points.';
}
function next(){if(selected===null)return;if(step<2){step++;renderQuestion()}else{if(practiceMode){state.practiceCount=(Number(state.practiceCount)||0)+1;state.practiceBest=Math.max(Number(state.practiceBest)||0,score)}else{state.results[dayKey()]={score,total:3};state.points=Math.max(0,Number(state.points)||0)+score;}if(!Array.isArray(state.topicActivity))state.topicActivity=[];for(const answer of roundAnswers){if(answer&&typeof answer.category==='string')state.topicActivity.push({category:answer.category,kind:'answer',correct:answer.correct})}save();showFinished(false);renderHome()}}
function showFinished(previous){$('question').textContent='';$('answers').replaceChildren();$('reveal').classList.add('hidden');$('challengeReflection').classList.add('hidden');$('continue').classList.add('hidden');$('phase').textContent='COMPLETE';$('counter').textContent='3 / 3';$('bar').style.width='100%';const val=previous?state.results[dayKey()].score:score;$('finishTitle').textContent=val===3?'Okay. You are annoyingly good at this.':val===2?'Almost. Your ego survives.':val===1?'At least you learned something.':'That was a reality check.';$('finishDescription').textContent=val+' / 3 correct · '+(previous?'You already played today. Come back tomorrow.':(practiceMode?'Practice result saved · No extra streak day or mastery points.':'Your score has been saved on this browser.'));$('finish').classList.remove('hidden')}
function renderHome(){const d=state.results[dayKey()];$('homeStreak').textContent=getStreak();$('homeLevel').textContent=level();$('homePoints').textContent=(Number(state.points)||0)+' points';$('homeScore').textContent=d?d.score+'/3':'—';const q=questions[(dayIndex()*13%Math.max(questions.length,1)+Math.max(questions.length,1))%Math.max(questions.length,1)];if(q){const copy=displayQuestion(q);$('dailyFactTitle').textContent=copy.prompt;$('dailyFactBody').textContent=copy.takeaway;const id='read-'+dayKey();$('dailyFactClaim').disabled=!!state.claimed[id];$('dailyFactClaim').textContent=state.claimed[id]?'+1 point claimed':'I read it · Claim +1 point';$('dailyFactClaim').onclick=()=>{if(state.claimed[id])return;state.claimed[id]=true;state.points++;if(!Array.isArray(state.topicActivity))state.topicActivity=[];state.topicActivity.push({category:q.category,kind:'read'});save();renderHome()}}}
const SEASONAL_STORIES=[
 {title:'The planet leans into it',category:'SCIENCE OF THE SEASONS',body:'Earth’s axis is tilted by about 23.4 degrees. As Earth moves around the Sun, changes in daylight length and the angle of sunlight produce our seasons — not primarily Earth’s changing distance from the Sun.',source:'NASA Space Place',url:'https://spaceplace.nasa.gov/seasons/en/'},
 {title:'An almost equal night',category:'EQUINOX',body:'At the equinox the Sun crosses the celestial equator, but daylight can last a little longer than twelve hours because the atmosphere bends light and sunrise is measured from the Sun’s upper edge.',source:'US Naval Observatory',url:'https://aa.usno.navy.mil/faq/equinoxes'},
 {title:'Halloween has a long history',category:'CULTURE & HISTORY',body:'The customs now associated with Halloween have developed through multiple traditions over time. Its history is more complicated than a single origin story.',source:'Library of Congress',url:'https://guides.loc.gov/halloween/introduction'},
 {title:'The light changes your inner clock',category:'HUMAN BIOLOGY',body:'Light is one of the main signals that helps align the body’s circadian clock with the day–night cycle. Seasonal changes in daylight can affect this timing.',source:'NIGMS',url:'https://nigms.nih.gov/education/fact-sheets/Pages/circadian-rhythms.aspx'}
];
function claimReading(id,category,callback){
 if(state.claimed[id])return;
 state.claimed[id]=true;state.points=Math.max(0,Number(state.points)||0)+1;
 if(!Array.isArray(state.topicActivity))state.topicActivity=[];
 state.topicActivity.push({category,kind:'read'});save();callback();
}
function renderLearn(){
 if(!learningCards.length){$('learnTitle').textContent='Stories are loading…';return;}
 const interests=Array.isArray(state.interests)?state.interests:[];
 const preferred=learningCards.filter(card=>interests.includes(card.category));
 const pool=preferred.length?preferred:learningCards;
 const sourceCard=pool[((readingIndex%pool.length)+pool.length)%pool.length];const card=displayCard(sourceCard);
 $('learnCategory').textContent=card.category.toUpperCase()+' · EDITORIAL CARD';
 $('learnTitle').textContent=card.title;
 $('learnIntro').textContent=card.introduction||'';
 $('learnExplanation').textContent=card.body;
 $('learnTakeaway').textContent=card.takeaway;
 $('learnSourceLine').textContent=t('source')+': '+card.sourceTitle;
 $('learnSource').href=card.sourceUrl;
 $('learnThought').textContent='What assumption would you reconsider after learning this?';
 $('learnQuiz').onclick=()=>startChallenge(true,false,questions.some(q=>q.category===card.category)?card.category:null);
 const id='card-'+sourceCard.id;
 $('learnClaim').disabled=!!state.claimed[id];
 $('learnClaim').textContent=state.claimed[id]?t('claimed'):t('claim');
 $('learnClaim').onclick=()=>claimReading(id,card.category,renderLearn);
}
function renderTopics(){
 const interests=Array.isArray(state.interests)?state.interests:[];const categories=[...new Set(questions.map(q=>q.category))].sort((a,b)=>Number(interests.includes(b))-Number(interests.includes(a))||a.localeCompare(b));
 $('topicsChoiceGrid').replaceChildren(...categories.map(category=>{
  const count=questions.filter(q=>q.category===category).length;
  const b=h('article',{className:'topic-choice'});
  b.append(h('span',{},'◈'),h('strong',{},category[0].toUpperCase()+category.slice(1).replace(/-/g,' ')),h('small',{},count+' questions and short readings'));
  const actions=h('div',{className:'topic-choice-actions'});
  const read=h('button',{type:'button',className:'button ghost mini'},'READ ↗');read.onclick=()=>{state.filter=category;save();show('library')};
  const quiz=h('button',{type:'button',className:'button mini'},'QUIZ ↗');quiz.onclick=()=>startChallenge(true,false,category);
  actions.append(read,quiz);b.append(actions);return b;
 }));
}
function renderSeasonal(){
 const grid=$('seasonalStoryGrid');
 const stories=learningCards.filter(card=>card.seasonal).map(displayCard);
 grid.replaceChildren(...stories.map(story=>{
  const card=h('article',{className:'seasonal-story'});
  card.append(h('span',{className:'tag'},story.category.toUpperCase()),h('h2',{},story.title),h('p',{},story.body),h('p',{className:'muted'},story.takeaway));
  const link=h('a',{href:story.sourceUrl,target:'_blank',rel:'noopener noreferrer'},story.sourceTitle+' · SOURCE ↗');
  card.append(link);return card;
 }));
 if(!stories.length)grid.replaceChildren(h('p',{className:'muted'},'Seasonal stories are currently unavailable.'));
}
function renderLibrary(){const categories=['all',...new Set(questions.map(x=>x.category))];$('topicSelect').replaceChildren(...categories.map(name=>h('option',{value:name},name==='all'?t('allTopics'):name[0].toUpperCase()+name.slice(1))));$('topicSelect').value=categories.includes(state.filter)?state.filter:'all';$('chips').replaceChildren(...categories.map(name=>{const b=h('button',{type:'button',className:'chip '+(state.filter===name?'selected':'')},name[0].toUpperCase()+name.slice(1));b.onclick=()=>{state.filter=name;libraryLimit=60;save();renderLibrary()};return b}));const query=$('search').value.trim().toLowerCase();const filtered=questions.filter(q=>(state.filter==='all'||q.category===state.filter)&&[...Object.values(q),...Object.values(displayQuestion(q))].filter(v=>typeof v==='string').join(' ').toLowerCase().includes(query));$('resultCount').textContent=filtered.length+' results';$('libraryGrid').replaceChildren(...filtered.slice(0,libraryLimit).map(q=>{const copy=displayQuestion(q);const id='question-'+questions.indexOf(q);const card=h('article',{className:'panel'});if(!hasQuestionTranslation(q))card.append(h('small',{className:'muted'},t('noTranslation')));card.append(h('span',{className:'tag'},q.category.toUpperCase()),h('div',{className:'cardtitle'},copy.prompt),h('p',{className:'muted'},copy.takeaway));const button=h('button',{type:'button',className:'button ghost mini'},state.claimed[id]?t('claimed'):t('claim'));button.disabled=!!state.claimed[id];button.onclick=()=>{if(state.claimed[id])return;state.claimed[id]=true;state.points++;if(!Array.isArray(state.topicActivity))state.topicActivity=[];state.topicActivity.push({category:q.category,kind:'read'});save();renderLibrary()};card.append(button);return card}));$('libraryShowing').textContent='Showing '+Math.min(filtered.length,libraryLimit)+' of '+filtered.length+' items';$('libraryLoadMore').classList.toggle('hidden',filtered.length<=libraryLimit)}
function renderInterests(){
 const grid=$('interestChoices');if(!grid)return;
 const interests=Array.isArray(state.interests)?state.interests:[];
 const categories=[...new Set(questions.map(q=>q.category))].sort();
 grid.replaceChildren(...categories.map(category=>{
  const button=h('button',{type:'button',className:'interest-choice'},category.charAt(0).toUpperCase()+category.slice(1));
  button.setAttribute('aria-pressed',String(interests.includes(category)));
  button.onclick=()=>{
   const chosen=Array.isArray(state.interests)?state.interests:[];
   state.interests=chosen.includes(category)?chosen.filter(c=>c!==category):[...chosen,category];
   save();renderInterests();
  };
  return button;
 }));
}
function renderProfile(){
 renderInterests();
 $('profileStreak').textContent=getStreak();
 $('profileLevel').textContent=level();
 $('profilePoints').textContent=Number(state.points)||0;
 $('profileLight').setAttribute('aria-pressed',String(state.theme==='light'));
 $('profileDark').setAttribute('aria-pressed',String(state.theme==='dark'));
}
function setWebTheme(theme){if(theme!=='light'&&theme!=='dark')return;state.theme=theme;document.documentElement.dataset.theme=theme;save();renderProfile();}
function renderKnowledgeMap(){
 const list=$('knowledgeMapList');if(!list)return;
 const categories=[...new Set(questions.map(q=>q.category).filter(v=>typeof v==='string'&&v.length))].sort();
 const counted=new Map(categories.map(category=>[category,{answers:0,correct:0,reads:0}]));
 const activities=Array.isArray(state.topicActivity)?state.topicActivity:[];
 for(const event of activities){
  if(!event||!counted.has(event.category))continue;
  const v=counted.get(event.category);
  if(event.kind==='answer'){v.answers++;if(event.correct===true)v.correct++;}
  if(event.kind==='read')v.reads++;
 }
 const rows=categories.map(category=>({category,...counted.get(category)}));
 rows.sort((a,b)=>(b.answers+b.reads)-(a.answers+a.reads)||a.category.localeCompare(b.category));
 const total=rows.filter(r=>r.answers+r.reads>0).length;
 $('knowledgeTopicCount').textContent=total;
 const most=rows.find(r=>r.answers+r.reads>0);
 $('knowledgeMapInsight').textContent=most?'You explored '+most.category.replace(/-/g,' ')+' most. Where to next?':'Your first three questions can start the map.';
 if(!rows.length){list.replaceChildren(h('p',{className:'muted'},'Knowledge topics will appear when the library loads.'));return;}
 const peak=Math.max(1,...rows.map(r=>r.answers+r.reads));
 list.replaceChildren(...rows.map(row=>{
  const n=row.answers+row.reads, name=row.category.replace(/(^|[-_ ])\w/g,m=>m.toUpperCase()).replace(/[-_]/g,' ');
  const container=h('div',{className:'knowledge-map-row'+(n===0?' knowledge-map-row-empty':'')});
  const upper=h('div',{className:'knowledge-map-row-top'});
  upper.append(h('strong',{},name),h('small',{},row.answers+' answers · '+row.correct+'/'+row.answers+' correct · '+row.reads+' reads'));
  const track=h('div',{className:'knowledge-map-track',role:'meter','aria-label':name+' recorded activity','aria-valuemin':'0','aria-valuemax':String(peak),'aria-valuenow':String(n)});
  const fill=h('span',{className:'knowledge-map-fill'});fill.style.width=(100*n/peak)+'%';
  track.append(fill);container.append(upper,track);return container;
 }));
}
function renderWeekComparison(){
 const el=$('weekComparison');if(!el)return;
 const rows=[{name:'Previous 7 days',offset:13},{name:'Recent 7 days',offset:6}];
 el.replaceChildren(...rows.map(({name,offset})=>{
  let count=0;
  for(let i=offset;i>offset-7;i--){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-i);if(state.results[dayKey(d)])count++;}
  const row=h('div',{className:'week-comparison-row'});row.append(h('span',{},name));
  const track=h('div',{className:'week-comparison-track',role:'meter','aria-label':name+' completed Daily Challenges','aria-valuemin':'0','aria-valuemax':'7','aria-valuenow':String(count)});
  const bar=h('div',{className:'week-comparison-fill'});bar.style.width=(count/7*100)+'%';track.append(bar);row.append(track,h('strong',{},count+' / 7'));return row;
 }));
}
function renderProgress(){
 renderKnowledgeMap();
 renderWeekComparison();
 const pts=Math.max(0,Number(state.points)||0);
 const currentLevel=level();
 const lower=(currentLevel-1)*10;
 const earned=pts-lower;
 const remaining=Math.max(0,10-earned);
 const dailyResults=Object.values(state.results||{}).filter(r=>r&&Number.isInteger(r.score)&&Number.isInteger(r.total)&&r.total>0&&r.score>=0&&r.score<=r.total);
 const attempted=dailyResults.reduce((sum,r)=>sum+r.total,0);
 const correct=dailyResults.reduce((sum,r)=>sum+r.score,0);
 const totalReads=Object.values(state.claimed||{}).filter(Boolean).length;
 $('pLevel').textContent=currentLevel;
 $('pPoints').textContent=pts;
 $('pStreak').textContent=getStreak();
 $('progressCompleted').textContent=dailyResults.length;
 $('progressAccuracy').textContent=attempted?Math.round(100*correct/attempted)+'%':'—';
 $('progressReads').textContent=totalReads;
 $('progressNextPoints').textContent=remaining+' points to go';
 $('progressNextBar').setAttribute('aria-valuenow',String(earned));
 $('progressNextFill').style.width=Math.min(100,Math.max(0,earned*10))+'%';
 $('progressHeadline').textContent=dailyResults.length===0?'A little curiosity goes a long way. Your first daily challenge is waiting.':getStreak()>=3?'Consistency looks surprisingly good on you.':correct===attempted?'Perfect so far. Your ego must be thrilled.':'You showed up. That is how progress gets made.';
 $('practiceBest').textContent=Number.isInteger(state.practiceBest)?state.practiceBest+'/3':'—';
 $('practiceCount').textContent=(Number(state.practiceCount)||0)+' optional rounds played';
 const days=Array.from({length:7},(_,i)=>{
  const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-6+i);
  const done=!!state.results[dayKey(d)];
  const box=h('div',{className:'progress-day'+(done?' is-done':'')});
  box.append(h('strong',{},d.toLocaleDateString('en',{weekday:'short'})),h('span',{},done?'✓':'·'));
  box.setAttribute('aria-label',d.toLocaleDateString('en',{weekday:'long',month:'short',day:'numeric'})+(done?' — completed':' — no daily result'));
  return box;
 });
 $('week').replaceChildren(...days);
 $('progressWeekCount').textContent=days.filter(x=>x.classList.contains('is-done')).length+' / 7 days';
}
async function init(){document.documentElement.dataset.theme=state.theme;renderNav();setupLanguages();try{const raw=JSON.parse($('embeddedLocalizedContent')?.textContent||'{}');localizedQuestions=new Map((raw.questions||[]).map(x=>[x.id,x.translations]));localizedCards=new Map((raw.cards||[]).map(x=>[x.id,x.translations]));}catch{localizedQuestions=new Map();localizedCards=new Map();}try{learningCards=JSON.parse($('embeddedLearningCards')?.textContent||'[]')}catch{learningCards=[]};document.body.addEventListener('click',e=>{const topic=e.target.closest('[data-topic]');if(topic){state.filter=topic.getAttribute('data-topic');save();show('library');return;}const b=e.target.closest('[data-view]');if(b){show(b.getAttribute('data-view'));return;}});$('start').onclick=()=>show('challenge');$('extraBegin').onclick=()=>startChallenge(true);$('chaosBegin').onclick=()=>startChallenge(true,true);$('seasonalQuiz').onclick=()=>startChallenge(true,false,'earth');$('learnNext').onclick=()=>{readingIndex++;renderLearn()};$('homeExtraRound').onclick=()=>startChallenge(true);$('homeChaos').onclick=()=>startChallenge(true,true);$('extraRound').onclick=()=>startChallenge(true);$('progressPractice').onclick=()=>startChallenge(true);$('topicSelect').onchange=()=>{state.filter=$('topicSelect').value;libraryLimit=60;save();renderLibrary()};$('libraryLoadMore').onclick=()=>{libraryLimit+=60;renderLibrary()};$('topicRandom').onclick=()=>{const opts=['all',...new Set(questions.map(q=>q.category))];if(opts.length>1){state.filter=opts[1+Math.floor(Math.random()*(opts.length-1))];save();renderLibrary()}};$('continue').onclick=next;$('themeToggle').onclick=()=>setWebTheme(state.theme==='dark'?'light':'dark');$('profileLight').onclick=()=>setWebTheme('light');$('profileDark').onclick=()=>setWebTheme('dark');$('search').addEventListener('input',()=>{libraryLimit=60;renderLibrary()});$('reset').onclick=()=>{if(confirm('Reset this browser’s beta progress?')){state={...defaultState,theme:state.theme};save();show('today')}};try{const embedded=$('embeddedQuestionCatalog');let data=embedded?JSON.parse(embedded.textContent):null;if(!Array.isArray(data)||!data.length){const response=await fetch('./questions.json');if(!response.ok)throw Error(String(response.status));data=await response.json()}if(!Array.isArray(data)||!data.length)throw Error('empty catalog');questions=data.filter(x=>x&&typeof x.prompt==='string'&&Array.isArray(x.answers)&&x.answers.length===3&&Number.isInteger(x.correct)&&x.correct>=0&&x.correct<3);if(!questions.length)throw Error('no valid questions');renderHome();renderLibrary()}catch(e){$('dailyFactBody').textContent='Questions are currently unavailable. Try refreshing the page.';console.error('Question catalog unavailable',e)}}init();