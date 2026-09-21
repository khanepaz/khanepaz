
function edCar(i){const n=i<0;const s=n?{recipeId:data.recipes?.[0]?.id||"",badge:"",title:"",text:"",image:""}:structuredClone(data.site.carousel[i]);
const recipes=data.recipes||[];
openModal(`<h3>${n?"اسلاید":"ویرایش اسلاید"}</h3><div class="form-grid">
<label class="field full"><span>دستور</span><select id="rid">${recipes.map(r=>`<option value="${esc(r.id)}" ${r.id===s.recipeId?"selected":""}>${esc(r.title)}</option>`).join("")}</select></label>
<label class="field"><span>برچسب</span><input id="bd" value="${esc(s.badge||"")}"></label>
<label class="field full"><span>عنوان</span><input id="ti" value="${esc(s.title||"")}"></label>
<label class="field full"><span>متن</span><textarea id="tx" rows="2">${esc(s.text||"")}</textarea></label>
<div class="field full"><span>عکس اسلاید (کنار SVG متحرک)</span>
  <div id="ip" style="margin:.4rem 0">${imgTag(s.image||"")}</div>
  <input type="hidden" id="ipath" value="${esc(s.image||"")}">
  <input type="file" id="ifile" accept="image/*">
  <button type="button" class="btn btn-ghost btn-sm" id="iclear" style="margin-top:.4rem">حذف عکس</button>
  <p style="color:var(--muted);font-size:.8rem;margin-top:.4rem">اگر خالی باشد، عکس دستور مرتبط استفاده می‌شود (در صورت وجود).</p>
</div>
</div><div class="modal-actions"><button class="btn btn-ghost" data-close>انصراف</button><button class="btn btn-primary" id="save">ذخیره</button></div>`);
$("#ifile").onchange=async()=>{const f=$("#ifile").files[0];if(!f)return;try{toast("آپلود…");const p=await uploadImage(f,"carousel");$("#ipath").value=p;$("#ip").innerHTML=imgTag(p);toast("آپلود شد")}catch(e){toast(e.message,1)}};
$("#iclear").onclick=()=>{$("#ipath").value="";$("#ip").innerHTML=imgTag("")};
$("#save").onclick=()=>{const o={recipeId:$("#rid").value,badge:$("#bd").value.trim(),title:$("#ti").value.trim(),text:$("#tx").value.trim(),image:$("#ipath").value.trim()};if(n)data.site.carousel.push(o);else data.site.carousel[i]=o;mark("site");$("#modal").hidden=true;render();toast("OK")}}

function edT(i){const n=i<0;const t=n?{id:"",title:"",level:"مبتدی",duration:10,icon:"📖",color:"#f2b632",summary:"",steps:[""],note:"",image:""}:structuredClone(data.tutorials[i]);
openModal(`<h3>${n?"آموزش":"ویرایش"}</h3><div class="form-grid">
<label class="field"><span>شناسه</span><input id="id" value="${esc(t.id)}" dir="ltr" ${n?"":"readonly"}></label>
<label class="field"><span>عنوان</span><input id="ti" value="${esc(t.title)}"></label>
<label class="field"><span>سطح</span><select id="lv">${["مبتدی","متوسط","پیشرفته"].map(x=>`<option ${x===t.level?"selected":""}>${x}</option>`).join("")}</select></label>
<label class="field"><span>دقیقه</span><input type="number" id="du" value="${t.duration||10}"></label>
<label class="field"><span>آیکون</span><input id="ic" value="${esc(t.icon||"")}"></label>
<label class="field full"><span>خلاصه</span><textarea id="sm" rows="2">${esc(t.summary||"")}</textarea></label>
<label class="field full"><span>مراحل (هر خط)</span><textarea id="st" rows="4">${esc((t.steps||[]).join("\n"))}</textarea></label>
<label class="field full"><span>نکته</span><textarea id="nt" rows="2">${esc(t.note||"")}</textarea></label>
<div class="field full"><span>عکس (روی کارت و داخل مودال کنار SVG)</span>
  <div id="ip" style="margin:.4rem 0">${imgTag(t.image||"")}</div>
  <input type="hidden" id="ipath" value="${esc(t.image||"")}">
  <input type="file" id="ifile" accept="image/*">
  <button type="button" class="btn btn-ghost btn-sm" id="iclear" style="margin-top:.4rem">حذف عکس</button>
</div>
</div><div class="modal-actions"><button class="btn btn-ghost" data-close>انصراف</button><button class="btn btn-primary" id="save">ذخیره</button></div>`);
$("#ifile").onchange=async()=>{const f=$("#ifile").files[0];if(!f)return;try{toast("آپلود…");const p=await uploadImage(f,t.id||"tut");$("#ipath").value=p;$("#ip").innerHTML=imgTag(p);toast("آپلود شد")}catch(e){toast(e.message,1)}};
$("#iclear").onclick=()=>{$("#ipath").value="";$("#ip").innerHTML=imgTag("")};
$("#save").onclick=()=>{const id=$("#id").value.trim();if(!id)return toast("شناسه",1);const o={...t,id,title:$("#ti").value.trim(),level:$("#lv").value,duration:+$("#du").value||10,icon:$("#ic").value.trim(),summary:$("#sm").value.trim(),steps:$("#st").value.split("\n").map(x=>x.trim()).filter(Boolean),note:$("#nt").value.trim(),image:$("#ipath").value.trim()};if(n)data.tutorials.unshift(o);else data.tutorials[i]=o;mark("tutorials");$("#modal").hidden=true;render();toast("OK")}}
