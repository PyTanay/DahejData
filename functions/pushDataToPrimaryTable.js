const sql = require('mssql');
const { parseCustomDateTime, convertDateFormat } = require('./convertTimeTo24Hour');

/**
 * Inserts data into the hourlyData table.
 *
 * @param {sql.ConnectionPool} dbConnection - The database connection object.
 * @param {string} tagKey - The TagKey associated with the tag details.
 * @param {Object[]} data - The data to be inserted, each object containing DateTime and Value.
 * @returns {Promise<void>}
 */
async function pushDataToPrimaryTable(dbConnection, tagKey, data) {
  var index = 0;
  try {
    for (const entry of data) {
      try {
        const { DateTime, Value, TagName, SrNo } = entry;
        const request = new sql.Request(dbConnection);
        const insertQuery = `
                  INSERT INTO hourlyData (TagKey, DateTime, Value, Processed)
                  VALUES (@tagKey, @dateTime, @value, 0)`;

        request.input('tagKey', sql.NVarChar(36), tagKey[SrNo + TagName]);
        request.input('dateTime', sql.DateTime, DateTime);
        request.input('value', sql.Decimal(18, 2), Value); // Adjust precision and scale as needed
        await request.query(insertQuery);
      } catch (error) {
        if (!error.numer === 2627) {
          console.error('Error in pushDataToPrimaryTable:', error.number);
          throw error;
        } else {
          // console.log('Duplicate Entery in Primary table');
          // throw error;
        }
      }
    }
  } catch (err) {
    console.log('Error in primary Table', err);
    throw error;
  }
}

module.exports = pushDataToPrimaryTable;
