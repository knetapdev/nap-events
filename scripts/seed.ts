import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const MONGODB_URI = process.env.MONGODB_URI! || 'mongodb://localhost:27017/napevents';


// Define inline schemas to avoid import issues
const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: String,
  address: String,
  logo: String,
  website: String,
  taxId: String,
  isActive: { type: Boolean, default: true },
  settings: {
    timezone: { type: String, default: 'America/Lima' },
    currency: { type: String, default: 'PEN' },
    language: { type: String, default: 'es' },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: String,
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
}, { timestamps: true });

const EventSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  location: String,
  address: String,
  startDate: Date,
  endDate: Date,
  coverImage: String,
  status: String,
  ticketConfigs: [mongoose.Schema.Types.Mixed],
  shareableLink: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
}, { timestamps: true });

const TicketSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail: String,
  guestName: String,
  guestPhone: String,
  ticketType: String,
  status: String,
  qrCode: String,
  checkInTime: Date,
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  price: Number,
  purchasedAt: Date,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
}, { timestamps: true });

const EventAssignmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  role: String,
  permissions: [String],
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
}, { timestamps: true });

const RegistrationLinkSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  code: String,
  ticketType: String,
  maxUses: Number,
  usedCount: { type: Number, default: 0 },
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
}, { timestamps: true });

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get or create models
    const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
    const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
    const EventAssignment = mongoose.models.EventAssignment || mongoose.model('EventAssignment', EventAssignmentSchema);
    const RegistrationLink = mongoose.models.RegistrationLink || mongoose.model('RegistrationLink', RegistrationLinkSchema);


    console.log('\n🔄 Step 1: Creating default company...');

    // Check if default company already exists
    let defaultCompany = await Company.findOne({ slug: 'napevents-default' });

    if (defaultCompany) {
      console.log('✅ Default company already exists:', defaultCompany.name);
    } else {
      // Create default company (without createdBy since we don't have super admin yet)
      defaultCompany = await Company.create({
        name: 'NapEvents Default',
        slug: 'napevents-default',
        email: 'info@napevents.com',
        phone: '+51 999 999 999',
        address: 'Lima, Peru',
        isActive: true,
        settings: {
          timezone: 'America/Lima',
          currency: 'PEN',
          language: 'es',
        },
      });
      console.log('✅ Default company created:', defaultCompany.name);
    }

    console.log('\n🔄 Step 2: Creating super admin...');

    // Check if super admin already exists
    let superAdmin = await User.findOne({ email: 'admin@napevents.com' });

    if (superAdmin) {
      console.log('✅ Super admin already exists');

      // Update company if it doesn't have one
      if (!superAdmin.companyId) {
        await User.updateOne(
          { _id: superAdmin._id },
          { $set: { companyId: defaultCompany._id } }
        );
        console.log('✅ Updated super admin with companyId');
      }
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 12);

      superAdmin = await User.create({
        email: 'admin@napevents.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
        isActive: true,
        companyId: defaultCompany._id,
      });

      console.log('✅ Super admin created successfully');
      console.log('   Email: admin@napevents.com');
      console.log('   Password: admin123');
    }

    // Update company's createdBy if not set
    if (!defaultCompany.createdBy) {
      await Company.updateOne(
        { _id: defaultCompany._id },
        { $set: { createdBy: superAdmin._id } }
      );
      console.log('✅ Updated company createdBy reference');
    }

    console.log('\n🔄 Step 3: Migrating existing data to default company...');

    // Migrate users without companyId
    const usersUpdated = await User.updateMany(
      { companyId: { $exists: false } },
      { $set: { companyId: defaultCompany._id } }
    );
    console.log(`✅ Migrated ${usersUpdated.modifiedCount} users to default company`);

    // Migrate events without companyId
    const eventsUpdated = await Event.updateMany(
      { companyId: { $exists: false } },
      { $set: { companyId: defaultCompany._id } }
    );
    console.log(`✅ Migrated ${eventsUpdated.modifiedCount} events to default company`);

    // Migrate tickets without companyId
    const ticketsUpdated = await Ticket.updateMany(
      { companyId: { $exists: false } },
      { $set: { companyId: defaultCompany._id } }
    );
    console.log(`✅ Migrated ${ticketsUpdated.modifiedCount} tickets to default company`);

    // Migrate event assignments without companyId
    const assignmentsUpdated = await EventAssignment.updateMany(
      { companyId: { $exists: false } },
      { $set: { companyId: defaultCompany._id } }
    );
    console.log(`✅ Migrated ${assignmentsUpdated.modifiedCount} event assignments to default company`);

    // Migrate registration links without companyId
    const linksUpdated = await RegistrationLink.updateMany(
      { companyId: { $exists: false } },
      { $set: { companyId: defaultCompany._id } }
    );
    console.log(`✅ Migrated ${linksUpdated.modifiedCount} registration links to default company`);

    console.log('\n🔄 Step 4: Generating dummy data...');

    // 1. Create additional users
    let promoter = await User.findOne({ email: 'promoter@napevents.com' });
    if (!promoter) {
      const promoterPassword = await bcrypt.hash('promoter123', 12);
      promoter = await User.create({
        email: 'promoter@napevents.com',
        password: promoterPassword,
        name: 'John Promoter',
        role: 'promoter',
        isActive: true,
        companyId: defaultCompany._id,
      });
      console.log('✅ Promoter user created');
    } else {
      console.log('✅ Promoter user already exists');
    }

    let staff = await User.findOne({ email: 'staff@napevents.com' });
    if (!staff) {
      const staffPassword = await bcrypt.hash('staff123', 12);
      staff = await User.create({
        email: 'staff@napevents.com',
        password: staffPassword,
        name: 'Jane Staff',
        role: 'staff',
        isActive: true,
        companyId: defaultCompany._id,
      });
      console.log('✅ Staff user created');
    } else {
      console.log('✅ Staff user already exists');
    }

    // Create an Admin user
    let adminUser = await User.findOne({ email: 'admin.user@napevents.com' });
    if (!adminUser) {
      const adminPassword = await bcrypt.hash('admin123', 12);
      adminUser = await User.create({
        email: 'admin.user@napevents.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'admin',
        isActive: true,
        companyId: defaultCompany._id,
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // 2. Create Events
    let techEvent = await Event.findOne({ slug: 'tech-conference-2024' });
    if (!techEvent) {
      techEvent = await Event.create({
        name: 'Tech Conference 2024',
        slug: 'tech-conference-2024',
        description: 'The biggest tech conference in Lima.',
        location: 'Centro de Convenciones de Lima',
        address: 'Av. Arqueología 206, San Borja',
        startDate: new Date('2024-10-15T09:00:00Z'),
        endDate: new Date('2024-10-17T18:00:00Z'),
        shareableLink: 'tech-conference-2024-' + Date.now().toString(36),
        status: 'published',
        ticketConfigs: [
          {
            type: 'general',
            name: 'General Admission',
            price: 150,
            quantity: 500,
            sold: 0,
            maxPerUser: 5,
            isActive: true
          },
          {
            type: 'vip',
            name: 'VIP Pass',
            price: 350,
            quantity: 100,
            sold: 0,
            maxPerUser: 2,
            isActive: true
          }
        ],
        createdBy: superAdmin._id,
        companyId: defaultCompany._id,
      });
      console.log('✅ Tech Event created');
    } else {
      console.log('✅ Tech Event already exists');
    }

    let musicFest = await Event.findOne({ slug: 'summer-music-fest' });
    if (!musicFest) {
      musicFest = await Event.create({
        name: 'Summer Music Fest',
        slug: 'summer-music-fest',
        description: 'A weekend of music and fun at the beach.',
        location: 'Playa Punta Hermosa',
        address: 'Panamericana Sur Km 45',
        startDate: new Date('2025-02-20T16:00:00Z'),
        endDate: new Date('2025-02-22T23:59:00Z'),
        shareableLink: 'summer-music-fest-' + Date.now().toString(36),
        status: 'draft',
        ticketConfigs: [
          {
            type: 'general',
            name: 'Early Bird',
            price: 80,
            quantity: 200,
            sold: 0,
            maxPerUser: 10,
            isActive: true
          }
        ],
        createdBy: superAdmin._id,
        companyId: defaultCompany._id,
      });
      console.log('✅ Music Fest created');
    } else {
      console.log('✅ Music Fest already exists');
    }

    // 3. Create Event Assignments
    const assignmentExists = await EventAssignment.findOne({
      userId: promoter._id,
      eventId: techEvent._id
    });
    if (!assignmentExists) {
      await EventAssignment.create({
        userId: promoter._id,
        eventId: techEvent._id,
        role: 'promoter',
        permissions: ['ticket:create', 'ticket:read', 'report:view'],
        assignedBy: superAdmin._id,
        companyId: defaultCompany._id,
      });
      console.log('✅ Promoter assigned to Tech Event');
    } else {
      console.log('✅ Promoter already assigned to Tech Event');
    }

    // 4. Create Registration Links
    const linkExists = await RegistrationLink.findOne({
      eventId: techEvent._id,
      code: 'TECH2024_VIP'
    });
    if (!linkExists) {
      await RegistrationLink.create({
        eventId: techEvent._id,
        code: 'TECH2024_VIP',
        ticketType: 'vip',
        maxUses: 50,
        usedCount: 0,
        isActive: true,
        createdBy: superAdmin._id,
        companyId: defaultCompany._id,
      });
      console.log('✅ Registration link created for Tech Event VIP');
    } else {
      console.log('✅ Registration link already exists');
    }

    // 5. Create Sample Tickets
    const ticketExists = await Ticket.findOne({ guestEmail: 'test@example.com' });
    if (!ticketExists) {
      await Ticket.create({
        eventId: techEvent._id,
        guestEmail: 'test@example.com',
        guestName: 'Test Guest',
        ticketType: 'general',
        status: 'confirmed',
        qrCode: 'TEST_QR_CODE_123',
        price: 150,
        purchasedAt: new Date(),
        companyId: defaultCompany._id,
      });
      console.log('✅ Sample ticket created');
    } else {
      console.log('✅ Sample ticket already exists');
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Company: ${defaultCompany.name} (${defaultCompany.slug})`);
    console.log(`\n   Users created:`);
    console.log(`   - Super Admin: admin@napevents.com / admin123`);
    console.log(`   - Admin: admin.user@napevents.com / admin123`);
    console.log(`   - Promoter: promoter@napevents.com / promoter123`);
    console.log(`   - Staff: staff@napevents.com / staff123`);
    console.log(`\n   Events created: 2 (Tech Conference 2024, Summer Music Fest)`);
    console.log(`   Total records migrated: ${usersUpdated.modifiedCount + eventsUpdated.modifiedCount + ticketsUpdated.modifiedCount + assignmentsUpdated.modifiedCount + linksUpdated.modifiedCount}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
