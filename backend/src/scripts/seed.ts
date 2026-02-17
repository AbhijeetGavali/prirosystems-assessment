import mongoose from 'mongoose';
import { User } from '../models/User';
import { UserRole } from '../types';
import config from '../config';

const seedUsers = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create users
    const users = [
      { name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: UserRole.ADMIN },
      { name: 'John Submitter', email: 'submitter1@example.com', password: 'submit123', role: UserRole.SUBMITTER },
      { name: 'Jane Submitter', email: 'submitter2@example.com', password: 'submit123', role: UserRole.SUBMITTER },
      { name: 'Alice Approver', email: 'approver1@example.com', password: 'approve123', role: UserRole.APPROVER },
      { name: 'Bob Approver', email: 'approver2@example.com', password: 'approve123', role: UserRole.APPROVER },
      { name: 'Charlie Approver', email: 'approver3@example.com', password: 'approve123', role: UserRole.APPROVER },
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Submitter: submitter1@example.com / submit123');
    console.log('Approver: approver1@example.com / approve123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedUsers();
