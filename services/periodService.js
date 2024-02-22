const Period = require('../db/models/period'); // Period modelinin doğru yolda import edildiğinden emin olun

const createPeriod = async (periodData) => {
  const period = new Period(periodData);
  await period.save();
  return period;
};

const updatePeriod = async (id, periodData) => {
  const period = await Period.findByIdAndUpdate(id, periodData, { new: true });
  return period;
};

const deletePeriod = async (id) => {
  await Period.findByIdAndDelete(id);
};

const getAllPeriods = async () => {
  const periods = await Period.find({});
  return periods;
};

const getPeriodById = async (id) => {
  const period = await Period.findById(id);
  return period;
};

module.exports = {
  createPeriod,
  updatePeriod,
  deletePeriod,
  getAllPeriods,
  getPeriodById
};
