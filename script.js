// ===========================
// LocRobster Gallery Script
// - PhotoSwipe lightbox integration  
// - Gallery builders for art, robbie, and parker collections
// ===========================

// === Art Gallery Builder ===
(function buildArtGallery(){
  const grid = document.querySelector('.gallery-grid-full, .gallery-grid');
  if(!grid) return;

  // Art images 1-15
  function addArtItem(i){
    const thumbJpg = `images/thumbnails/art/art${i}.jpg`;
    const thumbPng = `images/thumbnails/art/art${i}.png`;
    const fullJpg = `images/fullsize/art/art${i}.jpg`;
    const fullPng = `images/fullsize/art/art${i}.png`;

    function createArtCell(srcThumb, srcFull){
      const cell = document.createElement('div');
      cell.className = 'thumb';
      const a = document.createElement('a');
      a.href = srcFull;
      
      // Load the full-size image to get actual dimensions
      const fullImg = new Image();
      fullImg.onload = () => {
        a.setAttribute('data-pswp-width', fullImg.naturalWidth);
        a.setAttribute('data-pswp-height', fullImg.naturalHeight);
      };
      fullImg.src = srcFull;

      const img = new Image();
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = `Art ${i}`;
      img.src = srcThumb;

      a.appendChild(img);
      cell.appendChild(a);
      grid.appendChild(cell);
    }

    // Try JPG first
    const test = new Image();
    test.onload = () => {
      createArtCell(test.src, fullJpg);
    };
    test.onerror = () => {
      // Try PNG version
      const testPng = new Image();
      testPng.onload = () => {
        createArtCell(testPng.src, fullPng);
      };
      testPng.onerror = () => {
        // Skip if neither exists
      };
      testPng.src = thumbPng;
    };
    test.src = thumbJpg;
  }

  for(let i=1; i<=15; i++) addArtItem(i);
})();

// === Shop Gallery Builder: Robbie + Parker Photos ===
(function buildShopGallery(){
  const grid = document.querySelector('.gallery-grid-shop');
  if(!grid) return;

  // Define the shop items with their folders and counts
  const shopItems = [
    { folder: 'robbie', count: 8 },
    { folder: 'parker', count: 5 }
  ];

  function addShopItem(folder, i){
    const thumbPath = `images/thumbnails/${folder}/${folder === 'robbie' ? 'RobbieSmall' : 'ParkerSmall'}${i}_thumb.jpg`;
    const fullPath = `images/fullsize/${folder}/${folder === 'robbie' ? 'RobbieSmall' : 'ParkerSmall'}${i}_web.jpg`;

    function createShopCell(srcThumb, srcFull){
      const cell = document.createElement('div');
      cell.className = 'thumb';
      const a = document.createElement('a');
      a.href = srcFull;
      
      // Load the full-size image to get actual dimensions
      const fullImg = new Image();
      fullImg.onload = () => {
        a.setAttribute('data-pswp-width', fullImg.naturalWidth);
        a.setAttribute('data-pswp-height', fullImg.naturalHeight);
      };
      fullImg.src = srcFull;

      const img = new Image();
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = `${folder} ${i}`;
      img.src = srcThumb;

      a.appendChild(img);
      cell.appendChild(a);
      grid.appendChild(cell);
    }

    // Try to load the thumbnail
    const test = new Image();
    test.onload = () => {
      createShopCell(test.src, fullPath);
    };
    test.onerror = () => {
      // Skip if image doesn't exist
    };
    test.src = thumbPath;
  }

  // Add all Robbie and Parker images
  shopItems.forEach(({ folder, count }) => {
    for(let i = 1; i <= count; i++) {
      addShopItem(folder, i);
    }
  });
  
  // Add "Coming Soon" placeholders after a short delay to ensure they come after loaded images
  setTimeout(() => {
    function addComingSoonItem() {
      const cell = document.createElement('div');
      cell.className = 'thumb coming-soon';
      cell.innerHTML = `
        <div class="coming-soon-content">
          <i class="fas fa-plus"></i>
          <span>Coming Soon</span>
        </div>
      `;
      grid.appendChild(cell);
    }
    
    // Add two "Coming Soon" items
    addComingSoonItem();
    addComingSoonItem();
  }, 100);
})();