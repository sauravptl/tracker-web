/**
 * Type declarations for the Electron API exposed via contextBridge/preload.js.
 * This ensures type safety when calling window.electronAPI from Angular.
 */

export interface PermissionStatus {
    platform: 'mac' | 'windows' | 'other';
    granted: boolean;
    status: string;
    instructions: string[];
}

export interface ScreenshotCaptureData {
    base64: string;
    timestamp: number;
    fileSize: number;
    resolution: string;
    quality: string;
}

export interface ScreenshotServiceConfig {
    intervalMinutes: number;
    quality: 'low' | 'medium' | 'high';
    userId: string;
    orgId: string;
}

export interface ScreenshotServiceStatus {
    success: boolean;
    status?: {
        isRunning: boolean;
        config: ScreenshotServiceConfig;
    };
    error?: string;
}

export interface ElectronAPI {
    getPlatform: () => string;
    checkPermissions: () => Promise<PermissionStatus>;
    openSystemPreferences: () => Promise<boolean>;
    getAutoLaunchEnabled: () => Promise<boolean>;
    setAutoLaunch: (enable: boolean) => Promise<boolean>;
    startScreenshotService: (config: ScreenshotServiceConfig) => Promise<ScreenshotServiceStatus>;
    stopScreenshotService: () => Promise<{ success: boolean; error?: string }>;
    onScreenshotCaptured: (callback: (data: ScreenshotCaptureData) => void) => void;
    onScreenshotError: (callback: (error: { message: string; timestamp: number }) => void) => void;
    removeScreenshotListeners: () => void;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}
