
else if(tab==="site"){const s=data.site||{};
c.innerHTML=`<div class="card"><div class="form-grid">
<label class="field"><span>نام</span><input id="n" value="${esc(s.name||"")}"></label>
<label class="field"><span>دامنه</span><input id="dom" value="${esc(s.domain||"")}" dir="ltr"></label>
<label class="field full"><span>عنوان هیرو</span><input id="ht" value="${esc(s.heroTitle||"")}"></label>
<label class="field full"><span>متن هیرو</span><textarea id="hl" rows="3">${esc(s.heroLead||"")}</textarea></label>
</div><button class="btn btn-primary" id="sv" style="margin-top:1rem;max-width:180px">اعمال</button></div>`;
$("#sv").onclick=()=>{data.site={...data.site,name:$("#n").value.trim(),domain:$("#dom").value.trim(),heroTitle:$("#ht").value.trim(),heroLead:$("#hl").value.trim()};mark("site");toast("اعمال شد")}}
}
