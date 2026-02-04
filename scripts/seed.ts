import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/napevents';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: String,
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const existingAdmin = await User.findOne({ email: 'admin@napevents.com' });

    if (existingAdmin) {
      console.log('Super admin already exists');
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 12);

      await User.create({
        email: 'admin@napevents.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
        isActive: true,
      });

      console.log('Super admin created successfully');
      console.log('Email: admin@napevents.com');
      console.log('Password: admin123');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
