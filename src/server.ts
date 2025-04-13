import express, { Request, Response } from 'express';

export const app = express();
const port = 3001;

app.use(express.json());

// Beispiel-Route
app.get('/', (req: Request, res: Response): void => {
  res.json({ message: 'Willkommen zum Testing-Tutorial!' });
});

// Beispiel-Route mit Parameter
app.get('/hello/:name', (req: Request<{ name: string }>, res: Response): void => {
  const { name } = req.params;
  res.json({ message: `Hallo ${name}!` });
});

// Beispiel-POST-Route
app.post('/sum', (req: Request<{}, {}, { a: number; b: number }>, res: Response): void => {
  const { a, b } = req.body;
  if (typeof a !== 'number' || typeof b !== 'number') {
    res.status(400).json({ error: 'Bitte geben Sie zwei Zahlen ein' });
    return;
  }
  res.json({ result: a + b });
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
}); 