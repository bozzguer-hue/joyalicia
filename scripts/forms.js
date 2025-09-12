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
          // CHAOS: Create confetti explosion!
          createConfetti();
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

  // CHAOS FUNCTIONS FOR PERSONALITY!
  function createConfetti() {
    const confettiElements = ['🎉', '🥂', '📚', '💕', '🎭', '✨'];
    for(let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.textContent = confettiElements[Math.floor(Math.random() * confettiElements.length)];
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.fontSize = '2rem';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.animation = 'confettiFall 3s ease-out forwards';
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 3000);
    }
  }

  // Add confetti CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confettiFall {
      0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Random encouraging messages when hovering over buttons
  const encouragements = [
    "Yes! Do it! 💪",
    "You know you want to! 😏",
    "Best decision ever! 🎉",
    "Join the chaos! 🎭",
    "Why are you hesitating? 🤔"
  ];

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if(!btn.getAttribute('data-encouraged')) {
        const encouragement = document.createElement('div');
        encouragement.textContent = encouragements[Math.floor(Math.random() * encouragements.length)];
        encouragement.style.position = 'absolute';
        encouragement.style.bottom = '110%';
        encouragement.style.left = '50%';
        encouragement.style.transform = 'translateX(-50%) rotate(-5deg)';
        encouragement.style.background = '#ff8966';
        encouragement.style.color = 'white';
        encouragement.style.padding = '8px 12px';
        encouragement.style.borderRadius = '15px';
        encouragement.style.fontSize = '0.9rem';
        encouragement.style.fontWeight = 'bold';
        encouragement.style.whiteSpace = 'nowrap';
        encouragement.style.opacity = '0';
        encouragement.style.transition = 'opacity 0.3s ease';
        encouragement.style.pointerEvents = 'none';
        encouragement.style.zIndex = '1000';
        
        btn.style.position = 'relative';
        btn.appendChild(encouragement);
        
        setTimeout(() => encouragement.style.opacity = '1', 10);
        
        btn.addEventListener('mouseleave', () => {
          encouragement.style.opacity = '0';
          setTimeout(() => encouragement.remove(), 300);
        }, {once: true});
        
        btn.setAttribute('data-encouraged', 'true');
      }
    });
  });

  // Easter egg: Konami code for extra chaos
  let konamiCode = '';
  const konamiTarget = 'chaos';
  document.addEventListener('keydown', (e) => {
    konamiCode += e.key.toLowerCase();
    if(konamiCode.length > konamiTarget.length) {
      konamiCode = konamiCode.slice(-konamiTarget.length);
    }
    if(konamiCode === konamiTarget) {
      activateChaosMode();
      konamiCode = '';
    }
  });

  function activateChaosMode() {
    // Temporary chaos mode
    document.body.style.animation = 'shake 0.5s ease-in-out 3';
    createConfetti();
    
    // Add shake animation
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px) rotate(1deg); }
        75% { transform: translateX(5px) rotate(-1deg); }
      }
    `;
    document.head.appendChild(shakeStyle);
    
    // Show chaos message
    const chaosMsg = document.createElement('div');
    chaosMsg.textContent = '🎭 CHAOS MODE ACTIVATED! 🎭';
    chaosMsg.style.position = 'fixed';
    chaosMsg.style.top = '50%';
    chaosMsg.style.left = '50%';
    chaosMsg.style.transform = 'translate(-50%, -50%)';
    chaosMsg.style.background = 'linear-gradient(135deg, #ff8966, #ff69b4)';
    chaosMsg.style.color = 'white';
    chaosMsg.style.padding = '20px 30px';
    chaosMsg.style.borderRadius = '25px';
    chaosMsg.style.fontSize = '2rem';
    chaosMsg.style.fontWeight = 'bold';
    chaosMsg.style.zIndex = '10000';
    chaosMsg.style.animation = 'popIn 0.5s ease-out';
    document.body.appendChild(chaosMsg);
    
    setTimeout(() => {
      chaosMsg.style.animation = 'popOut 0.5s ease-in forwards';
      setTimeout(() => chaosMsg.remove(), 500);
    }, 2000);
    
    // Add pop out animation
    const popStyle = document.createElement('style');
    popStyle.textContent = `
      @keyframes popOut {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
      }
    `;
    document.head.appendChild(popStyle);
  }
});
