/**
 * Kishan Interior & False Ceiling - Main Public Application Logic
 */

let currentFilter = 'all';
let allProjectsData = [];
let currentSiteData = null;

document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
  setupEventListeners();
});

async function initApp() {
  try {
    currentSiteData = await window.appDB.getSetting('site_data');
    if (currentSiteData) {
      renderSiteData(currentSiteData);
    }

    allProjectsData = await window.appDB.getProjects();
    renderGallery(allProjectsData, currentFilter);

    // Check if admin is currently active in session
    if (window.adminManager) {
      window.adminManager.checkSession();
    }
  } catch (err) {
    console.error("Initialization error:", err);
  }
}

// Render dynamic site data (business details, contact, owner profile)
function renderSiteData(data) {
  if (!data) return;

  // Business Contacts
  const b = data.business || {};
  document.querySelectorAll('.data-bus-name').forEach(el => el.textContent = b.name || "Kishan Interior & False Ceiling");
  document.querySelectorAll('.data-bus-tagline').forEach(el => el.textContent = b.tagline || "We Design Your Dreams");
  document.querySelectorAll('.data-bus-phone1').forEach(el => {
    el.textContent = b.phone1 || "9986451581";
    if (el.tagName === 'A') el.href = `tel:${b.phone1}`;
  });
  document.querySelectorAll('.data-bus-phone2').forEach(el => {
    el.textContent = b.phone2 || "9918988169";
    if (el.tagName === 'A') el.href = `tel:${b.phone2}`;
  });
  document.querySelectorAll('.data-bus-email').forEach(el => {
    el.textContent = b.email || "sonikishan40664@gmail.com";
    if (el.tagName === 'A') el.href = `mailto:${b.email}`;
  });
  document.querySelectorAll('.data-bus-address').forEach(el => el.textContent = b.address || "Rajeev nagar, D.LF Area Faridabad, Haryana");

  // WhatsApp quick links
  const waNumber = (b.whatsapp || b.phone1 || "9986451581").replace(/\D/g, '');
  document.querySelectorAll('.data-bus-whatsapp').forEach(el => {
    el.href = `https://wa.me/91${waNumber}?text=${encodeURIComponent("Hello Kishan Ji, I want to inquire about false ceiling work for my home/office.")}`;
  });

  // Owner Showcase Section (Specially requested feature)
  const o = data.owner || {};
  const ownerPhotoEl = document.getElementById('ownerPhotoDisplay');
  if (ownerPhotoEl && o.photo) {
    ownerPhotoEl.src = o.photo;
  }
  const ownerNameEl = document.getElementById('ownerNameDisplay');
  if (ownerNameEl) ownerNameEl.textContent = o.name || "Kishan Soni";

  const ownerTitleEl = document.getElementById('ownerTitleDisplay');
  if (ownerTitleEl) ownerTitleEl.textContent = o.title || "Founder & Master False Ceiling Craftsman";

  const ownerBadgeEl = document.getElementById('ownerBadgeDisplay');
  if (ownerBadgeEl) ownerBadgeEl.textContent = o.signatureBadge || o.experience || "12+ Years Experience";

  const ownerQuoteEl = document.getElementById('ownerQuoteDisplay');
  if (ownerQuoteEl) ownerQuoteEl.textContent = `"${o.quote || 'Har ceiling ek kala hai, aur aapka ghar aapka sapna.'}"`;

  const ownerBioEl = document.getElementById('ownerBioDisplay');
  if (ownerBioEl) ownerBioEl.textContent = o.bio || "";

  // Stats
  const s = data.stats || {};
  if (document.getElementById('statProjects')) document.getElementById('statProjects').textContent = s.projectsCompleted || "850+";
  if (document.getElementById('statClients')) document.getElementById('statClients').textContent = s.satisfiedClients || "780+";
  if (document.getElementById('statExp')) document.getElementById('statExp').textContent = s.yearsExperience || "12+";
}

