/* edit.js — редагування вмісту «на місці» для адміністратора (мами).
   Вхід через Netlify Identity, збереження у GitHub через Git Gateway.
   Нічого зайвого для звичайних відвідувачів: панель зʼявляється лише після входу. */
(function(){
  'use strict';

  var GG = '/.netlify/git/github';           // Git Gateway
  var BRANCH = 'main';
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

  // ───────── схеми вмісту ─────────
  // типи полів: text, textarea, image, file, strlist, objlist
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
    parents:{label:'Батькам (картки)', file:'content/parents.json', shape:'list', listKey:'items', itemName:'Картка',
             title:function(x){return x.title||'';},
             fields:[ {n:'icon',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Назва',t:'text'}, {n:'text',l:'Опис',t:'textarea'} ]},
    gurtky: {label:'Гуртки', file:'content/gurtky.json', shape:'list', listKey:'items', itemName:'Гурток',
             title:function(x){return x.title||'';},
             fields:[ {n:'emoji',l:'Емодзі',t:'text',opt:true}, {n:'title',l:'Назва',t:'text'}, {n:'text',l:'Опис',t:'textarea'} ]},

    home:   {label:'Головна сторінка', file:'content/home.json', shape:'object',
             fields:[
               {n:'aboutEyebrow',l:'Підзаголовок «Про нас»',t:'text'},
               {n:'aboutTitle',l:'Заголовок «Про нас»',t:'text'},
               {n:'about',l:'Текст «Про нас» (абзаци)',t:'strlist',line:true},
               {n:'voices',l:'Цитати дітей',t:'objlist',itemName:'Цитата',title:function(x){return x.kid||x.text||'';},
                 fields:[ {n:'text',l:'Цитата',t:'textarea'}, {n:'kid',l:'Хто сказав',t:'text'}, {n:'avatar',l:'Емодзі',t:'text',opt:true} ]}
             ]},
    about:  {label:'Про заклад', file:'content/about.json', shape:'object',
             fields:[
               {n:'intro',l:'Вступ (абзаци)',t:'strlist'},
               {n:'history',l:'Історія (абзаци)',t:'strlist'},
               {n:'admin',l:'Адміністрація',t:'objlist',itemName:'Людина',title:function(x){return (x.role||'')+' — '+(x.name||'');},
                 fields:[ {n:'role',l:'Посада',t:'text'}, {n:'name',l:'ПІБ',t:'text'}, {n:'photo',l:'Фото',t:'image',opt:true} ]}
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
             ]}
  };

  // сторінка (data-page) → яку схему редагувати
  var PAGE_MAP = {
    home:'home', novyny:'news', podii:'events', galereya:'gallery', dokumenty:'documents',
    proekty:'projects', batkam:'parents', osvita:'gurtky', pro:'about',
    menu:'menu', rezhym:'rezhym', bezpeka:'bezpeka', vstup:'vstup', kontakty:'settings'
  };

  var page = document.body.getAttribute('data-page') || '';
  var schema = S[PAGE_MAP[page]] || null;

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

  // ───────── Git Gateway ─────────
  function jwt(){
    if(TEST) return Promise.resolve('test');
    var u = window.netlifyIdentity && window.netlifyIdentity.currentUser();
    if(!u) return Promise.reject(new Error('Не виконано вхід'));
    return u.jwt();
  }
  function ggGet(path){
    return jwt().then(function(tok){
      return fetch(GG+'/contents/'+path+'?ref='+BRANCH, {headers:{Authorization:'Bearer '+tok}})
        .then(function(r){ if(r.status===404) return null; if(!r.ok) throw new Error('GET '+r.status); return r.json(); });
    });
  }
  function ggPut(path, contentB64, message, sha){
    return jwt().then(function(tok){
      var body={branch:BRANCH, message:message, content:contentB64};
      if(sha) body.sha=sha;
      return fetch(GG+'/contents/'+path, {method:'PUT', headers:{Authorization:'Bearer '+tok,'Content-Type':'application/json'}, body:JSON.stringify(body)})
        .then(function(r){ if(!r.ok) return r.text().then(function(t){throw new Error('PUT '+r.status+' '+t);}); return r.json(); });
    });
  }

  // завантажити поточний JSON (+sha) для редагування
  function loadData(){
    if(TEST){
      return fetch(schema.file,{cache:'no-cache'}).then(function(r){return r.ok?r.json():{};}).then(function(j){return {data:j, sha:null};});
    }
    return ggGet(schema.file).then(function(res){
      if(!res) return {data:{}, sha:null};
      return {data: JSON.parse(b64dec(res.content)), sha: res.sha};
    });
  }

  // завантажити файл-картинку → повернути шлях /images/uploads/...
  function uploadFile(fileObj){
    return new Promise(function(resolve,reject){
      var reader=new FileReader();
      reader.onload=function(){
        var b64=reader.result.split(',')[1];
        var safe=fileObj.name.replace(/[^a-zA-Z0-9._-]/g,'_');
        var path=MEDIA_DIR+'/'+Date.now()+'_'+safe;
        if(TEST){ console.log('[TEST upload]', path); resolve('/'+path); return; }
        ggPut(path, b64, 'upload: '+safe).then(function(){ resolve('/'+path); }).catch(reject);
      };
      reader.onerror=reject;
      reader.readAsDataURL(fileObj);
    });
  }

  // ───────── рендер полів ─────────
  // повертає {el, get:()=>value}
  function fieldControl(f, value){
    if(f.t==='text'){
      var inp=el('input',{type:'text',value:value==null?'':String(value)});
      return {el:inp, get:function(){return inp.value;}};
    }
    if(f.t==='textarea'){
      var ta=el('textarea',{}); ta.value=value==null?'':String(value);
      return {el:ta, get:function(){return ta.value;}};
    }
    if(f.t==='image'||f.t==='file'){
      var cur={v:value==null?'':String(value)};
      var wrap=el('div',{class:'e-img'});
      var prev=el('div');
      function refresh(){
        prev.innerHTML='';
        if(cur.v){
          if(f.t==='image') prev.appendChild(el('img',{src:cur.v,alt:''}));
          else prev.appendChild(el('div',{class:'fn',text:cur.v}));
        } else prev.appendChild(el('div',{class:'fn',text:'— не додано —'}));
      }
      refresh();
      var inp=el('input',{type:'file'});
      if(f.t==='image') inp.setAttribute('accept','image/*'); else inp.setAttribute('accept','.pdf,application/pdf');
      inp.addEventListener('change',function(){
        if(!inp.files||!inp.files[0])return;
        toast('Завантажую файл…',false,60000);
        uploadFile(inp.files[0]).then(function(p){ cur.v=p; refresh(); document.querySelectorAll('.e-toast').forEach(function(x){x.remove();}); toast('Файл додано 👍',false,1800); })
          .catch(function(e){ document.querySelectorAll('.e-toast').forEach(function(x){x.remove();}); toast('Не вдалося завантажити файл',true); });
      });
      wrap.appendChild(prev); wrap.appendChild(inp);
      return {el:wrap, get:function(){return cur.v;}};
    }
    if(f.t==='strlist'){
      var arr=Array.isArray(value)?value.slice():[];
      var box=el('div',{class:'e-rows'});
      function render(){
        box.innerHTML='';
        arr.forEach(function(s,i){
          var ta=el('textarea',{}); ta.value=s; ta.style.minHeight='46px';
          ta.addEventListener('input',function(){arr[i]=ta.value;});
          var del=el('button',{class:'del',type:'button',text:'✕'});
          del.addEventListener('click',function(){arr.splice(i,1);render();});
          var row=el('div',{class:'e-row'},[ta,del]);
          box.appendChild(row);
        });
      }
      render();
      var add=el('button',{class:'e-add',type:'button',text:'➕ Додати'});
      add.addEventListener('click',function(){arr.push('');render();});
      var w=el('div',{},[box,add]);
      return {el:w, get:function(){return arr.filter(function(s){return String(s).trim()!=='';});}};
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
      var add=el('button',{class:'e-add',type:'button',text:'➕ Додати '+(f.itemName||'пункт')});
      add.addEventListener('click',function(){ itemForm(f, {}, function(res){ list.push(res); render(); }); });
      var w=el('div',{},[box,add]);
      return {el:w, get:function(){return list;}};
    }
    // fallback
    var d=el('input',{type:'text',value:value==null?'':String(value)});
    return {el:d, get:function(){return d.value;}};
  }

  function fieldBlock(f, value){
    var ctl=fieldControl(f, value);
    var lab=el('label',{text:f.l+(f.opt?' (необовʼязково)':'')});
    var kids=[lab];
    if(f.hint) kids.push(el('div',{class:'hint',text:f.hint}));
    kids.push(ctl.el);
    var block=el('div',{class:'e-field'},kids);
    return {el:block, name:f.n, get:ctl.get};
  }

  // модалка «редагувати один елемент» (для objlist та list-item)
  function itemForm(schemaLike, data, onOk){
    var controls=[];
    var body=el('div',{class:'e-body'});
    (schemaLike.fields||[]).forEach(function(f){
      var b=fieldBlock(f, data?data[f.n]:undefined);
      controls.push(b); body.appendChild(b.el);
    });
    var save=el('button',{class:'e-save',type:'button',text:'Готово'});
    var cancel=el('button',{class:'e-cancel',type:'button',text:'Скасувати'});
    var head=el('div',{class:'e-head'},[el('h3',{text:(schemaLike.itemName||'Елемент')}), (function(){var x=el('button',{class:'x',type:'button',text:'✕'});x.addEventListener('click',close);return x;})()]);
    var foot=el('div',{class:'e-foot'},[cancel,save]);
    var modal=el('div',{class:'e-modal'},[head,body,foot]);
    var bg=el('div',{class:'e-modal-bg'},[modal]);
    function close(){bg.remove();}
    cancel.addEventListener('click',close);
    save.addEventListener('click',function(){
      var out={}; controls.forEach(function(c){out[c.name]=c.get();});
      onOk(out); close();
    });
    document.body.appendChild(bg);
  }

  // головна модалка редагування сторінки
  function openEditor(){
    toast('Завантажую…',false,60000);
    loadData().then(function(res){
      document.querySelectorAll('.e-toast').forEach(function(x){x.remove();});
      var working=res.data||{};
      var sha=res.sha;
      var body=el('div',{class:'e-body'});
      var getters=[];

      if(schema.shape==='list'){
        body.appendChild(el('div',{class:'e-sub',text:'Додавайте, змінюйте або видаляйте записи. Порядок міняйте стрілками ↑↓.'}));
        var listField={t:'objlist', itemName:schema.itemName, title:schema.title, fields:schema.fields};
        var ctl=fieldControl(listField, working[schema.listKey]||[]);
        body.appendChild(ctl.el);
        getters.push({apply:function(obj){ obj[schema.listKey]=ctl.get(); }});
      } else {
        schema.fields.forEach(function(f){
          var b=fieldBlock(f, working[f.n]);
          getters.push({apply:function(obj){ obj[f.n]=b.get(); }});
          body.appendChild(b.el);
        });
      }

      var save=el('button',{class:'e-save',type:'button',text:'💾 Зберегти'});
      var cancel=el('button',{class:'e-cancel',type:'button',text:'Скасувати'});
      var head=el('div',{class:'e-head'},[el('h3',{text:'Редагування: '+schema.label}),(function(){var x=el('button',{class:'x',type:'button',text:'✕'});x.addEventListener('click',close);return x;})()]);
      var foot=el('div',{class:'e-foot'},[cancel,save]);
      var modal=el('div',{class:'e-modal'},[head,body,foot]);
      var bg=el('div',{class:'e-modal-bg'},[modal]);
      function close(){bg.remove();}
      cancel.addEventListener('click',close);
      save.addEventListener('click',function(){
        var out=clone(working)||{};
        getters.forEach(function(g){g.apply(out);});
        var json=JSON.stringify(out,null,2)+'\n';
        if(TEST){ console.log('[TEST save] '+schema.file+'\n'+json); toast('ТЕСТ: збережено в консоль'); close(); return; }
        save.disabled=true; save.textContent='Зберігаю…';
        var b64=b64enc(json);
        ggPut(schema.file, b64, 'edit: '+schema.file+' (сайт)', sha).then(function(){
          close(); toast('Збережено! Зміни зʼявляться на сайті за 1–2 хвилини ✅', false, 5000);
        }).catch(function(e){
          save.disabled=false; save.textContent='💾 Зберегти';
          toast('Помилка збереження. Спробуйте ще раз.', true, 5000);
        });
      });
      document.body.appendChild(bg);
    }).catch(function(e){
      document.querySelectorAll('.e-toast').forEach(function(x){x.remove();});
      toast('Не вдалося завантажити дані для редагування', true);
    });
  }

  // ───────── панель адміністратора ─────────
  var bar;
  function buildBar(loggedIn){
    if(bar) bar.remove();
    bar=el('div',{class:'eadmin'});
    if(!loggedIn){
      var login=el('button',{class:'e-key',type:'button',text:'🔑 Вхід',title:'Вхід для адміністратора'});
      login.addEventListener('click',function(){ if(window.netlifyIdentity) window.netlifyIdentity.open(); });
      bar.appendChild(login);
    } else {
      if(schema){
        var edit=el('button',{class:'e-edit',type:'button',text:'✏️ Редагувати: '+schema.label});
        edit.addEventListener('click',openEditor);
        bar.appendChild(edit);
      } else {
        bar.appendChild(el('button',{class:'e-key',type:'button',text:'ℹ️ Тут нема що редагувати'}));
      }
      var out=el('button',{class:'e-out',type:'button',text:'Вийти'});
      out.addEventListener('click',function(){ if(window.netlifyIdentity) window.netlifyIdentity.logout(); });
      bar.appendChild(out);
    }
    document.body.appendChild(bar);
  }

  // ───────── ініціалізація ─────────
  if(TEST){ buildBar(true); return; }

  function loadIdentity(cb){
    if(window.netlifyIdentity) return cb();
    var s=document.createElement('script');
    s.src='https://identity.netlify.com/v1/netlify-identity-widget.js';
    s.onload=cb; s.onerror=function(){ /* тихо: для відвідувача це не потрібно */ };
    document.head.appendChild(s);
  }
  loadIdentity(function(){
    if(!window.netlifyIdentity) return;
    window.netlifyIdentity.on('init', function(user){ buildBar(!!user); });
    window.netlifyIdentity.on('login', function(){ buildBar(true); if(window.netlifyIdentity) window.netlifyIdentity.close(); });
    window.netlifyIdentity.on('logout', function(){ buildBar(false); });
    window.netlifyIdentity.init();
  });
})();
