(async()=>{
  const parts=["admin-p0.js","admin-p1.js","admin-p2.js","admin-p3.js"];
  const base=document.currentScript.src.replace(/admin\.js$/,"");
  let code="";
  for(const p of parts){
    const r=await fetch(base+p+"?t="+Date.now(),{cache:"no-cache"});
    if(!r.ok) throw new Error("load "+p);
    code+=await r.text();
  }
  const s=document.createElement("script");
  s.textContent=code;
  document.body.appendChild(s);
})().catch(e=>{console.error(e);alert("خطا در بارگذاری پنل: "+e.message);});
