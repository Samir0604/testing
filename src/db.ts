import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/testing');
    console.log('MongoDB verbunden');
  } catch (error) {
    console.error('MongoDB Verbindungsfehler:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB Verbindung geschlossen');
  } catch (error) {
    console.error('Fehler beim Schließen der MongoDB Verbindung:', error);
    process.exit(1);
  }
}; 