let introAnalyticsPending = false;

function renderSessionExperience({allDone, total}) {
  document.querySelector('#welcome-panel').hidden = state.onboardingSeen;
  document.querySelector('#daily-progress').hidden = allDone;
  const panel = document.querySelector('#session-complete');
  panel.hidden = !allDone;
  panel.innerHTML = allDone ? `<span class="session-mark" aria-hidden="true">✦</span><p class="eyebrow">${t('A small win for your mind.')}</p><h2>${t('You completed {n} ideas today.', {n: total})}</h2><p>${t('Your next daily set arrives tomorrow. Review an idea now, or enjoy being done for today.')}</p><div class="welcome-actions"><button class="primary-button" type="button" data-view-link="review">${t('Review an idea')}</button><button class="secondary-button" type="button" data-view-link="library">${t('Keep exploring')}</button></div>` : '';
}

function sessionNextAction(card) {
  if (activeReviewId || !isCompleteToday(card.id) || !todaysCards().some(item => item.id === card.id)) return '';
  const next = todaysCards().find(item => !isCompleteToday(item.id));
  return `<div class="session-next"><p>${t('This idea is part of your day now.')}</p>${next ? `<button class="primary-button full-width" type="button" data-next-idea="${escapeHtml(next.id)}">${t('Next idea →')}</button>` : `<button class="primary-button full-width" type="button" data-session-summary>${t('See today’s summary')}</button>`}</div>`;
}

function feedbackReport(message, category) {
  const categories = {usability:'Usability', content:'Content or translation', bug:'Bug', idea:'Suggestion'};
  const card = document.querySelector('#card-dialog').open ? activeDialogCardId : null;
  return `${categories[category] || 'Feedback'}\n\n${message.trim()}\n\nLanguage: ${currentLanguage}\nCard: ${card || 'General website'}\nVersion: 20261012-6`;
}

document.addEventListener('click', async event => {
  if (event.target.closest('[data-try-card]')) {
    state.onboardingSeen = true; saveState(); renderAll(); introAnalyticsPending = true;
    const card = todaysCards()[0];
    if (card) openCard(card.id);
  }
  if (event.target.closest('[data-choose-topics]')) document.querySelector('#settings-button').click();
  const next = event.target.closest('[data-next-idea]');
  if (next) openCard(next.dataset.nextIdea);
  if (event.target.closest('[data-session-summary]')) {
    document.querySelector('#card-dialog').close(); showView('today');
  }
  if (event.target.closest('[data-open-feedback]')) {
    translateInterface(); document.querySelector('#feedback-dialog').showModal();
  }
  if (event.target.closest('[data-close-feedback]')) document.querySelector('#feedback-dialog').close();
  if (event.target.closest('[data-copy-feedback]')) {
    const field = document.querySelector('#feedback-report');
    try {
      await navigator.clipboard.writeText(field.value);
      document.querySelector('#feedback-status').textContent = t('Report copied.');
    } catch {
      field.focus(); field.select();
      document.querySelector('#feedback-status').textContent = t('Select and copy the report above.');
    }
  }
});

document.querySelector('#feedback-form').addEventListener('submit', event => {
  event.preventDefault();
  const message = document.querySelector('#feedback-message').value.trim();
  if (message.length < 10 || message.length > 1500) { document.querySelector("#feedback-error").textContent=t("Write at least 10 characters about the problem or idea."); return; }
  document.querySelector("#feedback-error").textContent="";
  const category = document.querySelector('#feedback-category').value;
  const report = feedbackReport(message, category);
  document.querySelector('#feedback-report').value = report;
  const params = new URLSearchParams({title:`[Feedback] ${category}`, body:report});
  document.querySelector('#feedback-link').href = `https://github.com/EvelynD9/daily-knowledge/issues/new?${params}`;
  document.querySelector('#feedback-ready').hidden = false;
  document.querySelector('#feedback-status').textContent = '';
});
document.querySelector('#feedback-dialog').addEventListener('close', () => {
  document.querySelector('#feedback-form').reset();
  document.querySelector('#feedback-error').textContent='';
  document.querySelector('#feedback-ready').hidden = true;
  document.querySelector('#feedback-report').value = '';
  document.querySelector('#feedback-link').removeAttribute('href');
  document.querySelector('#feedback-status').textContent = '';
});
