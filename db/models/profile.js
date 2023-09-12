const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: String,
  fullAddress: String,
  state: String,
  city: String,
  district: String,
  isUsed : Boolean
});

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  addresses: [addressSchema],
  preferredLanguage: {type:String , default:'tr' , required:true},
 
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
