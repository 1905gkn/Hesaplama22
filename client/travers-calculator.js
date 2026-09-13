(function () {
  'use strict';
  const table = __RAFEX_TRAVERS_TABLE__;
  const index = new Map(table.records.map(row => [`${row.length}:${row.load}:${row.group}`, row]));
  function recommend(length, load) {
    if (!table.lengths.includes(length) || !table.loads.includes(load)) return null;
    return table.groups.map(group => ({ ...index.get(`${length}:${load}:${group}`) }));
  }
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mount() {
    const page = document.getElementById('page');
    if (!page) return;
    page.oninput = null;
    page.onclick = null;
    page.innerHTML = `<section class="trv-calculator" aria-labelledby="trv-title">
      <header class="trv-heading"><span>TRAVERS SEÇİMİ</span><h2 id="trv-title">Boy ve yüke göre travers önerileri</h2><p>CC ve kutu kesitleri ST37 ve ST52 seçenekleriyle karşılaştırın.</p></header>
      <form id="trv-form" class="trv-form">
        <label for="trv-length">Travers boyu kaç mm?<select id="trv-length" required><option value="">Boy seçin</option>${table.lengths.map(n => `<option value="${n}">${n.toLocaleString('tr-TR')} mm</option>`).join('')}</select></label>
        <label for="trv-load">Taşınacak toplam kat yükü kaç kg?<select id="trv-load" required><option value="">Yük seçin</option>${table.loads.map(n => `<option value="${n}">${n.toLocaleString('tr-TR')} kg</option>`).join('')}</select><small>Bir çift traversin taşıyacağı toplam yük.</small></label>
        <button type="submit">Traversleri göster</button>
      </form>
      <div id="trv-results" aria-live="polite" aria-atomic="true"><p class="trv-empty">Travers boyunu ve yükü seçerek önerileri görüntüleyin.</p></div>
      <p class="trv-scope">Dar kenar 50 mm; önce 1,50 mm et kalınlığı, ardından düşük ağırlık. HR120.80.3,0 ayak ve 170 cm kat yüksekliği esas alınmıştır. Hareketli ve deprem yükleri dahil değildir.</p>
    </section>`;
    const form = document.getElementById('trv-form');
    const result = document.getElementById('trv-results');
    form.addEventListener('change', () => { result.innerHTML = '<p class="trv-empty">Seçim değişti. Güncel öneriler için Traversleri göster düğmesine basın.</p>'; });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const length = Number(document.getElementById('trv-length').value);
      const load = Number(document.getElementById('trv-load').value);
      const rows = recommend(length, load);
      if (!rows) { result.innerHTML = '<p class="trv-empty">Tablodan bir travers boyu ve yük seçin.</p>'; return; }
      result.innerHTML = `<h3 class="trv-result-title">${length.toLocaleString('tr-TR')} mm · ${load.toLocaleString('tr-TR')} kg kat yükü</h3><div class="trv-options">${rows.map(row => `<article class="trv-option${row.manual ? ' trv-manual' : ''}"><h4>${escape(row.group)}</h4><p class="trv-section">${row.section ? escape(row.section.replace(/ ST(?:37|52)$/, '').replace(/^Kutu50\.(\d+)\.(.+)$/, 'Kutu $1 × 50 × $2').replace(/^CC(\d+)x50x(.+)$/, 'CC $1 × 50 × $2'))+' mm' : 'Uygun kesit bulunamadı'}</p><p class="trv-status">${row.manual ? 'Manuel seçim — hesap sınırını aşıyor' : row.section ? 'Tablodaki öneri' : 'Bu tip ve kalitede tablo kapsamında uygun ürün yok.'}</p></article>`).join('')}</div>`;
    });
  }
  window.RafexTravers = { recommend, mount };
  const original = window.showPage;
  if (typeof original === 'function') {
    window.showPage = function(name) {
      const output = original.apply(this, arguments);
      // Run the existing permission checks and navigation before mounting this module.
      if (name === 'travers' && document.querySelector('#nav button.active[data-page="travers"]')) mount();
      return output;
    };
  }
})();
