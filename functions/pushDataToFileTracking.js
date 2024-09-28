const sql = require('mssql');

/**
 * Inserts an entry into the FileTracking table to track processed files.
 * @param {sql.ConnectionPool} dbConnection - The database connection object.
 * @param {string} fileName - The name of the file that was processed.
 * @returns {Promise<void>}
 */
async function pushDataToFileTracking(dbConnection, fileName) {
  try {
    const request = new sql.Request(dbConnection);

    // Assuming your FileTracking table has columns for FileName and DateProcessed
    const query = `IF EXISTS (SELECT 1 FROM FileTracking WHERE FileName = @fileName)
    SELECT Processed FROM FileTracking WHERE FileName = @fileName;
ELSE
BEGIN
    INSERT INTO FileTracking (FileName) VALUES (@fileName);
    SELECT 0 AS Processed; -- Assuming default value for 'Processed' is 0 on insertion
END`;

    // Set up the input parameter for the file name
    request.input('fileName', sql.NVarChar, fileName);

    // Execute the query
    const status = await request.query(query);
    if (status.recordset[0].Processed === false) {
      throw new Error('exists');
    }
    console.log(`File tracking entry added for ${fileName}`);
  } catch (error) {
    if (error.message !== 'exists') {
      console.error('Error inserting into FileTracking:', error.code);
      throw error;
    } else {
      console.log('File has already been inserted in the Table.');
      throw new Error('exists');
    }
  }
}

module.exports = pushDataToFileTracking;
