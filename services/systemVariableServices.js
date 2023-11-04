// services/systemVariableService.js

const SystemVariable = require('../db/models/system');

const getSystemVariableValue = async (key) => {
  try {
    const variable = await SystemVariable.findOne({ key });
    if (!variable) {
      throw new Error(`System variable with key ${key} not found`);
    }
    return variable.value;
  } catch (error) {
    throw error;
  }
};

const getSystemVariablesValues = async (keys) => {
  try {
    const variables = await SystemVariable.find({ key: { $in: keys } });
    if (!variables || variables.length === 0) {
      throw new Error(`System variables not found for provided keys`);
    }

    // Anahtar-değer çiftlerini bir dizi olarak döndürmek için
    let result = [];
    variables.forEach(variable => {
      result.push({ key: variable.key, value: variable.value });
    });

    return result;
  } catch (error) {
    throw error;
  }
};


const createSystemVariable = async (data) => {
    try {
      const newVariable = new SystemVariable(data);
      await newVariable.save();
      return newVariable;
    } catch (error) {
      throw error;
    }
  };

  const updateSystemVariable = async (key, updateData) => {
    try {
      const updatedVariable = await SystemVariable.findOneAndUpdate(
        { key: key },
        updateData,
        { new: true } // Güncellenmiş dokümanı döndür
      );
  
      if (!updatedVariable) {
        throw new Error(`System variable with key ${key} not found`);
      }
  
      return updatedVariable;
    } catch (error) {
      throw error;
    }
  };

  const getSystemVariableByKey = async (key) => {
    try {
      const variable = await SystemVariable.findOne({ key });
      if (!variable) {
        throw new Error(`System variable with key ${key} not found`);
      }
      return variable;
    } catch (error) {
      throw error;
    }
  };

module.exports = {
    getSystemVariableValue,
    createSystemVariable,
    updateSystemVariable,
    getSystemVariableByKey,
    getSystemVariablesValues
};
