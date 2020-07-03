import { getGreeting } from '../support/app.po';

describe('time-s-up-app', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to time-s-up-app!');
  });
});
