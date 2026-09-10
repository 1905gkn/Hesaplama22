export const shortcutRuntime=String.raw`<script data-rafex-shortcuts="v122">
(function(){
 const mappings={s:'#m2SelectRackButton',o:'#m2CustomizeRackButton',d:'button[onclick="m2RotateRack()"]',z:'#m2UndoButton',v:'button[onclick="m2DuplicateRack()"]'};
 window.addEventListener('keydown',function(event){
  const key=String(event.key||'').toLowerCase(),modified=event.ctrlKey||event.metaKey;
  if(event.altKey||event.shiftKey||!(key==='o'?!modified:modified&&mappings[key]))return;
  if(event.target?.closest?.('input,textarea,select,[contenteditable="true"],[role="textbox"]'))return;
  const drawing=document.getElementById('m2LayoutSvg'),picker=document.getElementById('rafexUnifiedSystemPicker');
  if(!drawing?.getClientRects().length||!picker?.getClientRects().length)return;
  if([...document.querySelectorAll('dialog[open],[id$="Modal"]')].some(el=>el.getClientRects().length))return;
  const button=document.querySelector(mappings[key]);if(!button||!button.getClientRects().length)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(event.repeat||button.disabled)return;
  if((key==='s'||key==='o')&&button.classList.contains('active'))return;
  button.click();
 },true);
})();</script>`;

