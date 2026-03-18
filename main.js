// 莫拉迪色系配色
const morandiColors = [
  '#f5ebe0',
  '#e3d5ca',
  '#d5bdaf',
  '#edede9',
  '#d6ccc2',
  '#f5cac3',
  '#e8ddb5',
  '#c9ada7',
  '#b7b7a4',
  '#dde5b6',
];

// 點擊背景切換顏色並產生貓腳印（支援 touch）
function handleInteraction(x, y, target) {
  if (target.closest('a, button, .modal__panel')) return;

  const randomIndex = Math.floor(Math.random() * morandiColors.length);
  document.body.style.backgroundColor = morandiColors[randomIndex];
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', morandiColors[randomIndex]);

  createPawprint(x, y);
}

document.body.addEventListener('click', (e) => {
  handleInteraction(e.clientX, e.clientY, e.target);
});

// touch 支援（避免 iOS 300ms 延遲）
document.body.addEventListener('touchend', (e) => {
  const touch = e.changedTouches[0];
  handleInteraction(touch.clientX, touch.clientY, e.target);
}, { passive: true });

// 產生貓腳印
function createPawprint(x, y) {
  const wrap = document.getElementById('pawprints');
  if (!wrap) return;

  const paw = document.createElement('span');
  paw.className = 'pawprint';
  paw.textContent = '🐾';
  paw.setAttribute('aria-hidden', 'true');

  const offsetX = (Math.random() - 0.5) * 40;
  const offsetY = (Math.random() - 0.5) * 40;
  paw.style.left = (x + offsetX - 13) + 'px';
  paw.style.top = (y + offsetY - 13) + 'px';

  wrap.appendChild(paw);
  setTimeout(() => paw.remove(), 1500);
}




// 自我介紹 → 貓咪 gif
const introBtn = document.getElementById('introBtn');
const catOverlay = document.getElementById('catOverlay');
const catClose = document.getElementById('catClose');
const catBackdrop = document.getElementById('catBackdrop');

introBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  catOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
  catClose.focus();
});

function closeCat() {
  catOverlay.hidden = true;
  document.body.style.overflow = '';
  introBtn.focus();
}

catClose?.addEventListener('click', closeCat);
catBackdrop?.addEventListener('click', closeCat);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !catOverlay.hidden) closeCat();
});
