import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { ScreenshotService } from '../../../core/services/screenshot.service';

@Component({
    selector: 'app-permission-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    animations: [
        trigger('modalAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.95)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
            ])
        ]),
        trigger('backdropAnimation', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('300ms ease-out', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0 }))
            ])
        ])
    ],
    template: `
    <div *ngIf="isVisible()" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div [@backdropAnimation] class="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"></div>

      <!-- Modal -->
      <div [@modalAnimation] class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl px-6 py-8 text-white text-center">
          <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold">Permissions Required</h2>
          <p class="text-white/80 mt-2 text-sm">Tracker Web needs a few permissions to work properly</p>
        </div>

        <!-- Content -->
        <div class="px-6 py-6 space-y-6">
          <!-- Platform-specific instructions -->
          <div *ngIf="platform() === 'darwin'" class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Screen Recording Permission</h3>
                <p class="text-sm text-gray-600 mt-1">Required for activity monitoring features.</p>
              </div>
            </div>

            <!-- Steps -->
            <div class="bg-gray-50 rounded-xl p-4 space-y-3">
              <div *ngFor="let step of macSteps; let i = index" class="flex items-start gap-3">
                <span class="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{{ i + 1 }}</span>
                <p class="text-sm text-gray-700 pt-0.5">{{ step }}</p>
              </div>
            </div>

            <!-- Permission status -->
            <div class="flex items-center gap-2 p-3 rounded-lg" [ngClass]="{
              'bg-green-50 border border-green-200': permissionGranted(),
              'bg-amber-50 border border-amber-200': !permissionGranted()
            }">
              <div class="w-2 h-2 rounded-full" [ngClass]="{
                'bg-green-500': permissionGranted(),
                'bg-amber-500': !permissionGranted()
              }"></div>
              <span class="text-sm font-medium" [ngClass]="{
                'text-green-700': permissionGranted(),
                'text-amber-700': !permissionGranted()
              }">
                {{ permissionGranted() ? 'Screen recording permission granted' : 'Screen recording permission not yet granted' }}
              </span>
            </div>

            <button (click)="openSettings()" class="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Open System Settings
            </button>
          </div>

          <!-- Windows -->
          <div *ngIf="platform() === 'win32'" class="space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">No Special Permissions Needed</h3>
                <p class="text-sm text-gray-600 mt-1">Windows does not require special screen capture permissions.</p>
              </div>
            </div>

            <div class="bg-gray-50 rounded-xl p-4 space-y-3">
              <div *ngFor="let step of windowsSteps; let i = index" class="flex items-start gap-3">
                <span class="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{{ i + 1 }}</span>
                <p class="text-sm text-gray-700 pt-0.5">{{ step }}</p>
              </div>
            </div>
          </div>

          <!-- Auto-launch toggle -->
          <div class="border-t border-gray-200 pt-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-gray-900 text-sm">Launch on Startup</h3>
                <p class="text-xs text-gray-500 mt-0.5">Open Tracker Web when your computer starts</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [checked]="autoLaunchEnabled()" (change)="toggleAutoLaunch()" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 pb-6">
          <button
            (click)="proceed()"
            class="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            {{ permissionGranted() || platform() === 'win32' ? 'Continue to App' : 'Continue Anyway' }}
          </button>
          <button
            (click)="recheckPermission()"
            *ngIf="platform() === 'darwin' && !permissionGranted()"
            class="w-full mt-2 py-2.5 px-4 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            Recheck Permission
          </button>
        </div>
      </div>
    </div>
  `
})
export class PermissionModalComponent implements OnInit {
    private screenshotService = inject(ScreenshotService);

    isVisible = signal<boolean>(false);
    platform = signal<string>('');
    permissionGranted = signal<boolean>(false);
    autoLaunchEnabled = signal<boolean>(false);
    isChecking = signal<boolean>(false);

    macSteps = [
        'Open System Settings → Privacy & Security → Screen Recording',
        'Find "Tracker Web" in the list',
        'Toggle it ON (or click "+" to add the app)',
        'Restart the app if changes don\'t take effect'
    ];

    windowsSteps = [
        'Screen capture works out of the box on Windows',
        'Ensure Tracker Web is allowed through your firewall for cloud sync',
        'Enable startup launch below for best experience'
    ];

    async ngOnInit() {
        if (!this.screenshotService.isElectron()) return;

        // Check if modal should be shown
        if (this.screenshotService.isPermissionModalNeeded()) {
            this.platform.set(this.screenshotService.getPlatform());
            this.isVisible.set(true);

            // Check current permission status
            await this.recheckPermission();

            // Check auto-launch status
            const autoLaunch = await this.screenshotService.getAutoLaunchEnabled();
            this.autoLaunchEnabled.set(autoLaunch);
        }
    }

    async recheckPermission() {
        this.isChecking.set(true);
        const status = await this.screenshotService.checkPermissions();
        if (status) {
            this.permissionGranted.set(status.granted);
        }
        this.isChecking.set(false);
    }

    async openSettings() {
        await this.screenshotService.openSystemPreferences();
    }

    async toggleAutoLaunch() {
        const newValue = !this.autoLaunchEnabled();
        this.autoLaunchEnabled.set(newValue);
        await this.screenshotService.setAutoLaunch(newValue);
    }

    proceed() {
        this.screenshotService.dismissPermissionModal();
        this.isVisible.set(false);
    }
}
