const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Failed to set custom DNS servers:', e.message);
}

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Listing = require('../models/Listing');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

async function migrate() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('ERROR: MONGODB_URI is not defined in backend/.env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas database...');
    console.log('Target Cluster:', mongoUri.replace(/:([^@]+)@/, ':****@'));

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000
    });
    console.log('Connected to MongoDB Atlas successfully!');

    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      console.log('No backend/data folder found. Seeding from scratch...');
      process.exit(0);
    }

    const loadJson = (filename) => {
      const filePath = path.join(dataDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
          console.error(`Error reading ${filename}:`, e.message);
        }
      }
      return [];
    };

    const usersData = loadJson('users.json');
    const profilesData = loadJson('studentprofiles.json');
    const companiesData = loadJson('companies.json');
    const listingsData = loadJson('listings.json');
    const applicationsData = loadJson('applications.json');
    const notificationsData = loadJson('notifications.json');

    console.log(`Loaded JSON: ${usersData.length} Users, ${companiesData.length} Companies, ${listingsData.length} Listings.`);

    // Drop collections to clear old unique indexes
    try { await mongoose.connection.db.dropCollection('companies'); } catch (e) {}
    try { await mongoose.connection.db.dropCollection('users'); } catch (e) {}
    try { await mongoose.connection.db.dropCollection('studentprofiles'); } catch (e) {}
    try { await mongoose.connection.db.dropCollection('listings'); } catch (e) {}
    try { await mongoose.connection.db.dropCollection('applications'); } catch (e) {}
    try { await mongoose.connection.db.dropCollection('notifications'); } catch (e) {}

    // 1. Migrate Users
    if (usersData.length > 0) {
      await User.insertMany(usersData.map(u => ({
        ...u,
        _id: new mongoose.Types.ObjectId(u._id)
      })));
      console.log(`✅ Migrated ${usersData.length} Users into MongoDB Atlas.`);
    }

    // 2. Migrate StudentProfiles
    if (profilesData.length > 0) {
      await StudentProfile.insertMany(profilesData.map(p => ({
        ...p,
        _id: new mongoose.Types.ObjectId(p._id),
        userId: new mongoose.Types.ObjectId(p.userId._id || p.userId),
        savedListings: (p.savedListings || []).map(id => new mongoose.Types.ObjectId(id))
      })));
      console.log(`✅ Migrated ${profilesData.length} StudentProfiles into MongoDB Atlas.`);
    }

    // 3. Migrate Companies
    if (companiesData.length > 0) {
      await Company.insertMany(companiesData.map(c => ({
        ...c,
        _id: new mongoose.Types.ObjectId(c._id),
        userId: new mongoose.Types.ObjectId(c.userId._id || c.userId)
      })));
      console.log(`✅ Migrated ${companiesData.length} Companies into MongoDB Atlas.`);
    }

    // 4. Migrate Listings
    if (listingsData.length > 0) {
      await Listing.insertMany(listingsData.map(l => ({
        ...l,
        _id: new mongoose.Types.ObjectId(l._id),
        companyId: new mongoose.Types.ObjectId(l.companyId._id || l.companyId)
      })));
      console.log(`✅ Migrated ${listingsData.length} Listings into MongoDB Atlas.`);
    }

    // 5. Migrate Applications
    if (applicationsData.length > 0) {
      await Application.insertMany(applicationsData.map(a => ({
        ...a,
        _id: new mongoose.Types.ObjectId(a._id),
        listingId: new mongoose.Types.ObjectId(a.listingId._id || a.listingId),
        studentId: new mongoose.Types.ObjectId(a.studentId._id || a.studentId)
      })));
      console.log(`✅ Migrated ${applicationsData.length} Applications into MongoDB Atlas.`);
    }

    // 6. Migrate Notifications
    if (notificationsData.length > 0) {
      await Notification.insertMany(notificationsData.map(n => ({
        ...n,
        _id: new mongoose.Types.ObjectId(n._id),
        userId: new mongoose.Types.ObjectId(n.userId),
        relatedId: new mongoose.Types.ObjectId(n.relatedId)
      })));
      console.log(`✅ Migrated ${notificationsData.length} Notifications into MongoDB Atlas.`);
    }

    console.log('🎉 MongoDB Atlas Data Migration Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
