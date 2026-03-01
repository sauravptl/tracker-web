import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, updateDoc, query, where, orderBy, limit, collectionData, docData, addDoc, deleteDoc, increment, serverTimestamp, CollectionReference, Timestamp } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

// ========== Interfaces ==========

export interface ScreenshotSettings {
    enabledUsers: string[];
    intervalMinutes: number;
    retentionDays: number;
    quality: 'low' | 'medium' | 'high';
    updatedAt?: any;
    updatedBy?: string;
}

export interface UserScreenshotSummary {
    userId: string;
    displayName: string;
    totalCaptures: number;
    lastCapturedAt?: any;
    isEnabled: boolean;
}

export interface ScreenshotCapture {
    id?: string;
    capturedAt: any;
    storagePath: string;
    fileSize: number;
    resolution: string;
    date: string; // YYYY-MM-DD
}

// ========== Service ==========

@Injectable({
    providedIn: 'root'
})
export class ScreenshotService {
    private firestore = inject(Firestore);

    // Signals
    isElectron = signal<boolean>(false);
    permissionStatus = signal<any>(null);
    isServiceRunning = signal<boolean>(false);

    constructor() {
        this.isElectron.set(!!window.electronAPI);
    }

    // ========== Electron API Wrappers ==========

    async checkPermissions() {
        if (!window.electronAPI) return null;
        const status = await window.electronAPI.checkPermissions();
        this.permissionStatus.set(status);
        return status;
    }

    async openSystemPreferences(): Promise<boolean> {
        if (!window.electronAPI) return false;
        return window.electronAPI.openSystemPreferences();
    }

    getPlatform(): string {
        if (!window.electronAPI) return 'web';
        return window.electronAPI.getPlatform();
    }

    async getAutoLaunchEnabled(): Promise<boolean> {
        if (!window.electronAPI) return false;
        return window.electronAPI.getAutoLaunchEnabled();
    }

    async setAutoLaunch(enable: boolean): Promise<boolean> {
        if (!window.electronAPI) return false;
        return window.electronAPI.setAutoLaunch(enable);
    }

    async startCapture(config: { intervalMinutes: number; quality: string; userId: string; orgId: string }): Promise<boolean> {
        if (!window.electronAPI) return false;
        const result = await window.electronAPI.startScreenshotService(config as any);
        this.isServiceRunning.set(result.success);
        return result.success;
    }

    async stopCapture(): Promise<boolean> {
        if (!window.electronAPI) return false;
        const result = await window.electronAPI.stopScreenshotService();
        this.isServiceRunning.set(false);
        return result.success;
    }

    onScreenshotCaptured(callback: (data: any) => void): void {
        if (!window.electronAPI) return;
        window.electronAPI.onScreenshotCaptured(callback);
    }

    onScreenshotError(callback: (error: any) => void): void {
        if (!window.electronAPI) return;
        window.electronAPI.onScreenshotError(callback);
    }

    removeListeners(): void {
        if (!window.electronAPI) return;
        window.electronAPI.removeScreenshotListeners();
    }

    // ========== Firestore — Screenshot Settings ==========

    async getScreenshotSettings(orgId: string): Promise<ScreenshotSettings | null> {
        const docRef = doc(this.firestore, 'organizations', orgId, 'screenshotSettings', 'config');
        const snap = await getDoc(docRef);
        return snap.exists() ? snap.data() as ScreenshotSettings : null;
    }

    getScreenshotSettingsStream(orgId: string): Observable<ScreenshotSettings | undefined> {
        const docRef = doc(this.firestore, 'organizations', orgId, 'screenshotSettings', 'config');
        return docData(docRef) as Observable<ScreenshotSettings>;
    }

    async saveScreenshotSettings(orgId: string, settings: Partial<ScreenshotSettings>, adminUserId: string): Promise<void> {
        const docRef = doc(this.firestore, 'organizations', orgId, 'screenshotSettings', 'config');
        return setDoc(docRef, {
            ...settings,
            updatedAt: serverTimestamp(),
            updatedBy: adminUserId
        }, { merge: true });
    }

    // ========== Firestore — User Screenshot Summaries ==========

    getUserScreenshotSummaries(orgId: string): Observable<UserScreenshotSummary[]> {
        const colRef = collection(this.firestore, 'organizations', orgId, 'screenshots');
        return collectionData(colRef, { idField: 'userId' }) as Observable<UserScreenshotSummary[]>;
    }

    async getOrCreateUserSummary(orgId: string, userId: string, displayName: string): Promise<void> {
        const docRef = doc(this.firestore, 'organizations', orgId, 'screenshots', userId);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
            await setDoc(docRef, {
                userId,
                displayName,
                totalCaptures: 0,
                isEnabled: false
            });
        }
    }

    // ========== Firestore — Individual Captures ==========

    async addCapture(orgId: string, userId: string, capture: Omit<ScreenshotCapture, 'id'>): Promise<string> {
        // Add the capture document
        const capturesCol = collection(this.firestore, 'organizations', orgId, 'screenshots', userId, 'captures');
        const docRef = await addDoc(capturesCol, capture);

        // Update the user summary
        const summaryRef = doc(this.firestore, 'organizations', orgId, 'screenshots', userId);
        await updateDoc(summaryRef, {
            totalCaptures: increment(1),
            lastCapturedAt: capture.capturedAt
        });

        return docRef.id;
    }

    getUserCaptures(orgId: string, userId: string, limitCount: number = 50): Observable<ScreenshotCapture[]> {
        const capturesCol = collection(this.firestore, 'organizations', orgId, 'screenshots', userId, 'captures');
        const q = query(capturesCol, orderBy('capturedAt', 'desc'), limit(limitCount));
        return collectionData(q, { idField: 'id' }) as Observable<ScreenshotCapture[]>;
    }

    getUserCapturesByDate(orgId: string, userId: string, startDate: Date, endDate: Date): Observable<ScreenshotCapture[]> {
        const capturesCol = collection(this.firestore, 'organizations', orgId, 'screenshots', userId, 'captures');
        const q = query(
            capturesCol,
            where('capturedAt', '>=', Timestamp.fromDate(startDate)),
            where('capturedAt', '<=', Timestamp.fromDate(endDate)),
            orderBy('capturedAt', 'desc')
        );
        return collectionData(q, { idField: 'id' }) as Observable<ScreenshotCapture[]>;
    }

    async deleteCapture(orgId: string, userId: string, captureId: string): Promise<void> {
        const docRef = doc(this.firestore, 'organizations', orgId, 'screenshots', userId, 'captures', captureId);
        await deleteDoc(docRef);

        // Decrement the user summary
        const summaryRef = doc(this.firestore, 'organizations', orgId, 'screenshots', userId);
        await updateDoc(summaryRef, {
            totalCaptures: increment(-1)
        });
    }

    // ========== Permission Check Helpers ==========

    isPermissionModalNeeded(): boolean {
        if (!this.isElectron()) return false;
        const dismissed = localStorage.getItem('screenshotPermissionDismissed');
        return !dismissed;
    }

    dismissPermissionModal(): void {
        localStorage.setItem('screenshotPermissionDismissed', 'true');
    }

    resetPermissionModal(): void {
        localStorage.removeItem('screenshotPermissionDismissed');
    }
}
