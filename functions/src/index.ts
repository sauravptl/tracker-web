import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Triggered when a user profile is created or updated in Firestore.
 * If the user has an 'orgId' and 'role', set them as custom claims on the Auth user.
 */
export const onUserProfileUpdate = functions.firestore
  .document("users/{userId}")
  .onWrite(async (change, context) => {
    const newData = change.after.exists ? change.after.data() : null;
    const previousData = change.before.exists ? change.before.data() : null;
    const userId = context.params.userId;

    if (!newData) {
      // Document deleted
      return null;
    }

    const newOrgId = newData.orgId;
    const newRole = newData.role;

    const prevOrgId = previousData?.orgId;
    const prevRole = previousData?.role;

    // Only update claims if orgId or role has changed
    if (newOrgId !== prevOrgId || newRole !== prevRole) {
      try {
        const customClaims = {
          orgId: newOrgId,
          role: newRole,
        };

        await admin.auth().setCustomUserClaims(userId, customClaims);
        console.log(`Updated custom claims for user ${userId}:`, customClaims);
      } catch (error) {
        console.error(`Error updating custom claims for user ${userId}:`, error);
      }
    }

    return null;
  });

/**
 * Callable function to add a team member to the caller's organization.
 * Only admins can call this.
 */
export const addTeamMember = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const callerToken = context.auth.token;

  // Check if caller is admin
  if (callerToken.role !== "admin" || !callerToken.orgId) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admins can add team members."
    );
  }

  const { email, role, displayName } = data;
  const orgId = callerToken.orgId;

  if (!email || !role) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email and role are required."
    );
  }

  try {
    let userRecord;
    let isNewUser = false;

    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        // Create new user
        isNewUser = true;
        userRecord = await admin.auth().createUser({
          email: email,
          password: "temporaryPassword123!", // In production, generate random or send invite link
          displayName: displayName || "",
        });
      } else {
        throw e;
      }
    }

    // Create or update user profile in Firestore
    const userRef = admin.firestore().collection("users").doc(userRecord.uid);

    await userRef.set({
      uid: userRecord.uid,
      email: email,
      displayName: displayName || userRecord.displayName || "",
      role: role,
      orgId: orgId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return {
      message: isNewUser ? "User created and added to team." : "User added to team.",
      uid: userRecord.uid,
      isNewUser
    };

  } catch (error: any) {
    console.error("Error adding team member:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});
