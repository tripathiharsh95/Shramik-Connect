const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Booking = require('./models/Booking');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/labour_booking');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing data');

    // Create admin
    const admin = await User.create({
      name: 'Admin User', email: 'admin@shramik.com', password: 'admin123456', role: 'admin',
      phone: '+91 99999 00000', city: 'Bengaluru', area: 'MG Road'
    });

    // Create customers
    const customer1 = await User.create({
      name: 'Priya Sharma', email: 'priya@example.com', password: 'password1234', role: 'customer',
      phone: '+91 98765 43210', city: 'Bengaluru', area: 'Indiranagar'
    });
    const customer2 = await User.create({
      name: 'Rahul Verma', email: 'rahul@example.com', password: 'password1234', role: 'customer',
      phone: '+91 87654 32109', city: 'Delhi', area: 'Saket'
    });

    // Create workers
    const workers = await User.insertMany([
      { 
        name: 'Ravi Kumar', 
        email: 'ravi@example.com', 
        password: await bcrypt.hash('password1234', 12), 
        role: 'worker', 
        phone: '+919765411111', 
        profession: 'Plumber - Tap, pipe, leakage repair, new bathroom fitting and pipeline work.', 
        skills: ['Plumber', 'Bathroom Fitter', 'Drainage Cleaner', 'Leakage Repair'], 
        hourlyRate: 550, 
        rateType: 'day',
        city: 'Bengaluru', 
        state: 'Karnataka',
        area: 'Indiranagar', 
        rating: 4.8, 
        jobsCompleted: 142, 
        isVerified: true, 
        isAvailable: true, 
        about: 'Expert plumber with 8+ years of experience in high-end residential and commercial pipeline installations.',
        experienceYears: 8,
        gender: 'male',
        qualification: 'Diploma',
        address: 'Sector 4, HSR Layout, Bengaluru',
        avatar: 'male_1',
        acceptedPaymentMethods: ['cash', 'upi', 'bank'],
        upiId: 'ravi@okaxis',
        bankName: 'State Bank of India',
        accountHolderName: 'Ravi Kumar',
        accountNumber: '123456789012',
        ifscCode: 'SBIN0001234',
        workerType: 'individual'
      },
      { 
        name: 'Suresh Patil', 
        email: 'suresh@example.com', 
        password: await bcrypt.hash('password1234', 12), 
        role: 'worker', 
        phone: '+919765422222', 
        profession: 'Electrician - House wiring, MCB box, meter fitting, light-fan installation and fault repair.', 
        skills: ['Electrician', 'AC Technician', 'House wiring', 'Appliance Repair'], 
        hourlyRate: 600, 
        rateType: 'day',
        city: 'Bengaluru', 
        state: 'Karnataka',
        area: 'Koramangala', 
        rating: 4.6, 
        jobsCompleted: 89, 
        isVerified: true, 
        isAvailable: true, 
        about: 'Certified electrician available for safe house wiring, appliance setup, and rapid troubleshooting of power issues.',
        experienceYears: 5,
        gender: 'male',
        qualification: 'ITI Certified',
        address: 'A Block, Koramangala 4th Block, Bengaluru',
        avatar: 'male_2',
        acceptedPaymentMethods: ['cash', 'upi'],
        upiId: 'suresh@okpaytm',
        workerType: 'individual'
      },
      { 
        name: 'Amit Singh', 
        email: 'amit@example.com', 
        password: await bcrypt.hash('password1234', 12), 
        role: 'worker', 
        phone: '+919765433333', 
        profession: 'Carpenter / Furniture Mistri - Door, window, modular kitchen, wardrobe and all wood work.', 
        skills: ['Carpenter', 'Woodwork', 'Furniture Polish', 'Cabinet Fitting'], 
        hourlyRate: 650, 
        rateType: 'day',
        city: 'Delhi', 
        state: 'Delhi',
        area: 'Saket', 
        rating: 4.9, 
        jobsCompleted: 214, 
        isVerified: true, 
        isAvailable: true, 
        about: 'Master carpenter specializing in modular kitchen setup, custom wooden designs, and structural door/window installations.',
        experienceYears: 10,
        gender: 'male',
        qualification: 'High School',
        address: 'C-12, Saket Block C, New Delhi',
        avatar: 'male_1',
        acceptedPaymentMethods: ['upi'],
        upiId: 'amit@okhdfc',
        workerType: 'individual'
      },
      { 
        name: 'Vijay Patel', 
        email: 'vijay@example.com', 
        password: await bcrypt.hash('password1234', 12), 
        role: 'worker', 
        phone: '+919765444444', 
        profession: 'House Builder / Raj Mistri - Complete house construction, brick work, plastering and finishing work.', 
        skills: ['Raj Mistri', 'Tiles Mistri', 'Brick Work', 'Plastering'], 
        hourlyRate: 500, 
        rateType: 'day',
        city: 'Ahmedabad', 
        state: 'Gujarat',
        area: 'CG Road', 
        rating: 4.5, 
        jobsCompleted: 67, 
        isVerified: true, 
        isAvailable: true, 
        about: 'Experienced building contractor specializing in durable brick masonry, internal plaster, floor tile layouts, and structural slabs.',
        experienceYears: 12,
        gender: 'male',
        qualification: 'Primary School',
        address: 'Maninagar Main Road, Ahmedabad',
        avatar: 'male_2',
        acceptedPaymentMethods: ['bank'],
        bankName: 'ICICI Bank',
        accountHolderName: 'Vijay Patel',
        accountNumber: '987654321098',
        ifscCode: 'ICIC0005678',
        workerType: 'individual'
      },
      { 
        name: 'Ramesh Yadav', 
        email: 'ramesh@example.com', 
        password: await bcrypt.hash('password1234', 12), 
        role: 'worker', 
        phone: '+919765455555', 
        profession: 'Painter / Whitewash Worker - Wall painting, putty, distemper, texture and waterproofing paint.', 
        skills: ['Painter', 'Whitewash', 'Wall Putty', 'Texture Painting'], 
        hourlyRate: 550, 
        rateType: 'day',
        city: 'Bengaluru', 
        state: 'Karnataka',
        area: 'Whitefield', 
        rating: 4.7, 
        jobsCompleted: 103, 
        isVerified: true, 
        isAvailable: true, 
        about: 'Premium residential painter providing pristine color consulting, wall putty finishing, texture styles, and damp protection coating.',
        experienceYears: 6,
        gender: 'male',
        qualification: 'High School',
        address: 'Whitefield Main Road, Bengaluru',
        avatar: 'male_1',
        acceptedPaymentMethods: ['bank', 'upi'],
        upiId: 'ramesh@okybl',
        bankName: 'HDFC Bank',
        accountHolderName: 'Ramesh Yadav',
        accountNumber: '554433221100',
        ifscCode: 'HDFC0000456',
        workerType: 'individual'
      },
      { 
        name: 'Mohan Das', 
        email: 'mohan@example.com', 
        password: await bcrypt.hash('password1234', 12), 
        role: 'worker', 
        phone: '+919765466666', 
        profession: 'General Labour / Beldar - Excavation, material shifting, site cleaning and helper work.', 
        skills: ['General Labour', 'Shifting', 'Site Cleaning', 'Helper Work'], 
        hourlyRate: 400, 
        rateType: 'day',
        city: 'Mumbai', 
        state: 'Maharashtra',
        area: 'Andheri', 
        rating: 4.4, 
        jobsCompleted: 45, 
        isVerified: true, 
        isAvailable: true, 
        about: 'Active and reliable general worker available for excavation, cleanups, sorting materials, and packaging relocations.',
        experienceYears: 4,
        gender: 'male',
        qualification: 'Middle School',
        address: 'Kurla East, Station Road, Mumbai',
        avatar: 'male_2',
        acceptedPaymentMethods: ['cash'],
        workerType: 'individual'
      },
      { 
        name: 'Neeta Sharma', 
        email: 'neeta@example.com', 
        password: await bcrypt.hash('password1234', 12), 
        role: 'worker', 
        phone: '+919765477777', 
        profession: 'House Cleaner - Full home cleaning, dusting, sweeping, mopping for daily/deep clean.', 
        skills: ['House Cleaner', 'Deep Cleaning', 'Sanitization', 'Organizing'], 
        hourlyRate: 350, 
        rateType: 'day',
        city: 'Bengaluru', 
        state: 'Karnataka',
        area: 'HSR Layout', 
        rating: 4.7, 
        jobsCompleted: 78, 
        isVerified: true, 
        isAvailable: true, 
        about: 'Professional home assistant specializing in sanitization, chemical stain removal, vacuuming, and organized tidy-ups.',
        experienceYears: 7,
        gender: 'female',
        qualification: 'High School',
        address: 'Sector 2, HSR Layout, Bengaluru',
        avatar: 'female_1',
        acceptedPaymentMethods: ['cash', 'upi', 'bank'],
        upiId: 'neeta@okicici',
        bankName: 'Axis Bank',
        accountHolderName: 'Neeta Sharma',
        accountNumber: '112233445566',
        ifscCode: 'UTIB0000789',
        workerType: 'individual'
      },
      { 
        name: 'Yashasvi Raj', 
        email: 'yashasviraj1@gmail.com', 
        password: await bcrypt.hash('password1234', 12), 
        role: 'worker', 
        phone: '+919279520928', 
        profession: 'House Builder / Raj Mistri - Complete house construction, brick work, plastering and finishing work.', 
        skills: ['Raj Mistri', 'Tiles Mistri', 'Brick Work', 'Plastering'], 
        hourlyRate: 400, 
        rateType: 'day',
        city: 'Godda', 
        state: 'Jharkhand',
        area: 'Main Bazar', 
        rating: 4.5, 
        jobsCompleted: 0, 
        isVerified: false, 
        isAvailable: true, 
        about: 'Available for house construction, brick laying, plastering and masonry work in Godda region.',
        experienceYears: 2,
        gender: 'male',
        qualification: 'ITI Certified',
        address: 'Godda, Jharkhand',
        avatar: 'male_1',
        acceptedPaymentMethods: ['cash'],
        workerType: 'individual'
      },
      {
        name: 'Jharkhand Construction Group',
        email: 'godda.construction@example.com',
        password: await bcrypt.hash('password1234', 12),
        role: 'worker',
        phone: '+919999900001',
        profession: 'House Builder / Raj Mistri - Complete house construction, brick work, plastering and finishing work.',
        skills: ['Raj Mistri', 'Brick Work', 'Plastering', 'Slab Casting'],
        hourlyRate: 450,
        rateType: 'day',
        city: 'Godda',
        state: 'Jharkhand',
        area: 'Main Bazar',
        rating: 4.9,
        jobsCompleted: 124,
        isVerified: true,
        isAvailable: true,
        about: 'Premium construction and civil work contracting team with 10+ years of experience in regional developments.',
        experienceYears: 10,
        gender: 'male',
        qualification: 'Secondary School',
        address: 'Main Bazar Road, Godda, Jharkhand',
        avatar: 'male_3',
        acceptedPaymentMethods: ['cash', 'upi', 'bank'],
        upiId: 'goddaconstruction@okaxis',
        bankName: 'Bank of India',
        accountHolderName: 'Jharkhand Construction Group',
        accountNumber: '667788990011',
        ifscCode: 'BKID0006543',
        workerType: 'team',
        teamRange: '10-15'
      },
      {
        name: 'Dumka Carpentry Group',
        email: 'dumka.carpentry@example.com',
        password: await bcrypt.hash('password1234', 12),
        role: 'worker',
        phone: '+919999900002',
        profession: 'Carpenter / Furniture Mistri - Door, window, modular kitchen, wardrobe and all wood work.',
        skills: ['Carpenter', 'Woodwork', 'Modular Kitchen', 'Furniture Polish'],
        hourlyRate: 500,
        rateType: 'day',
        city: 'Dumka',
        state: 'Jharkhand',
        area: 'Court Road Area',
        rating: 4.8,
        jobsCompleted: 88,
        isVerified: true,
        isAvailable: true,
        about: 'Highly skilled wood crafting team specializing in custom furniture, wardrobes, modular kitchen setups and restoration.',
        experienceYears: 8,
        gender: 'male',
        qualification: 'Diploma',
        address: 'Court Road Area, Dumka, Jharkhand',
        avatar: 'male_9',
        acceptedPaymentMethods: ['cash', 'upi'],
        upiId: 'dumkacarpentry@okhdfc',
        workerType: 'team',
        teamRange: '5-10'
      },
      {
        name: 'Ranchi Plumbing Engineers',
        email: 'ranchi.plumbing@example.com',
        password: await bcrypt.hash('password1234', 12),
        role: 'worker',
        phone: '+919999900003',
        profession: 'Plumber - Tap, pipe, leakage repair, new bathroom fitting and pipeline work.',
        skills: ['Plumber', 'Sanitary Fitting', 'Pipeline Layout', 'Drainage Cleansing'],
        hourlyRate: 480,
        rateType: 'day',
        city: 'Ranchi',
        state: 'Jharkhand',
        area: 'Lalpur',
        rating: 4.7,
        jobsCompleted: 95,
        isVerified: true,
        isAvailable: true,
        about: 'Dedicated plumbing team for industrial, residential complexes and high-pressure system design and fitting.',
        experienceYears: 7,
        gender: 'male',
        qualification: 'ITI Certified',
        address: 'Lalpur Circle, Ranchi, Jharkhand',
        avatar: 'male_2',
        acceptedPaymentMethods: ['cash', 'upi', 'bank'],
        upiId: 'ranchiplumbing@oksbi',
        bankName: 'Punjab National Bank',
        accountHolderName: 'Ranchi Plumbing Engineers',
        accountNumber: '223344556677',
        ifscCode: 'PUNB0012300',
        workerType: 'team',
        teamRange: '1-5'
      }
    ]);

    // Set isAdPosted: true for seeded workers
    await User.updateMany({ role: 'worker' }, { isAdPosted: true });
    
    // Set isEmailVerified: true for all seeded users so they can log in
    await User.updateMany({}, { isEmailVerified: true });

    // Create bookings
    await Booking.insertMany([
      { customer: customer1._id, worker: workers[0]._id, category: 'Plumbing', scheduledDate: new Date('2026-03-25'), city: 'Bengaluru', area: 'Indiranagar', description: 'Kitchen sink leak repair', paymentMode: 'cash', status: 'confirmed', price: 550 },
      { customer: customer1._id, worker: workers[1]._id, category: 'Electrical', scheduledDate: new Date('2026-03-26'), city: 'Bengaluru', area: 'Koramangala', description: 'New fan installation in bedroom', paymentMode: 'online', status: 'pending', price: 600 },
      { customer: customer2._id, worker: workers[2]._id, category: 'Carpentry', scheduledDate: new Date('2026-03-22'), city: 'Delhi', area: 'Saket', description: 'Custom bookshelf installation', paymentMode: 'cash', status: 'completed', price: 650 },
      { customer: customer1._id, worker: workers[4]._id, category: 'Painting', scheduledDate: new Date('2026-04-01'), city: 'Bengaluru', area: 'Whitefield', description: 'Living room interior painting', paymentMode: 'cash', status: 'pending', price: 1100 },
      
      // Ranchi, Dumka, Godda team bookings
      {
        customer: customer1._id,
        category: 'Construction & Civil Work',
        scheduledDate: new Date('2026-06-15'),
        city: 'Godda',
        area: 'Main Bazar',
        description: 'Need a team of construction workers for warehouse foundation building and brick masonry.',
        paymentMode: 'bank',
        status: 'pending',
        price: 5400,
        workerType: 'team',
        teamRange: '10-15'
      },
      {
        customer: customer1._id,
        category: 'Wood & Metal Work',
        scheduledDate: new Date('2026-06-20'),
        city: 'Dumka',
        area: 'Court Road Area',
        description: 'Urgent requirement for a team of experienced carpenters for modular kitchen and wooden doors installation.',
        paymentMode: 'upi',
        status: 'pending',
        price: 3500,
        workerType: 'team',
        teamRange: '5-10'
      },
      {
        customer: customer1._id,
        category: 'Plumbing & Sanitary',
        scheduledDate: new Date('2026-06-10'),
        city: 'Ranchi',
        area: 'Lalpur',
        description: 'Looking for a plumbing team to lay down new pipes and install sanitary fittings for a 3-story residential complex.',
        paymentMode: 'cash',
        status: 'pending',
        price: 2880,
        workerType: 'team',
        teamRange: '1-5'
      }
    ]);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📌 Login credentials:');
    console.log('   Admin:    admin@shramik.com / admin123456');
    console.log('   Customer: priya@example.com / password1234');
    console.log('   Customer: rahul@example.com / password1234');
    console.log('   Worker:   ravi@example.com  / password1234');
    console.log('\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedDB();
