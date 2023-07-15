const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  resetCode: {
    type: String,
    required: true,
    unique: true
  },
  expiration: {
    type: Date,
    required: true
  },
  resetTime :{
    type: Date,
    default: null, 
  }
});

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;
