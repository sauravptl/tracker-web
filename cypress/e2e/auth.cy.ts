describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login page', () => {
    cy.contains('Login to TrackFlow');
    cy.get('form').should('exist');
  });

  it('should show validation errors on empty submit', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Email is required');
    cy.contains('Password is required');
  });

  it('should show error for invalid email', () => {
    cy.get('#email').type('invalid-email');
    cy.get('#password').click(); // trigger touched
    cy.contains('Please enter a valid email address');
  });

  it('should navigate to register page', () => {
    cy.get('a[routerLink="/register"]').click();
    cy.url().should('include', '/register');
    cy.contains('Create Account');
  });

  it('should navigate to forgot password page', () => {
    cy.get('a[routerLink="/forgot-password"]').click();
    cy.url().should('include', '/forgot-password');
  });
});

describe('Registration Flow', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display register page', () => {
    cy.contains('Create Account');
  });

  it('should show validation errors on invalid input', () => {
    cy.get('#email').type('test');
    cy.get('#password').click();
    cy.contains('Please enter a valid email address');

    cy.get('#email').clear().type('test@example.com');
    cy.get('#password').type('123');
    cy.get('#email').click(); // trigger touched
    cy.contains('Password must be at least 6 characters');
  });

  it('should navigate back to login', () => {
    cy.get('a[routerLink="/login"]').click();
    cy.url().should('include', '/login');
  });
});
