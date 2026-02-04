# TrackFlow

TrackFlow is a comprehensive workforce productivity application built with **Angular v19** and **Firebase**. It simplifies team management, time tracking, project organization, and HR workflows for modern organizations.

## 🚀 Features

### 🔐 Authentication & Security
- **Secure Auth**: Powered by Firebase Authentication (Email/Password).
- **Role-Based Access Control (RBAC)**: Distinct roles for Admins, Managers, and Employees.
- **Custom Claims**: Cloud Functions sync user roles to Auth tokens for secure backend validation.
- **Firestore Security Rules**: robust data protection based on organization and user roles.

### 🏢 Organization & Team Management
- **Onboarding**: Seamless flow to create new organizations.
- **Team Management**: Admins can invite members and assign roles.
- **Organization Settings**: Manage organization details.

### ⏱️ Time Tracking
- **Precision Timer**: Real-time start/stop functionality.
- **Persistence**: Timer state survives page reloads via LocalStorage.
- **Reporting**: Weekly activity charts and daily summaries.
- **Live Status**: See who is currently clocked in (Manager view).

### 📋 Task Management
- **Kanban Board**: Drag-and-drop interface for Todo, In Progress, and Done.
- **Task Assignment**: Assign tasks to specific team members.
- **Real-time Updates**: Changes reflect instantly across the team.

### 💼 HR Administration
- **Leave Requests**: Employees can request vacation, sick leave, etc.
- **Expense Claims**: Submit expenses with amounts and descriptions.
- **Approvals**: Managers and Admins can review and approve/reject requests.

## 🛠️ Tech Stack

- **Frontend**: Angular v19 (Standalone Components, Signals)
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Functions, Hosting)
- **Charts**: Chart.js & ng2-charts
- **Icons**: Lucide (via CDN/SVG)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tracker-web
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Email/Password).
   - Enable **Firestore** and **Functions** (Blaze plan required for Functions).
   - Copy your firebase config to \`src/environments/environment.ts\`.

4. **Run Development Server**
   ```bash
   ng serve
   ```
   Navigate to \`http://localhost:4200/\`.

## 🧪 Testing

- **Unit Tests**: \`ng test\`
- **Security Rules**: \`npm run test:rules\` (Requires Firebase Emulator Suite & Java 21+)

## 🚀 Deployment

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions to Firebase Hosting.

## 📄 License

MIT
