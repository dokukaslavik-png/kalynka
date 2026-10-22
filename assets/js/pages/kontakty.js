/* Контакти: карта за кліком і форма зворотного звʼязку (Web3Forms) */
(function(){
  // карта завантажується лише після натискання (без сторонніх cookie до згоди)
  var ml=document.getElementById('mapLoad');
  if(ml) ml.addEventListener('click',function(){
    var fr=document.createElement('iframe');
    fr.title='Карта — ЗДО №45 «Калинка»'; fr.loading='lazy'; fr.referrerPolicy='no-referrer-when-downgrade'; fr.src=ml.getAttribute('data-src');
    ml.replaceWith(fr);
  });
  // форма: Web3Forms (ключ у налаштуваннях сайту), якщо ключа нема — лист через поштову програму
  var f=document.getElementById('cform'), ok=document.getElementById('cok'), err=document.getElementById('cerr');
  var KEY='', EMAIL='dnz45.edu.vn.ua@gmail.com';
  fetch('/content/settings.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).then(function(d){ if(d){ KEY=d.formKey||''; if(d.email) EMAIL=d.email; } }).catch(function(){});
  // вміст листа, який приходить на пошту закладу (поля показуються в листі в цьому порядку)
  function letter(nm, ph, ms){
    var isMail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ph);
    var when=new Date().toLocaleString('uk-UA',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
    var data={
      access_key: KEY,
      subject: '✉️ Нове повідомлення з сайту «Калинка» — '+nm,
      from_name: 'Сайт ЗДО №45 «Калинка»',
      '👤 Імʼя': nm,
      '📞 Як звʼязатися': ph,
      '💬 Повідомлення': ms,
      '🕒 Надіслано': when,
      '🌐 Сайт': 'dnz45.vn.ua — сторінка «Контакти»',
      '↩️ Як відповісти': isMail ? 'натисніть «Відповісти» в пошті — лист піде батькам' : 'зателефонуйте або напишіть за вказаним номером'
    };
    if(isMail) data.replyto=ph;      // «Відповісти» в Gmail одразу пише батькам
    return data;
  }

  f.addEventListener('submit',function(e){
    e.preventDefault();
    err.style.display='none'; ok.style.display='none';
    var nm=f.querySelector('#nm').value.trim(), ph=f.querySelector('#ph').value.trim(), ms=f.querySelector('#ms').value.trim();
    if(!nm||!ph||!ms){ err.textContent='Будь ласка, заповніть усі поля.'; err.style.display='block'; return; }
    if(!document.getElementById('cagree').checked){ err.textContent='Будь ласка, підтвердьте згоду на обробку персональних даних.'; err.style.display='block'; return; }
    if(f.querySelector('[name=botcheck]').value) return;
    if(!KEY){
      location.href='mailto:'+EMAIL+'?subject='+encodeURIComponent('Повідомлення з сайту від '+nm)+'&body='+encodeURIComponent(ms+'\n\n'+nm+'\n'+ph);
      return;
    }
    var btn=f.querySelector('button[type=submit]'); if(btn){btn.disabled=true; btn.textContent='Надсилаємо…';}
    fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(letter(nm, ph, ms))})
      .then(function(r){ return r.json().then(function(j){ if(!r.ok||!j.success) throw new Error('bad'); }); })
      .then(function(){ ok.style.display='block'; f.reset(); })
      .catch(function(){ err.textContent='Не вдалося відправити. Зателефонуйте нам, будь ласка: (0432) 56-10-75.'; err.style.display='block'; })
      .then(function(){ if(btn){btn.disabled=false; btn.textContent='Надіслати повідомлення';} });
  });
})();
