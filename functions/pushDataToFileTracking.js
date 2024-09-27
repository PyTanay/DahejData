const sql = require("mssql");

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
    const query = `
            INSERT INTO FileTracking (FileName)
            VALUES (@fileName)`;

    // Set up the input parameter for the file name
    request.input("fileName", sql.NVarChar, fileName);

    // Execute the query
    await request.query(query);

    console.log(`File tracking entry added for ${fileName}`);
  } catch (error) {
    console.error("Error inserting into FileTracking:", error);
    throw error;
  }
}

module.exports = pushDataToFileTracking;
