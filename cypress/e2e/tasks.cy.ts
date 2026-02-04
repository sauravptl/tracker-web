describe('Task Management', () => {
  const uniqueId = Cypress._.random(0, 1e6);
  const testEmail = `tasks_test_${uniqueId}_${Date.now()}@example.com`;
  const testPassword = 'password123';

  before(() => {
    cy.window().then((win) => {
      return new Promise<void>((resolve) => {
        const req = win.indexedDB.deleteDatabase('firebaseLocalStorageDb');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      });
    });
    cy.createTestUser(testEmail, testPassword);
  });

  beforeEach(() => {
    cy.login(testEmail, testPassword);
    cy.visit('/tasks');
  });

  it('should display task board', () => {
    cy.contains('Tasks Board', { timeout: 10000 });
    cy.contains('TODO');
    cy.contains('IN PROGRESS');
    cy.contains('DONE');
  });

  it('should open add task modal', () => {
    cy.contains('button', 'Add Task').click();
    cy.contains('h2', 'Add New Task').should('be.visible');
    cy.get('form').should('be.visible');
  });

  it('should create a new task', () => {
    const taskTitle = 'E2E Test Task ' + Date.now();

    cy.contains('button', 'Add Task').click();
    cy.get('input[formControlName="title"]').should('be.visible').type(taskTitle);
    cy.get('select[formControlName="priority"]').select('HIGH');

    // Assign to self
    cy.get('select[formControlName="assignedTo"]').should('exist');
    // Wait for users to be populated in the dropdown with a longer timeout
    cy.get('select[formControlName="assignedTo"] option', { timeout: 10000 }).should('have.length.at.least', 1);

    // Select by text (email or name).
    cy.get('select[formControlName="assignedTo"]').select(testEmail);

    cy.get('button[type="submit"]').click();

    // Verify task appears in TODO column
    cy.contains(taskTitle, { timeout: 10000 }).should('exist');
    cy.contains('HIGH').should('exist');
  });
});
