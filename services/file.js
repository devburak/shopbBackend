const StoredFile = require('../db/models/storedFiles');

async function listFiles(pageNumber, pageSize, searchKey, excludeIds = [], fileType = '') {
  const query = {};

  if (searchKey) {
    query.fileName = { $regex: searchKey, $options: 'i' }; // Dosya adı üzerinde arama yap
  }

  if (excludeIds.length > 0) {
    query._id = { $nin: excludeIds }; // Belirli ID'ler hariç tüm dosyaları getir
  }

  if (fileType) {
    if (fileType === 'image') {
      query.mimeType = { $regex: '^image\/.*', $options: 'i' }; // Tüm 'image/*' mimeType'larına uyan dosyaları filtrele
    } else if (fileType === 'application') {
      query.mimeType = { $regex: '^application\/.*', $options: 'i' }; // Tüm 'application/*' mimeType'larına uyan dosyaları filtrele
    }
  }

  const totalCount = await StoredFile.countDocuments(query);
  const totalPages = Math.ceil(totalCount / pageSize);

  const files = await StoredFile.find(query)
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort({ uploadedAt: -1 })
    .select('fileName size path mimeType fileUrl thumbnailUrl uploadedBy uploadedAt');

  return {
    totalCount,
    totalPages,
    pageNumber,
    pageSize,
    files
  };
}



module.exports = { listFiles };