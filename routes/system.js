const express = require('express');
const router = express.Router();
const SystemVariable = require('../db/models/system');

// Public GET Endpoint for System Variables
router.get('/information', async (req, res) => {
  try {
    const publicVariables = await SystemVariable.find({ isPublic: true });
    res.status(200).send(publicVariables);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;