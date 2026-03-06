/* ============================================================
   Nurturing Academy — Shared JavaScript
   ============================================================ */

/* ---------- CONSTANTS ---------- */
const STORAGE_KEY = 'nurturing-academy-progress';
const CHECK_SVG = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13.3 4.3L6 11.6L2.7 8.3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------- PROGRESS SYSTEM ---------- */
const ALL_SECTIONS = [
  /* index.html — Inicio + Historia */
  'hist-historia','hist-filosofia',
  /* sistema.html — El Sistema */
  'sis-vision','sis-funnel','sis-puertas','sis-ql','sis-quiz',
  /* analisis.html — Caso de Estudio + Numeros */
  'ana-caso','ana-reporte','ana-lecciones','ana-numeros','ana-quiz',
  /* deliverys.html — Reporte Deliverys */
  'del-resumen','del-metricas','del-bienvenidos','del-conversion','del-segmentos','del-accion',
  /* full-funnel.html — Full-Funnel Report */
  'ff-resumen','ff-etapas','ff-segmentos','ff-emails','ff-desgaste','ff-broadcasts',
  /* herramientas.html — HubSpot */
  'hs-intro','hs-contactos','hs-workflows','hs-emails','hs-broadcasts','hs-modelo','hs-importacion','hs-propiedades','hs-quiz',
  /* estrategia.html — Estrategia 2026 */
  'est-vision','est-pilares','est-proyectos','est-riesgos','est-framework','est-quiz',
  /* recursos.html — Recursos */
  'rec-ruta','rec-glosario'
];

function getProgress(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{}}catch(e){return{}}
}
function saveProgress(p){localStorage.setItem(STORAGE_KEY,JSON.stringify(p))}

function markAsRead(sectionId){
  const p=getProgress();
  p[sectionId]=true;
  saveProgress(p);
  updateProgressUI();
  const btn=document.querySelector(`.mark-read-btn[data-section="${sectionId}"]`);
  if(btn){
    btn.classList.add('done');
    btn.innerHTML=CHECK_SVG+' <span>Completada</span>';
  }
  const tab=document.querySelector(`.sub-tab[data-sub="${sectionId}"]`);
  if(tab)tab.classList.add('done');
}

function updateProgressUI(){
  const p=getProgress();
  const done=ALL_SECTIONS.filter(s=>p[s]).length;
  const total=ALL_SECTIONS.length;
  const pct=Math.round(done/total*100);
  document.querySelectorAll('.progress-strip-fill,.progress-mini-fill').forEach(el=>{
    el.style.width=pct+'%';
  });
  document.querySelectorAll('.progress-text').forEach(el=>{
    el.textContent=done+'/'+total;
  });
  // Update dashboard card progress if on index page
  document.querySelectorAll('.card-progress-fill').forEach(el=>{
    const sections=(el.dataset.sections||'').split(',').filter(Boolean);
    if(sections.length){
      const cardDone=sections.filter(s=>p[s]).length;
      el.style.width=Math.round(cardDone/sections.length*100)+'%';
    }
  });
  // Update sub-tab checkmarks
  ALL_SECTIONS.forEach(s=>{
    if(p[s]){
      const tab=document.querySelector(`.sub-tab[data-sub="${s}"]`);
      if(tab)tab.classList.add('done');
      const btn=document.querySelector(`.mark-read-btn[data-section="${s}"]`);
      if(btn){btn.classList.add('done');btn.innerHTML=CHECK_SVG+' <span>Completada</span>';}
    }
  });
}

/* ---------- NAVIGATION ---------- */
function updateActiveTab(){
  document.querySelectorAll('.header-tab').forEach(t=>t.classList.remove('active'));
  const activePage=document.querySelector('.page.active');
  if(activePage){
    const pageId=activePage.dataset.page;
    const matchTab=document.querySelector(`.header-tab[data-page="${pageId}"]`);
    if(matchTab)matchTab.classList.add('active');
  }
}

function switchToPage(pageId){
  const page=document.querySelector(`.page[data-page="${pageId}"]`);
  if(!page)return;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  page.classList.add('active');
  // Reset to first sub-tab
  const subs=page.querySelectorAll('.sub-page');
  const tabs=page.querySelectorAll('.sub-tab');
  if(subs.length){
    subs.forEach(sp=>sp.classList.remove('active'));
    subs[0].classList.add('active');
    tabs.forEach(t=>t.classList.remove('active'));
    if(tabs[0])tabs[0].classList.add('active');
  }
  updateActiveTab();
  window.scrollTo({top:0});
  history.replaceState(null,'','#'+pageId);
}

