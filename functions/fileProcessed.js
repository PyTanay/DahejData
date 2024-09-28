const sql = require('mssql');

const fileProcessed = async (dbConnection, fileName) => {
  try {
    const request = new sql.Request(dbConnection);
    const insertQuery = `UPDATE FileTracking
                            SET Processed = 1
                            WHERE FileName = @fileName;`;
    request.input('fileName', sql.NVarChar, fileName);
    await request.query(insertQuery);
    console.log(fileName + ' Processed : 1');
  } catch (err) {
    throw err;
  }
};

module.exports = fileProcessed;
