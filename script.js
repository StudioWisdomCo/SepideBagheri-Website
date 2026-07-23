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

  document.querySelectorAll('.gtab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const f = tab.dataset.filter;
      document.querySelectorAll('.gitem').forEach(item => {
        item.style.display = (f === 'all' || item.dataset.cat === f) ? 'flex' : 'none';
      });
    });
  });
