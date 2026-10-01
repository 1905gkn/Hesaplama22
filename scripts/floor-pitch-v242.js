function b2bSyncPitchV242(){
 const p=$('b2bPalletHeight'),total=$('b2bFloorPitchV242'),button=$('b2bPitchButtonV242'),note=$('b2bPitchNoteV242');
 if(!p||!total)return true;
 const active=total.dataset.active==='1',manual=Boolean(window.rafexMainManualActiveV242?.());
 if(button.disabled!==manual)button.disabled=manual;if(button.getAttribute('aria-pressed')!==String(active))button.setAttribute('aria-pressed',String(active));if(total.hidden===active)total.hidden=!active;if(note.hidden===active)note.hidden=!active;
 if(p.readOnly!==(active||manual))p.readOnly=active||manual;
 if(!active){total.setCustomValidity('');return true;}
 const beam=Number(b2bTraverseHeight()),gap=Number(b2bPalletTraverseGap),pitch=Number(total.value),height=pitch-beam-gap;
 const valid=total.value.trim()!==''&&Number.isFinite(height)&&height>=300&&height<=3000;
 const message=valid?'':'Kat mesafesi '+(beam+gap+300)+'–'+(beam+gap+3000)+' mm arasında olmalıdır (palet yüksekliği 300–3.000 mm).';
 total.setCustomValidity(message);const text=valid?'Toplam '+pitch+' − '+beam+' travers − '+gap+' boşluk = '+height+' mm palet':message;if(note.textContent!==text)note.textContent=text;
 const color=valid?'':'rgb(173, 21, 46)';if(note.style.color!==color)note.style.color=color;
 if(valid){p.value=String(height);if(!b2bLastOverlapManual)b2bLastPalletOverlap=Math.round(height/2);}
 return valid;
}
function b2bTogglePitchV242(){
 const p=$('b2bPalletHeight'),total=$('b2bFloorPitchV242');if(!p||!total||window.rafexMainManualActiveV242?.())return;
 const active=total.dataset.active!=='1';
 if(active){total.dataset.pallet=p.value;total.value=String(Number(p.value)+Number(b2bTraverseHeight())+Number(b2bPalletTraverseGap));}
 else p.value=total.dataset.pallet||p.value;
 total.dataset.active=active?'1':'0';b2bSyncPitchV242();b2bApplyInputs({target:p});if(active)total.focus();
}
