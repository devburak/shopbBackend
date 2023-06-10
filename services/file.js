const StoredFile = require('../db/models/storedFiles');

async function listFiles(pageNumber, pageSize, searchKey) {
    const query = {};
  
    if (searchKey) {
      query.fileName = { $regex: searchKey, $options: 'i' };
    }
  
    const totalCount = await StoredFile.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);
  
    const files = await StoredFile.find(query)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ uploadedAt: -1 })
      .select('fileName size mimeType fileUrl thumbnailUrl uploadedBy uploadedAt');
  
    return {
      totalCount,
      totalPages,
      files,
    };
  }
  

module.exports = {listFiles};