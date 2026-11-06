// Millimetre extents shared by the native side drawing and its outer dimensions.
export function mekikSideMetrics(d,stepped=null){
 const levels=Math.max(1,Math.min(15,Number(d?.levels)||1)),storedGap=Math.max(380,Math.min(5000,Number(d?.levelH)||1580)),loadHeight=Math.max(300,Math.min(3000,Number(d?.palletHeight)||storedGap-380)),levelHeight=Math.max(loadHeight+80,storedGap),firstRailHeight=Math.max(0,Math.min(5000,Number(d?.firstRailHeight)||430)),topRailHeight=firstRailHeight+(levels-1)*levelHeight;
 const uprightHeight=stepped?.height||Math.ceil(Math.max(topRailHeight,Number(d?.sideUprightHeight)||topRailHeight+loadHeight/2)/50)*50,topLoadHeight=topRailHeight+loadHeight,contentHeight=Math.max(uprightHeight,topLoadHeight),uprightWidth=Math.max(70,Math.min(110,Number(d?.footType)||90));
 return {levels,loadHeight,levelHeight,firstRailHeight,topRailHeight,uprightHeight,topLoadHeight,contentHeight,marginX:Math.max(85,uprightWidth*1.7*.75),marginTop:45,marginBottom:95};
}
