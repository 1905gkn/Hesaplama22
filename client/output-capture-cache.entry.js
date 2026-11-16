import {createCaptureCache,browserCaptureStorage,captureCacheKey} from './output-capture-cache.mjs';
window.rafexSectionImageCache579={...createCaptureCache({storage:browserCaptureStorage()}),
 key:signature=>captureCacheKey(signature,{owner:typeof me!=='undefined'?me?.id:null,build:document.querySelector('#rafexVersionInfoCard .rafex-version-main')?.textContent||''}).catch(()=>null)
};
