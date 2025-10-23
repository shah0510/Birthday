/* app.js
  Replace placeholder assets in the arrays below with your real file paths:
  - images used in gallery (images/photo1.jpg etc.)
  - audio files (audio/our-song.mp3, audio/voice1.mp3)
  - envelope media files (video1.mp4, audio2.mp3)
  Also set the magicWord and treasureOpenDate variables.
*/

(() => {
    // ------- CONFIGURE -------
    const magicWord = "meeya"; // change to your secret word
    const treasureOpenDate = new Date("2025-10-23T12:00:00"); // chest auto-opens on this date/time
    // --------------------------
  
    // Simple helpers
    const qs = sel => document.querySelector(sel);
    const qsa = sel => Array.from(document.querySelectorAll(sel));
  
    // Portal
    const portal = qs('#portal');
    const main = qs('#main');
    const enterBtn = qs('#enterBtn');
    const magicInput = qs('#magicInput');
  
    // Overlay modal
    const overlay = qs('#overlay');
    const overlayContent = qs('#overlayContent');
    const overlayClose = qs('#overlayClose');
  
    // Map nodes
    qsa('.mapnode').forEach(node => {
      node.addEventListener('click', () => {
        const target = node.getAttribute('data-target');
        navigateTo(target);
      });
    });
  
    // Top nav
    qsa('.topbar nav button').forEach(btn=>{
      btn.addEventListener('click', ()=> navigateTo(btn.dataset.target));
    });
  
    // Secret dot for bonus room
    const secretDot = qs('#secretDot');
    let secretRevealed = false;
  
    // Magic enter
    function openPortal() {
      const val = magicInput.value.trim().toLowerCase();
      if(val === magicWord.toLowerCase()) {
        portal.classList.remove('active');
        portal.style.display = 'none';
        main.style.display = 'block';
        document.getElementById('map').classList.add('active-page');
        // reveal secret dot slowly
        setTimeout(()=> secretDot.classList.add('revealed'), 700);
      } else {
        magicInput.classList.add('shake');
        setTimeout(()=> magicInput.classList.remove('shake'), 400);
        alert('That is not the magic word—try a different clue!');
      }
    }
  
    enterBtn.addEventListener('click', openPortal);
    magicInput.addEventListener('keydown', e => { if(e.key === 'Enter') openPortal(); });
  
    // Navigation
    function navigateTo(id) {
      qsa('.page').forEach(p => p.classList.remove('active-page'));
      const page = qs('#' + id);
      if(page) page.classList.add('active-page');
      window.scrollTo({top:0,behavior:'smooth'});
    }
  
    // Gallery interactions: show hidden note on click
    qsa('.polaroid').forEach(card=>{
      card.addEventListener('click', ()=> {
        const hidden = card.querySelector('.hidden-note');
        hidden.style.display = (hidden.style.display === 'block') ? 'none' : 'block';
      });
    });
  
    // Sounds: play/pause controls with simple disc animation
    qsa('.playBtn').forEach(btn=>{
      btn.addEventListener('click', ()=> {
        const audioId = btn.dataset.audio;
        const audio = document.getElementById(audioId);
        if(!audio) return;
        // pause all others
        qsa('audio').forEach(a => { if(a !== audio) a.pause(); });
        if(audio.paused){
          audio.play();
          btn.textContent = 'Pause';
          startDiscSpin();
        } else {
          audio.pause();
          btn.textContent = 'Play our song';
          stopDiscSpin();
        }
        audio.onended = ()=> {
          btn.textContent = 'Play our song';
          stopDiscSpin();
        }
      });
    });
    function startDiscSpin(){ qs('#disc').style.animation = 'spin 3s linear infinite'; qs('#needle').style.transform = 'rotate(-10deg)'; }
    function stopDiscSpin(){ qs('#disc').style.animation = 'none'; qs('#needle').style.transform = 'rotate(-30deg)'; }
  
    // Envelopes: open in overlay
    qsa('.envelope').forEach(env=>{
      env.addEventListener('click', ()=>{
        const media = env.dataset.media;
        if(!media) return;
        overlayContent.innerHTML = media.endsWith('.mp4')
          ? `<video id="modalVideo" controls autoplay style="width:100%; max-height:70vh">
          <source src="${media}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        
        `
          : `<audio controls autoplay style="width:100%"><source src="media/${media}">Your browser does not support audio.</audio>`;
        overlay.classList.remove('hidden');
      });
    });
  
    overlayClose.addEventListener('click', ()=> overlay.classList.add('hidden'));
    overlay.addEventListener('click', (e)=> { if(e.target === overlay) overlay.classList.add('hidden'); });
  
    // Quiz logic
    const quizBtns = qsa('.quizBtn');
    let quizScore = 0;
    quizBtns.forEach(b => {
      b.addEventListener('click', ()=> {
        const correct = b.dataset.correct === 'true';
        if(correct){
          quizScore++;
          b.style.background = 'linear-gradient(90deg,#2fd29d,#0bb3b7)';
        } else {
          b.style.opacity = '0.6';
        }
        // disable sibling buttons in same question
        const siblings = Array.from(b.parentElement.querySelectorAll('button'));
        siblings.forEach(s => s.disabled = true);
        // after last question, show result
        const totalQuestions = document.querySelectorAll('.quiz ol li').length;
        const answered = document.querySelectorAll('.quiz ol li button[disabled]').length / (siblings.length || 1);
        // crude check if last answered
        const allAnswered = Array.from(document.querySelectorAll('.quiz ol li')).every(li=>{
          return Array.from(li.querySelectorAll('button')).some(btn => btn.disabled);
        });
        if(allAnswered){
          const result = qs('#quizResult');
          if(quizScore >= 2) {
            result.textContent = `You know me so well! The treasure is now open Score: ${quizScore}/${totalQuestions}`;
            // unlock chest if good score
            unlockTreasure("quiz");
          } else {
            result.textContent = `Cute try! Score: ${quizScore}/${totalQuestions}. You still get a hug.`;
          }
        }
      });
    });
  
    // Starfield generator
    const starCanvas = qs('#starCanvas');
    const ctx = starCanvas.getContext('2d');
    function drawStarfield(seedDate = new Date()) {
      const w = starCanvas.width = Math.min(900, starCanvas.clientWidth*devicePixelRatio);
      const h = starCanvas.height = 420 * devicePixelRatio;
      // clear
      ctx.clearRect(0,0,w,h);
      // background gradient
      const g = ctx.createLinearGradient(0,0,w,h);
      g.addColorStop(0,'#020427'); g.addColorStop(1,'#041a2f');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,w,h);
  
      // pseudo-random seeded by date string
      let seed = seedDate.toISOString().slice(0,10).split('').reduce((a,c)=>a + c.charCodeAt(0), 0);
      function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  
      // draw many small stars
      for(let i=0;i<180;i++){
        const x = Math.floor(rand() * w);
        const y = Math.floor(rand() * h);
        const r = Math.max(0.3, rand()*1.6);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${0.6*rand()})`;
        ctx.arc(x,y,r,0,Math.PI*2);
        ctx.fill();
      }
      // highlight a few "important" stars forming a small heart constellation
      ctx.fillStyle = '#ffd1e0';
      const cx = w*0.7, cy = h*0.4;
      const heartPts = [
        [cx-40, cy-10],[cx-20, cy-30],[cx, cy-10],[cx+20, cy-30],[cx+40, cy-10],[cx, cy+20]
      ];
      heartPts.forEach(([x,y])=>{
        ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2); ctx.fill();
      });
      // small label
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = `${14 * devicePixelRatio}px Inter, Arial`;
      ctx.fillText('Night we met', cx-50, cy+60);
    }
    drawStarfield(new Date());
  
    qs('#generateStars').addEventListener('click', ()=>{
      const d = qs('#starDate').value;
      if(!d) return alert('Pick a date!');
      drawStarfield(new Date(d));
    });
  
    // Treasure chest logic
    const chest = qs('#chest');
    const treasureContent = qs('#treasureContent');
    const openDateText = qs('#openDateText');
    openDateText.textContent = treasureOpenDate.toLocaleString();
  
    function unlockTreasure(cause){
        if(chest.classList.contains('open')) return;
        chest.classList.remove('closed'); 
        chest.classList.add('open');
        treasureContent.classList.remove('hidden');
        confettiBurst();
      
        // Show secret dot only on Treasure page
        const treasureDot = document.getElementById('treasureSecretDot');
        treasureDot.style.display = 'block';
      
        treasureDot.addEventListener('click', () => {
          overlayContent.innerHTML = `<h2>Bonus Room</h2>
            <p>Surprise! Another hidden video from me 🎁</p>
            <video controls autoplay style="width:100%">
              <source src="videos/video,mp4" type="video/mp4">
            </video>`;
          overlay.classList.remove('hidden');
        });
      }
      
  
    function confettiBurst(){
      for(let i=0;i<40;i++){
        const el = document.createElement('div');
        el.style.position='fixed'; el.style.left = (50 + (Math.random()*40-20)) + '%';
        el.style.top = '10%'; el.style.width='8px'; el.style.height='12px';
        el.style.background = `hsl(${Math.floor(Math.random()*360)},80%,65%)`;
        el.style.opacity = 0.9; el.style.borderRadius='2px';
        el.style.transform = `translateY(0) rotate(${Math.random()*360}deg)`;
        el.style.transition = `transform 1.2s linear, opacity 1.2s linear`;
        document.body.appendChild(el);
        setTimeout(()=> {
          el.style.transform = `translateY(${400 + Math.random()*200}px) rotate(${Math.random()*900}deg)`;
          el.style.opacity = 0;
        }, 20);
        setTimeout(()=> el.remove(), 1500);
      }
    }
  
    // Secret dot reveals bonus room overlay
    secretDot.addEventListener('click', ()=> {
      if(!secretRevealed){
        secretRevealed = true;
        overlayContent.innerHTML = `<h2>Bonus Room</h2>
          <p>Surprise! A hidden video from me.</p>
          <video controls autoplay style="width:100%"><source src="videos/video.mp4" type="video/mp4"></video>`;
        overlay.classList.remove('hidden');
      }
    });
  
    // small accessibility: keyboard left/right nav
    window.addEventListener('keydown', (e)=>{
      if(e.key === 'ArrowLeft') goPrev();
      if(e.key === 'ArrowRight') goNext();
    });
    function pages(){ return Array.from(document.querySelectorAll('.page')); }
    function currentIndex(){ return pages().findIndex(p => p.classList.contains('active-page')); }
    function goNext(){ const idx = currentIndex()+1; if(idx < pages().length) navigateTo(pages()[idx].id); }
    function goPrev(){ const idx = currentIndex()-1; if(idx >=0) navigateTo(pages()[idx].id); }
  
    // small startup: hide main until portal used
    main.style.display = 'none';
    portal.classList.add('active');
  
    // CSS animations injection for disc spin
    const style = document.createElement('style');
    style.textContent = '@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }';
    document.head.appendChild(style);
  
  })();