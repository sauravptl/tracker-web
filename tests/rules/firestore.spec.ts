
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import * as fs from "fs";

let testEnv: RulesTestEnvironment;

const PROJECT_ID = "tracker-web-test";
const FIRETORE_RULES = fs.readFileSync("firestore.rules", "utf8");

describe("Firestore Security Rules", () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: FIRETORE_RULES,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  const getAuth = (uid: string, orgId?: string, role?: string) => {
    const token: any = { sub: uid, email: `${uid}@example.com` };
    if (orgId) token.orgId = orgId;
    if (role) token.role = role;
    return testEnv.authenticatedContext(uid, token).firestore();
  };

  const getUnauth = () => {
    return testEnv.unauthenticatedContext().firestore();
  };

  describe("Organizations", () => {
    it("should allow authenticated user to create an organization", async () => {
      const db = getAuth("user1");
      await assertSucceeds(db.collection("organizations").doc("org1").set({
        name: "Test Org",
        ownerId: "user1"
      }));
    });

    it("should allow org member to read organization", async () => {
      // Setup: Create org
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("organizations").doc("org1").set({ name: "Org 1" });
        await context.firestore().collection("users").doc("user1").set({ orgId: "org1", status: "active" });
      });

      const db = getAuth("user1", "org1");
      await assertSucceeds(db.collection("organizations").doc("org1").get());
    });

    it("should deny non-member to read organization", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("organizations").doc("org1").set({ name: "Org 1" });
        await context.firestore().collection("users").doc("user2").set({ orgId: "org2", status: "active" });
      });

      const db = getAuth("user2", "org2"); // Different org
      await assertFails(db.collection("organizations").doc("org1").get());
    });

    it("should allow admin to update organization", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("organizations").doc("org1").set({ name: "Org 1" });
        await context.firestore().collection("users").doc("admin1").set({ orgId: "org1", role: "admin", status: "active" });
      });

      const db = getAuth("admin1", "org1", "admin");
      await assertSucceeds(db.collection("organizations").doc("org1").update({ name: "Updated Org" }));
    });

    it("should deny employee to update organization", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("organizations").doc("org1").set({ name: "Org 1" });
        await context.firestore().collection("users").doc("emp1").set({ orgId: "org1", role: "employee", status: "active" });
      });

      const db = getAuth("emp1", "org1", "employee");
      await assertFails(db.collection("organizations").doc("org1").update({ name: "Updated Org" }));
    });
  });

  describe("Users", () => {
    it("should allow user to read own profile", async () => {
      const db = getAuth("user1", "org1");
      await assertSucceeds(db.collection("users").doc("user1").get());
    });

    it("should allow org member to read other member profile", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("users").doc("user2").set({ orgId: "org1" });
        await context.firestore().collection("users").doc("user1").set({ orgId: "org1", status: "active" });
      });

      const db = getAuth("user1", "org1");
      await assertSucceeds(db.collection("users").doc("user2").get());
    });

    it("should deny access to user profile from different org", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("users").doc("user2").set({ orgId: "org2" });
        await context.firestore().collection("users").doc("user1").set({ orgId: "org1", status: "active" });
      });

      const db = getAuth("user1", "org1");
      await assertFails(db.collection("users").doc("user2").get());
    });

    it("should allow user to update own profile (non-sensitive fields)", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("users").doc("user1").set({
          orgId: "org1",
          role: "employee",
          displayName: "Old Name"
        });
      });

      const db = getAuth("user1", "org1", "employee");
      await assertSucceeds(db.collection("users").doc("user1").update({
        displayName: "New Name",
        orgId: "org1", // Must match existing
        role: "employee" // Must match existing
      }));
    });

    it("should deny user updating their own role", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("users").doc("user1").set({
          orgId: "org1",
          role: "employee"
        });
      });

      const db = getAuth("user1", "org1", "employee");
      // Try to escalate to admin
      await assertFails(db.collection("users").doc("user1").update({
        role: "admin",
        orgId: "org1"
      }));
    });

    it("should allow admin to update user role in same org", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("users").doc("user2").set({
          orgId: "org1",
          role: "employee"
        });
        await context.firestore().collection("users").doc("admin1").set({ orgId: "org1", role: "admin", status: "active" });
      });

      const db = getAuth("admin1", "org1", "admin");
      await assertSucceeds(db.collection("users").doc("user2").update({ role: "manager" }));
    });
  });

  describe("Tasks", () => {
    it("should allow org member to read/write tasks", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("users").doc("user1").set({ orgId: "org1", status: "active" });
      });
      const db = getAuth("user1", "org1");
      // Create
      await assertSucceeds(db.collection("tasks").add({
        title: "New Task",
        orgId: "org1"
      }));
    });

    it("should deny read task from another org", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("tasks").doc("task1").set({ orgId: "org2" });
        await context.firestore().collection("users").doc("user1").set({ orgId: "org1", status: "active" });
      });

      const db = getAuth("user1", "org1");
      await assertFails(db.collection("tasks").doc("task1").get());
    });
  });

  describe("TimeLogs", () => {
    it("should allow user to create their own time log", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("users").doc("user1").set({ orgId: "org1", status: "active" });
      });
      const db = getAuth("user1", "org1");
      await assertSucceeds(db.collection("timeLogs").add({
        userId: "user1",
        orgId: "org1",
        duration: 60
      }));
    });

    it("should deny user creating time log for others", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("users").doc("user1").set({ orgId: "org1", status: "active" });
      });
      const db = getAuth("user1", "org1");
      await assertFails(db.collection("timeLogs").add({
        userId: "user2",
        orgId: "org1",
        duration: 60
      }));
    });

    it("should allow manager to read time logs of their org", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("timeLogs").doc("log1").set({
          userId: "user2",
          orgId: "org1"
        });
        await context.firestore().collection("users").doc("manager1").set({ orgId: "org1", role: "manager", status: "active" });
      });

      const db = getAuth("manager1", "org1", "manager");
      await assertSucceeds(db.collection("timeLogs").doc("log1").get());
    });

    it("should deny employee reading others time logs", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection("timeLogs").doc("log1").set({
          userId: "user2",
          orgId: "org1"
        });
        await context.firestore().collection("users").doc("user1").set({ orgId: "org1", role: "employee", status: "active" });
      });

      const db = getAuth("user1", "org1", "employee");
      await assertFails(db.collection("timeLogs").doc("log1").get());
    });
  });
});
