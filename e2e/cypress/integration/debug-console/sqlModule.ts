/// <reference types="Cypress" />
/// <reference types="Cypress-testing-library" />

describe('sql module can be used', () => {
  it('sql module can be used will bring up', () => {
    // the console is not there yet+
    cy.visit('/').openConsole();
    cy.queryByText(/sql \(/i)
      .click()
      .queryByText(/sql information/i)
      .should('exist')
      .queryByText(/Slow Queries:/i)
      .should('exist')
      .queryByText(/sql \(/i)
      .click()
      .queryByText(/sql information/i)
      .should('not.exist');
  });
});
