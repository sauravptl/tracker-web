describe('Dashboard & Navigation', () => {
  // Use a unique email for each run
  const uniqueId = Cypress._.random(0, 1e6);
  const testEmail = `dashboard_test_${uniqueId}_${Date.now()}@example.com`;
  const testPassword = 'password123';

  before(() => {
    cy.log('Creating user:', testEmail);
    // Clear IndexedDB to ensure no persisted auth state
    cy.window().then((win) => {
      return new Promise<void>((resolve) => {
        const req = win.indexedDB.deleteDatabase('firebaseLocalStorageDb');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve(); // Ignore errors, just continue
        req.onblocked = () => resolve();
      });
    });

    cy.createTestUser(testEmail, testPassword);
  });

  beforeEach(() => {
    // We might need to re-login if session is cleared, but let's assume session persists for now in the browser context
    // or we can check url and login if needed.
    // However, Cypress clears cookies between tests.
    // So we probably need to login before EACH test.
    cy.login(testEmail, testPassword);
  });

  it('should display dashboard stats', () => {
    cy.contains('h1', 'Dashboard', { timeout: 10000 });
    cy.contains('My Tasks');
    cy.contains('Hours Today');
    cy.contains('Team Status');
  });

  it('should navigate to Tasks page', () => {
    // Navigate via sidebar or URL
    cy.visit('/tasks');
    cy.url().should('include', '/tasks');
    cy.contains('h1', 'Tasks Board', { timeout: 15000 }).should('be.visible');
  });

  it('should navigate to Time Tracker page', () => {
    cy.visit('/time-tracker');
    cy.url().should('include', '/time-tracker');
    cy.contains('h1', 'Time Tracker', { timeout: 15000 }).should('be.visible');
  });

  it('should navigate to HR pages', () => {
    cy.visit('/hr/leaves');
    cy.url().should('include', '/hr/leaves');
    cy.contains('h1', 'Leave Requests', { timeout: 15000 }).should('be.visible');
  });
});
