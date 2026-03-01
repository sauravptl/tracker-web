const { systemPreferences, shell } = require('electron');

/**
 * Permission Checker Module
 * Detects OS-level permissions needed for screenshot capture.
 * - macOS: Screen Recording permission required
 * - Windows: No special permission needed for desktopCapturer
 */

function checkScreenCapturePermission() {
    const platform = process.platform;

    if (platform === 'darwin') {
        // macOS: Check Screen Recording permission
        const status = systemPreferences.getMediaAccessStatus('screen');
        return {
            platform: 'mac',
            granted: status === 'granted',
            status: status, // 'not-determined' | 'granted' | 'denied' | 'restricted' | 'unknown'
            instructions: [
                'Open System Settings → Privacy & Security → Screen Recording',
                'Find "Tracker Web" in the list and toggle it ON',
                'If not listed, click the "+" button and add the app',
                'You may need to restart the app for changes to take effect'
            ]
        };
    }

    if (platform === 'win32') {
        // Windows: No explicit screen capture permission needed
        return {
            platform: 'windows',
            granted: true,
            status: 'granted',
            instructions: [
                'No special permission is required on Windows for screen capture',
                'Ensure the app is allowed through your firewall for cloud sync'
            ]
        };
    }

    // Linux / other
    return {
        platform: 'other',
        granted: true,
        status: 'granted',
        instructions: ['No special permission required on this platform']
    };
}

function openSystemPreferences() {
    const platform = process.platform;

    if (platform === 'darwin') {
        // Open macOS System Settings → Screen Recording
        shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture');
        return true;
    }

    if (platform === 'win32') {
        // Open Windows Firewall settings
        shell.openExternal('ms-settings:windowsdefender');
        return true;
    }

    return false;
}

module.exports = {
    checkScreenCapturePermission,
    openSystemPreferences
};
