
 const { config }  = require("../config/loadConfiguration");

let BUCKET_NAME = config.storageClients[config.type]?.bucketName || 'test';
const getPreferredClient = () => {
  console.log("storageConfig",config);
  BUCKET_NAME = config.storageClients[config.type]?.bucketName || 'test';
  return config.storageClients[config.type];
};

const uploadFile = async (file) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: file.name,
        Body: file.data,
    };


    return new Promise((resolve, reject) => {
        minioClient.putObject(BUCKET_NAME, file.name, file.data, (err, etag) => {
            if (err) reject(err);
            resolve(etag);
        });
    });
};

const listFiles = async () => {
  const client = getPreferredClient();
  return new Promise((resolve, reject) => {
    const stream = client.listObjects(BUCKET_NAME, '', true);
    const results = [];
    stream.on('data', obj => results.push(obj));
    stream.on('error', err => reject(err));
    stream.on('end', () => resolve(results));
  });
};


const getFile = async (fileKey) => {
    return new Promise((resolve, reject) => {
        minioClient.getObject(BUCKET_NAME, fileKey, (err, dataStream) => {
            if (err) reject(err);
            let data = [];
            dataStream.on('data', chunk => data.push(chunk));
            dataStream.on('end', () => resolve(Buffer.concat(data)));
        });
    });
};

const deleteFile = async (fileKey) => {
    return new Promise((resolve, reject) => {
        minioClient.removeObject(BUCKET_NAME, fileKey, err => {
            if (err) reject(err);
            resolve({ success: true });
        });
    });
};

module.exports = {
    uploadFile,
    listFiles,
    getFile,
    deleteFile
};
