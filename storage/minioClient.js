const Minio = require('minio');
const { config, loadConfiguration } = require('../config/loadConfiguration');

let minioClient;

const initializeMinioClient = async () => {
  await loadConfiguration();
  console.log({region:"auto",...config.storageClients})
  minioClient = new Minio.Client({region:"auto",...config.storageClients});
};

const getMinioClient = async () => {
  if (!minioClient) {
    await initializeMinioClient();
  }
  return minioClient;
};

module.exports = { getMinioClient };
