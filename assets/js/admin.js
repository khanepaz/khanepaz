(()=>{
const O="khanepaz",R="khanepaz",B="main",A="https://api.github.com",K="kp_admin_token";
const F={site:"data/site.json",categories:"data/categories.json",recipes:"data/recipes.json",tutorials:"data/tutorials.json",gallery:"data/gallery.json",comments:"data/comments.json"};
let data={},shas={},dirty=new Set(),token="",tab="dashboard";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const toast=(m,e)=>{const el=$("#toast");el.textContent=m;el.classList.toggle("err",!!e);el.classList.add("show");setTimeout(()=>el.classList.remove("show"),3200)};
const mark=k=>{dirty.add(k);const b=$("#saveAllBtn"),s=$("#saveStatus");b.hidden=!dirty.size;s.textContent=dirty.size?dirty.size+" فایل":"";s.className=dirty.size?"status dirty":"status"};
async function gh(p,o={}){const r=await fetch(A+p,{...o,headers:{Accept:"application/vnd.github+json",Authorization:"Bearer "+token,"X-GitHub-Api-Version":"2022-11-28",...(o.body?{"Content-Type":"application/json"}:{}),...o.headers}});if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.message||("HTTP "+r.status))}return r.status===204?null:r.json()}
const enc=s=>btoa(unescape(encodeURIComponent(s))),dec=s=>decodeURIComponent(escape(atob(s)));
async function load(p){const i=await gh(`/repos/${O}/${R}/contents/${p}?ref=${B}`);return{json:JSON.parse(dec(i.content.replace(/\n/g,""))),sha:i.sha}}
async function save(p,j,sha,msg){return gh(`/repos/${O}/${R}/contents/${p}`,{method:"PUT",body:JSON.stringify({message:msg,content:enc(JSON.stringify(j,null,2)+"\n"),sha,branch:B})})}
function showLogin(){$("#loginScreen").hidden=false;$("#app").hidden=true}
function showApp(){$("#loginScreen").hidden=true;$("#app").hidden=false}
async function login(){const err=$("#loginError");token=$("#tokenInput").value.trim().replace(/^Bearer\s+/i,"");err.hidden=true;if(!token){err.textContent="توکن را وارد کنید (نه اسم توکن؛ خود رشته‌ی github_pat_…)";err.hidden=false;return}if(token.length<20){err.textContent="این شبیه توکن نیست. از GitHub Settings → Tokens مقدار توکن را کپی کنید.";err.hidden=false;return}$("#loginBtn").disabled=true;try{await gh(`/repos/${O}/${R}`);if($("#rememberToken").checked)sessionStorage.setItem(K,token);else sessionStorage.removeItem(K);await boot()}catch(e){const msg=String(e.message||e);let help="توکن نامعتبر یا بدون دسترسی.";if(/Bad credentials|401/i.test(msg))help="توکن اشتباه است یا منقضی شده. دوباره بساز.";else if(/Not Found|404/i.test(msg))help="دسترسی Contents روی ریپوی khanepaz را Read and write بگذار.";else if(/rate limit/i.test(msg))help="محدودیت API گیت‌هاب؛ کمی صبر کن.";err.textContent=help+" ("+msg+")";err.hidden=false;token=""}finally{$("#loginBtn").disabled=false}}
function logout(){token="";sessionStorage.removeItem(K);data={};shas={};dirty.clear();showLogin();$("#tokenInput").value=""}
async function boot(){showApp();$("#content").innerHTML="<div class='empty'><p>بارگذاری…</p></div>";try{const ks=Object.keys(F);const rs=await Promise.all(ks.map(k=>load(F[k])));ks.forEach((k,i)=>{data[k]=rs[i].json;shas[k]=rs[i].sha});dirty.clear();mark();render();toast("بارگذاری شد")}catch(e){$("#content").innerHTML=`<div class='empty'><p>${e.message}</p></div>`;toast(e.message,1)}}
async function saveAll(){if(!dirty.size)return;const b=$("#saveAllBtn");b.disabled=1;b.textContent="…";try{for(const k of[...dirty]){const r=await save(F[k],data[k],shas[k],"admin: "+k);shas[k]=r.content.sha;dirty.delete(k)}mark();toast("ذخیره شد ✓");render()}catch(e){toast(e.message,1)}finally{b.disabled=0;b.textContent="ذخیره تغییرات"}}
const T={dashboard:"داشبورد",recipes:"دستورها",categories:"دسته‌بندی‌ها",carousel:"کاروسل",tutorials:"آموزش‌ها",gallery:"گالری",comments:"نظرات",site:"تنظیمات سایت"};
function setTab(t){tab=t;$$("#sbNav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===t));$("#pageTitle").textContent=T[t]||t;render()}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&"+"amp;","<":"&"+"lt;",">":"&"+"gt;","\"":"&"+"quot;","'":"&#39;"})[c])}
function openModal(h){$("#modalBox").innerHTML=h;$("#modal").hidden=false;$$("[data-close]").forEach(e=>e.onclick=()=>{$("#modal").hidden=true})}
function render(){const c=$("#content");
if(tab==="dashboard"){const s=[["دستور",data.recipes?.length||0],["دسته",data.categories?.length||0],["آموزش",data.tutorials?.length||0],["گالری",data.gallery?.length||0],["نظر",data.comments?.length||0],["کاروسل",data.site?.carousel?.length||0]];c.innerHTML=`<div class="stats">${s.map(([l,n])=>`<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("")}</div><div class="card"><p style="color:var(--muted)">بعد از ویرایش، دکمه ذخیره تغییرات را بزنید.</p></div>`}
else if(tab==="recipes"){const L=data.recipes||[];c.innerHTML=`<div class="card"><div class="card-h"><h3>${L.length} دستور</h3><button class="btn btn-primary btn-sm" id="add">+ جدید</button></div><div class="table-wrap"><table><thead><tr><th>عنوان</th><th>دسته</th><th></th></tr></thead><tbody>${L.map((r,i)=>`<tr><td><b>${esc(r.title)}</b><br><small>${esc(r.id)}</small></td><td>${esc(r.category)}</td><td class="actions"><button class="btn btn-ghost btn-sm" data-e="${i}">ویرایش</button><button class="btn btn-danger btn-sm" data-d="${i}">حذف</button></td></tr>`).join("")}</tbody></table></div></div>`;
$("#add").onclick=()=>ed(-1);$$("[data-e]").forEach(b=>b.onclick=()=>ed(+b.dataset.e));$$("[data-d]").forEach(b=>b.onclick=()=>{if(confirm("حذف؟")){data.recipes.splice(+b.dataset.d,1);mark("recipes");render()}});
function ed(i){const n=i<0;const r=n?{id:"",title:"",category:data.categories?.[0]?.slug||"",excerpt:"",time:30,servings:4,difficulty:"آسان",rating:0,votes:0,created:new Date().toISOString().slice(0,10),featured:false,tags:[],art:{emoji:"🍰",from:"#f4c26b",to:"#c9743a"},image:"",ingredients:[""],steps:[""],tip:""}:structuredClone(data.recipes[i]);
const cats=data.categories||[];
openModal(`<h3>${n?"جدید":"ویرایش"}</h3><div class="form-grid">
<label class="field"><span>شناسه</span><input id="id" value="${esc(r.id)}" dir="ltr" ${n?"":"readonly"}></label>
<label class="field"><span>عنوان</span><input id="ti" value="${esc(r.title)}"></label>
<label class="field"><span>دسته</span><select id="ca">${cats.map(x=>`<option value="${esc(x.slug)}" ${x.slug===r.category?"selected":""}>${esc(x.name)}</option>`).join("")}</select></label>
<label class="field"><span>سختی</span><select id="di">${["آسان","متوسط","سخت"].map(d=>`<option ${d===r.difficulty?"selected":""}>${d}</option>`).join("")}</select></label>
<label class="field full"><span>خلاصه</span><textarea id="ex" rows="2">${esc(r.excerpt||"")}</textarea></label>
<label class="field full"><span>مواد (هر خط)</span><textarea id="ing" rows="3">${esc((r.ingredients||[]).join("\n"))}</textarea></label>
<label class="field full"><span>مراحل (هر خط)</span><textarea id="st" rows="3">${esc((r.steps||[]).join("\n"))}</textarea></label>
<label class="field"><span>ویژه</span><input type="checkbox" id="fe" ${r.featured?"checked":""}></label>
</div><div class="modal-actions"><button class="btn btn-ghost" data-close>انصراف</button><button class="btn btn-primary" id="sv">ذخیره</button></div>`);
$("#sv").onclick=()=>{const id=$("#id").value.trim();if(!id)return toast("شناسه",1);const o={...r,id,title:$("#ti").value.trim(),category:$("#ca").value,difficulty:$("#di").value,excerpt:$("#ex").value.trim(),ingredients:$("#ing").value.split("\n").map(x=>x.trim()).filter(Boolean),steps:$("#st").value.split("\n").map(x=>x.trim()).filter(Boolean),featured:$("#fe").checked};if(n)data.recipes.unshift(o);else data.recipes[i]=o;mark("recipes");$("#modal").hidden=true;render();toast("OK")}}}
else if(tab==="categories"){const L=[...(data.categories||[])];c.innerHTML=`<div class="card"><div class="card-h"><h3>${L.length} دسته</h3><button class="btn btn-primary btn-sm" id="add">+ جدید</button></div><table><thead><tr><th>نام</th><th>slug</th><th></th></tr></thead><tbody>${L.map((x,i)=>`<tr><td>${esc(x.icon)} ${esc(x.name)}</td><td dir="ltr">${esc(x.slug)}</td><td><button class="btn btn-danger btn-sm" data-d="${i}">حذف</button></td></tr>`).join("")}</tbody></table></div>`;
$("#add").onclick=()=>{const slug=prompt("slug انگلیسی:");const name=prompt("نام فارسی:");if(slug&&name){data.categories.push({slug,name,icon:"🍽️",desc:"",order:L.length+1});mark("categories");render()}};
$$("[data-d]").forEach(b=>b.onclick=()=>{if(confirm("حذف؟")){data.categories.splice(+b.dataset.d,1);mark("categories");render()}})}
else if(tab==="comments"){const L=data.comments||[];c.innerHTML=`<div class="card"><h3>${L.length} نظر</h3><table><thead><tr><th>نام</th><th>متن</th><th></th></tr></thead><tbody>${L.map((x,i)=>`<tr><td>${esc(x.name)}</td><td>${esc(x.text)}</td><td><button class="btn btn-danger btn-sm" data-d="${i}">حذف</button></td></tr>`).join("")}</tbody></table></div>`;$$("[data-d]").forEach(b=>b.onclick=()=>{data.comments.splice(+b.dataset.d,1);mark("comments");render()})}
else if(tab==="site"){const s=data.site||{};c.innerHTML=`<div class="card"><div class="form-grid">
<label class="field"><span>نام</span><input id="n" value="${esc(s.name||"")}"></label>
<label class="field"><span>دامنه</span><input id="dom" value="${esc(s.domain||"")}" dir="ltr"></label>
<label class="field full"><span>عنوان هیرو</span><input id="ht" value="${esc(s.heroTitle||"")}"></label>
<label class="field full"><span>متن هیرو</span><textarea id="hl" rows="3">${esc(s.heroLead||"")}</textarea></label>
</div><button class="btn btn-primary" id="sv" style="margin-top:1rem;max-width:180px">اعمال</button></div>`;
$("#sv").onclick=()=>{data.site={...data.site,name:$("#n").value.trim(),domain:$("#dom").value.trim(),heroTitle:$("#ht").value.trim(),heroLead:$("#hl").value.trim()};mark("site");toast("اعمال شد")}}
else{c.innerHTML=`<div class="card"><p style="color:var(--muted)">این بخش در نسخه بعدی کامل می‌شود. فعلاً از دستورها، دسته‌ها، نظرات و تنظیمات استفاده کنید.</p></div>`}
}
$("#loginBtn").onclick=login;$("#tokenInput").onkeydown=e=>{if(e.key==="Enter")login()};$("#logoutBtn").onclick=logout;$("#saveAllBtn").onclick=saveAll;
$$("#sbNav button").forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
showLogin();
const sv=sessionStorage.getItem(K);if(sv){token=sv;$("#tokenInput").value=sv;$("#rememberToken").checked=1;boot()}
})();
