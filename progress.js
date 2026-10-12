let pendingBackup = null;
let backupReadId = 0;
const BACKUP_LIMIT = 2 * 1024 * 1024;

function makeProgressBackup() {
  return {format:'one-card-wiser', version:1, savedAt:new Date().toISOString(), language:currentLanguage, state:JSON.parse(JSON.stringify(state))};
}

function readProgressBackup(text) {
  if (text.length > BACKUP_LIMIT) throw new Error('This file is too large. Choose a progress backup smaller than 2 MB.');
  let file;
  try { file=JSON.parse(text); } catch { throw new Error('This is not a valid One Card Wiser backup.'); }
  const object=value=>value && typeof value==='object' && !Array.isArray(value);
  if (!object(file) || file.format!=='one-card-wiser' || file.version!==1 || !object(file.state) || !Object.hasOwn(LANGUAGE_NAMES,file.language) || typeof file.savedAt!=='string' || !Number.isFinite(Date.parse(file.savedAt))) throw new Error('This is not a supported One Card Wiser backup.');
  const raw=file.state;
  const date=value=>typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
  const invalid=()=>{throw new Error('The backup contains invalid progress data. Your current progress has not changed.');};
  if (!Array.isArray(raw.topics) || !raw.topics.length || !raw.topics.every(id=>Object.hasOwn(TOPICS,id)) || !Array.isArray(raw.discoveredCards) || raw.discoveredCards.length>1000) invalid();
  const discoveredCards=raw.discoveredCards.map(card=>{
    if (!object(card) || !Object.hasOwn(TOPICS,card.topic) || typeof card.id!=='string' || !/^[\w-]{1,100}$/.test(card.id) || CARDS.some(c=>c.id===card.id)) invalid();
    let url;try{url=new URL(card.sourceUrl);}catch{invalid();}
    if(url.protocol!=='https:' || url.hostname!=='en.wikipedia.org' || url.username || url.password || url.href.length>2048) invalid();
    const result={id:card.id,topic:card.topic,discovered:true,sourceName:'Wikipedia',sourceUrl:url.href};
    for(const key of ['title','hook','concept','example','takeaway']){
      if(typeof card[key]!=='string' || !card[key].trim() || card[key].length>20000) invalid();
      result[key]=card[key];
    }
    return result;
  });
  const cards=new Map([...CARDS,...discoveredCards].map(card=>[card.id,card]));
  const known=id=>typeof id==='string' && cards.has(id);
  const checkKnown=id=>{if(!known(id))throw new Error('This backup includes unavailable cards. Refresh the website and try again.');};
  const dateMap=value=>{
    if(!object(value))invalid();
    return Object.fromEntries(Object.entries(value).map(([id,day])=>{checkKnown(id);if(!date(day))invalid();return [id,day];}));
  };
  if(!Array.isArray(raw.saved))invalid();raw.saved.forEach(checkKnown);
  const completed=dateMap(raw.completed),reviewLog=dateMap(raw.reviewLog);
  if(!object(raw.completionLog) || !object(raw.dailyCardIds) || !object(raw.quizAnswers))invalid();
  const completionLog={};
  for(const [day,ids] of Object.entries(raw.completionLog)){
    if(!date(day) || !Array.isArray(ids))invalid();ids.forEach(checkKnown);completionLog[day]=[...new Set(ids)];
  }
  for(const [id,day] of Object.entries(completed))completionLog[day]=[...new Set([...(completionLog[day]||[]),id])];
  const quizAnswers={};
  for(const [id,answer] of Object.entries(raw.quizAnswers)){
    checkKnown(id);
    if(answer!=='recalled' && (!Number.isInteger(answer) || answer<0 || answer>2))invalid();
    quizAnswers[id]=answer;
  }
  const dailyCardIds={};
  for(const [day,topics] of Object.entries(raw.dailyCardIds)){
    if(!date(day) || !object(topics))invalid();dailyCardIds[day]={};
    for(const [topic,id] of Object.entries(topics)){
      checkKnown(id);if(!Object.hasOwn(TOPICS,topic) || cards.get(id).topic!==topic)invalid();dailyCardIds[day][topic]=id;
    }
  }
  return {...file,state:{topics:[...new Set(raw.topics)],completed,saved:[...new Set(raw.saved)],quizAnswers,completionLog,reviewLog,dailyCardIds,discoveredCards,discoveryIndex:Number.isSafeInteger(raw.discoveryIndex)?Math.max(0,raw.discoveryIndex):0,onboardingSeen:true}};
}

