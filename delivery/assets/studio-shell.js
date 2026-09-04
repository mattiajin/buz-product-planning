(function mountStudioRail() {
  var rail = document.querySelector('[data-studio-rail]');
  if (!rail || rail.getAttribute('data-mounted') === '1') return;
  var tpl = rail.querySelector('template[data-studio-explore]');
  var explore = tpl ? tpl.innerHTML : '';
  var switchSrc = 'switch.svg';
  try {
    if (document.currentScript && document.currentScript.src) {
      switchSrc = new URL('switch.svg', document.currentScript.src).href;
    }
  } catch (err) {}
  rail.setAttribute('data-mounted', '1');
  rail.innerHTML =
    '<div class="studio-group studio-group--annot">' +
      '<div class="studio-wifi">' +
        '<p class="studio-wifi-title" id="annot-power-label">PRD 与标注</p>' +
        '<label class="switch studio-switch">' +
          '<input type="checkbox" id="annot-power" checked aria-labelledby="annot-power-label" aria-controls="annot-kind">' +
          '<span class="switch-ui"><img src="' + switchSrc + '" alt=""></span>' +
          '<span class="switch-off"></span>' +
        '</label>' +
      '</div>' +
      '<div class="studio-annot-slot">' +
        '<div class="studio-annot-kinds" id="annot-kind" role="radiogroup" aria-label="交付物类型" aria-hidden="false">' +
          '<div class="studio-card studio-menu">' +
            '<div class="annot-thumb" aria-hidden="true"></div>' +
            '<button type="button" class="annot-mode" data-annot-mode="prd" role="radio" aria-checked="false" aria-controls="annot-col">' +
              'PRD<span class="annot-check" aria-hidden="true">&#xE904;</span>' +
            '</button>' +
            '<button type="button" class="annot-mode" data-annot-mode="spec" role="radio" aria-checked="false" aria-controls="annot-col">' +
              '交互与动效标注<span class="annot-check" aria-hidden="true">&#xE904;</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="studio-workspace-stack">' +
      '<button type="button" class="studio-workspace" id="explore-gate" aria-label="打开设计探索" aria-expanded="false" aria-controls="explore-group">' +
        '<svg class="studio-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>' +
        '<span class="studio-workspace-title">设计探索</span>' +
      '</button>' +
      '<div class="studio-explore-slot">' +
        '<div class="studio-group studio-group--explore" id="explore-group" aria-hidden="true">' +
          explore +
        '</div>' +
      '</div>' +
    '</div>';
})();

(function bindStudioNav() {
  if (window.__studioNavBound) return;
  window.__studioNavBound = true;
  var nav = document.querySelector('.studio-nav');
  var pick = document.querySelector('.studio-nav-pick');
  if (!nav || !pick) return;
  var btn = pick.querySelector('.studio-nav-switch');
  var menu = nav.querySelector('.studio-nav-menu');
  if (!btn || !menu) return;
  function setOpen(on) {
    nav.classList.toggle('is-open', on);
    pick.classList.toggle('is-open', on);
    btn.setAttribute('aria-expanded', on ? 'true' : 'false');
  }
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(btn.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function (e) { e.stopPropagation(); });
  document.addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (btn.getAttribute('aria-expanded') !== 'true') return;
    e.preventDefault();
    e.stopImmediatePropagation();
    setOpen(false);
    btn.focus();
  }, true);
})();

