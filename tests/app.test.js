import { describe, test, expect } from 'vitest';
import {
  addTask,
  toggleTaskComplete,
  deleteTaskById,
  isValidNewTask,
} from '../public/todoLogic.js';

describe('Toiminnalliset vaatimukset (V1–V6) – yksikkötestit (ilman JSDOM)', () => {
  test('V1: käyttäjä voi luoda uuden tehtävän antamalla nimen', () => {
    const tasks = [];
    const result = addTask(
      tasks,
      {
        topic: 'Uusi tehtävä',
        priority: 'medium',
        status: 'todo',
        description: '',
      },
      { now: 1700000000000, id: 't1' }
    );

    expect(result.added).toBe(true);
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].topic).toBe('Uusi tehtävä');
  });

  test('V2: lisätty tehtävä näkyy tehtävälistassa (täällä: on datassa mukana)', () => {
    const { tasks } = addTask(
      [],
      {
        topic: 'Näkyvä tehtävä',
        priority: 'low',
        status: 'todo',
        description: '',
      },
      { now: 1700000000000, id: 't2' }
    );

    expect(tasks.some((t) => t.id === 't2')).toBe(true);
  });

  test('V3: käyttäjä ei voi lisätä tyhjää tehtävää', () => {
    expect(
      isValidNewTask({ topic: '', priority: 'medium', status: 'todo' })
    ).toBe(false);

    const result = addTask(
      [],
      { topic: '', priority: 'medium', status: 'todo', description: '' },
      { now: 1700000000000, id: 't3' }
    );
    expect(result.added).toBe(false);
    expect(result.tasks).toHaveLength(0);
  });

  test('V3: käyttäjä ei voi lisätä pelkkiä välilyöntejä', () => {
    const result = addTask(
      [],
      { topic: '   ', priority: 'medium', status: 'todo', description: '' },
      { now: 1700000000000, id: 't4' }
    );
    expect(result.added).toBe(false);
    expect(result.tasks).toHaveLength(0);
  });

  test('V4: tehdyn tehtävän tila näkyy käyttäjälle (täällä: completed=true ja status=done)', () => {
    const created = addTask(
      [],
      {
        topic: 'Valmistuva',
        priority: 'high',
        status: 'todo',
        description: '',
      },
      { now: 1700000000000, id: 't5' }
    );

    const toggled = toggleTaskComplete(created.tasks, 't5', {
      now: 1700000001000,
    });

    expect(toggled.toggled).toBe(true);
    expect(toggled.tasks[0].completed).toBe(true);
    expect(toggled.tasks[0].status).toBe('done');
  });

  test('V5: käyttäjä voi poistaa tehtävän', () => {
    const created = addTask(
      [],
      {
        topic: 'Poistettava',
        priority: 'medium',
        status: 'todo',
        description: '',
      },
      { now: 1700000000000, id: 't6' }
    );

    const deleted = deleteTaskById(created.tasks, 't6');
    expect(deleted.deleted).toBe(true);
    expect(deleted.tasks).toHaveLength(0);
  });

  test('V6: poistettu tehtävä ei näy tehtävälistassa (täällä: ei ole datassa)', () => {
    const created = addTask(
      [],
      {
        topic: 'Poistettava',
        priority: 'medium',
        status: 'todo',
        description: '',
      },
      { now: 1700000000000, id: 't7' }
    );

    const deleted = deleteTaskById(created.tasks, 't7');
    expect(deleted.tasks.some((t) => t.id === 't7')).toBe(false);
  });
});
