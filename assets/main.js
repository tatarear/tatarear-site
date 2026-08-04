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

  const tabs = document.querySelectorAll('.tab');
  const form = document.getElementById('conecta-form');
  const descLabel = document.getElementById('desc-label');
  const descInput = document.getElementById('descripcion');
  const descText = {
    ofrezco: {label:'¿Qué ofreces?', placeholder:'Describe brevemente lo que ofreces y a quién puede servirle.'},
    busco: {label:'¿Qué necesitas?', placeholder:'Describe brevemente lo que necesitas y quién podría ayudarte.'}
  };
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.dataset.mode;
      form.dataset.modo = mode === 'busco' ? 'Busco' : 'Ofrezco';
      const t = descText[mode];
      if (descLabel) descLabel.textContent = t.label;
      if (descInput) descInput.placeholder = t.placeholder;
    });
  });

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

  if (form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('.submit-btn');
      const noteEl = document.getElementById('conecta-note');
      const payload = {
        modo: form.dataset.modo || 'Ofrezco',
        categoria: form.categoria.value,
        nombre: form.nombre.value,
        ciudad: form.ciudad.value,
        descripcion: form.descripcion.value,
        contacto: form.contacto.value,
        consiente: form.consiente.checked
      };
      if (submitBtn) submitBtn.disabled = true;
      try{
        const res = await fetch('/api/submit', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al enviar');
        if (noteEl){
          noteEl.textContent = 'Gracias — tu publicación entró a revisión y aparecerá en el muro en cuanto sea aprobada.';
          noteEl.hidden = false;
        }
        form.reset();
      }catch(err){
        if (noteEl){
          noteEl.textContent = 'No se pudo enviar tu publicación. Intenta de nuevo en unos minutos.';
          noteEl.hidden = false;
        }
      }finally{
        if (submitBtn) submitBtn.disabled = form.consiente.checked ? false : true;
      }
    });
    form.consiente.addEventListener('change', () => {
      form.querySelector('.submit-btn').disabled = !form.consiente.checked;
    });
  }
})();
