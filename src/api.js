// API Service for communicating with Express backend and JSON file database

const API_BASE = '/api';
const LOCAL_STORAGE_FALLBACK_KEY = 'endsofttech_2d_matrices';

export const api = {
  // Fetch all saved tables from database.json
  async getTables() {
    try {
      const res = await fetch(`${API_BASE}/tables`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (data.success) {
        return { success: true, data: data.data, source: 'backend' };
      }
      throw new Error(data.message || 'Failed to fetch tables');
    } catch (err) {
      console.warn('Backend API unavailable, using localStorage fallback:', err);
      const local = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
      const tables = local ? JSON.parse(local) : [];
      return { success: true, data: tables, source: 'localStorage', error: err.message };
    }
  },

  // Save or update table in database.json
  async saveTable(tableData, options = {}) {
    try {
      const payload = {
        ...tableData,
        saveAsNew: options.saveAsNew || false
      };
      const res = await fetch(`${API_BASE}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Server error: ${res.status}`);
      }
      // Also sync to localStorage as backup
      this.syncToLocalStorage(data.data);
      return { 
        success: true, 
        data: data.data, 
        message: data.message, 
        source: 'backend',
        isNewRecord: data.isNewRecord,
        totalDatasets: data.totalDatasets
      };
    } catch (err) {
      console.warn('Backend API save failed, saving to localStorage:', err);
      const saved = this.syncToLocalStorage(tableData);
      return {
        success: true,
        data: saved,
        message: 'Saved to local browser database (Backend server sync failed: ' + err.message + ')',
        source: 'localStorage'
      };
    }
  },

  // Delete table from database.json
  async deleteTable(id) {
    try {
      const res = await fetch(`${API_BASE}/tables/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete table');
      }
      this.deleteFromLocalStorage(id);
      return { success: true, message: data.message };
    } catch (err) {
      this.deleteFromLocalStorage(id);
      return { success: true, message: 'Deleted from local database' };
    }
  },

  // Check health / connection to database.json
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        const data = await res.json();
        return { connected: true, data };
      }
      return { connected: false };
    } catch {
      return { connected: false };
    }
  },

  syncToLocalStorage(tableData) {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
      let list = raw ? JSON.parse(raw) : [];
      const itemToSave = {
        ...tableData,
        id: tableData.id || `matrix-${Date.now()}`,
        updatedAt: new Date().toISOString()
      };
      const idx = list.findIndex(t => t.id === itemToSave.id);
      if (idx >= 0) {
        list[idx] = itemToSave;
      } else {
        list.unshift(itemToSave);
      }
      localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(list));
      return itemToSave;
    } catch (e) {
      console.error('LocalStorage sync error:', e);
      return tableData;
    }
  },

  deleteFromLocalStorage(id) {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
      if (!raw) return;
      const list = JSON.parse(raw).filter(t => t.id !== id);
      localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('LocalStorage delete error:', e);
    }
  }
};