function initNavigation(){
  const currentFile=window.location.pathname.split('/').pop()||'index.html';
  const hash=window.location.hash.replace('#','');

  // Handle hash on page load (show correct page)
  if(hash){
    const page=document.querySelector(`.page[data-page="${hash}"]`);
    if(page){
      document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
      page.classList.add('active');
    }
    // Check if hash matches a sub-page
    const subPage=document.querySelector(`.sub-page[data-sub="${hash}"]`);
    if(subPage){
      const parentPage=subPage.closest('.page');
      if(parentPage){
        document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
        parentPage.classList.add('active');
        parentPage.querySelectorAll('.sub-page').forEach(sp=>sp.classList.remove('active'));
        subPage.classList.add('active');
        parentPage.querySelectorAll('.sub-tab').forEach(t=>{
          t.classList.toggle('active',t.dataset.sub===hash);
        });
      }
    }
  }

  // Set the correct header tab as active
  updateActiveTab();

  // Same-page header tab clicks (prevent reload, switch in JS)
  document.querySelectorAll('.header-tab').forEach(tab=>{
    const href=tab.getAttribute('href')||'';
    const tabFile=href.split('#')[0]||currentFile;
    const isSamePage=(tabFile===currentFile)||(currentFile===''&&tabFile==='index.html');
    if(isSamePage && tab.dataset.page){
      tab.addEventListener('click',(e)=>{
        e.preventDefault();
        switchToPage(tab.dataset.page);
      });
    }
  });

  // Sub-tabs within a page
  document.querySelectorAll('.sub-tab').forEach(tab=>{
    tab.addEventListener('click',()=>{
      const targetSub=tab.dataset.sub;
      const parent=tab.closest('.page');
      if(!parent)return;
      parent.querySelectorAll('.sub-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      parent.querySelectorAll('.sub-page').forEach(sp=>sp.classList.remove('active'));
      const target=parent.querySelector(`.sub-page[data-sub="${targetSub}"]`);
      if(target){target.classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}
    });
  });

  // data-goto-page links (dashboard cards, etc.)
  document.querySelectorAll('[data-goto-page]').forEach(el=>{
    el.addEventListener('click',(e)=>{
      const targetPage=el.dataset.gotoPage;
      // Check if this page exists in current document
      if(document.querySelector(`.page[data-page="${targetPage}"]`)){
        e.preventDefault();
        switchToPage(targetPage);
      }
      // Otherwise let the <a> href navigate normally
    });
  });

  // data-goto-sub links (inline article links)
  document.querySelectorAll('[data-goto-sub]').forEach(el=>{
    el.addEventListener('click',(e)=>{
      e.preventDefault();
      const targetSub=el.dataset.gotoSub;
      const subPage=document.querySelector(`.sub-page[data-sub="${targetSub}"]`);
      if(subPage){
        const parentPage=subPage.closest('.page');
        if(parentPage){
          document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
          parentPage.classList.add('active');
          parentPage.querySelectorAll('.sub-page').forEach(sp=>sp.classList.remove('active'));
          subPage.classList.add('active');
          parentPage.querySelectorAll('.sub-tab').forEach(t=>{
            t.classList.toggle('active',t.dataset.sub===targetSub);
          });
          updateActiveTab();
        }
        window.scrollTo({top:0});
      }
    });
  });
}

/* ---------- GLOSSARY ---------- */
function initGlossary(){
  const panel=document.getElementById('glos-panel');
  const overlay=document.getElementById('glos-overlay');
  const searchInput=panel?.querySelector('.glos-search input');
  if(!panel)return;

  document.querySelectorAll('.glos-trigger').forEach(btn=>{
    btn.addEventListener('click',()=>{
      panel.classList.toggle('show');
      overlay.classList.toggle('show');
      if(panel.classList.contains('show'))searchInput?.focus();
    });
  });
  overlay?.addEventListener('click',()=>{
    panel.classList.remove('show');
    overlay.classList.remove('show');
  });
  panel.querySelector('.glos-close')?.addEventListener('click',()=>{
    panel.classList.remove('show');
    overlay.classList.remove('show');
  });

  searchInput?.addEventListener('input',()=>{
    const q=searchInput.value.toLowerCase().trim();
    panel.querySelectorAll('.glos-item').forEach(item=>{
      const term=item.querySelector('.glos-term')?.textContent.toLowerCase()||'';
      const def=item.querySelector('.glos-def')?.textContent.toLowerCase()||'';
      item.classList.toggle('hidden',q&&!term.includes(q)&&!def.includes(q));
    });
  });
}

/* ---------- QUIZ SYSTEM ---------- */
function initQuizzes(){
  document.querySelectorAll('.quiz-card').forEach(card=>{
    const correctValue=card.dataset.correct; // e.g. "b"
    const opts=card.querySelectorAll('.q-opt');
    const radios=card.querySelectorAll('input[type="radio"]');
    const fbRight=card.querySelector('.q-feedback.q-right');
    const fbWrong=card.querySelector('.q-feedback.q-wrong');

    radios.forEach(radio=>{
      radio.addEventListener('change',()=>{
        if(card.classList.contains('answered'))return;
        card.classList.add('answered');
        const selected=radio.value;
        const isCorrect=selected===correctValue;

        // Disable all radios
        radios.forEach(r=>{r.disabled=true});
        opts.forEach(o=>o.classList.add('disabled'));

        // Highlight selected option
        const selectedLabel=radio.closest('.q-opt');
        selectedLabel.classList.add(isCorrect?'correct':'wrong');

        // Show correct answer if wrong
        if(!isCorrect){
          opts.forEach(o=>{
            const r=o.querySelector('input[type="radio"]');
            if(r&&r.value===correctValue)o.classList.add('correct');
          });
        }

        // Show feedback
        if(isCorrect&&fbRight){fbRight.classList.add('show')}
        if(!isCorrect&&fbWrong){fbWrong.classList.add('show')}
      });
    });
  });
}

/* ---------- ACCORDION ---------- */
function initAccordions(){
  document.querySelectorAll('.accordion-trigger').forEach(trigger=>{
    trigger.addEventListener('click',()=>{
      const item=trigger.closest('.accordion-item');
      item.classList.toggle('open');
    });
  });
}

/* ---------- ANIMATE ON SCROLL ---------- */
function initScrollAnimations(){
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  },{threshold:0.08});
  document.querySelectorAll('.animate-in').forEach(el=>observer.observe(el));
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  initNavigation();
  initGlossary();
  initQuizzes();
  initAccordions();
  initScrollAnimations();
  updateProgressUI();
});
