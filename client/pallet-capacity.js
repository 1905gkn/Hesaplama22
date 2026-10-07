/* pallet-capacity-v280 */
function rafexPalletCapacity(drawing){
  if(!drawing)return 0;
  const layout=drawing.b2bLayout,b=drawing.b2b||{};
  const ordinary=layout?(Number(layout.palletCount)||0)*(Number(drawing.levels)||0)*(Number(layout.rowCount)||1):(Number(drawing.bays)||0)*(Number(drawing.levels)||0)*(Number(drawing.depth)||0);
  if(!layout||b.mr||!(Number(b.tunnelHeight)>0||Number(drawing.b2bViewerOptions?.tunnelHeight)>0))return ordinary;
  const options=window.rafexReadRackDetailV135?.(drawing,'b2b')||window.rafexB2BDetailOptionsV117?.(drawing)||drawing.b2bViewerOptions||m2Rack3DOptions(drawing);
  if(typeof window.RafexB2BViewer?.palletCapacity!=='function')throw Error('Palet kapasitesi için B2B çizim modülü henüz hazır değil.');
  return window.RafexB2BViewer.palletCapacity({...options,moduleCount:1,palletCount:Number(layout.palletCount)||Number(options.palletCount)||1,rowType:Number(layout.rowCount)===2?'double':'single',levels:Number(drawing.levels)||Number(options.levels)||1,tunnelHeight:Number(b.tunnelHeight)||Number(options.tunnelHeight)||0});
}
