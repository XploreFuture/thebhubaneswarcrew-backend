const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  fullName: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  whatsapp: { type: String, default: "" },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function (value) {
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 9, today.getMonth(), today.getDate());
        return value <= minDate;
      },
      message: 'User must be at least 9 years old',
    },
  },
  role: {
    type: String,
    enum: ['admin','user'],
    default: 'user'
  },
  insta: { type: String, required: false, unique: true },
  website:{ type: String, required: false, unique: true },
  youtube: { type: String, required: false, unique: true },
  // In User model
avatar: {
  type: String,
  default: "",
  required: false
  // or point to a default avatar path
}

}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
