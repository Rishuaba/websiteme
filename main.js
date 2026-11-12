/* Site interactions: reveal animations, posts list, page transitions. */
(function () {
  window.__site = true;
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var veil = document.querySelector('.veil');

  /* ---------- Arrival: lift the veil ---------- */
  function lift() {
    if (!root.classList.contains('arriving')) return;
    requestAnimationFrame(function () {
      veil.classList.add('lift');
      root.classList.remove('arriving');
      setTimeout(function () { veil.classList.remove('lift'); }, 950);
    });
  }

  /* ---------- Reveal on load + scroll (staggered) ---------- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;

  function observe(scope) {
    var items = (scope || document).querySelectorAll('.reveal:not(.in)');
    items.forEach(function (el, i) {
      el.style.setProperty('--d', Math.min(i, 8) * 110 + 'ms');
      if (io && !reduce) io.observe(el); else el.classList.add('in');
    });
  }

  /* ---------- Posts from posts.json ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(d) {
    var dt = new Date(d + 'T00:00:00');
    return isNaN(dt) ? esc(d) : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function renderPosts() {
    var list = document.getElementById('posts');
    if (!list || !window.fetch) return Promise.resolve();
    return fetch('posts.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (posts) {
        if (!Array.isArray(posts)) return;
        posts.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
        list.innerHTML = posts.length ? posts.map(function (p) {
          return '<li class="post reveal"><a class="post-link" href="' + esc(p.url) + '">' +
            '<time class="post-date" datetime="' + esc(p.date) + '">' + fmt(p.date) + '</time>' +
            '<h3 class="post-title">' + esc(p.title) + '</h3>' +
            (p.excerpt ? '<p class="post-excerpt">' + esc(p.excerpt) + '</p>' : '') +
            '<span class="post-arrow" aria-hidden="true">→</span></a></li>';
        }).join('') : '<li class="empty">New writing coming soon.</li>';
      })
      .catch(function () { /* keep static fallback list */ });
  }

  /* ---------- Cursor glow on cards ---------- */
  document.addEventListener('pointermove', function (e) {
    var a = e.target.closest && e.target.closest('.post-link');
    if (!a) return;
    var r = a.getBoundingClientRect();
    a.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    a.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  /* ---------- Click: page transition before navigating ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    if (reduce) return;
    e.preventDefault();
    veil.style.setProperty('--vx', e.clientX + 'px');
    veil.style.setProperty('--vy', e.clientY + 'px');
    void veil.offsetWidth; /* start the circle from the click point */
    document.body.classList.add('leaving');
    veil.classList.add('cover');
    try { sessionStorage.setItem('veil', '1'); } catch (_) {}
    setTimeout(function () { location.href = url.href; }, 700);
  });

  /* Restore page when coming back via browser back/forward cache */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.body.classList.remove('leaving');
      veil.classList.remove('cover');
    }
  });

  /* ---------- Init ---------- */
  observe();
  lift();
  renderPosts().then(function () { observe(document.getElementById('posts')); });
})();
