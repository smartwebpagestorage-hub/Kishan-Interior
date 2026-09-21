/**
 * Kishan Interior & False Ceiling - Database & Persistent Storage
 * Supports IndexedDB for high-capacity media files (images & videos)
 * with graceful localStorage fallback.
 */

const DB_CONFIG = {
  name: 'KishanInteriorDB',
  version: 1,
  stores: {
    projects: 'projects',
    settings: 'settings',
    media: 'media'
  }
};

// Default Initial Data
const DEFAULT_SITE_DATA = {
  business: {
    name: "KISHAN INTERIOR & FALSE CEILING",
    tagline: "We Design Your Dreams",
    phone1: "9986451581",
    phone2: "9918988169",
    email: "sonikishan40664@gmail.com",
    address: "Rajeev nagar, D.LF Area Faridabad, Haryana",
    whatsapp: "9986451581",
    serviceHours: "Mon - Sun: 8:00 AM - 9:00 PM"
  },
  owner: {
    name: "Kishan Soni",
    title: "Founder & Master Ceiling Specialist",
    experience: "12+ Years Experience",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    quote: "Har ceiling ek kala hai, aur aapka ghar aapka sapna. Hum har project ko prem aur uchcha gunvatta ke sath design karte hain.",
    bio: "Namaste! Kishan Interior & False Ceiling me aapka swagat hai. Pichhle 12 varsho se hum Faridabad, Gurgaon, Delhi NCR aur pure Haryana me best-in-class Gypsum ceiling, PVC panels, Grid tiles aur decorative partitions ka kaam kar rahe hain. Hamari team on-time delivery, certified materials aur affordable rates ke sath behtareen finishing pradan karti hai.",
    signatureBadge: "Verified Master Contractor"
  },
  stats: {
    projectsCompleted: "850+",
    satisfiedClients: "780+",
    yearsExperience: "12+",
    expertWorkers: "25+"
  },
  admin: {
    email: "sonikishan40664@gmail.com",
    password: "Haryanafbd@121004" // Can be updated anytime in Admin panel
  }
};

const DEFAULT_PROJECTS = [
  {
    id: "proj-1",
    title: "Luxury Living Room Gypsum False Ceiling",
    category: "gypsum",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    location: "Sector 15, Faridabad",
    description: "Modern cove lighting with layered dual-drop gypsum board and warm ambient glow. Premium Saint-Gobain channel fittings.",
    date: "2026-08-10"
  },
  {
    id: "proj-2",
    title: "Acoustic Commercial 2x2 Grid Ceiling",
    category: "grid",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    location: "DLF Corporate Park, Faridabad",
    description: "Armstrong mineral fiber tile grid ceiling with integrated slim LED panels and fire-resistant suspension system.",
    date: "2026-07-25"
  },
  {
    id: "proj-3",
    title: "Designer PVC Wall Panelling & Wooden Texture Ceiling",
    category: "pvc",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
    location: "Green Field Colony, Faridabad",
    description: "100% moisture-proof wood grain PVC panel ceiling with charcoal fluted accent wall backdrop.",
    date: "2026-08-30"
  },
  {
    id: "proj-4",
    title: "Heavy-Duty Gypsum Board Office Partition",
    category: "partition",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    location: "Mathura Road, Faridabad",
    description: "Sound-insulated double skin gypsum drywall partition with viewing glass and electrical conduit routing.",
    date: "2026-09-02"
  },
  {
    id: "proj-5",
    title: "Master Bedroom Geometric POP False Ceiling",
    category: "gypsum",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    location: "NIT-5, Faridabad",
    description: "Square geometric recessed ceiling with RGB profile lighting strips and center chandelier reinforcement.",
    date: "2026-08-18"
  },
  {
    id: "proj-6",
    title: "Gypsum False Ceiling Leveling & Channeling Walkthrough",
    category: "video",
    type: "video_url",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoThumbnail: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80",
    location: "Neharpar (Greater Faridabad)",
    description: "Full site video showing our master technicians aligning laser level framework and fixing Gyproc plasterboards.",
    date: "2026-09-05"
  }
];

class StorageManager {
  constructor() {
    this.db = null;
    this.ready = this.initDB();
  }