function mergeProgressBackup(current, incoming) {
  const latest=(a,b)=>Object.fromEntries([...new Set([...Object.keys(a),...Object.keys(b)])].map(id=>[id,[a[id],b[id]].filter(Boolean).sort().pop()]));
  const completionLog={};
  for(const day of new Set([...Object.keys(current.completionLog),...Object.keys(incoming.completionLog)]))completionLog[day]=[...new Set([...(current.completionLog[day]||[]),...(incoming.completionLog[day]||[])])];
  const completed=latest(current.completed,incoming.completed);
  for(const [day,ids] of Object.entries(completionLog))for(const id of ids)if(!completed[id] || day>completed[id])completed[id]=day;
  const dailyCardIds={};
  for(const day of new Set([...Object.keys(current.dailyCardIds),...Object.keys(incoming.dailyCardIds)]))dailyCardIds[day]={...(incoming.dailyCardIds[day]||{}),...(current.dailyCardIds[day]||{})};
  return {...current,topics:incoming.topics,completed,completionLog,dailyCardIds,
    saved:[...new Set([...current.saved,...incoming.saved])],
    quizAnswers:{...incoming.quizAnswers,...current.quizAnswers},
    reviewLog:latest(current.reviewLog,incoming.reviewLog),
    discoveredCards:[...new Map([...incoming.discoveredCards,...current.discoveredCards].map(card=>[card.id,card])).values()],
    discoveryIndex:Math.max(current.discoveryIndex,incoming.discoveryIndex),onboardingSeen:true};
}

function restoreProgressBackup(backup) {
  const merged=mergeProgressBackup(state,backup.state);
  // Persist first: a failed storage write must leave the current session untouched.
  localStorage.setItem(STORAGE_KEY,JSON.stringify(merged));
  state=merged;
  switchLanguage(backup.language);
  renderAll();ensureDailyCards();
}

document.addEventListener('click', event=>{
  if(event.target.closest('[data-open-progress]'))document.querySelector('#progress-dialog').showModal();
  if(event.target.closest('[data-close-progress]'))document.querySelector('#progress-dialog').close();
  if(event.target.closest('[data-export-progress]')){
    const blob=new Blob([JSON.stringify(makeProgressBackup(),null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`one-card-wiser-progress-${dateKey()}.json`;document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    document.querySelector('#backup-status').textContent=t('Backup download started. Keep the file somewhere you can find it.');
  }
  if(event.target.closest('[data-choose-backup]'))document.querySelector('#backup-file').click();
  if(event.target.closest('[data-cancel-restore]')){
    pendingBackup=null;document.querySelector('#backup-preview').hidden=true;document.querySelector('#backup-file').value='';
  }
  if(event.target.closest('[data-restore-progress]') && pendingBackup){
    try{
      restoreProgressBackup(pendingBackup);pendingBackup=null;
      document.querySelector('#progress-dialog').close();
      showToast(t('Progress restored. Your existing learning history was kept.'));
    }catch{
      document.querySelector('#backup-error').textContent=t('Your browser could not save the restored progress. Free some space or allow site storage.');
    }
  }
});

document.querySelector('#backup-file').addEventListener('change',async event=>{
  const readId=++backupReadId;
  pendingBackup=null;document.querySelector('#backup-preview').hidden=true;document.querySelector('#backup-error').textContent='';
  const file=event.target.files?.[0];if(!file)return;
  try{
    if(file.size>BACKUP_LIMIT)throw new Error('This file is too large. Choose a progress backup smaller than 2 MB.');
    const backup=readProgressBackup(await file.text());if(readId!==backupReadId)return;pendingBackup=backup;
    const value=backup.state;
    document.querySelector('#backup-filename').textContent=file.name;
    document.querySelector('#backup-summary').textContent=t('Completed cards: {c} · Saved ideas: {s} · Topics: {n}',{c:Object.keys(value.completed).length,s:value.saved.length,n:value.topics.length});
    document.querySelector('#backup-preferences').textContent=t('Topics and language will come from this backup. Language: {language}.',{language:LANGUAGE_NAMES[backup.language]});
    document.querySelector('#backup-preview').hidden=false;
  }catch(error){if(readId===backupReadId)document.querySelector('#backup-error').textContent=t(error.message);}
});
document.querySelector('#progress-dialog').addEventListener('close',()=>{
  backupReadId++;pendingBackup=null;document.querySelector('#backup-file').value='';document.querySelector('#backup-preview').hidden=true;
  document.querySelector('#backup-error').textContent='';document.querySelector('#backup-status').textContent='';
});
