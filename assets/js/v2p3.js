
function edR(i){const n=i<0;const r=n?{id:"",title:"",category:data.categories?.[0]?.slug||"",excerpt:"",time:30,servings:4,difficulty:"آسان",rating:0,votes:0,created:new Date().toISOString().slice(0,10),featured:false,tags:[],art:{emoji:"🍰",from:"#f4c26b",to:"#c9743a"},image:"",ingredients:[""],steps:[""],tip:""}:structuredClone(data.recipes[i]);
const cats=data.categories||[];
openModal(`<h3>${n?"دستور جدید":"ویرایش"}</h3><div class="form-grid">
<label class="field"><span>شناسه</span><input id="id" value="${esc(r.id)}" dir="ltr" ${n?"":"readonly"}></label>
<label class="field"><span>عنوان</span><input id="ti" value="${esc(r.title)}"></label>
<label class="field"><span>دسته</span><select id="ca">${cats.map(x=>`<option value="${esc(x.slug)}" ${x.slug===r.category?"selected":""}>${esc(x.name)}</option>`).join("")}</select></label>
<label class="field"><span>سختی</span><select id="di">${["آسان","متوسط","سخت"].map(d=>`<option ${d===r.difficulty?"selected":""}>${d}</option>`).join("")}</select></label>
<label class="field full"><span>خلاصه</span><textarea id="ex" rows="2">${esc(r.excerpt||"")}</textarea></label>
<label class="field full"><span>مواد (هر خط)</span><textarea id="ing" rows="3">${esc((r.ingredients||[]).join("\n"))}</textarea></label>
<label class="field full"><span>مراحل (هر خط)</span><textarea id="st" rows="3">${esc((r.steps||[]).join("\n"))}</textarea></label>
<label class="field"><span>ویژه</span><input type="checkbox" id="fe" ${r.featured?"checked":""}></label>
<div class="field full"><span>عکس</span><div id="ip" style="margin:.4rem 0">${imgTag(r.image)}</div>
<input type="hidden" id="ipath" value="${esc(r.image||"")}"><input type="file" id="ifile" accept="image/*">
<button type="button" class="btn btn-ghost btn-sm" id="iclear" style="margin-top:.4rem">حذف عکس</button></div>
</div><div class="modal-actions"><button class="btn btn-ghost" data-close>انصراف</button><button class="btn btn-primary" id="save">ذخیره</button></div>`);
$("#ifile").onchange=async()=>{const f=$("#ifile").files[0];if(!f)return;try{toast("آپلود…");const p=await uploadImage(f,r.id||"recipe");$("#ipath").value=p;$("#ip").innerHTML=imgTag(p);toast("آپلود شد")}catch(e){toast(e.message,1)}};
$("#iclear").onclick=()=>{$("#ipath").value="";$("#ip").innerHTML=imgTag("")};
$("#save").onclick=()=>{const id=$("#id").value.trim();if(!id)return toast("شناسه",1);const o={...r,id,title:$("#ti").value.trim(),category:$("#ca").value,difficulty:$("#di").value,excerpt:$("#ex").value.trim(),ingredients:$("#ing").value.split("\n").map(x=>x.trim()).filter(Boolean),steps:$("#st").value.split("\n").map(x=>x.trim()).filter(Boolean),featured:$("#fe").checked,image:$("#ipath").value.trim()};if(n)data.recipes.unshift(o);else data.recipes[i]=o;mark("recipes");$("#modal").hidden=true;render();toast("OK")}}

function edC(i){const n=i<0;const cat=n?{slug:"",name:"",icon:"🍽️",desc:"",order:(data.categories?.length||0)+1}:structuredClone(data.categories[i]);
openModal(`<h3>${n?"دسته جدید":"ویرایش دسته"}</h3><div class="form-grid">
<label class="field"><span>slug</span><input id="sl" value="${esc(cat.slug)}" dir="ltr" ${n?"":"readonly"}></label>
<label class="field"><span>ترتیب</span><input type="number" id="ord" value="${cat.order||1}"></label>
<label class="field"><span>نام</span><input id="nm" value="${esc(cat.name)}"></label>
<label class="field"><span>آیکون</span><input id="ic" value="${esc(cat.icon)}"></label>
<label class="field full"><span>توضیح</span><input id="ds" value="${esc(cat.desc||"")}"></label>
</div><div class="modal-actions"><button class="btn btn-ghost" data-close>انصراف</button><button class="btn btn-primary" id="save">ذخیره</button></div>`);
$("#save").onclick=()=>{const slug=$("#sl").value.trim();if(!slug)return toast("slug",1);const o={...cat,slug,name:$("#nm").value.trim(),icon:$("#ic").value.trim(),desc:$("#ds").value.trim(),order:+$("#ord").value||1};if(n)data.categories.push(o);else data.categories[i]=o;mark("categories");$("#modal").hidden=true;render();toast("OK")}}
