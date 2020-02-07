import { getGreeting } from '../support/app.po';

describe('timers-app', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to timers-app!');
  });
});
