const mongoose = require('mongoose');

const revokedTokenSchema = new mongoose.Schema({
  tokenId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const RevokedToken = mongoose.model('RevokedToken', revokedTokenSchema);

module.exports = RevokedToken;