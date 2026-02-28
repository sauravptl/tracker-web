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
