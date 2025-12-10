import { describe } from 'vitest';

<reference types="cypress" />;

describe('My First Test', () => {
  it('Clicking "type" shows the right headings', () => {
    cy.visit('http://example.cypress.io');

    cy.wait(5000);

    cy.contains('type').click();

    cy.wait(5000);

    cy.url().should('include', '/commands/actions');

    cy.get('.action-email')
      .type('fake@email.com')
      .should('have.value', 'fake@email.com');
  });
});
