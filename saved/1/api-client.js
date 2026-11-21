window.academyAPI = path => new URL(path, window.AAA_API_BASE || location.origin).href;
// Start the free backend while visitors explore the independently served pages.
if(window.AAA_API_BASE && location.protocol!=='file:'){
 fetch(academyAPI('/healthz'),{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(120000)}).catch(()=>{});
}
