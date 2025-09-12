/* script.js
   - Controls slide timing, prev/next controls
   - Creates creeping papers animation
   - Pauses on hover / when interacting with galleries
*/

const SLIDE_TIME = 10000; // milliseconds per slide (adjust as needed)
let slides = Array.from(document.querySelectorAll('.slide'));
let idx = 0;
let timer = null;
const total = slides.length;

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progress = document.getElementById('progress');
const musicToggle = document.getElementById('musicToggle');
const papersEl = document.getElementById('papers');

function showSlide(n) {
  slides.forEach((s, i) => s.classList.toggle('active', i === n));
  idx = n;
  updateProgress();
}
function nextSlide() { showSlide((idx + 1) % total); }
function prevSlide() { showSlide((idx - 1 + total) % total); }
function updateProgress() { progress.textContent = `${idx + 1} / ${total}`; }

/* Auto-advance logic */
function startTimer() {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    nextSlide();
  }, SLIDE_TIME);
}
function stopTimer() { if (timer) clearInterval(timer); }

/* Controls */
prevBtn.addEventListener('click', () => { prevSlide(); resetTimer(); });
nextBtn.addEventListener('click', () => { nextSlide(); resetTimer(); });

function resetTimer(){ stopTimer(); startTimer(); }

/* Pause auto-advance when user hovers slides or interacts */
document.querySelectorAll('.slideshow, .controls').forEach(el => {
  el.addEventListener('mouseenter', stopTimer);
  el.addEventListener('mouseleave', startTimer);
});

/* Pause when touching images on mobile */
document.querySelectorAll('img').forEach(img=>{
  img.addEventListener('touchstart', stopTimer);
  img.addEventListener('touchend', startTimer);
});

/* Keyboard navigation */
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { nextSlide(); resetTimer(); }
  if (e.key === 'ArrowLeft') { prevSlide(); resetTimer(); }
});

/* Initial start */
showSlide(0);
startTimer();

/* Creeping papers effect */
function spawnPaper() {
  const p = document.createElement('div');
  p.className = 'paper';
  const left = Math.random() * window.innerWidth;
  const size = 8 + Math.random() * 22;
  p.style.left = left + 'px';
  p.style.width = size + 'px';
  p.style.height = Math.max(10, size * 1.2) + 'px';
  p.style.background = `linear-gradient(180deg, rgba(255,215,0,0.95), rgba(255,255,255,0.95))`;
  p.style.animationDuration = (3 + Math.random() * 4) + 's';
  p.style.top = (-50 - Math.random() * 200) + 'px';
  papersEl.appendChild(p);
  setTimeout(()=> p.remove(), 8000);
}
/* spawn frequently while the "Celebration" slide is active */
setInterval(()=>{
  // Only spawn when that particular slide is visible (slide index 1)
  if (idx === 1) {
    // spawn multiple papers occasionally
    for (let i=0;i<2;i++){ setTimeout(spawnPaper, Math.random()*600); }
  }
}, 700);

/* Optional: background music toggle (place audio file in assets/audio/background-music.mp3) */
let audio = null;
if (document.querySelector('#musicToggle')) {
  musicToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      if (!audio) {
        audio = new Audio('assets/audio/background-music.mp3');
        audio.loop = true;
      }
      audio.play().catch(()=>{/* playback may be restricted until user interacts with page */});
    } else {
      if (audio) audio.pause();
    }
  });
}

/* Accessibility: announce slide title for screen readers on slide change */
const live = document.querySelector('main.slideshow');
function announceSlide() {
  const title = slides[idx].dataset.title || `Slide ${idx+1}`;
  live.setAttribute('aria-label', `Showing ${title}`);
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) startTimer(); else stopTimer();
});
setInterval(announceSlide, 500);
announceSlide();

/* Helpful: pause autoplay when user long-presses image (mobile) */
document.querySelectorAll('.slide img').forEach(img => {
  img.addEventListener('mousedown', stopTimer);
  img.addEventListener('mouseup', startTimer);
});

// QR Code JS
var qrcode = new QRCode(document.getElementById("qrcode"), {
	text: "http://jindo.dev.naver.com/collie",
	width: 128,
	height: 128,
	colorDark : "#000000",
	colorLight : "#ffffff",
	correctLevel : QRCode.CorrectLevel.H
});