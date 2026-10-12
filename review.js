let activeReviewId=null;
let activeReviewAnswer=null;
function reviewQueue(){
  const today=dateKey();
  return CARDS.filter(card=>{
    const answer=state.quizAnswers[card.id],last=state.reviewLog[card.id];
    const missed=Number.isInteger(answer)&&answer!==QUIZZES[card.id].answer;
    const lastSeen=last||state.completed[card.id];
    const age=lastSeen?Math.round((Date.parse(today)-Date.parse(lastSeen))/86400000):0;
    return (missed&&last!==today)||(Boolean(lastSeen)&&age>=3);
  }).sort((a,b)=>{
    const missed=card=>Number.isInteger(state.quizAnswers[card.id])&&state.quizAnswers[card.id]!==QUIZZES[card.id].answer;
    return Number(missed(b))-Number(missed(a))||(state.reviewLog[a.id]||state.completed[a.id]||'').localeCompare(state.reviewLog[b.id]||state.completed[b.id]||'');
  });
}
function renderReview(){
  const queue=reviewQueue();
  document.querySelector('#review-count').textContent=t('{n} to review',{n:queue.length});
  document.querySelector('#review-grid').innerHTML=queue.length?queue.map(miniCardMarkup).join(''):`<div class="empty-state"><h3>${t('Nothing to review yet')}</h3><p>${t('Missed questions appear here. Completed ideas return after three days.')}</p></div>`;
}
function reviewAction(card){
  if(activeReviewId!==card.id)return '';
  const answered=activeReviewAnswer===QUIZZES[card.id]?.answer;
  return `<div class="review-action"><button class="primary-button" type="button" data-reviewed="${card.id}" ${answered?'':'disabled'}>${t('Finish review')}</button><p>${t('Answer the question correctly to finish this review.')}</p></div>`;
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-reviewed]');
  if(!button)return;
  const id=button.dataset.reviewed;
  if(activeReviewAnswer!==QUIZZES[id]?.answer)return;
  state.quizAnswers[id]=activeReviewAnswer;
  state.reviewLog[id]=dateKey();activeReviewId=null;saveState();renderAll();
  document.querySelector('#card-dialog').close();trackEvent('review_complete',{topic:findCard(id)?.topic});showToast(t('Review complete. Come back for the next one.'));
});
