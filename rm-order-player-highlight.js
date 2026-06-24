
/* =========================================================
   ORDEN DE TABLAS + JUGADORES DESTACADOS POR SERIE
   1. Posiciones por serie
   2. Tabla acumulativa de clubes
   3. Ranking de mejores series
   4. Jugadores destacados
========================================================= */
(function(){
  if(window.__RM_ORDER_TABLES_HIGHLIGHTS__) return;
  window.__RM_ORDER_TABLES_HIGHLIGHTS__ = true;

  const SERIES_ORDER = [
    'Peques','Segunda Infantil','Primera Infantil','Juveniles',
    'Serie de Oro','Super Senior','Senior 35','Serie Damas',
    'Serie de Honor','Primera Adulta','Segunda Adulta','Serie Platino'
  ];

  function esc(value){
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[char]));
  }

  function clean(value){
    return String(value || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/^serie\s+/i,'')
      .replace(/\b1ra?\b/ig,'primera')
      .replace(/\b2da?\b/ig,'segunda')
      .replace(/\s+/g,' ')
      .trim()
      .toLowerCase();
  }

  function canonicalSerie(value){
    const raw = String(value || '').trim();
    const key = clean(raw);
    const match = SERIES_ORDER.find(serie => clean(serie) === key);
    return match || raw || 'General';
  }

  function getPublicData(){
    try {
      if(typeof getData === 'function') return getData() || {};
    } catch(e) {}
    return {};
  }

  function playerHighlights(data){
    const list = Array.isArray(data.playerHighlights) ? data.playerHighlights : [];
    return list
      .map(item => ({
        serie: canonicalSerie(item.serie || item.series || ''),
        name: item.name || item.nombre || '',
        image: item.image || item.photo || item.foto || item.url || '',
        tactica: item.tactica !== false,
        garra: item.garra !== false,
        liderazgo: item.liderazgo !== false,
        updatedAt: item.updatedAt || item.fecha || ''
      }))
      .filter(item => item.serie || item.name);
  }

  function ensureHighlightsSection(){
    let section = document.getElementById('playerHighlightsSection');
    if(!section){
      section = document.createElement('section');
      section.id = 'playerHighlightsSection';
      section.className = 'section rm-player-highlights-section';
    }
    return section;
  }

  function renderHighlights(){
    const data = getPublicData();
    const highlights = playerHighlights(data)
      .sort((a,b) => {
        const ai = SERIES_ORDER.indexOf(a.serie);
        const bi = SERIES_ORDER.indexOf(b.serie);
        return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
      });

    const section = ensureHighlightsSection();

    section.innerHTML =
      '<div class="section-head rm-highlight-head">' +
        '<div><h2>Jugador destacado del partido</h2><p>Reconocimiento por serie: táctica, garra y liderazgo.</p></div>' +
        '<span class="rm-highlight-label">RICARDO MÉNDEZ</span>' +
      '</div>' +
      '<div class="rm-player-highlights-grid">' +
      (highlights.length
        ? highlights.map(item =>
          '<article class="rm-player-highlight-card">' +
            (item.image
              ? '<img src="'+esc(item.image)+'" alt="'+esc(item.name || 'Jugador destacado')+'" loading="lazy">'
              : '<div class="rm-player-highlight-photo">RM</div>') +
            '<div class="rm-player-highlight-content">' +
              '<span class="rm-highlight-serie">'+esc(item.serie)+'</span>' +
              '<h3>'+esc(item.name || 'Por definir')+'</h3>' +
              '<div class="rm-highlight-badges">' +
                (item.tactica ? '<span>♟ Táctica</span>' : '') +
                (item.garra ? '<span>🔥 Garra</span>' : '') +
                (item.liderazgo ? '<span>★ Liderazgo</span>' : '') +
              '</div>' +
            '</div>' +
          '</article>'
        ).join('')
        : '<div class="rm-highlight-empty">Aún no hay jugadores destacados cargados. Agrégalos desde el Administrador.</div>') +
      '</div>';

    return section;
  }

  function reorderSportsSections(){
    const positions = document.getElementById('rmFecha8Standings') ||
                      document.getElementById('posiciones');
    const cumulative = document.getElementById('ranking');
    const seriesRanking = document.getElementById('seriesRankingSection');
    const highlights = renderHighlights();

    if(!positions || !positions.parentElement) return;
    const parent = positions.parentElement;

    // Orden fijo solicitado:
    // Posiciones por serie -> Acumulativa -> Ranking mejores series -> Jugadores destacados.
    if(cumulative && cumulative.parentElement === parent){
      positions.insertAdjacentElement('afterend', cumulative);
    }
    if(seriesRanking && seriesRanking.parentElement === parent){
      (cumulative || positions).insertAdjacentElement('afterend', seriesRanking);
    }
    const previous = seriesRanking || cumulative || positions;
    previous.insertAdjacentElement('afterend', highlights);

    [positions, cumulative, seriesRanking, highlights].filter(Boolean).forEach(node => {
      node.hidden = false;
      node.style.setProperty('display','block','important');
      node.style.setProperty('visibility','visible','important');
      node.style.setProperty('opacity','1','important');
      node.style.setProperty('height','auto','important');
      node.style.setProperty('max-height','none','important');
    });
  }

  function boot(){
    reorderSportsSections();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => {
      boot();
      setTimeout(boot, 900);
    }, {once:true});
  } else {
    boot();
    setTimeout(boot, 900);
  }

  window.rmOrderSportsTablesAndHighlights = boot;
})();
