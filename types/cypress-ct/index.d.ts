declare namespace Cypress {
  interface Chainable<Subject = any> {
    mount(component: any, options?: any): Chainable<Subject>;
  }

  interface Cypress {
    Commands: {
      add(name: string, fn: (...args: any[]) => any): void;
    };
  }
}

declare const cy: Cypress.Chainable;
declare const Cypress: Cypress.Cypress;

declare function beforeEach(fn: () => void): void;
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void): void;

declare module 'cypress/react18' {
  export function mount(component: any, options?: any): Cypress.Chainable<any>;
}
