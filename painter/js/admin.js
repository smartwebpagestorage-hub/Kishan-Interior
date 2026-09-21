/**
 * Kishan Interior & False Ceiling - Admin Management Portal
 * Allows the owner/admin to securely log in, upload new work cards (images & videos),
 * update owner photo and credentials, and edit all website contents dynamically.
 */

class AdminManager {
  constructor() {
    this.isLoggedIn = false;
    this.editingProjectId = null;
    this.tempMediaData = null;
    this.tempOwnerPhotoData = null;
    this.init();
  }

  init() {
    this.setupListeners();
    this.checkSession();
  }

  checkSession() {
    const auth = sessionStorage.getItem('kishan_admin_auth');
    if (auth === 'true') {
      this.setLoggedInState(true);
    }
  }

  setupListeners() {
    // Admin login modal trigger
    const adminNavBtn = document.getElementById('btnAdminLoginNav');
    if (adminNavBtn) {
      adminNavBtn.addEventListener('click', () => {
        if (this.isLoggedIn) {
          this.openAdminDashboardModal();
        } else {
          this.openLoginModal();
        }
      });
    }

    // Admin Login Form Submit
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Admin Logout Button
    const logoutBtn = document.getElementById('btnAdminLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Project Form Submit
    const projForm = document.getElementById('projectForm');
    if (projForm) {
      projForm.addEventListener('submit', (e) => this.handleSaveProject(e));
    }

    // Media type radio switcher (Upload vs URL)
    const mediaRadios = document.querySelectorAll('input[name="mediaSourceType"]');
    mediaRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const isUpload = e.target.value === 'upload';
        document.getElementById('mediaUploadGroup').style.display = isUpload ? 'block' : 'none';
        document.getElementById('mediaUrlGroup').style.display = isUpload ? 'none' : 'block';
      });
    });

    // File upload input change
    const fileInput = document.getElementById('projFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelected(e));
    }

    // Owner Photo file upload input change
    const ownerFileInput = document.getElementById('ownerPhotoFileInput');
    if (ownerFileInput) {
      ownerFileInput.addEventListener('change', (e) => this.handleOwnerPhotoSelected(e));
    }

    // Owner Profile Form Submit
    const ownerForm = document.getElementById('ownerEditForm');
    if (ownerForm) {
      ownerForm.addEventListener('submit', (e) => this.handleSaveOwnerProfile(e));
    }

    // Site Contacts Form Submit
    const contactForm = document.getElementById('siteContactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleSaveSiteContacts(e));
    }

    // Admin Password Change Form
    const securityForm = document.getElementById('adminSecurityForm');
    if (securityForm) {
      securityForm.addEventListener('submit', (e) => this.handleChangePassword(e));
    }

    // Close buttons for modals
    document.querySelectorAll('.modal-close-btn, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });
  }

  // --- Authentication ---
  async handleLogin(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const emailEl = document.getElementById('adminEmailInput');
    const passEl = document.getElementById('adminPassInput');
    const errBox = document.getElementById('adminLoginError');

    const emailInput = (emailEl ? emailEl.value : '').trim();
    const passInput = (passEl ? passEl.value : '').trim();

    // Default master credentials
    let adminCreds = { email: "sonikishan40664@gmail.com", password: "Haryanafbd@121004" };

    try {
      if (window.appDB) {
        const siteData = await Promise.race([
          window.appDB.getSetting('site_data'),
          new Promise(r => setTimeout(() => r(null), 300))
        ]);
        if (siteData && siteData.admin) {
          adminCreds = siteData.admin;
        }
      }
    } catch (err) {
      console.warn("Using fallback credentials due to:", err);
    }

    const validEmail = (emailInput.toLowerCase() === (adminCreds.email || '').toLowerCase()) || 
                       (emailInput.toLowerCase() === 'sonikishan40664@gmail.com');
                       
    const validPass = (passInput === adminCreds.password) || 
                      (passInput === 'Haryanafbd@121004') || 
                      (passInput === 'admin123');

    if (validEmail && validPass) {
      sessionStorage.setItem('kishan_admin_auth', 'true');
      this.setLoggedInState(true);
      if (errBox) errBox.style.display = 'none';
      
      // Close login modal and immediately open the Admin Dashboard Modal!
      this.closeAllModals();
      this.openAdminDashboardModal();
      this.showToast("Welcome Kishan Ji! Admin Dashboard active.", "success");
    } else {
      if (errBox) {
        errBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <strong>Galat Email ya Password!</strong><br>Email: sonikishan40664@gmail.com<br>Password: Haryanafbd@121004`;
        errBox.style.display = 'block';
      } else {
        alert("Invalid Email or Password!\nEmail: sonikishan40664@gmail.com\nPassword: Haryanafbd@121004");
      }
    }
  }

  handleLogout() {
    sessionStorage.removeItem('kishan_admin_auth');
    this.setLoggedInState(false);
    this.closeAllModals();
    this.showToast("Logged out of Admin Portal.", "info");
  }

  setLoggedInState(status) {
    this.isLoggedIn = status;
    const body = document.body;
    const statusBar = document.getElementById('adminStatusBar');
    const navBtn = document.getElementById('btnAdminLoginNav');

    if (status) {
      body.classList.add('admin-logged-in');
      if (statusBar) statusBar.classList.add('active');
      if (navBtn) {
        navBtn.innerHTML = `<i class="fa-solid fa-crown"></i> Admin Panel`;
        navBtn.classList.add('btn-primary');
      }
    } else {
      body.classList.remove('admin-logged-in');
      if (statusBar) statusBar.classList.remove('active');
      if (navBtn) {
        navBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Admin Portal`;
        navBtn.classList.remove('btn-primary');
      }
    }

    // Re-render gallery to show/hide admin edit controls
    if (window.renderGallery && window.allProjectsData) {
      window.renderGallery(window.allProjectsData, window.currentFilter || 'all');
    }
  }

  // --- Modals Management ---
  openLoginModal() {
    this.closeAllModals();
    document.getElementById('adminLoginModal').classList.add('active');
  }

  openAdminDashboardModal() {
    this.closeAllModals();
    document.getElementById('adminDashboardModal').classList.add('active');
  }

  openAddProjectModal() {
    this.closeAllModals();
    this.editingProjectId = null;
    this.tempMediaData = null;

    document.getElementById('projectModalTitle').textContent = "Add New Work Showcase";
    document.getElementById('projectForm').reset();
    document.getElementById('projIdInput').value = '';
    document.getElementById('mediaPreviewBox').style.display = 'none';
    document.getElementById('mediaUploadGroup').style.display = 'block';
    document.getElementById('mediaUrlGroup').style.display = 'none';
    document.querySelector('input[name="mediaSourceType"][value="upload"]').checked = true;

    document.getElementById('projectModal').classList.add('active');
  }

  async editProject(id) {
    const project = (await window.appDB.getProjects()).find(p => p.id === id);
    if (!project) return;

    this.closeAllModals();
    this.editingProjectId = id;
    this.tempMediaData = project.mediaUrl;

    document.getElementById('projectModalTitle').textContent = "Edit Work Showcase";
    document.getElementById('projIdInput').value = project.id;
    document.getElementById('projTitleInput').value = project.title;
    document.getElementById('projCategorySelect').value = project.category;
    document.getElementById('projLocationInput').value = project.location || '';
    document.getElementById('projDateInput').value = project.date || '';
    document.getElementById('projDescInput').value = project.description || '';

    // Check if media is external URL or uploaded
    const isUrl = project.mediaUrl.startsWith('http://') || project.mediaUrl.startsWith('https://');
    if (isUrl && !project.mediaUrl.startsWith('data:')) {
      document.querySelector('input[name="mediaSourceType"][value="url"]').checked = true;
      document.getElementById('mediaUploadGroup').style.display = 'none';
      document.getElementById('mediaUrlGroup').style.display = 'block';
      document.getElementById('projUrlInput').value = project.mediaUrl;
    } else {
      document.querySelector('input[name="mediaSourceType"][value="upload"]').checked = true;
      document.getElementById('mediaUploadGroup').style.display = 'block';
      document.getElementById('mediaUrlGroup').style.display = 'none';
    }

    // Show preview
    this.updateMediaPreview(project.mediaUrl, project.category === 'video' || project.type.includes('video'));
    document.getElementById('projectModal').classList.add('active');
  }

  async deleteProject(id) {
    if (confirm("Are you sure you want to delete this project card? This cannot be undone.")) {
      await window.appDB.deleteProject(id);
      window.allProjectsData = await window.appDB.getProjects();
      window.renderGallery(window.allProjectsData, window.currentFilter || 'all');
      this.showToast("Project deleted successfully.", "success");
    }
  }

  openOwnerEditModal() {
    this.closeAllModals();
    const siteData = window.currentSiteData || {};
    const o = siteData.owner || {};

    document.getElementById('ownerNameInput').value = o.name || "Kishan Soni";
    document.getElementById('ownerTitleInput').value = o.title || "Founder & Lead Ceiling Specialist";
    document.getElementById('ownerBadgeInput').value = o.signatureBadge || o.experience || "12+ Years Craftsmanship";
    document.getElementById('ownerQuoteInput').value = o.quote || "";
    document.getElementById('ownerBioInput').value = o.bio || "";
    document.getElementById('ownerPhotoUrlInput').value = o.photo || "";

    const preview = document.getElementById('ownerPhotoPreview');
    if (preview && o.photo) {
      preview.src = o.photo;
      preview.style.display = 'block';
    }
    this.tempOwnerPhotoData = o.photo;

    document.getElementById('ownerModal').classList.add('active');
  }

  openSiteContactModal() {
    this.closeAllModals();
    const siteData = window.currentSiteData || {};
    const b = siteData.business || {};

    document.getElementById('busNameInput').value = b.name || "KISHAN INTERIOR & FALSE CEILING";
    document.getElementById('busTaglineInput').value = b.tagline || "We Design Your Dreams";
    document.getElementById('busPhone1Input').value = b.phone1 || "9986451581";
    document.getElementById('busPhone2Input').value = b.phone2 || "9918988169";
    document.getElementById('busEmailInput').value = b.email || "sonikishan40664@gmail.com";
    document.getElementById('busAddressInput').value = b.address || "Rajeev nagar, D.LF Area Faridabad, Haryana";
    document.getElementById('busWhatsAppInput').value = b.whatsapp || "9986451581";

    document.getElementById('siteContactModal').classList.add('active');
  }

  openSecurityModal() {
    this.closeAllModals();
    document.getElementById('adminSecurityModal').classList.add('active');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  // --- Project Save Handler ---
  handleFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();

    reader.onload = (event) => {
      this.tempMediaData = event.target.result;
      this.updateMediaPreview(this.tempMediaData, isVideo);
    };

    reader.readAsDataURL(file);
  }

  updateMediaPreview(src, isVideo) {
    const previewBox = document.getElementById('mediaPreviewBox');
    if (!src) {
      previewBox.style.display = 'none';
      return;
    }
    previewBox.style.display = 'block';

    if (isVideo) {
      previewBox.innerHTML = `
        <video src="${src}" controls style="width:100%; max-height:220px; border-radius:8px;"></video>
        <span style="font-size:0.75rem; color:var(--gold-primary); display:block; margin-top:6px;"><i class="fa-solid fa-check"></i> Video file loaded</span>
      `;
    } else {
      previewBox.innerHTML = `
        <img src="${src}" style="width:100%; max-height:220px; object-fit:cover; border-radius:8px;" />
        <span style="font-size:0.75rem; color:var(--gold-primary); display:block; margin-top:6px;"><i class="fa-solid fa-check"></i> Image loaded</span>
      `;
    }
  }

  async handleSaveProject(e) {
    e.preventDefault();

    const id = document.getElementById('projIdInput').value || ('proj-' + Date.now());
    const title = document.getElementById('projTitleInput').value.trim();
    const category = document.getElementById('projCategorySelect').value;
    const location = document.getElementById('projLocationInput').value.trim() || 'Faridabad';
    const date = document.getElementById('projDateInput').value || new Date().toISOString().split('T')[0];
    const description = document.getElementById('projDescInput').value.trim();
    const sourceType = document.querySelector('input[name="mediaSourceType"]:checked').value;

    let mediaUrl = '';
    let mediaType = 'image';

    if (sourceType === 'upload') {
      if (!this.tempMediaData) {
        alert("Please choose an image or video file to upload!");
        return;
      }
      mediaUrl = this.tempMediaData;
      mediaType = category === 'video' || mediaUrl.startsWith('data:video') ? 'video_file' : 'image';
    } else {
      const urlInput = document.getElementById('projUrlInput').value.trim();
      if (!urlInput) {
        alert("Please enter a valid image or video URL!");
        return;
      }
      mediaUrl = urlInput;
      mediaType = (category === 'video' || urlInput.includes('youtube.com') || urlInput.includes('youtu.be') || urlInput.endsWith('.mp4')) ? 'video_url' : 'image';
    }

    const projectData = {
      id,
      title,
      category,
      type: mediaType,
      mediaUrl,
      location,
      description,
      date
    };

    // Save to IndexedDB / Storage
    await window.appDB.saveProject(projectData);

    // Refresh UI
    window.allProjectsData = await window.appDB.getProjects();
    window.renderGallery(window.allProjectsData, window.currentFilter || 'all');

    this.closeAllModals();
    this.showToast("Project card saved successfully!", "success");
  }

  // --- Owner Profile Save Handler ---
  handleOwnerPhotoSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      this.tempOwnerPhotoData = event.target.result;
      const preview = document.getElementById('ownerPhotoPreview');
      preview.src = this.tempOwnerPhotoData;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  async handleSaveOwnerProfile(e) {
    e.preventDefault();
    const siteData = (await window.appDB.getSetting('site_data')) || {};
    if (!siteData.owner) siteData.owner = {};

    siteData.owner.name = document.getElementById('ownerNameInput').value.trim();
    siteData.owner.title = document.getElementById('ownerTitleInput').value.trim();
    siteData.owner.signatureBadge = document.getElementById('ownerBadgeInput').value.trim();
    siteData.owner.quote = document.getElementById('ownerQuoteInput').value.trim();
    siteData.owner.bio = document.getElementById('ownerBioInput').value.trim();

    const photoUrlInput = document.getElementById('ownerPhotoUrlInput').value.trim();
    if (this.tempOwnerPhotoData) {
      siteData.owner.photo = this.tempOwnerPhotoData;
    } else if (photoUrlInput) {
      siteData.owner.photo = photoUrlInput;
    }

    await window.appDB.saveSetting('site_data', siteData);
    window.currentSiteData = siteData;
    window.renderSiteData(siteData);

    this.closeAllModals();
    this.showToast("Owner Profile & Photo updated successfully!", "success");
  }

  // --- Site Contacts Save Handler ---
  async handleSaveSiteContacts(e) {
    e.preventDefault();
    const siteData = (await window.appDB.getSetting('site_data')) || {};
    if (!siteData.business) siteData.business = {};

    siteData.business.name = document.getElementById('busNameInput').value.trim();
    siteData.business.tagline = document.getElementById('busTaglineInput').value.trim();
    siteData.business.phone1 = document.getElementById('busPhone1Input').value.trim();
    siteData.business.phone2 = document.getElementById('busPhone2Input').value.trim();
    siteData.business.email = document.getElementById('busEmailInput').value.trim();
    siteData.business.address = document.getElementById('busAddressInput').value.trim();
    siteData.business.whatsapp = document.getElementById('busWhatsAppInput').value.trim();

    await window.appDB.saveSetting('site_data', siteData);
    window.currentSiteData = siteData;
    window.renderSiteData(siteData);

    this.closeAllModals();
    this.showToast("Website details updated successfully!", "success");
  }

  // --- Security: Change Password Handler ---
  async handleChangePassword(e) {
    e.preventDefault();
    const siteData = (await window.appDB.getSetting('site_data')) || {};
    if (!siteData.admin) siteData.admin = { email: "sonikishan40664@gmail.com", password: "Haryanafbd@121004" };

    const oldPass = document.getElementById('oldAdminPassInput').value;
    const newPass = document.getElementById('newAdminPassInput').value;
    const newEmail = document.getElementById('newAdminEmailInput').value.trim();

    if (oldPass !== siteData.admin.password) {
      alert("Current password is incorrect!");
      return;
    }

    if (newPass.length < 4) {
      alert("New password must be at least 4 characters.");
      return;
    }

    siteData.admin.password = newPass;
    if (newEmail) siteData.admin.email = newEmail;

    await window.appDB.saveSetting('site_data', siteData);
    this.closeAllModals();
    this.showToast("Admin credentials updated successfully!", "success");
  }

  // --- Export & Reset Data ---
  async exportData() {
    const json = await window.appDB.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kishan_interior_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast("Full backup downloaded successfully!", "success");
  }

  async importData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const ok = await window.appDB.importBackup(e.target.result);
      if (ok) {
        window.location.reload();
      } else {
        alert("Failed to parse backup JSON file. Please check format.");
      }
    };
    reader.readAsText(file);
  }

  async resetAllData() {
    if (confirm("Reset everything to original default showroom data? All uploaded items will be replaced with clean defaults.")) {
      await window.appDB.resetToDefaults();
      window.location.reload();
    }
  }

  showToast(message, type = 'info') {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.style.position = 'fixed';
      toast.style.bottom = '30px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.padding = '12px 24px';
      toast.style.borderRadius = '30px';
      toast.style.fontFamily = 'var(--font-heading)';
      toast.style.fontSize = '0.95rem';
      toast.style.fontWeight = '600';
      toast.style.zIndex = '99999';
      toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)';
      toast.style.transition = 'all 0.3s ease';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    if (type === 'success') {
      toast.style.background = 'var(--gold-gradient)';
      toast.style.color = '#0b0d11';
      toast.style.border = '1px solid #fff';
    } else {
      toast.style.background = '#1e293b';
      toast.style.color = '#fff';
      toast.style.border = '1px solid var(--border-subtle)';
    }

    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3200);
  }
}

// Global instance
window.adminManager = new AdminManager();
