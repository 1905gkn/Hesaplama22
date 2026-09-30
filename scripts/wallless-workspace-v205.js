(()=>{
 function initialize(){
  const s=m2LayoutState;
  if(!s||s.points.length||s.racks.length||m2LayoutSymbols.length||s.cadElements?.length||m2UserNotes.length)return;
  if(!s.walllessWorkspaceV205){s.scale=.013;s.walllessWorkspaceV205=true;}
 }
 window.rafexWalllessWorkspaceV205={initialize};
 const render=m2RenderLayout;
 m2RenderLayout=window.m2RenderLayout=function(){initialize();return render.apply(this,arguments);};
 initialize();
})();
