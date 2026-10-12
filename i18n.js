const ORIGINAL_CONTENT=JSON.parse(JSON.stringify({TOPICS,CARDS,QUIZZES}));
const CONTENT_LOCALES={el:CONTENT_EL,ru:CONTENT_RU,ro:CONTENT_RO};
let currentLanguage='en';
function initialLanguage(){
  const requested=new URLSearchParams(location.search).get('lang');
  if(Object.hasOwn(LANGUAGE_NAMES,requested))return requested;
  try{const stored=localStorage.getItem('ocw-language');if(Object.hasOwn(LANGUAGE_NAMES,stored))return stored;}catch{}
  return 'en';
}
function t(key,values={}){
 let text=UI_TRANSLATIONS[key]?.[currentLanguage]||key;
 if(currentLanguage==="en"){
  if(key==="{n} ideas"&&values.n===1)text="{n} idea";
  if(key==="Last 7 days: {n} cards completed · {d} days of learning"){
   if(values.n===1)text=text.replace("cards completed","card completed");
   if(values.d===1)text=text.replace("days of learning","day of learning");
  }
 }
 return text.replace(/\{(\w+)\}/g,(match,name)=>values[name]??match);
}
function localePath(path){return '/'+(currentLanguage==='en'?'':currentLanguage+'/')+path.replace(/^\/+/, '');}
function languageSelectMarkup(){return `<label class="language-picker"><span data-i18n="Language">${t('Language')}</span><select data-language-select aria-label="${t('Language')}" data-i18n-aria="Language">${Object.entries(LANGUAGE_NAMES).map(([code,name])=>`<option value="${code}" ${code===currentLanguage?'selected':''}>${name}</option>`).join('')}</select></label>`;}
function translateInterface(){
  document.documentElement.lang=currentLanguage;document.title='One Card Wiser — '+t('Daily learning');
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-i18n-title]').forEach(el=>el.setAttribute('title',t(el.dataset.i18nTitle)));
  document.querySelectorAll('[data-language-select]').forEach(el=>el.value=currentLanguage);
  document.querySelectorAll('[data-locale-path]').forEach(el=>el.href=localePath(el.dataset.localePath));
}
function applyLanguage(language){
  currentLanguage=Object.hasOwn(LANGUAGE_NAMES,language)?language:'en';
  Object.keys(TOPICS).forEach((id,index)=>{const row=TOPIC_LOCALES[currentLanguage]?.[index];TOPICS[id].label=row?.[0]||ORIGINAL_CONTENT.TOPICS[id].label;TOPICS[id].subtitle=row?.[1]||ORIGINAL_CONTENT.TOPICS[id].subtitle;});
  CARDS.forEach((card,index)=>{
    const row=CONTENT_LOCALES[currentLanguage]?.[card.id],original=ORIGINAL_CONTENT.CARDS[index];
    ['title','hook','concept','example','takeaway'].forEach((field,i)=>card[field]=row?.[i]||original[field]);
    const quiz=ORIGINAL_CONTENT.QUIZZES[card.id];QUIZZES[card.id]={...quiz,question:row?.[5]||quiz.question,options:row?.[6]||[...quiz.options],feedback:row?.[7]||quiz.feedback};
  });translateInterface();
}
function switchLanguage(language){
  if(!Object.hasOwn(LANGUAGE_NAMES,language))return;
  const draft=document.querySelector('#topic-dialog')?.open?[...document.querySelectorAll('#topic-options input:checked')].map(el=>el.value):null;
  try{localStorage.setItem('ocw-language',language);}catch{}
  const url=new URL(location.href||location.origin+location.pathname+location.search);url.searchParams.set('lang',language);
  if(typeof history!=='undefined')history.replaceState(null,'',url);
  applyLanguage(language);if(typeof renderAll==='function')renderAll();
  if(draft)document.querySelectorAll('#topic-options input').forEach(el=>el.checked=draft.includes(el.value));
}
document.addEventListener('change',event=>{if(event.target.matches('[data-language-select]'))switchLanguage(event.target.value);});
applyLanguage(initialLanguage());try{localStorage.setItem('ocw-language',currentLanguage);}catch{}
