import { getGreeting } from '../support/app.po';

describe('microwave-app', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to microwave-app!');
  });
});
