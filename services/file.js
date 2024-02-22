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
    query.mimeType = fileType; // Belirli bir dosya türüne göre filtrele
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

  

module.exports = {listFiles};