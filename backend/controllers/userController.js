const User = require('../models/User');

const SERVICE_CATEGORIES = {
  "Construction & Civil Work": [
    "House Builder / Raj Mistri", "Tiles Mistri", "Marble/Granite Fitter", "Painter / Whitewash Worker",
    "POP / False Ceiling Expert", "Shuttering Carpenter", "Bar Bender", "General Labour / Beldar", "Demolition Worker"
  ],
  "Wood & Metal Work": [
    "Carpenter / Furniture Mistri", "Welder", "Aluminium Fabricator", "Glass Fitter", "Furniture Polisher"
  ],
  "Electrical & Appliance Repair": [
    "Electrician", "AC Technician", "Refrigerator Repair", "TV Repair Technician", "Washing Machine Mechanic",
    "Fan/Motor Winding Expert", "Geyser/Microwave Repair", "RO/Water Purifier Technician"
  ],
  "Plumbing & Sanitary": [
    "Plumber", "Bathroom Fitter", "Septic Tank Cleaner", "Drainage Cleaner"
  ],
  "Home & Facility Services": [
    "House Cleaner", "Bathroom/Toilet Deep Cleaner", "Sofa/Carpet Cleaner", "Pest Control", "Water Tank Cleaner",
    "Gardener / Mali", "Security Guard", "Loader / Hamal", "Packers & Movers Helper"
  ],
  "Others / Miscellaneous": [
    "Driver", "Cook / Chef", "Car Washer", "Cable/DTH Technician", "CCTV/Camera Installer",
    "Mobile Repair Technician", "Tailor / Darzi", "Dhobi / Ironing Service", "Event Helper / Tent Labour"
  ]
};

exports.getAllWorkers = async (req, res) => {
  try {
    const filter = { role: 'worker', isAdPosted: true };
    if (req.query.city) filter.city = req.query.city;
    if (req.query.state) filter.state = req.query.state;
    if (req.query.area) filter.area = req.query.area;
    if (req.query.workerType) {
      if (req.query.workerType === 'individual') {
        // Match explicit 'individual' AND documents where workerType is missing/null
        filter.workerType = { $in: ['individual', null] };
      } else {
        filter.workerType = req.query.workerType;
      }
    }
    
    // Support category and subCategory filters from frontend
    if (req.query.subCategory) {
      const cleanSub = req.query.subCategory.split(' - ')[0].trim();
      filter.profession = { $regex: cleanSub, $options: 'i' };
    } else if (req.query.category && SERVICE_CATEGORIES[req.query.category]) {
      const subs = SERVICE_CATEGORIES[req.query.category];
      filter.profession = { $in: subs.map(s => new RegExp(s, 'i')) };
    } else if (req.query.profession) {
      filter.profession = { $regex: req.query.profession, $options: 'i' };
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { profession: { $regex: req.query.search, $options: 'i' } },
        { skills: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Determine if any filters are present
    const hasFilters = req.query.city || req.query.state || req.query.area || req.query.profession || req.query.search || req.query.category || req.query.subCategory || req.query.workerType;
    if (!hasFilters) {
      // No filters: return all workers without pagination
      const workers = await User.find(filter).sort('-rating');
      return res.status(200).json({
        status: 'success',
        results: workers.length,
        data: { workers }
      });
    }

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const count = await User.countDocuments(filter);
    const workers = await User.find(filter)
      .sort('-rating')
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      status: 'success', 
      results: workers.length, 
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        totalResults: count
      },
      data: { workers } 
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.getWorker = async (req, res) => {
  try {
    const worker = await User.findById(req.params.id);
    if (!worker) return res.status(404).json({ status: 'fail', message: 'Worker not found' });
    res.status(200).json({ status: 'success', data: { worker } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (req.body.password) return res.status(400).json({ status: 'fail', message: 'Cannot update password here.' });
    
    // Strict Whitelisting of user profile fields
    const allowedFields = [
      'name', 'phone', 'secondaryPhone', 'profession', 'skills', 'hourlyRate', 'rateType', 'city', 'state', 'area', 'bio', 
      'avatar', 'isAvailable', 'address', 'qualification', 'gender', 'experienceYears', 'about',
      'bankName', 'accountHolderName', 'accountNumber', 'ifscCode', 'upiId', 'acceptedPaymentMethods',
      'workerType', 'teamRange', 'isAdPosted'
    ];
    const filteredBody = {};
    Object.keys(req.body).forEach(el => {
      if (allowedFields.includes(el)) {
        filteredBody[el] = req.body[el];
      }
    });

    const updated = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });
    res.status(200).json({ status: 'success', data: { user: updated } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

