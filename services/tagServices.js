const mongoose = require('mongoose');
const Tag = require('../db/models/tag'); // Tag modelinin yolu gerektiği gibi ayarlanmalıdır.
const {Content} = require('../db/models/content'); // Content modelinin yolu gerektiği gibi ayarlanmalıdır.

const tagServices = {

  // Tag oluşturma
  createTag: async (tagName) => {
    try {
      const tag = new Tag({ name: tagName });
      const newTag = await tag.save();
      return newTag;
    } catch (error) {
      throw error;
    }
  },

  // Tag güncelleme (name)
  updateTagName: async (tagId, newName) => {
    try {
      const updatedTag = await Tag.findByIdAndUpdate(
        tagId,
        { name: newName },
        { new: true }
      );
      return updatedTag;
    } catch (error) {
      throw error;
    }
  },

  // Tag kullanım sayısını güncelleme (usageCount)
  updateTagUsageCount: async (tagId, increment) => {
    try {
      const updatedTag = await Tag.findByIdAndUpdate(
        tagId,
        { $inc: { usageCount: increment } },
        { new: true }
      );
      return updatedTag;
    } catch (error) {
      throw error;
    }
  },

  // Tag silme ve ilgili içeriklerden kaldırma
  deleteTag: async (tagId) => {
    try {
      // Tag'ı sil
      const deletedTag = await Tag.findByIdAndRemove(tagId);

      // İlgili tüm içeriklerden bu tag'ı kaldır
      if (deletedTag) {
        await Content.updateMany(
          { tags: mongoose.Types.ObjectId(tagId) },
          { $pull: { tags: tagId } }
        );
      }

      return deletedTag;
    } catch (error) {
      throw error;
    }
  },

  // Tag alma (name ile filtreleme ve sayfalama)
  getTags: async (filter, options) => {
    try {
      const tags = await Tag.paginate(filter, options);
      return tags;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = tagServices;
