const root = document.documentElement;

function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: light)")?.matches ? "light" : "dark";
}

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("theme", theme);
}

function bindThemeToggle() {
  const btn = document.getElementById("themeBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const next = (root.dataset.theme || "dark") === "dark" ? "light" : "dark";
    setTheme(next);
  });
}

function bindShake() {
  const btn = document.getElementById("shakeBtn");
  const card = document.querySelector(".card");
  if (!btn || !card) return;
  btn.addEventListener("click", () => {
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
  });
}

function bindYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function bindTilt() {
  const tilt = document.getElementById("tilt");
  if (!tilt) return;

  const maxDeg = 10;
  const reset = () => {
    tilt.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
  };

  const updateFromPoint = (clientX, clientY) => {
    const r = tilt.getBoundingClientRect();
    const px = (clientX - r.left) / r.width;
    const py = (clientY - r.top) / r.height;
    const dx = (px - 0.5) * 2;
    const dy = (py - 0.5) * 2;
    const ry = clamp(dx * maxDeg, -maxDeg, maxDeg);
    const rx = clamp(-dy * maxDeg, -maxDeg, maxDeg);
    tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  };

  let active = false;

  tilt.addEventListener("pointerenter", () => {
    active = true;
  });
  tilt.addEventListener("pointerleave", () => {
    active = false;
    reset();
  });
  tilt.addEventListener("pointermove", (e) => {
    if (!active) return;
    updateFromPoint(e.clientX, e.clientY);
  });
  tilt.addEventListener("pointerdown", (e) => {
    active = true;
    tilt.setPointerCapture?.(e.pointerId);
    updateFromPoint(e.clientX, e.clientY);
  });
  tilt.addEventListener("pointerup", () => {
    active = false;
    reset();
  });
}

function bindPanelToggles() {
  const btns = document.querySelectorAll("button[data-toggle]");
  btns.forEach((btn) => {
    const targetId = btn.getAttribute("data-toggle");
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;

    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      target.hidden = expanded;
    });
  });
}

function bindLifeGallery() {
  const lifeBtn = document.getElementById("lifeBtn");
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  const dotsWrap = document.getElementById("lightboxDots");
  if (!lifeBtn || !lightbox || !img || !dotsWrap) return;

  const panel = lightbox.querySelector(".lightbox__panel");
  const closeBtn = lightbox.querySelector(".lightbox__close");
  if (!panel || !closeBtn) return;

  const photos = [
    "./assets/life-1.png",
    "./assets/life-2.png",
    "./assets/life-3.png",
    "./assets/life-4.png",
    "./assets/life-5.png",
  ];

  let idx = 0;
  let startX = 0;
  let dragging = false;
  let lastFocused = null;

  const renderDots = () => {
    dotsWrap.innerHTML = "";
    photos.forEach((_, i) => {
      const d = document.createElement("span");
      d.className = "lightbox__dot" + (i === idx ? " isActive" : "");
      d.addEventListener("click", () => setIndex(i, i > idx ? "next" : "prev"));
      dotsWrap.appendChild(d);
    });
  };

  const playAnim = (dir) => {
    img.classList.remove("isNext", "isPrev");
    void img.offsetWidth;
    img.classList.add(dir === "prev" ? "isPrev" : "isNext");
  };

  const setIndex = (next, dir = "next") => {
    idx = (next + photos.length) % photos.length;
    playAnim(dir);
    img.src = photos[idx];
    renderDots();
  };

  const getFocusable = () => {
    const nodes = panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    return Array.from(nodes).filter((el) => el instanceof HTMLElement && !el.hasAttribute("disabled"));
  };

  const trapFocus = (e) => {
    if (e.key !== "Tab") return;
    const list = getFocusable();
    if (list.length === 0) return;
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || active === panel) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const open = () => {
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lightbox.hidden = false;
    document.body.classList.add("modalOpen");
    setIndex(idx);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keydown", trapFocus);
    closeBtn.focus();
  };

  const close = () => {
    lightbox.hidden = true;
    document.body.classList.remove("modalOpen");
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keydown", trapFocus);
    (lastFocused || lifeBtn).focus?.();
  };

  const prev = () => setIndex(idx - 1, "prev");
  const next = () => setIndex(idx + 1, "next");

  const onKeyDown = (e) => {
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  lifeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    open();
  });

  lightbox.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.dataset.close === "true") close();
    if (t.dataset.prev === "true") prev();
    if (t.dataset.next === "true") next();
  });

  const stage = lightbox.querySelector(".lightbox__stage");
  if (!stage) return;

  stage.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    stage.setPointerCapture?.(e.pointerId);
  });
  stage.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    const threshold = 40;
    if (dx > threshold) prev();
    else if (dx < -threshold) next();
  });
  stage.addEventListener("pointercancel", () => {
    dragging = false;
  });
}

function bindToTop() {
  const btn = document.getElementById("toTop");
  if (!btn) return;

  const update = () => {
    btn.hidden = window.scrollY < 500;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function bindEmailModal() {
  const btn = document.getElementById("emailBtn");
  const modal = document.getElementById("emailModal");
  if (!btn || !modal) return;

  const panel = modal.querySelector(".modal__panel");
  const closeBtn = modal.querySelector(".modal__close");
  if (!(panel instanceof HTMLElement) || !(closeBtn instanceof HTMLElement)) return;

  let lastFocused = null;

  const getFocusable = () => {
    const nodes = panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    return Array.from(nodes).filter((el) => el instanceof HTMLElement && !el.hasAttribute("disabled"));
  };

  const trap = (e) => {
    if (e.key !== "Tab") return;
    const list = getFocusable();
    if (list.length === 0) return;
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || active === panel) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onKey = (e) => {
    if (e.key === "Escape") close();
  };

  const open = () => {
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.hidden = false;
    document.body.classList.add("modalOpen");
    document.addEventListener("keydown", onKey);
    document.addEventListener("keydown", trap);
    closeBtn.focus();
  };

  const close = () => {
    modal.hidden = true;
    document.body.classList.remove("modalOpen");
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("keydown", trap);
    (lastFocused || btn).focus?.();
  };

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    open();
  });

  modal.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.dataset.emailClose === "true") close();
  });
}

setTheme(getInitialTheme());
bindThemeToggle();
bindShake();
bindYear();
bindTilt();
bindPanelToggles();
bindLifeGallery();
bindToTop();
bindEmailModal();
