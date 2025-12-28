describe('Todo app – Toiminnalliset vaatimukset (V1–V6)', () => {
  const STORAGE_KEY = 'todo_tasks_v1';

  const createTask = (topic, description = '') => {
    if (topic !== undefined) cy.get('#topic').clear().type(topic);
    if (description !== undefined)
      cy.get('#description').clear().type(description);
    cy.get('#save-btn').click();
  };

  const getStoredTasks = () =>
    cy
      .window()
      .then((win) => JSON.parse(win.localStorage.getItem(STORAGE_KEY) || '[]'));

  beforeEach(() => {
    // Accept confirm dialog (delete)
    cy.on('window:confirm', () => true);

    // Clear storage BEFORE app bootstraps (app reads localStorage on load)
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear();
      },
    });
  });

  it('V1: Käyttäjän tulee voida luoda uusi tehtävä syöttämällä tehtävän nimi kenttään', () => {
    createTask('Testitaski', 'Testitaskin kuvaus');

    getStoredTasks().then((tasks) => {
      expect(tasks).to.have.length(1);
      expect(tasks[0].topic).to.equal('Testitaski');
    });
  });

  it('V2: Lisätyn tehtävä tulee näkyä tehtävälistassa', () => {
    createTask('Näkyvä tehtävä', 'Kuvaus');

    cy.get('#task-list').should('be.visible');
    cy.get('#task-list .task').should('have.length', 1);
    cy.get('#task-list .task')
      .first()
      .within(() => {
        cy.get('.title').should('contain', 'Näkyvä tehtävä');
        cy.get('.desc').should('contain', 'Kuvaus');
      });

    cy.get('#empty-state').should('not.be.visible');
  });

  it('V3: Käyttäjän ei tule voida lisätä tyhjää tehtävää', () => {
    // Topic empty -> app should block submit and focus topic input
    cy.get('#topic').clear();
    cy.get('#save-btn').click();

    cy.get('#task-list .task').should('have.length', 0);
    cy.get('#empty-state').should('be.visible');
    cy.get('#topic').should('be.focused');

    getStoredTasks().then((tasks) => {
      expect(tasks).to.have.length(0);
    });
  });

  it('V4: Tehdyn tehtävän tila tulee näkyä käyttäjälle', () => {
    createTask('Valmis taski', 'Tarkista done-tila');

    cy.get('#task-list .task').should('have.length', 1);

    cy.get('#task-list .task')
      .first()
      .within(() => {
        cy.get('button[data-action="complete"]').click();

        // UI: class + status badge
        cy.root().should('have.class', 'done');
        cy.contains('.badge', 'Done').should('be.visible');
      });

    // Storage: completed + status
    getStoredTasks().then((tasks) => {
      expect(tasks).to.have.length(1);
      expect(tasks[0].completed).to.equal(true);
      expect(tasks[0].status).to.equal('done');
    });
  });

  it('V5: Käyttäjän tulee voida poistaa tehtävä', () => {
    createTask('Poistettava taski', 'Tämä poistetaan');

    cy.get('#task-list .task').should('have.length', 1);

    cy.get('#task-list .task')
      .first()
      .within(() => {
        cy.get('button[data-action="delete"]').click();
      });

    getStoredTasks().then((tasks) => {
      expect(tasks).to.have.length(0);
    });
  });

  it('V6: Poistettu tehtävä ei tule näkyä tehtävälistassa', () => {
    createTask('Poistettava taski', 'Tämä poistetaan');

    cy.get('#task-list .task').should('have.length', 1);

    cy.get('#task-list .task')
      .first()
      .within(() => {
        cy.get('button[data-action="delete"]').click();
      });

    cy.get('#task-list .task').should('have.length', 0);
    cy.get('#empty-state').should('be.visible');
  });
});
