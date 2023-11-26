const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const storedFilesSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    fileUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: false },
    path:{ type: String, required: false },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true, // Otomatik olarak createdAt ve updatedAt alanlarını oluşturur
});

// updatedAt alanına indeks atayın
storedFilesSchema.index({ updatedAt: -1 });

// Plugin'i şemanıza ekleyin
storedFilesSchema.plugin(mongoosePaginate);

const StoredFile = mongoose.model('StoredFile', storedFilesSchema);

module.exports = StoredFile;
