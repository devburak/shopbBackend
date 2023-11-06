const {Menu,MenuItem} = require('../db/models/menu'); // Menü modelinizi import edin

async function deleteMenuItemsRecursively(parentId) {
    if (!parentId) return; // parentId null ise işlem yapma
  
    // Alt öğeleri bul
    const children = await MenuItem.find({ parent: parentId });
  
    for (const child of children) {
      // Her bir alt öğe için bu fonksiyonu tekrar çağır
      await deleteMenuItemsRecursively(child._id);
    }
    // Alt öğeleri silindikten sonra bu öğeyi sil
    await MenuItem.deleteOne({ _id: parentId });
  }
  
const menuService = {
    // Menü ve Menü Öğelerini Oluşturma
    async createMenu(data) {
        // Yeni bir Menu belgesi oluştur
        const menu = new Menu({
            name: data.name,
            location: data.location,
            items: [] // Menü öğelerini başlangıçta boş bir dizi olarak ayarla
        });

        // Menüyü veritabanına kaydet
        await menu.save();

        // Gelen verideki her bir menü öğesini işle ve kaydet
        await this.createMenuItems(menu._id, data.items);

        // Tamamlanan menüyü döndür
        return await Menu.findById(menu._id).populate('items');
    },


  


  // Menüyü ID'ye Göre Getirme
  async getMenuById(menuId) {
    return await Menu.findById(menuId).populate('items');
  },

  // Tüm Menüleri Getirme
  async getAllMenus() {
    return await Menu.find().populate('items');
  },

// Menü Güncelleme
// async updateMenu(menuId, data) {
//     // Menüyü bul
//     const menu = await Menu.findById(menuId);
//     if (!menu) {
//         console.log("menu not found")
//       throw new Error('Menu not found');
//     }
  
//     // Mevcut menü öğelerini güncelle veya sil
//     let updatedItems = menu.items.filter(item => 
//       data.items.some(updateItem => updateItem._id === item._id.toString())
//     );
  
//     for (const updateItem of data.items) {
//       let existingItem = updatedItems.find(item => item._id.toString() === updateItem._id);
//       if (existingItem) {
//         // Mevcut öğeyi güncelle
//         existingItem.title = updateItem.title || existingItem.title;
//         existingItem.url = updateItem.url || existingItem.url;
//         existingItem.order = updateItem.order || existingItem.order;
//         existingItem.parent = updateItem.parent || existingItem.parent;
//         existingItem.icon = updateItem.icon || existingItem.icon;
//         existingItem.target = updateItem.target || existingItem.target;
//         existingItem.type = updateItem.type || existingItem.type;
//         existingItem.options = updateItem.options || existingItem.options;
//       } else {
//         // Yeni öğeyi ekle
//         await this.createMenuItems(menu._id, [updateItem]);
//       }
//     }
  
//     // Menü öğelerini güncelle
//     menu.items = updatedItems;
  
//     // Yeni menü öğelerini ekle
//     if (data.newItems && data.newItems.length > 0) {
//       for (const newItem of data.newItems) {
//         await this.createMenuItems(menu._id, [newItem]);
//       }
//     }
  
//     // Menüyü kaydet
//     await menu.save();
  
//     return menu;
//   },
// Menü Güncelleme
// async updateMenu(menuId, data) {
//     try {
//       // Menüyü bul ve güncelle
//       const menu = await Menu.findOneAndUpdate(
//         { _id: menuId },
//         { $set: data },
//         { new: true, runValidators: true, context: 'query', upsert: false }
//       );
  
//       if (!menu) {
//         throw new Error('Menu not found');
//       }
  
//       // Yeni menü öğelerini ekle
//       if (data.newItems && data.newItems.length > 0) {
//         for (const newItem of data.newItems) {
//           await this.createMenuItems(menu._id, [newItem]);
//         }
//       }
  
//       // Menüyü döndür
//       return menu;
//     } catch (error) {
//       // Hata yönetimi
//       console.error(error);
//       throw error;
//     }
//   },  

// Menü Güncelleme
// async updateMenu(menuId, data) {
//     try {
//       // Menüyü bul
//       const menu = await Menu.findById(menuId);
//       if (!menu) {
//         throw new Error('Menu not found');
//       }
  
//       // Mevcut menü öğelerini güncelle
//       const updateItemsRecursively = async (items, parentId = null) => {
//         for (const itemData of items) {
//           if (itemData._id) {
//             // Mevcut öğeyi güncelle
//             const existingItemIndex = menu.items.findIndex(item => item._id.toString() === itemData._id);
//             if (existingItemIndex > -1) {
//               menu.items[existingItemIndex] = { ...menu.items[existingItemIndex].toObject(), ...itemData, parent: parentId };
//             }
//           } else {
//             // Yeni öğeyi ekle
//             const newItem = new MenuItem({ ...itemData, menu: menuId, parent: parentId });
//             menu.items.push(newItem);
//           }
  
//           // Eğer alt menü öğeleri varsa, onları da işle
//           if (itemData.children && itemData.children.length > 0) {
//             await updateItemsRecursively(itemData.children, itemData._id);
//           }
//         }
//       };
  
//       await updateItemsRecursively(data.items);
  
//       // Menüyü kaydet
//       await menu.save();
  
//       return menu;
//     } catch (error) {
//       // Hata yönetimi
//       console.error(error);
//       throw error;
//     }
//   }, 
// Menü Güncelleme
// Menü Güncelleme
// async updateMenu(menuId, updateData) {
//     // Menüyü bul
//     const menu = await Menu.findById(menuId);
//     if (!menu) {
//       throw new Error('Menu not found');
//     }
  
//     // Menü bilgilerini güncelle
//     menu.name = updateData.name || menu.name;
//     menu.location = updateData.location || menu.location;
  
//     // Mevcut menü öğelerinin ID'lerini bir diziye kaydet
//     const existingItemIds = menu.items.map(item => item._id.toString());
  
//     // Güncelleme verisindeki menü öğeleri ile mevcut öğeleri karşılaştır
//     const updatedItems = updateData.items.map(item => {
//       // Eğer öğe zaten varsa güncelle
//       if (existingItemIds.includes(item._id)) {
//         return {
//           ...item,
//           _id: item._id // Mongoose, _id'yi korumak için bunu gerektirir
//         };
//       } else {
//         // Yeni öğe ise, _id olmadan döndür (Mongoose yeni bir _id atayacak)
//         return item;
//       }
//     });
  
//     // Silinecek öğeleri belirle
//     const itemsToDelete = existingItemIds.filter(id => !updateData.items.some(item => item._id === id));
  
//     // Menü öğelerini güncelle
//     menu.items = updatedItems;
  
//     // Menüyü kaydet
//     await menu.save();
  
//     // Silinecek öğeleri sil
//     if (itemsToDelete.length > 0) {
//       await Menu.updateOne(
//         { _id: menuId },
//         { $pull: { items: { _id: { $in: itemsToDelete } } } }
//       );
//     }
  
//     // Güncellenmiş menüyü döndür
//     return menu;
//   },
  
//   async processMenuItems(menuId, items, parentId = null) {
//     let processedItemIds = [];
  
//     for (const itemData of items) {
//       let item;
//       if (itemData._id) {
//         // Update existing item
//         item = await MenuItem.findByIdAndUpdate(itemData._id, {
//           ...itemData,
//           menu: menuId,
//           parent: parentId
//         }, { new: true });
//         if (!item) {
//           // If the item doesn't exist, create a new one
//           item = new MenuItem({
//             ...itemData,
//             menu: menuId,
//             parent: parentId
//           });
//           await item.save();
//         }
//       } else {
//         // Create new item
//         item = new MenuItem({
//           ...itemData,
//           menu: menuId,
//           parent: parentId
//         });
//         await item.save();
//       }
  
//       processedItemIds.push(item._id.toString());
  
//       // Process children
//       if (itemData.children && itemData.children.length > 0) {
//         const childrenIds = await this.processMenuItems(menuId, itemData.children, item._id);
//         processedItemIds = processedItemIds.concat(childrenIds);
//       }
//     }
  
//     // Remove items that were not in the updated data
//     await MenuItem.deleteMany({
//       _id: { $nin: processedItemIds },
//       menu: menuId
//     });
  
//     return processedItemIds;
//   }  , 


  
// Menü Güncelleme
async updateMenu(menuId, updateData) {
    // Menüyü bul
    const menu = await Menu.findById(menuId);
    if (!menu) {
      throw new Error('Menu not found');
    }
  
    // Menü öğelerini tamamen sil
    await MenuItem.deleteMany({ menu: menuId });
  
    // Yeni menü öğelerini oluştur
    await this.createMenuItems(menuId, updateData.items);
  
    // Menü bilgilerini güncelle
    menu.name = updateData.name || menu.name;
    menu.location = updateData.location || menu.location;
  
    // Menüyü kaydet
    await menu.save();
  
    // Güncellenmiş menüyü döndür
    return await Menu.findById(menuId).populate('items');
  },
  
  
  async updateMenuItems(menuId, itemsToUpdate, parentId = null) {
    const menu = await Menu.findById(menuId);
    if (!menu) {
      throw new Error('Menu not found');
    }
  
    // Güncellenmiş öğeleri ve yeni eklenen öğeleri işle
    const bulkOps = [];
    for (const itemData of itemsToUpdate) {
      if (itemData._id) {
        // Mevcut öğeyi güncelle
        bulkOps.push({
          updateOne: {
            filter: { _id: itemData._id, 'items._id': itemData._id },
            update: { $set: { 'items.$': itemData } }
          }
        });
      } else {
        // Yeni öğeyi ekle
        const newItem = { ...itemData, parent: parentId };
        bulkOps.push({
          updateOne: {
            filter: { _id: menuId },
            update: { $push: { items: newItem } }
          }
        });
      }
    }
  
    // Bulk işlemleri çalıştır
    if (bulkOps.length) {
      await Menu.bulkWrite(bulkOps);
    }
  
    // Silinecek öğeleri belirle ve sil
    const itemsToKeepIds = itemsToUpdate.map(item => item._id);
    menu.items = menu.items.filter(item =>
      itemsToKeepIds.includes(item._id.toString()) ||
      (item.parent && itemsToKeepIds.includes(item.parent.toString()))
    );
  
    // Menüyü kaydet
    await menu.save();
  }
  ,
  
    // Menü Öğelerini Oluşturma ve Kaydetme
    async createMenuItems(menuId, items, parentId = null) {
        console.log(menuId,items)
        const menu = await Menu.findById(menuId); // Ana menüyü bul
        console.log(menu)
        for (const itemData of items) {
            // Yeni bir menü öğesi oluştur
            let newItem = {
                ...itemData,
                parent: parentId
            };

            // Menü öğesini menü dökümanına ekle
            menu.items.push(newItem);

            // Eğer alt menü öğeleri varsa, onları da işle
            if (itemData.children && itemData.children.length > 0) {
                const createdItem = menu.items[menu.items.length - 1];
                await this.createMenuItems(menu._id, itemData.children, createdItem._id);
            }
        }
        // Menüyü güncelle
        await menu.save();
    },

  // Menü Silme
  async deleteMenu(menuId) {
    return await Menu.findByIdAndRemove(menuId);
  },
  // Menü öğelerini hiyerarşik bir yapıya dönüştürmek için yardımcı fonksiyon
  buildMenuHierarchy(items, parentId = null) {
    return items
      .filter(item => String(item.parent) === String(parentId))
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        ...item.toObject(), // Mongoose belgesini düz bir objeye dönüştürür
        children: this.buildMenuHierarchy(items, item._id) // Alt menü öğeleri için rekürsif çağrı
      }));
  },

  // Menüyü hiyerarşik olarak getirme
async getMenuHierarchy(menuId) {
    const menu = await Menu.findById(menuId); // Ana menüyü bul
    if (!menu) {
      // Menü bulunamadıysa hata fırlat
      throw new Error('Menu not found');
    }
    return this.buildMenuHierarchy(menu.items);
  },
  
  async getMenuByName(name) {
    const menu = await Menu.findOne({ name: name }); // Menü adına göre menüyü bul
    if (!menu) {
      // Menü bulunamadıysa hata fırlat
      throw new Error('Menu not found');
    }
    return this.buildMenuHierarchy(menu.items);
  }
};

module.exports = menuService;