// Render Works Gallery Cards
function renderGallery(projects, filter = 'all') {
  const grid = document.getElementById('worksGrid');
  if (!grid) return;

  const filtered = filter === 'all' 
    ? projects 
    : projects.filter(p => {
        if (filter === 'video') return p.category === 'video' || p.type.includes('video');
        return p.category === filter;
      });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 50px 20px; color: var(--chrome-mid);">
        <i class="fa-solid fa-layer-group" style="font-size: 2.5rem; color: var(--gold-primary); margin-bottom: 12px; display:block;"></i>
        <h3>No projects found in this category yet.</h3>
        <p>Admin can add new images or videos anytime using the Admin Portal.</p>
      </div>
    `;
    return;
  }

  const isAdmin = window.adminManager ? window.adminManager.isLoggedIn : false;

  grid.innerHTML = filtered.map(p => {
    const isVideo = p.category === 'video' || p.type.includes('video');
    const badgeText = isVideo ? 'Video Tour' : (p.category.toUpperCase() + ' WORK');
    const badgeIcon = isVideo ? 'fa-play' : 'fa-image';

    // Format media element for thumbnail
    let thumbHtml = '';
    if (isVideo) {
      if (p.videoThumbnail) {
        thumbHtml = `<img src="${p.videoThumbnail}" alt="${p.title}" loading="lazy" />`;
      } else {
        thumbHtml = `<video src="${p.mediaUrl}" preload="metadata" muted></video>`;
      }
    } else {
      thumbHtml = `<img src="${p.mediaUrl}" alt="${p.title}" loading="lazy" />`;
    }

    return `
      <div class="work-card" data-id="${p.id}" data-category="${p.category}">
        <div class="work-thumb-wrap" onclick="openLightbox('${p.id}')">
          ${thumbHtml}
          <div class="media-type-badge">
            <i class="fa-solid ${badgeIcon}"></i>
            <span>${badgeText}</span>
          </div>
          ${isVideo ? '<div class="play-overlay-icon"><i class="fa-solid fa-play"></i></div>' : ''}
        </div>

        <div class="work-info-body">
          <div class="work-meta-tag">
            <span>${p.category}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${p.location || 'Faridabad'}</span>
          </div>
          <h3 class="work-title">${p.title}</h3>
          <p class="work-desc">${p.description || ''}</p>
          <div class="work-footer">
            <span><i class="fa-regular fa-calendar"></i> ${p.date || 'Recent Project'}</span>
            <span style="color: var(--gold-light); font-weight:600; cursor:pointer;" onclick="openLightbox('${p.id}')">
              View HD <i class="fa-solid fa-arrow-right"></i>
            </span>
          </div>
        </div>

        ${isAdmin ? `
          <div class="work-admin-bar">
            <button class="btn btn-sm btn-outline" style="flex:1" onclick="window.adminManager.editProject('${p.id}')">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button class="btn btn-sm btn-outline" style="color:var(--accent-red); border-color:rgba(239,68,68,0.3)" onclick="window.adminManager.deleteProject('${p.id}')">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Setup Event Listeners
function setupEventListeners() {
  // Gallery Filter Tabs
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentFilter = e.currentTarget.dataset.filter;
      renderGallery(allProjectsData, currentFilter);
    });
  });

  // Mobile Navigation Menu Toggle
  const mobToggle = document.getElementById('mobileNavToggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobToggle && navLinks) {
    mobToggle.addEventListener('click', () => {
      const isVisible = navLinks.classList.contains('mobile-menu-active');
      if (isVisible) {
        navLinks.classList.remove('mobile-menu-active');
        navLinks.style.display = 'none';
      } else {
        navLinks.classList.add('mobile-menu-active');
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = 'rgba(14, 18, 25, 0.98)';
        navLinks.style.padding = '24px 20px';
        navLinks.style.borderBottom = '1px solid var(--border-subtle)';
        navLinks.style.gap = '14px';
      }
    });

    // Auto-close menu when clicking any link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024 && navLinks.classList.contains('mobile-menu-active')) {
          navLinks.classList.remove('mobile-menu-active');
          navLinks.style.display = 'none';
        }
      });
    });

    // Reset styles on window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        navLinks.classList.remove('mobile-menu-active');
        navLinks.style.display = '';
        navLinks.style.flexDirection = '';
        navLinks.style.position = '';
        navLinks.style.padding = '';
      }
    });
  }

  // Interactive Quote Calculator
  const calcBtn = document.getElementById('btnCalculateEstimate');
  if (calcBtn) {
    calcBtn.addEventListener('click', calculateEstimate);
  }
}

// False Ceiling Cost Estimator Logic
function calculateEstimate() {
  const serviceType = document.getElementById('estServiceSelect')?.value || 'gypsum';
  const areaSqFt = parseFloat(document.getElementById('estAreaInput')?.value) || 0;
  const resultBox = document.getElementById('estimateResultBox');
  const amountDisplay = document.getElementById('estAmountDisplay');
  const waBtn = document.getElementById('estWhatsAppBtn');

  if (areaSqFt <= 0) {
    alert("Please enter a valid area in Square Feet (e.g. 250 sq.ft).");
    return;
  }

  // Rate Matrix per sq.ft (Approx market standards for Faridabad/NCR)
  const rates = {
    gypsum: { min: 95, max: 125, name: "Special Gypsum False Ceiling" },
    grid: { min: 75, max: 95, name: "2x2 Grid Tile Ceiling" },
    pvc: { min: 110, max: 145, name: "PVC Designer Ceiling / Panels" },
    partition: { min: 130, max: 175, name: "Gypsum Drywall Partition" },
    pop: { min: 115, max: 155, name: "Modern Geometric POP Design" }
  };

  const selectedRate = rates[serviceType] || rates.gypsum;
  const minCost = Math.round(areaSqFt * selectedRate.min);
  const maxCost = Math.round(areaSqFt * selectedRate.max);

  amountDisplay.textContent = `₹${minCost.toLocaleString('en-IN')} - ₹${maxCost.toLocaleString('en-IN')}`;
  resultBox.style.display = 'flex';

  // Format WhatsApp Inquiry Message
  const phone = currentSiteData?.business?.whatsapp || "9986451581";
  const msg = `Namaste Kishan Ji! I used the estimate calculator on your website for *${selectedRate.name}*.\nArea: *${areaSqFt} Sq. Ft.*\nEstimated Budget: *₹${minCost.toLocaleString('en-IN')} - ₹${maxCost.toLocaleString('en-IN')}*.\nPlease provide a site inspection and detailed quotation!`;
  waBtn.href = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
}

// Lightbox Modal for Images and Videos
window.openLightbox = function(projectId) {
  const project = allProjectsData.find(p => p.id === projectId);
  if (!project) return;

  const modal = document.getElementById('lightboxModal');
  const mediaWrap = document.getElementById('lightboxMedia');
  const titleEl = document.getElementById('lightboxTitle');
  const descEl = document.getElementById('lightboxDesc');

  const isVideo = project.category === 'video' || project.type.includes('video');

  if (isVideo) {
    // Check if YouTube URL or direct MP4/WebM
    if (project.mediaUrl.includes('youtube.com') || project.mediaUrl.includes('youtu.be')) {
      let ytId = '';
      if (project.mediaUrl.includes('youtu.be/')) {
        ytId = project.mediaUrl.split('youtu.be/')[1].split('?')[0];
      } else if (project.mediaUrl.includes('v=')) {
        ytId = project.mediaUrl.split('v=')[1].split('&')[0];
      }
      mediaWrap.innerHTML = `
        <iframe width="100%" height="480" src="https://www.youtube.com/embed/${ytId}?autoplay=1" 
          title="${project.title}" frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen style="border-radius:12px; border:1px solid var(--border-subtle); max-width:850px;"></iframe>
      `;
    } else {
      mediaWrap.innerHTML = `
        <video src="${project.mediaUrl}" controls autoplay style="max-width:100%; max-height:70vh; border-radius:12px; border:1px solid var(--border-subtle);">
          Your browser does not support the video tag.
        </video>
      `;
    }
  } else {
    mediaWrap.innerHTML = `
      <img src="${project.mediaUrl}" alt="${project.title}" style="max-width:100%; max-height:70vh; border-radius:12px; border:1px solid var(--border-subtle);" />
    `;
  }

  titleEl.textContent = project.title;
  descEl.textContent = `${project.description || ''} • Location: ${project.location || 'Faridabad'} • Date: ${project.date || ''}`;

  modal.classList.add('active');
};

window.closeLightbox = function() {
  const modal = document.getElementById('lightboxModal');
  const mediaWrap = document.getElementById('lightboxMedia');
  if (modal) modal.classList.remove('active');
  if (mediaWrap) mediaWrap.innerHTML = ''; // Stops video audio immediately
};

// Keyboard listener for ESC to close lightbox or modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    if (window.adminManager) window.adminManager.closeAllModals();
  }
});

// Show / Hide Password Toggle
window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
    btn.setAttribute('title', 'Hide Password');
  } else {
    input.type = 'password';
    if (icon) {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
    btn.setAttribute('title', 'Show Password');
  }
};

// Open custom image in Lightbox (e.g. banner)
window.openCustomLightbox = function(src, title, desc) {
  const modal = document.getElementById('lightboxModal');
  const mediaWrap = document.getElementById('lightboxMedia');
  const titleEl = document.getElementById('lightboxTitle');
  const descEl = document.getElementById('lightboxDesc');

  if (!modal || !mediaWrap) return;
  mediaWrap.innerHTML = `<img src="${src}" alt="${title}" style="max-width:100%; max-height:75vh; border-radius:12px; border:1px solid var(--border-subtle); object-fit:contain;" />`;
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc || '';
  modal.classList.add('active');
};
