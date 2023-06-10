const mongoose = require('mongoose');

const storedFilesSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    fileUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: false },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
});

const StoredFile = mongoose.model('StoredFile', storedFilesSchema);

module.exports = StoredFile;