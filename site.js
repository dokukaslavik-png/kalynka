/* ЗДО №45 «Калинка» — спільна шапка/меню/підвал + інтеракції.
   Контакти й соцмережі тепер беруться з content/settings.json (редагується в адмінці).
   Якщо файл недоступний — використовуються значення DEFAULT нижче. */
(function(){
  // --- значення за замовчуванням (запасний варіант) ---
  var DEFAULT = {
    name:'«Калинка»',
    full:'Комунальний заклад «Дошкільний навчальний заклад №45 Вінницької міської ради»',
    addr:'21027, м. Вінниця, вул. 600-річчя, 56',
    phone:'(0432) 56-10-75',
    email:'dnz45.edu.vn.ua@gmail.com',
    hours:'Пн–Пт, 7:30–18:30',
    facebook:'', telegram:'', youtube:''
  };

  // --- пункти головного меню ---
  var NAV = [
    ['index.html','home','Головна'],
    ['pro-zaklad.html','pro','Про заклад'],
    ['grupy.html','grupy','Групи'],
    ['osvitniy-proces.html','osvita','Освітній процес'],
    ['proekty.html','proekty','Проєкти'],
    ['pedprostir.html','pedprostir','Педагогам'],
    ['dosyahnennya.html','dosyahnennya','Скарбничка досягнень'],
    ['batkam.html','batkam','Батьківський навігатор'],
    ['dityam.html','dityam','Територія дитинства'],
    ['novyny.html','novyny','Новини'],
    ['dokumenty.html','dokumenty','Документи'],
    ['kontakty.html','kontakty','Контакти']
  ];

  // --- велике меню (мега): згруповані розділи з підрозділами ---
  var MEGA = [
    ['Про заклад', [
      ['index.html','Головна','🏠'],
      ['pro-zaklad.html','Про заклад','🏛️'],
      ['prozorist.html','Прозорість','🔎'],
      ['dosyahnennya.html','Скарбничка досягнень','🏆'],
      ['galereya.html','Фотогалерея','📸'],
      ['dokumenty.html','Документи','📄'],
      ['korysni.html','Корисні посилання','🔗']
    ]],
    ['Наші групи', [
      ['grupy.html','Усі групи','👨‍👩‍👧'],
      ['grupa-ranniy.html','Ранній вік','🐣'],
      ['grupa-molodshi.html','Молодші групи','🎨'],
      ['grupa-seredni.html','Середні групи','🔭'],
      ['grupa-starshi.html','Старші групи','🚀'],
      ['grupa-inklyuziya.html','Інклюзивна група','💛']
    ]],
    ['Навчання', [
      ['osvitniy-proces.html','Освітній процес','📚'],
      ['osvitniy-proces.html#gurtky','Гуртки','🎭'],
      ['proekty.html','Проєкти','🌿'],
      ['pedprostir.html','Педагогічний простір','🧑‍🏫']
    ]],
    ['Батьківський навігатор', [
      ['batkam.html','Батьківський навігатор','🧠'],
      ['menu.html','Меню харчування','🍎'],
      ['rezhym.html','Розпорядок дня','⏰'],
      ['bezpeka.html','Безпека і укриття','🛡️'],
      ['vstup.html','Як записати дитину','📝']
    ]],
    ['Для дітей і новини', [
      ['dityam.html','Територія дитинства','🎮'],
      ['novyny.html','Новини','📰'],
      ['podii.html','Афіша подій','📅'],
      ['kontakty.html','Контакти','📞']
    ]]
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

  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  // спільна картка педагога / працівника (групи, «Про заклад»)
  function roleEmoji(r){
    r=String(r||'').toLowerCase();
    if(r.indexOf('помічник')>=0||r.indexOf('няня')>=0) return '🧑‍🍼';
    if(r.indexOf('асистент')>=0) return '🤝';
    if(r.indexOf('психолог')>=0) return '🧠';
    if(r.indexOf('музич')>=0) return '🎵';
    if(r.indexOf('логопед')>=0) return '🗣️';
    if(r.indexOf('сестра')>=0||r.indexOf('медич')>=0) return '🩺';
    if(r.indexOf('директор')>=0||r.indexOf('завідувач')===0) return '👩‍💼';
    if(r.indexOf('діловод')>=0) return '📋';
    if(r.indexOf('господар')>=0) return '🏠';
    if(r.indexOf('методист')>=0) return '📚';
    if(r.indexOf('фізкульт')>=0||r.indexOf('фізичн')>=0) return '🏃';
    if(r.indexOf('англій')>=0) return '🇬🇧';
    return '👩‍🏫';
  }
  window.kalynkaPersonCard = function(m, cls){
    m=m||{};
    var pe = m.photo
      ? '<div class="pphoto"><img src="'+esc(m.photo)+'" alt="'+esc(m.name)+'" loading="lazy"></div>'
      : '<div class="pe">'+roleEmoji(m.role)+'</div>';
    var credo = String(m.credo||'').trim().replace(/^[«"„,]+|[»"“]+$/g,'');
    return '<div class="pcard person center '+(cls||'')+'">'+pe+
      '<div class="prole">'+esc(m.role)+'</div>'+
      '<h3>'+esc(m.name)+'</h3>'+
      (m.info?'<div class="pmeta">'+esc(m.info)+'</div>':'')+
      (credo?'<div class="pcredo">«'+esc(credo)+'»</div>':'')+
    '</div>';
  };

  var ICON={
    facebook:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.9-.8z"/></svg>',
    youtube:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9l5.8 3.1-5.8 3.1z"/></svg>',
    telegram:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.2-8.3c.4-.4-.1-.6-.6-.2L6 13.6l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6l19.2-7.4c.9-.3 1.7.2 1.4 1.2z"/></svg>'
  };
  var SOC=[['facebook','Facebook-група'],['youtube','YouTube-канал'],['telegram','Telegram']];
  // labeled=true → «пігулки» з підписом; інакше круглі іконки
  function socials(INFO, labeled){
    var out='';
    SOC.forEach(function(s){
      var url=INFO[s[0]]; if(!url) return;
      out+='<a class="soc-'+s[0]+(labeled?' soc-pill':'')+'" href="'+esc(url)+'" target="_blank" rel="noopener" aria-label="'+s[1]+'">'+ICON[s[0]]+(labeled?'<span>'+s[1]+'</span>':'')+'</a>';
    });
    return out;
  }
  window.kalynkaSocials = socials;

  function build(INFO){
    var page = document.body.getAttribute('data-page') || '';

    var navHTML = NAV.map(function(n){
      var active = n[1]===page ? ' class="active"' : '';
      if(n[1]==='home') return '<a class="home'+(page==='home'?' active':'')+'" href="index.html" aria-label="Головна">🏠</a>';
      return '<a href="'+n[0]+'"'+active+'>'+n[2]+'</a>';
    }).join('');

    var megaCols = MEGA.map(function(col){
      var links = col[1].map(function(l){
        return '<a class="mega-link" href="'+l[0]+'"><span class="mi">'+l[2]+'</span> '+l[1]+'</a>';
      }).join('');
      return '<div class="mega-col"><h4>'+col[0]+'</h4>'+links+'</div>';
    }).join('');
    var megaHTML =
      '<div class="mega-top"><span class="mega-title">🌼 Меню</span>'+
        '<button class="mega-close" id="megaClose" aria-label="Закрити">✕</button></div>'+
      '<div class="mega-inner">'+megaCols+'</div>';

    var header =
    '<div class="topbar"><div class="wrap">'+
      '<a class="tb-phone" href="tel:'+esc(INFO.phone).replace(/[^0-9+]/g,'')+'">📞 '+esc(INFO.phone)+'</a>'+
      '<span class="tb-hours">🕒 '+esc(INFO.hours)+'</span>'+
      '<span class="sep"></span>'+
      '<span class="tb-contact">📍 '+esc(INFO.addr)+'</span>'+
    '</div></div>'+
    '<header class="header"><div class="wrap">'+
      '<a class="brand" href="index.html"><span class="mark">'+kalynaSVG+'</span>'+
        '<span class="brand-txt"><small>'+esc(INFO.full)+'</small>'+
        '<span class="name">'+esc(INFO.name)+'</span></span></a>'+
      '<div class="slogan"><span class="script">Щасливе дитинство<br>починається <b>тут!</b></span></div>'+
      '<div class="header-side"><div class="contacts">'+
        '<div class="row"><span>📞</span> '+esc(INFO.phone)+'</div>'+
        '<div class="row"><span>✉️</span> '+esc(INFO.email)+'</div></div>'+
        '<div class="social">'+socials(INFO)+'</div>'+
      '</div>'+
    '</div></header>'+
    '<nav class="nav"><div class="wrap">'+
      '<button class="megabtn" id="megaBtn" aria-label="Головне меню" aria-expanded="false"><span class="mb-ic">☰</span> Меню</button>'+
      '<div class="nav-links" id="navLinks">'+navHTML+'</div>'+
    '</div><div class="mega" id="mega">'+megaHTML+'</div></nav>'+
    '<div class="mega-backdrop" id="megaBackdrop"></div>';

    var footer =
    '<footer class="footer"><div class="wrap"><div class="cols">'+
      '<div><div class="name">'+esc(INFO.name)+'</div><small>'+esc(INFO.full)+'</small>'+
        (socials(INFO)?'<div class="fsoc-h">Ми в соціальних мережах</div><div class="fsoc">'+socials(INFO,true)+'</div>':'')+'</div>'+
      '<div><h4>Розділи</h4><ul>'+
        '<li><a href="pro-zaklad.html">Про заклад</a></li>'+
        '<li><a href="prozorist.html">Прозорість</a></li>'+
        '<li><a href="grupy.html">Групи</a></li>'+
        '<li><a href="proekty.html">Проєкти</a></li>'+
        '<li><a href="pedprostir.html">Педагогічний простір</a></li>'+
        '<li><a href="dosyahnennya.html">Скарбничка досягнень</a></li>'+
        '<li><a href="dityam.html">Територія дитинства</a></li>'+
        '<li><a href="novyny.html">Новини</a></li>'+
        '<li><a href="dokumenty.html">Документи</a></li>'+
        '<li><a href="korysni.html">Корисні посилання</a></li></ul></div>'+
      '<div><h4>Контакти</h4><ul>'+
        '<li>📍 '+esc(INFO.addr)+'</li>'+
        '<li><a href="tel:'+esc(INFO.phone).replace(/[^0-9+]/g,'')+'">📞 '+esc(INFO.phone)+'</a></li>'+
        '<li><a href="mailto:'+esc(INFO.email)+'">✉️ '+esc(INFO.email)+'</a></li>'+
        '<li>🕒 '+esc(INFO.hours)+'</li></ul></div>'+
    '</div><div class="bottom">© 2025 ЗДО №45 «Калинка», м. Вінниця. Усі права захищені.</div></div></footer>';

    document.body.insertAdjacentHTML('afterbegin', header);
    document.body.insertAdjacentHTML('beforeend', footer);

    // блоки «Ми в соціальних мережах» на сторінках
    document.querySelectorAll('[data-social-block]').forEach(function(el){
      var h=socials(INFO,true);
      if(h) el.innerHTML=h;
      else { var w=el.closest('[data-social-wrap]'); if(w) w.style.display='none'; }
    });

    // мега-меню
    var megaBtn = document.getElementById('megaBtn');
    var mega = document.getElementById('mega');
    var backdrop = document.getElementById('megaBackdrop');
    function setMega(open){
      mega.classList.toggle('open', open);
      backdrop.classList.toggle('open', open);
      megaBtn.setAttribute('aria-expanded', open);
      document.body.classList.toggle('mega-lock', open);
    }
    megaBtn.addEventListener('click', function(){ setMega(!mega.classList.contains('open')); });
    backdrop.addEventListener('click', function(){ setMega(false); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') setMega(false); });
    mega.addEventListener('click', function(e){ if(e.target.closest('a')) setMega(false); });
    var mClose = document.getElementById('megaClose');
    if(mClose) mClose.addEventListener('click', function(){ setMega(false); });

    // поява секцій + лічильники
    var seen = (typeof WeakSet==='function') ? new WeakSet() : null;
    function markIn(el){
      el.classList.add('in');
      var counters = el.querySelectorAll ? el.querySelectorAll('[data-count]') : [];
      counters.forEach(runCount);
      if(el.hasAttribute && el.hasAttribute('data-count')) runCount(el);
    }

    if(!('IntersectionObserver' in window)){
      // старий браузер — просто показуємо все
      document.querySelectorAll('.reveal').forEach(markIn);
    } else {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){ markIn(e.target); io.unobserve(e.target); }
        });
      },{threshold:.12});

      // спостерігаємо за всіма .reveal — і за тими, що додаються пізніше (fetch)
      function scanReveals(root){
        var list = (root||document).querySelectorAll('.reveal');
        for(var i=0;i<list.length;i++){
          var el=list[i];
          if(el.classList.contains('in')) continue;
          if(seen){ if(seen.has(el)) continue; seen.add(el); }
          io.observe(el);
        }
      }
      scanReveals(document);

      // ловимо контент, який рендериться після завантаження (цитати, проєкти, заняття тощо)
      if('MutationObserver' in window){
        var mo = new MutationObserver(function(muts){
          for(var i=0;i<muts.length;i++){
            var added=muts[i].addedNodes;
            for(var j=0;j<added.length;j++){
              var n=added[j];
              if(n.nodeType!==1) continue;
              if(n.classList && n.classList.contains('reveal') && !n.classList.contains('in')){
                if(!seen || !seen.has(n)){ if(seen) seen.add(n); io.observe(n); }
              }
              if(n.querySelectorAll) scanReveals(n);
            }
          }
        });
        mo.observe(document.body,{childList:true,subtree:true});
      }

      // запобіжник: якщо секцію не «зловило» — показуємо через 2.5с
      setTimeout(function(){
        document.querySelectorAll('.reveal:not(.in)').forEach(function(el){
          var r=el.getBoundingClientRect();
          if(r.top < window.innerHeight && r.bottom > 0) markIn(el);
        });
      }, 2500);

      window.kalynkaScanReveals = scanReveals;
    }

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
  }

  // тягнемо контакти з CMS-файлу; якщо не вийшло — беремо DEFAULT
  function merge(data){
    var out={}; for(var k in DEFAULT) out[k]=DEFAULT[k];
    if(data) for(var j in data){ if(data[j]!=null && data[j]!=='') out[j]=data[j]; }
    return out;
  }
  fetch('content/settings.json', {cache:'no-cache'})
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(d){ build(merge(d)); })
    .catch(function(){ build(merge(null)); });

  // редактор «на місці» для адміністратора (мами)
  var es = document.createElement('script');
  es.src = 'edit.js';
  es.defer = true;
  document.body.appendChild(es);
})();
