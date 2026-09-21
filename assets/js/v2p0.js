(()=>{
const O="khanepaz",R="khanepaz",B="main",A="https://api.github.com",K="kp_admin_token";
const F={site:"data/site.json",categories:"data/categories.json",recipes:"data/recipes.json",tutorials:"data/tutorials.json",gallery:"data/gallery.json",comments:"data/comments.json"};
let data={},shas={},dirty=new Set(),token="",tab="dashboard";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const toast=(m,e)=>{const el=$("#toast");if(!el)return;el.textContent=m;el.classList.toggle("err",!!e);el.classList.add("show");setTimeout(()=>el.classList.remove("show"),3000)};
const mark=k=>{if(k)dirty.add(k);const b=$("#saveAllBtn"),s=$("#saveStatus");if(b)b.hidden=!dirty.size;if(s){s.textContent=dirty.size?dirty.size+" فایل":"";s.className=dirty.size?"status dirty":"status"}};
async function gh(p,o={}){const r=await fetch(A+p,{...o,headers:{Accept:"application/vnd.github+json",Authorization:"Bearer "+token,"X-GitHub-Api-Version":"2022-11-28",...(o.body?{"Content-Type":"application/json"}:{}),...o.headers}});if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.message||("HTTP "+r.status))}return r.status===204?null:r.json()}
const enc=s=>btoa(unescape(encodeURIComponent(s))),dec=s=>decodeURIComponent(escape(atob(s)));
async function load(p){const i=await gh(`/repos/${O}/${R}/contents/${p}?ref=${B}`);return{json:JSON.parse(dec(i.content.replace(/\n/g,""))),sha:i.sha}}
async function save(p,j,sha,msg){return gh(`/repos/${O}/${R}/contents/${p}`,{method:"PUT",body:JSON.stringify({message:msg,content:enc(JSON.stringify(j,null,2)+"\n"),sha,branch:B})})}
async function uploadImage(file,hint){
  if(!file||!file.type.startsWith("image/"))throw new Error("فقط تصویر");
  if(file.size>2.5e6)throw new Error("حداکثر ۲.۵ مگابایت");
  const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"");
  const safe=(hint||"img").replace(/[^a-z0-9-_]/gi,"-").toLowerCase().slice(0,36);
  const path="assets/img/"+safe+"-"+Date.now()+"."+(ext||"jpg");
  const b64=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(",")[1]);fr.onerror=rej;fr.readAsDataURL(file)});
  let sha;try{sha=(await gh(`/repos/${O}/${R}/contents/${path}?ref=${B}`)).sha}catch(_){}
  await gh(`/repos/${O}/${R}/contents/${path}`,{method:"PUT",body:JSON.stringify({message:"admin: upload "+path,content:b64,branch:B,sha})});
  return path;
}
function showLogin(){$("#loginScreen").hidden=false;$("#app").hidden=true}
function showApp(){$("#loginScreen").hidden=true;$("#app").hidden=false}
async function login(){const err=$("#loginError");token=$("#tokenInput").value.trim().replace(/^Bearer\s+/i,"");err.hidden=true;if(!token||token.length<20){err.textContent="توکن github_pat_ را وارد کنید";err.hidden=false;return}$("#loginBtn").disabled=true;try{await gh(`/repos/${O}/${R}`);if($("#rememberToken").checked)sessionStorage.setItem(K,token);else sessionStorage.removeItem(K);await boot()}catch(e){err.textContent="خطا: "+e.message;err.hidden=false;token=""}finally{$("#loginBtn").disabled=false}}
function logout(){token="";sessionStorage.removeItem(K);showLogin()}
async function boot(){showApp();$("#content").innerHTML="<div class='empty'><p>بارگذاری…</p></div>";try{const ks=Object.keys(F);const rs=await Promise.all(ks.map(k=>load(F[k])));ks.forEach((k,i)=>{data[k]=rs[i].json;shas[k]=rs[i].sha});dirty.clear();mark();render();toast("بارگذاری شد")}catch(e){toast(e.message,1)}}
async function saveAll(){if(!dirty.size)return;const b=$("#saveAllBtn");b.disabled=1;b.textContent="…";try{for(const k of[...dirty]){const r=await save(F[k],data[k],shas[k],"admin: "+k);shas[k]=r.content.sha;dirty.delete(k)}mark();toast("ذخیره شد");render()}catch(e){toast(e.message,1)}finally{b.disabled=0;b.textContent="ذخیره تغییرات"}}
const T={dashboard:"داشبورد",recipes:"دستورها",categories:"دسته‌ها",carousel:"کاروسل",tutorials:"آموزش",gallery:"گالری",comments:"نظرات",site:"تنظیمات"};
function setTab(t){tab=t;$$("#sbNav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===t));$("#pageTitle").textContent=T[t]||t;render()}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&"+"amp;","<":"&"+"lt;",">":"&"+"gt;","\"":"&"+"quot;","'":"&#39;"})[c])}
function openModal(h){$("#modalBox").innerHTML=h;$("#modal").hidden=false;$$("[data-close]").forEach(e=>e.onclick=()=>{$("#modal").hidden=true})}
function imgTag(src){return src?`<img class="img-preview" src="${esc(src)}" alt="" onerror="this.style.display='none'">`:'<span class="badge">بدون عکس</span>'}

function render(){const c=$("#content");
if(tab==="dashboard"){const s=[["دستور",data.recipes?.length||0],["دسته",data.categories?.length||0],["آموزش",data.tutorials?.length||0],["گالری",data.gallery?.length||0],["نظر",data.comments?.length||0],["کاروسل",data.site?.carousel?.length||0]];
c.innerHTML=`<div class="stats">${s.map(([l,n])=>`<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("")}</div>
<div class="card"><p style="color:var(--muted)">بعد از ویرایش «ذخیره تغییرات» را بزنید.</p>
<p style="color:var(--muted);font-size:.9rem;margin-top:.6rem">⚠️ نظر بازدیدکننده در سایت فقط در مرورگر خودش (localStorage) ذخیره می‌شود و به این پنل نمی‌آید. اینجا فقط comments.json را می‌بینید.</p></div>`}

else if(tab==="recipes"){const L=data.recipes||[];
c.innerHTML=`<div class="card"><div class="card-h"><h3>${L.length} دستور</h3><button class="btn btn-primary btn-sm" id="add">+ جدید</button></div>
<table><thead><tr><th>عکس</th><th>عنوان</th><th>دسته</th><th></th></tr></thead><tbody>
${L.map((r,i)=>`<tr><td>${imgTag(r.image)}</td><td><b>${esc(r.title)}</b><br><small dir="ltr">${esc(r.id)}</small></td><td>${esc(r.category)}</td>
<td class="actions"><button class="btn btn-ghost btn-sm" data-e="${i}">ویرایش</button><button class="btn btn-danger btn-sm" data-d="${i}">حذف</button></td></tr>`).join("")}
</tbody></table></div>`;
$("#add").onclick=()=>edR(-1);$$("[data-e]").forEach(b=>b.onclick=()=>edR(+b.dataset.e));
$$("[data-d]").forEach(b=>b.onclick=()=>{if(confirm("حذف؟")){data.recipes.splice(+b.dataset.d,1);mark("recipes");render()}})}

else if(tab==="categories"){const L=[...(data.categories||[])].sort((a,b)=>(a.order||0)-(b.order||0));
c.innerHTML=`<div class="card"><div class="card-h"><h3>${L.length} دسته</h3><button class="btn btn-primary btn-sm" id="add">+ جدید</button></div>
<table><thead><tr><th>#</th><th>نام</th><th>slug</th><th></th></tr></thead><tbody>
${L.map(x=>{const i=data.categories.indexOf(x);return`<tr><td>${x.order||""}</td><td>${esc(x.icon)} ${esc(x.name)}</td><td dir="ltr">${esc(x.slug)}</td>
<td class="actions"><button class="btn btn-ghost btn-sm" data-e="${i}">ویرایش</button><button class="btn btn-danger btn-sm" data-d="${i}">حذف</button></td></tr>`}).join("")}
</tbody></table></div>`;
$("#add").onclick=()=>edC(-1);$$("[data-e]").forEach(b=>b.onclick=()=>edC(+b.dataset.e));
$$("[data-d]").forEach(b=>b.onclick=()=>{if(confirm("حذف؟")){data.categories.splice(+b.dataset.d,1);mark("categories");render()}})}
