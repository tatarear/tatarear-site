(function(){
  const nav = document.querySelector('.nav');
  const overlay = document.querySelector('.hero-overlay');
  const dictCard = document.querySelector('.dict-card');
  const cue = document.querySelector('.cue');

  function onScroll(){
    const y = window.scrollY;
    const heroH = window.innerHeight;
    const fadeRange = heroH * 0.5;
    const progress = Math.min(y / fadeRange, 1);
    nav.classList.toggle('is-solid', y > 40);
    if (overlay) overlay.style.opacity = 1 - progress;
    if (dictCard){
      dictCard.style.opacity = 1 - progress;
      dictCard.style.transform = `translateY(${progress * -40}px)`;
    }
    if (cue) cue.style.opacity = 1 - Math.min(y / 200, 1);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  document.querySelectorAll('[data-legal]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('legal-' + link.dataset.legal);
      if (target) target.hidden = false;
    });
  });
  document.querySelectorAll('.legal-overlay').forEach(ov => {
    ov.addEventListener('click', () => { ov.hidden = true; });
    ov.querySelector('.legal-box').addEventListener('click', (e) => e.stopPropagation());
    ov.querySelector('.legal-close').addEventListener('click', () => { ov.hidden = true; });
  });

  async function loadMuro(){
    try{
      const res = await fetch('/assets/data/muro.json', {cache:'no-store'});
      if (!res.ok) return;
      const data = await res.json();
      renderPosts('#offer-posts', data.offerPosts || [], false);
      renderPosts('#seek-posts', data.seekPosts || [], true);
      const countEl = document.getElementById('muro-count');
      if (countEl){
        const total = (data.offerPosts||[]).length + (data.seekPosts||[]).length;
        countEl.textContent = `${total} publicaciones`;
      }
    }catch(err){ console.error('No se pudo cargar el muro', err); }
  }
  function esc(s){
    return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function renderPosts(selector, posts, isSeek){
    const container = document.querySelector(selector);
    if (!container) return;
    container.innerHTML = posts.map(p => (
      `<div class="muro-card${isSeek?' seek':''}"><span class="muro-tag">${esc(p.tag)}</span>` +
      `<p>${esc(p.desc)}</p><div class="muro-meta"><span>${esc(p.meta)}</span>` +
      `<button class="muro-connect" type="button">Conectar</button></div></div>`
    )).join('');
  }
  loadMuro();
})();
