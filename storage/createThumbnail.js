const sharp = require('sharp');
const path = require('path');

async function createThumbnail(filePath, thumbnailFilePath) {
const p=`${path.parse(thumbnailFilePath).dir}/${path.parse(thumbnailFilePath).name}.webp`, n=`${path.parse(thumbnailFilePath).name}.webp`
  await sharp(filePath)
    .resize(80)
    .toFormat('webp')
    .toFile(p);

  return { path:p ,name:n};
}


module.exports = createThumbnail;