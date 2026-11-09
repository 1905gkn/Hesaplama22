export const dimensionNumber = text => String(text ?? '').replace(/\s*\bmm\b/gi, '').trim();
export function dimensionUnitNotice(language='tr') {
 return ({en:'All drawing dimensions are in millimetres (mm).',fr:'Toutes les cotes du dessin sont en millimètres (mm).',tr:'Çizimdeki tüm ölçüler milimetre (mm) cinsindedir.'})[String(language).slice(0,2)] || 'Çizimdeki tüm ölçüler milimetre (mm) cinsindedir.';
}
