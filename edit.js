/* edit.js — редагування вмісту «на місці» для адміністратора (мами).
   Вхід через GitHub (працює на будь-якому хостингу, незалежно від Netlify).
   Збереження — напряму у репозиторій GitHub через його API.
   Панель зʼявляється лише після входу; звичайні відвідувачі бачать хіба маленьку кнопку «Вхід». */
(function(){
  'use strict';

  // ── НАЛАШТУВАННЯ РЕПОЗИТОРІЮ (за потреби зміни) ──
  var GH_OWNER  = 'dokukaslavik-png';
  var GH_REPO   = 'kalynka';
  var GH_BRANCH = 'main';
  var AUTH_URL  = '/api/auth';          // Vercel-функція входу
  var API       = 'https://api.github.com';
  var TOKEN_KEY = 'kalynka_gh_token';
  var MEDIA_DIR = 'images/uploads';

  // ── ТЕСТ-РЕЖИМ (лише локально): #edittest показує панель без входу, зберігає в консоль ──
  var TEST = (location.hostname==='localhost'||location.hostname==='127.0.0.1') && location.hash.indexOf('edittest')>=0;

  // ───────── helpers ─────────
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function b64enc(str){return btoa(unescape(encodeURIComponent(str)));}
  function b64dec(b){return decodeURIComponent(escape(atob(String(b).replace(/\s/g,''))));}
  function el(tag, attrs, kids){
    var e=document.createElement(tag);
    if(attrs) for(var k in attrs){ if(k==='class')e.className=attrs[k]; else if(k==='html')e.innerHTML=attrs[k]; else if(k==='text')e.textContent=attrs[k]; else e.setAttribute(k,attrs[k]); }
    (kids||[]).forEach(function(c){ if(c) e.appendChild(typeof c==='string'?document.createTextNode(c):c); });
    return e;
  }
  function clone(o){return JSON.parse(JSON.stringify(o==null?null:o));}
  function getToken(){ try{ return localStorage.getItem(TOKEN_KEY)||''; }catch(e){ return ''; } }
  function setToken(t){ try{ if(t) localStorage.setItem(TOKEN_KEY,t); else localStorage.removeItem(TOKEN_KEY); }catch(e){} }

  // ───────── схеми вмісту ─────────
  // поля «людини» (педагог / працівник)
  var PERSON = [
    {n:'photo',l:'📷 Фото',t:'image',opt:true,hint:'Портрет, бажано вертикальний. Великі фото зменшуються автоматично.'},
    {n:'role',l:'Посада',t:'text',hint:'Напр.: Вихователь'},
    {n:'name',l:'Прізвище, імʼя, по батькові',t:'text'},
    {n:'info',l:'Категорія, стаж, освіта',t:'text',opt:true,hint:'Напр.: Вища категорія, стаж 23 роки'},
    {n:'credo',l:'Педагогічне кредо',t:'textarea',opt:true,hint:'Без лапок — вони додадуться самі'}
  ];

  // ── фото та документи, які можна додати будь-куди ──
  function mediaFields(page){
    return [
      {n:'photos',l:page?'📷 Фото для цієї сторінки':'📷 Фото',t:'gallery',opt:true,hint:page?'Покажуться внизу сторінки. Можна вибрати кілька фото одразу.':'Можна вибрати одразу кілька фото. Великі фото зменшуються автоматично.'},
      {n:'docs',l:page?'📄 Документи для цієї сторінки':'📄 Документи',t:'objlist',opt:true,itemName:'Документ',title:function(x){return x.title||x.file||x.link||'';},
        fields:[ {n:'title',l:'Назва документа',t:'text',hint:'Напр.: Наказ про зарахування'},
                 {n:'file',l:'Файл',t:'file',opt:true,accept:DOC_ACCEPT,hint:'PDF, Word, Excel, PowerPoint або фото'},
                 {n:'link',l:'Або посилання (замість файлу)',t:'text',opt:true,hint:'Напр.: Google Диск, сайт МОН'} ]}
    ];
  }
  var DOC_ACCEPT='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.txt,.jpg,.jpeg,.png,application/pdf,image/*';
  var S = {
    news:   {label:'Новини', file:'content/news.json', shape:'list', listKey:'items', itemName:'Новина',
             title:function(x){return (x.date?x.date+' — ':'')+(x.title||'(без назви)');},
             fields:[ {n:'date',l:'Дата',t:'text',hint:'Напр.: 05 вересня 2025'}, {n:'title',l:'Заголовок',t:'text'}, {n:'text',l:'Текст',t:'rich',opt:true}, {n:'image',l:'Фото',t:'image',opt:true} ]},
    events: {label:'Афіша подій', file:'content/events.json', shape:'list', listKey:'items', itemName:'Подія',
             title:function(x){return (x.date?x.date+' — ':'')+(x.title||'');},
             fields:[ {n:'date',l:'Дата',t:'text'}, {n:'title',l:'Назва події',t:'text'}, {n:'desc',l:'Опис',t:'text',opt:true}, {n:'icon',l:'Емодзі',t:'text',opt:true} ]},
    gallery:{label:'Фотогалерея', file:'content/gallery.json', shape:'list', listKey:'items', itemName:'Фото',
             title:function(x){return x.caption||'Фото';},
             fields:[ {n:'image',l:'Фото',t:'image'}, {n:'caption',l:'Підпис',t:'text',opt:true} ]},
    documents:{label:'Документи', file:'content/documents.json', shape:'list', listKey:'items', itemName:'Документ',
             title:function(x){return x.title||'Документ';},
             fields:[ {n:'title',l:'Назва',t:'text'}, {n:'icon',l:'Емодзі',t:'text',opt:true}, {n:'file',l:'Файл (PDF)',t:'file',opt:true} ]},
    projects:{label:'Проєкти', file:'content/projects.json', shape:'list', listKey:'items', itemName:'Проєкт',
             title:function(x){return x.title||'';},
             fields:[ {n:'emoji',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Назва',t:'text'}, {n:'text',l:'Опис',t:'rich'} ]},
    parents:{label:'Батьківський навігатор', file:'content/parents.json', shape:'list', listKey:'items', itemName:'Картка',
             title:function(x){return x.title||'';},
             fields:[ {n:'icon',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Назва',t:'text'}, {n:'text',l:'Опис',t:'rich'} ]},
    gurtky: {label:'Гуртки', file:'content/gurtky.json', shape:'list', listKey:'items', itemName:'Гурток',
             title:function(x){return x.title||'';},
             fields:[ {n:'emoji',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Назва',t:'text'}, {n:'text',l:'Опис',t:'rich'} ]},

    home:   {label:'Головна сторінка', file:'content/home.json', shape:'object',
             fields:[
               {n:'aboutEyebrow',l:'Підзаголовок «Про нас»',t:'text'},
               {n:'aboutTitle',l:'Заголовок «Про нас»',t:'text'},
               {n:'about',l:'Текст «Про нас» (абзаци)',t:'strlist'},
               {n:'voices',l:'Цитати дітей',t:'objlist',itemName:'Цитата',title:function(x){return x.kid||x.text||'';},
                 fields:[ {n:'text',l:'Цитата',t:'textarea'}, {n:'kid',l:'Хто сказав',t:'text'}, {n:'avatar',l:'Емодзі',t:'text',opt:true} ]}
             ]},
    about:  {label:'Про заклад', file:'content/about.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступ (абзаци)',t:'strlist'},
               {n:'history',l:'Історія (абзаци)',t:'strlist'},
               {n:'admin',l:'Адміністрація',t:'objlist',itemName:'Людина',title:function(x){return (x.role||'')+' — '+(x.name||'');},
                 fields:PERSON},
               {n:'specialists',l:'Наші фахівці (психолог, музкерівник, логопед…)',t:'objlist',itemName:'Фахівець',title:function(x){return (x.role||'')+' — '+(x.name||'');},
                 fields:PERSON}
             ]},
    group:  {label:'Цю групу (вихователі, опис)', file:'content/groups.json', shape:'object',
             sub:function(){ return document.body.getAttribute('data-group'); },
             fields:[
               {n:'groups',l:'Групи та вихователі',t:'objlist',itemName:'Група',title:function(x){ var t=x.teachers||[], ph=t.filter(function(p){return p&&p.photo;}).length; return (x.num?'№'+x.num+' ':'')+(x.name?'«'+x.name+'»':'')+(t.length?'  ·  👩‍🏫 '+t.length+' · 📷 '+ph+'/'+t.length:''); },
                 hint:'Щоб додати фото педагога: «Змінити» біля групи → «Змінити» біля педагога → 📷 Фото.',
                 fields:[ {n:'num',l:'Номер групи',t:'text',opt:true,hint:'Напр.: 10'}, {n:'name',l:'Назва групи',t:'text',opt:true,hint:'Напр.: Пазлики'},
                          {n:'inclusive',l:'Інклюзивна група',t:'bool',box:'Так — показувати й на сторінці «Інклюзивна група»'},
                          {n:'teachers',l:'Педагоги групи',t:'objlist',itemName:'Педагог',title:function(x){return (x.role||'')+' — '+(x.name||'');}, fields:PERSON} ]},
               {n:'about',l:'Опис «Про групу» (абзаци)',t:'strlist'},
               {n:'develop',l:'Що розвиваємо (пункти)',t:'strlist'},
               {n:'activities',l:'Заняття',t:'objlist',itemName:'Заняття',title:function(x){return x.title||'';},
                 fields:[ {n:'emoji',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Назва',t:'text'}, {n:'text',l:'Опис',t:'rich'} ]}
             ]},
    menu:   {label:'Меню харчування', file:'content/menu.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступний текст',t:'rich'},
               {n:'note',l:'Примітка',t:'rich',opt:true},
               {n:'days',l:'Дні тижня',t:'objlist',itemName:'День',title:function(x){return x.day||'';},
                 fields:[ {n:'day',l:'День',t:'text'}, {n:'breakfast',l:'Сніданок',t:'text',opt:true}, {n:'lunch',l:'Обід',t:'text',opt:true}, {n:'snack',l:'Підвечірок',t:'text',opt:true}, {n:'supper',l:'Вечеря',t:'text',opt:true} ]}
             ]},
    rezhym: {label:'Розпорядок дня', file:'content/rezhym.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступний текст',t:'rich'},
               {n:'note',l:'Примітка',t:'rich',opt:true},
               {n:'items',l:'Пункти режиму',t:'objlist',itemName:'Пункт',title:function(x){return (x.time||'')+' — '+(x.title||'');},
                 fields:[ {n:'time',l:'Час',t:'text'}, {n:'icon',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Що відбувається',t:'text'} ]}
             ]},
    bezpeka:{label:'Безпека та укриття', file:'content/bezpeka.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступний текст',t:'rich'},
               {n:'alarmTitle',l:'Заголовок блоку тривоги',t:'text'},
               {n:'alarmSteps',l:'Дії під час тривоги',t:'strlist'},
               {n:'items',l:'Картки безпеки',t:'objlist',itemName:'Картка',title:function(x){return x.title||'';},
                 fields:[ {n:'icon',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Назва',t:'text'}, {n:'text',l:'Опис',t:'rich'} ]}
             ]},
    vstup:  {label:'Як записати дитину', file:'content/vstup.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступний текст',t:'rich'},
               {n:'steps',l:'Кроки',t:'objlist',itemName:'Крок',title:function(x){return x.title||'';},
                 fields:[ {n:'title',l:'Назва кроку',t:'text'}, {n:'text',l:'Опис',t:'rich'}, {n:'url',l:'Посилання-кнопка (необовʼязково)',t:'text',opt:true,hint:'Напр.: сайт електронної реєстрації'} ]},
               {n:'documents',l:'Перелік документів',t:'strlist'},
               {n:'note',l:'Примітка',t:'rich',opt:true}
             ]},
    settings:{label:'Контакти закладу', file:'content/settings.json', shape:'object',
             fields:[
               {n:'name',l:'Коротка назва',t:'text'}, {n:'full',l:'Повна назва',t:'textarea'},
               {n:'addr',l:'Адреса',t:'text'}, {n:'phone',l:'Телефон',t:'text'}, {n:'email',l:'Email',t:'text'},
               {n:'hours',l:'Графік роботи',t:'text'},
               {n:'facebook',l:'Facebook-група (посилання)',t:'text',opt:true}, {n:'youtube',l:'YouTube-канал (посилання)',t:'text',opt:true}, {n:'telegram',l:'Telegram (посилання)',t:'text',opt:true}
             ]},
    pedprostir:{label:'Педагогічний простір', file:'content/pedprostir.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступний текст',t:'rich'},
               {n:'items',l:'Підрозділи', t:'objlist', itemName:'Підрозділ', title:function(x){return x.title||'';},
                 fields:[ {n:'icon',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Назва',t:'text'}, {n:'text',l:'Опис',t:'rich'} ]}
             ]},
    dosyahnennya:{label:'Скарбничка досягнень', file:'content/dosyahnennya.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступний текст',t:'rich'},
               {n:'items',l:'Досягнення',t:'objlist',itemName:'Досягнення',title:function(x){return (x.date?x.date+' — ':'')+(x.title||'');},
                 fields:[ {n:'title',l:'Назва',t:'text',hint:'Напр.: I місце у міському конкурсі «…»'}, {n:'date',l:'Дата',t:'text',opt:true,hint:'Напр.: 05 вересня 2025'},
                          {n:'text',l:'Опис',t:'rich',opt:true}, {n:'image',l:'Фото (грамота, диплом, подія)',t:'image',opt:true}, {n:'icon',l:'Емодзі (якщо немає фото)',t:'text',opt:true} ]}
             ]},
    korysni:{label:'Корисні посилання', file:'content/korysni.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступний текст',t:'rich'},
               {n:'items',l:'Посилання',t:'objlist',itemName:'Посилання',title:function(x){return x.title||x.url||'';},
                 fields:[ {n:'title',l:'Назва',t:'text'}, {n:'url',l:'Адреса (посилання)',t:'text',hint:'Напр.: https://mon.gov.ua/'}, {n:'text',l:'Короткий опис',t:'text',opt:true}, {n:'icon',l:'Емодзі',t:'text',opt:true}, {n:'home',l:'На головній',t:'bool',box:'Показувати це посилання на головній сторінці'} ]}
             ]},
    prozorist:{label:'Прозорість (документи)', file:'content/prozorist.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступний текст',t:'rich'},
               {n:'items',l:'Пункти', t:'objlist', itemName:'Пункт', title:function(x){return x.title||'';},
                 fields:[ {n:'title',l:'Назва',t:'text'}, {n:'file',l:'Файл PDF (один документ)',t:'file',opt:true}, {n:'link',l:'Посилання (замість файлу)',t:'text',opt:true}, {n:'note',l:'Текст / пояснення',t:'rich',opt:true,hint:'Можна вставити текст з Word — абзаци збережуться'},
                          {n:'docs',l:'Кілька документів у цьому пункті (напр. кошторис, благодійна допомога)',t:'objlist',itemName:'Документ',title:function(x){return x.title||'';},
                            fields:[ {n:'title',l:'Назва документа',t:'text'}, {n:'file',l:'Файл PDF',t:'file',opt:true}, {n:'link',l:'Посилання (замість файлу)',t:'text',opt:true} ]} ]}
             ]}
  };

  // додаємо фото/документи до карток і до самих сторінок
  ['news','events','projects','parents','gurtky'].forEach(function(k){ S[k].fields=S[k].fields.concat(mediaFields(false)); S[k].pageMedia=true; });
  [['group','activities'],['bezpeka','items'],['vstup','steps'],['dosyahnennya','items'],['pedprostir','items']].forEach(function(p){
    S[p[0]].fields.forEach(function(f){ if(f.n===p[1]) f.fields=f.fields.concat(mediaFields(false)); });
  });
  ['about','group','menu','rezhym','bezpeka','vstup','pedprostir','dosyahnennya','korysni','prozorist'].forEach(function(k){ S[k].fields=S[k].fields.concat(mediaFields(true)); });

  var PAGE_MAP = {
    home:'home', novyny:'news', podii:'events', galereya:'gallery', dokumenty:'documents',
    proekty:'projects', batkam:'parents', osvita:'gurtky', pro:'about',
    menu:'menu', rezhym:'rezhym', bezpeka:'bezpeka', vstup:'vstup', kontakty:'settings', prozorist:'prozorist', pedprostir:'pedprostir', dosyahnennya:'dosyahnennya', korysni:'korysni'
  };

  var page = document.body.getAttribute('data-page') || '';
  var schema = S[PAGE_MAP[page]] || null;
  if(page==='grupy' && document.body.getAttribute('data-group')) schema = S.group;

  // ───────── стилі ─────────
  var css = document.createElement('style');
  css.textContent =
  '.eadmin{position:fixed;left:14px;bottom:14px;z-index:9998;display:flex;gap:8px;align-items:center;font-family:Nunito,system-ui,sans-serif}'+
  '.eadmin button{font-family:inherit;cursor:pointer;border:0;border-radius:999px;font-weight:800;padding:11px 16px;font-size:.92rem;box-shadow:0 10px 26px -10px rgba(0,0,0,.45)}'+
  '.eadmin .e-key{background:#fff;color:#2f6f45;opacity:.55;transition:opacity .2s}.eadmin .e-key:hover{opacity:1}'+
  '.eadmin .e-edit{background:#3c8c57;color:#fff}.eadmin .e-edit:hover{background:#2f6f45}'+
  '.eadmin .e-out{background:#fff;color:#b0344a}'+
  '.e-modal-bg{position:fixed;inset:0;z-index:9999;background:rgba(24,32,28,.55);display:flex;align-items:flex-start;justify-content:center;padding:26px 14px;overflow:auto}'+
  '.e-modal{background:#fff;border-radius:22px;width:min(760px,100%);box-shadow:0 30px 70px -20px rgba(0,0,0,.5);overflow:hidden;animation:epop .18s ease}'+
  '@keyframes epop{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}'+
  '.e-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 20px;background:linear-gradient(135deg,#3c8c57,#2f6f45);color:#fff}'+
  '.e-head h3{margin:0;font-family:Comfortaa,cursive;font-size:1.15rem}'+
  '.e-head .x{background:rgba(255,255,255,.2);color:#fff;border:0;width:34px;height:34px;border-radius:50%;font-size:1.1rem;cursor:pointer}'+
  '.e-body{padding:18px 20px;max-height:72vh;overflow:auto}'+
  '.e-foot{padding:14px 20px;border-top:1px solid #eee;display:flex;gap:10px;justify-content:flex-end;background:#fafafa}'+
  '.e-foot button{font-family:inherit;font-weight:800;border:0;border-radius:12px;padding:11px 20px;cursor:pointer}'+
  '.e-save{background:#3c8c57;color:#fff}.e-save:hover{background:#2f6f45}.e-cancel{background:#eee;color:#444}'+
  '.e-field{margin-bottom:14px}.e-field>label{display:block;font-weight:800;color:#2f6f45;margin-bottom:5px;font-size:.92rem}'+
  '.e-field .hint{font-weight:600;color:#8a978f;font-size:.8rem;margin-bottom:5px}'+
  '.e-field input[type=text],.e-field textarea{width:100%;border:2px solid #e3e8e4;border-radius:12px;padding:10px 12px;font:inherit;font-size:.95rem;box-sizing:border-box}'+
  '.e-field textarea{min-height:80px;resize:vertical}'+
  '.e-field input:focus,.e-field textarea:focus{outline:0;border-color:#3c8c57}'+
  '.e-rows{display:flex;flex-direction:column;gap:8px}'+
  '.e-row{display:flex;gap:8px;align-items:center;background:#f5f8f5;border:1px solid #e3e8e4;border-radius:12px;padding:8px 10px}'+
  '.e-row .t{flex:1;font-weight:700;color:#33413a;font-size:.92rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
  '.e-row button{border:0;border-radius:9px;padding:6px 10px;font-weight:800;cursor:pointer;font-size:.82rem}'+
  '.e-row .ed{background:#e7f1ea;color:#2f6f45}.e-row .del{background:#fde8ec;color:#b0344a}.e-row .mv{background:#eee;color:#555;padding:6px 9px}'+
  '.e-add{margin-top:10px;background:#f5c23e;color:#5a4600;border:0;border-radius:12px;padding:10px 16px;font-weight:800;cursor:pointer}'+
  '.e-img{display:flex;align-items:center;gap:12px;flex-wrap:wrap}'+
  '.e-img img{width:74px;height:74px;object-fit:cover;border-radius:12px;border:1px solid #e3e8e4}'+
  '.e-img .fn{font-size:.82rem;color:#5c6b62;font-weight:700;word-break:break-all}'+
  '.e-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:10000;background:#2f6f45;color:#fff;padding:13px 20px;border-radius:14px;font-weight:800;box-shadow:0 16px 40px -12px rgba(0,0,0,.5);font-family:Nunito,sans-serif;max-width:92%;text-align:center}'+
  '.e-toast.err{background:#b0344a}'+
  '.e-sub{font-size:.82rem;color:#8a978f;font-weight:600;margin:-6px 0 14px}'+
  '.e-rich{border:2px solid #e3e8e4;border-radius:14px;overflow:hidden;background:#fff}.e-rich:focus-within{border-color:#3c8c57}'+
  '.e-rtb{display:flex;flex-wrap:wrap;gap:4px;align-items:center;padding:6px;background:#f5f8f5;border-bottom:1px solid #e3e8e4;position:sticky;top:0}'+
  '.e-tb{border:0;background:#fff;border-radius:9px;padding:7px 11px;font:inherit;font-size:.86rem;font-weight:700;color:#2f6f45;cursor:pointer;box-shadow:0 1px 0 #e3e8e4;min-width:34px}'+
  '.e-tb:hover{background:#e7f1ea}.e-tb-soft{color:#8a978f}.e-sep{width:1px;height:22px;background:#dfe5e0;margin:0 3px}'+
  '.e-rta{min-height:140px;max-height:46vh;overflow:auto;padding:12px 14px;font-size:.97rem;line-height:1.6;color:#33413a;outline:0}'+
  '.e-rta p{margin:0 0 .7em}.e-rta h3{font-family:Comfortaa,cursive;color:#2f6f45;font-size:1.05rem;margin:.8em 0 .4em}.e-rta ul,.e-rta ol{margin:0 0 .7em;padding-left:1.4em}.e-rta a{color:#2f6f45;font-weight:800}'+
  '.e-th{flex:none;width:38px;height:38px;border-radius:50%;object-fit:cover;object-position:50% 25%;border:2px solid #fff;box-shadow:0 0 0 2px #cfe3d5}'+
  '.e-th-none{display:grid;place-items:center;background:#f0f2f0;font-size:.95rem;filter:grayscale(1);opacity:.55;box-shadow:0 0 0 2px #e3e8e4}'+
  '.e-note{background:#fff8e1;border:1px solid #f5d77a;color:#6b5400;border-radius:12px;padding:10px 14px;font-weight:700;font-size:.86rem;margin-bottom:14px}'+
  '.e-gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin-bottom:4px}'+
  '.e-gal-it{position:relative;aspect-ratio:1;border-radius:12px;overflow:hidden;border:1px solid #e3e8e4;background:#f5f8f5}'+
  '.e-gal-it img{width:100%;height:100%;object-fit:cover;display:block}'+
  '.e-gal-x,.e-gal-mv{position:absolute;top:5px;width:26px;height:26px;border-radius:50%;border:0;cursor:pointer;font-weight:800;font-size:.8rem;box-shadow:0 2px 6px rgba(0,0,0,.25)}'+
  '.e-gal-x{right:5px;background:#fff;color:#b0344a}.e-gal-mv{left:5px;background:#fff;color:#2f6f45;font-size:1rem;line-height:1}'+
  '.e-rtip{font-size:.76rem;color:#8a978f;font-weight:600;padding:6px 12px;background:#fafbfa;border-top:1px solid #eef1ee}';
  document.head.appendChild(css);

  function toast(msg, isErr, ms){
    var t=el('div',{class:'e-toast'+(isErr?' err':''),text:msg});
    document.body.appendChild(t);
    setTimeout(function(){ t.style.transition='opacity .4s'; t.style.opacity='0'; setTimeout(function(){t.remove();}, 400); }, ms||3500);
  }
  function clearToasts(){ document.querySelectorAll('.e-toast').forEach(function(x){x.remove();}); }

  // ───────── GitHub API ─────────
  function ghHeaders(){ return {'Authorization':'token '+getToken(), 'Accept':'application/vnd.github+json'}; }
  // GET: 404 = «файлу ще нема» (null). Запис: 403/404 = НЕМАЄ ДОСТУПУ (раніше хибно показувало «Збережено»).
  function handle(r){
    if(r.status===401){ setToken(''); buildBar(false); throw new Error('AUTH'); }
    if(r.status===404) return null;
    if(!r.ok) return r.text().then(function(t){ throw new Error(r.status+' '+t); });
    return r.json();
  }
  function handleWrite(r){
    if(r.status===401){ setToken(''); buildBar(false); throw new Error('AUTH'); }
    if(r.status===403||r.status===404) throw new Error('NOACCESS');
    if(r.status===409||r.status===422) throw new Error('CONFLICT');
    if(!r.ok) return r.text().then(function(t){ throw new Error(r.status+' '+t); });
    return r.json().then(function(j){ if(!j||!j.content) throw new Error('NOACCESS'); return j; });
  }
  function ghGet(path){
    return fetch(API+'/repos/'+GH_OWNER+'/'+GH_REPO+'/contents/'+encodeURI(path)+'?ref='+GH_BRANCH, {headers:ghHeaders(), cache:'no-store'}).then(handle);
  }
  function ghPut(path, contentB64, message, sha){
    var body={message:message, content:contentB64, branch:GH_BRANCH};
    if(sha) body.sha=sha;
    var h=ghHeaders(); h['Content-Type']='application/json';
    return fetch(API+'/repos/'+GH_OWNER+'/'+GH_REPO+'/contents/'+encodeURI(path), {method:'PUT', headers:h, body:JSON.stringify(body)}).then(handleWrite);
  }
  // Чи має цей акаунт право запису в репозиторій
  var ACCESS=null; // null=невідомо, true/false
  function checkAccess(){
    return fetch(API+'/repos/'+GH_OWNER+'/'+GH_REPO, {headers:ghHeaders(), cache:'no-store'}).then(function(r){
      if(r.status===401){ setToken(''); buildBar(false); throw new Error('AUTH'); }
      if(!r.ok) return false;
      return r.json().then(function(j){ return !!(j.permissions && j.permissions.push); });
    }).then(function(ok){ ACCESS=ok; return ok; });
  }
  // Після збереження просимо Vercel оновити сайт (обхід блокування комітів не від власника)
  function triggerDeploy(){
    try{ fetch('/api/deploy',{method:'POST', headers:{'Authorization':'token '+getToken()}}).catch(function(){}); }catch(e){}
  }
  function noAccessMsg(){
    toast('Немає доступу на редагування. Прийміть запрошення в GitHub (лист на пошту або github.com/'+GH_OWNER+'/'+GH_REPO+'/invitations), потім натисніть «Вийти» і увійдіть знову.', true, 12000);
  }

  function loadData(){
    if(TEST){ return fetch(schema.file,{cache:'no-cache'}).then(function(r){return r.ok?r.json():{};}).then(function(j){return {data:j, sha:null};}); }
    return ghGet(schema.file).then(function(res){
      if(!res) throw new Error('NOACCESS'); // файл має існувати; інакше нема доступу — не ризикуємо затерти дані
      return {data: JSON.parse(b64dec(res.content)), sha: res.sha};
    });
  }
  // транслітерація імені файлу (щоб не було «______.pdf»)
  var TR={а:'a',б:'b',в:'v',г:'h',ґ:'g',д:'d',е:'e',є:'ie',ж:'zh',з:'z',и:'y',і:'i',ї:'i',й:'i',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ь:'',ю:'iu',я:'ia',ы:'y',э:'e',ё:'io',ъ:''};
  function safeName(n){
    n=String(n||'file').toLowerCase().replace(/[ʼ'’`]/g,'');
    n=n.replace(/[а-яіїєґёыэъ]/g,function(c){return TR[c]!=null?TR[c]:'';});
    n=n.replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^-|-(?=\.)/g,'');
    return n||'file';
  }
  // великі фото зменшуємо в браузері (до 1600px, JPEG) — сайт вантажиться швидко
  function shrinkImage(file){
    return new Promise(function(resolve){
      if(!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type) || !window.createImageBitmap && !window.Image){ resolve(null); return; }
      var url=URL.createObjectURL(file), img=new Image();
      img.onload=function(){
        var MAX=1600, w=img.naturalWidth, h=img.naturalHeight, k=Math.min(1, MAX/Math.max(w,h));
        if(k===1 && file.size<600*1024){ URL.revokeObjectURL(url); resolve(null); return; }
        var c=document.createElement('canvas'); c.width=Math.round(w*k); c.height=Math.round(h*k);
        var ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,c.width,c.height); ctx.drawImage(img,0,0,c.width,c.height);
        URL.revokeObjectURL(url);
        var data=c.toDataURL('image/jpeg',0.86);
        resolve(data.split(',')[1]);
      };
      img.onerror=function(){ URL.revokeObjectURL(url); resolve(null); };
      img.src=url;
    });
  }
  function uploadFile(fileObj){
    return shrinkImage(fileObj).then(function(small){
      return new Promise(function(resolve,reject){
        function go(b64, name){
          var path=MEDIA_DIR+'/'+Date.now()+'_'+name;
          if(TEST){ console.log('[TEST upload]', path, Math.round(b64.length*0.75/1024)+'KB'); resolve('/'+path); return; }
          ghPut(path, b64, 'upload: '+name).then(function(){ resolve('/'+path); }).catch(function(e){ if(String(e.message)==='NOACCESS') noAccessMsg(); reject(e); });
        }
        var name=safeName(fileObj.name);
        if(small){ go(small, name.replace(/\.[a-z0-9]+$/,'')+'.jpg'); return; }
        var reader=new FileReader();
        reader.onload=function(){ go(reader.result.split(',')[1], name); };
        reader.onerror=reject;
        reader.readAsDataURL(fileObj);
      });
    });
  }


  // ───────── рендер полів (без змін) ─────────
  function fieldControl(f, value){
    if(f.t==='text'){ var inp=el('input',{type:'text',value:value==null?'':String(value)}); return {el:inp, get:function(){return inp.value;}}; }
    if(f.t==='textarea'){ var ta=el('textarea',{}); ta.value=value==null?'':String(value); return {el:ta, get:function(){return ta.value;}}; }
    if(f.t==='rich'){
      var R=window.kalynkaRich||function(x){return esc(x);};
      var ed=el('div',{class:'e-rta',contenteditable:'true',spellcheck:'true'});
      ed.innerHTML=R(value)||'<p><br></p>';
      function cmd(c,arg){ ed.focus(); try{document.execCommand('defaultParagraphSeparator',false,'p');}catch(e){} document.execCommand(c,false,arg); }
      function tb(label,title,fn,cls){ var b=el('button',{type:'button',class:'e-tb'+(cls?' '+cls:''),title:title,html:label}); b.addEventListener('mousedown',function(e){e.preventDefault();}); b.addEventListener('click',fn); return b; }
      var bar=el('div',{class:'e-rtb'},[
        tb('<b>Ж</b>','Жирний (Ctrl+B)',function(){cmd('bold');}),
        tb('<i>К</i>','Курсив (Ctrl+I)',function(){cmd('italic');}),
        tb('<u>П</u>','Підкреслений (Ctrl+U)',function(){cmd('underline');}),
        el('span',{class:'e-sep'}),
        tb('Підзаголовок','Зробити рядок підзаголовком',function(){ var cur=document.queryCommandValue('formatBlock'); cmd('formatBlock', /h3/i.test(cur)?'<p>':'<h3>'); }),
        tb('• Список','Маркований список',function(){cmd('insertUnorderedList');}),
        tb('1. Список','Нумерований список',function(){cmd('insertOrderedList');}),
        tb('🔗','Посилання: виділіть слова і натисніть',function(){ var u=prompt('Вставте адресу посилання (https://…)'); if(u){ if(!/^(https?:|mailto:|tel:|\/)/i.test(u)) u='https://'+u; cmd('createLink',u); } }),
        el('span',{class:'e-sep'}),
        tb('🧹','Прибрати оформлення з виділеного',function(){cmd('removeFormat'); cmd('unlink');},'e-tb-soft')
      ]);
      ed.addEventListener('focus',function(){ try{document.execCommand('defaultParagraphSeparator',false,'p');}catch(e){} });
      ed.addEventListener('paste',function(e){
        var cd=e.clipboardData||window.clipboardData; if(!cd) return;
        e.preventDefault();
        var h=cd.getData('text/html'), t=cd.getData('text/plain');
        var clean = h && window.kalynkaRichFromHtml ? window.kalynkaRichFromHtml(h) : (window.kalynkaRichFromText ? window.kalynkaRichFromText(t||'') : esc(t||''));
        if(!clean) return;
        document.execCommand('insertHTML',false,clean);
      });
      var tip=el('div',{class:'e-rtip',text:'Enter — новий абзац · Shift+Enter — новий рядок · текст з Word можна просто вставити (Ctrl+V)'});
      return {el:el('div',{class:'e-rich'},[bar,ed,tip]), get:function(){
        var out=window.kalynkaRichFromHtml?window.kalynkaRichFromHtml(ed.innerHTML):ed.innerText;
        return (out && out.replace(/<[^>]+>/g,'').trim()) ? out : '';
      }};
    }
    if(f.t==='bool'){
      var cb=el('input',{type:'checkbox'}); cb.checked=!!value; cb.style.cssText='width:22px;height:22px;accent-color:#3c8c57;vertical-align:middle';
      var lb=el('label',{style:'display:flex;align-items:center;gap:10px;font-weight:700;color:#33413a;cursor:pointer'},[cb, f.box||'Так']);
      return {el:lb, get:function(){return cb.checked;}};
    }
    if(f.t==='image'||f.t==='file'){
      var cur={v:value==null?'':String(value)};
      var wrap=el('div',{class:'e-img'}); var prev=el('div');
      function refresh(){ prev.innerHTML=''; if(cur.v){ if(f.t==='image') prev.appendChild(el('img',{src:cur.v,alt:''})); else prev.appendChild(el('div',{class:'fn',text:cur.v})); } else prev.appendChild(el('div',{class:'fn',text:'— не додано —'})); }
      refresh();
      var inp=el('input',{type:'file'});
      if(f.t==='image') inp.setAttribute('accept','image/*'); else inp.setAttribute('accept',f.accept||'.pdf,application/pdf');
      inp.addEventListener('change',function(){
        if(!inp.files||!inp.files[0])return;
        toast('Завантажую файл…',false,60000);
        uploadFile(inp.files[0]).then(function(p){ cur.v=p; refresh(); clearToasts(); toast('Файл додано 👍',false,1800); })
          .catch(function(e){ clearToasts(); toast('Не вдалося завантажити файл',true); });
      });
      wrap.appendChild(prev); wrap.appendChild(inp);
      return {el:wrap, get:function(){return cur.v;}};
    }
    if(f.t==='gallery'){
      var pics=Array.isArray(value)?value.slice():[];
      var grid=el('div',{class:'e-gal'});
      function draw(){
        grid.innerHTML='';
        pics.forEach(function(src,i){
          var x=el('button',{type:'button',class:'e-gal-x',title:'Прибрати фото',text:'✕'});
          x.addEventListener('click',function(){ if(confirm('Прибрати це фото?')){ pics.splice(i,1); draw(); } });
          var l=el('button',{type:'button',class:'e-gal-mv',title:'Перемістити ліворуч',text:'‹'});
          l.addEventListener('click',function(){ if(i>0){ var t=pics[i-1]; pics[i-1]=pics[i]; pics[i]=t; draw(); } });
          grid.appendChild(el('div',{class:'e-gal-it'},[el('img',{src:src,alt:''}),x,i>0?l:null]));
        });
        if(!pics.length) grid.appendChild(el('div',{class:'fn',text:'— фото ще немає —'}));
      }
      draw();
      var gi=el('input',{type:'file',accept:'image/*',multiple:'multiple'});
      var pick=el('button',{type:'button',class:'e-add',text:'➕ Додати фото'});
      pick.addEventListener('click',function(){ gi.click(); });
      gi.style.display='none';
      gi.addEventListener('change',function(){
        var files=Array.prototype.slice.call(gi.files||[]); gi.value=''; if(!files.length) return;
        var n=0, fail=0;
        (function next(){
          if(n>=files.length){ clearToasts(); toast(fail?('Додано '+(files.length-fail)+' з '+files.length+' фото'):'Фото додано 👍', !!fail, 2500); draw(); return; }
          clearToasts(); toast('Завантажую фото '+(n+1)+' з '+files.length+'…',false,120000);
          uploadFile(files[n]).then(function(pth){ pics.push(pth); draw(); }).catch(function(){ fail++; }).then(function(){ n++; next(); });
        })();
      });
      return {el:el('div',{},[grid,pick,gi]), get:function(){ return pics.slice(); }};
    }
    if(f.t==='strlist'){
      var arr=Array.isArray(value)?value.slice():[];
      var box=el('div',{class:'e-rows'});
      function render(){ box.innerHTML=''; arr.forEach(function(s,i){ var ta=el('textarea',{}); ta.value=s; ta.style.minHeight='46px'; ta.addEventListener('input',function(){arr[i]=ta.value;}); var del=el('button',{class:'del',type:'button',text:'✕'}); del.addEventListener('click',function(){arr.splice(i,1);render();}); box.appendChild(el('div',{class:'e-row'},[ta,del])); }); }
      render();
      var add=el('button',{class:'e-add',type:'button',text:'➕ Додати'}); add.addEventListener('click',function(){arr.push('');render();});
      return {el:el('div',{},[box,add]), get:function(){return arr.filter(function(s){return String(s).trim()!=='';});}};
    }
    if(f.t==='objlist'){
      var list=Array.isArray(value)?clone(value):[];
      var box=el('div',{class:'e-rows'});
      function render(){
        box.innerHTML='';
        list.forEach(function(it,i){
          var tt=(f.title?f.title(it):(it.title||('#'+(i+1))));
          var nph=(it&&it.photos||[]).length, ndc=(it&&it.docs||[]).length;
          if(nph||ndc) tt+='  ·  📷 '+nph+' · 📄 '+ndc;
          var t=el('div',{class:'t',text:tt});
          var imgF=(f.fields||[]).filter(function(x){return x.t==='image';})[0];
          var th=null;
          if(imgF){ var src=it&&it[imgF.n]; th = src ? el('img',{class:'e-th',src:src,alt:''}) : el('span',{class:'e-th e-th-none',text:'📷',title:'Без фото'}); }
          var up=el('button',{class:'mv',type:'button',text:'↑'}); up.addEventListener('click',function(){if(i>0){var x=list[i-1];list[i-1]=list[i];list[i]=x;render();}});
          var dn=el('button',{class:'mv',type:'button',text:'↓'}); dn.addEventListener('click',function(){if(i<list.length-1){var x=list[i+1];list[i+1]=list[i];list[i]=x;render();}});
          var ed=el('button',{class:'ed',type:'button',text:'Змінити'}); ed.addEventListener('click',function(){ itemForm(f, list[i], function(res){ list[i]=res; render(); }); });
          var del=el('button',{class:'del',type:'button',text:'Видалити'}); del.addEventListener('click',function(){ if(confirm('Видалити цей пункт?')){list.splice(i,1);render();} });
          box.appendChild(el('div',{class:'e-row'}, f.fixed ? [th,t,ed] : [th,t,up,dn,ed,del]));
        });
      }
      render();
      var add=el('button',{class:'e-add',type:'button',text:'➕ Додати '+(f.itemName||'пункт')}); add.addEventListener('click',function(){ itemForm(f, {}, function(res){ list.push(res); render(); }); });
      return {el:el('div',{},f.fixed?[box]:[box,add]), get:function(){return list;}};
    }
    var d=el('input',{type:'text',value:value==null?'':String(value)}); return {el:d, get:function(){return d.value;}};
  }
  function fieldBlock(f, value){
    var ctl=fieldControl(f, value);
    var kids=[el('label',{text:f.l+(f.opt?' (необовʼязково)':'')})];
    if(f.hint) kids.push(el('div',{class:'hint',text:f.hint}));
    kids.push(ctl.el);
    return {el:el('div',{class:'e-field'},kids), name:f.n, get:ctl.get};
  }
  function itemForm(schemaLike, data, onOk){
    var controls=[]; var body=el('div',{class:'e-body'});
    (schemaLike.fields||[]).forEach(function(f){ var b=fieldBlock(f, data?data[f.n]:undefined); controls.push(b); body.appendChild(b.el); });
    var save=el('button',{class:'e-save',type:'button',text:'Готово'});
    var cancel=el('button',{class:'e-cancel',type:'button',text:'Скасувати'});
    var head=el('div',{class:'e-head'},[el('h3',{text:(schemaLike.itemName||'Елемент')}),(function(){var x=el('button',{class:'x',type:'button',text:'✕'});x.addEventListener('click',close);return x;})()]);
    var bg=el('div',{class:'e-modal-bg'},[el('div',{class:'e-modal'},[head,body,el('div',{class:'e-foot'},[cancel,save])])]);
    function close(){bg.remove();}
    cancel.addEventListener('click',close);
    save.addEventListener('click',function(){ var out={}; controls.forEach(function(c){out[c.name]=c.get();}); onOk(out); close(); });
    document.body.appendChild(bg);
  }

  function openEditor(){
    toast('Завантажую…',false,60000);
    loadData().then(function(res){
      clearToasts();
      var full=res.data||{}; var sha=res.sha;
      var subk=schema.sub?schema.sub():null;
      var working=subk?(full[subk]||{}):full;
      var body=el('div',{class:'e-body'}); var getters=[];
      var fields=schema.fields, virt=null;
      if(subk==='inklyuziya'){
        // інклюзивні групи живуть у своїх вікових розділах — редагуємо їх звідси напряму
        virt=[]; var vg=[];
        Object.keys(full).forEach(function(k){ if(k==='inklyuziya')return; ((full[k]||{}).groups||[]).forEach(function(gr,i){ if(gr&&gr.inclusive){ virt.push([k,i]); vg.push(gr); } }); });
        working=clone(full.inklyuziya||{}); working.groups=clone(vg);
        fields=schema.fields.map(function(f){ return f.n==='groups' ? Object.assign({},f,{fixed:true,l:'Інклюзивні групи та їх педагоги',hint:'Тут усі групи з позначкою «Інклюзивна». Зміни (фото, педагоги) збережуться і на сторінці відповідної вікової групи.'}) : f; });
      }
      if(schema.shape==='list'){
        body.appendChild(el('div',{class:'e-sub',text:'Додавайте, змінюйте або видаляйте записи. Порядок міняйте стрілками ↑↓.'}));
        var ctl=fieldControl({t:'objlist', itemName:schema.itemName, title:schema.title, fields:schema.fields}, working[schema.listKey]||[]);
        body.appendChild(ctl.el);
        getters.push({apply:function(obj){ obj[schema.listKey]=ctl.get(); }});
        if(schema.pageMedia){
          body.appendChild(el('div',{class:'e-sub',style:'margin-top:22px',text:'Нижче — фото та документи для всієї сторінки (необовʼязково).'}));
          mediaFields(true).forEach(function(f){ var b=fieldBlock(f, working[f.n]); getters.push({apply:function(obj){ obj[f.n]=b.get(); }}); body.appendChild(b.el); });
        }
      } else {
        fields.forEach(function(f){ var b=fieldBlock(f, working[f.n]); getters.push({apply:function(obj){ obj[f.n]=b.get(); }}); body.appendChild(b.el); });
      }
      var save=el('button',{class:'e-save',type:'button',text:'💾 Зберегти'});
      var cancel=el('button',{class:'e-cancel',type:'button',text:'Скасувати'});
      var head=el('div',{class:'e-head'},[el('h3',{text:'Редагування: '+schema.label}),(function(){var x=el('button',{class:'x',type:'button',text:'✕'});x.addEventListener('click',close);return x;})()]);
      var bg=el('div',{class:'e-modal-bg'},[el('div',{class:'e-modal'},[head,body,el('div',{class:'e-foot'},[cancel,save])])]);
      function close(){bg.remove();}
      cancel.addEventListener('click',close);
      save.addEventListener('click',function(){
        var edited=clone(working)||{}; getters.forEach(function(g){g.apply(edited);});
        var out=edited;
        if(subk){ out=clone(full)||{}; out[subk]=edited; }
        if(virt){
          var ng=edited.groups||[];
          virt.forEach(function(ref,j){ if(ng[j] && out[ref[0]] && out[ref[0]].groups) out[ref[0]].groups[ref[1]]=ng[j]; });
          out.inklyuziya.groups=[];
        }
        var json=JSON.stringify(out,null,2)+'\n';
        if(TEST){ console.log('[TEST save] '+schema.file+'\n'+json); toast('ТЕСТ: збережено в консоль'); close(); return; }
        save.disabled=true; save.textContent='Зберігаю…';
        ghPut(schema.file, b64enc(json), 'edit: '+schema.file+' (сайт)', sha).then(function(){
          triggerDeploy();
          close(); toast('Збережено! Зміни зʼявляться на сайті за 1–2 хвилини ✅', false, 6000);
        }).catch(function(e){
          save.disabled=false; save.textContent='💾 Зберегти';
          var m=String(e.message);
          if(m==='AUTH') toast('Сесія завершилась. Увійдіть знову.', true, 5000);
          else if(m==='NOACCESS') noAccessMsg();
          else if(m==='CONFLICT') toast('Дані щойно змінились з іншого місця. Закрийте вікно, оновіть сторінку і спробуйте ще раз.', true, 8000);
          else toast('Помилка збереження: '+m.slice(0,80), true, 8000);
        });
      });
      document.body.appendChild(bg);
    }).catch(function(e){
      clearToasts();
      if(String(e.message)==='AUTH') toast('Потрібно ввійти знову', true);
      else if(String(e.message)==='NOACCESS') noAccessMsg();
      else toast('Не вдалося завантажити дані для редагування', true);
    });
  }

  // ───────── вхід через GitHub ─────────
  function login(){
    var w=600,h=720, l=(screen.width-w)/2, t=(screen.height-h)/2;
    window.open(AUTH_URL, 'kalynka_login', 'width='+w+',height='+h+',left='+l+',top='+t);
  }
  window.addEventListener('message', function(e){
    if(!e.data || e.data.source!=='kalynka-auth') return;
    if(e.data.token){ setToken(e.data.token); buildBar(true);
      checkAccess().then(function(ok){ if(ok) toast('Вхід виконано ✅', false, 2500); else { buildBar(true); noAccessMsg(); } }).catch(function(){}); }
    else { toast('Не вдалося увійти'+(e.data.error?': '+e.data.error:''), true, 5000); }
  });

  // ───────── панель адміністратора ─────────
  var bar;
  function buildBar(loggedIn){
    if(bar) bar.remove();
    bar=el('div',{class:'eadmin'});
    if(!loggedIn){
      var lg=el('button',{class:'e-key',type:'button',text:'🔑 Вхід',title:'Вхід для адміністратора'});
      lg.addEventListener('click',login);
      bar.appendChild(lg);
    } else {
      if(ACCESS===false){ var na=el('button',{class:'e-key',type:'button',text:'⛔ Немає доступу на запис'}); na.addEventListener('click',noAccessMsg); bar.appendChild(na); }
      else if(schema){ var edit=el('button',{class:'e-edit',type:'button',text:'✏️ Редагувати: '+schema.label}); edit.addEventListener('click',openEditor); bar.appendChild(edit); }
      else bar.appendChild(el('button',{class:'e-key',type:'button',text:'ℹ️ Тут нема що редагувати'}));
      var out=el('button',{class:'e-out',type:'button',text:'Вийти'});
      out.addEventListener('click',function(){ setToken(''); ACCESS=null; buildBar(false); });
      bar.appendChild(out);
    }
    document.body.appendChild(bar);
  }

  // ───────── старт ─────────
  if(TEST){ buildBar(true); return; }
  buildBar(!!getToken());
  if(getToken()) checkAccess().then(function(ok){ if(!ok) buildBar(true); }).catch(function(){});
})();
