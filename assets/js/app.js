/* 逝去的地貌 — 渲染与地图 */
(function () {
  const D = window.HISTGEO;
  const colorOf = {
    yellow:'#c0392b', dongting:'#16a085', subei:'#2980b9', maowusu:'#d35400', silkroad:'#8e44ad',
    maritime:'#0e7490', agropastoral:'#65a30d', haihe:'#546e7a', admin:'#be185d', taihu:'#115e59',
    climate:'#fbbf24', hhlakes:'#38bdf8', migration:'#fb7185', irrigation:'#a78bfa'
  };

  // ---- 顶部导航 + 英雄 ----
  const nav = document.getElementById('nav');
  nav.innerHTML = '<a href="#overview">总览</a><a href="#numbers">数字</a>' +
    D.themes.map(t => `<a href="#t-${t.id}">${t.title.split('：')[0]}</a>`).join('') +
    '<a href="#mapall">地图</a>';

  document.getElementById('heroTags').innerHTML = D.threads.map(t => `<span>${t.k} · ${t.t}</span>`).join('');
  document.getElementById('heroSrc').textContent = '资料依据：' + D.meta.source;

  // ---- 英文层（少量） ----
  const EN = D.en || { themes:{} };
  const enOf = (id) => (EN.themes && EN.themes[id]) || {};
  document.getElementById('heroEnTitle').textContent = EN.title || '';
  document.getElementById('heroEnSub').textContent = EN.subtitle || '';

  // ---- 总览 ----
  document.getElementById('threads').innerHTML = D.threads.map(t => `
    <div class="thread"><span class="k">${t.k}</span><h3>${t.t}</h3><p>${t.d}</p></div>`).join('');

  // ---- 数字 ----
  document.getElementById('stats').innerHTML = D.stats.map(s => `
    <div class="stat"><div class="v">${s.v}</div><div class="l">${s.l}</div></div>`).join('');

  // ---- 主题 ----
  const themesEl = document.getElementById('themes');
  themesEl.innerHTML = D.themes.map(t => `
    <section class="theme" id="t-${t.id}">
      <div class="theme-head">
        <span class="tag" style="background:${colorOf[t.id]}">${t.tag}</span>
        <h2>${t.title}</h2>
      </div>
      <p class="en-name">${enOf(t.id).name || ''}</p>
      <p class="lead">${t.lead}</p>
      <p class="lead-en">${enOf(t.id).lead || ''}</p>
      <div class="cols">
        <div>
          <div class="panel principle">
            <h3><span class="ic">◈</span>背后的原理</h3>
            <p>${t.principle.summary}</p>
            <ul>${t.principle.points.map(p => `<li>${p}</li>`).join('')}</ul>
            <div class="periods">
              ${t.principle.periods.map(p => { const i = p.indexOf('：'); return i>0 ? `<p><b>${p.slice(0,i)}</b>${p.slice(i)}</p>` : `<p>${p}</p>`; }).join('')}
            </div>
          </div>
          <div class="relics">
            <div class="panel">
              <h3><span class="ic">⌖</span>现存实例（今日仍可寻见）</h3>
              ${t.relics.map(r => `<div class="relic"><span class="n"></span><p>${r}</p></div>`).join('')}
            </div>
          </div>
        </div>
        <div>
          <div class="panel">
            <h3><span class="ic">🕑</span>变迁时间轴</h3>
            <div class="timeline">
              ${t.timeline.map(it => `<div class="tl-item"><div class="y">${it.y}</div><div class="e">${it.e}</div></div>`).join('')}
            </div>
          </div>
          <div class="panel" style="margin-top:18px">
            <h3><span class="ic">📍</span>证据点</h3>
            <div class="siterow">
              ${t.sites.map(s => `
                <div class="site">
                  <div class="t"><span class="dot" style="background:${s.color}"></span>
                    <span class="nm">${s.name}</span><span class="kd">${s.kind}</span></div>
                  <div class="st">${s.status}</div>
                  <div class="d">${s.desc}</div>
                </div>`).join('')}
            </div>
          </div>
          <div class="mapbox" id="map-${t.id}" style="height:320px;margin-top:18px"></div>
          <p class="maptip">点击标记查看原理关联与现状。</p>
        </div>
      </div>
    </section>`).join('');

  // ---- 脚注 ----
  document.getElementById('footEn').textContent = EN.footer || '';
  document.getElementById('footNote').textContent = D.meta.note + ' 原理取自邹逸麟《中国历史地理概述》；现状数据来自洞庭湖水利事务中心、陕西省林业局、黄河水利委员会、水利部淮河水利史、泉州申遗办/人民网、上海博物馆青龙镇考古、天津市方志与水务资料、竺可桢《中国近五千年来气候变迁的初步研究》、《汉书·地理志》与《后汉书·郡国志》、中国人民大学清史研究所古湖研究、国际灌排委员会世界灌溉工程遗产名录、中国南水北调集团与雄安新区公开数据、新华社等公开资料（2023—2026）。';

  // ---- 地图引擎 ----
  const mkIcon = (c) => L.divIcon({ className:'', html:
    `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${c};border:2px solid #fff;box-shadow:0 0 0 1px ${c}"></span>`,
    iconSize:[14,14], iconAnchor:[7,7] });

  const bindTheme = (t) => {
    const m = L.map(`map-${t.id}`, { scrollWheelZoom:false }).setView([34,110], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom:15, attribution:'© OpenStreetMap' }).addTo(m);
    const pts = t.sites.map(s => [s.coord[0], s.coord[1]]);
    const bounds = L.latLngBounds(pts);
    t.sites.forEach(s => {
      L.marker(s.coord, { icon: mkIcon(s.color) }).addTo(m)
        .bindPopup(`<b>${s.name}</b><br><span style="color:#888">${s.kind}</span><br>${s.desc}<br><i style="color:#1f6f5c">${s.status}</i>`);
    });
    m.fitBounds(bounds.pad(0.25));
  };
  D.themes.forEach(bindTheme);

  // ---- 总地图 ----
  const mAll = L.map('mapAll', { scrollWheelZoom:false }).setView([35,105], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom:15, attribution:'© OpenStreetMap' }).addTo(mAll);
  const groupByTheme = {};
  D.themes.forEach(t => {
    groupByTheme[t.id] = L.layerGroup().addTo(mAll);
    t.sites.forEach(s => {
      L.marker(s.coord, { icon: mkIcon(s.color) }).addTo(groupByTheme[t.id])
        .bindPopup(`<b style="color:${colorOf[t.id]}">${t.title.split('：')[0]}</b><br>${s.name}<br><span style="color:#888">${s.kind}</span><br>${s.desc}`);
    });
  });
  // 图例
  document.getElementById('legend').innerHTML = D.themes.map(t =>
    `<span><i style="background:${colorOf[t.id]}"></i>${t.title.split('：')[0]}</span>`).join('');

  // 点击导航高亮
  document.querySelectorAll('#nav a').forEach(a => {
    a.addEventListener('click', () => {
      const id = a.getAttribute('href').slice(1);
      if (colorOf[id]) {
        Object.keys(groupByTheme).forEach(k => { if (k!==id) mAll.removeLayer(groupByTheme[k]); });
        if (!mAll.hasLayer(groupByTheme[id])) groupByTheme[id].addTo(mAll);
        const pts = D.themes.find(t=>t.id===id).sites.map(s=>[s.coord[0],s.coord[1]]);
        mAll.flyToBounds(L.latLngBounds(pts).pad(0.3), {duration:.8});
        document.getElementById('mapall').scrollIntoView({behavior:'smooth'});
      }
    });
  });

  // 回到顶部
  const totop = document.getElementById('totop');
  window.addEventListener('scroll', () => totop.classList.toggle('show', window.scrollY > 600));
  totop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
})();
