(function(){
  if (location.search.indexOf('diag') < 0) return;
  function info(el){ if(!el) return null; var cs=getComputedStyle(el); var r=el.getBoundingClientRect();
    return {tag:el.tagName, cls:String(el.className).slice(0,60), top:Math.round(r.top), left:Math.round(r.left), w:Math.round(r.width), h:Math.round(r.height), pos:cs.position, disp:cs.display, tf:cs.transform, ov:cs.overflow, vis:cs.visibility, op:cs.opacity, z:cs.zIndex}; }
  setTimeout(function(){
    var h=document.querySelector('header'); var out={sy:scrollY, se:document.scrollingElement.scrollTop, body:document.body.scrollTop, root:document.getElementById('root').scrollTop, iw:innerWidth, chain:[]};
    var el=h; while(el){ out.chain.push(info(el)); el=el.parentElement; }
    out.bar=info(h && h.firstElementChild); out.main=info(document.querySelector('main'));
    var d=document.createElement('pre'); d.id='diag'; d.style.cssText='position:fixed;left:0;top:120px;z-index:99999;background:#fff;color:#000;font:11px monospace;white-space:pre-wrap;max-width:100vw;max-height:70vh;overflow:auto;padding:6px';
    d.textContent=JSON.stringify(out,null,1); document.body.appendChild(d);
  }, 3500);
})();
