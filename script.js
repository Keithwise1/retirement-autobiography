/* script.js
   - Slide navigation + autoplay
   - Creeping papers animation (only on celebration slide)
   - Light confetti on welcome slide
   - Music toggle (works around autoplay restrictions)
   - QR Code generation (if QRCode lib is loaded)
*/

document.addEventListener('DOMContentLoaded', () => {
  /* ================
     Configuration
     ================ */
  const SLIDE_TIME = 10000; // ms per slide
  let slides = Array.from(document.querySelectorAll('.slide'));
  let idx = 0;
  let timer = null;
  const total = slides.length;

  // Controls & UI elements
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressEl = document.getElementById('progress');
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bg-music');
  const slideshowEl = document.querySelector('.slideshow');
  const controlsEl = document.querySelector('.controls');
  const qrcodeContainer = document.getElementById('qrcode');

  /* ================
     Utility helpers
     ================ */
  function clamp(n) {
    if (n < 0) return (n % total) + total;
    return n % total;
  }

  function updateProgress() {
    if (progressEl) progressEl.textContent = `${idx + 1} / ${total}`;
  }

  function announceSlide() {
    if (!slideshowEl) return;
    const title = slides[idx]?.dataset?.title || `Slide ${idx + 1}`;
    slideshowEl.setAttribute('aria-label', `Showing ${title}`);
  }

  /* ================
     Slideshow functions
     ================ */
  function showSlide(n) {
    n = clamp(n);
    slides.forEach((s, i) => s.classList.toggle('active', i === n));
    idx = n;
    updateProgress();
    announceSlide();
    handlePapersForActiveSlide();
    handleConfettiForActiveSlide();
  }

  function nextSlide() { showSlide(idx + 1); }
  function prevSlide() { showSlide(idx - 1); }

  function startTimer() {
    stopTimer();
    timer = setInterval(() => nextSlide(), SLIDE_TIME);
  }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function restartTimer() { stopTimer(); startTimer(); }

  /* ================
     Event listeners
     ================ */
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); restartTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); restartTimer(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { nextSlide(); restartTimer(); }
    if (e.key === 'ArrowLeft') { prevSlide(); restartTimer(); }
  });

  [slideshowEl, controlsEl].forEach(el => {
    if (!el) return;
    el.addEventListener('mouseenter', stopTimer);
    el.addEventListener('mouseleave', startTimer);
  });

  document.querySelectorAll('.photo, .slide img').forEach(img => {
    img.addEventListener('mousedown', stopTimer);
    img.addEventListener('mouseup', startTimer);
    img.addEventListener('touchstart', stopTimer, { passive: true });
    img.addEventListener('touchend', startTimer, { passive: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTimer(); else startTimer();
  });

  /* ================
     Music Playlist Handling
     ================ */
  const playlist = [
    { src: "assets/music/jesus_iye.mp3", duration: 26000 }, // play only 15 sec
    { src: "assets/music/background.mp3" } // play full song
  ];
  let currentTrack = 0;
  let trackTimeout = null;

  function playTrack(index) {
    if (!bgMusic || index >= playlist.length) return;
    currentTrack = index;
    bgMusic.src = playlist[index].src;
    bgMusic.play().catch(() => {
      console.log('Music blocked until user interacts.');
    });

    // If a duration limit is specified (e.g., first 15s of first song)
    if (playlist[index].duration) {
      clearTimeout(trackTimeout);
      trackTimeout = setTimeout(() => {
        bgMusic.pause();
        playTrack(index + 1); // move to next track
      }, playlist[index].duration);
    }
  }

  function tryPlayMusic() {
    playTrack(currentTrack);
  }

  if (musicToggle && bgMusic) {
    musicToggle.addEventListener('change', (e) => {
      if (e.target.checked) tryPlayMusic();
      else bgMusic.pause();
    });

    function enableMusicAfterInteraction() {
      if (musicToggle.checked) tryPlayMusic();
      document.removeEventListener('click', enableMusicAfterInteraction);
      document.removeEventListener('keydown', enableMusicAfterInteraction);
      document.removeEventListener('touchstart', enableMusicAfterInteraction);
    }

    document.addEventListener('click', enableMusicAfterInteraction, { once: true });
    document.addEventListener('keydown', enableMusicAfterInteraction, { once: true });
    document.addEventListener('touchstart', enableMusicAfterInteraction, { once: true });
  }

  /* ================
     Creeping papers
     ================ */
  let papersInterval = null;
  function spawnPaper(container) {
    if (!container) return;
    const p = document.createElement('div');
    p.className = 'paper';
    const left = Math.random() * Math.max(0, container.clientWidth - 30);
    const size = 8 + Math.random() * 22;
    p.style.left = `${left}px`;
    p.style.width = `${size}px`;
    p.style.height = `${Math.max(10, size * 1.2)}px`;
    p.style.top = `${-50 - Math.random() * 200}px`;
    p.style.animationDuration = `${3 + Math.random() * 4}s`;
    container.appendChild(p);
    setTimeout(() => p.remove(), 9000);
  }

  function handlePapersForActiveSlide() {
    document.querySelectorAll('#papers .paper').forEach(n => n.remove());
    if (papersInterval) { clearInterval(papersInterval); papersInterval = null; }

    const activeSlide = slides[idx];
    const papersContainer = activeSlide ? activeSlide.querySelector('#papers') : null;
    if (papersContainer) {
      spawnPaper(papersContainer);
      papersInterval = setInterval(() => {
        const n = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) setTimeout(() => spawnPaper(papersContainer), Math.random() * 600);
      }, 700);
    }
  }

  /* ================
     Confetti Effect
     ================ */
  let confettiInterval = null;
  function spawnConfetti() {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = `${Math.random() * window.innerWidth}px`;
    c.style.width = `${6 + Math.random() * 12}px`;
    c.style.height = c.style.width;
    c.style.animationDuration = `${2 + Math.random() * 3}s`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 6000);
  }

  function handleConfettiForActiveSlide() {
    if (confettiInterval) { clearInterval(confettiInterval); confettiInterval = null; }
    if (idx === 0) {
      spawnConfetti();
      confettiInterval = setInterval(spawnConfetti, 350);
    }
  }

  /* ================
     QR code
     ================ */
  if (qrcodeContainer && typeof QRCode !== 'undefined') {
    new QRCode(qrcodeContainer, {
      text: window.location.href,
      width: 128,
      height: 128,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  /* ================
     Init
     ================ */
  if (total === 0) {
    console.warn('No slides found (.slide elements).');
    return;
  }

  showSlide(0);
  startTimer();

  window.retirementSlideshow = {
    next: nextSlide,
    prev: prevSlide,
    goto: (n) => showSlide(n),
    start: startTimer,
    stop: stopTimer
  };
});
