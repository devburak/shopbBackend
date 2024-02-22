const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  description: {
    type: String
  }
});

const Period = mongoose.model('Period', periodSchema);

module.exports = Period;
