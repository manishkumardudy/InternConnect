const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB, isMock } = require('./config/db');
const { initSocket } = require('./config/socket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Custom inline cookie parser middleware
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(c => {
      const parts = c.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        req.cookies[key] = value;
      }
    });
  }
  next();
});

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the InternConnect API!',
    mode: isMock() ? 'Zero-Config Local Mode' : 'Production MERN Mode',
    status: 'Running'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
async function start() {
  // Await DB Connection BEFORE importing models or mounting routes
  await connectDB();

  const models = require('./models');
  const { COMPANIES, generateListings } = require('./config/indianData');

  // Mount Routes after DB initialization
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/students', require('./routes/studentRoutes'));
  app.use('/api/companies', require('./routes/recruiterRoutes'));
  app.use('/api/listings', require('./routes/listingRoutes'));
  app.use('/api/applications', require('./routes/applicationRoutes'));
  app.use('/api/notifications', require('./routes/notificationRoutes'));
  app.use('/api/friends', require('./routes/friendRoutes'));
  app.use('/api/posts', require('./routes/postRoutes'));
  app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
  app.use('/api/otp', require('./routes/otpRoutes'));
  app.use('/api/resume-builder', require('./routes/resumeBuilderRoutes'));
  app.use('/api/login-history', require('./routes/loginHistoryRoutes'));

  // Seeder function for sample data
  try {
    const listingCount = await models.Listing.countDocuments();
    if (listingCount === 0) {
      console.log('Pre-populating database with 50+ companies and 250+ listings...');

      const recruiterUser = await models.User.create({
        email: 'recruiter@techcorp.com',
        name: 'Rahul Sharma',
        role: 'recruiter',
        firebaseUid: 'recruiter-default-uid',
        password: 'password123'
      });

      const recruiter2 = await models.User.create({
        email: 'hiring@designlabs.co',
        name: 'Aisha Gupta',
        role: 'recruiter',
        firebaseUid: 'recruiter-design-uid',
        password: 'password123'
      });

      const studentUser = await models.User.create({
        email: 'student@college.edu',
        name: 'Priya Patel',
        role: 'student',
        firebaseUid: 'student-default-uid',
        password: 'password123'
      });

      await models.StudentProfile.create({
        userId: studentUser._id,
        college: 'National Institute of Technology (NIT)',
        degree: 'Bachelor of Technology (B.Tech) - CSE',
        graduationYear: 2027,
        skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Python', 'Figma'],
        location: 'Bangalore',
        bio: 'Enthusiastic final-year engineering student passionate about building scalable web applications and UI interfaces.',
        resumeUrl: 'http://localhost:5000/uploads/sample-resume.pdf',
        savedListings: []
      });

      const companiesToCreate = COMPANIES.map((comp, i) => {
        const ownerUserId = i === 0 ? recruiterUser._id : (i === 1 ? recruiter2._id : recruiterUser._id);
        return {
          userId: ownerUserId,
          companyName: comp.companyName,
          logoUrl: comp.logoUrl,
          website: comp.website,
          industry: comp.industry,
          companySize: comp.companySize,
          description: comp.description,
          location: comp.location
        };
      });
      const createdCompanies = await models.Company.insertMany(companiesToCreate);

      const listingsData = generateListings(createdCompanies);
      await models.Listing.insertMany(listingsData);

      console.log(`Seeder completed successfully. Seeded ${createdCompanies.length} companies and ${listingsData.length} listings!`);
    } else {
      console.log(`Database contains ${listingCount} listings. Skipping seeder...`);
    }

    // Category backfill migration for existing listings without a specific category
    const uncatListings = await models.Listing.find({
      $or: [{ category: { $exists: false } }, { category: null }, { category: 'Other' }]
    });
    if (uncatListings.length > 0) {
      const ops = uncatListings.map(item => {
        const titleLower = (item.title || '').toLowerCase();
        let cat = 'Other';
        if (titleLower.includes('design') || titleLower.includes('ui/ux') || titleLower.includes('ux') || titleLower.includes('user research')) {
          cat = 'Design & Creative';
        } else if (titleLower.includes('ai') || titleLower.includes('machine learning') || titleLower.includes('data') || titleLower.includes('analyst') || titleLower.includes('bi')) {
          cat = 'Data & Analytics';
        } else if (titleLower.includes('marketing') || titleLower.includes('seo') || titleLower.includes('social media') || titleLower.includes('sales')) {
          cat = 'Marketing & Sales';
        } else if (titleLower.includes('finance') || titleLower.includes('financial') || titleLower.includes('accounting') || titleLower.includes('tally')) {
          cat = 'Finance & Commerce';
        } else if (titleLower.includes('writer') || titleLower.includes('content') || titleLower.includes('copywriting')) {
          cat = 'Content & Writing';
        } else if (titleLower.includes('hr') || titleLower.includes('human resources') || titleLower.includes('recruiter') || titleLower.includes('talent')) {
          cat = 'Human Resources';
        } else if (titleLower.includes('product') || titleLower.includes('business') || titleLower.includes('management')) {
          cat = 'Business & Management';
        } else if (titleLower.includes('operations') || titleLower.includes('logistics')) {
          cat = 'Operations';
        } else {
          cat = 'Engineering & Technology';
        }
        return {
          updateOne: {
            filter: { _id: item._id },
            update: { $set: { category: cat } }
          }
        };
      });
      await models.Listing.bulkWrite(ops);
      console.log(`Classified ${uncatListings.length} listings into specific categories.`);
    }
  } catch (error) {
    console.error('Error seeding/migrating database:', error);
  }

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error('Express Error Handler:', err.stack);
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error occurred on API.'
    });
  });

  // Guard against port conflicts — crash loudly instead of silently failing
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error('========================================');
      console.error(`[FATAL] PID: ${process.pid} | Port ${PORT} is ALREADY IN USE!`);
      console.error('Another backend process is likely running.');
      console.error('Run: taskkill /IM node.exe /F   then restart.');
      console.error('========================================');
      process.exit(1);
    }
    throw err;
  });

  server.listen(PORT, () => {
    console.log(`[BOOT] PID: ${process.pid} | DB Mode: ${isMock() ? 'LOCAL FALLBACK (BUG!)' : 'ATLAS'} | Server running on port ${PORT}`);
  });
}

start();
