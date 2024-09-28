const cleanCsvData = require('./cleanCsvData.js');
const transposeData = require('./transposeData');
const extractInfoFromFilename = require('./extractInfo');
const { convertTimeTo24Hour } = require('./convertTimeTo24Hour');
const connectToDatabase = require('./connectToDatabase');
const pushDataToPrimaryTable = require('./pushDataToPrimaryTable');
const pushDataToSecondaryTable = require('./pushDataToSecondaryTable');
const pushDataToFileTracking = require('./pushDataToFileTracking');
const fileProcessed = require('./fileProcessed');

module.exports = {
  cleanCsvData,
  transposeData,
  extractInfoFromFilename,
  convertTimeTo24Hour,
  connectToDatabase,
  pushDataToPrimaryTable,
  pushDataToSecondaryTable,
  pushDataToFileTracking,
  fileProcessed,
};
