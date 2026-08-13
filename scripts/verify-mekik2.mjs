import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../worker/index.js", import.meta.url), "utf8");
const portal = fs.readFileSync(new URL("../portal.html", import.meta.url), "utf8");
const b2bViewer = fs.readFileSync(new URL("../client/b2b-viewer.entry.js", import.meta.url), "utf8");
const portalScriptStart = portal.lastIndexOf("<script>");
const portalScriptEnd = portal.lastIndexOf("</script>");
assert.notEqual(portalScriptStart, -1, "Portal betiği bulunamadı");
assert.notEqual(portalScriptEnd, -1, "Portal betiğinin sonu bulunamadı");
new vm.Script(portal.slice(portalScriptStart + "<script>".length, portalScriptEnd), { filename: "portal-inline.js" });

assert.match(portal, /id="m2PlanStatus"/, "Ayak ve düz arabağ dağılımı paneli korunmalı");
assert.match(portal, /function b2bStraightTieCount\(heightMm\)/, "B2B ayak boyuna göre düz arabağ adet kuralı bulunmalı");
assert.match(portal, /height <= 2000\) return 1[\s\S]*height <= 5000\) return 2[\s\S]*height <= 7000\) return 3[\s\S]*height <= 10000\) return 4[\s\S]*return 5/, "Düz arabağ adetleri 2, 5, 7, 10 ve 12 metre bantlarını izlemeli");
assert.match(portal, /position === "ground" \? `Zemin \+ \$\{fmt\(Math\.max\(0, levels - 1\)\)\} kat` : `\$\{fmt\(levels\)\} kat`/, "B2B blok detayında zeminli ve travers üstü kat ifadeleri ayrılmalı");
assert.match(portal, /m2ActiveModule !== "b2b"/, "B2B proje kaydı eski mekik ayak-arabağ kombinasyonu şartına takılmamalı");
assert.match(b2bViewer, /addStraightTies\(sectionPitch, frameDepth, sectionScale, targetHeight\)/, "Çift sıra B2B 3D görünümünde düz arabağlar yerleştirilmeli");
assert.match(portal, /if\(count===1\)return\[Math\.round\(height\/2\)\][\s\S]*if\(count===2\)return\[Math\.round\(height\*\.4\),Math\.round\(height\*\.8\)\]/, "Düz arabağlar 2 metrede ortaya, 5 metrede yaklaşık 2 ve 4 metreye yerleşmeli");
assert.match(b2bViewer, /new THREE\.BoxGeometry\(tieWidth, tieDepth, tieHeight\)/, "Çift sıra düz arabağı 200 mm genişlikte galvaniz parça olarak çizilmeli");
assert.match(portal, /class="card m2-floor-editor"/, "Serbest Yerleşim Alanı korunmalı");
assert.match(portal, /function renderMekik2\(\)[\s\S]*?<p>GÖRSEL DENEME ALANI<\/p><h2>Mekik — Canlı Raf Çizimi<\/h2>/, "Yeni Mekik kendi özgün üst başlığını doğrudan üretmeli");
assert.match(portal, /function renderMekik2\(\)[\s\S]*?<section class="card">[\s\S]*?<h3>Raf Ölçüleri<\/h3>/, "Yeni Mekik Raf Ölçüleri kartını doğrudan üretmeli");
assert.doesNotMatch(portal, /function renderMekik2\([^)]*moduleTitle|function renderMekik2\([\s\S]*?isB2BView/, "B2B koşulları Mekik 2 üreticisinin içine girmemeli");
assert.match(portal, /function renderB2B\(\)[\s\S]*?page\.dataset\.m2Module = "b2b"/, "B2B görünüş durumu yalnız B2B üreticisinde atanmalı");
assert.doesNotMatch(portal, /#page\[data-m2-module="mekik2"\][^{]*\{/, "Mekik 2 görünüşü B2B sonrası eklenen CSS ile değiştirilmemeli");
assert.match(portal, /name === "b2b"\) \{ m2ActivateModule\("b2b"\); renderB2B\(\); \}/, "B2B ekranı kendi modül durumuyla açılmalı");
assert.match(portal, /data-page="mekik2"><i>06<\/i>Mekik<\/button/, "Mekik 2 menüde Mekik adıyla gösterilmeli");
assert.doesNotMatch(portal, /data-page="mekik"><i>06<\/i>/, "Eski Mekik menüden gizlenmeli");
assert.match(portal, /function m2ActivateModule\(moduleName\)[\s\S]*?m2RestoreModuleState\(m2ModuleStates\[moduleName\]\)/, "Mekik ve B2B çalışma durumları ayrı saklanmalı");
assert.match(source, /m2ActiveModule!==['"]mekik2['"]\)return;/, "Geçmişteki teknik ön görünüş yalnız yeni Mekik modülüne uygulanmalı");
assert.match(source, /m2ActiveModule===['"]b2b['"]\)return m2CompleteReportElevationSvg/, "B2B PDF görünüşü Mekik ön görünüş katmanından ayrılmalı");
assert.match(portal, /function renderB2B\(\)[\s\S]*?b2bInstallMain3D\(\)/, "B2B ana ekranı birleşik GLB 3D görünümünü açmalı");
assert.match(source, /const B2B_TAKIM_BASE64 = "__B2B_TAKIM_BASE64__"/, "B2B görünümü doğrudan kullanıcının verdiği TAKIM GLB kaynağını kullanmalı");
assert.match(portal, /const m2TypeApi = \(\) => m2ActiveModule === "b2b" \? "\/api\/b2b-types" : "\/api\/mekik2-types";/, "B2B ve Mekik 2 kayıt API'leri ayrılmalı");
assert.doesNotMatch(portal, /m2IsB2B/, "Mekik 2 çizim motorunda B2B koşulu bulunmamalı");
assert.match(portal, /option value="ral5010">RAL 5010<\/option><option value="pgv">PGV<\/option>/, "B2B ayak rengi RAL 5010 ve PGV seçeneklerini sunmalı");
assert.match(portal, /option value="ral1007">RAL 1007<\/option><option value="ral2004">RAL 2004<\/option>/, "B2B travers rengi RAL 1007 ve RAL 2004 seçeneklerini sunmalı");
assert.match(portal, /id="b2bPalletDialog"[\s\S]*?id="b2bSpecialPalletWidth"[\s\S]*?id="b2bSpecialPalletDepth"/, "Özel palet seçimi genişlik ve derinlik ekranını açmalı");
assert.match(portal, /class="b2b-tunnel-picker"[\s\S]*?id="b2bTunnels"/, "Tünel bölümleri açılır listeden seçilmeli");
assert.match(portal, /script defer src="\/b2b-viewer\.js\?v=b2b-custom-tunnel-ties-366"/, "B2B 3D görüntüleyicisi aynı siteden ve önbellekten bağımsız yüklenmeli");
assert.match(portal, /id="b2bMain3DCanvas"[\s\S]*?RafexB2BViewer\.mount\(canvas, b2b3DOptions\(\)\)/, "B2B varsayılan olarak doğrudan GLB sahnesini etkileşimli 3D tuvale bağlamalı");
assert.match(portal, /window\.RafexB2BViewer\?\.update\(options\)/, "B2B 3D görünümü palet ve bölüm girişleri değişince güncellenmeli");
assert.match(portal, /KATTA TOPLAM \$\{fmt\(options\.moduleCount \* geometry\.count \* \(options\.rowType === "double" \? 2 : 1\)\)\} PALET/, "B2B 3D özeti kattaki toplam palet sayısını sıra sayısıyla göstermeli");
assert.match(portal, /count \* width \+ \(count \+ 1\) \* 75/, "B2B bölüm genişliği her palet ve aralık için 75 mm kuralını uygulamalı");
assert.match(portal, /type === "euro" && count === 4[\s\S]*?\? 3600 : calculatedWidth/, "Dört Euro paletli bölüm 3.600 mm Rafex standardını kullanmalı");
assert.match(portal, /id="b2bPalletCount" type="number" min="1" max="4" value="3"/, "B2B bölümünde palet sayısı bir ile dört arasında seçilebilmeli");
assert.match(portal, /id="b2bRowGap"[^>]*value="200"/, "B2B çift sıra aralığı varsayılan 200 mm olmalı");
assert.match(portal, /class="b2b-camera-presets"[\s\S]*?>ÖN<[\s\S]*?>SAĞ<[\s\S]*?>ARKA<[\s\S]*?>SOL</, "B2B kamera kontrolü profesyonel yön görünümleri sunmalı");
assert.match(portal, /id="b2bAutoRotate"[\s\S]*?onclick="b2bToggleAutoRotate\(\)"/, "B2B sürekli dönüş düğmesi dönüşü açıp kapatmalı");
assert.match(portal, /b2bPalletTraverseGap = 200/, "B2B palet-travers mesafesi varsayılan 200 mm olmalı");
assert.match(portal, /ÖLÇÜ AYARLARI[\s\S]*?b2bMeasureSettingsDialog[\s\S]*?Yer–ilk travers[\s\S]*?Palet–travers net boşluğu[\s\S]*?Travers yüksekliği[\s\S]*?Son palette ayak devamı[\s\S]*?Palet taşma payı · ön ve arka/, "B2B bütün düşey ve derinlik paylarını tek Ölçü Ayarları penceresinde sunmalı");
assert.match(b2bViewer, /const count = clamp\(Math\.round\(Number\(next\.palletCount\) \|\| 3\), 1, 4\)/, "B2B 3D sahnesi bölüm başına 1-4 paleti kabul etmeli");
assert.match(b2bViewer, /for \(let level = 0; level < levels; level \+= 1\)/, "B2B kat sayısı bütün palet katlarını 3D sahneye eklemeli");
assert.match(b2bViewer, /const traverseCount = this\.options\.firstPalletPosition === "traverse" \? this\.options\.levels : Math\.max\(0, this\.options\.levels - 1\)/, "B2B travers sayısı ilk palet konumuna göre hesaplanmalı");
assert.match(b2bViewer, /\[SOURCE_TRAVERSE_FRONT_OFFSET, SOURCE_TRAVERSE_BACK_OFFSET\]\.forEach/, "B2B her katta ön ve arka travers montajlarını eklemeli");
assert.match(b2bViewer, /SOURCE_TRAVERSE_BEAM_BOTTOM \* verticalScale - this\.traverseBottom\(level\)/, "B2B travers gövdesinin alt kotu net boşluğa göre yerleşmeli");
assert.doesNotMatch(b2bViewer, /stripTraverseConnectors/, "B2B travers GLB konnektörleriyle birlikte eksiksiz kullanılmalı");
assert.match(b2bViewer, /if \(name\.includes\("KUTU"\) \|\| name\.includes\("PALET"\)\) removals\.push\(object\)/, "B2B takım GLB içindeki eski mavi palet geometrileri kaldırılmalı");
assert.match(b2bViewer, /name\.includes\("DİAGONEL"\)[\s\S]*?material\.color\.setHex\(COLORS\.galvanized\)/, "B2B diagonelleri renk seçiminden bağımsız galvaniz kalmalı");
assert.match(b2bViewer, /const levelPalletHeight = this\.palletHeightAt\(level\)[\s\S]*?const loadHeightScale = levelPalletHeight \/ 966\.1927337646484/, "B2B her kattaki manuel palet yüksekliğini ayrı uygulamalı");
assert.match(b2bViewer, /load\.position\.set\(x - 30\.177644729614258, -this\.options\.frontPalletGap - SOURCE_PALLET_DEPTH_MIN \* loadDepthScale, SOURCE_LOAD_BOTTOM \* loadHeightScale - loadBottom\)/, "B2B palet alt kotu travers üstüne, derinliği ön ayak payına oturmalı");
assert.doesNotMatch(b2bViewer, /palletHeight \+ SOURCE_PALLET_HEIGHT/, "B2B girilen palet yüksekliğine GLB palet kalınlığı ikinci kez eklenmemeli");
assert.match(portal, /id="b2bFirstPalletPosition"[\s\S]*?>Zemin<[\s\S]*?>Travers üstü</, "B2B ilk palet konumu zemin veya travers üstü seçilebilmeli");
assert.match(portal, /b2bFirstFloorGap = 200, b2bLastPalletOverlap = 600/, "B2B ilk kat boşluğu 200 mm ve son ayak bindirmesi yarım standart palet yüksekliği olmalı");
assert.match(portal, /B2B_TRAVERSE_TYPES = \[\{ name:"CC100", height:100 \}[\s\S]*?\{ name:"CC140", height:140 \}/, "B2B travers tipi gerçek profil yüksekliğini taşımalı");
assert.match(portal, /m2FootManualListOpen = b2bFootManual/, "B2B manuel ayak seçiminde tüm ayak listesi açılmalı");
assert.match(b2bViewer, /rowCount = this\.options\.rowType === "double" \? 2 : 1/, "B2B çift sıra seçimi ikinci 3D sırayı üretmeli");
assert.match(b2bViewer, /return this\.traverseBottom\(supportingTraverse\) \+ this\.options\.traverseHeight/, "B2B palet tabanı destekleyen traversin üst kotuna tam oturmalı");
assert.match(b2bViewer, /firstPalletPosition === "ground" && level === 0\) return 0;/, "B2B zemin paleti sıfır kotunda durmalı");
assert.match(portal, /const levelStep = palletHeight \+ b2bPalletTraverseGap \+ traverseHeight/, "B2B ayak hesabı palet, net boşluk ve travers yüksekliğini birer kez toplamalı");
assert.match(portal, /const loadedPallets = geometry\.count \* loadedLevels;[\s\S]*?const footLoad = totalPalletLoad;/, "B2B ayak seçimi çift sıra ve modül adedinden bağımsız tek modül toplam yükünü kullanmalı");
assert.doesNotMatch(portal, /const loadedPallets = geometry\.count \* loadedLevels \* moduleCount \* rowCount/, "B2B ayak yükü sıra veya toplam modül adediyle çarpılmamalı");
assert.equal(3 * 4 * 1000, 12000, "Travers üstü dört katta üçer palet 12.000 kg olmalı");
assert.equal(200 + 140, 340, "Travers üstü ilk kat yüksekliği 340 mm olmalı");
assert.equal(3 * 3 * 1000, 9000, "Zemin paleti çıkarıldığında üç üst katta üçer palet 9.000 kg olmalı");
assert.equal(1200 + 200 + 140, 1540, "Zemin başlangıcında K1 yüksekliği 1.540 mm olmalı");
assert.match(source, /name:b2bTypeLetter\(row\.type_no\)/, "B2B kayıtlı tipleri A, B, C sırasıyla dönmeli");
assert.match(portal, /\.m2-b2b-plan-label \{[^}]*font:950 17px Arial;[^}]*opacity:\.88;/, "B2B serbest yerleşim harfi yarı boyutta ve daha görünür olmalı");
assert.match(portal, /id="m2AutoFillLength"[\s\S]*?m2ApplyAutoFillLength\(\)/, "B2B uzatma mesafesi elle milimetre olarak girilebilmeli");
assert.match(portal, /oninput="m2PreviewAutoFillLength\(this\.value\)"/, "Elle yazılan uzatma ölçüsü çizgi üzerinde anında önizlenmeli");
assert.match(portal, /incrementalWidth=\(count\)=>m2B2BSectionWidth[\s\S]*?\(planned\.length\?footMm:2\*footMm\)/, "B2B uzatma traverslerle birlikte gerçek ayak sayısını da hesaba katmalı");
const b2bExtensionCombination = (targetMm, footMm = 100) => {
  const widths = [2700, 1825, 950], result = [];
  let occupied = 0;
  const increment = (width) => width + (result.length ? footMm : 2 * footMm);
  while (occupied + increment(widths[0]) <= targetMm) { const value = increment(widths[0]); result.push(widths[0]); occupied += value; }
  for (const width of widths.slice(1)) if (occupied + increment(width) <= targetMm) { const value = increment(width); result.push(width); occupied += value; }
  return result;
};
assert.deepEqual(b2bExtensionCombination(6000), [2700, 2700], "6.000 mm uzatma iki adet 2.700 mm modülle bitmeli");
assert.deepEqual(b2bExtensionCombination(6500), [2700, 2700], "6.500 mm alanda 950 mm modül gerekli dördüncü ayakla birlikte sığmamalı");
assert.deepEqual(b2bExtensionCombination(6750), [2700, 2700, 950], "6.750 mm alanda iki 2.700 mm ve bir 950 mm modül sığmalı");
assert.equal(2700 + 2700 + 3 * 100, 5700, "İki modül üç adet 100 mm ayakla 5.700 mm olmalı");
assert.equal(2700 + 2700 + 950 + 4 * 100, 6750, "Üç modül dört adet 100 mm ayakla 6.750 mm olmalı");
assert.doesNotMatch(portal, /if \(m2AutoFillGuide\) html \+=/, "Tamamlanan uzatma kılavuzu rafın altında kalmamalı");
assert.match(portal, /id="m2SharedFootLabelButton"[\s\S]*?m2ToggleSharedFootLabels\(\)/, "Ortak ayak yazısı düğmeyle gösterilip gizlenebilmeli");
assert.match(portal, /id="m2SeparateRackButton"[\s\S]*?m2SeparateSelectedRack\(\)/, "Birleşik gruptan seçili modülü ayırma düğmesi bulunmalı");
assert.match(portal, /event\.key === "Delete"[\s\S]*?m2DeleteRack\(\)/, "Delete tuşu seçili modülü silmeli");
assert.match(portal, /function m2SmoothGroupTranslation[\s\S]*?approach\(targetDx,0\); approach\(0,targetDy\)/, "Birleşik raflar köşede iki eksende akıcı kaymalı");
assert.match(portal, /function m2JoinedGroupGeometry[\s\S]*?lengthMm/, "Birleşik raf uzunluğu grubun dıştan dışa toplamını kullanmalı");
assert.match(portal, /function m2RotateRack\(\)[\s\S]*?members\.forEach[\s\S]*?member\.angle=\(member\.angle\+90\)%360/, "Birleşik raf bütün modülleriyle tek yapı olarak 90 derece dönmeli");
assert.match(portal, /\.m2-metre-ruler \{ pointer-events:none; opacity:\.34; \}/, "Grafik ölçek küçük, saydam ve projeyi etkilemeyen bir yardımcı olmalı");
assert.match(portal, /id="m2ShowTotalLength"[\s\S]*?id="m2ShowTotalDepth"/, "Seçili rafın uzunluk ve derinlik ölçüleri ayrı düğmelerle açılmalı");
assert.match(portal, /ondblclick="event\.stopPropagation\(\);m2ConfirmHideSummaryDimension/, "Raf ölçüleri çift tıklamayla silinebilmeli");
assert.match(portal, /\.m2-b2b-joined-mark \{[^}]*font:900 4px Arial;/, "Ortak ayak etiketi üçte bir boyuta küçültülmeli");
assert.match(portal, /const automaticFootHeight = firstLoadBottom \+ \(levels - 1\) \* levelStep \+ b2bLastPalletOverlap/, "B2B ayak boyu son paletin ayarlanabilir yarı yüksekliğinde tamamlanmalı");
assert.equal(600 + 3 * 140 + 3 * 200 + 3 * 1200, 5220, "Z+3, 1200 mm palet, 140 mm travers, 200 mm boşluk ve 600 mm son pay 5220 mm olmalı");
assert.match(b2bViewer, /addDimensions\(sectionPitch\)[\s\S]*?addVerticalDimension[\s\S]*?new THREE\.Sprite/, "B2B kat ve ayak ölçülerini 3D sahnede rafla birlikte hareket eden büyük etiketlerle göstermeli");
assert.match(b2bViewer, /lineX = -Math\.max\(720, sectionPitch \* 0\.22\)/, "B2B düşey ölçüleri rafın solunda yer almalı");
assert.match(b2bViewer, /frontY = rackDepth \+ 340/, "B2B düşey ölçüleri rafın arkasında değil kameraya bakan ön tarafında olmalı");
assert.match(b2bViewer, /ZEMİN → T1 ÜSTÜ[\s\S]*?T\$\{level\} ÜSTÜ → T\$\{level \+ 1\} ALTI/, "B2B ölçü zinciri ilk travers üst kotunu ve sonraki net travers açıklıklarını göstermeli");
assert.match(b2bViewer, /ÜST PALET KOTU[\s\S]*?AYAK BOYU/, "B2B en üst palet kotunu ve ayak boyunu ayrı işaretlemeli");
assert.match(b2bViewer, /GÖZ[\s\S]*?GENİŞLİK[\s\S]*?DERİNLİK/, "B2B 3D sahnesi göz, toplam genişlik ve derinlik ölçülerini göstermeli");
assert.match(b2bViewer, /scale = 4[\s\S]*?context\.font = "900 66px Arial"/, "B2B 3D ölçü etiketleri yüksek çözünürlüklü ve büyük olmalı");
assert.match(b2bViewer, /rgba\(57,169,232,\.99\)[\s\S]*?context\.fillStyle = "#fff"/, "B2B 3D ölçüleri açık mavi zemin üzerinde beyaz yazılmalı");
assert.match(portal, /function m2ParseB2BFootWidth[\s\S]*?90\|100\|120\|127\|140/, "B2B ayak profili 90, 100, 120, 127 ve 140 mm seçeneklerini birebir okumalı");
assert.match(portal, /exactWidth=Number\(rack\.b2bLayout\.sectionWidth\|\|0\)\+2\*footWidth/, "Serbest çizimde B2B raf genişliği travers + iki gerçek ayak olmalı");
assert.match(portal, /\.m2-layout-label \{ fill:#173c2d; font:900 8px Arial[\s\S]*?\.m2-wall-distance-label \{ fill:#075f40; font:900 8px Arial/, "Serbest çizim ölçüleri eski renklerinde ve yarı boyutta olmalı");
assert.match(portal, /id="b2bDimensionVisibilityDialog"[\s\S]*?Tümünü Göster[\s\S]*?Tümünü Gizle/, "3D ölçü grupları için tümünü göster ve gizle paneli bulunmalı");
assert.match(b2bViewer, /dimensions:[\s\S]*?levels:[\s\S]*?markers:[\s\S]*?eye:[\s\S]*?width:[\s\S]*?depth:/, "3D ölçü grupları ayrı ayrı yönetilebilmeli");
assert.match(b2bViewer, /distanceTo\(this\.dimensionWorldPosition\)\/12000[\s\S]*?2\.65/, "3D ölçü etiketleri kamera uzaklığında okunur ekran boyutunu korumalı");
assert.match(portal, /id="m2CustomizeRackButton"[\s\S]*?function m2OpenCustomizeModal[\s\S]*?m2CustomizeCanvas/, "Serbest yerleşimde seçilen raf için 3D özelleştirme ekranı bulunmalı");
assert.match(portal, /id="m2CustomizeManualLevels"[\s\S]*?id="m2CustomizeLevelRows"/, "Özelleştirmede kat sayısı kadar manuel aralık ve palet ölçüsü satırı açılmalı");
assert.match(portal, /index===0\?"Zemin – K1":`K\$\{index\} – K\$\{index\+1\}`/, "Manuel kat satırları Zemin-K1 ve devam eden kat aralıklarını adlandırmalı");
assert.match(portal, /id="m2CustomizeTunnelHeight"[^>]*value="3600"/, "Özelleştirme tünel yüksekliği varsayılan 3600 mm olmalı");
assert.match(b2bViewer, /this\.traverseTop\(level\) <= this\.options\.tunnelHeight[\s\S]*?loadBottom < this\.options\.tunnelHeight/, "Tünel yüksekliği altındaki travers ve paletler 3D görünüşten kaldırılmalı");
assert.match(portal, /TÜNEL · \$\{fmt\(rack\.b2b\.tunnelHeight\)\} mm/, "Tünelli raf üst görünüşte tip harfinin altında tünel olarak işaretlenmeli");
assert.match(portal, /m2SymbolChoice="column"[\s\S]*?column:[\s\S]*?door:[\s\S]*?forklift:[\s\S]*?person:/, "Serbest yerleşimde kolon, kapı, forklift ve insan sembolleri bulunmalı");
assert.match(portal, /function m2RackOverlapsBlockingSymbol[\s\S]*?symbol\.blocking/, "Kolon sembolü raf hareketinde fiziksel engel sayılmalı");
assert.match(portal, /m2AutoFillDraft&&\/\^\\d\$\/[\s\S]*?m2AutoFillLength[\s\S]*?input\.focus\(\)/, "Uzatma modu aktifken rakam doğrudan mesafe kutusuna yazılmalı");
assert.match(portal, /class="m2-measure-hit"[\s\S]*?m2PromptWallDistance/, "Duvar ölçüsü etiketinde geniş tıklama alanı bulunmalı");
assert.doesNotMatch(portal, /b2bLevelDimensions|b2b-level-dimension/, "B2B görünümünde kameradan bağımsız sabit HTML ölçüleri kalmamalı");
assert.match(portal, /#page\.b2b-mode \.m2-flow-toggle \{ display:none !important; \}/, "B2B ölçü okları anahtarı görünümden kaldırılmalı");
assert.match(portal, /#page\.b2b-mode \[data-m2-tab="side"\][\s\S]*?display:none !important/, "B2B yandan görünüş sekmesi kaldırılmalı");
assert.match(portal, /m2ActiveModule === "b2b" \? !m2LastDrawing\?\.b2b : \(!plan \|\| !selectedFoot\)/, "B2B raf kaydet düğmesi geçerli B2B çiziminde etkin olmalı");
assert.match(portal, /const drawing = isB2B \? \{ \.\.\.m2LastDrawing, b2b:b2bReadInputState\(\), plan:m2LastDrawing\.plan \|\|/, "B2B raf kaydı güncel B2B girdilerini ve geçerli planı göndermeli");
assert.match(portal, /function b2bLayoutDrawing\(drawing\)[\s\S]*?bays:1, depth:rowCount[\s\S]*?footprintDepth/, "B2B serbest yerleşim izi modül sayısından bağımsız tek modül ve tek\/çift sıra derinliği kullanmalı");
assert.match(b2bViewer, /name\.includes\("TRAVERS"\) \|\| name\.includes\("KONNEKTÖR"\)/, "B2B travers rengi GLB düğüm adlarına uygulanmalı");
assert.match(b2bViewer, /name\.includes\("AYAK"\)[\s\S]*?name\.includes\("HRTD"\)/, "B2B ayak rengi GLB düğüm adlarına uygulanmalı");
assert.match(b2bViewer, /material\.roughness = 0\.94/, "B2B palet malzemesi alt kat parlamalarını azaltmalı");
assert.match(source, /path === "\/b2b-takim\.glb"[\s\S]*?path === "\/b2b-palet\.glb"[\s\S]*?path === "\/b2b-travers\.glb"[\s\S]*?path === "\/b2b-ayak\.glb"/, "B2B için kullanıcının verdiği TAKIM, PALET, TRAVERS ve AYAK GLB dosyaları doğrudan sunulmalı");
assert.match(source, /path === "\/b2b-viewer\.js"[\s\S]*?path === "\/draco\/draco_decoder\.js"[\s\S]*?path === "\/draco\/draco_decoder\.wasm"/, "B2B görüntüleyici ve sıkıştırma çözücüleri aynı siteden sunulmalı");
assert.match(source, /script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'/, "Yerel 3D görüntüleyici ve Draco WASM çözücüsü içerik güvenlik ilkesi tarafından engellenmemeli");
assert.match(portal, /data-m2-tab="front"[\s\S]*?data-m2-tab="side"|data-m2-tab="side"[\s\S]*?data-m2-tab="front"/, "B2B önden\/3D ve yandan görünüş sekmelerini korumalı");
assert.doesNotMatch(portal, /b2b-orthographic-strip|ÜSTTEN GLB/, "B2B ekranında eski üstten GLB şeridi kalmamalı");
assert.match(portal, /#page\.b2b-mode \{[\s\S]*?--g: #761b2a;[\s\S]*?--g2: #430c15;/, "B2B koyu kırmızı görsel kimlik kullanmalı");
assert.match(source, /CREATE TABLE IF NOT EXISTS b2b_rack_types/, "B2B raf tipleri için ayrı kalıcı tablo bulunmalı");
assert.match(source, /path === "\/api\/b2b-types"/, "B2B raf tipi API'si bulunmalı");
assert.match(portal, /const m2WallMeasurementInset = 0;/, "Serbest yerleşim ölçülerinde duvar çizgi kalınlığı hesaba katılmamalı");
assert.doesNotMatch(portal, /m2WallHalfThickness/, "Duvarın görsel kalınlığı ölçü ve çakışma hesabına geri bağlanmamalı");
assert.match(portal, /leftSurface = leftWall \+ m2WallMeasurementInset, rightSurface = rightWall - m2WallMeasurementInset/, "Raf-duvar ölçüleri duvar ekseninden hesaplanmalı");
assert.match(portal, /\.m2-floor-area \{[^}]*stroke-width: 2;/, "Serbest yerleşimde iki duvar çizgisi birbirine çok yakın görünmeli");
assert.match(portal, /\.m2-floor-area-inner \{[^}]*stroke-width:\.4;/, "İç ve dış duvar çizgisi arasındaki görsel boşluk en aza indirilmeli");
assert.match(portal, /id="m2A4Sheet"/, "Yatay A4 Proje Sayfası korunmalı");
assert.match(portal, /id="m2ReportProductTotal" type="checkbox"[^>]*>ÜRÜN DÖKÜMÜ TOPLU/, "Çıktı tipinin yanında toplu ürün dökümü seçeneği bulunmalı");
assert.match(portal, /\.m2-corporate-type-grid \{[^}]*grid-template-rows:repeat\(3,minmax\(0,1fr\)\)/, "Kurumsal kesit sayfasında üç büyük tip bandı bulunmalı");
assert.match(portal, /for\(let start=0;start<types\.length;start\+=3\)/, "Kurumsal kesitler sayfa başına üç tip olarak sayfalanmalı");
assert.match(portal, /for\(let start=0;start<types\.length;start\+=6\)/, "Tip bazlı ürün dökümü altı tipe kadar tek sayfada toplanmalı");
assert.match(portal, /palletCount=\(d\.b2bLayout\?\(Number\(d\.b2bLayout\.palletCount\)/, "Her B2B tip başlığında palet, kat ve sıra adediyle gerçek palet sayısı hesaplanmalı");
assert.match(portal, /m2-corporate-unit-count[^<]*">\$\{fmt\(unitCount\)\}/, "Her tip başlığında palet sayısından ayrı ünite adedi gösterilmeli");
assert.match(portal, /frontVisual=d\.b2bLayout\?m2B2BReportPerspectiveSvg/, "Kurumsal B2B ön görünüşü ölçülü perspektif çizimi kullanmalı");
assert.match(portal, /\.m2-corporate-page::before \{[^}]*z-index:5[^}]*rafex-logo\.png[^}]*opacity:\.08/, "Kurumsal sayfalarda içerik üzerinde daha belirgin RAFEX filigranı bulunmalı");
assert.match(portal, /\.m2-corporate-cover::before \{ display:none; \}/, "İlk kapak sayfasında filigran bulunmamalı");
assert.match(portal, /print-color-adjust:exact/, "Kurumsal lacivert baskıda renk dönüşümüne karşı sabitlenmeli");
assert.match(portal, /function m2CorporateBomPages\(types,labels,combined\)/, "Kurumsal çıktının sonunda ürün dökümü sayfaları üretilmeli");
assert.match(portal, /pages\.push\(\.\.\.m2CorporateBomPages\(types,t,\$\("m2ReportProductTotal"\)\?\.checked===true\)\)/, "Ürün dökümü toplu seçimine göre birleşik veya tip bazında üretilmeli");
assert.match(portal, /id="m2ReportCompleteFront" type="checkbox"[^>]*><span id="m2ReportVariantsLabel">3’LÜ GÖSTER<\/span>/, "B2B ön görünüşte alt palet kombinasyonlarını açan 3’lü göster seçeneği bulunmalı");
assert.match(portal, /traverseLevels\*2\*rowCount/, "B2B travers adedi kat başına iki travers ve sıra sayısıyla çarpılmalı");
assert.match(portal, /Travers · \$\{fmt\(length\)\} mm · \$\{type\}/, "Serbest yerleşim traversleri uzunluk ve tipe göre ayrı satırlarda listelenmeli");
assert.match(portal, /add\(labels\.items\.traverse,`\$\{fmt\(traverseLength\)\} mm · \$\{traverseType\}`/, "Kurumsal ürün dökümü travers uzunluğunu ayrı ürün özelliği olarak göstermeli");
assert.match(portal, /function m2ChangeReportLanguage\(\)\{m2RenderA4Report\(\);m2RenderCorporateReport\(\);\}/, "Çıktı dili hem özet hem kurumsal önizlemeyi yenilemeli");
assert.match(portal, /id="m2ReportFrontDetails" type="checkbox"[^>]*><span>DETAY BİLGİ:<\/span><b id="m2ReportFrontDetailsState">GÖSTER<\/b>/, "PDF ön görünüşünde boş başlayan Detay Bilgi Göster/Gizle seçeneği bulunmalı");
assert.equal((portal.match(/class="m2PdfPalletDetails"/g) || []).length, 1, "PDF palet/yan boşluk detay seçeneği yalnızca bir görünüşte bulunmalı");
assert.match(portal, /data-m2-view="front"[\s\S]*?data-m2-spacing-button="pallet"[\s\S]*?class="m2PdfPalletDetails"/, "PDF detay seçeneği yalnız Önden Görünüşte palet aralığı düğmesinin yanında olmalı");
assert.doesNotMatch(portal, /data-m2-view="top"(?:(?!data-m2-view="side")[\s\S])*?class="m2PdfPalletDetails"/, "PDF detay seçeneği Üst Görünüşte bulunmamalı");
assert.match(portal, /\.m2-view header \{[\s\S]*?min-height: 0;[\s\S]*?height: 54px;/, "Üç görünüşün üst alanı aynı kompakt yükseklikte olmalı");
assert.match(portal, /\.m2-layout \{[\s\S]*?align-items: stretch;/, "Görünüş sütunu form yüksekliğini çizim alanı için kullanmalı");
assert.match(portal, /\.m2-views \{[\s\S]*?align-self: stretch;[\s\S]*?grid-template-rows: 40px 56px minmax\(0, 1fr\);/, "Sekme ve dışa aktarma satırları sabit kalırken çizim kalan yüksekliği doldurmalı");
assert.match(portal, /\.m2-view \{[\s\S]*?grid-template-rows: 54px minmax\(0, 1fr\);/, "Görünüş başlığı sabit, çizim alanı esnek olmalı");
assert.match(portal, /\.m2-canvas \{[\s\S]*?height: 100%;[\s\S]*?min-height: 0;/, "Çizim alanı görünüş panelinin alt yüksekliğinin tamamını kullanmalı");
assert.match(source, /if\(!showDetails\)svg\.querySelectorAll\('\.m2-front-dimension-summary,\.m2-front-clearance-dimension'\)/, "Detay kutusu boşken alt bilgi kartları ve üst boşluk ölçüsü PDF görünüşünden kaldırılmalı");
assert.match(portal, /m2SavedRackTypes\.forEach\(\(entry, index\) => addReportType\(entry\?\.name \|\| `Tip \$\{index \+ 1\}`, entry\?\.drawing\)\)/, "A4 görünüş listesi kayıtlı raf tiplerinden beslenmeli");
assert.match(portal, /usedTypes = \[\.\.\.usedTypeMap\.values\(\)\][\s\S]*?visibleFrontTypes = usedTypes, visibleSideTypes = usedTypes/, "Ön ve yan görünüşler serbest yerleşimde kullanılan bütün benzersiz tipleri göstermeli");
assert.match(portal, /m2ReportFronts[\s\S]*?--m2-report-count[\s\S]*?visibleFrontTypes\.length[\s\S]*?cards\("front", visibleFrontTypes\)/, "Ön görünüş alanı kullanılan bütün tiplerin sayısına göre eşit bölünmeli");
assert.match(portal, /m2ReportSides[\s\S]*?--m2-report-count[\s\S]*?visibleSideTypes\.length[\s\S]*?cards\("side", visibleSideTypes\)/, "Yan görünüş alanı kullanılan bütün tiplerin sayısına göre eşit bölünmeli");
assert.match(portal, /grid-template-columns:1fr; grid-template-rows:repeat\(var\(--m2-report-count,1\),minmax\(0,1fr\)\)/, "A4 raf görünüşleri alt alta gösterilmeli");
assert.match(portal, /\.m2-report-elevation svg \{[^}]*place-self:center;[^}]*width:100%;[^}]*height:100%;/, "Her A4 görünüşü kendi bölümünde yatay ve dikey ortalanmalı");
assert.match(portal, /\.m2-a4-floor \{ grid-column:1\/17;/, "Eşit görünüş sütunları için serbest yerleşim alanı on altı sütunda kalmalı");
assert.match(portal, /\.m2-a4-front \{ grid-column:17\/21;[^}]*padding:24px 5px 4px;/, "PDF ön görünüş alanı dört sütun ve ortak üst hizayı kullanmalı");
assert.match(portal, /\.m2-a4-side \{ grid-column:21\/25;[^}]*padding:24px 5px 4px;/, "PDF yan görünüş alanı ön görünüşle aynı genişlik ve üst hizayı kullanmalı");
assert.match(portal, /\.m2-a4-pallet-spec \{ grid-column:12\/19; grid-row:2;/, "Sağ alt bölümün sol yarısı yük birimi ve palet tanımına ayrılmalı");
assert.match(portal, /m2RenderPalletSpec\(usedTypes\.length \? usedTypes : types, palletTotal\)/, "Yük birimi ve palet tanımı yerleşimde kullanılan palet tipleri ve toplamından beslenmeli");
assert.match(portal, /<span>Wuc \(mm\)<\/span><span>Duc \(mm\)<\/span><span>Huc \(mm\)<\/span><span>PALLET KG<\/span>/, "PDF palet bilgi tablosu Excel sütunlarını aynen kullanmalı");
assert.match(portal, /wuc = Math\.max\(0, Number\(drawing\.palD\)/, "Wuc paletin derinliğinden beslenmeli");
assert.match(portal, /duc = Math\.max\(0, Number\(drawing\.palW\)/, "Duc paletin genişliğinden beslenmeli");
assert.match(portal, /huc = Math\.max\(0, Number\(drawing\.palletHeight\)/, "Huc palet yüksekliğinden beslenmeli");
assert.match(portal, /palletKg = Math\.max\(0, Number\(drawing\.palletWeight\)/, "PALLET KG palet ağırlığından beslenmeli");
assert.match(portal, /<span>TOPLAM PALET SAYISI<\/span>/, "Excel şemasındaki toplam palet sayısı PDF'de büyük özet satırında bulunmalı");
assert.match(portal, /key = \[String\(entry\?\.name \|\| "RAF TİPİ"\)[\s\S]*?uniquePalletTypes/, "Farklı raf tipleri aynı palet ölçülerini kullansa bile ayrı satırlarda korunmalı");
assert.match(portal, /const visibleTypes = uniquePalletTypes;/, "Palet tablosunda bütün raf tipleri gösterilmeli");
assert.match(portal, /\.m2-pallet-spec-total \{[^}]*font-size:17\.4px;/, "Toplam palet sayısı başlığı üç kat büyük olmalı");
assert.match(portal, /\.m2-pallet-spec-total b \{[^}]*font-size:27px;/, "Toplam palet sayısı değeri üç kat büyük olmalı");
assert.match(portal, /id="m2EdgeDimensionsButton"[^>]*>Kenar ölçülerini göster<\/button>/, "Kenar girişlerinin üstünde ölçüleri göster/gizle düğmesi bulunmalı");
assert.match(portal, /\.m2-edge-editor\[hidden\] \{ display:none !important; \}/, "Kenar girişleri üst düğme kapalıyken gerçekten gizlenmeli");
assert.match(portal, /showAreaDimensions: false, edgeDimensions: \[\]/, "Yeni serbest yerleşimde kenar ölçüleri kapalı başlamalı");
assert.match(portal, /m2LayoutState\.edgeDimensions\[index\] === true\) html \+= `<text/, "Kenar ölçüsü yalnız açıkça seçildiğinde çizilmeli");
assert.match(portal, /function m2ScheduleReportRefresh\(delay = 140\)/, "Yoğun çizim değişikliklerinde A4 raporu gecikmeli yenilenmeli");
assert.match(portal, /id="m2ManualPlanModal"/, "Ayak ve düz arabağ dağılımı elle düzenlenebilmeli");
assert.match(portal, /total === railLength/, "Elle düzenlenen ölçü × adet toplamı ray uzunluğuyla doğrulanmalı");
assert.doesNotMatch(portal, /ÖNERİLEN AYAK TİPİ · \$\{esc\(foot\)\}/, "Palet bilgi tablosuna Excel'de bulunmayan ayak tipi eklenmemeli");
assert.match(portal, /__M2_PALLET_DEFINITION_BASE64__/, "Kullanıcının yük birimi ve palet tanım görseli A4 alanına gömülmeli");
assert.doesNotMatch(portal, /m2-report-elevation--side|padX = width \* \.04/, "PDF yan görünüşüne görünüşü bozan özel kadraj dönüşümü uygulanmamalı");
assert.match(source, /function m2TechnicalSideSvgForDrawing\(drawing\)/, "A4 yan görünüşleri güncel yan çizim diliyle üretilmeli");
assert.match(source, /m2Value\('m2Bays',1,50\)/, "Ana teknik ön görünüş 50 göz sınırına kadar bütün gözleri kullanmalı");
assert.match(source, /function m2SharedScaleReportSvg\(drawing,mode,showAllFrontBays\)/, "PDF ön ve yan görünüşleri ortak ölçek çerçevesinden üretilmeli");
assert.match(source, /shownBays=front\?\(showAllFrontBays\?realBays:Math\.min\(4,realBays\)\):realBays/, "Özet ön görünüşü dört gözle sınırlanırken kurumsal çıktı gerçek göz sayısını kullanabilmeli");
assert.match(source, /data-report-front-copy="'\+\(showAllFrontBays\?'complete':'representative'\)\+'"/, "Ön görünüş kopyası kurumsal ve temsili modunu açıkça belirtmeli");
assert.match(source, /m2MekikSetProjection\('side',projectedDrawing,138,68,984,598\)/, "PDF yan görünüşü ön görünüşün görünen yüksekliğiyle orantılanmış alanı kullanmalı");
assert.match(source, /reportSideProfileMm:40/, "PDF yan görünüşü 40 mm diagonal profili kullanmalı");
assert.doesNotMatch(source, /reportSideEvenBraceSpacing:true/, "PDF diagonal örgüsü sabit 655 mm GLB adımını yeniden dağıtmamalı");
assert.match(source, /data-pdf-colours','pallet-and-bracket-forced'/, "PDF ön görünüşünde palet ve braket renkleri doğrudan sabitlenmeli");
assert.match(source, /viewBox="0 0 1260 820"[\s\S]*?data-report-shared-scale="true"/, "PDF ön ve yan görünüşleri aynı dış kadraj ve ölçeğe sahip olmalı");
assert.match(source, /BÖLÜMDEN OLUŞUR · TOPLAM ÖLÇÜ/, "PDF ön görünüşünün altında bölüm sayısı ve toplam ölçü yazmalı");
assert.match(source, /if\(mode==='front'\|\|mode==='side'\)return m2SharedScaleReportSvg\(drawing,mode,showAllFrontBays===true\)/, "PDF ön ve yan görünüşleri ortak ölçek üreticisine bağlanmalı");
const sharedReportStart = source.indexOf("function m2SharedScaleReportSvg");
const sharedReportEnd = source.indexOf("\nvar m2CompleteReportElevationSvg", sharedReportStart);
assert.notEqual(sharedReportStart, -1, "Ortak ölçekli A4 görünüş üreticisi bulunamadı");
assert.notEqual(sharedReportEnd, -1, "Ortak ölçekli A4 görünüş üreticisinin sonu bulunamadı");
const reportProjectionCalls = [];
const technicalFrontCalls = [];
const sharedReportContext = vm.createContext({
  Math,
  Number,
  Object,
  m2TechnicalFrontForReport: false,
  fmt: (value) => new Intl.NumberFormat("tr-TR").format(value),
  m2MekikSetProjection: (mode, drawing, x, y, width, height) => {
    reportProjectionCalls.push({ mode, drawing, x, y, width, height });
    return `<g data-test-projection="${mode}"></g>`;
  },
  m2TechnicalFrontSvgForDrawing: (drawing) => {
    technicalFrontCalls.push(drawing);
    return `<svg viewBox="0 0 1260 760" data-test-projection="technical-front"></svg>`;
  },
});
vm.runInContext(source.slice(sharedReportStart, sharedReportEnd), sharedReportContext);
const twentyBayReport = sharedReportContext.m2SharedScaleReportSvg({ bays:20, levels:4, depth:8, palW:1300, totalWidth:29000, railLength:9000 }, "front");
const matchingSideReport = sharedReportContext.m2SharedScaleReportSvg({ bays:20, levels:4, depth:8, palW:1300, totalWidth:29000, railLength:9000 }, "side");
const corporateTwentyBayReport = sharedReportContext.m2SharedScaleReportSvg({ bays:20, levels:4, depth:8, palW:1300, totalWidth:29000, railLength:9000 }, "front", true);
assert.equal(technicalFrontCalls[0].bays, 4, "Yirmi gözlü ön görünüşün teknik kopyasında yalnız dört göz çizilmeli");
assert.equal(technicalFrontCalls[0].totalWidth, 29000, "Dört gözlük teknik kopyada gerçek projenin toplam ölçüsü değiştirilmemeli");
assert.equal(technicalFrontCalls[0].levels, 4, "Dört gözlük teknik kopyada gerçek projenin kat kuralları korunmalı");
assert.equal(technicalFrontCalls[0].depth, 8, "Dört gözlük teknik kopyada gerçek projenin derinlik kuralları korunmalı");
assert.equal(technicalFrontCalls[0].palW, 1300, "Dört gözlük teknik kopyada gerçek projenin palet ölçüsü korunmalı");
assert.match(twentyBayReport, /x="70" y="26" width="1120" height="680" data-report-front-copy="representative"/, "Dört gözlük teknik kopya ortak izdüşüm çerçevesinde gösterilmeli");
assert.equal(technicalFrontCalls[1].bays, 20, "Kurumsal ön görünüş tipin gerçek göz sayısını çizmelidir");
assert.match(corporateTwentyBayReport, /data-report-front-copy="complete"/, "Kurumsal ön görünüş tam proje kopyası olarak işaretlenmeli");
assert.match(corporateTwentyBayReport, /data-real-bays="20" data-shown-bays="20"/, "Kurumsal ön görünüşte temsilî dört göz sınırı kullanılmamalı");
assert.deepEqual(reportProjectionCalls.map(({ mode, x, y, width, height }) => ({ mode, x, y, width, height })), [{ mode:"side", x:138, y:68, width:984, height:598 }], "Yan görünüş ön görünüşten büyük görünmeyecek biçimde orantılanmalı");
assert.equal(reportProjectionCalls[0].drawing.reportSideProfileMm, 40, "PDF diagonalleri 40 mm profil olmalı");
assert.equal(reportProjectionCalls[0].drawing.reportSideEvenBraceSpacing, undefined, "PDF diagonal adımları sonradan orantısız yeniden dağıtılmamalı");
assert.match(matchingSideReport, /data-side-diagonal-spacing="ayak2-glb-600mm-nodes-1200mm-v-repeat"/, "PDF diagonal örgüsü AYAK2 GLB'nin 600 mm düğüm ve 1200 mm V tekrar düzenini kullanmalı");
assert.match(matchingSideReport, /data-side-diagonal-layer="in-front-of-rails"/, "PDF diagonalleri rayların ön katmanında olmalı");
assert.match(twentyBayReport, /data-real-bays="20" data-shown-bays="4"/, "Ön görünüş gerçek ve gösterilen göz sayılarını ayrı tutmalı");
assert.match(twentyBayReport, /20 BÖLÜMDEN OLUŞUR · TOPLAM ÖLÇÜ 29\.000 mm/, "Yirmi bölümlü örneğin gerçek toplam ölçüsü alt bilgiye yazılmalı");
assert.doesNotMatch(twentyBayReport, /ÇİZİMDE .*GÖZ/, "Özet ön görünüşte eski temsil açıklaması kalmamalı");
assert.match(matchingSideReport, /viewBox="0 0 1260 820"[^>]*data-report-shared-scale="true"/, "Yan görünüş ön görünüşle aynı dış kadrajı kullanmalı");
assert.match(source, /m2DrawingEnhancedFront=true;[\s\S]*?m2TechnicalFrontSvgForDrawing\(m2LastDrawing\)/, "Ana ön görünüş tek yakalanmış SVG ile kararlı biçimde güncellenmeli");
assert.match(source, /function insertBeforeLastScriptClose\(htmlSource, scriptSource\)[\s\S]*?htmlSource\.lastIndexOf\(marker\)/, "Mekik teknik ön görünüşü sayfadaki son uygulama betiğine eklenmeli");
assert.doesNotMatch(source, /\.replace\("<\/script>",\s*frontRenderer \+ frontBridge/, "B2B model-viewer betiği Mekik ön görünüş eklemesini yutmamalı");
assert.match(source, /if\(typeof m2RenderA4Report==='function'\)m2RenderA4Report\(\)/, "A4 yan görünüşü ana yan görünüş çizildikten sonra güncellenmeli");
assert.match(source, /GERÇEK GLB ÖN İZDÜŞÜMÜ'[\s\S]*?node\.remove\(\)/, "PDF ön görünüşündeki filigran başlığı kaldırılmalı");
assert.match(portal, /m2ReportImages = Array\(4\)\.fill\(null\)/, "A4 fotoğraf alanı dört bölümle sınırlı olmalı");
assert.match(portal, /class="m2-top-single-rear-profile" data-single-rear-profile="true"/, "Ekstra profil seçildiğinde ana üst görünüşün en arkasında tekli profil çizilmeli");
assert.doesNotMatch(portal, /requireTerminal1200|terminalFoot1200|data-placement="between-sections"/, "FIFO ekstra profil geri alındıktan sonra son ayak 1200 mm zorlaması veya araya yerleştirme kalmamalı");
assert.match(portal, /const braceCount = hasExtra \? footCount : footCount - 1;/, "Ekstra profilde önceki eşit ayak ve arabağ hesabı korunmalı");
assert.match(portal, /function m2Plan\(railLength, hasExtra\)/, "Ayak dağılımı FIFO sistem tipine özel son ayak zorlaması kullanmamalı");
assert.match(portal, /straightProfileCount = hasExtra \? 1 : 0/, "Ekstra düz profil var seçildiğinde konfigürasyona yalnız bir adet eklenmeli");
assert.match(portal, /m2PartRows\("Ayak", plan\.feet\) \+ straightProfileRows \+ m2PartRows\("Düz arabağ", plan\.braces\)/, "Ekstra düz profil satırı doğrudan Ayak satırının altında, Düz arabağ satırından önce gösterilmeli");
assert.match(portal, /class="m2-layout-single-rear-profile" data-single-rear-profile="true"/, "Ekstra profil seçildiğinde serbest yerleşim görselinin en arkasında tekli profil çizilmeli");
assert.doesNotMatch(portal, /m2-side-upright--single-rear/, "Yan görünüş ayakları eski standart tipten ayrılmamalı");
assert.match(portal, /if \(drawing\.hasExtra\)[\s\S]*?TEKLI ARKA PROFIL/, "Ekstra profil DXF görünüşünde de en arkadaki tekli profil olarak bulunmalı");
assert.match(portal, /<section class="m2-glb-parts" hidden/, "GLB parça seti gizli olmalı");
assert.doesNotMatch(portal, /\$\{fmt\(footCount\)\} ayak · \$\{fmt\(levels\)\} kat/, "Yan görünüş başlığında ayak adedi yazmamalı");

const rackVisualStart = portal.indexOf("function m2RackVisualSideOverhang");
const rackVisualEnd = portal.indexOf("\n      function m2RackLocalPoint", rackVisualStart);
const wallMeasureStart = portal.indexOf("function m2WallMeasurements");
const wallMeasureEnd = portal.indexOf("\n      function m2WallDistanceGuides", wallMeasureStart);
assert.notEqual(rackVisualStart, -1, "Raf dış sınırı hesabı bulunamadı");
assert.notEqual(wallMeasureStart, -1, "Raf-duvar ölçü hesabı bulunamadı");
const wallContext = vm.createContext({
  Math,
  m2WallMeasurementInset: 0,
  m2CombinedRackBounds: (rack) => ({ left:rack.x, right:rack.x+rack.w, top:rack.y, bottom:rack.y+rack.h, cx:rack.x+rack.w/2, cy:rack.y+rack.h/2 }),
  m2LayoutState: {
    points: [{ x: 100, y: 100 }, { x: 900, y: 100 }, { x: 900, y: 550 }, { x: 100, y: 550 }],
    pathBreaks: [],
    openFinished: false,
  },
});
vm.runInContext(`${portal.slice(rackVisualStart, rackVisualEnd)}\n${portal.slice(wallMeasureStart, wallMeasureEnd)}`, wallContext);
const netWallDistances = wallContext.m2WallMeasurements({ x: 200, y: 200, w: 100, h: 200, angle: 0, plan: { feet: [] } });
assert.equal(netWallDistances.left.px, 100, "Sol raf-duvar ölçüsü görsel duvar kalınlığını düşmemeli");
assert.equal(netWallDistances.right.px, 600, "Sağ raf-duvar ölçüsü görsel duvar kalınlığını düşmemeli");
assert.equal(netWallDistances.top.px, 100, "Üst raf-duvar ölçüsü görsel duvar kalınlığını düşmemeli");
assert.equal(netWallDistances.bottom.px, 150, "Alt raf-duvar ölçüsü görsel duvar kalınlığını düşmemeli");
assert.match(portal, /const sy = \(z\) => rackHeightMm - z/, "Yan görünüşte kot arttıkça çizim yukarı gitmeli");
assert.match(portal, /const floorY = sy\(0\)/, "Yan görünüş zemini sıfır kotunda ve altta olmalı");
assert.match(portal, /data-side-auto-framing="last-pallet-top-safe"/, "Yan görünüş son paletin üstünü güvenli kadrajda tutmalı");
assert.doesNotMatch(portal, /class="m2-side-level-dimension"/, "Yan görünüşte istenmeyen K1–K2 kat aralığı ölçü zinciri olmamalı");
assert.doesNotMatch(portal, /K\$\{level \+ 1\}–K\$\{level \+ 2\}/, "Yan görünüşte K1–K2 türü kat aralığı etiketleri olmamalı");
assert.match(portal, /Palet yüksekliği \(mm\)<input id="m2LevelH"/, "Kat aralığı girdisi palet yüksekliği olarak değişmeli");
assert.match(portal, /PALET YÜKSEKLİĞİ · \$\{fmt\(palletHeight\)\} mm/, "Yan görünüş palet yüksekliğini özetlemeli");
assert.match(portal, /data-side-dimensions="visible-small-text"/, "Yan görünüş ölçü çizgileri küçük yazıyla görünür olmalı");
assert.match(portal, /class="m2-side-gap-dimension"/, "Palet aralığı ölçü çizgileri geri gelmeli");
assert.match(portal, /data-text-scale="0\.01"/, "Palet aralığı özet yazısı 100 kat küçültülmeli");
assert.match(portal, /m2-side-gap-summary-text" data-text-scale="0\.01"/, "Üstte tekrarlanan palet aralığı özeti de 100 kat küçültülmeli");
assert.doesNotMatch(portal, /<g class="m2-side-first-rail"/, "Son eklenen yan görünüş ilk kat ölçüsü geri alınmalı");
assert.match(portal, /class="m2-side-overall-dimension"/, "Toplam yükseklik ölçüleri geri gelmeli");
assert.match(portal, /m2-side-overall-label \{ fill:#173c2d; font:900 12px/, "Yan görünüş ayak uzunluğu ölçüsü büyük ve okunaklı olmalı");
assert.equal((portal.match(/<button[^>]*data-m2-spacing-button="pallet"/g) || []).length, 3, "Palet arası mesafe özelleştirme düğmesi üç görünüşte de bulunmalı");
assert.equal((portal.match(/<button[^>]*data-m2-spacing-button="level"/g) || []).length, 3, "Kat arası mesafe özelleştirme düğmesi üç görünüşte de bulunmalı");
assert.match(portal, /id="m2FirstLevelHeight"[^>]*value="430"/, "İlk kat yüksekliği varsayılanı 430 mm olmalı");
assert.match(portal, /id="m2LevelSpacing"[^>]*value="1580"/, "İki palet arası dikey mesafe varsayılanı 1580 mm olmalı");
assert.match(portal, /id="m2FirstPalletGap"[^>]*value="200"/, "İlk palet aralığı varsayılanı 200 mm olmalı");
assert.match(portal, /id="m2PalletGap"[^>]*value="50"/, "Diğer palet aralıkları varsayılanı 50 mm olmalı");
assert.match(portal, /onclick="m2ApplySpacingSettings\(\)">Kaydet<\/button>/, "Palet aralıkları yalnız Kaydet ile uygulanmalı");
assert.match(portal, /closest\?\.\("#m2SpacingModal"\)\) return;/, "Palet aralığı yazılırken ağır çizim hesabı tetiklenmemeli");
assert.match(portal, /function m2CancelSpacingSettings\(\)/, "Kaydedilmeyen palet aralığı değişiklikleri iptal edilebilmeli");
assert.match(portal, /class="m2-top-v-brace-selector/, "Üst görünüşte her bölüm için tıklanabilir V çapraz seçimi bulunmalı");
assert.match(portal, /topVBraceBays: \[\.\.\.normalizedTopVBraceBays\]/, "Seçilen V çapraz bölümleri raf kaydında saklanmalı");
assert.match(portal, /data-v-brace-layout="upright-center-to-upright-center"/, "Seçilen V çapraz doğrudan ayak profili merkezlerinden bağlanmalı");
assert.match(portal, /class="m2-layout-seismic-brace"[^>]*data-seismic-brace-surface="free-layout-and-output"/, "Seçilen deprem çaprazı serbest yerleşim SVG'sine ve klonlanan çıktıya taşınmalı");
assert.match(portal, /class="m2-section-seismic-brace"[^>]*data-seismic-brace-surface="section-and-output"/, "Seçilen deprem çaprazı teknik kesitte ve kesit çıktısında gösterilmeli");
assert.match(portal, /\.m2-layout-seismic-brace \{[^}]*stroke:#a67c00;[^}]*stroke-width:2\.2;/, "Serbest yerleşim ve klonlanan PDF çaprazı üst görünüş kadar zarif olmalı");
assert.match(portal, /\.m2-section-seismic-brace \{[^}]*stroke:#a67c00;[^}]*stroke-width:7;/, "Kesit ve kesit PDF çaprazı teknik ölçekte inceltilmiş olmalı");
assert.doesNotMatch(portal, /\.m2-layout-seismic-brace \{[^}]*drop-shadow/, "Serbest yerleşim çaprazında ağır gölge kalmamalı");
assert.match(portal, /vBraceNodeYs\.push\(vBraceCursor\)/, "V çapraz ilk ayak profilinin başlangıç birleşiminden başlamalı");
assert.match(portal, /vBraceNodeYs\.push\(vBraceCursor \+ partHeight\)/, "V çapraz ayak profillerinin bitiş birleşimlerine bağlanmalı");
assert.match(portal, /index % 2 === 0 \? x1 : x2/, "V çapraz ayak profili merkezleri arasında sağa sola devam etmeli");
assert.doesNotMatch(portal, /x1 \+ profileHalf : x2 - profileHalf/, "V çapraz profil kenarlarına kaçmamalı");
assert.match(portal, /KOLON ARALIĞI · \$\{fmt\(bayPitch\)\} mm/, "Ön görünüşte kolon aralığı büyük ölçü etiketiyle gösterilmeli");
assert.match(portal, /AYAK UZUNLUĞU · \$\{fmt\(sideUprightHeight\)\} mm/, "Yan görünüşte ayak uzunluğu açıkça adlandırılmalı");
assert.match(portal, /Palet ağırlığı \(kg\)<input id="m2PalletWeight"[^>]*value="1000"/, "Palet ağırlığı yeni bir proje girdisi olmalı");
assert.match(portal, /<span>Önerilen Ray tipi<\/span>/, "Önerilen ayak tipinin altında önerilen ray tipi bulunmalı");
assert.match(portal, /function m2RecommendedRailThickness\(palletWeight\)/, "Ray kalınlığı palet ağırlığına göre önerilmeli");
assert.match(portal, /if \(weight <= 800\) return 2;[\s\S]*?if \(weight <= 1200\) return 2\.5;[\s\S]*?return 3;/, "Ray kalınlığı 0–800, 800–1200 ve 1200–1500 kg aralıklarında 2, 2,5 ve 3 mm olmalı");
assert.match(portal, /id="m2RailManualButton"[^>]*onclick="m2ToggleRailManualList\(\)"/, "Ray tipi ayaktaki gibi manuel seçime açılabilmeli");
assert.match(portal, /id="m2RailHeight"[\s\S]*?<option value="150" selected>150 mm<\/option><option value="170">170 mm<\/option>/, "Ray yüksekliği 150 mm ve 170 mm olarak seçilebilmeli");
assert.match(portal, /<span>Önerilen Travers<\/span><b id="m2TraverseRecommendation">Formül bekleniyor<\/b>/, "Önerilen travers alanı formül bağlanmak üzere hazır olmalı");
assert.match(portal, /railThickness, railThicknessManual:m2RailThicknessManual, railHeight, traverseRecommendation:null/, "Ray ve travers öneri bilgileri raf kaydında korunmalı");
assert.match(portal, /Ayak hesabındaki ilk kat yüksekliği<input type="hidden" id="m2FootLoadStart" value="ground"/, "Ayak hesabı için Zemin Kat / 1. Kat seçimi bulunmalı");
assert.match(portal, />Zemin Kat<\/button><button[^>]*>1\. Kat<\/button>/, "Ayak hesabındaki ilk kat yüksekliği seçenekleri doğru adlandırılmalı");
assert.match(portal, /<span>Önerilen ayak tipi<\/span><div class="m2-foot-choice-row"><select class="classic-choice" id="m2FootProfile"/, "Önerilen ayak tipi açılır listede gösterilmeli");
assert.match(portal, /id="m2FootManualButton"[^>]*onclick="m2ToggleFootManualList\(\)"/, "Önerilen ayak tipinin yanında Manuel Seç düğmesi bulunmalı");
assert.match(portal, /loadedLevels = b2bFootCalculation \? b2bFootCalculation\.loadedLevels : Math\.max\(0, levels - \(footLoadStart === "first" \? 1 : 0\)\)/, "1. Kat seçilince yük hesabından bir kat eksiltilmeli");
assert.match(portal, /footCalculationHeight = b2bFootCalculation \? b2bFootCalculation\.footCalculationHeight : \(footLoadStart === "first" \? firstRailHeight \+ levelH : firstRailHeight\)/, "1. Kat seçilince ayak hesabı alttan ikinci traversin üst kotunu kullanmalı");
assert.match(portal, /m2ResolveFootProfiles\(footCalculationHeight, footLoad\)/, "Ayak profili seçimi hesaplanan travers üst kotuna göre yapılmalı");
assert.match(portal, /zeminden alttan 2\. traversin üst kotuna: \$\{fmt\(footCalculationHeight\)\} mm/, "1. Kat hesap ölçüsü seçim alanında açıkça yazılmalı");
assert.match(portal, /totalPalletLoad = b2bFootCalculation \? b2bFootCalculation\.totalPalletLoad : palletWeight \* depth \* loadedLevels/, "Toplam ayak yükü palet ağırlığı × derinlik × yüklü kat sayısı kuralını izlemeli");
assert.match(portal, /footLoad = b2bFootCalculation \? b2bFootCalculation\.footLoad : m2CalculateFootLoad\(totalPalletLoad, railLength, deepestFoot, deepestBrace\)/, "Ayak başı yük yeni Excel formülünden hesaplanmalı");
const footLoadFormulaStart = portal.indexOf("function m2CalculateFootLoad");
const footLoadFormulaEnd = portal.indexOf("\n      function drawMekik2", footLoadFormulaStart);
assert.notEqual(footLoadFormulaStart, -1, "Ayak başı yük formülü bulunamadı");
assert.notEqual(footLoadFormulaEnd, -1, "Ayak başı yük formülünün sonu bulunamadı");
const footLoadFormulaContext = vm.createContext({ Math, Number });
vm.runInContext(portal.slice(footLoadFormulaStart, footLoadFormulaEnd), footLoadFormulaContext);
assert.equal(footLoadFormulaContext.m2CalculateFootLoad(80000, 17250, 1200, 1200), 11130, "Excel örneği 11.130 kg/ayak vermeli");
assert.equal(footLoadFormulaContext.m2CalculateFootLoad(80000, 0, 1200, 1200), 0, "Sıfır ray uzunluğunda güvenli sonuç dönmeli");
assert.match(portal, /gap = fifoEndGap \|\| filoEntryGap \? firstGap : regularGap;/, "FIFO/FILO palet boşlukları özelleştirilebilir ilk ve normal aralıkları izlemeli");
assert.match(portal, /loadClearanceMm = Math\.max\(0, levelHeightMm - loadHeightMm - traverseHeightMm\)/, "Palet üstü net boşluk elle girilen kat aralığından hesaplanmalı");
assert.match(portal, /traverseHeightMm = 80/, "Travers yüksekliği 80 mm olmalı");
assert.match(portal, /modelTopPadding = 96/, "Son paletin üstünde ölçekten bağımsız güvenli boşluk bırakılmalı");
assert.doesNotMatch(portal, /m2-front-box-detail|m2-front-pallet-slat|m2-side-box-highlight|m2-side-pallet-slat/, "Palet ve kutuların iç dekoratif çizgileri kaldırılmalı");
assert.match(portal, /data-load-style="plain-sharp"/, "Palet ve kutu dış hatları keskin köşeli olmalı");

const palletLayoutStart = portal.indexOf("function m2PalletGapSummary");
const palletLayoutEnd = portal.indexOf("\n      function m2DxfPair", palletLayoutStart);
assert.notEqual(palletLayoutStart, -1, "Palet derinlik hesabı bulunamadı");
assert.notEqual(palletLayoutEnd, -1, "Palet derinlik hesabının sonu bulunamadı");
const palletLayoutContext = vm.createContext({ Math, Number });
vm.runInContext(portal.slice(palletLayoutStart, palletLayoutEnd), palletLayoutContext);
const twoPalletLayout = palletLayoutContext.m2PalletDepthLayout(2, 1000, "fifo");
assert.equal(JSON.stringify(twoPalletLayout.gaps), "[200]", "İki paletli FIFO diziliminde uç boşluğu 200 mm olmalı");
assert.equal(twoPalletLayout.railLength, 2200, "İki adet 1000 mm palet ve 200 mm FIFO uç boşluğu doğru toplanmalı");
const fourPalletLayout = palletLayoutContext.m2PalletDepthLayout(4, 1000, "fifo");
assert.equal(JSON.stringify(fourPalletLayout.gaps), "[200,50,200]", "FIFO uç boşlukları 200 mm, iç boşluk 50 mm olmalı");
assert.equal(JSON.stringify(fourPalletLayout.gapRanges), '[{"start":1000,"end":1200,"size":200},{"start":2200,"end":2250,"size":50},{"start":3250,"end":3450,"size":200}]', "200/50/200 mm boşluklar paletlerin dış yüzleri arasında açık aralıklar oluşturmalı");
assert.equal(fourPalletLayout.railLength, 4450, "Ray uzunluğu FIFO 200/50 mm palet aralıklarıyla hesaplanmalı");
const fourPalletFiloLayout = palletLayoutContext.m2PalletDepthLayout(4, 1000, "filo");
assert.equal(JSON.stringify(fourPalletFiloLayout.gaps), "[200,50,50]", "FILO giriş boşluğu 200 mm, diğer boşluklar 50 mm olmalı");
assert.equal(fourPalletFiloLayout.railLength, 4300, "Ray uzunluğu FILO 200/50 mm palet aralıklarıyla hesaplanmalı");
const customPalletLayout = palletLayoutContext.m2PalletDepthLayout(4, 1000, "fifo", 350, 120);
assert.equal(JSON.stringify(customPalletLayout.gaps), "[350,120,350]", "Özelleştirilmiş ilk/uç ve diğer aralıklar FIFO geometrisine uygulanmalı");
assert.equal(customPalletLayout.railLength, 4820, "Özelleştirilmiş palet aralıkları ray uzunluğunu değiştirmeli");

const projectionStart = portal.indexOf("function m2MekikSetProjection");
const projectionEnd = portal.indexOf("\n      function drawMekik2", projectionStart);
assert.notEqual(projectionStart, -1, "Mekik görünüş üreticisi bulunamadı");
assert.notEqual(projectionEnd, -1, "Mekik görünüş üreticisinin sonu bulunamadı");
palletLayoutContext.fmt = (value) => new Intl.NumberFormat("tr-TR").format(value);
palletLayoutContext.m2ShowSidePallets = true;
palletLayoutContext.m2Ayak2FrontRaster = "data:image/png;base64,AYAK2_FRONT_TEST";
vm.runInContext(portal.slice(projectionStart, projectionEnd), palletLayoutContext);
const portalSideProjection = palletLayoutContext.m2MekikSetProjection("side", {
  bays: 4,
  levels: 4,
  depth: 4,
  palW: 1300,
  palD: 1000,
  footType: 100,
  palletHeight: 1200,
  levelH: 1580,
  firstRailHeight: 430,
  railLength: fourPalletLayout.railLength,
  systemType: "fifo",
  plan: { feet: [1000, 1000, 1000], braces: [765, 765, 760] },
}, 0, 0, 920, 610);
const portalSingleRearProjection = palletLayoutContext.m2MekikSetProjection("side", {
  bays: 4,
  levels: 4,
  depth: 4,
  palW: 1300,
  palD: 1000,
  footType: 100,
  palletHeight: 1200,
  levelH: 1580,
  firstRailHeight: 430,
  railLength: 4450,
  systemType: "fifo",
  hasExtra: true,
  plan: { feet: [1000, 1000], braces: [1200, 1250] },
}, 0, 0, 920, 610);
const portalFrontProjection = palletLayoutContext.m2MekikSetProjection("front", {
  bays: 4,
  levels: 4,
  palW: 1300,
  footType: 100,
  palletHeight: 1200,
  levelH: 1580,
  firstRailHeight: 430,
}, 0, 0, 920, 610);
assert.match(portalFrontProjection, /data-front-layout="ayak2-glb-front-projection"/, "A4 ve kayıtlı ön görünüş AYAK2 GLB ön izdüşümünü kullanmalı");
assert.equal((portalFrontProjection.match(/class="m2-front-upright m2-front-upright--ayak2-glb"/g) || []).length, 5, "Portal ön görünüşte her aks AYAK2 GLB ayağı olmalı");
assert.match(portalFrontProjection, /href="data:image\/png;base64,AYAK2_FRONT_TEST"/, "Portal ön görünüşte AYAK2 GLB izdüşümü gömülmeli");
assert.match(portalSideProjection, /data-pallet-height-mm="1200"/, "Yan görünüş palet yüksekliğini doğrudan kullanmalı");
assert.doesNotMatch(portalSideProjection, /ayak2-glb-side-projection|m2-side-frame--ayak2-glb/, "Yan görünüşün ayak profili eski sade galvaniz tipten AYAK2 görseline çevrilmemeli");
assert.match(portalSideProjection, /data-horizontal-braces="bottom,top"/, "Yan görünüşte AYAK2 GLB'deki alt ve üst yataylar bulunmalı");
assert.match(portalSideProjection, /class="m2-side-upright"/, "Yan görünüşte eski vektör dikmeler çizilmeli");
assert.match(portalSideProjection, /data-upright-style="legacy-plain-galvanized"/, "Yan görünüş ayakları sade galvaniz eski tipte olmalı");
assert.doesNotMatch(portalSideProjection, /m2-side-upright-holes/, "Yan görünüş ayağında sonradan eklenen delikli profil görünümü olmamalı");
assert.match(portalSingleRearProjection, /class="m2-side-upright" data-position-mm="4450"/, "Yan görünüşün en arka ayağı eski standart tipte çizilmeli");
assert.doesNotMatch(portalSingleRearProjection, /m2-side-upright--single-rear|data-single-rear-profile="true"/, "Yan görünüşte özel ayak tipi kullanılmamalı");
assert.match(portalSideProjection, /class="m2-side-diagonal"/, "Yan görünüşte eski çaprazlar çizilmeli");
assert.match(portalSideProjection, /data-brace-style="ayak2-glb-600mm-nodes-1200mm-v-repeat"/, "Yan görünüş diagonalleri AYAK2 GLB düğüm düzenini kullanmalı");
assert.match(portalSideProjection, /data-diagonal-node-step-mm="600" data-v-repeat-mm="1200" data-glb-source="AYAK2\.glb"/, "Diagonal düğümleri 600 mm, aynı yöne dönen V tekrarı 1200 mm olmalı");
assert.match(portalSideProjection, /\.m2-side-diagonal\{fill:none;stroke:#949da1;stroke-width:40;/, "Ekran ve PDF diagonalleri GLB'deki 40 mm profille çizilmeli");
assert.match(portalSideProjection, /İLK DÜĞÜM · 600 mm/, "İlk diagonal düğüm ölçüsü çizimde yazmalı");
assert.match(portalSideProjection, /V TEKRARI · 1\.200 mm/, "1200 mm V tekrar ölçüsü çizimde yazmalı");
assert.match(portalSideProjection, /data-diagonal-layer="in-front-of-rails"/, "Yan görünüş diagonalleri rayların önünde çizilmeli");
assert.ok(portalSideProjection.indexOf('class="m2-side-continuous-rail"') < portalSideProjection.indexOf('class="m2-side-diagonal"'), "SVG katman sırasına göre raylar önce, diagoneller sonra çizilmeli");
assert.match(portalSideProjection, /data-level-spacing-mm="1580"/, "Kat taşıyıcı adımı palet yüksekliği + 300 mm net boşluk + 80 mm travers olmalı");
assert.match(portalSideProjection, /data-traverse-height-mm="80"/, "Yan görünüş traversi 80 mm olmalı");
assert.match(portalSideProjection, /data-load-clearance-mm="300"/, "Palet üstü ile travers altı arasında 300 mm net boşluk olmalı");
assert.match(portalSideProjection, /data-pallet-gaps-mm="200,50,200"/, "Derinlikte FIFO 200/50/200 mm palet boşlukları korunmalı");
assert.match(portalSideProjection, /data-spacing-geometry="applied"/, "Ara mesafeler yalnız etikette değil görünüş geometrisinde uygulanmalı");
assert.match(portalSideProjection, /data-spacing-overlay="removed"/, "Paletlerin üstündeki filigran benzeri yardımcı katman kaldırılmalı");
assert.doesNotMatch(portalSideProjection, /m2-side-depth-gap-zone|m2-side-vertical-clearance-zone/, "Sarı noktalı boşluk katmanları paletlerin üstünde çizilmemeli");
const firstLevelLoads = [...portalSideProjection.matchAll(/<g class="m2-side-entry-load" data-side-level="1" data-depth-index="(\d+)" data-pallet-start-mm="([\d.]+)" data-pallet-end-mm="([\d.]+)" data-load-top-mm="([\d.]+)" data-next-traverse-bottom-mm="([\d.]+)"/g)]
  .map((match) => ({ index: Number(match[1]), start: Number(match[2]), end: Number(match[3]), loadTop: Number(match[4]), nextTraverseBottom: Number(match[5]) }));
assert.deepEqual(firstLevelLoads.map(({ start, end }) => ({ start, end })), [
  { start: 0, end: 1000 },
  { start: 1200, end: 2200 },
  { start: 2250, end: 3250 },
  { start: 3450, end: 4450 },
], "Palet dikdörtgenleri arasında gerçek FIFO 200/50/200 mm boşlukları kalmalı");
const expectedFifoGaps = [200, 50, 200];
for (let index = 0; index < firstLevelLoads.length - 1; index++) {
  assert.equal(firstLevelLoads[index + 1].start - firstLevelLoads[index].end, expectedFifoGaps[index], `Palet ${index + 1} ile ${index + 2} arası çizim geometrisinde FIFO kuralını izlemeli`);
}
firstLevelLoads.forEach((load) => {
  assert.equal(load.nextTraverseBottom - load.loadTop, 300, "Palet/yük üstü ile sonraki travers altı çizim geometrisinde 300 mm olmalı");
});
assert.doesNotMatch(portalSideProjection, /m2-side-pallet-gap/, "Yan görünüşte istenmeyen palet aralığı ölçüleri çizilmemeli");
assert.match(portalSideProjection, /data-load-style="plain-sharp"/, "Yan görünüş palet ve kutuları keskin, sade dış hat kullanmalı");
assert.doesNotMatch(portalSideProjection, /m2-side-box-highlight|m2-side-pallet-slat/, "Yan görünüş palet ve kutularında iç çizgi olmamalı");
assert.match(portalFrontProjection, /data-level-dimension-mode="intervals-with-ground"/, "Ön görünüş ilk kat ve sonraki doğrudan kat aralıklarını göstermeli");
assert.match(portalFrontProjection, /data-level-dimension-labels="plain-unboxed"/, "Kat ölçü yazıları kutusuz düz metin olmalı");
assert.match(portalFrontProjection, /data-dimension-witness-style="dashed-to-target"/, "Ölçü uçlarından rafa kesik yardımcı çizgiler uzanmalı");
assert.match(portalFrontProjection, /class="m2-front-dimension-arrow"/, "Kat ölçülerinde küçük ok uçları bulunmalı");
assert.match(portalFrontProjection, /class="m2-front-dimension-witness"/, "Kat ölçülerinin hedef bağlantıları kesik çizgiyle gösterilmeli");
assert.doesNotMatch(portalFrontProjection, /class="m2-front-level-interval"[^>]*>(?:(?!<\/g>)[\s\S])*<rect/, "Kat aralığı ölçü metinlerinin çevresinde dikdörtgen olmamalı");
assert.match(portalFrontProjection, /KOT ARALIKLARI/, "Ön görünüş ölçü başlığı KOT ARALIKLARI olmalı");
assert.match(portalFrontProjection, /ZEMİN · 430 mm/, "Zemin ile ilk taşıyıcı kotu ayrı yazılmalı");
assert.match(portalFrontProjection, /K1 · 1\.580 mm/, "Paletli kat numaraları K1 ile başlamalı");
assert.match(portalFrontProjection, /K2 · 1\.580 mm/, "K2 yazısı ilgili kat aralığı ölçüsünün başında olmalı");
assert.doesNotMatch(portalFrontProjection, /class="m2-front-floor-label"/, "Kat adları palet yanında ayrı etiket olarak kalmamalı");
assert.equal((portalFrontProjection.match(/class="m2-front-level-interval"/g) || []).length, 4, "Dört katta ilk kat dahil dört doğrudan ölçü olmalı");
assert.equal((portalFrontProjection.match(/data-measure-mm="430"/g) || []).length, 1, "İlk kat yüksekliği 430 mm olarak ayrı ölçülmeli");
assert.equal((portalFrontProjection.match(/data-measure-mm="1580"/g) || []).length, 3, "1200 mm palet yüksekliğinde her kat aralığı 1580 mm olmalı");
assert.doesNotMatch(portalFrontProjection, /K4 · 5\.170 mm/, "Ön görünüşte kümülatif zemin kotları gösterilmemeli");
assert.match(portalFrontProjection, /data-load-style="plain-sharp"/, "Ön görünüş palet ve kutuları keskin, sade dış hat kullanmalı");
assert.doesNotMatch(portalFrontProjection, /m2-front-box-detail|m2-front-pallet-slat/, "Ön görünüş palet ve kutularında iç çizgi olmamalı");
assert.doesNotMatch(portal, /1,5\s*mm\s*(?:öncelikli|dışı|dışındaki)/i, "Kullanıcı arayüzünde 1,5 mm öncelikli/dışı açıklaması yazmamalı");
assert.match(source, /class="m2-front-ray-ends" data-support-height-mm="250" data-finish="RAL 1007"/, "Ön görünüşte travers üstündeki iki ray braketi RAL 1007 olmalı");
assert.match(source, /class="m2-front-ray-ends"[\s\S]*?fill="url\(#m2fronttraverse\)"[\s\S]*?fill="url\(#m2fronttraverse\)"/, "Ön görünüşte iki ray braketi de traversin sarı yüzeyini kullanmalı");
assert.match(source, /class="m2-front-traverse" data-finish="RAL 1007"[\s\S]*?fill="#f2c500"/, "Travers profili A4 dahil tüm ön görünüşlerde doğrudan RAL 1007 sarı dolgu kullanmalı");
assert.match(portal, /\.m2-front-connector,[\s\S]*?\.m2-front-traverse-connector > path[\s\S]*?fill:\s*#f2c500\s*!important/, "Braket rengi ekran ve PDF'de RAL 1007 olarak korunmalı");
assert.match(portal, /\.m2-pallet-surface,[\s\S]*?\.m2-front-box[\s\S]*?fill:\s*#d7a44f\s*!important/, "Yük rengi üst, yerleşim ve ön görünüşlerde korunmalı");
assert.doesNotMatch(portal, /\.m2-front-pallet[^\{]*\{[^}]*!important/, "Ön görünüş paleti kendi koyu ahşap rengini korumalı");
assert.doesNotMatch(portal, /\.m2-side-(?:box|pallet)[^{]*\{[^}]*!important/, "Yan görünüşün kendi SVG renkleri dış CSS tarafından ezilmemeli");
const enhancedUprightLayer = source.indexOf("front+=m2FrontUpright(ux,postTop,postHeight,fPostW,fGround,fFootW,fFootH,u+1)");
const enhancedLoadLayer = source.indexOf("front+='<g class=\"m2-front-load\"");
const enhancedTraverseLayer = source.indexOf("front+='<g class=\"m2-front-traverse\"");
assert.ok(enhancedUprightLayer > -1 && enhancedUprightLayer < enhancedLoadLayer, "Galvaniz ayaklar yük ve traverslerden önce, arka katmanda çizilmeli");
assert.ok(enhancedLoadLayer > -1 && enhancedLoadLayer < enhancedTraverseLayer, "Travers ve braketler yükün üstünde, en ön katmanda çizilmeli");
assert.match(source, /function m2TechnicalFrontSvgForDrawing\(drawing\)/, "Yatay A4 ön görünüşü güncel teknik çiziciden üretilebilmeli");
assert.match(source, /m2TechnicalFrontForReport=true;[\s\S]*?m2TechnicalFrontSvgForDrawing\(projectedDrawing\)[\s\S]*?m2TechnicalFrontForReport=previousReportMode/, "PDF ön görünüşü detay filtresini etkinleştiren rapor kipinde üretilmeli");
assert.match(source, /showDetails=forReport&&m2PdfDetailsEnabled\(\)/, "PDF detay anahtarı ana ekran ön görünüşünün kadrajını değiştirmemeli");
assert.match(source, /data-pdf-level-intervals','emphasized'/, "PDF ön görünüşündeki kat aralıkları belirgin görünümle işaretlenmeli");
assert.match(source, /\.m2-front-level-interval text'[\s\S]*?font-size','13'[\s\S]*?font-weight','900'/, "PDF kat aralığı yazıları daha büyük ve kalın olmalı");
assert.match(portal, /m2ReportFrontDetails[^>]*type="checkbox" onchange="m2SetPdfPalletDetails\(this\.checked\)"/, "PDF içindeki detay anahtarı üstteki detay kontrolüyle aynı durumu kullanmalı");
assert.match(portal, /PDF’te Detayı Gizle[\s\S]*?PDF’te Detay Göster/, "PDF detay düğmesi açık ve kapalı durumlarda eylemini göstermeli");
assert.match(source, /data-report-view="'\+mode\+'"/, "A4 sayfasındaki ortak ölçekli görünüşün yönü doğrulanabilir biçimde işaretlenmeli");
assert.match(source, /m2ReportElevationSvg=function\(drawing,mode,showAllFrontBays\)/, "A4 görünüş üreticisi güncel ön görünüşe bağlanmalı");
assert.match(source, /m2ReportElevationSvg=function\(drawing,mode,showAllFrontBays\)\{[\s\S]*?m2SharedScaleReportSvg\(drawing,mode,showAllFrontBays===true\)/, "A4 ön ve yan görünüş kartları ortak ölçekli çiziciyi kullanmalı");

const portalNodeValues = {
  m2Bays: 4,
  m2Levels: 4,
  m2Depth: 4,
  m2PalW: 1300,
  m2PalletWeight: 1000,
  m2FootType: 100,
  m2RailThickness: 2.5,
  m2RailHeight: 150,
  m2LevelH: 1200,
  m2FirstLevelHeight: 430,
  m2LevelSpacing: 1580,
  m2PalD: 1000,
  m2PalDOther: 900,
  m2System: "fifo",
  m2FirstPalletGap: 200,
  m2PalletGap: 50,
  m2Extra: 0,
  m2FootLoadStart: "ground",
};
const portalNodes = new Map();
function portalNodeFor(id) {
  if (!portalNodes.has(id)) {
    portalNodes.set(id, {
      id,
      value: portalNodeValues[id] ?? "",
      textContent: "",
      innerHTML: "",
      checked: id === "m2ShowFlowArrows",
      disabled: false,
      className: "",
      classList: { toggle() {}, add() {}, remove() {} },
      setAttribute() {},
    });
  }
  return portalNodes.get(id);
}
Object.assign(palletLayoutContext, {
  $: portalNodeFor,
  m2Number: (id, min, max) => Math.max(min, Math.min(max, Math.round(Number(portalNodeFor(id).value) || min))),
  m2LimitedNumber: (id, min, max) => Math.max(min, Math.min(max, Math.round(Number(portalNodeFor(id).value) || min))),
  esc: (value) => String(value),
  m2Plan: () => ({ feet: [1000, 1000, 1000], braces: [765, 765, 760] }),
  m2PartRows: () => "",
  m2LastDrawing: null,
  m2FootSelectionKey: "",
  m2FootSelectionManual: false,
  m2FootManualListOpen: false,
  m2RailThicknessSelection: "",
  m2RailThicknessManual: false,
  m2RailManualListOpen: false,
  m2TopVBraceBays: new Set([0]),
  m2ActiveModule: "mekik2",
  b2bReadInputState: () => null,
  b2bRefreshSummary() {},
  m2LastRailHeightSelection: 150,
  m2RecommendedZoom: 0,
  m2TopZoom: 0,
  m2ZoomTop() {},
  requestAnimationFrame() { return 0; },
  m2AutoFitTop() {},
  m2SyncLayoutRackMeasurements() {},
});
const portalFootDataStart = portal.indexOf("const footHeights = [");
const portalFootDataEnd = portal.indexOf("\n      function renderFoot()", portalFootDataStart);
assert.notEqual(portalFootDataStart, -1, "Ayak yükseklik tablosu bulunamadı");
assert.notEqual(portalFootDataEnd, -1, "Ayak kapasite tablolarının sonu bulunamadı");
vm.runInContext(portal.slice(portalFootDataStart, portalFootDataEnd), palletLayoutContext);
const representativeFootSelection = vm.runInContext("m2ResolveFootProfiles(430, 5000)", palletLayoutContext);
assert.equal(representativeFootSelection.tableHeight, 500, "430 mm ilk kat yüksekliği Ayak Hesaplama kuralıyla 500 mm tablo satırına yuvarlanmalı");
assert.equal(representativeFootSelection.primary.profile, "HR90.80.1,5", "Temsili 5.000 kg ayak yükünde ilk uygun 1,5 mm profil önerilmeli");
assert.equal(representativeFootSelection.primary.ly, 1200, "Tek öneride Ayak Hesaplama tablosundaki Ly 1.200 sistemi öncelikli olmalı");
assert.ok(representativeFootSelection.choices.length > 2, "Önerilen profil dışında uygun diğer ayak tipleri de seçilebilir olmalı");
assert.equal(representativeFootSelection.recommendedChoices.length, 4, "Normal ayak listesinde iki Ly sistemi için ikişer öneri, toplam dört profil bulunmalı");
assert.equal(representativeFootSelection.recommendedChoices.filter((choice) => choice.ly === 1200).length, 2, "Ly 1.200 sistemi iki profil önermeli");
assert.equal(representativeFootSelection.recommendedChoices.filter((choice) => choice.ly === 600).length, 2, "Ly 600 sistemi iki profil önermeli");
for (const ly of [1200, 600]) {
  const systemRecommendations = representativeFootSelection.recommendedChoices.filter((choice) => choice.ly === ly);
  assert.equal(systemRecommendations[0].thickness, 1.5, `Ly ${ly} ilk önerisi Ayak Hesabı kuralıyla uygun 1,5 mm profil olmalı`);
  assert.notEqual(systemRecommendations[1].thickness, 1.5, `Ly ${ly} ikinci önerisi Ayak Hesabı kuralıyla 1,5 mm olmamalı`);
  assert.equal(systemRecommendations[1].profile, "HR90.80.2,0", `Ly ${ly} ikinci önerisi 1,5 mm dışındaki en hafif uygun profil olmalı`);
}
assert.ok(representativeFootSelection.allChoices.length >= representativeFootSelection.choices.length && representativeFootSelection.allChoices.length > representativeFootSelection.recommendedChoices.length, "Manuel listede önerilenlerin dışındaki bütün ayak profilleri de bulunmalı");
const portalDrawStart = portal.indexOf("function drawMekik2(event)");
const portalDrawEnd = portal.indexOf("\n      function resetShuttleResult", portalDrawStart);
assert.notEqual(portalDrawStart, -1, "Canlı Mekik 2 çizim fonksiyonu bulunamadı");
assert.notEqual(portalDrawEnd, -1, "Canlı Mekik 2 çizim fonksiyonunun sonu bulunamadı");
vm.runInContext(portal.slice(portalDrawStart, portalDrawEnd), palletLayoutContext);
palletLayoutContext.drawMekik2();
const portalTopSvg = portalNodeFor("m2Top").innerHTML;
assert.equal(palletLayoutContext.m2LastDrawing.totalPalletLoad, 16000, "Çizimde toplam yük 1.000 kg × 4 palet × 4 kat olarak hesaplanmalı");
assert.equal(
  palletLayoutContext.m2LastDrawing.footLoad,
  Math.floor(
    palletLayoutContext.m2LastDrawing.totalPalletLoad /
      (palletLayoutContext.m2LastDrawing.railLength / 1000) *
      ((palletLayoutContext.m2LastDrawing.deepestFoot + palletLayoutContext.m2LastDrawing.deepestBrace) / 2) *
      2 /
      1000,
  ),
  "Ayak başı yük bölüm ağırlığı, ray uzunluğu ve en derin ayak/arabağ ölçülerini kullanan yeni formülü izlemeli",
);
assert.equal(palletLayoutContext.m2LastDrawing.footProfile, "HR90.80.1,5", "İlk açılışta en iyi uygun ayak tipi otomatik seçilmeli");
assert.equal(palletLayoutContext.m2LastDrawing.railThickness, 2.5, "1.000 kg palet için 2,5 mm ray önerilmeli");
assert.equal(palletLayoutContext.m2LastDrawing.railHeight, 150, "Ray yüksekliği varsayılan olarak 150 mm başlamalı");
portalNodeFor("m2RailHeight").value = 170;
palletLayoutContext.drawMekik2({ target: portalNodeFor("m2RailHeight") });
assert.equal(portalNodeFor("m2LevelSpacing").value, "1600", "Ray 170 mm seçilince iki palet arası mesafe bir kez 20 mm artmalı");
assert.equal(palletLayoutContext.m2LastDrawing.levelH, 1600, "170 mm rayın +20 mm farkı hesap ve çizim verisine uygulanmalı");
portalNodeFor("m2RailHeight").value = 150;
palletLayoutContext.drawMekik2({ target: portalNodeFor("m2RailHeight") });
assert.equal(portalNodeFor("m2LevelSpacing").value, "1580", "Ray tekrar 150 mm seçilince eklenen 20 mm geri alınmalı");
portalNodeFor("m2PalletWeight").value = 800; palletLayoutContext.drawMekik2();
assert.equal(palletLayoutContext.m2LastDrawing.railThickness, 2, "800 kg palet için 2 mm ray önerilmeli");
portalNodeFor("m2PalletWeight").value = 1200; palletLayoutContext.drawMekik2();
assert.equal(palletLayoutContext.m2LastDrawing.railThickness, 2.5, "1.200 kg palet için 2,5 mm ray önerilmeli");
portalNodeFor("m2PalletWeight").value = 1500; palletLayoutContext.drawMekik2();
assert.equal(palletLayoutContext.m2LastDrawing.railThickness, 3, "1.500 kg palet için 3 mm ray önerilmeli");
portalNodeFor("m2PalletWeight").value = 1000; palletLayoutContext.drawMekik2();
assert.match(portalNodeFor("m2FootRecommendation").innerHTML, /ÖNERİLEN AYAK/, "İlk hesaplamada otomatik seçilen profil önerilen ayak olarak başta gösterilmeli");
assert.match(portalTopSvg, /class="m2-top-v-brace-selector active"[^>]*data-v-brace-bay="1"/, "Seçilen ilk bölümün V çaprazı görünür olmalı");
assert.match(portalTopSvg, /data-v-brace-layout="upright-center-to-upright-center"/, "Görünür çapraz ayak profili merkezlerine bağlanmalı");
assert.equal((portalNodeFor("m2FootProfile").innerHTML.match(/<option/g) || []).length, representativeFootSelection.recommendedChoices.length, "Normal açılır listede yalnız önerilen ayaklar görünmeli");
assert.doesNotMatch(portalNodeFor("m2FootProfile").innerHTML, /UYGUN|YETERSİZ/, "Normal listede önerilmeyen ayaklar görünmemeli");
assert.match(portalNodeFor("m2FootProfile").innerHTML, /1\. ÖNERİ · HR/, "İlk öneri sade başlıkla listelenmeli");
assert.match(portalNodeFor("m2FootProfile").innerHTML, /2\. ÖNERİ · HR/, "İkinci öneri sade başlıkla listelenmeli");
assert.doesNotMatch(portalNodeFor("m2FootProfile").innerHTML, /ÖNCELİKLİ|DIŞI/, "Öneri listesinde kalınlık önceliği/dışı açıklaması bulunmamalı");
assert.equal(portalNodeFor("m2FootManualButton").textContent, "Manuel Seç", "Ayak listesinin yanında Manuel Seç düğmesi görünmeli");
palletLayoutContext.m2ToggleFootManualList();
assert.equal((portalNodeFor("m2FootProfile").innerHTML.match(/<option/g) || []).length, representativeFootSelection.allChoices.length, "Manuel Seç açılınca bütün ayaklar listelenmeli");
assert.match(portalNodeFor("m2FootProfile").innerHTML, /UYGUN|YETERSİZ/, "Manuel listede önerilmeyen profiller kapasite durumuyla işaretlenmeli");
const alternateFoot = representativeFootSelection.choices.find((choice) => choice.key !== representativeFootSelection.primary.key);
portalNodeFor("m2FootProfile").value = alternateFoot.key;
palletLayoutContext.drawMekik2({ target: portalNodeFor("m2FootProfile") });
assert.equal(palletLayoutContext.m2LastDrawing.footProfileKey, alternateFoot.key, "Kullanıcı açılır listeden başka uygun ayak tipini seçebilmeli");
assert.equal(palletLayoutContext.m2LastDrawing.footType, alternateFoot.width, "Elle seçilen profil genişliği görünüş geometrisine uygulanmalı");
const portalSideSvg = portalNodeFor("m2Side").innerHTML;
assert.match(portalSideSvg, /data-side-dimensions="visible-small-text"/, "Canlı yan görünüşte ölçüler görünür olmalı");
assert.doesNotMatch(portalSideSvg, /ayak2-glb-side-projection|m2-side-frame--ayak2-glb/, "Canlı yan görünüş dikmeleri AYAK2 görsel tipine dönüşmemeli");
assert.match(portalSideSvg, /class="m2-side-upright"/, "Canlı yan görünüş eski vektör dikmelerini kullanmalı");
assert.match(portalSideSvg, /class="m2-side-overall-dimension"/, "Canlı yan görünüşte yükseklik ölçüleri çizilmeli");
assert.doesNotMatch(portalSideSvg, /class="m2-side-first-rail"|İLK KAT · 430 mm/, "Canlı yan görünüşte geri alınan ilk kat ölçüsü görünmemeli");
assert.match(portalSideSvg, /class="m2-side-gap-dimension"/, "Canlı yan görünüşte palet arası ölçüler çizilmeli");
assert.equal((portalSideSvg.match(/class="m2-side-gap-segment"/g) || []).length, 3, "Canlı yan görünüşte her FIFO aralığı ayrı ölçü segmenti olmalı");
assert.match(portalSideSvg, /data-spacing-overlay="removed"/, "Canlı yan görünüşte palet üstü filigran katmanı kaldırılmalı");
assert.doesNotMatch(portalSideSvg, /m2-side-depth-gap-zone|m2-side-vertical-clearance-zone/, "Canlı yan görünüşte sarı noktalı yardımcı alanlar görünmemeli");
assert.match(portalSideSvg, />200 mm × 2 · 50 mm</, "FIFO uç ve ara boşlukları küçük ve toplu etiketlenmeli");
portalNodeFor("m2FirstPalletGap").value = 350;
portalNodeFor("m2PalletGap").value = 120;
palletLayoutContext.drawMekik2();
assert.equal(portalNodeFor("m2RailResult").textContent, "4.820 mm", "Özelleştirilmiş aralıklar ray ölçüsünü canlı güncellemeli");
assert.match(portalNodeFor("m2Side").innerHTML, /data-pallet-gaps-mm="350,120,350"/, "Özelleştirilmiş aralıklar yan görünüş palet geometrisine uygulanmalı");
portalNodeFor("m2FootLoadStart").value = "first";
palletLayoutContext.drawMekik2();
assert.equal(palletLayoutContext.m2LastDrawing.loadedLevels, 3, "1. Kat seçilince dört katlı rafta üç kat yüklenmiş sayılmalı");
assert.equal(palletLayoutContext.m2LastDrawing.totalPalletLoad, 12000, "1. Kat seçiminde toplam yükten bir katın palet yükü çıkarılmalı");
assert.equal(
  palletLayoutContext.m2LastDrawing.footLoad,
  palletLayoutContext.m2CalculateFootLoad(
    palletLayoutContext.m2LastDrawing.totalPalletLoad,
    palletLayoutContext.m2LastDrawing.railLength,
    palletLayoutContext.m2LastDrawing.deepestFoot,
    palletLayoutContext.m2LastDrawing.deepestBrace,
  ),
  "Ayak seçimi bir kat eksiltilmiş bölüm ağırlığını yeni ayak başı yük formülüyle kullanmalı",
);
assert.equal(palletLayoutContext.m2LastDrawing.footCalculationHeight, 2010, "1. Kat seçiminde 430 + 1.580 mm ile alttan ikinci traversin üst kotu hesaplanmalı");
assert.match(portalNodeFor("m2FootFirstLevelSummary").textContent, /alttan 2\. traversin üst kotuna: 2\.010 mm · 1 kat yükten çıkarıldı/, "Ayak hesabında kullanılan ikinci travers üst kotu ve eksiltilen kat kullanıcıya gösterilmeli");
portalNodeFor("m2FirstLevelHeight").value = 520;
portalNodeFor("m2LevelSpacing").value = 1700;
palletLayoutContext.drawMekik2();
assert.equal(palletLayoutContext.m2LastDrawing.firstRailHeight, 520, "Elle girilen ilk kat yüksekliği çizim verisine uygulanmalı");
assert.equal(palletLayoutContext.m2LastDrawing.levelH, 1700, "Elle girilen iki palet arası dikey mesafe çizim verisine uygulanmalı");
assert.equal(palletLayoutContext.m2LastDrawing.footCalculationHeight, 2220, "Özelleştirilmiş ölçülerde 1. Kat ayak hesabı ikinci traversin güncel üst kotunu kullanmalı");
assert.equal(palletLayoutContext.m2LastDrawing.clearance, 420, "Özelleştirilmiş kat aralığında net üst boşluk geometriyle tutarlı hesaplanmalı");
assert.doesNotMatch(portalNodeFor("m2Side").innerHTML, /İLK KAT · 520 mm/, "Canlı yan görünüşte ilk kat ölçüsü geri gelmemeli");
assert.match(portalNodeFor("m2Front").innerHTML, /ZEMİN · 520 mm/, "Canlı ön görünüş zemin ile ilk taşıyıcı kotunu göstermeli");
assert.match(portalNodeFor("m2Front").innerHTML, /K1 · 1\.700 mm/, "Canlı ön görünüş paletli kat numarasını K1 ile başlatmalı");
assert.match(portalNodeFor("m2Front").innerHTML, /K2 · 1\.700 mm/, "Canlı ön görünüş özelleştirilmiş kat aralığını K2 önekiyle göstermeli");

assert.match(portal, /palletHeight: source\.palletHeight/, "Yerleşime eklenen raf palet yüksekliğini korumalı");
assert.match(portal, /palletGaps: \[\.\.\.\(source\.palletGaps \|\| \[\]\)\]/, "Yerleşime eklenen raf palet aralıklarını korumalı");
assert.match(portal, /palletHeight:rack\.palletHeight/, "Yatay A4 yan görünüşü rafın palet yüksekliğini kullanmalı");
assert.match(portal, /palletGaps:\[\.\.\.\(rack\.palletGaps \|\| \[\]\)\]/, "Yatay A4 yan görünüşü rafın ara mesafelerini korumalı");

const addStart = source.indexOf("function insertBeforeLastScriptClose(htmlSource, scriptSource)");
const addEnd = source.indexOf("\nconst json", addStart);
assert.notEqual(addStart, -1, "Mekik betiğini son uygulama betiğine ekleyen yardımcı bulunamadı");
assert.notEqual(addEnd, -1, "addMekik2 sonu bulunamadı");
const addContext = vm.createContext({
  MEKIK2_CSS: ".m2-technical-front-test{}",
  MEKIK2_SCRIPT: "function renderMekik2(){} function drawMekik2(){}",
  M2_AYAK2_FRONT_BASE64: "AYAK2_FRONT_TEST",
});
vm.runInContext(source.slice(addStart, addEnd), addContext);
const composedPortal = addContext.addMekik2(portal);
assert.match(composedPortal, /Ayak \/ düz arabağ dağılımı/, "Raf ölçüleri paneli korunmalı");
assert.match(composedPortal, /Serbest Yerleşim Alanı/, "Serbest yerleşim korunmalı");
assert.match(composedPortal, /Yatay A4 Proje Sayfası/, "Yatay A4 raporu korunmalı");
assert.match(composedPortal, /<script defer src="\/b2b-viewer\.js\?v=b2b-custom-tunnel-ties-366"><\/script>/, "B2B 3D betiği yerel kaynakta temiz ve değişmeden kalmalı");
assert.ok(composedPortal.indexOf("var m2TechnicalNodes") > composedPortal.lastIndexOf("<script>"), "Mekik ön görünüş bağlantısı ana uygulama betiğinin içinde olmalı");
assert.match(composedPortal, /function m2TechnicalRenderMekik2\(\)/, "Teknik ön görünüş ayrı ad alanında çalışmalı");
assert.match(composedPortal, /data-preserved-enhanced-front/, "GLB ölçülü ön görünüş korunmalı");
assert.equal((composedPortal.match(/function renderMekik2\(/g) || []).length, 1, "Tam sayfa renderer'ı ikinci kez tanımlanmamalı");

const marker = "const MEKIK2_SCRIPT = String.raw`";
const start = source.indexOf(marker);
assert.notEqual(start, -1, "MEKIK2_SCRIPT bulunamadı");
const bodyStart = start + marker.length;
const bodyEnd = source.indexOf("\n`;", bodyStart);
assert.notEqual(bodyEnd, -1, "MEKIK2_SCRIPT sonu bulunamadı");

const values = {
  m2Bays: 4,
  m2Levels: 4,
  m2Depth: 8,
  m2Feet: 8,
  m2PalW: 1300,
  m2PalD: 1000,
  m2LevelH: 1200,
  m2FirstLevelHeight: 430,
  m2LevelSpacing: 1580,
};
const nodes = new Map();
function nodeFor(id) {
  if (!nodes.has(id)) {
    nodes.set(id, {
      value: values[id],
      textContent: "",
      innerHTML: "",
      setAttribute() {},
    });
  }
  return nodes.get(id);
}
const context = vm.createContext({
  $: nodeFor,
  fmt: (value) => new Intl.NumberFormat("tr-TR").format(value),
  Number,
  Math,
});
vm.runInContext(source.slice(bodyStart, bodyEnd), context);

const data = context.m2RackData();
const svg = context.m2SideSvg(data);
context.drawMekik2();
const topSvg = nodeFor("m2Top").innerHTML;
const frontSvg = nodeFor("m2Front").innerHTML;

assert.equal(data.lastRail, 5170, "Son palet kotu yanlış hesaplandı");
assert.equal(data.frameHeight, 5770, "Ayak boyu en üst paletin orta kotunda bitmeli");
assert.equal(data.heightFormula, "430 + (3 × 1580) + (1200 / 2)", "Boy formülü elle girilen ilk kat ve kat aralığını açıkça izlemeli");
assert.equal(data.sideClearance, 75, "Paletin iki yanında 75 mm boşluk kalmalı");
assert.equal(data.bayPitch, 1450, "1300 mm palet için göz aksı 1450 mm olmalı");
assert.equal(data.totalWidth, 5800, "Dört gözün toplam aks genişliği yanlış");
assert.match(topSvg, /data-top-layout="legacy-technical"/);
assert.match(topSvg, /Üst Görünüş/);
assert.equal(data.pitch, 1050, "Teknik görünüşte standart 50 mm palet boşluğu korunmalı");
assert.match(topSvg, /Derinlik: 7\.350 mm/);
assert.match(topSvg, /4 göz · toplam genişlik 5\.800 mm/);
assert.match(topSvg, /ARABAĞ/);
assert.equal((topSvg.match(/class="m2-pallet-model"/g) || []).length, 32, "Üst görünüşte tüm paletler çizilmeli");
assert.match(svg, /data-last-pallet-mm="5170"/);
assert.match(svg, /data-frame-height-mm="5770"/);
assert.match(svg, /data-vertical-direction="ground-bottom-levels-up"/);
assert.doesNotMatch(svg, /180 derece|180°|AYAK TABANLARI ÜSTTE/);
assert.match(svg, /ZEMİN · AYAK TABANLARI ALTTA/);
assert.match(svg, /data-diagonal-layout="ayak-glb-frames"/);
assert.match(svg, /data-brace-rise-mm="655"/);
assert.match(svg, /data-braced-frames="4"/);
assert.match(svg, /class="m2-side-last-pallet-dimension" data-measure-mm="5770"/);
assert.match(svg, /AYAK UZUNLUĞU/);
assert.match(svg, />5\.770 mm</);

const diagonalCount = (svg.match(/class="m2-side-diagonal"/g) || []).length;
const bracedFrameCount = (svg.match(/class="m2-side-braced-frame"/g) || []).length;
assert.equal(bracedFrameCount, 4, "Sekiz dikme dört AYAK GLB çerçevesi oluşturmalı");
assert.equal(diagonalCount, 36, "Diyagonaller AYAK M GLB modelindeki 655 mm adımlı kesintisiz örgüyü izlemeli");

assert.match(frontSvg, /data-front-layout="glb-exact-traverse"/);
assert.match(frontSvg, /data-upright-finish="galvanized"/, "Ön görünüş ayakları galvaniz renkte olmalı");
assert.match(frontSvg, /data-upright-style="ayak2-glb-front-projection"/, "Ön görünüş ayakları AYAK2 GLB ön izdüşümünü kullanmalı");
assert.equal((frontSvg.match(/class="m2-front-upright m2-front-upright--ayak2-glb"/g) || []).length, 5, "Her aks çizimde AYAK2 GLB ayağı olarak görünmeli");
assert.equal((frontSvg.match(/data-glb-source="AYAK2\.glb"/g) || []).length, 5, "Her ön görünüş ayağı yüklenen AYAK2 GLB kaynağına bağlı olmalı");
assert.match(frontSvg, /<image href="data:image\/png;base64,[^"]+"/, "AYAK2 GLB'nin gerçek ön izdüşümü çizime gömülmeli");
assert.match(frontSvg, /data-traverse-finish="yellow"/, "Ön görünüş traversleri sarı olmalı");
assert.match(frontSvg, /data-pallet-style="side-view-matched"/, "Ön görünüş paletleri yan görünüş tipiyle eşleşmeli");
assert.match(frontSvg, /fill="url\(#m2fronttraverse\)"/, "Ön görünüş travers geometrisi sarı travers dolgusunu kullanmalı");
assert.match(frontSvg, /fill="#d7a44f" stroke="#744719"/, "Ön görünüş yük/palet rengi yan görünüşle eşleşmeli");
assert.match(frontSvg, /data-pallet-width-mm="1300"/);
assert.match(frontSvg, /data-bay-pitch-mm="1450"/);
assert.match(frontSvg, /data-traverse-connector-mm="42x240"/);
assert.doesNotMatch(frontSvg, /m2-front-traverse-detail|TRAVERS MEKİK · DOĞRU MONTAJ YÖNÜ/, "İstenmeyen travers bilgi kartı görünmemeli");
assert.match(frontSvg, /KOLON ARALIĞI · 1\.450 mm/);
assert.match(frontSvg, /PALET · 1\.300 mm/);
assert.match(frontSvg, /YAN BOŞLUK · 75 \+ 75 mm/);
assert.doesNotMatch(frontSvg, /opacity="\.13" stroke="#d5aa00" stroke-dasharray="3 2"/, "Ön görünüşte filigran gibi görünen sarı alan kalmamalı");
assert.match(frontSvg, /KOT ARALIKLARI/);
assert.doesNotMatch(frontSvg, /RAY KOTLARI · ZEMİNDEN/);
assert.match(frontSvg, /data-level-dimension-labels="plain-unboxed"/, "Canlı teknik ön görünüşte kat ölçü yazıları kutusuz olmalı");
assert.match(frontSvg, /data-dimension-witness-style="dashed-to-target"/, "Canlı teknik ön görünüşte hedef çizgileri kesik olmalı");
assert.match(frontSvg, /class="m2-front-dimension-witness"[^>]*stroke-dasharray="3 4"/, "Canlı teknik ölçü hedefleri noktalı/kesik çizgiyle bağlanmalı");
assert.doesNotMatch(frontSvg, /class="m2-front-level-interval"[^>]*>(?:(?!<\/g>)[\s\S])*?<rect/, "Canlı teknik kat ölçülerinin çevresinde dikdörtgen olmamalı");
assert.match(frontSvg, /ZEMİN · 430 mm/);
assert.match(frontSvg, /K1 · 1\.580 mm/);
assert.match(frontSvg, /K2 · 1\.580 mm/);
assert.doesNotMatch(frontSvg, /class="m2-front-floor-label"|data-floor="K4"/, "Kat adları ayrı palet hizası etiketleri olmamalı");
assert.equal((frontSvg.match(/class="m2-front-level-interval"/g) || []).length, 4, "Dört katta ilk kat dahil dört doğrudan ölçü olmalı");
assert.equal((frontSvg.match(/data-measure-mm="430"/g) || []).length, 1, "İlk kat yüksekliği ayrı ölçü olarak gösterilmeli");
assert.equal((frontSvg.match(/data-measure-mm="1580"/g) || []).length, 3, "1200 mm palet yüksekliğinde bütün kat aralıkları 1580 mm olmalı");
assert.doesNotMatch(frontSvg, /K4 · 5\.170 mm/, "Kümülatif ray kotları kaldırılmalı");
assert.match(frontSvg, /İKİ PALET ARASI DİKEY MESAFE/);
assert.match(frontSvg, /1\.580 mm · net üst boşluk 300 mm/);
assert.match(frontSvg, /class="m2-front-overall-dimension" data-measure-mm="5770"/);
assert.match(frontSvg, /data-profile-height-mm="80"/);
assert.doesNotMatch(frontSvg, /1\.342 × 80 mm · CC100 42 × 63 × 240 mm|travers ön yüzü 1\.342 × 80 mm · taban sacı 4 mm/, "Travers açıklama metinleri kaldırılmalı");
assert.equal((frontSvg.match(/data-profile-height-mm="80"/g) || []).length, 16, "Tüm raf traverslerinde profil yüksekliği 80 mm olmalı");
assert.equal((frontSvg.match(/class="m2-front-traverse"/g) || []).length, 16, "Her göz ve katta bir GLB traversi çizilmeli");
assert.equal((frontSvg.match(/data-orientation="connectors-up-profile-below"/g) || []).length, 16, "Travers profilinin altında, bağlantıların yukarı yönlü montajı korunmalı");
assert.equal((frontSvg.match(/class="m2-front-traverse-connector"/g) || []).length, 32, "Her travers iki adet 42 x 240 mm bağlantı plakası taşımalı");
assert.equal((frontSvg.match(/class="m2-front-ray-ends"/g) || []).length, 16, "Raylar önden tam genişlikte kiriş değil, uç kesiti olarak görünmeli");
assert.equal((frontSvg.match(/data-support-height-mm="250"/g) || []).length, 16, "Palet altındaki iki taşıyıcı parça GLB'deki 250 mm üst montaj yüksekliğini izlemeli");
assert.match(frontSvg, /data-load-style="plain-sharp"/, "Ön görünüşte palet ve kutu köşeleri keskin olmalı");
assert.doesNotMatch(frontSvg, /m2-front-load[^>]*>[\s\S]*?<path[^>]+stroke="#85541f"|m2-side-pallet-detail|m2-side-load-detail/, "Palet ve kutuların iç dekoratif çizgileri olmamalı");

const renderIndex = process.argv.indexOf("--render");
if (renderIndex !== -1) {
  const output = process.argv[renderIndex + 1];
  assert.ok(output, "--render için çıktı yolu gerekli");
  // Inkscape's headless renderer does not support feDropShadow; remove only the
  // filter attributes from the QA copy so the underlying rack geometry stays visible.
  fs.writeFileSync(output, svg.replace(/ filter="url\(#[^)]+\)"/g, ""));
}

const frontRenderIndex = process.argv.indexOf("--render-front");
if (frontRenderIndex !== -1) {
  const output = process.argv[frontRenderIndex + 1];
  assert.ok(output, "--render-front için çıktı yolu gerekli");
  fs.writeFileSync(output, frontSvg.replace(/ filter="url\(#[^)]+\)"/g, ""));
}

const topRenderIndex = process.argv.indexOf("--render-top");
if (topRenderIndex !== -1) {
  const output = process.argv[topRenderIndex + 1];
  assert.ok(output, "--render-top için çıktı yolu gerekli");
  fs.writeFileSync(output, topSvg);
}

const portalTopRenderIndex = process.argv.indexOf("--render-portal-top");
if (portalTopRenderIndex !== -1) {
  const output = process.argv[portalTopRenderIndex + 1];
  assert.ok(output, "--render-portal-top için çıktı yolu gerekli");
  const qaStyles = `<style>.m2-label{fill:#111827;font:800 12px Arial}.m2-dim{fill:#64748b;font:700 9px Arial}.m2-dimension{stroke:#64748b;stroke-width:1}.m2-top-v-brace-hit{fill:#f2c500;fill-opacity:.045;stroke:#d5aa00;stroke-width:1}.m2-top-v-brace-profile{fill:none;stroke:#b57d00;stroke-width:4.2;stroke-linecap:round;stroke-linejoin:round}.m2-top-v-brace-control{fill:#fff8cf;stroke:#b57d00;stroke-width:1.2}.m2-top-v-brace-selector text{fill:#6b4b00;font:900 10px Arial}.m2-straight-brace{stroke:#64748b;stroke-width:1}.m2-part-label{font:900 8px Arial}.m2-pallet-surface{fill:#d7a44f;stroke:#744719}</style>`;
  const standalone = portalTopSvg.replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/^(<svg[^>]*>)/, `$1<rect width="100%" height="100%" fill="#f7faf8"/>${qaStyles}`);
  fs.writeFileSync(output, standalone);
}

const portalSideRenderIndex = process.argv.indexOf("--render-portal-side");
if (portalSideRenderIndex !== -1) {
  const output = process.argv[portalSideRenderIndex + 1];
  assert.ok(output, "--render-portal-side için çıktı yolu gerekli");
  const qaStyles = `<style>.m2-label{fill:#17201b;font:800 14px Arial}.m2-dim{fill:#536058;font:700 9px Arial}.m2-side-dimension-line,.m2-side-dimension-tick{fill:none;stroke:#64748b;stroke-width:1.25}.m2-side-overall-label{fill:#334155;font:800 8px Arial;paint-order:stroke;stroke:#fff;stroke-width:3px}.m2-side-first-rail rect{fill:#173c2d;stroke:#173c2d}.m2-side-first-rail text{fill:#fff;font:900 8px Arial}.m2-side-gap-dimension line{stroke:#d59c00;stroke-width:1.2}.m2-side-gap-dimension rect{fill:#fff8cf;stroke:#d59c00;stroke-width:1}.m2-side-gap-dimension text{fill:#5e4b00;font:900 7.5px Arial}.m2-side-spacing-badge rect{fill:#173c2d}.m2-side-spacing-badge text{fill:#fff;font:900 10px Arial}.m2-dimension{fill:none;stroke:#52606d;stroke-width:1.2}</style>`;
  const standalone = portalSideSvg.replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/^(<svg[^>]*>)/, `$1<rect width="920" height="610" fill="#f7faf8"/>${qaStyles}`);
  fs.writeFileSync(output, standalone);
}

console.log(`Mekik 2 doğrulandı: 1300 mm palet, ${data.bayPitch} mm göz aksı, gerçek 42 x 240 mm travers plakaları ve okunaklı ölçü zinciri.`);