(function bindStudioChrome() {
  if (window.__studioChromeBound) return;
  window.__studioChromeBound = true;
  var studio = document.getElementById('studio');
  if (!studio) return;
  var annot = document.getElementById('annot-col');
  var prdPanel = document.getElementById('prd-panel');
  var specPanel = document.getElementById('spec-panel');
  var hint = document.getElementById('explore-hint');
  var annotModes = document.querySelectorAll('.annot-mode');
  var annotPower = document.getElementById('annot-power');
  var annotKind = document.getElementById('annot-kind');
  var lastAnnot = studio.getAttribute('data-annot') || 'prd';
  var hoveredHot = {};
  var pinnedHot = '';
  var annotThumb = document.querySelector('.annot-thumb');
  var annotMenu = document.querySelector('.studio-menu');
  var exploreGate = document.getElementById('explore-gate');
  var exploreGroup = document.getElementById('explore-group');

  function layoutAnnotThumb() {
    if (!annotThumb || !annotMenu) return;
    var on = document.querySelector('.annot-mode.is-on');
    if (!studio.classList.contains('is-annot') || !on) return;
    var track = annotMenu.getBoundingClientRect();
    var item = on.getBoundingClientRect();
    annotThumb.style.height = item.height + 'px';
    annotThumb.style.transform = 'translate3d(0,' + (item.top - track.top) + 'px,0)';
  }

  function layoutRailSegs() {
    document.querySelectorAll('.studio-rail .studio-seg').forEach(function (seg) {
      var thumb = seg.querySelector('.studio-seg-thumb');
      var on = seg.querySelector('button.is-on');
      if (!thumb || !on) return;
      var track = seg.getBoundingClientRect();
      var item = on.getBoundingClientRect();
      thumb.style.width = item.width + 'px';
      thumb.style.transform = 'translate3d(' + (item.left - track.left) + 'px,' + (item.top - track.top) + 'px,0)';
    });
  }
  window.layoutStudioRailSegs = layoutRailSegs;

  function afterChromeLayout(fn) {
    requestAnimationFrame(function () {
      fn();
      requestAnimationFrame(fn);
    });
  }

  function writeChromeParams(mode) {
    try {
      var url = new URL(location.href);
      if (mode) url.searchParams.set('annot', mode);
      else url.searchParams.delete('annot');
      if (studio.classList.contains('is-explore')) url.searchParams.set('explore', '1');
      else url.searchParams.delete('explore');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (err) {}
  }

  function setAnnotMode(mode, skipUrl) {
    if (mode === 'off') mode = '';
    if (mode === 'prd' || mode === 'spec') lastAnnot = mode;
    var prdOn = mode === 'prd';
    var specOn = mode === 'spec';
    var annotOn = prdOn || specOn;
    studio.classList.toggle('is-prd', prdOn);
    studio.classList.toggle('is-spec', specOn);
    studio.classList.toggle('is-annot', annotOn);
    if (annot) annot.setAttribute('aria-hidden', annotOn ? 'false' : 'true');
    if (prdPanel) prdPanel.setAttribute('aria-hidden', prdOn ? 'false' : 'true');
    if (specPanel) specPanel.setAttribute('aria-hidden', specOn ? 'false' : 'true');
    if (annotPower) annotPower.checked = annotOn;
    if (annotKind) annotKind.setAttribute('aria-hidden', annotOn ? 'false' : 'true');
    annotModes.forEach(function (btn) {
      var on = btn.getAttribute('data-annot-mode') === mode;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    if (!skipUrl) writeChromeParams(mode);
    afterChromeLayout(layoutAnnotThumb);
    hoveredHot = {};
    applyHot();
  }

  window.setStudioAnnotMode = setAnnotMode;

  if (annotPower) {
    annotPower.addEventListener('change', function () {
      setAnnotMode(annotPower.checked ? lastAnnot : '');
    });
  }
  annotModes.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setAnnotMode(btn.getAttribute('data-annot-mode'));
    });
  });

  var hints = {
    v1: 'V1 · 普通路径 · Working toast',
    v2: 'V2 · 基于 V1 · 扫描与骨架',
    v3: 'V3 · 框内重写 · 底部状态条',
    v4: 'V4 · 框内重写 · 按住对比'
  };

  function setExploreOpen(open, skipUrl) {
    if (!exploreGate || !exploreGroup) return;
    studio.classList.toggle('is-explore', open);
    exploreGroup.setAttribute('aria-hidden', open ? 'false' : 'true');
    exploreGate.setAttribute('aria-expanded', open ? 'true' : 'false');
    exploreGate.setAttribute('aria-label', open ? '收起设计探索' : '打开设计探索');
    if (!skipUrl) {
      var mode = studio.classList.contains('is-prd') ? 'prd' : studio.classList.contains('is-spec') ? 'spec' : '';
      writeChromeParams(mode);
    }
    afterChromeLayout(layoutRailSegs);
  }

  var wantExplore = /(?:[?&]explore=1(?:&|$))|(?:#explore)/.test(location.search + location.hash);
  var annotFromUrl = /(?:[?&]annot=(prd|spec)(?:&|$))/.exec(location.search);
  var fallback = studio.getAttribute('data-annot') || 'prd';
  setExploreOpen(wantExplore, true);
  setAnnotMode(annotFromUrl ? annotFromUrl[1] : fallback, true);
  writeChromeParams(annotFromUrl ? annotFromUrl[1] : fallback);
  layoutAnnotThumb();
  layoutRailSegs();
  requestAnimationFrame(function () {
    layoutAnnotThumb();
    layoutRailSegs();
    studio.classList.add('is-ready');
  });

  if (exploreGate) {
    exploreGate.addEventListener('click', function () {
      setExploreOpen(!studio.classList.contains('is-explore'));
    });
  }

  document.querySelectorAll('[data-explore]').forEach(function (btn) {
    if (!btn.classList.contains('explore-pill')) return;
    btn.addEventListener('click', function () {
      var ver = btn.getAttribute('data-explore');
      studio.setAttribute('data-explore', ver);
      document.querySelectorAll('.explore-pill').forEach(function (el) {
        var on = el === btn;
        el.classList.toggle('is-on', on);
        el.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      if (hint) hint.textContent = hints[ver] || hints.v1;
      layoutRailSegs();
    });
  });

  var annotSlot = document.querySelector('.studio-annot-slot');
  var exploreSlot = document.querySelector('.studio-explore-slot');
  if (annotSlot) {
    annotSlot.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'grid-template-rows') layoutAnnotThumb();
    });
  }
  if (exploreSlot) {
    exploreSlot.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'grid-template-rows') layoutRailSegs();
    });
  }
  window.addEventListener('resize', function () {
    layoutAnnotThumb();
    layoutRailSegs();
  });

  function dedent(text) {
    var lines = String(text).replace(/^\n/, '').replace(/\s+$/, '').split('\n');
    var indents = lines.filter(function (line) {
      return line.trim();
    }).map(function (line) {
      return line.match(/^\s*/)[0].length;
    });
    var min = indents.length ? Math.min.apply(null, indents) : 0;
    return lines.map(function (line) {
      return line.slice(min);
    }).join('\n') + '\n';
  }

  ['prd-md', 'spec-md'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = dedent(el.textContent);
  });

  document.querySelectorAll('.annot-md-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var block = btn.closest('.annot-md-block');
      var open = !block.classList.contains('is-open');
      block.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      var mdHint = btn.querySelector('.annot-md-hint');
      if (mdHint) mdHint.textContent = open ? '收起' : '展开';
    });
  });

  function copyAnnotMd(btn) {
    var src = document.getElementById(btn.getAttribute('data-copy'));
    if (!src) return;
    var text = src.textContent;
    if (text.slice(-1) !== '\n') text += '\n';
    function done() {
      var label = btn.querySelector('[data-copy-label]') || btn;
      btn.classList.add('is-done');
      label.textContent = '已复制';
      setTimeout(function () {
        btn.classList.remove('is-done');
        label.textContent = '复制';
      }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text, done);
      });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      done();
    } catch (err) {}
    document.body.removeChild(area);
  }

  document.querySelectorAll('.annot-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      copyAnnotMd(btn);
    });
  });

  function ruleMdSnippet(rule) {
    var n = String(rule.getAttribute('data-hot') || '').trim().split(/[\s,]+/)[0];
    var srcId = specPanel && specPanel.contains(rule) ? 'spec-md' : 'prd-md';
    var raw = (document.getElementById(srcId) || {}).textContent || '';
    var text = '';
    if (n && raw) {
      var heading = raw.match(new RegExp('(^|\\n)(##\\s*' + n + '\\b[^\\n]*\\n[\\s\\S]*?)(?=\\n##\\s+|$)'));
      if (heading) text = heading[2].trim();
      if (!text) {
        var item = raw.match(new RegExp('(^|\\n)(' + n + '\\.\\s[\\s\\S]*?)(?=\\n\\d+\\.\\s|\\n##\\s+|$)'));
        if (item) text = item[2].trim();
      }
    }
    if (!text) {
      var p = rule.querySelector('p');
      text = p ? p.textContent.trim() : '';
    }
    return text;
  }

  function copyRuleMd(btn) {
    var rule = btn.closest('.prd-rule');
    if (!rule) return;
    var text = ruleMdSnippet(rule);
    if (!text) return;
    if (text.slice(-1) !== '\n') text += '\n';
    function done() {
      btn.classList.add('is-done');
      btn.setAttribute('aria-label', '已复制');
      setTimeout(function () {
        btn.classList.remove('is-done');
        btn.setAttribute('aria-label', '复制对应段落');
      }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text, done);
      });
    } else {
      fallbackCopy(text, done);
    }
  }

  document.querySelectorAll('[data-copy-rule]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      copyRuleMd(btn);
    });
  });

  function hotIds(el) {
    return String(el.getAttribute('data-hot') || '').trim().split(/[\s,]+/).filter(Boolean);
  }

  function hotPanel() {
    if (studio.classList.contains('is-spec')) return specPanel;
    if (studio.classList.contains('is-prd')) return prdPanel;
    return null;
  }

  function modeHasHot(id) {
    var panel = hotPanel();
    return !!(panel && id && panel.querySelector('[data-hot~="' + id + '"]'));
  }

  function idsForMode(el) {
    return hotIds(el).filter(modeHasHot);
  }

  function applyHot() {
    if (pinnedHot && !modeHasHot(pinnedHot)) pinnedHot = '';
    document.querySelectorAll('[data-hot]').forEach(function (el) {
      var ids = idsForMode(el);
      var on = ids.some(function (id) {
        return hoveredHot[id] || id === pinnedHot;
      });
      el.classList.toggle('is-hot', on);
    });
    document.querySelectorAll('.prd-mark, .spec-mark').forEach(function (mark) {
      var host = mark.closest('[data-hot]');
      mark.classList.toggle('is-hot', !!(host && host.classList.contains('is-hot')));
    });
  }

  function revealAnnotHit(n) {
    if (!n || !studio.classList.contains('is-annot') || !annot) return;
    var panel = studio.classList.contains('is-spec') ? specPanel : prdPanel;
    if (!panel) return;
    var hit = panel.querySelector('.prd-rule[data-hot~="' + n + '"]') ||
      panel.querySelector('[data-hot~="' + n + '"]');
    if (hit) hit.scrollIntoView({ block: 'nearest' });
  }

  document.querySelectorAll('[data-hot]').forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      idsForMode(el).forEach(function (n) { hoveredHot[n] = true; });
      applyHot();
      if (annot && !annot.contains(el)) revealAnnotHit(idsForMode(el)[0]);
    });
    el.addEventListener('mouseleave', function () {
      idsForMode(el).forEach(function (n) { delete hoveredHot[n]; });
      applyHot();
    });
    el.addEventListener('click', function (e) {
      if (e.target.closest('.annot-demo, .annot-icon, .prd-rule-actions')) return;
      var n = idsForMode(el)[0];
      if (!n) return;
      if (el.classList.contains('prd-rule')) {
        pinnedHot = pinnedHot === n ? '' : n;
        applyHot();
      }
      if (annot && annot.contains(el)) {
        var target = annot.querySelector('[data-hot-target="' + n + '"]');
        if (target) target.scrollIntoView({ block: 'nearest' });
      } else {
        revealAnnotHit(n);
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (document.querySelector('.dialog-layer.is-open')) return;
    var phone = document.getElementById('phone');
    if (phone && (phone.classList.contains('is-keyboard') || phone.classList.contains('is-editing'))) return;
    if (studio.classList.contains('is-annot')) {
      e.preventDefault();
      setAnnotMode('');
    }
  });
})();
