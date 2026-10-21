/* ---------- ГРА 1: ПАМ'ЯТЬ ---------- */
(function(){
  var icons=['🌼','🐝','🍓','🦋','🌈','⭐'];
  var grid=document.getElementById('memGrid'), status=document.getElementById('memStatus');
  var first=null, lock=false, moves=0, matched=0;
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function build(){
    grid.innerHTML=''; first=null; lock=false; moves=0; matched=0; status.textContent='Ходів: 0';
    var deck=shuffle(icons.concat(icons));
    deck.forEach(function(ic){
      var c=document.createElement('div'); c.className='mem-card'; c.dataset.ic=ic; c.textContent=ic;
      c.addEventListener('click',function(){flip(c);});
      grid.appendChild(c);
    });
  }
  function flip(c){
    if(lock||c.classList.contains('flip')||c.classList.contains('done'))return;
    c.classList.add('flip');
    if(!first){first=c;return;}
    moves++; status.textContent='Ходів: '+moves;
    if(first.dataset.ic===c.dataset.ic){
      first.classList.add('done'); c.classList.add('done'); first=null; matched++;
      if(matched===icons.length) status.textContent='🎉 Молодець! Усі пари за '+moves+' ходів!';
    }else{
      lock=true; var a=first, b=c; first=null;
      setTimeout(function(){a.classList.remove('flip'); b.classList.remove('flip'); lock=false;},800);
    }
  }
  document.getElementById('memReset').addEventListener('click',build);
  build();
})();

/* ---------- ГРА 2: ХРЕСТИКИ-НУЛИКИ ---------- */
(function(){
  var P='🌼', C='🍓';
  var grid=document.getElementById('xoGrid'), status=document.getElementById('xoStatus');
  var cells=[], board=[], over=false;
  var wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function build(){
    grid.innerHTML=''; board=Array(9).fill(''); cells=[]; over=false; status.textContent='Твій хід 🌼';
    for(var i=0;i<9;i++){(function(i){
      var c=document.createElement('div'); c.className='xo-cell';
      c.addEventListener('click',function(){play(i);});
      grid.appendChild(c); cells.push(c);
    })(i);}
  }
  function winner(b){for(var i=0;i<wins.length;i++){var w=wins[i];if(b[w[0]]&&b[w[0]]===b[w[1]]&&b[w[1]]===b[w[2]])return b[w[0]];}return b.indexOf('')<0?'draw':null;}
  function play(i){
    if(over||board[i])return;
    board[i]=P; cells[i].textContent=P;
    var r=winner(board);
    if(r){finish(r);return;}
    status.textContent='Комп\'ютер думає…';
    setTimeout(cpu,420);
  }
  function cpu(){
    var i=bestMove();
    if(i>-1){board[i]=C; cells[i].textContent=C;}
    var r=winner(board);
    if(r){finish(r);return;}
    status.textContent='Твій хід 🌼';
  }
  function bestMove(){
    // виграти або заблокувати, інакше центр/кут/будь-що
    for(var s=0;s<2;s++){var mark=s===0?C:P;
      for(var i=0;i<9;i++){if(!board[i]){var t=board.slice();t[i]=mark;if(winner(t)===mark)return i;}}}
    if(!board[4])return 4;
    var order=[0,2,6,8,1,3,5,7];
    for(var k=0;k<order.length;k++)if(!board[order[k]])return order[k];
    return -1;
  }
  function finish(r){
    over=true;
    status.textContent = r==='draw' ? '🤝 Нічия! Спробуй ще.' : (r===P ? '🎉 Ти переміг! Ура!' : '🍓 Цього разу виграла калинка. Ще раз?');
  }
  document.getElementById('xoReset').addEventListener('click',build);
  build();
})();

/* ---------- ГРА 3: РОЗМАЛЮЙ ---------- */
(function(){
  var colors=['#e0364b','#f5c23e','#3c8c57','#5fb3d4','#b394d6','#ff7a8a','#8a5a2b','#ffffff'];
  var sw=document.getElementById('swatches'), svg=document.getElementById('colorSvg');
  var sel=colors[0], defaults=[];
  colors.forEach(function(col,idx){
    var s=document.createElement('div'); s.className='swatch'+(idx===0?' sel':''); s.style.background=col;
    s.addEventListener('click',function(){sel=col;[].forEach.call(sw.children,function(x){x.classList.remove('sel');});s.classList.add('sel');});
    sw.appendChild(s);
  });
  [].forEach.call(svg.querySelectorAll('[data-fill]'),function(el){
    defaults.push([el,el.getAttribute('fill')]);
    el.addEventListener('click',function(){el.setAttribute('fill',sel);});
  });
  document.getElementById('colorReset').addEventListener('click',function(){
    defaults.forEach(function(d){d[0].setAttribute('fill',d[1]);});
  });
})();

