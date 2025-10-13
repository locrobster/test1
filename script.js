// ===========================
// LocRobster Lightbox + Gallery Script
// - Supports data-images on .thumb
// - Adds "featured" group (art1–art3)
// - Swiper zoom enabled
// - Swipe up/down to close
// ===========================

// ---------------------------
// IMAGE GROUPS (optional mapping by data-group)

// ---------------------------
// IMAGE GROUPS (optional mapping by data-group)
// ---------------------------
const GROUPS = {
  robbie1: [
    "images/fullsize/robbie/RobbieSmall1_web.jpg",
    "images/fullsize/robbie/RobbieSmall2_web.jpg"
  ],
  robbie2: [
    "images/fullsize/robbie/RobbieSmall3_web.jpg",
    "images/fullsize/robbie/RobbieSmall4_web.jpg",
    "images/fullsize/robbie/RobbieSmall5_web.jpg",
    "images/fullsize/robbie/RobbieSmall6_web.jpg"
  ],
  robbie3: [
    "images/fullsize/robbie/RobbieSmall7_web.jpg",
    "images/fullsize/robbie/RobbieSmall8_web.jpg"
  ],
  parker1: [
    "images/fullsize/parker/ParkerSmall1_web.jpg",
    "images/fullsize/parker/ParkerSmall2_web.jpg",
    "images/fullsize/parker/ParkerSmall3_web.jpg",
    "images/fullsize/parker/ParkerSmall4_web.jpg",
    "images/fullsize/parker/ParkerSmall5_web.jpg"
  ],

  // Featured 3x1 row (Art 1–3 only)
  featured: [
    "images/fullsize/art/art1.jpg",
    "images/fullsize/art/art2.jpg",
    "images/fullsize/art/art3.jpg",
    "images/fullsize/art/art4.jpg"
  ],

  // Full art gallery (Art 1–15)
  art: Array.from({ length: 15 }, (_, i) => `images/fullsize/art/art${i + 1}.jpg`)
};


// ---------------------------
const lightbox = document.getElementById("lightbox");
const closeBtn = document.querySelector(".close-btn");
const swiperWrapper = document.querySelector(".swiper-wrapper");
let swiper;

// Utility: get images for a clicked thumb
function resolveImagesForThumb(thumbEl) {
  // 1) data-images attribute wins (pipe-separated)
  if (thumbEl.dataset && thumbEl.dataset.images) {
    return thumbEl.dataset.images.split("|").map(s => s.trim()).filter(Boolean);
  }
  // 2) data-group mapping
  if (thumbEl.dataset && thumbEl.dataset.group && GROUPS[thumbEl.dataset.group]) {
    return GROUPS[thumbEl.dataset.group];
  }
  // 3) fallback: use the <img src> of the thumb (if any)
  const img = thumbEl.querySelector("img");
  if (img && img.getAttribute("src")) {
    return [img.getAttribute("src")];
  }
  return [];
}

// Build slides with zoom container
function buildSlides(imageList) {
  swiperWrapper.innerHTML = "";
  imageList.forEach(src => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    const zoomContainer = document.createElement("div");
    zoomContainer.className = "swiper-zoom-container";

    const img = document.createElement("img");
    img.src = src;
    img.alt = "";

    zoomContainer.appendChild(img);
    slide.appendChild(zoomContainer);
    swiperWrapper.appendChild(slide);
  });
}

// Open Lightbox for a specific image array
function openLightbox(images) {
  if (!images || !images.length) return;

 buildSlides(images);

  // Make sure fade-in animations trigger correctly
  lightbox.style.display = "flex";
  lightbox.style.pointerEvents = "auto";

  // If we're opening a single image, mark the lightbox so we can hide navigation UI
  const single = images.length === 1;
  lightbox.classList.toggle('single-image', single);

  setTimeout(() => {
    lightbox.classList.add("active");
  }, 50); // 50ms delay lets the browser register the initial "opacity: 0" state

  // Reinitialize Swiper
  if (swiper) swiper.destroy(true, true);
  swiper = new Swiper(".swiper", {
    slidesPerView: 1,
    centeredSlides: true,
    spaceBetween: 10,
    allowTouchMove: false,
    simulateTouch: false,
    loop: !single,
    zoom: true,
    navigation: single ? false : {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    },
    keyboard: { enabled: true },
    observer: true,
    observeParents: true,
    on: {
      touchStart(sw, e) {
        sw._startY = e.touches ? e.touches[0].clientY : e.clientY;
      },
      touchEnd(sw, e) {
        const endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        const distance = (sw._startY ?? endY) - endY;
        // swipe up or down beyond threshold closes
        if (Math.abs(distance) > 120) {
          closeLightbox();
        }
      }
    }
  });
}

// Close Lightbox
function closeLightbox() {
  lightbox.classList.remove("active");
  lightbox.style.pointerEvents = "none";
  // Match CSS transition (0.3s)
  setTimeout(() => {
    if (swiper) {
      swiper.destroy(true, true);
      swiper = null;
    }
    lightbox.style.display = "none";
    lightbox.style.pointerEvents = "auto";
    swiperWrapper.innerHTML = "";
  }, 300);
}

// ---------------------------
// EVENT HANDLERS
// ---------------------------

