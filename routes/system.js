const express = require('express');
const router = express.Router();
const SystemVariable = require('../db/models/system');
const { body, param,validationResult } = require('express-validator');
const { jwtAuthMiddleware, isAdmin } = require('../middleware/jwtAuth'); 
const {createSystemVariable, updateSystemVariable,getSystemVariableByKey,getSystemVariablesValues} = require('../services/systemVariableServices')

// Public GET Endpoint for System Variables
router.get('/information', async (req, res) => {
  try {
    const publicVariables = await SystemVariable.find({ isPublic: true });
    res.status(200).send(publicVariables);
  } catch (error) {
    res.status(400).send(error);
  }
});
router.get('/storage',
  [
    jwtAuthMiddleware, // JWT ile kimlik doğrulama
    isAdmin, // Admin kontrolü
  ],
  async (req, res) => {
    try {
      // Örnek olarak bu anahtarları kullanıyoruz, istediğiniz anahtarları buraya ekleyebilirsiniz.
      const keys = ['cloudflareConfig', 'minioConfig', 'awsConfig'];
      const variables = await getSystemVariablesValues(keys);
      res.status(200).send(variables);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);

router.post('/', 
  [
    jwtAuthMiddleware, // Önce JWT ile kimlik doğrulama
    isAdmin, // Sonra kullanıcının admin olup olmadığını kontrol et
    body('key').notEmpty().withMessage('Key is required'),
    body('valueType').isIn(['array','object' ,'objectArray', 'string', 'number', 'boolean']).withMessage('Invalid value type'),
    body('value').notEmpty().withMessage('Value is required'),
    body('isPublic').isBoolean().withMessage('isPublic must be a boolean'),
  ], 
  async (req, res) => {
    console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors :",errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const newVariable = await createSystemVariable(req.body);
      console.log("new:",newVariable)
      res.status(201).send(newVariable);
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

router.put('/:key',
  [
    jwtAuthMiddleware, // Önce JWT ile kimlik doğrulama
    isAdmin, // Sonra kullanıcının admin olup olmadığını kontrol et
    param('key').notEmpty().withMessage('Key is required'),
    body('key').isEmpty().withMessage('Key cannot be updated'),
    body('value').notEmpty().withMessage('Value is required'),
    body('isPublic').isBoolean().withMessage('isPublic must be a boolean'),
    // İhtiyacınıza bağlı olarak diğer validation kurallarını ekleyebilirsiniz.
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedVariable = await updateSystemVariable(req.params.key, req.body);
      res.status(200).send(updatedVariable);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);

router.get('/:key',
  [
    jwtAuthMiddleware, // JWT ile kimlik doğrulama
    isAdmin, // Admin kontrolü
    param('key').notEmpty().withMessage('Key is required'), // Key parametresinin boş olmamasını kontrol et
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const variable = await getSystemVariableByKey(req.params.key);
      res.status(200).send(variable);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);



module.exports = router;
