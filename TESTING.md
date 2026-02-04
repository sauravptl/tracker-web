# Testing Guide for TrackFlow

This guide outlines how to manually verify the functionality and security of the TrackFlow application using the Firebase Emulator Suite.

## Prerequisites
- Java (required for Firebase Emulators)
- Firebase CLI (`npm install -g firebase-tools`)

## 1. Setup Emulators
Initialize the emulators in your project root:
```bash
firebase init emulators
```
Select **Authentication**, **Firestore**, and **Functions**. Use default ports.

## 2. Running Emulators
Start the emulator suite:
```bash
firebase emulators:start
```
The Emulator UI is typically available at `http://localhost:4000`.

## 3. Security Rules Verification
You can use the **Firestore** tab in the Emulator UI to test security rules.

### Scenario A: Role Escalation Prevention
1. **Goal**: Verify a user cannot make themselves an admin.
2. **Action**:
   - Create a user in the Auth tab.
   - Create a corresponding document in the `users` collection with `role: 'employee'`.
   - Try to update the `role` field to `admin` using the simulator or a client instance logged in as that user.
3. **Expected Result**: The write should be **denied** by the rule:
   ```
   request.resource.data.role == resource.data.role
   ```

### Scenario B: Cross-Organization Access
1. **Goal**: Verify users cannot access data from other organizations.
2. **Action**:
   - Create two organizations: `OrgA` and `OrgB`.
   - Create a task in `OrgA`.
   - Log in as a user belonging to `OrgB`.
   - Attempt to read the task document from `OrgA`.
3. **Expected Result**: The read should be **denied**.

## 4. Application Workflows

### Authentication
- Register a new user.
- Verify redirection to `/onboarding`.
- Complete onboarding (Create Organization).
- Verify redirection to `/dashboard`.

### Team Management (Admin Only)
- Go to **Settings > Team**.
- Click **+ Add Member**.
- Enter an email address (e.g., `employee@test.com`) and select role `Employee`.
- Verify the new user appears in the list.
- **Verification**: Check Firestore `users` collection to confirm the new document exists with the correct `orgId`.

### Custom Claims (Cloud Functions)
- When a user's role is changed in Team Settings:
  - Check the **Functions** emulator logs.
  - You should see: `Updated custom claims for user ...`.
- This ensures the `request.auth.token.role` will be updated on the next token refresh.

### Time Tracking
- Go to **Time Tracker**.
- Click **Start**.
- Verify the timer increments.
- Check Firestore `users/{uid}` document: `isClockedIn` should be `true`.
- Click **Stop**.
- Verify a new document is created in `timeLogs`.

### Charts
- Go to **Dashboard**.
- Ensure the **Weekly Activity** chart renders (it requires `timeLogs` from the past 7 days).

## 5. Build Verification
Ensure the application builds for production without errors:
```bash
ng build
```
Check the `dist/tracker-web` folder for output.
