  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });

  const burger = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  const overlay = document.getElementById('overlay');
  const closeNav = document.getElementById('closeNav');
  function openNav(){ mobileNav.classList.add('open'); overlay.classList.add('show'); burger.classList.add('open'); }
  function closeNavFn(){ mobileNav.classList.remove('open'); overlay.classList.remove('show'); burger.classList.remove('open'); }
  burger.addEventListener('click', () => mobileNav.classList.contains('open') ? closeNavFn() : openNav());
  closeNav.addEventListener('click', closeNavFn);
  overlay.addEventListener('click', closeNavFn);
  document.querySelectorAll('.mobile-nav a').forEach(a => a.addEventListener('click', closeNavFn));

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if(item.classList.contains('open')){ a.style.maxHeight = a.scrollHeight + 'px'; }
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => { i.classList.remove('open'); i.querySelector('.faq-a').style.maxHeight = null; });
      if(!isOpen){ item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  /* ---------- Gallery: category filter + coverflow carousel ---------- */
  (function initGalleryCarousel(){
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carPrev');
    const nextBtn = document.getElementById('carNext');
    const dotsWrap = document.getElementById('carouselDots');
    const tabs = document.querySelectorAll('.gtab');
    if(!track) return;

    const allItems = Array.from(track.querySelectorAll('.car-item'));
    let visibleItems = allItems.slice();
    let ticking = false;
    let animRAF = null;

    function getVisible(){
      return allItems.filter(el => !el.classList.contains('hidden'));
    }

    function updateScales(){
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      visibleItems.forEach(item => {
        const r = item.getBoundingClientRect();
        const itemCenter = r.left + r.width / 2;
        const dist = Math.abs(itemCenter - center);
        const ratio = Math.min(dist / (trackRect.width / 2), 1);
        const scale = 1.14 - ratio * 0.36;
        const opacity = 1 - ratio * 0.6;
        item.style.transform = `scale(${scale})`;
        item.style.opacity = opacity.toFixed(2);
        item.style.zIndex = String(Math.round((1 - ratio) * 100));
      });
      updateActiveDot();
      updateNavState();
    }

    function onScroll(){
      if(!ticking){
        window.requestAnimationFrame(() => { updateScales(); ticking = false; });
        ticking = true;
      }
    }

    function buildDots(activeIdx){
      dotsWrap.innerHTML = '';
      visibleItems.forEach((item, i) => {
        const dot = document.createElement('button');
        dot.className = 'car-dot' + (i === activeIdx ? ' active' : '');
        dot.setAttribute('aria-label', 'رفتن به تصویر ' + (i + 1));
        dot.addEventListener('click', () => scrollToItem(item));
        dotsWrap.appendChild(dot);
      });
    }

    function updateActiveDot(){
      if(!visibleItems.length) return;
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      let closestIdx = 0, closestDist = Infinity;
      visibleItems.forEach((item, i) => {
        const r = item.getBoundingClientRect();
        const d = Math.abs((r.left + r.width / 2) - center);
        if(d < closestDist){ closestDist = d; closestIdx = i; }
      });
      dotsWrap.querySelectorAll('.car-dot').forEach((d, i) => d.classList.toggle('active', i === closestIdx));
    }

    function updateNavState(){
      if(!prevBtn || !nextBtn) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      prevBtn.classList.toggle('disabled', track.scrollLeft <= 2);
      nextBtn.classList.toggle('disabled', track.scrollLeft >= maxScroll - 2);
    }

    /* Custom eased scroll — longer & smoother than the native "smooth" behavior */
    function easeInOutCubic(t){ return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    function animateScrollTo(targetLeft, duration){
      if(animRAF) cancelAnimationFrame(animRAF);
      const startLeft = track.scrollLeft;
      const distance = targetLeft - startLeft;
      const startTime = performance.now();
      duration = duration || 10;

      function frame(now){
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        track.scrollLeft = startLeft + distance * easeInOutCubic(t);
        updateScales();
        if(t < 1){ animRAF = requestAnimationFrame(frame); }
        else { animRAF = null; }
      }
      animRAF = requestAnimationFrame(frame);
    }

    function scrollToItem(item, duration){
      const trackRect = track.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const offset = (itemRect.left + itemRect.width / 2) - (trackRect.left + trackRect.width / 2);
      animateScrollTo(track.scrollLeft + offset, duration);
    }

    function step(dir){
      const gap = 22;
      const itemWidth = visibleItems[0] ? visibleItems[0].getBoundingClientRect().width : 230;
      animateScrollTo(track.scrollLeft + dir * (itemWidth + gap), 10);
    }

    function centerMiddleItem(instant){
      if(!visibleItems.length) return;
      const middleIdx = Math.floor((visibleItems.length - 1) / 2);
      const middleItem = visibleItems[middleIdx];
      if(instant){
        const trackRect = track.getBoundingClientRect();
        const itemRect = middleItem.getBoundingClientRect();
        const offset = (itemRect.left + itemRect.width / 2) - (trackRect.left + trackRect.width / 2);
        track.scrollLeft += offset;
        updateScales();
      } else {
        scrollToItem(middleItem, 10);
      }
      buildDots(middleIdx);
    }

    function applyFilter(filter){
      allItems.forEach(item => {
        const match = filter === 'all' || item.dataset.cat === filter;
        item.classList.toggle('hidden', !match);
      });
      visibleItems = getVisible();
      centerMiddleItem(true);
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        applyFilter(tab.dataset.filter);
      });
    });

    if(prevBtn) prevBtn.addEventListener('click', () => step(-1));
    if(nextBtn) nextBtn.addEventListener('click', () => step(1));
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(updateScales));

    /* Clicking any visible card (prev/next/further ones) centers it */
    allItems.forEach(item => {
      item.addEventListener('click', () => scrollToItem(item, 10));
    });

    requestAnimationFrame(() => centerMiddleItem(true));
  })();

