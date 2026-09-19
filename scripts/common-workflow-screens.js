// Two views of one live project: never clone catalogs, canvases or event handlers.
(function () {
  if (window.__rafexWorkflowScreens) return;
  window.__rafexWorkflowScreens = true;
  let screen = 'types', frame = null;
  const page = () => document.getElementById('page');
  const common = node => node && (node.classList.contains('rafex-common-independent') || node.dataset.rafexCommonActive === '1');
  function switchScreen(next) {
    screen = next === 'layout' ? 'layout' : 'types';
    sync();
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      document.getElementById(screen === 'layout' ? 'rafexLayoutScreenHeader' : 'rafexOpenLayoutScreen')?.scrollIntoView({block:'start'});
    });
  }
  function sync() {
    frame = null;
    const root = page();
    if (!common(root)) { screen = 'types'; root?.removeAttribute('data-rafex-workflow-screen'); return; }
    if (root.dataset.rafexWorkflowScreen !== screen) root.dataset.rafexWorkflowScreen = screen;
    // All systems keep their native save handler; the new navigation is a sibling.
    const save = root.querySelector('#mrSaveRackButton, #rafexKonsolCommonSaveRack') || root.querySelector('#m2SaveRackButton');
    if (save && !root.querySelector('#rafexOpenLayoutScreen')) {
      const row = document.createElement('div'); row.id = 'rafexLayoutScreenLaunch';
      const button = document.createElement('button'); button.type = 'button';
      button.id = 'rafexOpenLayoutScreen'; button.textContent = 'Serbest Yerleşim Alanı';
      button.className = 'primary-green'; button.addEventListener('click', () => switchScreen('layout'));
      row.append(button);
      const bar = save.closest('.rafex-b2b-mekik-savebar,.common-full-savebar,.m2-export,.mr-rack-save') || save.parentElement;
      bar.insertAdjacentElement('afterend', row);
    }
    const floor = root.querySelector('.m2-floor-editor');
    if (floor && !root.querySelector('#rafexLayoutScreenHeader')) {
      const header = document.createElement('section'); header.id = 'rafexLayoutScreenHeader'; header.className = 'card';
      const title = document.createElement('h2'); title.textContent = 'Serbest Yerleşim Alanı';
      const copy = document.createElement('p'); copy.textContent = 'Kayıtlı raf tiplerini seçip alana yerleştirin. Ölçüler, ürün listesi, kesit ve proje çıktıları bu ekrandadır.';
      const back = document.createElement('button'); back.type = 'button'; back.className = 'primary-green';
      back.id = 'rafexBackToRackTypes'; back.textContent = '← Raf Tipi Oluşturmaya Dön';
      back.addEventListener('click', () => switchScreen('types'));
      header.append(title, copy, back); floor.before(header);
    }
  }
  function queue() { if (frame === null) frame = requestAnimationFrame(sync); }
  // Observe replacements only, with a single queued pass and no polling.
  const observer = new MutationObserver(queue);
  const start = () => { observer.observe(document.getElementById('page') || document.body, {childList:true,subtree:true}); sync(); };
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('#nav button[data-page]')) { screen = 'types'; queue(); }
    const add = target?.closest('#m2SavedTypesPanel button');
    if (screen === 'types' && add && /m2AddSelectedSavedRack/.test(add.getAttribute('onclick') || '')) switchScreen('layout');
  }, true);
  document.addEventListener('dblclick', event => {
    if (screen === 'types' && event.target instanceof Element && event.target.closest('#m2SavedTypeList')) switchScreen('layout');
  }, true);
  document.addEventListener('keydown', event => {
    if (screen !== 'types' || !common(page()) || event.target?.closest?.('input,textarea,select,[contenteditable="true"]')) return;
    // Hidden placement must not be edited by drawing shortcuts on the type screen.
    if (event.target?.closest?.('[role="dialog"],.m2-spacing-modal,.m2-customize-modal')) return;
    if (['Delete','Backspace','o','O'].includes(event.key) || ((event.ctrlKey || event.metaKey) && ['s','d','z','v','q'].includes(event.key.toLowerCase()))) event.stopImmediatePropagation();
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true}); else start();
})();
