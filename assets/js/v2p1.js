
else if(tab==="carousel"){if(!data.site)data.site={};if(!data.site.carousel)data.site.carousel=[];const L=data.site.carousel;
c.innerHTML=`<div class="card"><div class="card-h"><h3>${L.length} اسلاید</h3><button class="btn btn-primary btn-sm" id="add">+ اسلاید</button></div>
<table><thead><tr><th>#</th><th>دستور</th><th>عنوان</th><th></th></tr></thead><tbody>
${L.map((s,i)=>`<tr><td>${i+1}</td><td dir="ltr">${esc(s.recipeId)}</td><td>${esc(s.title)}</td>
<td class="actions"><button class="btn btn-ghost btn-sm" data-e="${i}">ویرایش</button><button class="btn btn-danger btn-sm" data-d="${i}">حذف</button></td></tr>`).join("")}
</tbody></table></div>`;
$("#add").onclick=()=>edCar(-1);$$("[data-e]").forEach(b=>b.onclick=()=>edCar(+b.dataset.e));
$$("[data-d]").forEach(b=>b.onclick=()=>{data.site.carousel.splice(+b.dataset.d,1);mark("site");render()})}

else if(tab==="tutorials"){const L=data.tutorials||[];
c.innerHTML=`<div class="card"><div class="card-h"><h3>${L.length} آموزش</h3><button class="btn btn-primary btn-sm" id="add">+ جدید</button></div>
<table><thead><tr><th>عنوان</th><th>سطح</th><th></th></tr></thead><tbody>
${L.map((t,i)=>`<tr><td>${esc(t.icon)} ${esc(t.title)}</td><td>${esc(t.level)}</td>
<td class="actions"><button class="btn btn-ghost btn-sm" data-e="${i}">ویرایش</button><button class="btn btn-danger btn-sm" data-d="${i}">حذف</button></td></tr>`).join("")}
</tbody></table></div>`;
$("#add").onclick=()=>edT(-1);$$("[data-e]").forEach(b=>b.onclick=()=>edT(+b.dataset.e));
$$("[data-d]").forEach(b=>b.onclick=()=>{if(confirm("حذف؟")){data.tutorials.splice(+b.dataset.d,1);mark("tutorials");render()}})}

else if(tab==="gallery"){const L=data.gallery||[];
c.innerHTML=`<div class="card"><div class="card-h"><h3>${L.length} گالری</h3><button class="btn btn-primary btn-sm" id="add">+ جدید</button></div>
<table><thead><tr><th>عکس</th><th>کپشن</th><th></th></tr></thead><tbody>
${L.map((g,i)=>`<tr><td>${imgTag(g.image||"")}</td><td>${esc(g.art?.emoji||"")} ${esc(g.caption)}</td>
<td class="actions"><button class="btn btn-ghost btn-sm" data-e="${i}">ویرایش</button><button class="btn btn-danger btn-sm" data-d="${i}">حذف</button></td></tr>`).join("")}
</tbody></table></div>`;
$("#add").onclick=()=>edG(-1);$$("[data-e]").forEach(b=>b.onclick=()=>edG(+b.dataset.e));
$$("[data-d]").forEach(b=>b.onclick=()=>{if(confirm("حذف؟")){data.gallery.splice(+b.dataset.d,1);mark("gallery");render()}})}

else if(tab==="comments"){const L=data.comments||[];
c.innerHTML=`<div class="card"><div class="card-h"><h3>${L.length} نظر (JSON)</h3><button class="btn btn-primary btn-sm" id="add">+ نظر</button></div>
<table><thead><tr><th>نام</th><th>متن</th><th></th></tr></thead><tbody>
${L.map((x,i)=>`<tr><td>${esc(x.name)}</td><td>${esc(x.text)}</td>
<td class="actions"><button class="btn btn-ghost btn-sm" data-e="${i}">ویرایش</button><button class="btn btn-danger btn-sm" data-d="${i}">حذف</button></td></tr>`).join("")}
</tbody></table></div>`;
$("#add").onclick=()=>edCm(-1);$$("[data-e]").forEach(b=>b.onclick=()=>edCm(+b.dataset.e));
$$("[data-d]").forEach(b=>b.onclick=()=>{data.comments.splice(+b.dataset.d,1);mark("comments");render()})}
