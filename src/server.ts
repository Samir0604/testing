import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { connectDB } from './db';
import { User } from './models/User';

export const app = express();
const port = 3001;

// MongoDB Verbindung
connectDB();

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

// User erstellen
app.post('/users', async (req: Request<{}, {}, { name: string; email: string; age: number }>, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error: error.message });
    } else if (error.code === 11000) {
      res.status(400).json({ error: 'Email bereits vergeben' });
    } else {
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  }
});

// User finden
app.get('/users/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User nicht gefunden' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// User aktualisieren
app.put('/users/:id', async (req: Request<{ id: string }, {}, { name?: string; age?: number }>, res: Response) => {
  try {
    // Validierung des Inputs
    if (req.body.age && typeof req.body.age !== 'number') {
      return res.status(400).json({ error: 'Alter muss eine Zahl sein' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User nicht gefunden' });
    }
    res.json(user);
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError || error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  }
});

// User löschen
app.delete('/users/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User nicht gefunden' });
    }
    res.json({ message: 'User erfolgreich gelöscht' });
  } catch (error: any) {
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Nur im Produktionsmodus starten
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
  });
} 