(async()=>{
  const n=9;
  const base=document.currentScript.src.replace(/admin\.js$/,"");
  let b64="";
  for(let i=0;i<n;i++){
    const r=await fetch(base+"admin-b"+i+".txt?t="+Date.now(),{cache:"no-cache"});
    if(!r.ok) throw new Error("chunk "+i);
    b64+=await r.text();
  }
  const code=decodeURIComponent(escape(atob(b64)));
  const s=document.createElement("script");
  s.textContent=code;
  document.body.appendChild(s);
})().catch(e=>{console.error(e);alert("خطا: "+e.message)});
