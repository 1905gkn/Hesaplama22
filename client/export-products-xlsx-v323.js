/* export-products-xlsx-v323: OOXML workbook; codes are text, quantities numeric. */
(function(root){
  'use strict';
  const encoder=new TextEncoder();
  const xml=value=>String(value??'').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  function crc(bytes){let value=0xffffffff;for(const byte of bytes){value^=byte;for(let n=0;n<8;n++)value=(value>>>1)^((value&1)?0xedb88320:0);}return (value^0xffffffff)>>>0;}
  function zip(files){
    const chunks=[],directory=[];let offset=0;
    function header(size,signature){const bytes=new Uint8Array(size);new DataView(bytes.buffer).setUint32(0,signature,true);return bytes;}
    for(const [name,text] of files){
      const filename=encoder.encode(name),data=encoder.encode(text),checksum=crc(data),local=header(30,0x04034b50),v=new DataView(local.buffer);
      v.setUint16(4,20,true);v.setUint32(14,checksum,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,filename.length,true);
      chunks.push(local,filename,data);
      const central=header(46,0x02014b50),c=new DataView(central.buffer);
      c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint32(16,checksum,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,filename.length,true);c.setUint32(42,offset,true);
      directory.push(central,filename);offset+=local.length+filename.length+data.length;
    }
    const directoryLength=directory.reduce((sum,b)=>sum+b.length,0),end=header(22,0x06054b50),e=new DataView(end.buffer);
    e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,directoryLength,true);e.setUint32(16,offset,true);
    const all=[...chunks,...directory,end],out=new Uint8Array(offset+directoryLength+22);let cursor=0;for(const part of all){out.set(part,cursor);cursor+=part.length;}return out;
  }
  function workbook(rows){
    const ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
    const textCell=(ref,text,style=0)=>'<c r="'+ref+'" t="inlineStr" s="'+style+'"><is><t xml:space="preserve">'+xml(text)+'</t></is></c>';
    const header=['ÜRÜN','KOD','ÖLÇÜ / TANIM','ADET'];
    const data='<row r="1">'+header.map((h,i)=>textCell('ABCD'[i]+'1',h,1)).join('')+'</row>'+rows.map((row,index)=>{
      const n=index+2,parts=root.rafexProductCodeRulesV322.split(row.spec),qty=Number(row.qty);
      if(!Number.isFinite(qty)||qty<0)throw Error('Geçersiz ürün adedi');
      return '<row r="'+n+'">'+textCell('A'+n,row.name||row.item)+textCell('B'+n,parts.code||'—')+textCell('C'+n,parts.description||'—')+'<c r="D'+n+'" s="2"><v>'+qty+'</v></c></row>';
    }).join('');
    return zip([
      ['[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
      ['_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ['xl/workbook.xml','<workbook xmlns="'+ns+'" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Ürün Listesi" sheetId="1" r:id="rId1"/></sheets></workbook>'],
      ['xl/_rels/workbook.xml.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
      ['xl/styles.xml','<styleSheet xmlns="'+ns+'"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0B2B45"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="3"><xf fontId="0" fillId="0" borderId="0" xfId="0"><alignment vertical="top" wrapText="1"/></xf><xf fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'],
      ['xl/worksheets/sheet1.xml','<worksheet xmlns="'+ns+'"><dimension ref="A1:D'+(rows.length+1)+'"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="25" customWidth="1"/><col min="2" max="2" width="28" customWidth="1"/><col min="3" max="3" width="70" customWidth="1"/><col min="4" max="4" width="14" customWidth="1"/></cols><sheetData>'+data+'</sheetData><autoFilter ref="A1:D'+(rows.length+1)+'"/></worksheet>']
    ]);
  }
  root.rafexProductWorkbookV323=workbook;
  if(typeof document==='undefined')return;
  document.addEventListener('click',function(event){
    const button=event.target.closest?.('#rafexExportProductsV323');if(!button)return;
    try{
      const rows=root.rafexLayoutInventoryRowsV44?.()||[];
      if(!rows.length){alert('Aktarılacak ürün bulunamadı. Önce yerleşime raf ekleyin.');return;}
      const name=(document.getElementById('rafexAuthorityProjectName')?.value||'Rafex').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,100);
      const url=URL.createObjectURL(new Blob([workbook(rows)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
      const link=document.createElement('a');link.href=url;link.download=name+'-urun-listesi.xlsx';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
    }catch(error){console.error('Excel ürün aktarımı',error);alert('Excel oluşturulamadı: '+error.message);}
  });
})(typeof window==='undefined'?globalThis:window);

