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
    {n:'role',l:'Посада',t:'text',hint:'Напр.: Вихователь'},
    {n:'name',l:'Прізвище, імʼя, по батькові',t:'text'},
    {n:'info',l:'Категорія, стаж, освіта',t:'text',opt:true,hint:'Напр.: Вища категорія, стаж 23 роки'},
    {n:'credo',l:'Педагогічне кредо',t:'textarea',opt:true,hint:'Без лапок — вони додадуться самі'},
    {n:'photo',l:'Фото',t:'image',opt:true}
  ];

  var S = {
    news:   {label:'Новини', file:'content/news.json', shape:'list', listKey:'items', itemName:'Новина',
             title:function(x){return (x.date?x.date+' — ':'')+(x.title||'(без назви)');},
             fields:[ {n:'date',l:'Дата',t:'text',hint:'Напр.: 05 вересня 2025'}, {n:'title',l:'Заголовок',t:'text'}, {n:'text',l:'Текст',t:'textarea',opt:true}, {n:'image',l:'Фото',t:'image',opt:true} ]},
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
             fields:[ {n:'emoji',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Назва',t:'text'}, {n:'text',l:'Опис',t:'textarea'} ]},
    parents:{label:'Батьківський навігатор', file:'content/parents.json', shape:'list', listKey:'items', itemName:'Картка',
             title:function(x){return x.title||'';},
             fields:[ {n:'icon',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Назва',t:'text'}, {n:'text',l:'Опис',t:'textarea'} ]},
    gurtky: {label:'Гуртки', file:'content/gurtky.json', shape:'list', listKey:'items', itemName:'Гурток',
             title:function(x){return x.title||'';},
             fields:[ {n:'emoji',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Назва',t:'text'}, {n:'text',l:'Опис',t:'textarea'} ]},

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
               {n:'groups',l:'Групи та вихователі',t:'objlist',itemName:'Група',title:function(x){return (x.num?'№'+x.num+' ':'')+(x.name?'«'+x.name+'»':'');},
                 fields:[ {n:'num',l:'Номер групи',t:'text',opt:true,hint:'Напр.: 10'}, {n:'name',l:'Назва групи',t:'text',hint:'Напр.: Пазлики'},
                          {n:'teachers',l:'Педагоги групи',t:'objlist',itemName:'Педагог',title:function(x){return (x.role||'')+' — '+(x.name||'');}, fields:PERSON} ]},
               {n:'about',l:'Опис «Про групу» (абзаци)',t:'strlist'},
               {n:'develop',l:'Що розвиваємо (пункти)',t:'strlist'},
               {n:'activities',l:'Заняття',t:'objlist',itemName:'Заняття',title:function(x){return x.title||'';},
                 fields:[ {n:'emoji',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Назва',t:'text'}, {n:'text',l:'Опис',t:'textarea'} ]}
             ]},
    menu:   {label:'Меню харчування', file:'content/menu.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступний текст',t:'textarea'},
               {n:'note',l:'Примітка',t:'textarea',opt:true},
               {n:'days',l:'Дні тижня',t:'objlist',itemName:'День',title:function(x){return x.day||'';},
                 fields:[ {n:'day',l:'День',t:'text'}, {n:'breakfast',l:'Сніданок',t:'text',opt:true}, {n:'lunch',l:'Обід',t:'text',opt:true}, {n:'snack',l:'Підвечірок',t:'text',opt:true}, {n:'supper',l:'Вечеря',t:'text',opt:true} ]}
             ]},
    rezhym: {label:'Розпорядок дня', file:'content/rezhym.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступний текст',t:'textarea'},
               {n:'note',l:'Примітка',t:'textarea',opt:true},
               {n:'items',l:'Пункти режиму',t:'objlist',itemName:'Пункт',title:function(x){return (x.time||'')+' — '+(x.title||'');},
                 fields:[ {n:'time',l:'Час',t:'text'}, {n:'icon',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Що відбувається',t:'text'} ]}
             ]},
    bezpeka:{label:'Безпека та укриття', file:'content/bezpeka.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступний текст',t:'textarea'},
               {n:'alarmTitle',l:'Заголовок блоку тривоги',t:'text'},
               {n:'alarmSteps',l:'Дії під час тривоги',t:'strlist'},
               {n:'items',l:'Картки безпеки',t:'objlist',itemName:'Картка',title:function(x){return x.title||'';},
                 fields:[ {n:'icon',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Назва',t:'text'}, {n:'text',l:'Опис',t:'textarea'} ]}
             ]},
    vstup:  {label:'Як записати дитину', file:'content/vstup.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступний текст',t:'textarea'},
               {n:'steps',l:'Кроки',t:'objlist',itemName:'Крок',title:function(x){return x.title||'';},
                 fields:[ {n:'title',l:'Назва кроку',t:'text'}, {n:'text',l:'Опис',t:'textarea'} ]},
               {n:'documents',l:'Перелік документів',t:'strlist'},
               {n:'note',l:'Примітка',t:'textarea',opt:true}
             ]},
    settings:{label:'Контакти закладу', file:'content/settings.json', shape:'object',
             fields:[
               {n:'name',l:'Коротка назва',t:'text'}, {n:'full',l:'Повна назва',t:'textarea'},
               {n:'addr',l:'Адреса',t:'text'}, {n:'phone',l:'Телефон',t:'text'}, {n:'email',l:'Email',t:'text'},
               {n:'hours',l:'Графік роботи',t:'text'},
               {n:'facebook',l:'Facebook (посилання)',t:'text',opt:true}, {n:'telegram',l:'Telegram',t:'text',opt:true}, {n:'youtube',l:'YouTube',t:'text',opt:true}
             ]},
    pedprostir:{label:'Педагогічний простір', file:'content/pedprostir.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступний текст',t:'textarea'},
               {n:'items',l:'Підрозділи', t:'objlist', itemName:'Підрозділ', title:function(x){return x.title||'';},
                 fields:[ {n:'icon',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Назва',t:'text'}, {n:'text',l:'Опис',t:'textarea'} ]}
             ]},
    prozorist:{label:'Прозорість (документи)', file:'content/prozorist.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступний текст',t:'textarea'},
               {n:'items',l:'Пункти', t:'objlist', itemName:'Пункт', title:function(x){return x.title||'';},
                 fields:[ {n:'title',l:'Назва',t:'text'}, {n:'file',l:'Файл PDF',t:'file',opt:true}, {n:'link',l:'Посилання (замість файлу)',t:'text',opt:true}, {n:'note',l:'Примітка',t:'text',opt:true} ]}
             ]}
  };

  var PAGE_MAP = {
    home:'home', novyny:'news', podii:'events', galereya:'gallery', dokumenty:'documents',
    proekty:'projects', batkam:'parents', osvita:'gurtky', pro:'about',
    menu:'menu', rezhym:'rezhym', bezpeka:'bezpeka', vstup:'vstup', kontakty:'settings', prozorist:'prozorist', pedprostir:'pedprostir'
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
  '.e-modal{background:#fff;border-radius:22px;width:min(680px,100%);box-shadow:0 30px 70px -20px rgba(0,0,0,.5);overflow:hidden;animation:epop .18s ease}'+
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
  '.e-sub{font-size:.82rem;color:#8a978f;font-weight:600;margin:-6px 0 14px}';
  document.head.appendChild(css);

  function toast(msg, isErr, ms){
    var t=el('div',{class:'e-toast'+(isErr?' err':''),text:msg});
    document.body.appendChild(t);
    setTimeout(function(){ t.style.transition='opacity .4s'; t.style.opacity='0'; setTimeout(function(){t.remove();}, 400); }, ms||3500);
  }
  function clearToasts(){ document.querySelectorAll('.e-toast').forEach(function(x){x.remove();}); }

  // ───────── GitHub API ─────────
  function ghHeaders(){ return {'Authorization':'token '+getToken(), 'Accept':'application/vnd.github+json'}; }
  function handle(r){
    if(r.status===401){ setToken(''); buildBar(false); throw new Error('AUTH'); }
    if(r.status===404) return null;
    if(!r.ok) return r.text().then(function(t){ throw new Error(r.status+' '+t); });
    return r.json();
  }
  function ghGet(path){
    return fetch(API+'/repos/'+GH_OWNER+'/'+GH_REPO+'/contents/'+encodeURI(path)+'?ref='+GH_BRANCH, {headers:ghHeaders(), cache:'no-store'}).then(handle);
  }
  function ghPut(path, contentB64, message, sha){
    var body={message:message, content:contentB64, branch:GH_BRANCH};
    if(sha) body.sha=sha;
    var h=ghHeaders(); h['Content-Type']='application/json';
    return fetch(API+'/repos/'+GH_OWNER+'/'+GH_REPO+'/contents/'+encodeURI(path), {method:'PUT', headers:h, body:JSON.stringify(body)}).then(handle);
  }

  function loadData(){
    if(TEST){ return fetch(schema.file,{cache:'no-cache'}).then(function(r){return r.ok?r.json():{};}).then(function(j){return {data:j, sha:null};}); }
    return ghGet(schema.file).then(function(res){
      if(!res) return {data:{}, sha:null};
      return {data: JSON.parse(b64dec(res.content)), sha: res.sha};
    });
  }
  function uploadFile(fileObj){
    return new Promise(function(resolve,reject){
      var reader=new FileReader();
      reader.onload=function(){
        var b64=reader.result.split(',')[1];
        var safe=fileObj.name.replace(/[^a-zA-Z0-9._-]/g,'_');
        var path=MEDIA_DIR+'/'+Date.now()+'_'+safe;
        if(TEST){ console.log('[TEST upload]', path); resolve('/'+path); return; }
        ghPut(path, b64, 'upload: '+safe).then(function(){ resolve('/'+path); }).catch(reject);
      };
      reader.onerror=reject;
      reader.readAsDataURL(fileObj);
    });
  }

  // ───────── рендер полів (без змін) ─────────
  function fieldControl(f, value){
    if(f.t==='text'){ var inp=el('input',{type:'text',value:value==null?'':String(value)}); return {el:inp, get:function(){return inp.value;}}; }
    if(f.t==='textarea'){ var ta=el('textarea',{}); ta.value=value==null?'':String(value); return {el:ta, get:function(){return ta.value;}}; }
    if(f.t==='image'||f.t==='file'){
      var cur={v:value==null?'':String(value)};
      var wrap=el('div',{class:'e-img'}); var prev=el('div');
      function refresh(){ prev.innerHTML=''; if(cur.v){ if(f.t==='image') prev.appendChild(el('img',{src:cur.v,alt:''})); else prev.appendChild(el('div',{class:'fn',text:cur.v})); } else prev.appendChild(el('div',{class:'fn',text:'— не додано —'})); }
      refresh();
      var inp=el('input',{type:'file'});
      if(f.t==='image') inp.setAttribute('accept','image/*'); else inp.setAttribute('accept','.pdf,application/pdf');
      inp.addEventListener('change',function(){
        if(!inp.files||!inp.files[0])return;
        toast('Завантажую файл…',false,60000);
        uploadFile(inp.files[0]).then(function(p){ cur.v=p; refresh(); clearToasts(); toast('Файл додано 👍',false,1800); })
          .catch(function(e){ clearToasts(); toast('Не вдалося завантажити файл',true); });
      });
      wrap.appendChild(prev); wrap.appendChild(inp);
      return {el:wrap, get:function(){return cur.v;}};
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
          var t=el('div',{class:'t',text:(f.title?f.title(it):(it.title||('#'+(i+1))))});
          var up=el('button',{class:'mv',type:'button',text:'↑'}); up.addEventListener('click',function(){if(i>0){var x=list[i-1];list[i-1]=list[i];list[i]=x;render();}});
          var dn=el('button',{class:'mv',type:'button',text:'↓'}); dn.addEventListener('click',function(){if(i<list.length-1){var x=list[i+1];list[i+1]=list[i];list[i]=x;render();}});
          var ed=el('button',{class:'ed',type:'button',text:'Змінити'}); ed.addEventListener('click',function(){ itemForm(f, list[i], function(res){ list[i]=res; render(); }); });
          var del=el('button',{class:'del',type:'button',text:'Видалити'}); del.addEventListener('click',function(){ if(confirm('Видалити цей пункт?')){list.splice(i,1);render();} });
          box.appendChild(el('div',{class:'e-row'},[t,up,dn,ed,del]));
        });
      }
      render();
      var add=el('button',{class:'e-add',type:'button',text:'➕ Додати '+(f.itemName||'пункт')}); add.addEventListener('click',function(){ itemForm(f, {}, function(res){ list.push(res); render(); }); });
      return {el:el('div',{},[box,add]), get:function(){return list;}};
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
      if(schema.shape==='list'){
        body.appendChild(el('div',{class:'e-sub',text:'Додавайте, змінюйте або видаляйте записи. Порядок міняйте стрілками ↑↓.'}));
        var ctl=fieldControl({t:'objlist', itemName:schema.itemName, title:schema.title, fields:schema.fields}, working[schema.listKey]||[]);
        body.appendChild(ctl.el);
        getters.push({apply:function(obj){ obj[schema.listKey]=ctl.get(); }});
      } else {
        schema.fields.forEach(function(f){ var b=fieldBlock(f, working[f.n]); getters.push({apply:function(obj){ obj[f.n]=b.get(); }}); body.appendChild(b.el); });
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
        var json=JSON.stringify(out,null,2)+'\n';
        if(TEST){ console.log('[TEST save] '+schema.file+'\n'+json); toast('ТЕСТ: збережено в консоль'); close(); return; }
        save.disabled=true; save.textContent='Зберігаю…';
        ghPut(schema.file, b64enc(json), 'edit: '+schema.file+' (сайт)', sha).then(function(){
          close(); toast('Збережено! Зміни зʼявляться на сайті за 1–2 хвилини ✅', false, 5000);
        }).catch(function(e){
          save.disabled=false; save.textContent='💾 Зберегти';
          if(String(e.message)==='AUTH') toast('Сесія завершилась. Увійдіть знову.', true, 5000);
          else toast('Помилка збереження. Спробуйте ще раз.', true, 5000);
        });
      });
      document.body.appendChild(bg);
    }).catch(function(e){
      clearToasts();
      if(String(e.message)==='AUTH') toast('Потрібно ввійти знову', true);
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
    if(e.data.token){ setToken(e.data.token); buildBar(true); toast('Вхід виконано ✅', false, 2500); }
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
      if(schema){ var edit=el('button',{class:'e-edit',type:'button',text:'✏️ Редагувати: '+schema.label}); edit.addEventListener('click',openEditor); bar.appendChild(edit); }
      else bar.appendChild(el('button',{class:'e-key',type:'button',text:'ℹ️ Тут нема що редагувати'}));
      var out=el('button',{class:'e-out',type:'button',text:'Вийти'});
      out.addEventListener('click',function(){ setToken(''); buildBar(false); });
      bar.appendChild(out);
    }
    document.body.appendChild(bar);
  }

  // ───────── старт ─────────
  if(TEST){ buildBar(true); return; }
  buildBar(!!getToken());
})();
