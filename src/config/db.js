import { connect } from 'mongoose';

async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing');
  await connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('MongoDB connected');
}

export default connectDB;
