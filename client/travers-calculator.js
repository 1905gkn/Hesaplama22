(function () {
  'use strict';
  const table = __RAFEX_TRAVERS_TABLE__;
  const miniTable = __RAFEX_MINI_TABLE__;
  function recommend(length, load, data = table) {
    if (!Number.isFinite(length) || !Number.isFinite(load) || length <= 0 || load <= 0) return null;
    length = data.lengths.find(n => n >= length);
    load = data.loads.find(n => n >= load);
    if (length === undefined || load === undefined) return null;
    return data.groups.map(group => ({ ...data.records.find(r => r.length === length && r.load === load && r.group === group) }));
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
        <label for="trv-length">Travers boyu kaç mm?<input id="trv-length" type="number" inputmode="decimal" min="0.01" max="4000" step="any" placeholder="Örnek: 2650" required></label>
        <label for="trv-load">Taşınacak toplam kat yükü kaç kg?<input id="trv-load" type="number" inputmode="decimal" min="0.01" max="4500" step="any" placeholder="Örnek: 3000" required><small>Bir çift traversin taşıyacağı toplam yük.</small></label>
        <button type="submit">Traversleri göster</button>
      </form>
      <p class="trv-scope">Boy ve yük, tabloda yoksa ayrı ayrı bir üst değere tamamlanır. En fazla 4000 mm ve 4500 kg girilebilir.</p><div id="trv-results" aria-live="polite" aria-atomic="true"><p class="trv-empty">Travers boyunu ve yükü yazarak önerileri görüntüleyin.</p></div>
      <p class="trv-scope">Dar kenar 50 mm; önce 1,50 mm et kalınlığı, ardından düşük ağırlık. HR120.80.3,0 ayak ve 170 cm kat yüksekliği esas alınmıştır. Hareketli ve deprem yükleri dahil değildir.</p>
    </section>`;
    const upperSection = page.querySelector('.trv-calculator');
    const miniSection = upperSection.cloneNode(true);
    miniSection.innerHTML = miniSection.innerHTML.replaceAll('trv-', 'mini-');
    // Restore shared CSS classes; only element IDs and label references differ.
    miniSection.querySelectorAll('[class]').forEach(el => el.className = el.className.replaceAll('mini-', 'trv-'));
    miniSection.setAttribute('aria-labelledby', 'mini-title');
    miniSection.querySelector('h2').textContent = 'Mini Rack ve Toplama Katı Hesaplama';
    miniSection.querySelector('.trv-heading>span').textContent = 'MİNİ RACK';
    miniSection.querySelector('.trv-heading p').textContent = 'ZS ST37 ve kutu ST37 travers seçeneklerini karşılaştırın.';
    miniSection.querySelector('#mini-length').max = '3600';
    miniSection.querySelector('#mini-load').max = '1500';
    miniSection.querySelector('#mini-load').placeholder = 'Örnek: 650';
    miniSection.querySelectorAll('.trv-scope')[0].textContent = 'Boy ve yük, tabloda yoksa ayrı ayrı bir üst değere tamamlanır. En fazla 3600 mm ve 1500 kg girilebilir.';
    miniSection.querySelectorAll('.trv-scope')[1].textContent = '800–3600 mm ve 200–1500 kg, 100 birim aralıklarla. Önce 1,50 mm, ardından düşük ağırlık. ZS: burkulma kontrolü hariç ön seçim; doğrulanmış taşıma kapasitesi değildir. Ürün adları ZS35 / ZS55 / ZS65; kaynak kesitler sırasıyla ZS55 / ZS75 / ZS85. Kutu hesabı değişmedi. Ürün ve tabla dahil toplam yük iki traverse eşit bölünür; hareketli ve deprem yükleri dahil değildir.';
    page.appendChild(miniSection);
    for (const [id, data] of [['trv', table], ['mini', miniTable]]) {
    const form = document.getElementById(id+'-form');
    const result = document.getElementById(id+'-results');
    form.addEventListener('input', () => { result.innerHTML = '<p class="trv-empty">Seçim değişti. Güncel öneriler için Traversleri göster düğmesine basın.</p>'; });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const length = Number(document.getElementById(id+'-length').value);
      const load = Number(document.getElementById(id+'-load').value);
      const rows = recommend(length, load, data);
      if (!rows) { result.innerHTML = '<p class="trv-empty">Pozitif boy ve yük girin. Tablo sınırının üzerindeki değerler için öneri bulunmuyor.</p>'; return; }
      result.innerHTML = `<p class="trv-scope">Girilen: ${length} mm / ${load} kg</p><h3 class="trv-result-title">Hesapta kullanılan: ${rows[0].length.toLocaleString('tr-TR')} mm · ${rows[0].load.toLocaleString('tr-TR')} kg kat yükü</h3><div class="trv-options">${rows.map(row => `<article class="trv-option${row.manual ? ' trv-manual' : ''}"><h4>${escape(row.group)}</h4><p class="trv-section">${row.section ? (row.preliminary ? escape(row.section.replace(/^ZS30\.(\d+)\.(.+) ST37$/, 'ZS$1 / $2 mm et')) : escape(row.section.replace(/ ST(?:37|52)$/, '').replace(/^Kutu50\.(\d+)\.(.+)$/, 'Kutu $1 × 50 × $2').replace(/^CC(\d+)x50x(.+)$/, 'CC $1 × 50 × $2').replace(/^ZS30\.(\d+)\.(.+)$/, 'ZS $1 × 30 × $2'))+' mm') : 'Uygun kesit bulunamadı'}</p><p class="trv-status">${row.manual ? 'Yönetici tarafından kabul edildi <span class="trv-warning" tabindex="0" role="img" aria-label="Manuel seçim; hesap sınırını aşıyor" title="Manuel seçim; hesap sınırını aşıyor">!</span>' : row.section ? (row.preliminary ? 'Burkulma kontrolü hariç ön seçim' : 'Tablodaki öneri') : 'Bu tip ve kalitede tablo kapsamında uygun ürün yok.'}</p></article>`).join('')}</div>`;
    });
    }
  }
  window.RafexTravers = { recommend, recommendMini: (length, load) => recommend(length, load, miniTable), mount };
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
