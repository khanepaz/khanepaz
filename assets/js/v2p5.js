
function edG(i){const n=i<0;const g=n?{id:"g"+Date.now(),caption:"",ratio:"1/1",recipeId:"",image:"",art:{emoji:"📷",from:"#f4c26b",to:"#c9743a"}}:structuredClone(data.gallery[i]);
const recipes=data.recipes||[];
openModal(`<h3>${n?"گالری":"ویرایش"}</h3><div class="form-grid">
<label class="field"><span>شناسه</span><input id="id" value="${esc(g.id)}" dir="ltr" ${n?"":"readonly"}></label>
<label class="field"><span>نسبت</span><select id="rt">${["1/1","4/5","3/2"].map(x=>`<option ${x===(g.ratio||"1/1")?"selected":""}>${x}</option>`).join("")}</select></label>
<label class="field full"><span>کپشن</span><input id="cp" value="${esc(g.caption||"")}"></label>
<label class="field full"><span>دستور</span><select id="rid"><option value="">—</option>${recipes.map(r=>`<option value="${esc(r.id)}" ${r.id===g.recipeId?"selected":""}>${esc(r.title)}</option>`).join("")}</select></label>
<label class="field"><span>ایموجی</span><input id="em" value="${esc(g.art?.emoji||"")}"></label>
<div class="field full"><span>عکس</span><div id="ip" style="margin:.4rem 0">${imgTag(g.image||"")}</div>
<input type="hidden" id="ipath" value="${esc(g.image||"")}"><input type="file" id="ifile" accept="image/*">
<button type="button" class="btn btn-ghost btn-sm" id="iclear" style="margin-top:.4rem">حذف عکس</button></div>
</div><div class="modal-actions"><button class="btn btn-ghost" data-close>انصراف</button><button class="btn btn-primary" id="save">ذخیره</button></div>`);
$("#ifile").onchange=async()=>{const f=$("#ifile").files[0];if(!f)return;try{toast("آپلود…");const p=await uploadImage(f,g.id||"gal");$("#ipath").value=p;$("#ip").innerHTML=imgTag(p);toast("آپلود شد")}catch(e){toast(e.message,1)}};
$("#iclear").onclick=()=>{$("#ipath").value="";$("#ip").innerHTML=imgTag("")};
$("#save").onclick=()=>{const o={...g,id:$("#id").value.trim(),caption:$("#cp").value.trim(),ratio:$("#rt").value,recipeId:$("#rid").value,image:$("#ipath").value.trim(),art:{...(g.art||{}),emoji:$("#em").value.trim()||"📷"}};if(n)data.gallery.unshift(o);else data.gallery[i]=o;mark("gallery");$("#modal").hidden=true;render();toast("OK")}}

function edCm(i){const n=i<0;const x=n?{id:"c"+Date.now(),name:"",rating:5,text:"",recipeId:"",date:new Date().toISOString().slice(0,10)}:structuredClone(data.comments[i]);
openModal(`<h3>${n?"نظر":"ویرایش"}</h3><div class="form-grid">
<label class="field"><span>نام</span><input id="nm" value="${esc(x.name)}"></label>
<label class="field"><span>امتیاز</span><input type="number" id="rt" min="1" max="5" value="${x.rating||5}"></label>
<label class="field full"><span>متن</span><textarea id="tx" rows="3">${esc(x.text||"")}</textarea></label>
</div><div class="modal-actions"><button class="btn btn-ghost" data-close>انصراف</button><button class="btn btn-primary" id="save">ذخیره</button></div>`);
$("#save").onclick=()=>{const o={...x,name:$("#nm").value.trim(),rating:+$("#rt").value||5,text:$("#tx").value.trim()};if(n)data.comments.unshift(o);else data.comments[i]=o;mark("comments");$("#modal").hidden=true;render();toast("OK")}}

$("#loginBtn").onclick=login;$("#tokenInput")?.addEventListener("keydown",e=>{if(e.key==="Enter")login()});
$("#logoutBtn").onclick=logout;$("#saveAllBtn").onclick=saveAll;
$$("#sbNav button").forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
showLogin();
const sv=sessionStorage.getItem(K);if(sv){token=sv;$("#tokenInput").value=sv;$("#rememberToken").checked=true;boot()}
})();
