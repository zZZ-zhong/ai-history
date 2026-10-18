/* ============================================================
   AI EVOLUTION — 交互层 v2
   1. 时间轴 / 筛选 / 时代索引 / 范式卡组
   2. 详情层路由（深链接、键盘、焦点管理）
   3. 影片引擎：程序化动画（15 种概念画面）+ 真实视频插槽
   4. 深空神经网络背景
   ============================================================ */
(function () {
  'use strict';

  const DATA = window.AI_DATA || { eras: [], events: [], paradigms: [] };
  const events = DATA.events;
  const eras = DATA.eras;
  const paradigms = DATA.paradigms || [];
  const GEO = window.AI_GEO || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BASE_TITLE = document.title;

  // 把地理数据挂到节点上，后面的搜索与地图统一读 item.geo
  events.forEach((item) => {
    item.geo = GEO[item.id] || [];
  });

  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = (str) =>
    String(str).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));

  const els = {
    list: $('#timeline-list'),
    filters: $('#filters'),
    legend: $('#legend-list'),
    deck: $('#deck'),
    empty: $('#tl-empty'),
    progress: $('#tl-progress'),
    hud: $('.hud'),
    typed: $('#typed'),
    randomBtn: $('#random-node'),
    detail: $('#detail'),
    detailPanel: $('.detail-panel'),
    detailScroll: $('#detail-scroll'),
    detailEraText: $('#detail-era-text'),
    detailNode: $('#detail-node'),
    detailYear: $('#detail-year'),
    detailTitle: $('#detail-title'),
    detailEn: $('#detail-en'),
    detailTagline: $('#detail-tagline'),
    detailTags: $('#detail-tags'),
    detailFacts: $('#detail-facts'),
    detailMeta: $('#detail-meta'),
    detailBody: $('#detail-body'),
    detailQuote: $('#detail-quote'),
    prevBtn: $('#prev-btn'),
    nextBtn: $('#next-btn'),
    prevName: $('#prev-name'),
    nextName: $('#next-name'),
    closeBtn: $('#detail-close'),
    film: $('#film'),
    filmStage: $('#film-stage'),
    filmCanvas: $('#film-canvas'),
    filmVideo: $('#film-video'),
    filmChapter: $('#film-chapter'),
    filmCaption: $('#film-caption'),
    filmBigPlay: $('#film-bigplay'),
    filmToggle: $('#film-toggle'),
    filmIcon: $('#film-icon'),
    filmTrack: $('#film-track'),
    filmFill: $('#film-fill'),
    filmMarks: $('#film-marks'),
    filmTime: $('#film-time'),
    filmSteps: $('#film-steps'),
    filmExt: $('#film-ext'),
    filmNote: $('#film-note'),
    // 搜索
    search: $('#hud-search'),
    searchToggle: $('#hud-search-toggle'),
    searchInput: $('#search-input'),
    searchClear: $('#search-clear'),
    searchStatus: $('#search-status'),
    searchResults: $('#search-results'),
    // 地图
    atlas: $('#atlas'),
    atlasMap: $('#atlas-map'),
    atlasMapWrap: $('#atlas-map-wrap'),
    atlasFallback: $('#atlas-fallback'),
    atlasFallbackDesc: $('#atlas-fallback-desc'),
    atlasFallbackGrid: $('#atlas-fallback-grid'),
    atlasNote: $('#atlas-note'),
    atlasYear: $('#atlas-year'),
    atlasYearLabel: $('#atlas-year-label'),
    atlasCount: $('#atlas-count'),
    atlasList: $('#atlas-list'),
    atlasEmpty: $('#atlas-empty'),
    atlasCard: $('#atlas-card'),
    atlasCardMeta: $('#atlas-card-meta'),
    atlasCardTitle: $('#atlas-card-title'),
    atlasCardNote: $('#atlas-card-note'),
    atlasCardEvents: $('#atlas-card-events'),
    atlasReset: $('#atlas-reset'),
    detailAtlas: $('#detail-atlas'),
    detailAtlasText: $('#detail-atlas-text')
  };

  const state = {
    filter: 'all',
    currentId: null,
    opened: false,
    closing: false,
    pushed: false,
    trigger: null
  };

  const eraOf = (id) => eras.find((era) => era.id === id) || { name: '未分类', range: '' };
  const indexOf = (id) => events.findIndex((item) => item.id === id);

  /* ============================================================
     1. 渲染：时间轴 / 筛选 / 索引 / 卡组
     ============================================================ */

  function renderTimeline() {
    const frag = document.createDocumentFragment();

    events.forEach((item, i) => {
      const article = document.createElement('article');
      article.className = 'tl-item';
      article.dataset.id = item.id;
      article.dataset.era = item.era;

      article.innerHTML =
        '<div class="tl-node" aria-hidden="true"><span></span></div>' +
        '<button class="tl-card" type="button" aria-label="查看 ' + item.year + ' 年 ' + esc(item.title) + ' 的详细档案">' +
          '<span class="tl-index">' + String(i + 1).padStart(2, '0') + ' / ' + String(events.length).padStart(2, '0') + '</span>' +
          '<span class="tl-year">' + item.year + '</span>' +
          '<h3 class="tl-title">' + esc(item.title) + '</h3>' +
          '<p class="tl-desc">' + esc(item.tagline) + '</p>' +
          '<span class="tl-tags">' + item.tags.map((t) => '<span class="tl-tag">' + esc(t) + '</span>').join('') + '</span>' +
          '<span class="tl-enter">' + item.sections.length + ' 段档案 · 影片 ' + (item.film ? item.film.steps.length : 3) + ' 章 ' +
            '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
              '<path d="M4 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />' +
            '</svg>' +
          '</span>' +
        '</button>';

      const card = article.querySelector('.tl-card');
      card.addEventListener('click', () => openDetail(item.id, { push: true }));
      attachTilt(article, card);

      frag.appendChild(article);
    });

    els.list.appendChild(frag);
  }

  function attachTilt(article, card) {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine || reduceMotion) return;

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      card.style.setProperty('--mx', (px * 100).toFixed(2) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(2) + '%');
      card.style.setProperty('--ry', ((px - 0.5) * 7).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((0.5 - py) * 5).toFixed(2) + 'deg');
      article.classList.add('is-tilting');
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--my', '0%');
      article.classList.remove('is-tilting');
    });
  }

  function renderFilters() {
    const items = [{ id: 'all', name: '全部节点', range: '1943 — 2025' }].concat(eras);

    els.filters.innerHTML = items
      .map((era) => {
        const count = era.id === 'all' ? events.length : events.filter((e) => e.era === era.id).length;
        return (
          '<button class="chip" type="button" data-era="' + era.id + '" aria-pressed="' + (era.id === 'all') + '">' +
            '<span>' + esc(era.name) + '</span>' +
            '<span class="chip-count">' + String(count).padStart(2, '0') + '</span>' +
          '</button>'
        );
      })
      .join('');

    els.filters.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      state.filter = chip.dataset.era;
      els.filters.querySelectorAll('.chip').forEach((c) => {
        c.setAttribute('aria-pressed', String(c === chip));
      });
      applyFilter();
    });
  }

  function renderLegend() {
    els.legend.innerHTML = eras
      .map(
        (era) =>
          '<li class="legend-item"><span class="lg-dot" aria-hidden="true"></span>' +
          '<span>' + esc(era.name) + '</span>' +
          '<span class="lg-range">' + esc(era.range) + '</span></li>'
      )
      .join('');
  }

  function renderDeck() {
    if (!els.deck) return;

    els.deck.innerHTML = paradigms
      .map(
        (p) =>
          '<div class="pcard" data-paradigm="' + p.id + '">' +
            '<div class="pcard-inner">' +
              '<div class="pcard-face pcard-front">' +
                '<span class="pcard-idx" aria-hidden="true">' + p.index + '</span>' +
                '<p class="pcard-en">' + esc(p.en) + '</p>' +
                '<h3 class="pcard-name">' + esc(p.name) + '</h3>' +
                '<p class="pcard-one">' + esc(p.one) + '</p>' +
                '<div class="pcard-art" aria-hidden="true">' +
                  Array.from({ length: 26 }, function (_, k) {
                    const h = Math.round(14 + Math.abs(Math.sin((k + 1) * 12.9898 + Number(p.index) * 7.31)) * 84);
                    return '<i style="--h:' + h + '%"></i>';
                  }).join('') +
                '</div>' +
                '<span class="pcard-years">' + esc(p.years) + '</span>' +
                '<button class="pcard-flip pcard-toggle" type="button" aria-expanded="false" aria-label="翻转卡片，查看' + esc(p.name) + '的核心机制">' +
                  '查看要点 ⟳' +
                '</button>' +
              '</div>' +
              '<div class="pcard-face pcard-back">' +
                '<p class="pcard-back-label">CORE MECHANISM / 核心机制</p>' +
                '<p class="pcard-core">' + esc(p.core) + '</p>' +
                '<ul class="pcard-keys">' + p.keys.map((k) => '<li><span>' + esc(k) + '</span></li>').join('') + '</ul>' +
                '<div class="pcard-nodes">' +
                  p.nodes
                    .map((id) => {
                      const node = events.find((ev) => ev.id === id);
                      if (!node) return '';
                      return '<button class="pcard-node" type="button" data-node="' + id + '">' +
                        node.year + ' · ' + esc(node.title) + ' →</button>';
                    })
                    .join('') +
                '</div>' +
                '<button class="pcard-flip pcard-toggle" type="button" aria-expanded="true" aria-label="翻回卡片正面">返回 ⟲</button>' +
              '</div>' +
            '</div>' +
          '</div>'
      )
      .join('');

    els.deck.querySelectorAll('.pcard').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.pcard-node')) return;
        toggleCard(card);
      });
    });

    els.deck.querySelectorAll('.pcard-node').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openDetail(btn.dataset.node, { push: true });
      });
    });
  }

  function toggleCard(card) {
    const flipped = card.classList.toggle('is-flipped');
    card.querySelectorAll('.pcard-toggle').forEach((b) => b.setAttribute('aria-expanded', String(flipped)));
  }

  function applyFilter() {
    const matched = searchState.q
      ? new Set(searchState.items.map((row) => row.item.id))
      : null;
    let visible = 0;

    els.list.querySelectorAll('.tl-item').forEach((item) => {
      const eraOk = state.filter === 'all' || item.dataset.era === state.filter;
      const queryOk = !matched || matched.has(item.dataset.id);
      const show = eraOk && queryOk;
      item.hidden = !show;
      if (show) visible += 1;
    });

    els.empty.hidden = visible > 0;
    if (visible === 0 && els.empty) {
      els.empty.textContent = searchState.q
        ? '没有匹配「' + searchState.q + '」的节点，换个关键词试试：2016、辛顿、注意力、杭州。'
        : '该时代暂无节点，请切换其他筛选。';
    }
    updateProgress();
  }

  /* ============================================================
     4. 搜索：年份 / 人物 / 机构 / 技术 / 地点
     ============================================================ */

  const WEIGHTS = {
    year: 100,
    title: 56,
    tags: 30,
    people: 26,
    org: 24,
    geo: 20,
    tagline: 14,
    en: 12,
    body: 7
  };

  const searchState = { q: '', items: [], active: -1, index: null };

  function searchFields(item) {
    return {
      year: String(item.year),
      title: item.title,
      en: item.en || '',
      tagline: item.tagline || '',
      tags: (item.tags || []).join(' '),
      people: item.people || '',
      org: item.org || '',
      geo: (item.geo || []).map((g) => g.place + ' ' + g.country + ' ' + (g.note || '')).join(' '),
      body:
        (item.sections || []).map((s) => s.h + ' ' + s.p).join(' ') +
        (item.quote ? ' ' + item.quote.text + ' ' + item.quote.by : '')
    };
  }

  function searchIndex() {
    if (searchState.index) return searchState.index;
    searchState.index = events.map((item) => {
      const raw = searchFields(item);
      const low = {};
      Object.keys(raw).forEach((key) => {
        low[key] = raw[key].toLowerCase();
      });
      return { item, raw, low };
    });
    return searchState.index;
  }

  // 所有关键词都要命中（AND），按命中字段的权重累加排序
  function scoreEntry(entry, tokens) {
    let score = 0;
    let best = null;

    for (let t = 0; t < tokens.length; t += 1) {
      const token = tokens[t];
      let hit = false;

      Object.keys(WEIGHTS).forEach((key) => {
        const text = entry.low[key];
        if (!text) return;
        const at = text.indexOf(token);
        if (at < 0) return;

        hit = true;
        let weight = WEIGHTS[key];
        if (key === 'year' && text === token) weight += 40;
        score += weight;

        if (!best || WEIGHTS[key] > WEIGHTS[best.key]) best = { key: key, at: at, token: token };
      });

      if (!hit) return null;
    }

    return { score: score, best: best || { key: 'title', at: 0, token: tokens[0] } };
  }

  function snippetOf(entry, best) {
    if (!best) return '';
    const raw = entry.raw[best.key] || '';
    const at = entry.low[best.key].indexOf(best.token);
    if (at < 0) return '';

    const start = Math.max(0, at - 16);
    const end = Math.min(raw.length, at + best.token.length + 44);
    const pre = (start > 0 ? '…' : '') + raw.slice(start, at);
    const mid = raw.slice(at, at + best.token.length);
    const post = raw.slice(at + best.token.length, end) + (end < raw.length ? '…' : '');

    return esc(pre) + '<mark>' + esc(mid) + '</mark>' + esc(post);
  }

  function hideResults() {
    els.searchResults.hidden = true;
    els.searchResults.innerHTML = '';
    els.searchInput.setAttribute('aria-expanded', 'false');
    els.searchInput.removeAttribute('aria-activedescendant');
    searchState.active = -1;
  }

  function setActiveResult(i, scroll) {
    const rows = els.searchResults.querySelectorAll('.sr-item');
    if (!rows.length) return;
    const index = Math.max(0, Math.min(i, rows.length - 1));
    searchState.active = index;

    rows.forEach((row, k) => {
      const on = k === index;
      row.classList.toggle('is-active', on);
      row.setAttribute('aria-selected', String(on));
    });

    const active = rows[index];
    els.searchInput.setAttribute('aria-activedescendant', active.id);
    if (scroll !== false) active.scrollIntoView({ block: 'nearest' });
  }

  function renderResults() {
    const show = searchState.items.slice(0, 8);
    if (!show.length) {
      hideResults();
      return;
    }

    els.searchResults.innerHTML =
      show
        .map((row, i) => {
          const snippet = snippetOf(row.entry, row.best);
          return (
            '<button class="sr-item" type="button" role="option" tabindex="-1" aria-selected="false"' +
            ' id="sr-opt-' + i + '" data-id="' + row.item.id + '">' +
              '<span class="sr-year">' + row.item.year + '</span>' +
              '<span class="sr-main">' +
                '<span class="sr-title">' + esc(row.item.title) + '</span>' +
                (snippet ? '<span class="sr-snip">' + snippet + '</span>' : '') +
              '</span>' +
              '<span class="sr-go" aria-hidden="true">↵</span>' +
            '</button>'
          );
        })
        .join('') +
      '<button class="sr-foot" type="button" data-action="timeline">' +
        '<span>在时间轴中查看 ' + searchState.items.length + ' 个结果</span>' +
        '<span aria-hidden="true">↓</span>' +
      '</button>';

    els.searchResults.hidden = false;
    els.searchResults.querySelectorAll('.sr-item').forEach((btn, i) => {
      btn.addEventListener('click', () => pickResult(i));
      btn.addEventListener('pointerenter', () => setActiveResult(i, false));
    });
    const foot = els.searchResults.querySelector('.sr-foot');
    if (foot) {
      foot.addEventListener('click', () => {
        hideResults();
        const section = $('#timeline');
        if (section) section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    }
  }

  function closeSearchField() {
    if (els.search) els.search.classList.remove('is-open');
    if (els.searchToggle) els.searchToggle.setAttribute('aria-expanded', 'false');
  }

  function openSearchField() {
    if (els.search) els.search.classList.add('is-open');
    if (els.searchToggle) els.searchToggle.setAttribute('aria-expanded', 'true');
  }

  function pickResult(i) {
    const row = searchState.items[i];
    if (!row) return;
    hideResults();
    if (els.searchInput) els.searchInput.blur();
    closeSearchField();
    openDetail(row.item.id, { push: true });
  }

  function runSearch(value) {
    const q = String(value || '').trim();
    searchState.q = q;
    searchState.active = -1;

    if (!q) {
      searchState.items = [];
      els.searchClear.hidden = true;
      els.searchStatus.textContent = '';
      hideResults();
      applyFilter();
      return;
    }

    els.searchClear.hidden = false;
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = [];

    searchIndex().forEach((entry) => {
      const result = scoreEntry(entry, tokens);
      if (result) scored.push({ item: entry.item, entry: entry, score: result.score, best: result.best });
    });

    scored.sort((a, b) => b.score - a.score || a.item.year - b.item.year);
    searchState.items = scored;

    els.searchStatus.textContent = scored.length
      ? '找到 ' + scored.length + ' 个节点' + (scored.length > 1 ? '，已在时间轴中高亮' : '')
      : '没有匹配「' + q + '」的节点';

    renderResults();
    applyFilter();
  }

  function initSearch() {
    if (!els.searchInput) return;

    let timer = 0;
    els.searchInput.addEventListener('input', () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => runSearch(els.searchInput.value), 110);
    });

    els.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (els.searchResults.hidden && searchState.items.length) renderResults();
        setActiveResult(searchState.active + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveResult(searchState.active - 1);
      } else if (e.key === 'Enter') {
        if (searchState.items.length) {
          e.preventDefault();
          pickResult(searchState.active < 0 ? 0 : searchState.active);
        }
      } else if (e.key === 'Escape') {
        if (els.searchInput.value) {
          e.preventDefault();
          els.searchInput.value = '';
          runSearch('');
        } else {
          els.searchInput.blur();
        }
      }
    });

    els.searchClear.addEventListener('click', () => {
      els.searchInput.value = '';
      runSearch('');
      els.searchInput.focus();
    });

    if (els.searchToggle) {
      els.searchToggle.addEventListener('click', () => {
        const open = els.search.classList.toggle('is-open');
        els.searchToggle.setAttribute('aria-expanded', String(open));
        if (open) {
          els.searchInput.focus();
        } else {
          hideResults();
          els.searchInput.blur();
        }
      });
    }

    document.addEventListener('pointerdown', (e) => {
      if (!els.search.contains(e.target) && !els.searchResults.hidden) hideResults();
      if (!els.search.contains(e.target)) closeSearchField();
    });

    // 全局快捷键：/ 或 Ctrl(⌘)+K 聚焦搜索
    document.addEventListener('keydown', (e) => {
      if (state.opened) return;
      const tag = (e.target.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
      const slash = e.key === '/' && !typing;
      const cmdK = (e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K');
      if (!slash && !cmdK) return;
      e.preventDefault();
      openSearchField();
      els.searchInput.focus();
      els.searchInput.select();
    });
  }

  /* ============================================================
     5. 地图：腾讯地图 + 地点聚合
     ============================================================ */

  const ERA_COLOR = {
    genesis: '#22d3ee',
    waves: '#fbbf24',
    revival: '#a78bfa',
    deep: '#34d399',
    llm: '#f472b6'
  };

  const ATLAS_HOME = { lat: 30, lng: 4, zoom: 3 };

  const atlas = {
    places: [],
    year: 2025,
    selected: null,
    pickId: null,
    map: null,
    markers: null,
    ready: false,
    failed: false,
    loading: null,
    requested: false
  };

  // WGS-84 → GCJ-02（腾讯地图使用火星坐标；境外坐标原样返回）
  function wgs84ToGcj02(lat, lng) {
    const PI = Math.PI;
    const A = 6378245.0;
    const EE = 0.00669342162296594323;
    const outOfChina = lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
    if (outOfChina) return [lat, lng];

    const transformLat = (x, y) => {
      let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
      ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
      ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
      ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
      return ret;
    };
    const transformLng = (x, y) => {
      let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
      ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
      ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
      ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
      return ret;
    };

    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLng(lng - 105.0, lat - 35.0);
    const radLat = (lat / 180.0) * PI;
    let magic = Math.sin(radLat);
    magic = 1 - EE * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
    dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
    return [lat + dLat, lng + dLng];
  }

  function pinSvg(color, active) {
    const ring = active
      ? '<circle cx="12" cy="12" r="10" fill="' + color + '" fill-opacity="0.2"/>' +
        '<circle cx="12" cy="12" r="7.4" fill="none" stroke="' + color + '" stroke-width="1.8"/>' +
        '<circle cx="12" cy="12" r="3" fill="' + color + '"/>' +
        '<circle cx="12" cy="12" r="11.2" fill="none" stroke="' + color + '" stroke-width="0.7" stroke-opacity="0.45"/>'
      : '<circle cx="12" cy="12" r="9" fill="' + color + '" fill-opacity="0.14"/>' +
        '<circle cx="12" cy="12" r="5.6" fill="none" stroke="' + color + '" stroke-width="1.4"/>' +
        '<circle cx="12" cy="12" r="2.2" fill="' + color + '"/>';

    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' + ring + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function buildPlaces() {
    const grouped = new Map();

    events.forEach((item) => {
      (item.geo || []).forEach((g) => {
        const key = g.place + '|' + g.country;
        let place = grouped.get(key);
        if (!place) {
          const gcj = wgs84ToGcj02(g.lat, g.lon);
          place = {
            key: key,
            place: g.place,
            country: g.country,
            lat: gcj[0],
            lng: gcj[1],
            color: ERA_COLOR[item.era] || '#22d3ee',
            events: []
          };
          grouped.set(key, place);
        }
        place.events.push({
          id: item.id,
          year: item.year,
          era: item.era,
          title: item.title,
          note: g.note || ''
        });
      });
    });

    // 注意：Map 的 values() 是迭代器，没有 length，不能用 slice.call 转数组
    const list = Array.from(grouped.values());
    list.forEach((place) => {
      place.events.sort((a, b) => a.year - b.year);
    });
    list.sort((a, b) => a.events[0].year - b.events[0].year);
    return list;
  }

  function liveEvents(place) {
    return place.events.filter((e) => e.year <= atlas.year);
  }

  function visiblePlaces() {
    const out = [];
    atlas.places.forEach((place) => {
      const live = liveEvents(place);
      if (live.length) {
        out.push({ key: place.key, place: place.place, country: place.country, lat: place.lat, lng: place.lng, color: place.color, live: live });
      }
    });
    return out;
  }

  function loadTMap() {
    if (window.TMap) return Promise.resolve(window.TMap);
    if (atlas.loading) return atlas.loading;

    atlas.loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src =
        'https://map.qq.com/api/gljs?v=1.exp' +
        (window.AI_TMAP_KEY ? '&key=' + encodeURIComponent(window.AI_TMAP_KEY) : '');
      s.async = true;
      s.onload = () => (window.TMap ? resolve(window.TMap) : reject(new Error('SDK 未挂载')));
      s.onerror = () => reject(new Error('SDK 加载失败'));
      document.head.appendChild(s);
      window.setTimeout(() => {
        if (!window.TMap) reject(new Error('SDK 加载超时'));
      }, 9000);
    });

    return atlas.loading;
  }

  function failAtlas() {
    if (atlas.failed) return;
    atlas.failed = true;
    atlas.ready = false;
    atlas.loading = null;

    els.atlasMap.hidden = true;
    if (els.atlasMapWrap) els.atlasMapWrap.classList.add('is-fallback');
    els.atlasFallback.hidden = false;
    els.atlasNote.textContent = 'LOCATION INDEX · 地图待授权';
    els.atlasFallbackDesc.textContent =
      '在线地图需要在 index.html 的 window.AI_TMAP_KEY 里填入腾讯位置服务密钥后才会显示（详见 README「地图说明」）。这里先按城市列出全部节点：点击城市，中间的卡片会列出发生在这里的事件与年份。';
    renderAtlas();
  }

  function mountAtlasMap() {
    if (atlas.requested) return;
    atlas.requested = true;

    // 自建部署（GitHub Pages 等）没有运行时钥匙代理：直接降价为地点索引，不白等 SDK 超时
    const proxyHost = (window._TMapSecurityConfig || {}).serviceHost || '';
    if (!window.AI_TMAP_KEY && proxyHost.indexOf('__WB_HTTP_PORT__') >= 0) {
      failAtlas();
      return;
    }

    loadTMap()
      .then(() => {
        if (!window.TMap || !els.atlasMap) throw new Error('SDK 不可用');

        atlas.map = new window.TMap.Map(els.atlasMap, {
          center: new window.TMap.LatLng(ATLAS_HOME.lat, ATLAS_HOME.lng),
          zoom: ATLAS_HOME.zoom,
          minZoom: ATLAS_HOME.zoom,
          maxZoom: 14,
          viewMode: '2D'
        });

        const styles = {};
        Object.keys(ERA_COLOR).forEach((era) => {
          styles[era] = new window.TMap.MarkerStyle({
            width: 26,
            height: 26,
            anchor: { x: 13, y: 13 },
            src: pinSvg(ERA_COLOR[era], false)
          });
        });
        styles.active = new window.TMap.MarkerStyle({
          width: 40,
          height: 40,
          anchor: { x: 20, y: 20 },
          src: pinSvg('#ffffff', true)
        });

        atlas.markers = new window.TMap.MultiMarker({
          map: atlas.map,
          styles: styles,
          geometries: []
        });
        atlas.markers.on('click', (evt) => {
          const key = evt && evt.geometry ? evt.geometry.id : '';
          if (key) selectPlace(key, { focus: false });
        });

        atlas.ready = true;
        els.atlasFallback.hidden = true;
        els.atlasNote.textContent = 'MAP / TENCENT LBS · GCJ-02 · 点击光点或右侧城市';
        atlasHomeView();
        renderAtlas();
      })
      .catch(() => failAtlas());
  }

  // 用 fitBounds 框住全部坐标；被级别上限截断时至少保证居中
  function atlasHomeView() {
    if (!atlas.ready || !atlas.map) return;

    const lats = atlas.places.map((p) => p.lat);
    const lngs = atlas.places.map((p) => p.lng);
    const sw = [Math.min.apply(null, lats) - 3, Math.min.apply(null, lngs) - 6];
    const ne = [Math.max.apply(null, lats) + 3, Math.max.apply(null, lngs) + 6];

    try {
      if (typeof atlas.map.fitBounds === 'function' && typeof window.TMap.LatLngBounds === 'function') {
        atlas.map.fitBounds(
          new window.TMap.LatLngBounds(
            new window.TMap.LatLng(sw[0], sw[1]),
            new window.TMap.LatLng(ne[0], ne[1])
          ),
          { padding: 28 }
        );
        return;
      }
    } catch (err) {
      /* 落到 setCenter */
    }

    try {
      atlas.map.setCenter(new window.TMap.LatLng((sw[0] + ne[0]) / 2, (sw[1] + ne[1]) / 2));
      atlas.map.setZoom(ATLAS_HOME.zoom);
    } catch (err) {
      /* 忽略 */
    }
  }

  function markerGeometries(places) {
    return places.map((p) => ({
      id: p.key,
      styleId: atlas.selected === p.key ? 'active' : p.color === ERA_COLOR.genesis ? 'genesis'
        : p.color === ERA_COLOR.waves ? 'waves'
        : p.color === ERA_COLOR.revival ? 'revival'
        : p.color === ERA_COLOR.deep ? 'deep' : 'llm',
      position: new window.TMap.LatLng(p.lat, p.lng)
    }));
  }

  function renderAtlasPlaceholder() {
    els.atlasCardMeta.textContent = 'LOCATION';
    els.atlasCardTitle.textContent = '选择一个地点';
    els.atlasCardNote.textContent =
      '点击地图上的光点，或从右侧城市索引里挑一座城。每座城会列出发生在这里的节点与年份。';
    els.atlasCardEvents.innerHTML = '';
    els.atlasCard.classList.remove('has-place');
  }

  function renderAtlasCard(place) {
    const live = liveEvents(place);
    if (!live.length) {
      renderAtlasPlaceholder();
      return;
    }

    const years = live.map((e) => e.year);
    els.atlasCardMeta.textContent =
      place.country + '　/　' + live.length + ' 个节点　/　' +
      Math.min.apply(null, years) + (years.length > 1 ? ' — ' + Math.max.apply(null, years) : ' 年');
    els.atlasCardTitle.textContent = place.place;

    const picked = live.filter((e) => e.id === atlas.pickId)[0] || live[live.length - 1];
    els.atlasCardNote.textContent = picked.note || '';

    els.atlasCardEvents.innerHTML = live
      .slice()
      .reverse()
      .map(
        (e) =>
          '<li><button type="button" class="atlas-ev' + (e.id === picked.id ? ' is-picked' : '') +
          '" data-id="' + e.id + '">' +
            '<b>' + e.year + '</b><span>' + esc(e.title) + '</span>' +
          '</button></li>'
      )
      .join('');

    els.atlasCardEvents.querySelectorAll('.atlas-ev').forEach((btn) => {
      btn.addEventListener('click', () => openDetail(btn.dataset.id, { push: true }));
    });

    els.atlasCard.classList.add('has-place');
  }

  function renderAtlasList(places) {
    els.atlasList.innerHTML = places
      .map(
        (p) =>
          '<li><button type="button" class="atlas-row' + (atlas.selected === p.key ? ' is-active' : '') +
          '" data-key="' + esc(p.key) + '">' +
            '<span class="atlas-row-dot" style="--c:' + p.color + '" aria-hidden="true"></span>' +
            '<span class="atlas-row-main"><b>' + esc(p.place) + '</b><em>' +
              esc(p.country) + ' · ' + p.live.length + ' 个节点 · ' + p.live[0].year + '</em></span>' +
            '<span class="atlas-row-go" aria-hidden="true">→</span>' +
          '</button></li>'
      )
      .join('');

    els.atlasList.querySelectorAll('.atlas-row').forEach((btn) => {
      btn.addEventListener('click', () => selectPlace(btn.dataset.key, { focus: true }));
    });

    // 选中的城市滚动到列表可见范围内（只动列表，不动页面）
    const active = els.atlasList.querySelector('.atlas-row.is-active');
    if (active) {
      const box = els.atlasList.getBoundingClientRect();
      const row = active.getBoundingClientRect();
      if (row.top < box.top) els.atlasList.scrollTop -= box.top - row.top;
      else if (row.bottom > box.bottom) els.atlasList.scrollTop += row.bottom - box.bottom;
    }
  }

  function renderFallbackGrid(places) {
    els.atlasFallbackGrid.innerHTML = places
      .map(
        (p) =>
          '<button type="button" class="atlas-chip' + (atlas.selected === p.key ? ' is-active' : '') +
          '" data-key="' + esc(p.key) + '">' +
            '<b>' + esc(p.place) + '</b><span>' + p.live[0].year + ' · ' + p.live.length + '</span>' +
          '</button>'
      )
      .join('');

    els.atlasFallbackGrid.querySelectorAll('.atlas-chip').forEach((btn) => {
      btn.addEventListener('click', () => selectPlace(btn.dataset.key, { focus: false }));
    });
  }

  function renderAtlas() {
    if (!els.atlasList) return;

    els.atlasYearLabel.textContent = atlas.year;
    const places = visiblePlaces();
    const total = places.reduce((sum, p) => sum + p.live.length, 0);

    els.atlasCount.textContent = places.length
      ? places.length + ' 座城市 · ' + total + ' 个节点 · 截至 ' + atlas.year + ' 年'
      : '截至 ' + atlas.year + ' 年暂无收录节点';
    els.atlasEmpty.hidden = places.length > 0;

    renderAtlasList(places);
    if (atlas.failed) renderFallbackGrid(places);

    if (atlas.ready && atlas.markers) {
      try {
        atlas.markers.setGeometries(markerGeometries(places));
      } catch (err) {
        /* 地图更新失败不影响列表 */
      }
    }

    if (atlas.selected) {
      const place = atlas.places.filter((p) => p.key === atlas.selected)[0];
      if (place && liveEvents(place).length) renderAtlasCard(place);
      else {
        atlas.selected = null;
        renderAtlasPlaceholder();
      }
    }
  }

  function selectPlace(key, opts) {
    const options = opts || {};
    const place = atlas.places.filter((p) => p.key === key)[0];
    if (!place) return;

    if (options.pickId) atlas.pickId = options.pickId;
    atlas.selected = key;

    if (atlas.ready && atlas.markers) {
      try {
        atlas.markers.setGeometries(markerGeometries(visiblePlaces()));
        if (options.focus !== false) {
          const target = new window.TMap.LatLng(place.lat, place.lng);
          let eased = false;
          if (typeof atlas.map.easeTo === 'function') {
            try {
              atlas.map.easeTo({ center: target, zoom: 4, duration: 700 });
              eased = true;
            } catch (err) {
              eased = false;
            }
          }
          if (!eased) {
            atlas.map.setCenter(target);
            atlas.map.setZoom(4);
          }
        }
      } catch (err) {
        /* 忽略地图异常 */
      }
    }

    renderAtlasCard(place);
    renderAtlasList(visiblePlaces());
    if (atlas.failed) renderFallbackGrid(visiblePlaces());
  }

  function goToAtlas(id) {
    const place = atlas.places.filter((p) => p.events.some((e) => e.id === id))[0];
    if (!place) return;

    const years = place.events.map((e) => e.year);
    const newest = Math.max.apply(null, years);
    if (atlas.year < newest) {
      atlas.year = newest;
      els.atlasYear.value = String(newest);
    }

    atlas.selected = place.key;
    atlas.pickId = id;

    els.atlas.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    renderAtlas();
    selectPlace(place.key, { pickId: id, focus: true });
    mountAtlasMap();
  }

  function initAtlas() {
    if (!els.atlas) return;

    atlas.places = buildPlaces();
    atlas.year = Number(els.atlasYear.max) || 2025;
    els.atlasYear.value = String(atlas.year);

    renderAtlas();

    els.atlasYear.addEventListener('input', () => {
      atlas.year = Number(els.atlasYear.value);
      renderAtlas();
    });

    if (els.atlasReset) {
      els.atlasReset.addEventListener('click', () => {
        atlas.selected = null;
        atlas.pickId = null;
        renderAtlasPlaceholder();
        atlas.year = Number(els.atlasYear.max);
        els.atlasYear.value = String(atlas.year);
        renderAtlas();
        atlasHomeView();
      });
    }

    // 滚到附近再加载 SDK，避免首屏被第三方脚本拖慢
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            io.disconnect();
            mountAtlasMap();
          });
        },
        { rootMargin: '360px 0px' }
      );
      io.observe(els.atlas);
    } else {
      mountAtlasMap();
    }
  }

  /* ============================================================
     2. 滚动：进度线 / 入场 / 数字滚动 / HUD
     ============================================================ */

  function updateProgress() {
    const list = els.list;
    if (!list || !els.progress) return;
    const rect = list.getBoundingClientRect();
    const anchor = window.innerHeight * 0.55;
    const ratio = (anchor - rect.top) / Math.max(rect.height, 1);
    els.progress.style.height = Math.min(Math.max(ratio, 0), 1) * 100 + '%';
  }

  function initReveal() {
    if (!('IntersectionObserver' in window) || reduceMotion) {
      els.list.querySelectorAll('.tl-item').forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    );

    els.list.querySelectorAll('.tl-item').forEach((item, i) => {
      item.style.transitionDelay = (i % 3) * 70 + 'ms';
      io.observe(item);
    });
  }

  function initCounters() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const nums = Array.prototype.slice.call(document.querySelectorAll('.stat-num'));

    const run = (el) => {
      const target = Number(el.dataset.count);
      const pad = Number(el.dataset.pad || 0);
      const textNode = el.firstChild;
      if (!textNode || textNode.nodeType !== 3 || !Number.isFinite(target)) return;
      const dur = 1200;
      const start = performance.now();

      const tick = (now) => {
        const q = Math.min((now - start) / dur, 1);
        const val = Math.round(target * (1 - Math.pow(1 - q, 3)));
        textNode.nodeValue = pad ? String(val).padStart(pad, '0') : String(val);
        if (q < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    nums.forEach((n) => io.observe(n));
  }

  function initScrollUi() {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        els.hud.classList.toggle('is-scrolled', window.scrollY > 24);
        updateProgress();
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ============================================================
     3. 影片引擎
     ============================================================ */

  const FILM_W = 1000;
  const FILM_H = 563;
  const STEP_SEC = 6;
  const TAU = Math.PI * 2;
  const SANS = '"Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif';
  const MONO = '"Consolas", "SFMono-Regular", monospace';

  const PAL = {
    cyan: { a: [34, 211, 238], b: [8, 145, 178], c: [165, 243, 252], w: [167, 139, 250] },
    violet: { a: [167, 139, 250], b: [124, 58, 237], c: [221, 214, 254], w: [34, 211, 238] },
    amber: { a: [251, 191, 36], b: [245, 158, 11], c: [253, 230, 138], w: [34, 211, 238] }
  };

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const rgba = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  const LW = 1.7; // 细线在缩放后仍然可见
  const FS = 1.32; // 画布文字在小屏上仍可读
  const hash = (n) => {
    const s = Math.sin(n * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };

  function txt(ctx, s, x, y, o) {
    o = o || {};
    ctx.save();
    ctx.font = (o.weight || 500) + ' ' + Math.round((o.size || 13) * FS) + 'px ' + (o.mono ? MONO : SANS);
    ctx.fillStyle = o.color || '#9fb3c8';
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    ctx.fillText(s, x, y);
    ctx.restore();
  }

  function line(ctx, x1, y1, x2, y2, color, w, dash) {
    ctx.save();
    ctx.strokeStyle = color;
    const width = w || 1;
    ctx.lineWidth = width > 2 ? width : width * LW;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function box(ctx, x, y, w, h, fill, stroke, lw, r) {
    ctx.save();
    ctx.beginPath();
    const rad = r == null ? 4 : r;
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, rad);
    } else {
      ctx.moveTo(x + rad, y);
      ctx.arcTo(x + w, y, x + w, y + h, rad);
      ctx.arcTo(x + w, y + h, x, y + h, rad);
      ctx.arcTo(x, y + h, x, y, rad);
      ctx.arcTo(x, y, x + w, y, rad);
      ctx.closePath();
    }
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      const lwv = lw || 1;
      ctx.lineWidth = lwv > 2 ? lwv : lwv * LW;
      ctx.stroke();
    }
    ctx.restore();
  }

  function dot(ctx, x, y, r, fill, stroke, lw) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      const lwv = lw || 1;
      ctx.lineWidth = lwv > 2 ? lwv : lwv * LW;
      ctx.stroke();
    }
  }

  function paintBg(ctx, pal, t) {
    ctx.fillStyle = '#04080f';
    ctx.fillRect(0, 0, FILM_W, FILM_H);

    const g = ctx.createRadialGradient(FILM_W * 0.5, FILM_H * 0.42, 30, FILM_W * 0.5, FILM_H * 0.5, FILM_W * 0.62);
    g.addColorStop(0, rgba(pal.a, 0.12));
    g.addColorStop(0.55, 'rgba(6,12,22,0)');
    g.addColorStop(1, 'rgba(3,6,12,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, FILM_W, FILM_H);

    ctx.strokeStyle = 'rgba(90,160,200,0.085)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= FILM_W; x += 50) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, FILM_H);
    }
    for (let y = 0; y <= FILM_H; y += 50) {
      ctx.moveTo(0, y);
      ctx.lineTo(FILM_W, y);
    }
    ctx.stroke();

    // 顶部与底部的“胶片”标尺
    ctx.strokeStyle = rgba(pal.a, 0.2);
    ctx.beginPath();
    for (let x = 12; x < FILM_W; x += 24) {
      ctx.moveTo(x, 8);
      ctx.lineTo(x, 12);
      ctx.moveTo(x, FILM_H - 12);
      ctx.lineTo(x, FILM_H - 8);
    }
    ctx.stroke();

    // 缓慢扫描线
    const sy = ((t * 0.06) % 1.2) * FILM_H;
    const sg = ctx.createLinearGradient(0, sy - 40, 0, sy + 40);
    sg.addColorStop(0, rgba(pal.a, 0));
    sg.addColorStop(0.5, rgba(pal.a, 0.05));
    sg.addColorStop(1, rgba(pal.a, 0));
    ctx.fillStyle = sg;
    ctx.fillRect(0, sy - 40, FILM_W, 80);
  }

  /* ---------- 概念画面 ---------- */

  const VISUALS = {
    neuron(ctx, p, step, pal) {
      const phase = step.args && step.args.phase;
      const cy = 282;
      const ys = [168, 282, 396];
      const ix = 196;
      const sx = 470;
      const tx = 666;
      const ox = 858;
      const labels = phase === 2 ? ['?', '?', '?'] : ['w1', 'w2', 'w3'];

      ys.forEach((y, i) => {
        const q = clamp01(p * 2.2 - i * 0.3);
        line(ctx, ix + 32, y, sx - 62, cy, rgba(pal.a, 0.14 + 0.22 * q), 1.2, phase === 2 ? [5, 6] : null);
        dot(ctx, ix, y, 26, 'rgba(9,17,28,0.92)', rgba(pal.a, 0.5));
        txt(ctx, 'x' + (i + 1), ix, y + 1, { size: 12, mono: true, color: '#cfe9f6', align: 'center' });
        txt(ctx, labels[i], (ix + 32 + sx - 62) / 2, (y + cy) / 2 - 14, {
          size: 11,
          mono: true,
          color: rgba(pal.c, 0.85),
          align: 'center'
        });
        if (q > 0 && q < 1) {
          dot(ctx, lerp(ix + 32, sx - 62, q), lerp(y, cy, q), 3.2, rgba(pal.c, 0.95));
        }
      });

      dot(ctx, sx, cy, 60, 'rgba(8,16,28,0.94)', rgba(pal.a, 0.7));
      dot(ctx, sx, cy, 68, null, rgba(pal.a, 0.1 + 0.12 * Math.sin(performance.now() / 420)));
      txt(ctx, 'Σ', sx, cy - 8, { size: 32, weight: 600, color: '#eafaff', align: 'center' });
      txt(ctx, phase === 2 ? '未知权重' : '加权求和', sx, cy + 30, {
        size: 10,
        color: rgba(pal.c, 0.7),
        align: 'center'
      });

      box(ctx, tx, cy - 34, 120, 68, 'rgba(9,17,28,0.92)', rgba(pal.a, 0.45));
      txt(ctx, '≥ θ', tx + 60, cy - 6, { size: 19, mono: true, color: '#eafaff', align: 'center' });
      txt(ctx, '阈值', tx + 60, cy + 20, { size: 9.5, color: '#7f93a8', align: 'center' });

      line(ctx, tx + 120, cy, ox - 32, cy, rgba(pal.a, 0.3), 1.2);

      const on = p > 0.78;
      dot(ctx, ox, cy, 30, on ? rgba(pal.a, 0.2) : 'rgba(9,17,28,0.94)', rgba(pal.a, on ? 0.95 : 0.28));
      txt(ctx, on ? '1' : '0', ox, cy + 1, {
        size: 16,
        mono: true,
        color: on ? '#eafaff' : '#5b7186',
        align: 'center'
      });
      txt(ctx, '输出', ox, cy + 48, { size: 9.5, color: '#7f93a8', align: 'center' });

      if (phase === 2) {
        line(ctx, 360, 480, 840, 480, 'rgba(251,191,36,0.32)', 1, [5, 6]);
        txt(ctx, '权重待手工设定 · 尚无学习算法', 600, 504, {
          size: 12,
          color: 'rgba(251,191,36,0.85)',
          align: 'center'
        });
      }
    },

    network(ctx, p, step, pal) {
      const back = step.args && step.args.back;
      const phase = step.args && step.args.phase;
      const layers = [
        { x: 150, n: 3 },
        { x: 370, n: 5 },
        { x: 590, n: 4 },
        { x: 810, n: 2 }
      ];
      const gap = 96;

      layers.forEach((L) => {
        const startY = 282 - ((L.n - 1) * gap) / 2;
        L.ys = [];
        for (let i = 0; i < L.n; i += 1) L.ys.push(startY + i * gap);
      });

      const lit = phase === 2 ? -1 : p * 3.4;

      for (let li = 0; li < layers.length - 1; li += 1) {
        const A = layers[li];
        const B = layers[li + 1];
        const on = Math.abs(li - lit) < 1.2;
        A.ys.forEach((ay) =>
          B.ys.forEach((by) => {
            line(ctx, A.x, ay, B.x, by, on ? rgba(pal.a, 0.26) : 'rgba(80,130,165,0.1)', 1, phase === 2 ? [4, 7] : null);
          })
        );
      }

      layers.forEach((L, li) => {
        L.ys.forEach((y) => {
          const act = clamp01(1 - Math.abs(li - lit) / 1.2);
          dot(ctx, L.x, y, 15 + act * 4, 'rgba(9,17,28,0.96)', rgba(pal.a, 0.3 + act * 0.6));
          if (act > 0.04) dot(ctx, L.x, y, 4, rgba(pal.c, act));
        });
      });

      if (back) {
        const bp = clamp01((p - 0.42) / 0.4);
        if (bp > 0) {
          const y = 492;
          line(ctx, lerp(880, 120, bp), y, 880, y, rgba(pal.w, 0.5), 1.4, [6, 6]);
          dot(ctx, lerp(880, 120, bp), y, 4, rgba(pal.w, 0.9));
          txt(ctx, '∂L/∂w  ←  误差回传', 500, y + 26, {
            size: 11,
            mono: true,
            color: rgba(pal.w, 0.9),
            align: 'center'
          });
        }
      }

      if (phase === 2) {
        txt(ctx, '?', 480, 282, { size: 64, weight: 700, color: 'rgba(251,191,36,0.35)', align: 'center' });
        txt(ctx, '隐藏层无法训练', 480, 330, { size: 11, color: 'rgba(251,191,36,0.8)', align: 'center' });
      }
    },

    turing(ctx, p, step, pal) {
      const phase = step.args && step.args.phase;

      box(ctx, 56, 190, 220, 176, 'rgba(9,17,28,0.92)', rgba(pal.a, 0.36));
      txt(ctx, 'JUDGE / 评审', 166, 214, { size: 9, mono: true, color: rgba(pal.a, 0.9), align: 'center' });
      dot(ctx, 166, 286, 32, 'rgba(18,32,48,0.9)', rgba(pal.a, 0.5));
      txt(ctx, '人', 166, 287, { size: 17, color: '#dff4ff', align: 'center' });
      txt(ctx, '只看到文字', 166, 336, { size: 9.5, color: '#7f93a8', align: 'center' });

      const panels = [
        { x: 356, label: 'A' },
        { x: 648, label: 'B' }
      ];

      panels.forEach((P, pi) => {
        box(ctx, P.x, 150, 250, 272, 'rgba(7,14,24,0.94)', 'rgba(120,180,220,0.18)');
        txt(ctx, P.label, P.x + 16, 172, { size: 9, mono: true, color: '#7f93a8' });
        for (let l = 0; l < 5; l += 1) {
          const q = clamp01(p * 5 - l * 0.32);
          if (q <= 0) continue;
          const w = (70 + hash(l + pi * 7) * 130) * q;
          line(ctx, P.x + 18, 205 + l * 40, P.x + 18 + w, 205 + l * 40, 'rgba(180,220,240,0.3)', 6);
        }
        if (p > 0.55 && pi === 1) {
          const glitch = Math.sin(performance.now() / 120) * 2;
          for (let k = 0; k < 3; k += 1) {
            line(ctx, P.x + 20, 200 + k * 26, P.x + 210, 210 + k * 30 + glitch, 'rgba(248,113,113,0.35)', 1);
          }
        }
      });

      txt(ctx, '???', 773, 300, {
        size: 22,
        mono: true,
        color: phase === 2 ? 'rgba(248,113,113,0.85)' : 'rgba(120,180,220,0.3)',
        align: 'center'
      });

      if (phase === 2) {
        txt(ctx, '无法判定：是模仿，还是理解？', 500, 480, {
          size: 12,
          color: 'rgba(248,113,113,0.8)',
          align: 'center'
        });
      }
    },

    chat(ctx, p, step, pal) {
      const phase = step.args && step.args.phase;
      const bubbles = [
        { side: 'in', y: 96, w: 300, text: '我最近有点难过。' },
        { side: 'out', y: 172, w: 340, text: '你为什么难过？' },
        { side: 'in', y: 248, w: 250, text: '我说不清。' },
        { side: 'out', y: 324, w: 300, text: '能多说一点吗？' }
      ];

      bubbles.forEach((b, i) => {
        const q = clamp01(p * 4.4 - i * 0.55);
        if (q <= 0) return;
        const isM = b.side === 'out';
        const x = isM ? 552 : 112;
        const w = Math.max(b.w * q, 18);
        box(ctx, x, b.y, w, 56, isM ? 'rgba(34,211,238,0.09)' : 'rgba(20,32,48,0.88)', rgba(pal.a, isM ? 0.42 : 0.16), 1, 10);
        if (q > 0.85) txt(ctx, b.text, x + 16, b.y + 29, { size: 13, color: '#dbeaf7' });
        txt(ctx, isM ? 'MACHINE' : 'HUMAN', x + 3, b.y - 9, {
          size: 8,
          mono: true,
          color: 'rgba(127,142,168,0.75)'
        });
      });

      if (p > 0.3 && p < 0.95) {
        const t = performance.now() / 260;
        for (let k = 0; k < 3; k += 1) {
          const a = 0.25 + 0.55 * Math.max(0, Math.sin(t - k * 0.7));
          dot(ctx, 574 + k * 14, 430, 3.2, 'rgba(165,243,252,' + a.toFixed(2) + ')');
        }
      }

      if (phase === 2) {
        box(ctx, 552, 400, 300, 56, 'rgba(248,113,113,0.08)', 'rgba(248,113,113,0.32)', 1, 10);
        txt(ctx, '……', 568, 428, { size: 16, mono: true, color: 'rgba(248,113,113,0.75)' });
        txt(ctx, '未命中关键词 · 兜底回复', 552, 476, { size: 10, color: 'rgba(248,113,113,0.8)' });
      }
    },

    xor(ctx, p, step, pal) {
      const solved = step.args && step.args.phase === 2;
      const x0 = 280;
      const y0 = 120;
      const size = 360;

      for (let i = 0; i <= 4; i += 1) {
        line(ctx, x0, y0 + (size / 4) * i, x0 + size, y0 + (size / 4) * i, 'rgba(90,150,185,0.12)', 1);
        line(ctx, x0 + (size / 4) * i, y0, x0 + (size / 4) * i, y0 + size, 'rgba(90,150,185,0.12)', 1);
      }
      line(ctx, x0, y0 + size, x0 + size, y0 + size, 'rgba(120,180,220,0.35)', 1.3);
      line(ctx, x0, y0, x0, y0 + size, 'rgba(120,180,220,0.35)', 1.3);
      txt(ctx, 'x1', x0 + size / 2, y0 + size + 26, { size: 10, mono: true, color: '#7f93a8', align: 'center' });
      txt(ctx, 'x2', x0 - 18, y0 + size / 2, { size: 10, mono: true, color: '#7f93a8', align: 'center' });

      const pts = [
        { x: x0 + 70, y: y0 + 290, c: 0 },
        { x: x0 + 290, y: y0 + 70, c: 0 },
        { x: x0 + 70, y: y0 + 70, c: 1 },
        { x: x0 + 290, y: y0 + 290, c: 1 }
      ];

      if (!solved) {
        line(ctx, x0 + 20, y0 + size - 30, x0 + size - 20, y0 + 20, 'rgba(251,191,36,0.45)', 1.4, [7, 6]);
        pts.forEach((pt) => {
          dot(ctx, pt.x, pt.y, 13, pt.c ? 'rgba(251,191,36,0.9)' : 'rgba(120,180,220,0.85)');
          if (pt.c) {
            ctx.strokeStyle = 'rgba(248,113,113,0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pt.x - 20, pt.y - 20);
            ctx.lineTo(pt.x + 20, pt.y + 20);
            ctx.moveTo(pt.x + 20, pt.y - 20);
            ctx.lineTo(pt.x - 20, pt.y + 20);
            ctx.stroke();
          }
        });
        txt(ctx, '任何一条直线都分不开', x0 + size / 2, y0 + size + 44, {
          size: 12,
          color: 'rgba(251,191,36,0.85)',
          align: 'center'
        });
      } else {
        const q = clamp01(p * 1.6);
        ctx.save();
        ctx.strokeStyle = rgba(pal.a, 0.75 * q);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(x0 + 70, y0 + 290, 78, 78, 0, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x0 + 290, y0 + 70, 78, 78, 0, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x0 + 70, y0 + 70, 78, 78, 0, Math.PI, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x0 + 290, y0 + 290, 78, 78, 0, Math.PI, TAU);
        ctx.stroke();
        ctx.restore();
        pts.forEach((pt) => dot(ctx, pt.x, pt.y, 13, pt.c ? 'rgba(251,191,36,0.9)' : rgba(pal.a, 0.9)));
        txt(ctx, '非线性边界 · 1986', x0 + size / 2, y0 + size + 44, {
          size: 12,
          color: rgba(pal.c, 0.85),
          align: 'center'
        });
      }
    },

    rules(ctx, p, step, pal) {
      const phase = step.args && step.args.phase;
      const rules = [
        ['需 4 块 CPU 板', '检查背板槽位'],
        ['槽位不足', '增加扩展机箱'],
        ['内存 > 32MB', '升级电源模块'],
        ['配置冲突', '回溯并替换']
      ];
      const shown = phase === 2 ? 5 : 4;

      rules.forEach((r, i) => {
        if (i >= shown) return;
        const q = clamp01(p * 3.2 - i * 0.2);
        if (q <= 0) return;
        const y = 92 + i * 74;
        const x = 52 - (1 - q) * 18;
        box(ctx, x, y, 306, 60, 'rgba(9,17,28,0.94)', rgba(pal.a, 0.24 + 0.2 * q));
        txt(ctx, 'IF', x + 14, y + 19, { size: 8, mono: true, color: rgba(pal.a, 0.9) });
        txt(ctx, r[0], x + 36, y + 19, { size: 10.5, color: '#d3e8f6' });
        txt(ctx, 'THEN', x + 14, y + 44, { size: 8, mono: true, color: 'rgba(167,139,250,0.9)' });
        txt(ctx, r[1], x + 54, y + 44, { size: 10.5, color: '#a9bdd2' });
        line(ctx, x + 306, y + 30, 448, 269, rgba(pal.a, 0.1 + 0.1 * q), 1, [4, 6]);
      });

      box(ctx, 448, 202, 176, 146, 'rgba(8,16,28,0.95)', rgba(pal.a, 0.42));
      txt(ctx, '推理机', 536, 234, { size: 13, color: '#e6f7ff', align: 'center' });
      dot(ctx, 536, 284, 27, null, rgba(pal.a, 0.32));
      txt(ctx, '≡', 536, 286, { size: 20, color: rgba(pal.c, 0.85), align: 'center' });
      for (let k = 0; k < 3; k += 1) {
        const a = 0.2 + 0.6 * Math.max(0, Math.sin(performance.now() / 380 - k));
        dot(ctx, 490 + k * 46, 326, 3, rgba(pal.a, a));
      }

      box(ctx, 672, 138, 268, 268, 'rgba(6,12,22,0.9)', 'rgba(120,180,220,0.16)');
      txt(ctx, 'CONFIGURATION', 690, 162, { size: 8, mono: true, color: 'rgba(127,142,168,0.8)' });
      const rows = [
        ['VAX-11/780', '×1'],
        ['CPU 板', '×4'],
        ['内存', '32MB'],
        ['报价单', '就绪']
      ];
      rows.forEach((r, i) => {
        const q = clamp01(p * 3 - 1.1 - i * 0.22);
        if (q <= 0) return;
        const y = 202 + i * 44;
        txt(ctx, r[0], 692, y, { size: 10.5, color: 'rgba(190,210,228,0.9)', alpha: q });
        txt(ctx, r[1], 918, y, { size: 10.5, mono: true, color: rgba(pal.c, 0.9), align: 'right', alpha: q });
        line(ctx, 692, y + 16, 918, y + 16, 'rgba(120,180,220,0.12)', 1);
      });

      txt(ctx, phase === 2 ? '配置准确率 65% → 95%+' : '约 3,000 条规则 · 每年节省 2,500 万美元', 500, 500, {
        size: 10.5,
        color: 'rgba(127,142,168,0.9)',
        align: 'center'
      });
    },

    tree(ctx, p, step, pal) {
      const phase = step.args && step.args.phase;
      const levels = 4;
      const span = 720;
      const pos = (li, idx) => ({
        x: 500 - span / 2 + (span * (idx + 0.5)) / Math.pow(2, li),
        y: 92 + li * 106
      });

      ['MAX', 'MIN', 'MAX', 'MIN'].forEach((t, i) => {
        txt(ctx, t, 66, 92 + i * 106, { size: 8, mono: true, color: 'rgba(127,142,168,0.55)' });
      });

      for (let li = 0; li < levels - 1; li += 1) {
        const q = clamp01(p * 6 - li * 0.8);
        if (q <= 0) continue;
        for (let i = 0; i < Math.pow(2, li); i += 1) {
          const a = pos(li, i);
          [i * 2, i * 2 + 1].forEach((ci) => {
            const b = pos(li + 1, ci);
            const pruned = phase === 2 && ci % 3 === 1;
            line(ctx, a.x, a.y, lerp(a.x, b.x, q), lerp(a.y, b.y, q),
              pruned ? 'rgba(120,140,160,0.07)' : rgba(pal.a, 0.14 + 0.16 * q), 1);
          });
        }
      }

      for (let li = 0; li < levels; li += 1) {
        const q = clamp01(p * 6 - li * 0.8);
        if (q <= 0) continue;
        for (let i = 0; i < Math.pow(2, li); i += 1) {
          const n = pos(li, i);
          const pruned = phase === 2 && li > 1 && i % 3 === 1;
          ctx.globalAlpha = pruned ? 0.25 : 1;
          dot(ctx, n.x, n.y, li === 0 ? 9 : 7, 'rgba(9,17,28,1)', rgba(pal.a, pruned ? 0.25 : 0.6));
          ctx.globalAlpha = 1;
          if (pruned) {
            line(ctx, n.x - 5, n.y - 5, n.x + 5, n.y + 5, 'rgba(248,113,113,0.55)', 1.2);
            line(ctx, n.x + 5, n.y - 5, n.x - 5, n.y + 5, 'rgba(248,113,113,0.55)', 1.2);
          }
        }
      }

      if (p > 0.5) {
        const scores = [3, -1, 2, 1, -2, 4, 0, 2];
        for (let i = 0; i < 8; i += 1) {
          const n = pos(3, i);
          txt(ctx, String(scores[i]), n.x, n.y + 22, {
            size: 9,
            mono: true,
            color: 'rgba(127,142,168,0.9)',
            align: 'center'
          });
        }
      }

      txt(ctx, phase === 2 ? 'α-β 剪枝：不必展开的分支' : 'depth 4 · 每秒 2 亿个局面', 500, 508, {
        size: 10.5,
        color: phase === 2 ? 'rgba(251,191,36,0.8)' : 'rgba(127,142,168,0.85)',
        align: 'center'
      });
    },

    layers(ctx, p, step, pal) {
      const phase = step.args && step.args.phase;
      const labels = ['像素', '边缘', '部件', '语义', '决策'];
      const wave = p * 5;

      for (let i = 0; i < 5; i += 1) {
        const x = 160 + i * 142;
        const lit = clamp01(1 - Math.abs(i - wave + 0.6));
        const dim = phase === 3 ? 0.16 : 1;
        const g = ctx.createLinearGradient(x, 150, x + 90, 410);
        g.addColorStop(0, rgba(pal.a, (0.1 + lit * 0.4) * dim));
        g.addColorStop(1, rgba(pal.b, (0.06 + lit * 0.16) * dim));
        box(ctx, x, 150, 90, 260, g, rgba(pal.a, (0.2 + lit * 0.5) * dim), 1, 2);
        for (let k = 0; k < 7; k += 1) {
          line(ctx, x + 10, 168 + k * 34, x + 80, 168 + k * 34, rgba(pal.c, (0.05 + lit * 0.14) * dim), 1);
        }
        txt(ctx, labels[i], x + 45, 432, { size: 10.5, color: phase === 3 ? 'rgba(127,142,168,0.55)' : '#8ea6bd', align: 'center' });
        if (i < 4) {
          line(ctx, x + 90, 280, x + 142, 280, rgba(pal.a, 0.18 * dim), 1);
        }
      }

      if (phase === 2) {
        txt(ctx, '逐层预训练：无标注数据先教会每一层', 500, 486, {
          size: 11,
          color: rgba(pal.c, 0.85),
          align: 'center'
        });
      }
      if (phase === 3) {
        txt(ctx, '资金撤离 · 连接主义退到边缘', 500, 486, {
          size: 11.5,
          color: 'rgba(251,191,36,0.85)',
          align: 'center'
        });
      }
    },

    conv(ctx, p, step, pal) {
      const phase = step.args && step.args.phase;
      const gx = 110;
      const gy = 150;
      const cell = 30;
      const n = 8;

      for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < n; j += 1) {
          const v = hash(i * 13 + j * 7);
          const edge = v > 0.62 ? 0.42 : 0.1;
          ctx.fillStyle = rgba(pal.a, edge * (0.4 + 0.6 * Math.min(1, p * 2)));
          ctx.fillRect(gx + i * cell, gy + j * cell, cell - 2, cell - 2);
        }
      }
      box(ctx, gx - 2, gy - 2, n * cell + 2, n * cell + 2, null, 'rgba(120,180,220,0.28)');

      const kx = gx + clamp01(p * 1.15) * (n - 3) * cell;
      const ky = gy + 2 * cell;
      ctx.fillStyle = rgba(pal.c, 0.18);
      ctx.fillRect(kx, ky, cell * 3 - 2, cell * 3 - 2);
      ctx.strokeStyle = rgba(pal.c, 0.9);
      ctx.lineWidth = 1.4;
      ctx.strokeRect(kx, ky, cell * 3 - 2, cell * 3 - 2);
      txt(ctx, '3×3 kernel', kx + cell * 1.5, ky - 14, { size: 9, mono: true, color: rgba(pal.c, 0.8), align: 'center' });

      line(ctx, gx + n * cell + 14, gy + n * cell * 0.5, 600, 280, rgba(pal.a, 0.3), 1.2);

      const maps = phase === 2 ? 3 : 2;
      for (let m = 0; m < maps; m += 1) {
        const mx = 620 + (m % 2) * 0;
        const my = 150 + m * 110;
        txt(ctx, 'map ' + (m + 1), mx, my - 12, { size: 8.5, mono: true, color: 'rgba(127,142,168,0.8)' });
        for (let i = 0; i < 4; i += 1) {
          for (let j = 0; j < 4; j += 1) {
            const v = hash(i * 31 + j * 17 + m * 5);
            const q = clamp01(p * 2 - 0.4 - m * 0.2);
            ctx.fillStyle = rgba(pal.c, q * (0.12 + v * 0.5));
            ctx.fillRect(mx + i * 34, my + j * 22, 30, 18);
          }
        }
      }

      if (phase === 2) {
        txt(ctx, '更深 · 更宽 · 更多数据', 760, 500, { size: 11, color: rgba(pal.c, 0.8), align: 'center' });
      }
    },

    board(ctx, p, step, pal) {
      const phase = step.args && step.args.phase;

      if (phase === 3) {
        const bx = 190;
        const by = 120;
        const c = 38;
        for (let i = 0; i < 8; i += 1) {
          for (let j = 0; j < 8; j += 1) {
            ctx.fillStyle = (i + j) % 2 === 0 ? 'rgba(200,225,240,0.1)' : 'rgba(10,18,28,0.7)';
            ctx.fillRect(bx + i * c, by + j * c, c, c);
          }
        }
        box(ctx, bx - 2, by - 2, 8 * c + 4, 8 * c + 4, null, 'rgba(120,180,220,0.2)');
        const q = clamp01(p * 1.6);
        box(ctx, bx + 3 * c, by + 4 * c, c, c, rgba(pal.a, 0.2 * q), rgba(pal.a, 0.85 * q), 2, 0);
        txt(ctx, 'K', bx + 3.5 * c, by + 4.5 * c, { size: 18, weight: 700, color: '#eafaff', align: 'center' });
        txt(ctx, '3.5 : 2.5', 730, 260, { size: 34, mono: true, weight: 700, color: rgba(pal.a, 0.9), align: 'center' });
        txt(ctx, '1997 · 第六局 第 19 手', 730, 300, { size: 10.5, color: '#7f93a8', align: 'center' });
        txt(ctx, '世界冠军认输', 730, 330, { size: 10.5, color: 'rgba(167,139,250,0.8)', align: 'center' });
        return;
      }

      const n = 9;
      const c = 38;
      const x0 = 166;
      const y0 = 100;

      box(ctx, x0 - 18, y0 - 18, (n - 1) * c + 36, (n - 1) * c + 36, 'rgba(8,14,24,0.7)', 'rgba(120,180,220,0.16)');
      for (let i = 0; i < n; i += 1) {
        line(ctx, x0, y0 + i * c, x0 + (n - 1) * c, y0 + i * c, 'rgba(150,200,225,0.28)', 1);
        line(ctx, x0 + i * c, y0, x0 + i * c, y0 + (n - 1) * c, 'rgba(150,200,225,0.28)', 1);
      }
      [[2, 2], [6, 2], [4, 4], [2, 6], [6, 6]].forEach(([i, j]) => {
        dot(ctx, x0 + i * c, y0 + j * c, 2.4, 'rgba(180,220,240,0.55)');
      });

      const moves = [[2, 2], [6, 6], [2, 6], [6, 2], [4, 4], [3, 5], [5, 3], [1, 7], [7, 1], [4, 2], [2, 4]];
      moves.forEach(([i, j], k) => {
        const q = clamp01(p * 5.2 - k * 0.32);
        if (q <= 0) return;
        const x = x0 + i * c;
        const y = y0 + j * c;
        const r = c * 0.42 * (0.8 + 0.2 * q);
        dot(ctx, x, y, r, k % 2 === 0 ? 'rgba(16,26,38,0.98)' : 'rgba(235,245,255,0.95)');
        dot(ctx, x, y, r, null, k % 2 === 0 ? 'rgba(180,220,240,0.45)' : 'rgba(20,30,44,0.35)');
      });

      const hx = x0 + 5 * c;
      const hy = y0 + 3 * c;
      const pulse = (performance.now() / 1000) % 1;
      dot(ctx, hx, hy, 16 + pulse * 22, null, rgba(pal.a, (1 - pulse) * 0.55));
      dot(ctx, hx, hy, 16 + ((pulse + 0.5) % 1) * 22, null, rgba(pal.a, (1 - ((pulse + 0.5) % 1)) * 0.3));
      txt(ctx, '37', hx - 46, hy - 34, { size: 18, mono: true, weight: 700, color: rgba(pal.a, 0.95) });
      line(ctx, hx - 30, hy - 28, hx - 12, hy - 12, rgba(pal.a, 0.5), 1, [3, 3]);

      box(ctx, 560, 140, 300, 240, 'rgba(6,12,22,0.75)', 'rgba(120,180,220,0.14)');
      txt(ctx, 'ALPHAGO', 584, 176, { size: 9, mono: true, color: rgba(pal.a, 0.85) });
      txt(ctx, 'vs 李世石', 836, 176, { size: 9, mono: true, color: 'rgba(127,142,168,0.9)', align: 'right' });
      txt(ctx, '4 : 1', 710, 240, { size: 40, mono: true, weight: 700, color: '#eafaff', align: 'center' });
      line(ctx, 584, 272, 836, 272, 'rgba(120,180,220,0.16)', 1);
      txt(ctx, '2016.03 · 首尔', 584, 296, { size: 9.5, mono: true, color: 'rgba(127,142,168,0.9)' });
      txt(ctx, '第 2 局 · 第 37 手 = 五路肩冲', 584, 326, { size: 9.5, color: 'rgba(180,200,220,0.85)' });
      txt(ctx, '人类棋谱中不存在的一手', 584, 350, { size: 9, color: 'rgba(127,142,168,0.75)' });

      txt(ctx, phase === 2 ? '胜率评估：约 50% → 70%' : '策略网络 + 价值网络 + 树搜索', 500, 500, {
        size: 10.5,
        color: rgba(pal.c, 0.8),
        align: 'center'
      });
    },

    attention(ctx, p, step, pal) {
      const phase = step.args && step.args.phase;
      const tokens = ['我', '爱', '人工', '智能', '因为', '它', '有用'];
      const widths = [46, 46, 62, 62, 62, 46, 62];
      const gap = 14;
      const total = widths.reduce((s, w) => s + w, 0) + gap * (tokens.length - 1);
      let x = 500 - total / 2;
      const y = 252;

      const positions = widths.map((w) => {
        const cx = x + w / 2;
        x += w + gap;
        return cx;
      });

      const weights = [0.08, 0.32, 0.92, 0.68, 0.44, 0.22, 0.14];
      const heads = phase === 2 ? 4 : 1;
      const colors = [pal.a, pal.w, pal.b, pal.c];

      for (let h = 0; h < heads; h += 1) {
        const from = phase === 2 ? h % tokens.length : 2;
        const lift = phase === 2 ? 120 + h * 34 : 150;
        positions.forEach((tx, j) => {
          if (j === from) return;
          const w = phase === 2 ? (weights[(j + h) % weights.length] * 0.9) : weights[j];
          const q = clamp01(p * 2 - Math.abs(j - from) * 0.08 - h * 0.1);
          if (q <= 0) return;
          ctx.save();
          ctx.strokeStyle = rgba(colors[h % colors.length], (0.2 + w * 0.62) * q);
          ctx.lineWidth = (1 + w * 3) * 0.9;
          ctx.beginPath();
          ctx.moveTo(positions[from], y - 26);
          ctx.quadraticCurveTo((positions[from] + tx) / 2, y - lift, tx, y - 26);
          ctx.stroke();
          ctx.restore();
        });
      }

      // 注意力权重矩阵
      const mq = clamp01(p * 1.6 - 0.25);
      if (mq > 0) {
        const cell = 21;
        const ox = 500 - (tokens.length * cell) / 2;
        const oy = 336;
        for (let i = 0; i < tokens.length; i += 1) {
          for (let j = 0; j < tokens.length; j += 1) {
            const w = weights[(i + j) % weights.length];
            ctx.fillStyle = rgba(pal.a, (0.04 + w * 0.55) * mq);
            ctx.fillRect(ox + j * cell, oy + i * cell, cell - 2, cell - 2);
          }
        }
        box(ctx, ox - 2, oy - 2, tokens.length * cell + 1, tokens.length * cell + 1, null, rgba(pal.a, 0.18 * mq));
        txt(ctx, 'ATTENTION WEIGHTS', ox, oy + tokens.length * cell + 14, {
          size: 8,
          mono: true,
          color: 'rgba(127,142,168,' + (0.5 + mq * 0.4) + ')'
        });
      }

      tokens.forEach((t, i) => {
        const q = clamp01(p * 2.4 - i * 0.08);
        const w = widths[i];
        const x0 = positions[i] - w / 2;
        box(ctx, x0, y - 26, w, 52, 'rgba(10,20,34,0.95)', rgba(pal.a, 0.26 + 0.62 * (weights[i] * q)), 1, 3);
        txt(ctx, t, positions[i], y, { size: 15, color: q > 0.4 ? '#eafaff' : 'rgba(120,150,175,0.5)', align: 'center' });
        txt(ctx, String(i), positions[i], y - 40, { size: 8, mono: true, color: 'rgba(127,142,168,0.6)', align: 'center' });
      });

      if (phase === 2) {
        txt(ctx, '8 heads · 并行关注不同关系', 500, 534, {
          size: 11,
          color: rgba(pal.c, 0.85),
          align: 'center'
        });
      } else {
        txt(ctx, 'Attention(Q,K,V) = softmax(QKᵀ/√d)V', 500, 534, {
          size: 11.5,
          mono: true,
          color: 'rgba(127,142,168,0.9)',
          align: 'center'
        });
      }
    },

    scale(ctx, p, step, pal) {
      const base = 452;
      const left = 158;
      const right = 906;

      // 奖金对比模式（Watson）
      if (step.args && step.args.money) {
        const rows = [
          { l: 'WATSON', v: 77100 },
          { l: 'KEN JENNINGS', v: 24000 },
          { l: 'BRAD RUTTER', v: 21600 }
        ];
        const maxV = 84000;
        line(ctx, left, base, right, base, 'rgba(120,180,220,0.28)', 1.2);
        rows.forEach((r, i) => {
          const q = clamp01(p * 2.8 - i * 0.25);
          const w = ((right - left - 190) * (r.v / maxV)) * q;
          const y = 168 + i * 92;
          box(ctx, left, y, Math.max(w, 6), 48, i === 0 ? rgba(pal.a, 0.22) : 'rgba(120,180,220,0.1)', rgba(pal.a, i === 0 ? 0.7 : 0.24), 1, 2);
          txt(ctx, r.l, left, y - 15, { size: 9, mono: true, color: 'rgba(127,142,168,0.9)' });
          if (q > 0.45) {
            txt(ctx, '$' + r.v.toLocaleString('en-US'), left + w + 14, y + 24, {
              size: 13,
              mono: true,
              color: i === 0 ? rgba(pal.c, 0.95) : 'rgba(180,200,220,0.75)'
            });
          }
        });
        txt(ctx, 'JEOPARDY! · 2011 FEB · 100 万美元奖金', left, 500, {
          size: 9.5,
          mono: true,
          color: 'rgba(127,142,168,0.75)'
        });
        return;
      }

      const phase = step.args ? step.args.phase : 1;
      line(ctx, left, base, right, base, 'rgba(120,180,220,0.28)', 1.2);
      line(ctx, left, 128, left, base, 'rgba(120,180,220,0.18)', 1);

      const minLog = 7.6;
      const maxLog = 12.6;
      const yOf = (v) => base - ((v - minLog) / (maxLog - minLog)) * 300;

      [8, 10, 12].forEach((v) => {
        const y = yOf(v);
        line(ctx, left, y, right, y, 'rgba(90,150,185,0.1)', 1);
        txt(ctx, '10^' + v, left - 12, y, { size: 8.5, mono: true, color: 'rgba(127,142,168,0.7)', align: 'right' });
      });

      let bars;
      if (phase === 3) {
        bars = [
          { l: 'Llama 3', v: 11.6, sub: '400B+' },
          { l: 'Qwen 2.5', v: 11.4, sub: '全尺寸' },
          { l: 'V3 MoE', v: 11.8, sub: '671B / 37B' },
          { l: '闭源前沿', v: 12.2, sub: '未公开' }
        ];
      } else {
        bars = [
          { l: 'GPT-1', v: 8.07, sub: '1.17 亿' },
          { l: 'GPT-2', v: 9.18, sub: '15 亿' },
          { l: 'GPT-3', v: 11.24, sub: '1750 亿' },
          { l: 'GPT-4', v: 12.0, sub: '未公开' }
        ];
      }

      const bw = 94;
      const gap = (right - left - bars.length * bw) / (bars.length + 1);

      bars.forEach((b, i) => {
        const q = clamp01(p * 3 - i * 0.28);
        const y = yOf(b.v);
        const h = (base - y) * q;
        const x = left + gap + i * (bw + gap);
        const g = ctx.createLinearGradient(0, base - h, 0, base);
        g.addColorStop(0, rgba(pal.a, 0.85));
        g.addColorStop(1, rgba(pal.b, 0.22));
        box(ctx, x, base - h, bw, Math.max(h, 2), g, rgba(pal.a, 0.4), 1, 2);
        txt(ctx, b.l, x + bw / 2, base + 22, { size: 9.5, mono: true, color: '#93a9bd', align: 'center' });
        txt(ctx, b.sub, x + bw / 2, base + 42, { size: 9, color: 'rgba(127,142,168,0.8)', align: 'center' });
        if (q > 0.9) {
          txt(ctx, '10^' + b.v.toFixed(1), x + bw / 2, y - 14, {
            size: 8.5,
            mono: true,
            color: rgba(pal.c, 0.8),
            align: 'center'
          });
        }
      });

      if (phase === 2) {
        const cp = clamp01((p - 0.5) / 0.5);
        line(ctx, left, base - 50, lerp(left, right, cp), base - 320, 'rgba(248,113,113,0.55)', 1.4, [6, 5]);
        txt(ctx, '成本与延迟同步上升', 690, 118, { size: 10.5, color: 'rgba(248,113,113,0.85)', align: 'center' });
      } else if (phase === 3) {
        txt(ctx, '开源权重 · 价格下降一个数量级', 532, 106, { size: 10.5, color: rgba(pal.c, 0.85), align: 'center' });
      } else {
        txt(ctx, 'Scaling Laws：损失随规模幂律下降', 532, 106, {
          size: 10.5,
          color: 'rgba(127,142,168,0.9)',
          align: 'center'
        });
      }
    },

    diffusion(ctx, p, step, pal) {
      const phase = step.args && step.args.phase;
      const cols = 16;
      const rows = 9;
      const cw = 46;
      const ch = 36;
      const ox = 132;
      const oy = 128;

      const scene = (i, j) => {
        if (i >= 10 && i <= 13 && j >= 1 && j <= 4) return 1;
        const ridge = 3.2 + Math.sin(i * 0.6) * 1.6 + Math.cos(i * 0.27) * 1.2;
        if (j > ridge) return 0.38 + hash(i * 7) * 0.22;
        return 0.05 + (1 - j / rows) * 0.1;
      };

      for (let i = 0; i < cols; i += 1) {
        for (let j = 0; j < rows; j += 1) {
          const tx = ox + i * cw;
          const ty = oy + j * ch;
          const n = hash(i * 17 + j * 29);
          const delay = (i + j) / (cols + rows);
          const q = easeOut(clamp01(p * 1.9 - delay * 0.55));
          const nx = tx + (n - 0.5) * 100 * (1 - q);
          const ny = ty + (hash(n * 91) - 0.5) * 80 * (1 - q);
          const v = scene(i, j);
          if (q < 0.45) {
            const grey = Math.round(120 + n * 70);
            ctx.fillStyle = 'rgba(' + grey + ',' + grey + ',' + (grey + 8) + ',' + (0.1 + q * 0.35) + ')';
          } else {
            ctx.fillStyle = v > 0.9 ? rgba(pal.c, 0.15 + v * 0.55 * q) : rgba(pal.a, 0.06 + v * 0.55 * q);
          }
          ctx.fillRect(nx, ny, cw - 4, ch - 4);
        }
      }

      line(ctx, ox - 10, oy + 5 * ch - 6, ox + cols * cw - 4, oy + 5 * ch - 6, rgba(pal.a, 0.16), 1);

      txt(ctx, phase === 2 ? '3 个关键帧 · 24fps · 最长 60s' : 'noise → denoise → image', 500, 500, {
        size: 10.5,
        mono: phase !== 2,
        color: 'rgba(127,142,168,0.9)',
        align: 'center'
      });
    },

    fusion(ctx, p, step, pal) {
      const inputs = [
        { y: 120, label: 'TEXT' },
        { y: 262, label: 'IMAGE' },
        { y: 404, label: 'AUDIO' }
      ];

      inputs.forEach((inp, i) => {
        const q = clamp01(p * 2 - i * 0.2);
        box(ctx, 70, inp.y, 170, 96, 'rgba(9,17,28,0.9)', rgba(pal.a, 0.24 * q + 0.08));
        txt(ctx, inp.label, 82, inp.y + 14, { size: 8.5, mono: true, color: 'rgba(127,142,168,0.85)' });
        if (i === 0) {
          for (let k = 0; k < 3; k += 1) {
            line(ctx, 86, inp.y + 36 + k * 16, 86 + (90 + k * 20) * q, inp.y + 36 + k * 16, 'rgba(180,220,240,0.28)', 4);
          }
        } else if (i === 1) {
          for (let a = 0; a < 3; a += 1) {
            for (let b = 0; b < 3; b += 1) {
              ctx.fillStyle = rgba(pal.c, (0.1 + hash(a * 7 + b * 3) * 0.4) * q);
              ctx.fillRect(88 + a * 24, inp.y + 32 + b * 18, 20, 14);
            }
          }
        } else {
          for (let k = 0; k < 24; k += 1) {
            const h = Math.abs(Math.sin(k * 0.7)) * 26 * q;
            line(ctx, 88 + k * 5.6, inp.y + 56 - h, 88 + k * 5.6, inp.y + 56 + h, rgba(pal.a, 0.55), 1.6);
          }
        }
        line(ctx, 240, inp.y + 48, 420, 300, rgba(pal.a, 0.14 + 0.12 * q), 1, [4, 6]);
      });

      box(ctx, 420, 200, 190, 190, 'rgba(8,16,28,0.95)', rgba(pal.a, 0.45));
      txt(ctx, 'MODEL', 515, 284, { size: 16, mono: true, weight: 700, color: '#eafaff', align: 'center' });
      txt(ctx, '统一 token 空间', 515, 316, { size: 9.5, color: 'rgba(127,142,168,0.9)', align: 'center' });
      for (let k = 0; k < 3; k += 1) {
        const a = 0.25 + 0.55 * Math.max(0, Math.sin(performance.now() / 400 - k));
        dot(ctx, 470 + k * 40, 350, 3, rgba(pal.a, a));
      }

      const outs = ['描述图像', '生成代码', '回答提问'];
      outs.forEach((o, i) => {
        const q = clamp01(p * 2.2 - 1 - i * 0.2);
        if (q <= 0) return;
        const y = 212 + i * 62;
        line(ctx, 610, 295, 650, y + 20, rgba(pal.a, 0.2), 1);
        box(ctx, 650, y, 250, 44, 'rgba(10,20,34,0.9)', rgba(pal.a, 0.2 * q + 0.08));
        txt(ctx, o, 666, y + 22, { size: 11.5, color: 'rgba(220,234,248,' + (0.5 + q * 0.5) + ')' });
      });
    },

    agent(ctx, p, step, pal) {
      const phase = step.args && step.args.phase;
      const cx = 470;
      const cy = 252;
      const nodes = [
        { l: '目标', a: -90 },
        { l: '计划', a: 0 },
        { l: '工具', a: 90 },
        { l: '观察', a: 180 }
      ];
      const active = Math.floor(p * 4) % 4;

      ctx.save();
      ctx.strokeStyle = 'rgba(120,180,220,0.18)';
      ctx.setLineDash([5, 7]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 210, 120, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();

      // 环上的方向箭头
      [45, 135, 225, 315].forEach((a) => {
        const rad = (a * Math.PI) / 180;
        const x = cx + Math.cos(rad) * 210;
        const y = cy + Math.sin(rad) * 120;
        const ang = Math.atan2(Math.cos(rad) * 120, -Math.sin(rad) * 210);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        ctx.fillStyle = rgba(pal.a, 0.45);
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(-4, 4.5);
        ctx.lineTo(-4, -4.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      nodes.forEach((n, i) => {
        const rad = (n.a * Math.PI) / 180;
        const x = cx + Math.cos(rad) * 210;
        const y = cy + Math.sin(rad) * 120;
        const on = i === active;
        dot(ctx, x, y, 42, on ? rgba(pal.a, 0.16) : 'rgba(9,17,28,0.95)', rgba(pal.a, on ? 0.9 : 0.3));
        txt(ctx, n.l, x, y + 1, { size: 13, color: on ? '#eafaff' : '#93a9bd', align: 'center' });
        if (phase === 2 && i <= active) {
          dot(ctx, x + 36, y - 32, 10, rgba(pal.a, 0.92));
          txt(ctx, '✓', x + 36, y - 31, { size: 10, weight: 700, color: '#04121a', align: 'center' });
        }
      });

      const tools = ['搜索', '代码', '浏览器'];
      const chipsW = 88;
      const startX = cx - (chipsW * 3 + 12 * 2) / 2;
      tools.forEach((t, i) => {
        const y = 452;
        const x = startX + i * (chipsW + 12);
        line(ctx, cx, cy + 120, x + chipsW / 2, y - 6, 'rgba(120,180,220,0.14)', 1, [3, 5]);
        box(ctx, x, y, chipsW, 30, 'rgba(10,20,34,0.9)', 'rgba(120,180,220,0.18)', 1, 2);
        txt(ctx, t, x + chipsW / 2, y + 15, { size: 9.5, color: 'rgba(180,200,220,0.85)', align: 'center' });
      });

      txt(ctx, phase === 2 ? 'TASK DONE' : 'plan → act → observe → revise', 500, 72, {
        size: 10.5,
        mono: true,
        color: phase === 2 ? rgba(pal.c, 0.9) : 'rgba(127,142,168,0.9)',
        align: 'center'
      });
      if (phase === 2) {
        txt(ctx, 'plan → act → observe → revise', 500, 514, {
          size: 9.5,
          mono: true,
          color: 'rgba(127,142,168,0.7)',
          align: 'center'
        });
      }
    }
  };

  const film = {
    node: null,
    mode: 'canvas',
    steps: [],
    duration: 0,
    t: 0,
    playing: false,
    last: 0,
    raf: 0,
    stepIdx: -1,
    ctx: null,
    poster: true
  };

  function initFilmCanvas() {
    const canvas = els.filmCanvas;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = FILM_W * dpr;
    canvas.height = FILM_H * dpr;
    film.ctx = canvas.getContext('2d');
    film.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function setFilmIcon(playing) {
    if (!els.filmIcon) return;
    els.filmIcon.innerHTML = playing
      ? '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />'
      : '<path d="M8 5.5v13l11-6.5z" />';
    els.filmToggle.setAttribute('aria-label', playing ? '暂停影片' : '播放影片');
  }

  function setupFilm(item) {
    filmStop();
    film.node = item;
    const pal = PAL[(item.film && item.film.palette) || 'cyan'] || PAL.cyan;
    film.pal = pal;

    // 真实视频优先
    if (item.video) {
      film.mode = 'video';
      els.filmCanvas.hidden = true;
      els.filmVideo.hidden = false;
      els.filmVideo.src = item.video;
      els.filmVideo.poster = '';
      els.filmBigPlay.hidden = true;
      els.filmToggle.parentElement.hidden = true;
      els.filmSteps.hidden = true;
      if (els.filmNote) els.filmNote.textContent = '真实视频';
      els.filmChapter.textContent = 'VIDEO';
      els.filmCaption.textContent = item.tagline;
      if (els.filmStage) els.filmStage.classList.remove('is-playing');
      return;
    }

    film.mode = 'canvas';
    els.filmCanvas.hidden = false;
    els.filmVideo.hidden = true;
    els.filmVideo.removeAttribute('src');
    els.filmBigPlay.hidden = false;
    els.filmToggle.parentElement.hidden = false;
    els.filmSteps.hidden = false;
    if (els.filmNote) els.filmNote.textContent = '程序化动画 · 无音轨';
    if (els.filmStage) els.filmStage.classList.remove('is-playing');

    film.steps = (item.film && item.film.steps) || [];
    film.duration = film.steps.length * STEP_SEC;
    film.t = 0;
    film.stepIdx = -1;
    film.poster = true;

    renderFilmChapters();
    renderFilmMarks();
    updateFilmFrame(true);
  }

  function renderFilmChapters() {
    els.filmSteps.innerHTML = film.steps
      .map(
        (s, i) =>
          '<button class="film-step" type="button" data-step="' + i + '">' +
            '<i>' + String(i + 1).padStart(2, '0') + '</i>' + esc(s.t) +
          '</button>'
      )
      .join('');

    els.filmSteps.querySelectorAll('.film-step').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.step);
        film.poster = false;
        film.t = idx * STEP_SEC + 0.04;
        drawFilm();
        updateFilmFrame();
        if (!film.playing) filmPlay();
      });
    });
  }

  function renderFilmMarks() {
    els.filmMarks.innerHTML = film.steps
      .map((s, i) => {
        if (i === 0) return '';
        return '<span class="film-mark" style="left:' + ((i / film.steps.length) * 100).toFixed(3) + '%"></span>';
      })
      .join('');
  }

  function fmtTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    return '00:' + String(s).padStart(2, '0');
  }

  function updateFilmFrame(force) {
    if (film.mode === 'video') return;
    const n = film.steps.length || 1;
    const idx = Math.min(Math.floor(film.t / STEP_SEC), n - 1);
    const p = clamp01((film.t - idx * STEP_SEC) / STEP_SEC);
    const drawP = film.poster ? 0.995 : p;
    const step = film.steps[idx] || { t: '', caption: '', visual: 'network' };

    els.filmFill.style.width = (film.duration ? (film.t / film.duration) * 100 : 0) + '%';
    els.filmTime.textContent = fmtTime(film.t) + ' / ' + fmtTime(film.duration);
    els.filmTrack.setAttribute('aria-valuenow', String(Math.round((film.duration ? film.t / film.duration : 0) * 100)));
    els.filmChapter.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');

    if (idx !== film.stepIdx || force) {
      film.stepIdx = idx;
      els.filmCaption.textContent = step.caption || '';
      els.filmCaption.classList.remove('is-swap');
      // 触发重排以重播动画
      void els.filmCaption.offsetWidth;
      els.filmCaption.classList.add('is-swap');
      els.filmSteps.querySelectorAll('.film-step').forEach((b, i) => {
        b.classList.toggle('is-active', i === idx);
      });
    }

    if (film.ctx) {
      const pal = film.pal || PAL.cyan;
      const now = performance.now() / 1000;
      paintBg(film.ctx, pal, now);
      try {
        (VISUALS[step.visual] || VISUALS.network)(film.ctx, drawP, step, pal);
      } catch (err) {
        /* 单个画面异常不应中断播放，但只提示一次便于排查 */
        if (!film.warned) {
          film.warned = true;
          console.error('[film]', step.visual, err);
        }
      }
      // 章节标题
      txt(film.ctx, step.t || '', 30, 40, { size: 13, weight: 600, color: 'rgba(233,246,255,0.92)' });
      line(film.ctx, 30, 56, 132, 56, rgba(pal.a, 0.5), 1.3);
      txt(film.ctx, String(idx + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), FILM_W - 30, 40, {
        size: 9.5,
        mono: true,
        align: 'right',
        color: rgba(pal.a, 0.75)
      });

      // 角标
      txt(film.ctx, 'AI//EVOLUTION · ARCHIVE FILM', 22, FILM_H - 12, {
        size: 7.5,
        mono: true,
        color: 'rgba(127,142,168,0.55)'
      });
      txt(film.ctx, (film.node ? film.node.year : '') + '', FILM_W - 22, FILM_H - 12, {
        size: 8.5,
        mono: true,
        color: rgba(pal.a, 0.75),
        align: 'right'
      });
    }
  }

  function drawFilm() {
    updateFilmFrame(false);
  }

  function filmTick(now) {
    if (!film.playing) return;
    const dt = Math.min((now - film.last) / 1000, 0.12);
    film.last = now;
    film.t += dt;

    if (film.t >= film.duration) {
      film.t = film.duration;
      updateFilmFrame();
      filmPause(true);
      els.filmBigPlay.querySelector('span').textContent = '重播';
      return;
    }

    updateFilmFrame();
    film.raf = window.requestAnimationFrame(filmTick);
  }

  function filmPlay() {
    if (film.mode === 'video') {
      els.filmVideo.play();
      return;
    }
    if (!film.steps.length) return;
    if (film.t >= film.duration - 0.01) film.t = 0;
    film.poster = false;
    film.playing = true;
    film.last = performance.now();
    els.filmStage.classList.add('is-playing');
    setFilmIcon(true);
    film.raf = window.requestAnimationFrame(filmTick);
  }

  function filmPause(ended) {
    film.playing = false;
    window.cancelAnimationFrame(film.raf);
    if (els.filmStage) els.filmStage.classList.remove('is-playing');
    setFilmIcon(false);
    if (ended && els.filmBigPlay) {
      els.filmBigPlay.hidden = false;
    }
  }

  function filmStop() {
    film.playing = false;
    window.cancelAnimationFrame(film.raf);
    if (film.mode === 'video' && els.filmVideo) {
      els.filmVideo.pause();
    }
    if (els.filmBigPlay) {
      els.filmBigPlay.hidden = false;
      const span = els.filmBigPlay.querySelector('span');
      if (span) span.textContent = '播放影片';
    }
    if (els.filmStage) els.filmStage.classList.remove('is-playing');
    setFilmIcon(false);
  }

  function seekFromEvent(e) {
    const rect = els.filmTrack.getBoundingClientRect();
    const ratio = clamp01((e.clientX - rect.left) / rect.width);
    film.poster = false;
    film.t = ratio * film.duration;
    updateFilmFrame();
  }

  function initFilmControls() {
    els.filmToggle.addEventListener('click', () => {
      if (film.playing) filmPause();
      else filmPlay();
    });

    els.filmBigPlay.addEventListener('click', (e) => {
      e.stopPropagation();
      filmPlay();
    });

    els.filmStage.addEventListener('click', (e) => {
      if (film.mode === 'video') return;
      if (e.target.closest('.film-bigplay')) return;
      if (film.playing) filmPause();
      else filmPlay();
    });

    let dragging = false;
    els.filmTrack.addEventListener('pointerdown', (e) => {
      dragging = true;
      els.filmTrack.setPointerCapture(e.pointerId);
      seekFromEvent(e);
    });
    els.filmTrack.addEventListener('pointermove', (e) => {
      if (dragging) seekFromEvent(e);
    });
    els.filmTrack.addEventListener('pointerup', (e) => {
      dragging = false;
      if (els.filmTrack.hasPointerCapture(e.pointerId)) els.filmTrack.releasePointerCapture(e.pointerId);
    });

    els.filmTrack.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        film.t = Math.min(Math.max(film.t + (e.key === 'ArrowRight' ? 2 : -2), 0), film.duration);
        updateFilmFrame();
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        e.stopPropagation();
        film.t = e.key === 'Home' ? 0 : film.duration;
        updateFilmFrame();
      }
    });

    window.addEventListener('resize', () => {
      if (!state.opened) return;
      updateFilmFrame(true);
    });
  }

  /* ============================================================
     4. 详情层
     ============================================================ */

  function setHash(id, replace) {
    const target = '#/node/' + id;
    if (replace) {
      try {
        window.location.replace(target);
        return;
      } catch (err) {
        /* file:// 下可能被拒绝，退化为赋值 */
      }
    }
    window.location.hash = target;
  }

  function fillDetail(item) {
    const era = eraOf(item.era);
    const i = indexOf(item.id);
    const total = events.length;

    els.detailEraText.textContent = era.name + ' · ' + era.range;
    els.detailNode.textContent = 'NODE ' + String(i + 1).padStart(2, '0') + ' / ' + total;
    els.detailYear.textContent = item.year;
    els.detailTitle.textContent = item.title;
    els.detailEn.textContent = item.en || '';
    els.detailTagline.textContent = item.tagline;
    els.detailTags.innerHTML = item.tags.map((t) => '<li>' + esc(t) + '</li>').join('');

    els.detailFacts.innerHTML = (item.facts || [])
      .map(
        (f) =>
          '<li><span class="fact-v">' + esc(f.v) + '</span><span class="fact-k">' + esc(f.k) + '</span></li>'
      )
      .join('');
    els.detailFacts.hidden = !(item.facts && item.facts.length);

    const meta = [];
    if (item.people) meta.push(['关键人物', item.people]);
    if (item.org) meta.push(['机构 / 团队', item.org]);
    if (item.geo && item.geo.length) {
      const places = [];
      item.geo.forEach((g) => {
        const label = g.place + '（' + g.country + '）';
        if (places.indexOf(label) < 0) places.push(label);
      });
      meta.push(['发生地', places.join(' · ')]);
    }
    els.detailMeta.innerHTML = meta
      .map((pair) => '<div><dt>' + esc(pair[0]) + '</dt><dd>' + esc(pair[1]) + '</dd></div>')
      .join('');
    els.detailMeta.hidden = meta.length === 0;

    if (els.detailAtlas) {
      const hasGeo = !!(item.geo && item.geo.length);
      els.detailAtlas.hidden = !hasGeo;
      els.detailAtlas.dataset.id = hasGeo ? item.id : '';
      if (hasGeo) els.detailAtlasText.textContent = '在地图上查看 · ' + item.geo[0].place;
    }

    els.detailBody.innerHTML = item.sections
      .map((s, idx) => {
        const label = ['SECTION 01', 'SECTION 02', 'SECTION 03', 'SECTION 04', 'SECTION 05'][idx] || 'SECTION';
        return (
          '<section><p class="sec-label">' + label + '</p>' +
          '<h3>' + esc(s.h) + '</h3><p>' + esc(s.p) + '</p></section>'
        );
      })
      .join('');

    if (item.quote) {
      els.detailQuote.hidden = false;
      els.detailQuote.innerHTML = '<p>' + esc(item.quote.text) + '</p><footer>' + esc(item.quote.by) + '</footer>';
    } else {
      els.detailQuote.hidden = true;
      els.detailQuote.innerHTML = '';
    }

    if (els.filmExt) {
      els.filmExt.href =
        'https://search.bilibili.com/all?keyword=' + encodeURIComponent(item.title + ' ' + item.year + ' AI');
    }

    setupFilm(item);

    const prev = events[i - 1];
    const next = events[i + 1];
    els.prevBtn.disabled = !prev;
    els.nextBtn.disabled = !next;
    els.prevName.textContent = prev ? prev.year + ' · ' + prev.title : '已是起点';
    els.nextName.textContent = next ? next.year + ' · ' + next.title : '已是最新节点';
    els.prevBtn.dataset.target = prev ? prev.id : '';
    els.nextBtn.dataset.target = next ? next.id : '';
  }

  function openDetail(id, opts) {
    const item = events.find((e) => e.id === id);
    if (!item) return;
    const options = opts || {};

    state.closing = false;
    fillDetail(item);
    state.currentId = id;

    if (!state.opened) state.trigger = document.activeElement;
    state.opened = true;

    els.detail.hidden = false;
    document.body.classList.add('is-locked');
    els.detailScroll.scrollTop = 0;
    els.detailPanel.classList.remove('is-at-end');

    window.requestAnimationFrame(() => {
      els.detail.classList.add('is-open');
      updateFade();
    });

    const main = $('main');
    const hud = $('.hud');
    if ('inert' in HTMLElement.prototype) {
      if (main) main.inert = true;
      if (hud) hud.inert = true;
    }

    window.setTimeout(() => els.closeBtn.focus({ preventScroll: true }), 60);
    document.title = item.year + ' ' + item.title + ' · AI EVOLUTION';

    if (options.push) {
      state.pushed = true;
      setHash(id, false);
    } else if (options.replaceHash) {
      setHash(id, true);
    }
  }

  function goTo(targetId) {
    if (!targetId) return;
    const item = events.find((e) => e.id === targetId);
    if (!item) return;
    filmStop();
    fillDetail(item);
    state.currentId = targetId;
    els.detailScroll.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    document.title = item.year + ' ' + item.title + ' · AI EVOLUTION';
    setHash(targetId, true);
  }

  function closeDetail(opts) {
    const options = opts || {};
    if (!state.opened || state.closing) return;
    state.closing = true;

    filmPause();
    if (film.mode === 'video' && els.filmVideo) els.filmVideo.pause();

    els.detail.classList.remove('is-open');
    document.body.classList.remove('is-locked');

    const main = $('main');
    const hud = $('.hud');
    if ('inert' in HTMLElement.prototype) {
      if (main) main.inert = false;
      if (hud) hud.inert = false;
    }

    const finish = () => {
      els.detail.hidden = true;
      state.opened = false;
      state.closing = false;
      state.currentId = null;
      document.title = BASE_TITLE;
      const trigger = state.trigger;
      state.trigger = null;
      if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
    };

    if (reduceMotion) finish();
    else window.setTimeout(finish, 300);

    if (options.history !== false && state.pushed) {
      state.pushed = false;
      window.history.back();
    }
  }

  function updateFade() {
    const sc = els.detailScroll;
    if (!sc) return;
    const atEnd = sc.scrollHeight - sc.scrollTop - sc.clientHeight < 14;
    els.detailPanel.classList.toggle('is-at-end', atEnd);
  }

  function idFromHash() {
    const m = window.location.hash.match(/^#\/node\/([\w-]+)$/);
    return m ? m[1] : null;
  }

  function initDetail() {
    els.closeBtn.addEventListener('click', () => closeDetail());
    els.detail.addEventListener('click', (e) => {
      if (e.target.dataset.close) closeDetail();
    });
    els.detailScroll.addEventListener('scroll', updateFade, { passive: true });
    window.addEventListener('resize', updateFade);

    els.prevBtn.addEventListener('click', () => goTo(els.prevBtn.dataset.target));
    els.nextBtn.addEventListener('click', () => goTo(els.nextBtn.dataset.target));

    document.addEventListener('keydown', (e) => {
      if (!state.opened) return;
      if (e.target.closest && e.target.closest('.film-track')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeDetail();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(els.nextBtn.dataset.target);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(els.prevBtn.dataset.target);
        return;
      }
      if (e.key === 'Tab') {
        const focusables = els.detailPanel.querySelectorAll(
          'button:not(:disabled):not([hidden]), [href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    window.addEventListener('hashchange', () => {
      const id = idFromHash();
      if (id) {
        if (id !== state.currentId) openDetail(id, {});
      } else if (state.opened && !state.closing) {
        closeDetail({ history: false });
      }
    });

    const initial = idFromHash();
    if (initial && events.some((e) => e.id === initial)) {
      openDetail(initial, {});
    }
  }

  /* ============================================================
     5. 打字机
     ============================================================ */

  function initTypewriter() {
    const el = els.typed;
    if (!el) return;
    const phrases = [
      '从一颗人工神经元，到会推理、会行动的智能体。',
      '八个十年，二十个节点，一条通往通用智能的路径。',
      '每一次“不可能”，都只是尚未被解决的技术问题。'
    ];

    if (reduceMotion) {
      el.textContent = phrases[0];
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      const current = phrases[phraseIndex];
      charIndex += deleting ? -1 : 1;
      el.textContent = current.slice(0, charIndex);

      let delay = deleting ? 26 : 58;
      if (!deleting && charIndex === current.length) {
        deleting = true;
        delay = 2400;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 360;
      }
      window.setTimeout(tick, delay);
    };

    window.setTimeout(tick, 900);
  }

  /* ============================================================
     6. 背景：星野 + 神经网络
     ============================================================ */

  function initBackground() {
    const canvas = $('#bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let nodes = [];
    let rafId = 0;
    let sweep = 0;
    const pointer = { x: -9999, y: -9999 };

    function build() {
      const starCount = Math.min(150, Math.round(width / 9));
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.25,
        a: Math.random() * 0.5 + 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.012 + 0.004
      }));

      const nodeCount = Math.min(44, Math.max(16, Math.round(width / 34)));
      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.9
      }));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((s) => {
        ctx.globalAlpha = s.a;
        ctx.fillStyle = '#cfeaf7';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    function draw(time) {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((s) => {
        const twinkle = 0.55 + Math.sin(time * s.speed + s.phase) * 0.45;
        ctx.globalAlpha = Math.max(0.05, s.a * twinkle);
        ctx.fillStyle = '#d6f1ff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      const maxDist = Math.min(190, Math.max(120, width * 0.12));
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > maxDist) continue;
          const alpha = (1 - dist / maxDist) * 0.17;
          ctx.strokeStyle = 'rgba(34, 211, 238, ' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      nodes.forEach((n) => {
        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 26000 && d2 > 0.01) {
          const f = (1 - d2 / 26000) * 0.035;
          n.vx += dx * f;
          n.vy += dy * f;
        }

        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.996;
        n.vy *= 0.996;

        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;

        const glow = 0.5 + Math.sin(time * 0.0009 + n.x * 0.01) * 0.25;
        ctx.fillStyle = 'rgba(34, 211, 238, ' + (0.18 * glow).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(160, 240, 255, ' + (0.55 * glow + 0.2).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      sweep += 0.00016 * 16.7;
      if (sweep > 1.25) sweep = -0.25;
      const sy = sweep * height;
      const grad = ctx.createLinearGradient(0, sy - 90, 0, sy + 90);
      grad.addColorStop(0, 'rgba(34, 211, 238, 0)');
      grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.045)');
      grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, sy - 90, width, 180);

      rafId = window.requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    });
    window.addEventListener('pointerleave', () => {
      pointer.x = -9999;
      pointer.y = -9999;
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!reduceMotion && !rafId) {
        rafId = window.requestAnimationFrame(draw);
      }
    });

    resize();
    if (reduceMotion) {
      drawStatic();
    } else {
      rafId = window.requestAnimationFrame(draw);
    }
  }

  /* ============================================================
     7. 启动
     ============================================================ */

  renderTimeline();
  renderFilters();
  renderLegend();
  renderDeck();
  applyFilter();
  initReveal();
  initScrollUi();
  initCounters();
  initFilmCanvas();
  initFilmControls();
  initDetail();
  initTypewriter();
  initBackground();
  initSearch();
  initAtlas();

  if (els.detailAtlas) {
    els.detailAtlas.addEventListener('click', () => {
      const id = els.detailAtlas.dataset.id;
      if (!id) return;
      closeDetail();
      window.setTimeout(() => goToAtlas(id), reduceMotion ? 60 : 360);
    });
  }

  if (els.randomBtn) {
    els.randomBtn.addEventListener('click', () => {
      const pick = events[Math.floor(Math.random() * events.length)];
      if (pick) openDetail(pick.id, { push: true });
    });
  }
})();
