/* Останні 3 новини на головну з content/news.json */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  var box=document.getElementById('homeNews');
  fetch('/content/news.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!box||!d||!d.items||!d.items.length)return;
    box.innerHTML=d.items.slice(0,3).map(function(n){
      var thumb=n.image?'<div class="thumb thumb-img"><img src="'+esc(n.image)+'" alt=""></div>':'<div class="thumb">📰</div>';
      return '<a class="nitem" href="novyny.html">'+thumb+'<div><div class="date">'+esc(n.date)+'</div><h3>'+esc(n.title)+'</h3><span class="more">Читати →</span></div></a>';
    }).join('');
  }).catch(function(){});
})();

/* Головна: «Про нас», проєкти-тизер, цитати дітей — з content/home.json та projects.json */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  // ── Усе на головній редагується: значення за замовчуванням = те, що зараз на сайті ──
  var DEF={
    heroKicker:'Сучасний заклад дошкільної освіти у Вінниці',
    heroTitle:'Калинка — *територія*\nлюбові, турботи\nта розвитку!',
    heroText:'Місце, де кожна дитина відчуває себе захищеною, потрібною і щасливою, а батьки — спокійними.',
    heroBtn1:'Наші групи', heroBtn1Link:'grupy.html', heroBtn2:'Про заклад →', heroBtn2Link:'pro-zaklad.html',
    heroPhoto:'images/sadochok.jpg', heroTag:'Дітлахам у *«Калинці»* — затишно 💛',
    tiles:[{title:'Про заклад',text:'Діяльність, структура, документи',link:'pro-zaklad.html'},{title:'Наші групи',text:'11 груп для дітей 2–6 років',link:'grupy.html'},{title:'Освітній процес',text:'Програми, методики, інклюзія',link:'osvitniy-proces.html'},{title:'Територія дитинства',text:'Ігри, розмальовки, забавки',link:'dityam.html'},{title:'Фотогалерея',text:'Життя нашого закладу',link:'galereya.html'},{title:'Новини',text:'Події, конкурси, досягнення',link:'novyny.html'}],
    qlEyebrow:'Швидкий доступ', qlTitle:'Корисні посилання',
    aboutPhoto:'images/sadochok.jpg', aboutEyebrow:'Калинка — це ми', aboutTitle:'Простір, де дитинство розквітає',
    about:['ЗДО №45 «Калинка» — сучасний заклад дошкільної освіти, де створено безпечне середовище, турботливу атмосферу та всі умови для гармонійного розвитку кожної дитини.','Ми підтримуємо ініціативність, творчість та індивідуальність малюків — і робимо так, щоб у садочок хотілося приходити щоранку.'],
    chips:['11 груп','турботливі педагоги','безпечне середовище','інклюзія'], aboutBtn:'Дізнатися більше', aboutBtnLink:'pro-zaklad.html',
    stats:[{num:'11',label:'груп для малечі'},{num:'20+',label:'років досвіду педагогів'},{num:'2–6',label:'роки — вік дітей'},{num:'∞',label:'дитячих усмішок'}],
    groupsEyebrow:'Наші групи', groupsTitle:'Для кожного віку — своє відкриття', groupsText:'11 затишних груп, у кожній — тепла атмосфера, свій характер і турботливі вихователі.',
    gcards:[{emoji:'🐣',title:'Ранній вік',text:'«Перші кроки у великий світ»',link:'grupa-ranniy.html'},{emoji:'🎨',title:'Молодші групи',text:'«Пізнаємо, граємо, відкриваємо»',link:'grupa-molodshi.html'},{emoji:'🔭',title:'Середні групи',text:'«Досліджуємо світ разом»',link:'grupa-seredni.html'},{emoji:'🚀',title:'Старші групи',text:'«Готуємося до нових відкриттів»',link:'grupa-starshi.html'},{emoji:'💛',title:'Інклюзивна група',text:'«Кожна дитина важлива»',link:'grupa-inklyuziya.html'},{emoji:'📝',title:'Запис у садочок',text:'Як стати вихованцем «Калинки»',link:'vstup.html'}],
    projEyebrow:'Наші проєкти', projTitle:'Родзинки «Калинки»', projText:'Ідеї, якими ми пишаємось — від чистого повітря до турботи про довкілля та ментальне здоров\'я.',
    newsEyebrow:'Афіша та новини', newsTitle:'Останні події «Калинки»',
    navTitle:'Батьківський навігатор',
    navLinks:[{icon:'🧸',title:'Адаптація дитини',link:'batkam.html'},{icon:'🍎',title:'Харчування',link:'menu.html'},{icon:'⏰',title:'Режим дня',link:'rezhym.html'},{icon:'🧠',title:'Психолог',link:'batkam.html'},{icon:'🛡️',title:'Безпека',link:'bezpeka.html'},{icon:'🎓',title:'Підготовка до школи',link:'batkam.html'}],
    achEyebrow:'Наші досягнення', achTitle:'«Калинка» у цифрах',
    achStats:[{num:'11',label:'груп'},{num:'20+',label:'років досвіду'},{num:'30+',label:'перемог і нагород'},{num:'∞',label:'дитячих усмішок'}],
    voicesEyebrow:'Світ очима дітей', voicesTitle:'Що кажуть наші малюки',
    socEyebrow:'Долучайтеся', socTitle:'Ми в соціальних мережах', socText:'Фото, відео та новини з життя «Калинки» — у нашій Facebook-групі та на YouTube-каналі.',
    ctaText:'Завітайте до *«Калинки»* 🌼'
  };
  window.kalynkaPageDefaults=DEF;
  function star(t,tag){ return esc(t).replace(/\*([^*]+)\*/g,'<'+tag+'>$1</'+tag+'>'); }
  function $(id){ return document.getElementById(id); }
  function txt(id,v){ var e=$(id); if(e&&v!=null&&v!=='') e.textContent=v; }
  function lnk(id,label,href){ var e=$(id); if(!e)return; if(label) e.textContent=label; if(href) e.setAttribute('href',href); }
  function img(id,src){ var e=$(id); if(e&&src) e.src=src; }
  // число «20+» → лічильник 20 і суфікс «+»
  function numHtml(n){ n=String(n==null?'':n).trim(); var m=n.match(/^(\d+)(.*)$/); return m?'data-count="'+m[1]+'"'+(m[2]?' data-suffix="'+esc(m[2])+'"':'')+'>0':'>'+esc(n); }
  var TILE_IC=[].slice.call(document.querySelectorAll('#hTiles .ic')).map(function(x){return x.outerHTML;});
  var TONES=['c-pink','c-sun','c-leaf','c-sky','c-lilac','c-red'], CH=['dot-kalyna','dot-sun','dot-leaf','dot-sky','dot-lilac','dot-red'];
  function L(d,k){ return (d[k]&&(!Array.isArray(d[k])||d[k].length))?d[k]:DEF[k]; }
  fetch('/content/home.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    d=d||{};
    txt('hKicker',L(d,'heroKicker'));
    var ht=$('hTitle'); if(ht) ht.innerHTML=String(L(d,'heroTitle')).split('\n').map(function(l){return star(l,'span class="hl"').replace(/<\/span class="hl">/g,'</span>');}).join('<br>');
    txt('hText',L(d,'heroText'));
    lnk('hBtn1',L(d,'heroBtn1'),L(d,'heroBtn1Link')); lnk('hBtn2',L(d,'heroBtn2'),L(d,'heroBtn2Link'));
    img('hPhoto',L(d,'heroPhoto'));
    var tg=$('hTag'); if(tg) tg.innerHTML=star(L(d,'heroTag'),'b');
    var tl=$('hTiles'); if(tl) tl.innerHTML=L(d,'tiles').map(function(x,i){
      var ic=x.icon?'<div class="ic ic-emoji '+TONES[i%6]+'">'+esc(x.icon)+'</div>':(TILE_IC[i%TILE_IC.length]||'');
      return '<a class="tile reveal" href="'+esc(x.link||'#')+'">'+ic+'<h3>'+esc(x.title)+'</h3><p>'+esc(x.text||'')+'</p></a>';
    }).join('');
    txt('qlEyebrow',L(d,'qlEyebrow')); txt('qlTitle',L(d,'qlTitle'));
    img('aPhoto',L(d,'aboutPhoto'));
    txt('haEyebrow',L(d,'aboutEyebrow')); txt('haTitle',L(d,'aboutTitle'));
    var tx=$('haText'); if(tx) tx.innerHTML=L(d,'about').map(function(p){return '<p>'+esc(p)+'</p>';}).join('');
    var ch=$('aChips'); if(ch) ch.innerHTML=L(d,'chips').map(function(c,i){return '<span class="chip"><i class="'+CH[i%6]+'"></i>'+esc(c)+'</span>';}).join('');
    lnk('aBtn',L(d,'aboutBtn'),L(d,'aboutBtnLink'));
    var st=$('aStats'); if(st) st.innerHTML=L(d,'stats').map(function(x){return '<div class="stat reveal"><div class="num" '+numHtml(x.num)+'</div><div class="lbl">'+esc(x.label)+'</div></div>';}).join('');
    txt('gEyebrow',L(d,'groupsEyebrow')); txt('gTitle',L(d,'groupsTitle')); txt('gText',L(d,'groupsText'));
    var gc=$('gCards'); if(gc) gc.innerHTML=L(d,'gcards').map(function(x,i){return '<a class="gcard g'+(i%6+1)+' reveal" href="'+esc(x.link||'#')+'"><span class="emoji">'+esc(x.emoji||'🌟')+'</span><h3>'+esc(x.title)+'</h3><p>'+esc(x.text||'')+'</p></a>';}).join('');
    txt('pEyebrow',L(d,'projEyebrow')); txt('pTitle',L(d,'projTitle')); txt('pText',L(d,'projText'));
    txt('nEyebrow',L(d,'newsEyebrow')); txt('nTitle',L(d,'newsTitle'));
    var nb=$('navBox'); if(nb) nb.innerHTML='<h3 id="navTitle">'+esc(L(d,'navTitle'))+'</h3>'+L(d,'navLinks').map(function(x){return '<a class="plink" href="'+esc(x.link||'#')+'"><span class="pi">'+esc(x.icon||'•')+'</span> '+esc(x.title)+' <span class="arr">→</span></a>';}).join('');
    txt('cEyebrow',L(d,'achEyebrow')); txt('cTitle',L(d,'achTitle'));
    var cs=$('cStats'); if(cs) cs.innerHTML=L(d,'achStats').map(function(x){return '<div><div class="n" '+numHtml(x.num)+'</div><div class="t">'+esc(x.label)+'</div></div>';}).join('');
    txt('vEyebrow',L(d,'voicesEyebrow')); txt('vTitle',L(d,'voicesTitle'));
    var vg=$('voicesGrid');
    if(vg&&d.voices&&d.voices.length) vg.innerHTML=d.voices.map(function(v){
      return '<div class="voice reveal"><p>'+esc(v.text)+'</p><div class="kid"><span class="av">'+esc(v.avatar||'🙂')+'</span> '+esc(v.kid)+'</div></div>';
    }).join('');
    txt('sEyebrow',L(d,'socEyebrow')); txt('sTitle',L(d,'socTitle')); txt('sText',L(d,'socText'));
    var ct=$('ctaText'); if(ct) ct.innerHTML=star(L(d,'ctaText'),'b');
  }).catch(function(){});
  var acc=['','pt-leaf','pt-sky'];
  var hp=document.getElementById('homeProjects');
  fetch('/content/projects.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!hp||!d||!d.items||!d.items.length)return;
    hp.innerHTML=d.items.slice(0,3).map(function(x,i){
      return '<a class="pcard '+acc[i%3]+' reveal" href="proekty.html"><div class="pe">'+esc(x.emoji||'🌟')+'</div><h3>'+esc(x.title)+'</h3><div class="rtx">'+(window.kalynkaRich||function(x){return esc(x)})(x.text)+'</div></a>';
    }).join('');
  }).catch(function(){});
})();

/* Корисні посилання на головній — з content/korysni.json (позначка «На головній») */
(function(){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  var box=document.getElementById('homeLinks'); if(!box)return;
  fetch('/content/korysni.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d||!d.items)return;
    var list=d.items.filter(function(x){return x.home&&x.url;});
    if(!list.length){ var sec=box.closest('section'); if(sec) sec.style.display='none'; return; }
    box.innerHTML=list.map(function(x){
      var main=/reiestratsiia|реєстрац/i.test(x.url+' '+x.title)?' ql-main':'';
      return '<a class="ql'+main+'" href="'+esc(x.url)+'" target="_blank" rel="noopener"><span class="qi">'+esc(x.icon||'🔗')+'</span><span class="qt">'+esc(x.title)+'</span><span class="qa">→</span></a>';
    }).join('');
  }).catch(function(){});
})();
