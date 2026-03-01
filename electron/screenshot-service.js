const { desktopCapturer, nativeImage } = require('electron');

/**
 * Screenshot Service — Background Capture Module
 * Captures the primary screen at configurable intervals.
 * Runs entirely in the Electron main process.
 * Screenshots are returned as base64 JPEG buffers to the renderer
 * for upload to Firebase Storage.
 */

class ScreenshotService {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.intervalId = null;
        this.isRunning = false;
        this.config = {
            intervalMinutes: 10,
            quality: 'medium' // 'low' | 'medium' | 'high'
        };
    }

    /**
     * Quality presets for JPEG compression and resize
     */
    static QUALITY_PRESETS = {
        low: { jpegQuality: 40, maxWidth: 960 },
        medium: { jpegQuality: 60, maxWidth: 1440 },
        high: { jpegQuality: 85, maxWidth: 1920 }
    };

    /**
     * Start the screenshot capture interval
     * @param {Object} config - { intervalMinutes, quality, userId, orgId }
     */
    start(config) {
        if (this.isRunning) {
            this.stop();
        }

        this.config = { ...this.config, ...config };
        this.isRunning = true;

        const intervalMs = this.config.intervalMinutes * 60 * 1000;

        console.log(`[ScreenshotService] Starting capture every ${this.config.intervalMinutes} min (quality: ${this.config.quality})`);

        // Take first screenshot immediately
        this.captureScreen();

        // Then start interval
        this.intervalId = setInterval(() => {
            this.captureScreen();
        }, intervalMs);
    }

    /**
     * Stop the screenshot capture interval
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('[ScreenshotService] Stopped capture');
    }

    /**
     * Capture the primary screen
     */
    async captureScreen() {
        try {
            const sources = await desktopCapturer.getSources({
                types: ['screen'],
                thumbnailSize: { width: 1920, height: 1080 }
            });

            if (!sources || sources.length === 0) {
                this.sendError('No screen sources available');
                return;
            }

            // Use the primary screen (first source)
            const primaryScreen = sources[0];
            const thumbnail = primaryScreen.thumbnail;

            if (thumbnail.isEmpty()) {
                this.sendError('Screenshot capture returned empty image — check screen recording permissions');
                return;
            }

            // Resize and compress based on quality preset
            const preset = ScreenshotService.QUALITY_PRESETS[this.config.quality] || ScreenshotService.QUALITY_PRESETS.medium;
            const size = thumbnail.getSize();

            let processedImage = thumbnail;
            if (size.width > preset.maxWidth) {
                const ratio = preset.maxWidth / size.width;
                processedImage = thumbnail.resize({
                    width: Math.round(size.width * ratio),
                    height: Math.round(size.height * ratio)
                });
            }

            const jpegBuffer = processedImage.toJPEG(preset.jpegQuality);
            const base64Data = jpegBuffer.toString('base64');
            const finalSize = processedImage.getSize();

            const captureData = {
                base64: base64Data,
                timestamp: Date.now(),
                fileSize: jpegBuffer.length,
                resolution: `${finalSize.width}x${finalSize.height}`,
                quality: this.config.quality
            };

            // Send to renderer for Firebase upload
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                this.mainWindow.webContents.send('screenshot-captured', captureData);
            }

            console.log(`[ScreenshotService] Captured screenshot: ${finalSize.width}x${finalSize.height}, ${(jpegBuffer.length / 1024).toFixed(1)}KB`);

        } catch (error) {
            console.error('[ScreenshotService] Capture failed:', error);
            this.sendError(error.message || 'Screenshot capture failed');
        }
    }

    /**
     * Send error to renderer
     */
    sendError(message) {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('screenshot-error', { message, timestamp: Date.now() });
        }
        console.error(`[ScreenshotService] Error: ${message}`);
    }

    /**
     * Check if the service is currently active
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            config: this.config
        };
    }
}

module.exports = ScreenshotService;
