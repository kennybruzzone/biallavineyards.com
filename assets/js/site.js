// Bialla Vineyards: reveal-on-scroll + contact form (delivered via FormSubmit AJAX).
(function(){
  document.documentElement.classList.add('js');
  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){io.observe(el);});
  } else els.forEach(function(el){el.classList.add('is-in');});

  var form=document.getElementById('contact-form');
  if(!form) return;
  var ENDPOINT='https://formsubmit.co/ajax/support@biallavineyards.com';
  var emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var btn=form.querySelector('button[type="submit"]'), btnLabel=btn.firstChild.nodeValue;
  function check(field){
    var input=field.querySelector('input,textarea'), v=input.value.trim(), ok=v.length>0;
    if(ok && input.type==='email') ok=emailRe.test(v);
    field.classList.toggle('is-invalid',!ok);
    input.setAttribute('aria-invalid',ok?'false':'true');
    return ok;
  }
  function done(){
    form.classList.remove('has-error'); form.classList.add('is-sent');
    var s=form.querySelector('.form__success'); s.setAttribute('tabindex','-1'); s.focus();
  }
  function fail(){
    btn.disabled=false; btn.firstChild.nodeValue=btnLabel;
    form.classList.add('has-error');
    var e=form.querySelector('.form__error'); e.setAttribute('tabindex','-1'); e.focus();
  }
  form.querySelectorAll('.field').forEach(function(f){
    var i=f.querySelector('input,textarea');
    i.addEventListener('blur',function(){ if(i.value) check(f); });
    i.addEventListener('input',function(){ if(f.classList.contains('is-invalid')) check(f); });
  });
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var fields=[].slice.call(form.querySelectorAll('.field')), ok=true, first=null;
    fields.forEach(function(f){ if(!check(f)){ ok=false; if(!first) first=f; } });
    if(!ok){ first.querySelector('input,textarea').focus(); return; }
    var honey=form.querySelector('[name="_honey"]');
    if(honey && honey.value){ done(); return; } // likely a bot: pretend success, send nothing
    btn.disabled=true; btn.firstChild.nodeValue='Sending\u2026 ';
    form.classList.remove('has-error');
    var data={
      name:form.elements.name.value.trim(),
      email:form.elements.email.value.trim(),
      message:form.elements.message.value.trim(),
      _replyto:form.elements.email.value.trim(),
      _subject:'New inquiry from biallavineyards.com',
      _template:'table',
      _captcha:'false',
      _honey:''
    };
    fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
      .then(function(r){ return r.json().catch(function(){return {};}).then(function(j){ return {ok:r.ok,j:j}; }); })
      .then(function(res){ var s=res.j&&res.j.success; if(res.ok && (s===true||s==='true')) done(); else fail(); })
      .catch(fail);
  });
})();
