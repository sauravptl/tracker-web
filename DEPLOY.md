# Deployment Guide for TrackFlow

## Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)
- `Blaze` (Pay-as-you-go) plan enabled for Cloud Functions support.

## 1. Firebase Configuration
Ensure your `src/environments/environment.ts` and `src/environments/environment.prod.ts` are updated with your Firebase project config.

## 2. Deploy Cloud Functions
The custom claims logic (syncing Firestore roles to Auth tokens) relies on Cloud Functions.

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

## 3. Deploy Firestore Security Rules
Deploy the role-based access control rules.

```bash
firebase deploy --only firestore:rules
```

## 4. Build & Deploy Web App
Build the Angular application and deploy it to Firebase Hosting.

```bash
# Build the application
ng build --configuration production

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## 5. Post-Deployment Verification
1. **Register a new user**: They should be redirected to Onboarding.
2. **Create Organization**: This should promote the user to 'admin' in Firestore.
3. **Verify Custom Claims**: The Cloud Function should trigger and set `role: 'admin'` and `orgId: '...'` on the user's Auth token. You may need to logout and login again to refresh the token claims immediately, or wait for token refresh.
