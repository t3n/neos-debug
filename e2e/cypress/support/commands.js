// <reference types="Cypress" />
// <reference types="Cypress-testing-library" />

Cypress.Commands.add('openConsole', (setCookie = false) => {
  cy.window()
    .should('have.property', '__enable_neos_debug__')
    .then(debugStartupScript => debugStartupScript(setCookie));
});
