import mongoose from 'mongoose';

function buildMongoUri() {
  if (process.env.MONGODB_URI && !process.env.MONGODB_USER) {
    return process.env.MONGODB_URI;
  }

  const user = process.env.MONGODB_USER;
  const password = process.env.MONGODB_PASSWORD;
  const cluster = process.env.MONGODB_CLUSTER || 'cluster0.nh9male.mongodb.net';
  const db = process.env.MONGODB_DB || 'adama_citizen';

  if (!user || !password) {
    return process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/adama_citizen';
  }

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);

  return `mongodb+srv://${encodedUser}:${encodedPassword}@${cluster}/${db}?retryWrites=true&w=majority&appName=Cluster0&authSource=admin`;
}

export async function connectDB() {
  const uri = buildMongoUri();
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`MongoDB connected (${mongoose.connection.name})`);
  } catch (err) {
    if (err.code === 8000 || err.codeName === 'AtlasError') {
      console.error(
        'MongoDB Atlas authentication failed. Check MONGODB_USER and MONGODB_PASSWORD in backend/.env'
      );
    }
    throw err;
  }
}
