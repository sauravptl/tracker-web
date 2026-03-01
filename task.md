# TrackFlow Implementation Tasks

## 1. Project Initialization & Setup
- [x] Initialize Angular v19 Workspace (Standalone, Signals)
- [x] Configure Tailwind CSS
- [x] Setup Firebase & AngularFire (Auth, Firestore)
- [x] Create Core Folder Structure
- [x] Implement Main Layout (Sidebar, Topbar)
- [x] Define Environment Files (Placeholder credentials)

## 2. Authentication
- [x] Implement AuthService (Signal-based user state)
- [x] Create Login Component
- [x] Create Register Component
- [x] Implement Auth Guard
- [x] Update Auth Flow to redirect to Onboarding if no Org
- [x] Add Form Validation & Error Handling
- [x] Implement Password Reset

## 3. Organization Management (Core Hierarchy)
- [x] Create OrganizationService (Firestore)
- [x] Create UserService (Firestore)
- [x] Implement Create Organization (Onboarding) Flow
- [x] Implement Organization Settings (Admin only)
- [x] Implement User Role Management (Team View)
- [x] Cloud Function: Assign \`orgId\` Custom Claim & Add Members

## 4. Task Management
- [x] Create TasksComponent Skeleton
- [x] Implement Task Data Model & Service
- [x] Implement Kanban Board (Drag & Drop)
- [x] Add Task Creation Modal/Form
- [x] Integrate Task Assignment (Users in Org)

## 5. Time Tracking (Precision Timer)
- [x] Implement TimeTrackerComponent (Signals logic)
- [x] Sync Timer State with LocalStorage (Persistence)
- [x] Implement TimeLog Service (Firestore)
- [x] Save Time Logs to Firestore
- [x] Display Recent Time Logs
- [x] Real-time User Status (Clocked In/Out)

## 6. Dashboard & Reporting
- [x] Create DashboardComponent Skeleton
- [x] Fetch Real-time Stats from Firestore
- [x] Implement Manager View (Team Status)
- [x] Implement Charts/Graphs

## 7. Security & Rules
- [x] Define Firestore Security Rules (Refined & Role-based)
- [x] Test Security Rules with Emulator (See TESTING.md)
- [x] specific \`orgId\` claim implementation (Cloud Function)

## 8. HR Administration
- [x] Leave Request Service
- [x] Leave Request System (Employee UI)
- [x] Leave Approval System (Manager UI)
- [x] Expense Claims (Service & UI)
- [x] Expense Approvals (Manager UI)

## 9. Testing & Quality Assurance
- [x] Setup Cypress for E2E Testing
- [x] Implement E2E Tests (Auth, Dashboard, Tasks)
- [x] Setup Karma/Jasmine for Unit Testing
- [x] Implement Unit Tests for Services & Components
- [x] Verify Firestore Security Rules (Jest)
- [x] Fix CI/CD Pipeline (Linting, Build, Test)

## 10. UI & User Management Enhancements
- [x] Implement Dual Onboarding Flow (Create vs Join)
- [x] Add Pending Approval State & Guard
- [x] Implement User Management (Approve/Reject) in Team Settings
- [x] Update Firestore Rules for Active Status Enforcement
- [x] Responsive UI Overhaul with Tailwind CSS (Mobile Sidebar, etc.)

---

## 11. Screenshot Monitoring Feature

> **Scope:** Desktop app (Electron — macOS & Windows) + Web dashboard for admin screenshot review.

### 11.1 Admin Settings — Screenshot Management
- [ ] Add "Screenshot Monitoring" section to Admin → Settings page
- [ ] Toggle per-user/employee: enable or disable screenshot capture for specific users
- [ ] Set capture interval (e.g. every 5 / 10 / 15 / 30 minutes) per org or per user
- [ ] Persist screenshot settings in Firestore under `organizations/{orgId}/screenshotSettings`
- [ ] Firestore security rule: only admin/manager can read or write screenshot settings

### 11.2 Permission Prompt on App Launch (Desktop)
- [ ] On first launch (macOS & Windows), show a full-screen permission modal before the main app loads
- [ ] macOS modal: step-by-step guide to enable Screen Recording in System Settings → Privacy & Security
  - "Open System Settings" button that deep-links to the Screen Recording pane
  - Re-check permission status when the user returns to the app
- [ ] Windows modal: inform user no special OS permission is needed; show firewall/antivirus allow-list steps if relevant
- [ ] Block app navigation until permission is confirmed (or gracefully skip if user is not screenshot-enabled)
- [ ] Store `permissionAcknowledged` flag locally so modal only shows once per install

### 11.3 Background Screenshot Service (Desktop — Electron)
- [ ] Screenshot capture runs silently in the Electron main process (no tray icon notification, no visible UI to the employee)
- [ ] On user login, fetch screenshot settings from Firestore and start/stop service accordingly
- [ ] Timer is tied to app window visibility: pause capture when app is closed or minimised to system tray; resume when app is open and user is clocked in
- [ ] Employee/user has no UI control over screenshot capture — no start/stop button, no visible indicator
- [ ] Capture fires at the configured interval using `desktopCapturer` (existing `screenshot-service.js` as base)
- [ ] Compress screenshot to JPEG at configured quality preset before upload
- [ ] Upload base64 image to Firebase Storage under `screenshots/{orgId}/{userId}/{timestamp}.jpg`
- [ ] After successful upload, write metadata document to Firestore `screenshots` collection (see schema below)

### 11.4 Firestore Data Schema — Screenshots
- [ ] Collection: `screenshots`
- [ ] Document fields:
  ```
  {
    orgId: string,
    userId: string,
    userDisplayName: string,
    capturedAt: Timestamp,
    storagePath: string,          // Firebase Storage path
    downloadUrl: string,          // Public or signed URL
    resolution: string,           // e.g. "1440x900"
    fileSizeBytes: number,
    quality: 'low' | 'medium' | 'high'
  }
  ```
- [ ] Composite Firestore index: `orgId` + `userId` + `capturedAt` (descending) for paginated admin queries
- [ ] Firestore security rules:
  - Employees can **write** their own screenshot documents (upload metadata)
  - Employees **cannot read** any screenshot documents
  - Admins/managers can **read** all screenshots within their org

### 11.5 Admin — Screenshot Viewer (Web + Desktop)
- [ ] New route: `/admin/screenshots` (accessible to admin/manager only, guarded by role)
- [ ] User list sidebar: show all employees who have screenshot monitoring enabled
- [ ] Select a user to view their screenshot timeline (paginated, newest first)
- [ ] Screenshot grid view: thumbnail cards showing capture time, resolution, file size
- [ ] Click thumbnail → open lightbox/modal with full-size image
- [ ] Date range filter to browse screenshots by day/week
- [ ] Lazy-load images using Firebase Storage download URLs (signed URLs for private storage)
- [ ] "No screenshots yet" empty state per user

### 11.6 Web App — Screenshot Upload Fallback
- [ ] In the Angular web app, add a `ScreenshotWebService` that uses the browser's `getDisplayMedia` API as a fallback for web-only users (if applicable and user has granted permission)
- [ ] If web capture is not feasible/applicable, display an informational message directing users to use the desktop app for monitoring

### 11.7 Build & Deployment
- [ ] Bump app version in `package.json` (e.g. `1.x.0` → `1.x+1.0`) for new desktop release
- [ ] Update `electron-builder` config to include any new native modules if required
- [ ] Build macOS DMG: `npm run electron:build:mac`
- [ ] Build Windows NSIS installer: `npm run electron:build:win`
- [ ] Deploy updated Angular web app to Firebase Hosting: `firebase deploy --only hosting`
- [ ] Deploy updated Firestore rules and indexes: `firebase deploy --only firestore`
- [ ] Deploy Cloud Functions if any new functions added: `firebase deploy --only functions`
- [ ] Smoke-test the new build: permission modal, screenshot capture, admin viewer
