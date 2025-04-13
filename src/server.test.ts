import request from 'supertest';
import { app } from './server';
import { User } from './models/User';
import { connectDB, disconnectDB } from './db';

// Vor allen Tests
beforeAll(async () => { // dokumentieren
  await connectDB();
});

// Nach allen Tests
afterAll(async () => { // dokumentieren
  await disconnectDB();
});

// Vor jedem Test
beforeEach(async () => { // dokumentieren
  await User.deleteMany({});
});

describe('Server Tests', () => {
  test('GET / sollte eine Willkommensnachricht zurückgeben', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Willkommen zum Testing-Tutorial!' });
  });

  test('GET /hello/:name sollte eine personalisierte Begrüßung zurückgeben', async () => {
    const name = 'Samir';
    const response = await request(app).get(`/hello/${name}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: `Hallo ${name}!` });
  });

  test('POST /sum sollte die Summe zweier Zahlen zurückgeben', async () => {
    const response = await request(app)
      .post('/sum')
      .send({ a: 5, b: 3 });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ result: 8 });
  });

  test('POST /sum sollte einen Fehler zurückgeben, wenn keine Zahlen übergeben werden', async () => {
    const response = await request(app)
      .post('/sum')
      .send({ a: 'keine Zahl', b: 3 });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Bitte geben Sie zwei Zahlen ein' });
  });
});

describe('User API Tests', () => {
  test('sollte einen neuen User erstellen', async () => {
    const userData = {
      name: 'Samir',
      email: 'samir@example.com',
      age: 30
    };

    const response = await request(app)
      .post('/users')
      .send(userData); // dokumentieren

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(userData);
    expect(response.body).toHaveProperty('_id');
  });

  test('sollte Fehler bei ungültigen Daten zurückgeben', async () => {
    const invalidUser = {
      name: 'Samir',
      email: 'keine-email', // Ungültige E-Mail
      age: 'keine-zahl' // Ungültiges Alter
    };

    const response = await request(app)
      .post('/users')
      .send(invalidUser); // dokumentieren

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('sollte Fehler bei doppelter E-Mail zurückgeben', async () => {
    // Ersten User erstellen
    const userData = {
      name: 'Samir',
      email: 'samir@example.com',
      age: 30
    };
    await request(app).post('/users').send(userData); // dokumentieren

    // Versuchen, User mit gleicher E-Mail zu erstellen
    const response = await request(app)
      .post('/users')
      .send(userData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email bereits vergeben');
  });

  describe('GET /users/:id', () => {
    test('sollte einen User finden', async () => {
      // User erstellen
      const userData = {
        name: 'Samir',
        email: 'samir@example.com',
        age: 30
      };
      const createResponse = await request(app)
        .post('/users')
        .send(userData); // dokumentieren
      const userId = createResponse.body._id;

      // User abrufen
      const response = await request(app)
        .get(`/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(userData);
    });

    test('sollte 404 bei nicht existierendem User zurückgeben', async () => {
      const response = await request(app)
        .get('/users/123456789012345678901234');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User nicht gefunden');
    });
  });

  describe('PUT /users/:id', () => {
    test('sollte einen User aktualisieren', async () => {
      // User erstellen
      const userData = {
        name: 'Samir',
        email: 'samir@example.com',
        age: 30
      };
      const createResponse = await request(app)
        .post('/users')
        .send(userData);
      const userId = createResponse.body._id;

      // User aktualisieren
      const updateData = { name: 'Neuer Name', age: 31 };
      const response = await request(app)
        .put(`/users/${userId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updateData);
    });

    test('sollte Fehler bei ungültigen Updates zurückgeben', async () => {
      // User erstellen
      const userData = {
        name: 'Samir',
        email: 'samir@example.com',
        age: 30
      };
      const createResponse = await request(app)
        .post('/users')
        .send(userData);
      const userId = createResponse.body._id;

      // Ungültiges Update versuchen
      const response = await request(app)
        .put(`/users/${userId}`)
        .send({ age: 'keine-zahl' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /users/:id', () => {
    test('sollte einen User löschen', async () => {
      // User erstellen
      const userData = {
        name: 'Samir',
        email: 'samir@example.com',
        age: 30
      };
      const createResponse = await request(app)
        .post('/users')
        .send(userData);
      const userId = createResponse.body._id;

      // User löschen
      const response = await request(app)
        .delete(`/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User erfolgreich gelöscht');

      // Überprüfen, ob User wirklich gelöscht wurde
      const getResponse = await request(app)
        .get(`/users/${userId}`);
      expect(getResponse.status).toBe(404);
    });
  });
}); 