// Thumbnail → open lightbox for that group/images
// Attach click handlers to thumbs except contact-grid and any thumbs explicitly marked
// with .no-lightbox (used for merch or decorative thumbnails).
document.querySelectorAll('.thumb:not(.contact-grid .thumb):not(.no-lightbox)').forEach(thumb => {
  thumb.addEventListener("click", e => {
    e.preventDefault();
    // If this thumb lives in the featured container, open only its full-size image
    if (thumb.closest && thumb.closest('.index-featured-gallery')) {
      const img = thumb.querySelector('img');
      if (img && img.getAttribute('src')) {
        let thumbSrc = img.getAttribute('src');
        // Derive fullsize path from thumbnail path
        let full = thumbSrc.replace('images/thumbnails/', 'images/fullsize/');
        // Handle optional _thumb -> _web naming convention
        full = full.replace('_thumb', '_web');
        openLightbox([full]);
        return;
      }
    }

    const images = resolveImagesForThumb(thumb);
    if (images.length) openLightbox(images);
  });
});

// Special case: thumbs marked .no-lightbox should still open a single full-size image
// (used by the merch section). Derive full-size URL from thumbnail src when possible.
document.querySelectorAll('.thumb.no-lightbox').forEach(thumb => {
  thumb.addEventListener('click', e => {
    e.preventDefault();
    const imgEl = thumb.querySelector('img');
    if (!imgEl) return;
    const thumbSrc = imgEl.getAttribute('src') || '';

    // Try to derive full-size path from thumbnail path:
    // images/thumbnails/{folder}/{name}_thumb.jpg -> images/fullsize/{folder}/{name}_web.jpg
    let full = thumbSrc
      .replace('images/thumbnails/', 'images/fullsize/')
      .replace('_thumb', '_web');

    // Fallback: if derivation looks wrong, fall back to the image src itself
    if (!full.match(/images\/fullsize\//)) {
      full = thumbSrc;
    }

    openLightbox([full]);
  });
});

// Close Lightbox via X or Escape
if (closeBtn) {
  closeBtn.addEventListener("click", closeLightbox);
}
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeLightbox();
});

// Fallback mobile swipe-to-close on overlay (not just slide gesture)
(function attachOverlaySwipeClose() {
  let startY = 0;
  if (!lightbox) return;
  lightbox.addEventListener("touchstart", e => {
    startY = e.touches[0].clientY;
  }, { passive: true });
  lightbox.addEventListener("touchend", e => {
    const endY = e.changedTouches[0].clientY;
    if (Math.abs(startY - endY) > 140) closeLightbox();
  }, { passive: true });
})();

// ---------------------------
// INITIALIZE LUCIDE ICONS
// ---------------------------
if (window.lucide && typeof window.lucide.createIcons === "function") {
  window.lucide.createIcons();
}

// === Auto Gallery Builder: ART folder ===
const galleryContainer = document.querySelector(".gallery-grid-full");

if (galleryContainer) {
  const folder = "art";
  const maxImages = 50; // supports up to 50 artworks

  function loadArtGallery() {
    for (let i = 1; i <= maxImages; i++) {
      const thumbPath = `images/thumbnails/${folder}/${folder}${i}.jpg`;
      const fullPath = `images/fullsize/${folder}/${folder}${i}.jpg`;

      fetch(thumbPath, { method: "HEAD" })
        .then(res => {
          if (res.ok) {
            // Create frosted thumbnail wrapper
            const thumbDiv = document.createElement("div");
            thumbDiv.classList.add("thumb");

            const img = document.createElement("img");
            img.src = thumbPath;
            img.alt = `${folder} ${i}`;

            thumbDiv.appendChild(img);
            galleryContainer.appendChild(thumbDiv);

            // Clicking opens full-size image in lightbox
            thumbDiv.addEventListener("click", () => openLightbox([fullPath]));
          }
        })
        .catch(() => {});
    }
  }

  window.addEventListener("DOMContentLoaded", loadArtGallery);
}
// --- Restore normal link behavior for Contact page ---
document.querySelectorAll('.contact-grid a.thumb').forEach(link => {
  link.addEventListener('click', e => e.stopPropagation());
});

// === RANDOM 2×2 GALLERY ON INDEX PAGE (remember for 24 hours) ===
document.addEventListener("DOMContentLoaded", () => {
  const miniGrid = document.querySelector(".gallery-grid-mini");
  if (!miniGrid) return; // only run on index page

  const totalImages = 15; // adjust if you add more art files
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  // Try to load stored data
  let storedData = localStorage.getItem("randomArts");
  let storedTime = localStorage.getItem("randomArtsTime");
  let selected = storedData ? JSON.parse(storedData) : [];

  // Reset if older than 24h or missing
  if (!storedTime || now - parseInt(storedTime, 10) > oneDay || !selected.length) {
    const indices = [];
    while (indices.length < 4) {
      const r = Math.floor(Math.random() * totalImages) + 1;
      if (!indices.includes(r)) indices.push(r);
    }
    selected = indices;
    localStorage.setItem("randomArts", JSON.stringify(indices));
    localStorage.setItem("randomArtsTime", now.toString());
  }

  // Build thumbnails dynamically
  selected.forEach(i => {
    const thumbPath = `images/thumbnails/art/art${i}.jpg`;
    const fullPath = `images/fullsize/art/art${i}.jpg`;

    const thumbDiv = document.createElement("div");
    thumbDiv.classList.add("thumb");

    const img = document.createElement("img");
    img.src = thumbPath;
    img.alt = `art${i}`;
    thumbDiv.appendChild(img);
    miniGrid.appendChild(thumbDiv);

    thumbDiv.addEventListener("click", () => openLightbox([fullPath]));
  });
});
