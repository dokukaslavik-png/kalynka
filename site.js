/* ЗДО №45 «Калинка» — спільна шапка/меню/підвал + інтеракції.
   Щоб змінити меню чи контакти — правиш ТІЛЬКИ цей файл, і воно оновиться на всіх сторінках. */
(function(){
  // --- контактні дані закладу (заміни на справжні) ---
  var INFO = {
    name:'«Калинка»',
    full:'Комунальний заклад «Дошкільний навчальний заклад №45 Вінницької міської ради»',
    addr:'м. Вінниця, вул. Прикладна, 45',
    phone:'(0432) 55-55-55',
    email:'kalinka@vin.edu.ua',
    hours:'Пн–Пт, 7:30–18:30'
  };

  // --- пункти головного меню ---
  var NAV = [
    ['index.html','home','Головна'],
    ['pro-zaklad.html','pro','Про заклад'],
    ['grupy.html','grupy','Групи'],
    ['osvitniy-proces.html','osvita','Освітній процес'],
    ['proekty.html','proekty','Проєкти'],
    ['batkam.html','batkam','Батькам'],
    ['dityam.html','dityam','Дітям 🎮'],
    ['novyny.html','novyny','Новини'],
    ['dokumenty.html','dokumenty','Документи'],
    ['kontakty.html','kontakty','Контакти']
  ];

  var kalynaSVG =
    '<svg viewBox="0 0 120 120" aria-hidden="true">'+
    '<g fill="#3c8c57"><path d="M60 8c-10 14-8 26 2 34 8-10 8-24-2-34z"/>'+
    '<path d="M28 26c2 16 12 24 24 24-2-14-12-22-24-24z"/>'+
    '<path d="M92 26c-12 2-22 10-24 24 12 0 22-8 24-24z"/></g>'+
    '<g fill="#e0364b"><circle cx="52" cy="70" r="11"/><circle cx="70" cy="76" r="11"/>'+
    '<circle cx="58" cy="90" r="11"/><circle cx="44" cy="86" r="9"/><circle cx="76" cy="94" r="9"/></g>'+
    '<g fill="#ff7a8a" opacity=".55"><circle cx="49" cy="67" r="3"/><circle cx="67" cy="73" r="3"/>'+
    '<circle cx="55" cy="87" r="3"/></g></svg>';

  var page = document.body.getAttribute('data-page') || '';

  var navHTML = NAV.map(function(n){
    var active = n[1]===page ? ' class="active"' : '';
    if(n[1]==='home') return '<a class="home'+(page==='home'?' active':'')+'" href="index.html" aria-label="Головна">🏠</a>';
    return '<a href="'+n[0]+'"'+active+'>'+n[2]+'</a>';
  }).join('');

  var header =
  '<div class="topbar"><div class="wrap">'+
    '<a href="dokumenty.html">🍎 Меню харчування</a>'+
    '<a href="podii.html">📅 Календар подій</a>'+
    '<a href="galereya.html">📸 Галерея</a>'+
    '<a href="batkam.html">🧠 Психолог</a>'+
    '<a href="kontakty.html">📞 Контакти</a>'+
    '<span class="sep"></span><span class="tb-contact">'+INFO.addr+'</span>'+
  '</div></div>'+
  '<header class="header"><div class="wrap">'+
    '<a class="brand" href="index.html"><span class="mark">'+kalynaSVG+'</span>'+
      '<span class="brand-txt"><small>'+INFO.full+'</small>'+
      '<span class="name">'+INFO.name+'</span></span></a>'+
    '<div class="slogan"><span class="script">Щасливе дитинство<br>починається <b>тут!</b></span></div>'+
    '<div class="header-side"><div class="contacts">'+
      '<div class="row"><span>📞</span> '+INFO.phone+'</div>'+
      '<div class="row"><span>✉️</span> '+INFO.email+'</div></div>'+
      '<div class="social"><a href="#" aria-label="Facebook">f</a>'+
      '<a href="#" aria-label="Telegram">✈</a><a href="#" aria-label="YouTube">▶</a></div>'+
    '</div>'+
  '</div></header>'+
  '<nav class="nav"><div class="wrap">'+
    '<button class="burger" id="burger" aria-label="Меню" aria-expanded="false">☰ Меню</button>'+
    '<div class="nav-links" id="navLinks">'+navHTML+'</div>'+
  '</div></nav>';

  var footer =
  '<footer class="footer"><div class="wrap"><div class="cols">'+
    '<div><div class="name">'+INFO.name+'</div><small>'+INFO.full+'</small>'+
      '<div class="fsoc"><a href="#" aria-label="Facebook">f</a>'+
      '<a href="#" aria-label="Telegram">✈</a><a href="#" aria-label="YouTube">▶</a></div></div>'+
    '<div><h4>Розділи</h4><ul>'+
      '<li><a href="pro-zaklad.html">Про заклад</a></li>'+
      '<li><a href="grupy.html">Групи</a></li>'+
      '<li><a href="proekty.html">Проєкти</a></li>'+
      '<li><a href="dityam.html">Дітям</a></li>'+
      '<li><a href="novyny.html">Новини</a></li>'+
      '<li><a href="dokumenty.html">Документи</a></li></ul></div>'+
    '<div><h4>Контакти</h4><ul>'+
      '<li>📍 '+INFO.addr+'</li>'+
      '<li><a href="tel:'+INFO.phone.replace(/[^0-9]/g,'')+'">📞 '+INFO.phone+'</a></li>'+
      '<li><a href="mailto:'+INFO.email+'">✉️ '+INFO.email+'</a></li>'+
      '<li>🕒 '+INFO.hours+'</li></ul></div>'+
  '</div><div class="bottom">© 2025 ЗДО №45 «Калинка», м. Вінниця. Усі права захищені.</div></div></footer>';

  document.body.insertAdjacentHTML('afterbegin', header);
  document.body.insertAdjacentHTML('beforeend', footer);

  // мобільне меню
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', function(){
    var open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });

  // поява секцій + лічильники
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in');
        var counters = e.target.querySelectorAll ? e.target.querySelectorAll('[data-count]') : [];
        counters.forEach(runCount);
        if(e.target.hasAttribute && e.target.hasAttribute('data-count')) runCount(e.target);
        io.unobserve(e.target);
      }
    });
  },{threshold:.15});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});

  function runCount(el){
    if(el.dataset.done) return; el.dataset.done = 1;
    var target = +el.dataset.count, suf = el.dataset.suffix || '';
    if(matchMedia('(prefers-reduced-motion:reduce)').matches){ el.textContent = target+suf; return; }
    var cur = 0, step = Math.max(1, Math.round(target/40));
    var t = setInterval(function(){
      cur += step; if(cur>=target){cur=target; clearInterval(t);}
      el.textContent = cur+suf;
    },28);
  }
})();
