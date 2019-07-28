import { getGreeting } from '../support/app.po';

describe('enigma', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to enigma!');
  });
});
