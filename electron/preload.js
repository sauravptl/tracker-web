const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Platform info
    getPlatform: () => process.platform,

    // Permission checks
    checkPermissions: () => ipcRenderer.invoke('check-permissions'),
    openSystemPreferences: () => ipcRenderer.invoke('open-system-preferences'),

    // Auto-launch
    getAutoLaunchEnabled: () => ipcRenderer.invoke('get-auto-launch'),
    setAutoLaunch: (enable) => ipcRenderer.invoke('set-auto-launch', enable),

    // Screenshot service controls (called from renderer when timer starts/stops)
    startScreenshotService: (config) => ipcRenderer.invoke('start-screenshot-service', config),
    stopScreenshotService: () => ipcRenderer.invoke('stop-screenshot-service'),

    // Listen for screenshot events (metadata sent back to renderer for Firestore writes)
    onScreenshotCaptured: (callback) => {
        ipcRenderer.on('screenshot-captured', (_event, data) => callback(data));
    },
    onScreenshotError: (callback) => {
        ipcRenderer.on('screenshot-error', (_event, error) => callback(error));
    },

    // Remove listeners (cleanup)
    removeScreenshotListeners: () => {
        ipcRenderer.removeAllListeners('screenshot-captured');
        ipcRenderer.removeAllListeners('screenshot-error');
    }
});