/* ---------- ГРА 4: ПАЗЛ (3x3, фото садочка) ---------- */
(function(){
  var board=document.getElementById('puzBoard'), status=document.getElementById('puzStatus');
  var N=3, size=94, gap=3, order=[];
  function pos(idx){ // background-position для правильного шматочка idx (0..8)
    var r=Math.floor(idx/N), c=idx%N;
    return -(c*(size))+'px '+-(r*(size))+'px';
  }
  function render(){
    board.innerHTML='';
    order.forEach(function(val,slot){
      var t=document.createElement('div');
      if(val===8){ t.className='puz-tile empty'; }
      else{
        t.className='puz-tile';
        t.style.backgroundPosition=pos(val);
        t.style.backgroundSize=(N*size)+'px '+(N*size)+'px';
        t.addEventListener('click',function(){move(slot);});
      }
      board.appendChild(t);
    });
  }
  function emptyIdx(){return order.indexOf(8);}
  function canMove(slot){
    var e=emptyIdx();
    var sr=Math.floor(slot/N), sc=slot%N, er=Math.floor(e/N), ec=e%N;
    return (Math.abs(sr-er)+Math.abs(sc-ec))===1;
  }
  function move(slot){
    if(!canMove(slot))return;
    var e=emptyIdx(); order[e]=order[slot]; order[slot]=8; render(); check();
  }
  function check(){
    var ok=order.every(function(v,i){return v===i;});
    status.textContent = ok ? '🎉 Ти зібрав пазл! Чудова робота!' : '';
  }
  function shuffle(){
    order=[0,1,2,3,4,5,6,7,8]; status.textContent='';
    // 60 випадкових легальних ходів — завжди розв'язується
    for(var k=0;k<60;k++){
      var e=emptyIdx(), moves=[];
      for(var s=0;s<9;s++){if(canMove(s))moves.push(s);}
      var pick=moves[Math.floor(Math.random()*moves.length)];
      order[e]=order[pick]; order[pick]=8;
    }
    render();
  }
  document.getElementById('puzShuffle').addEventListener('click',shuffle);
  shuffle();
})();

/* ---------- ГРА 5: ВГАДАЙ ТВАРИНКУ ---------- */
(function(){
  var animals=[['🐶','Собака'],['🐱','Кіт'],['🐭','Мишка'],['🐰','Зайчик'],['🦊','Лисиця'],
    ['🐻','Ведмідь'],['🐼','Панда'],['🦁','Лев'],['🐸','Жаба'],['🐷','Свинка'],
    ['🐔','Курка'],['🐧','Пінгвін'],['🦉','Сова'],['🐝','Бджілка'],['🐴','Конячка'],['🐮','Корівка']];
  var em=document.getElementById('animEmoji'), ans=document.getElementById('animAns'), st=document.getElementById('animStatus');
  var score=0;
  function pick(){return animals[Math.floor(Math.random()*animals.length)];}
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function round(){
    var correct=pick(); em.textContent=correct[0];
    var opts=[correct]; while(opts.length<3){var c=pick(); if(opts.indexOf(c)<0)opts.push(c);}
    shuffle(opts); ans.innerHTML='';
    opts.forEach(function(o){
      var b=document.createElement('button'); b.className='btn btn-ghost'; b.textContent=o[1];
      b.addEventListener('click',function(){
        if(o[1]===correct[1]){b.classList.add('ans-good'); score++; st.textContent='🎉 Правильно! Рахунок: '+score; setTimeout(round,700);}
        else{b.classList.add('ans-bad'); st.textContent='Спробуй ще! Це '+correct[1].toLowerCase()+'.';}
      });
      ans.appendChild(b);
    });
  }
  round();
})();