  async initDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn("IndexedDB not supported, falling back to localStorage.");
        resolve(false);
        return;
      }
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.projects)) {
          db.createObjectStore(DB_CONFIG.stores.projects, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.settings)) {
          db.createObjectStore(DB_CONFIG.stores.settings, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.media)) {
          db.createObjectStore(DB_CONFIG.stores.media, { keyPath: 'id' });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(true);
        setTimeout(() => {
          this.bootstrapDefaults().catch(err => console.warn("Bootstrap defaults error:", err));
        }, 10);
      };

      request.onerror = (err) => {
        console.error("IndexedDB error, falling back to localStorage:", err);
        resolve(false);
      };
    });
  }

  async bootstrapDefaults() {
    const existing = await this.getProjects();
    if (!existing || existing.length === 0) {
      for (const p of DEFAULT_PROJECTS) {
        await this.saveProject(p);
      }
    }

    const settings = await this.getSetting('site_data');
    if (!settings) {
      await this.saveSetting('site_data', DEFAULT_SITE_DATA);
    } else if (settings.admin && settings.admin.password === 'admin123') {
      settings.admin.password = 'Haryanafbd@121004';
      await this.saveSetting('site_data', settings);
    }
  }

  // --- Projects Operations ---
  async getProjects() {
    await this.ready;
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db.transaction(DB_CONFIG.stores.projects, 'readonly');
        const store = tx.objectStore(DB_CONFIG.stores.projects);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(this.getProjectsLocalStorage());
      });
    }
    return this.getProjectsLocalStorage();
  }

  getProjectsLocalStorage() {
    try {
      const data = localStorage.getItem('kishan_projects');
      return data ? JSON.parse(data) : DEFAULT_PROJECTS;
    } catch (e) {
      return DEFAULT_PROJECTS;
    }
  }

  async saveProject(project) {
    await this.ready;
    if (!project.id) {
      project.id = 'proj-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
    if (this.db) {
      await new Promise((resolve, reject) => {
        const tx = this.db.transaction(DB_CONFIG.stores.projects, 'readwrite');
        const store = tx.objectStore(DB_CONFIG.stores.projects);
        store.put(project);
        tx.oncomplete = () => resolve();
        tx.onerror = (err) => reject(err);
      });
    }
    // Also mirror to localStorage for reliability
    const all = await this.getProjects();
    const index = all.findIndex(p => p.id === project.id);
    if (index >= 0) all[index] = project;
    else all.unshift(project);
    try {
      localStorage.setItem('kishan_projects', JSON.stringify(all));
    } catch (e) {
      // LocalStorage might be full if large data, which is handled by IndexedDB
    }
    return project;
  }

  async deleteProject(id) {
    await this.ready;
    if (this.db) {
      await new Promise((resolve) => {
        const tx = this.db.transaction(DB_CONFIG.stores.projects, 'readwrite');
        tx.objectStore(DB_CONFIG.stores.projects).delete(id);
        tx.oncomplete = () => resolve();
      });
    }
    const all = (await this.getProjects()).filter(p => p.id !== id);
    try {
      localStorage.setItem('kishan_projects', JSON.stringify(all));
    } catch (e) {}
    return true;
  }

  // --- Settings & Site Data ---
  async getSetting(key) {
    await this.ready;
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db.transaction(DB_CONFIG.stores.settings, 'readonly');
        const req = tx.objectStore(DB_CONFIG.stores.settings).get(key);
        req.onsuccess = () => {
          if (req.result) resolve(req.result.value);
          else resolve(this.getSettingLocalStorage(key));
        };
        req.onerror = () => resolve(this.getSettingLocalStorage(key));
      });
    }
    return this.getSettingLocalStorage(key);
  }

  getSettingLocalStorage(key) {
    try {
      const val = localStorage.getItem('kishan_' + key);
      return val ? JSON.parse(val) : (key === 'site_data' ? DEFAULT_SITE_DATA : null);
    } catch (e) {
      return key === 'site_data' ? DEFAULT_SITE_DATA : null;
    }
  }

  async saveSetting(key, value) {
    await this.ready;
    if (this.db) {
      await new Promise((resolve) => {
        const tx = this.db.transaction(DB_CONFIG.stores.settings, 'readwrite');
        tx.objectStore(DB_CONFIG.stores.settings).put({ key, value });
        tx.oncomplete = () => resolve();
      });
    }
    try {
      localStorage.setItem('kishan_' + key, JSON.stringify(value));
    } catch (e) {}
    return value;
  }

  // --- Media Blob Storage (for uploaded images & videos) ---
  async saveMedia(id, blobOrDataUrl) {
    await this.ready;
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction(DB_CONFIG.stores.media, 'readwrite');
        tx.objectStore(DB_CONFIG.stores.media).put({ id, data: blobOrDataUrl, timestamp: Date.now() });
        tx.oncomplete = () => resolve(id);
        tx.onerror = (e) => reject(e);
      });
    }
    return id;
  }

  async getMedia(id) {
    await this.ready;
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db.transaction(DB_CONFIG.stores.media, 'readonly');
        const req = tx.objectStore(DB_CONFIG.stores.media).get(id);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      });
    }
    return null;
  }

  // --- Reset to Initial Default Data ---
  async resetToDefaults() {
    if (this.db) {
      await new Promise((resolve) => {
        const tx = this.db.transaction([DB_CONFIG.stores.projects, DB_CONFIG.stores.settings, DB_CONFIG.stores.media], 'readwrite');
        tx.objectStore(DB_CONFIG.stores.projects).clear();
        tx.objectStore(DB_CONFIG.stores.settings).clear();
        tx.objectStore(DB_CONFIG.stores.media).clear();
        tx.oncomplete = () => resolve();
      });
    }
    localStorage.removeItem('kishan_projects');
    localStorage.removeItem('kishan_site_data');
    await this.bootstrapDefaults();
    return true;
  }

  // --- Export & Import Backup JSON ---
  async exportBackup() {
    const projects = await this.getProjects();
    const siteData = await this.getSetting('site_data');
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      version: '1.0',
      siteData,
      projects
    }, null, 2);
  }

  async importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.siteData) {
        await this.saveSetting('site_data', parsed.siteData);
      }
      if (Array.isArray(parsed.projects)) {
        for (const p of parsed.projects) {
          await this.saveProject(p);
        }
      }
      return true;
    } catch (e) {
      console.error("Failed to import backup:", e);
      return false;
    }
  }
}

// Global instance
window.appDB = new StorageManager();
