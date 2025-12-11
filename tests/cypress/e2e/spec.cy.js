describe('Todo app', () => {
  beforeEach(() => {
    cy.visit('/');
    // Clear localStorage before each test for isolation
    cy.clearLocalStorage();
  });

  it('creates a new task and displays it in the list', () => {
    // Fill in the form
    cy.get('#topic').type('Testitaski').should('have.value', 'Testitaski');
    cy.get('#description')
      .type('Testitaskin kuvaus')
      .should('have.value', 'Testitaskin kuvaus');

    // Submit the form
    cy.get('#save-btn').click();

    // Verify the task appears in the list
    cy.get('#task-list').should('be.visible');
    cy.get('#task-list .task').should('have.length', 1);

    // Check the task contains correct content
    cy.get('#task-list .task')
      .first()
      .within(() => {
        cy.get('.title').should('contain', 'Testitaski');
        cy.get('.desc').should('contain', 'Testitaskin kuvaus');
      });

    // Verify empty state is hidden
    cy.get('#empty-state').should('not.be.visible');

    // Verify task is persisted in localStorage
    cy.window().then((win) => {
      const tasks = JSON.parse(win.localStorage.getItem('todo_tasks_v1'));
      expect(tasks).to.have.length(1);
      expect(tasks[0].topic).to.equal('Testitaski');
      expect(tasks[0].description).to.equal('Testitaskin kuvaus');
      expect(tasks[0].priority).to.equal('medium'); // default value
      expect(tasks[0].status).to.equal('todo'); // default value
      expect(tasks[0].completed).to.be.false;
    });
  });

  it('deletes a task and verifies it is removed', () => {
    // First, create a task
    cy.get('#topic').type('Poistettava taski');
    cy.get('#description').type('Tämä poistetaan');
    cy.get('#save-btn').click();

    // Verify task was created
    cy.get('#task-list .task').should('have.length', 1);
    cy.get('#task-list .task .title').should('contain', 'Poistettava taski');

    // Delete the task
    cy.get('#task-list .task')
      .first()
      .within(() => {
        cy.get('button[data-action="delete"]').click();
      });

    // Verify task is removed from the list
    cy.get('#task-list .task').should('have.length', 0);

    // Verify empty state is displayed
    cy.get('#empty-state').should('be.visible');

    // Verify task is removed from localStorage
    cy.window().then((win) => {
      const tasks = JSON.parse(win.localStorage.getItem('todo_tasks_v1'));
      expect(tasks).to.have.length(0);
    });
  });
});