/* ---------- ГРА 6: ПОРАХУЙ ---------- */
(function(){
  var items=['🍎','🍓','🍌','🌼','🐝','⭐','🐞','🎈'];
  var row=document.getElementById('countRow'), ans=document.getElementById('countAns'), st=document.getElementById('countStatus');
  var score=0;
  function round(){
    var n=Math.floor(Math.random()*8)+2; // 2..9
    var it=items[Math.floor(Math.random()*items.length)];
    row.textContent=new Array(n+1).join(it);
    var opts=[n]; while(opts.length<3){var c=Math.floor(Math.random()*9)+2; if(opts.indexOf(c)<0)opts.push(c);}
    for(var i=opts.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=opts[i];opts[i]=opts[j];opts[j]=t;}
    ans.innerHTML='';
    opts.forEach(function(o){
      var b=document.createElement('button'); b.className='ans-num'; b.textContent=o;
      b.addEventListener('click',function(){
        if(o===n){b.classList.add('ans-good'); score++; st.textContent='🎉 Так! Рахунок: '+score; setTimeout(round,700);}
        else{b.classList.add('ans-bad'); st.textContent='Порахуй ще раз 🙂';}
      });
      ans.appendChild(b);
    });
  }
  round();
})();

/* ---------- ГРА 7: ЛАБІРИНТ ---------- */
(function(){
  // 0=стіна, 1=шлях; старт лівий-верх, ціль правий-низ
  var MAP=[
    [1,1,0,1,1,1,0],
    [0,1,0,1,0,1,0],
    [1,1,1,1,0,1,1],
    [1,0,0,1,0,0,1],
    [1,1,1,1,1,1,1],
    [0,0,1,0,0,1,0],
    [1,1,1,1,1,1,1]
  ];
  var ROWS=MAP.length, COLS=MAP[0].length;
  var start={r:0,c:0}, goal={r:6,c:6};
  var maze=document.getElementById('maze'), st=document.getElementById('mazeStatus');
  var pos={r:0,c:0}, done=false;
  maze.style.gridTemplateColumns='repeat('+COLS+',34px)';
  function render(){
    maze.innerHTML='';
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
      var d=document.createElement('div'); d.className='mz ';
      if(MAP[r][c]===0){d.className+='wall';}
      else if(r===pos.r&&c===pos.c){d.className+='player'; d.textContent='🐰';}
      else if(r===goal.r&&c===goal.c){d.className+='goal'; d.textContent='🥕';}
      else{d.className+='path';}
      maze.appendChild(d);
    }
  }
  function move(dr,dc){
    if(done)return;
    var nr=pos.r+dr, nc=pos.c+dc;
    if(nr<0||nc<0||nr>=ROWS||nc>=COLS)return;
    if(MAP[nr][nc]===0)return;
    pos.r=nr; pos.c=nc; render();
    if(pos.r===goal.r&&pos.c===goal.c){done=true; st.textContent='🎉 Ура! Зайчик знайшов морквинку!';}
  }
  var dirs={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]};
  document.querySelectorAll('.dpad button[data-dir]').forEach(function(b){
    b.addEventListener('click',function(){var d=dirs[b.dataset.dir]; move(d[0],d[1]);});
  });
  document.addEventListener('keydown',function(e){
    var m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];
    if(m){e.preventDefault(); var d=dirs[m]; move(d[0],d[1]);}
  });
  document.getElementById('mazeReset').addEventListener('click',function(){pos={r:start.r,c:start.c}; done=false; st.textContent=''; render();});
  render();
})();

/* ---------- ГРА 8: СПІЙМАЙ МЕТЕЛИКА ---------- */
(function(){
  var area=document.getElementById('catchArea'), sEl=document.getElementById('catchScore'), tEl=document.getElementById('catchTime');
  var btn=document.getElementById('catchStart');
  var bugs=['🦋','🐝','🐞','🌸'], score=0, time=20, spawnT=null, tickT=null, playing=false;
  function spawn(){
    var b=document.createElement('div'); b.className='catch-bug'; b.textContent=bugs[Math.floor(Math.random()*bugs.length)];
    var x=Math.random()*(area.clientWidth-40), y=Math.random()*(area.clientHeight-40);
    b.style.left=x+'px'; b.style.top=y+'px';
    b.addEventListener('click',function(){ if(!playing)return; score++; sEl.textContent=score; b.remove(); });
    area.appendChild(b);
    setTimeout(function(){ if(b.parentNode)b.remove(); },1100);
  }
  function stop(){
    playing=false; clearInterval(spawnT); clearInterval(tickT);
    area.innerHTML='<div class="bfly-done">🎉 Молодець!<br>Ти спіймав '+score+' метеликів!</div>';
    btn.textContent='Зіграти ще';
  }
  function start(){
    if(playing)return;
    playing=true; score=0; time=20; sEl.textContent='0'; tEl.textContent='20'; area.innerHTML=''; btn.textContent='Гра йде…';
    spawnT=setInterval(spawn,650);
    tickT=setInterval(function(){ time--; tEl.textContent=time; if(time<=0)stop(); },1000);
  }
  btn.addEventListener('click',start);
})();
