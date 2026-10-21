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
    ['prozorist.html','prozorist','Прозорість'],
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
    var emo=roleEmoji(m.role);
    var pe = m.photo
      ? '<div class="pphoto"><button type="button" class="pzoom" data-full="'+esc(m.photo)+'" data-cap="'+esc((m.role?m.role+' — ':'')+(m.name||''))+'" aria-label="Збільшити фото"><img src="'+esc(m.photo)+'" alt="'+esc(m.name)+'" loading="lazy"></button><span class="pbadge" aria-hidden="true">'+emo+'</span></div>'
      : '<div class="pphoto noimg"><span class="pbig" aria-hidden="true">'+emo+'</span></div>';
    var credo = String(m.credo||'').trim().replace(/^[«"„,]+|[»"“]+$/g,'');
    return '<div class="pcard person center '+(cls||'')+'">'+pe+
      '<div class="prole">'+esc(m.role)+'</div>'+
      '<h3>'+esc(m.name)+'</h3>'+
      (m.info?'<div class="pmeta">'+esc(m.info)+'</div>':'')+
      (credo?'<div class="pcredo">«'+esc(credo)+'»</div>':'')+
    '</div>';
  };

  // ── перегляд фото на весь екран (картки людей, фото розділів); стрілки — якщо фото кілька (data-set) ──
  document.addEventListener('click', function(e){
    var b=e.target.closest && e.target.closest('.pzoom'); if(!b) return;
    e.preventDefault();
    var set=b.getAttribute('data-set');
    var list=set ? Array.prototype.slice.call(document.querySelectorAll('.pzoom[data-set="'+set+'"]')) : [b];
    var idx=Math.max(0,list.indexOf(b));
    var bg=document.createElement('div'); bg.className='k-lb';
    var multi=list.length>1;
    bg.innerHTML='<figure><img alt=""><figcaption></figcaption></figure><button type="button" class="k-lb-x" aria-label="Закрити">✕</button>'+
      (multi?'<button type="button" class="k-lb-nav prev" aria-label="Попереднє">‹</button><button type="button" class="k-lb-nav next" aria-label="Наступне">›</button>':'');
    var img=bg.querySelector('img'), cap=bg.querySelector('figcaption');
    function show(i){ idx=(i+list.length)%list.length; var it=list[idx]; img.src=it.getAttribute('data-full'); cap.textContent=(it.getAttribute('data-cap')||'')+(multi?'  ·  '+(idx+1)+' / '+list.length:''); }
    function close(){ bg.remove(); document.removeEventListener('keydown',onKey); }
    function onKey(ev){ if(ev.key==='Escape') close(); else if(multi&&ev.key==='ArrowRight') show(idx+1); else if(multi&&ev.key==='ArrowLeft') show(idx-1); }
    bg.addEventListener('click', function(ev){
      if(ev.target.classList.contains('prev')){ show(idx-1); return; }
      if(ev.target.classList.contains('next')){ show(idx+1); return; }
      if(ev.target.tagName!=='IMG') close();
    });
    document.addEventListener('keydown',onKey);
    show(idx);
    document.body.appendChild(bg);
  });

  // ── ФОТО ТА ДОКУМЕНТИ: картки, вікно перегляду, блок на сторінці ──
  function kExt(u){ var m=String(u||'').toLowerCase().split(/[?#]/)[0].match(/\.([a-z0-9]+)$/); return m?m[1]:''; }
  function kDocIcon(u){ var e=kExt(u); if(e==='pdf')return '📕'; if(/^(doc|docx|odt|rtf|txt)$/.test(e))return '📘'; if(/^(xls|xlsx|ods)$/.test(e))return '📗'; if(/^(ppt|pptx|odp)$/.test(e))return '📙'; if(/^(jpg|jpeg|png|webp|gif)$/.test(e))return '🖼️'; return '🔗'; }
  function kMedia(x){ x=x||{}; return { ph:(x.photos||[]).filter(Boolean), dc:(x.docs||[]).filter(function(d){return d&&(d.file||d.link);}) }; }
  function kPlural(n,a,b,c){ var m10=n%10,m100=n%100; return (m10===1&&m100!==11)?a:((m10>=2&&m10<=4&&(m100<10||m100>=20))?b:c); }
  var KD={}, kSet=0;
  window.kalynkaMediaHtml = function(x, title){
    var m=kMedia(x), set='ks'+(++kSet), cap=esc(title||x&&x.title||'');
    return (m.ph.length?'<h3 class="k-sub">📷 Фото <span>'+m.ph.length+'</span></h3><div class="k-photos">'+m.ph.map(function(src){
        return '<button type="button" class="pzoom" data-set="'+set+'" data-full="'+esc(src)+'" data-cap="'+cap+'"><img src="'+esc(src)+'" alt="" loading="lazy"></button>';
      }).join('')+'</div>':'')+
      (m.dc.length?'<h3 class="k-sub">📄 Документи <span>'+m.dc.length+'</span></h3><div class="k-docs">'+m.dc.map(function(d){
        var u=d.file||d.link, e=kExt(u);
        return '<a class="k-doc" href="'+esc(u)+'" target="_blank" rel="noopener"><span class="di">'+kDocIcon(u)+'</span><span class="dt">'+esc(d.title||'Документ')+'</span><span class="dk">'+(e&&d.file?e.toUpperCase():'Посилання')+'</span><span class="dg">Відкрити →</span></a>';
      }).join('')+'</div>':'');
  };
  // мітки «📷 5 фото · 📄 2 документи» + кнопка «Переглянути» (у картці)
  window.kalynkaCardMeta = function(key, i, x){
    var m=kMedia(x); if(!m.ph.length&&!m.dc.length) return '';
    KD[key+':'+i]=x;
    return '<div class="k-meta">'+(m.ph.length?'<span>📷 '+m.ph.length+' фото</span>':'')+(m.dc.length?'<span>📄 '+m.dc.length+' '+kPlural(m.dc.length,'документ','документи','документів')+'</span>':'')+'</div>'+
      '<button type="button" class="k-more" data-kd="'+esc(key+':'+i)+'">Переглянути →</button>';
  };
  // обкладинка картки з першого фото
  window.kalynkaCover = function(x){ var m=kMedia(x); return m.ph.length?'<div class="k-cover"><img src="'+esc(m.ph[0])+'" alt="" loading="lazy"></div>':''; };
  window.kalynkaOpenDetail = function(x){
    if(!x) return;
    var R=window.kalynkaRich||esc;
    var title=x.title||x.day||'';
    var bg=document.createElement('div'); bg.className='k-dbg';
    bg.innerHTML='<div class="k-sheet" role="dialog" aria-modal="true"><div class="k-head"><span class="k-ico">'+esc(x.icon||x.emoji||'📌')+'</span><h2>'+esc(title)+'</h2><button type="button" class="k-x" aria-label="Закрити">✕</button></div>'+
      '<div class="k-body">'+(x.date?'<div class="k-date">'+esc(x.date)+'</div>':'')+((x.text||x.desc)?'<div class="rtx k-text">'+R(x.text||x.desc)+'</div>':'')+window.kalynkaMediaHtml(x,title)+'</div></div>';
    function close(){ bg.remove(); document.body.style.overflow=''; document.removeEventListener('keydown',onKey); }
    function onKey(e){ if(e.key==='Escape' && !document.querySelector('.k-lb')) close(); }
    bg.addEventListener('click',function(e){ if(e.target===bg||e.target.classList.contains('k-x')) close(); });
    document.addEventListener('keydown',onKey);
    document.body.appendChild(bg); document.body.style.overflow='hidden';
  };
  document.addEventListener('click', function(e){
    var b=e.target.closest && e.target.closest('.k-more'); if(!b) return;
    e.preventDefault(); window.kalynkaOpenDetail(KD[b.getAttribute('data-kd')]);
  });
  // блок «Фото та документи» внизу сторінки (якщо додані до самої сторінки)
  var PAGE_FILE={pro:'about',menu:'menu',rezhym:'rezhym',bezpeka:'bezpeka',vstup:'vstup',pedprostir:'pedprostir',dosyahnennya:'dosyahnennya',korysni:'korysni',prozorist:'prozorist',batkam:'parents',proekty:'projects',osvita:'gurtky',grupy:'groups',novyny:'news',podii:'events',galereya:'gallery'};
  (function(){
    var pg=document.body.getAttribute('data-page'), f=PAGE_FILE[pg]; if(!f) return;
    fetch('content/'+f+'.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
      if(!d) return;
      if(pg==='grupy'){ var g=document.body.getAttribute('data-group'); d=g?d[g]:null; if(!d) return; }
      var m=kMedia(d); if(!m.ph.length&&!m.dc.length) return;
      var main=document.querySelector('main'); if(!main) return;
      var sec=document.createElement('section'); sec.className='k-attach';
      sec.innerHTML='<div class="wrap"><h2 class="k-attach-h">📎 Фото та документи</h2><div class="k-attach-box">'+window.kalynkaMediaHtml(d, document.title.split(' — ')[0])+'</div></div>';
      main.appendChild(sec);
    }).catch(function(){});
  })();

  // ── «гарний текст»: абзаци, жирний, курсив, списки, посилання ──
  // Приймає або звичайний текст (абзаци з нових рядків), або HTML з редактора (очищується).
  var RICH_OK={P:'p',BR:'br',STRONG:'strong',B:'strong',EM:'em',I:'em',U:'u',UL:'ul',OL:'ol',LI:'li',A:'a',H3:'h3',H4:'h3',DIV:'p',H1:'h3',H2:'h3',BLOCKQUOTE:'p'};
  var RICH_DROP={SCRIPT:1,STYLE:1,IFRAME:1,OBJECT:1,EMBED:1,TITLE:1,META:1,LINK:1,HEAD:1,SVG:1,MATH:1,TEMPLATE:1,XML:1,'O:P':1};
  var BLOCK={p:1,ul:1,ol:1,h3:1};
  function safeHref(h){ h=String(h||'').trim(); return /^(https?:|mailto:|tel:|\/|#|[a-z0-9_\-]+\.html)/i.test(h)?h:''; }
  function cleanNode(src, dst){
    for(var c=src.firstChild;c;c=c.nextSibling){
      if(c.nodeType===3){ dst.appendChild(document.createTextNode(c.nodeValue.replace(/ /g,' '))); continue; }
      if(c.nodeType!==1) continue;
      var tn=c.tagName.toUpperCase(); if(RICH_DROP[tn]) continue;
      var map=RICH_OK[tn];
      if(!map){ cleanNode(c, dst); continue; }            // невідомий тег — лишаємо лише вміст
      var n=document.createElement(map);
      if(map==='a'){ var h=safeHref(c.getAttribute('href')); if(!h){ cleanNode(c,dst); continue; } n.setAttribute('href',h); if(/^https?:/i.test(h)){ n.setAttribute('target','_blank'); n.setAttribute('rel','noopener'); } }
      if(map!=='br') cleanNode(c, n);
      dst.appendChild(n);
    }
  }
  function tidy(root){
    // прибрати вкладені блоки в <p>, порожні абзаци; обгорнути «голий» текст у <p>
    var out=document.createElement('div'), cur=null;
    function flat(node, into){
      for(var c=node.firstChild;c;){ var nx=c.nextSibling;
        var t=c.nodeType===1?c.tagName.toLowerCase():'';
        if(t==='p'||t==='h3'){
          var hasBlock=false; for(var k=c.firstChild;k;k=k.nextSibling) if(k.nodeType===1&&BLOCK[k.tagName.toLowerCase()]) hasBlock=true;
          if(hasBlock){ flat(c, into); }
          else { cur=null; into.appendChild(c); }
        } else if(t==='ul'||t==='ol'){
          cur=null;
          var lst=document.createElement(t);
          for(var li=c.firstChild;li;){ var nl=li.nextSibling;
            if(li.nodeType===1&&li.tagName.toLowerCase()==='li') lst.appendChild(li);
            else if(li.nodeType===3&&!li.nodeValue.trim()){} else { var w=document.createElement('li'); w.appendChild(li); lst.appendChild(w); }
            li=nl; }
          into.appendChild(lst);
        } else if(t==='li'){ cur=null; var u=document.createElement('ul'); u.appendChild(c); into.appendChild(u); }
        else {
          if(t==='br' && !cur){ c=nx; continue; }
          if(!cur){ if(c.nodeType===3&&!c.nodeValue.trim()){ c=nx; continue; } cur=document.createElement('p'); into.appendChild(cur); }
          cur.appendChild(c);
        }
        c=nx; }
    }
    flat(root, out);
    // прибрати порожні абзаци та <br> на кінцях
    Array.prototype.slice.call(out.querySelectorAll('p,h3,li')).forEach(function(p){
      while(p.lastChild&&p.lastChild.nodeName==='BR') p.removeChild(p.lastChild);
      while(p.firstChild&&p.firstChild.nodeName==='BR') p.removeChild(p.firstChild);
      if(!p.textContent.replace(/\s+/g,'')&&!p.querySelector('img')) p.remove();
    });
    Array.prototype.slice.call(out.querySelectorAll('ul,ol')).forEach(function(l){ if(!l.children.length) l.remove(); });
    return out.innerHTML;
  }
  function richFromHtml(html){
    var doc=new DOMParser().parseFromString('<body>'+String(html)+'</body>','text/html');
    var tmp=document.createElement('div'); cleanNode(doc.body, tmp);
    return tidy(tmp);
  }
  function richFromText(t){
    var lines=String(t).replace(/\r\n?/g,'\n').split('\n'), html='', list=null;
    lines.forEach(function(l){
      var s=l.trim(); if(!s){ if(list){ html+='</'+list+'>'; list=null; } return; }
      var mb=s.match(/^[-•*–—]\s+(.*)$/), mn=s.match(/^\d+[.)]\s+(.*)$/);
      var want=mb?'ul':(mn?'ol':null);
      if(want){ if(list!==want){ if(list) html+='</'+list+'>'; html+='<'+want+'>'; list=want; } html+='<li>'+esc((mb||mn)[1])+'</li>'; }
      else { if(list){ html+='</'+list+'>'; list=null; } html+='<p>'+esc(s)+'</p>'; }
    });
    if(list) html+='</'+list+'>';
    return html;
  }
  var looksHtml=/<\/?(p|br|strong|b|em|i|u|ul|ol|li|a|h[1-4]|div|span)\b[^>]*>/i;
  window.kalynkaRich = function(v){
    if(v==null) return '';
    if(Array.isArray(v)) v=v.join('\n');
    v=String(v); if(!v.trim()) return '';
    return looksHtml.test(v) ? richFromHtml(v) : richFromText(v);
  };
  window.kalynkaRichFromHtml = richFromHtml;
  window.kalynkaRichFromText = richFromText;
  // вставити «гарний текст» у елемент (заголовок-лід, примітка тощо)
  window.kalynkaSetRich = function(elm, v, prefix){
    if(!elm) return;
    var h=window.kalynkaRich(v); if(!h) return;
    elm.classList.add('rtx');
    elm.innerHTML=(prefix?'<span class="rtx-ico" aria-hidden="true">'+prefix+'</span>':'')+'<div class="rtx-body">'+h+'</div>';
    if(prefix) elm.classList.add('has-ico');
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
  es.src = 'edit.js?v=20261021';
  es.defer = true;
  document.body.appendChild(es);
})();
