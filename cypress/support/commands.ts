// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

Cypress.Commands.add('createTestUser', (email, password) => {
  cy.visit('/register');
  cy.get('#email').should('be.visible').type(email);
  cy.get('#password').should('be.visible').type(password);

  // Ensure button is enabled
  cy.get('button[type="submit"]').should('not.be.disabled').click();

  // Wait for navigation to onboarding
  // If it fails, we might see an error alert (Cypress stubs window:alert by default)
  cy.on('window:alert', (str) => {
    console.error('Window Alert:', str);
    throw new Error('Registration failed with alert: ' + str);
  });

  cy.url().should('include', '/onboarding', { timeout: 15000 });

  // Complete onboarding
  cy.get('#orgName').should('be.visible').type('Test Corp');
  cy.get('button[type="submit"]').should('not.be.disabled').click();

  // Wait for navigation to dashboard
  cy.url().should('include', '/dashboard', { timeout: 15000 });
});

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('#email').should('be.visible').type(email);
  cy.get('#password').should('be.visible').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard', { timeout: 10000 });
});

declare namespace Cypress {
  interface Chainable {
    createTestUser(email: string, password: string): Chainable<void>;
    login(email: string, password: string): Chainable<void>;
  }
}
