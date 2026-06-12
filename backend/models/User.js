const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
  role: { type: String, enum: ['customer', 'worker', 'admin'], default: 'customer' },
  phone: { 
    type: String, 
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^\+91\d{10}$/.test(v.replace(/\s+/g, ''));
      },
      message: props => `${props.value} is not a valid 10-digit Indian phone number!`
    }
  },
  secondaryPhone: { 
    type: String, 
    trim: true, 
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^\+91\d{10}$/.test(v.replace(/\s+/g, ''));
      },
      message: props => `${props.value} is not a valid 10-digit Indian phone number!`
    }
  },
  avatar: { type: String, default: '' },
  gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  qualification: { type: String, default: '' },
  address: { type: String, default: '' },
  experienceYears: { type: Number, default: 0 },
  about: { type: String, default: '' },
  // Worker-specific fields
  profession: { type: String, trim: true },
  skills: [{ type: String }],
  hourlyRate: { type: Number, default: 0 },
  rateType: { type: String, enum: ['hour', 'day', 'visit'], default: 'day' },
  isAvailable: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 4.5, min: 1, max: 5 },
  jobsCompleted: { type: Number, default: 0 },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  area: { type: String, trim: true },
  bio: { type: String, maxlength: 500 },
  bankName: { type: String, default: '' },
  accountHolderName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  upiId: { type: String, default: '' },
  acceptedPaymentMethods: { type: [String], default: ['cash'] },
  workerType: { type: String, enum: ['individual', 'team'], default: 'individual' },
  teamRange: { type: String, enum: ['', '1-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30+'], default: '' },
  isAdPosted: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: null },
  emailVerificationExpires: { type: Date, default: null }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (this.phone) {
    this.phone = this.phone.replace(/\s+/g, '');
  }
  if (this.secondaryPhone) {
    this.secondaryPhone = this.secondaryPhone.replace(/\s+/g, '');
  }
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);
