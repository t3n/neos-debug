/// <reference types="Cypress" />
/// <reference types="Cypress-testing-library" />

describe('cache module can be used', () => {
  it('sql module can be used will bring up', () => {
    // the console is not there yet+
    cy.visit('/').openConsole();
    cy.queryByText(/cache \(/i)
      .click()
      .queryByText(/cache information/i)
      .should('exist')
      .queryByText(/cache \(/i)
      .click()
      .queryByText(/cache information/i)
      .should('not.exist');
  });
});
