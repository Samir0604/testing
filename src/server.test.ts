import request from 'supertest';
import { app } from './server';

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