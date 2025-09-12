// Client-side form helper: submits forms via /api/form-proxy and shows success/error messages
document.addEventListener('DOMContentLoaded', function(){
  function handleForm(form){
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      const submit = form.querySelector('button[type=submit]');
      submit.disabled = true;
      const formData = new FormData(form);
      const payload = {};
      formData.forEach((v,k)=>payload[k]=v);

      // simple honeypot
      if(payload._gotcha){
        form.dispatchEvent(new CustomEvent('form:success'));
        submit.disabled = false;
        return;
      }

      try{
        const res = await fetch('/api/form-proxy',{
          method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
        });
        if(res.ok){
          form.querySelector('.form-msg')?.remove();
          const msg = document.createElement('div'); msg.className='form-msg success'; msg.textContent='Welcome to the Bad Date Club 🎉 Check your inbox.';
          form.appendChild(msg);
          form.reset();
        } else {
          const msg = document.createElement('div'); msg.className='form-msg error'; msg.textContent='Oops—try again. Internet ghosts strike again.';
          form.appendChild(msg);
        }
      } catch(err){
        const msg = document.createElement('div'); msg.className='form-msg error'; msg.textContent='Network error. Try again later.';
        form.appendChild(msg);
      } finally{ submit.disabled = false; }
    });
  }

  document.querySelectorAll('form').forEach(f=>handleForm(f));

  // accessible rotator: pause/resume control
  const rotator = document.getElementById('latest-rotator');
  if(rotator){
    const ctrl = document.createElement('button'); ctrl.className='rotator-control'; ctrl.textContent='Pause';
    ctrl.setAttribute('aria-pressed','false'); ctrl.style.marginLeft='12px';
    let paused = false; let intervalId = null;
    // reuse existing interval via custom event: start/stop logic
    function start(){
      intervalId = setInterval(()=>{ const cards=Array.from(rotator.children); const idx = cards.findIndex(c=>c.style.display!=='none'); cards[idx].style.display='none'; const next = (idx+1)%cards.length; cards[next].style.display='block'; },4000);
    }
    function stop(){ clearInterval(intervalId); intervalId = null; }
    // start default
    start();
    ctrl.addEventListener('click', ()=>{
      paused = !paused;
      if(paused){ stop(); ctrl.textContent='Resume'; ctrl.setAttribute('aria-pressed','true'); }
      else { start(); ctrl.textContent='Pause'; ctrl.setAttribute('aria-pressed','false'); }
    });
    rotator.parentNode.insertBefore(ctrl, rotator.nextSibling);
  }
});
