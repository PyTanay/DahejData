import pkg from 'mssql';
const { Request, NVarChar } = pkg;
import { appendFile } from 'fs';
import pushDataToSecondaryTable from './pushDataToSecondaryTable.js';
import sharedResource from './sharedResource.js';

/**
 * Inserts an entry into the FileTracking table to track processed files.
 * @param {sql.ConnectionPool} dbConnection - The database connection object.
 * @param {string} fileName - The name of the file that was processed.
 * @returns {Promise<void>}
 */
async function pushDataToFileTracking(dbConnection, fileName) {
    try {
        const request = new Request(dbConnection);

        // Assuming your FileTracking table has columns for FileName and DateProcessed
        const query = `IF EXISTS (SELECT 1 FROM FileTracking WHERE FileName = @fileName)
                            SELECT Processed FROM FileTracking WHERE FileName = @fileName;
                        ELSE
                        BEGIN
                            INSERT INTO FileTracking (FileName) VALUES (@fileName);
                            SELECT 0 AS Processed; -- Assuming default value for 'Processed' is 0 on insertion
                        END`;

        // Set up the input parameter for the file name
        request.input('fileName', NVarChar, fileName);

        // Execute the query
        const status = await request.query(query);
        // console.log(typeof status.recordset[0].Processed);
        if (status.recordset[0].Processed === true) {
            // console.log(`File ${fileName} Status Log: Already Inserted.`, status.recordset[0]);
            throw new Error('exists');
        }
        // console.log(`File tracking entry added for ${fileName}`);
    } catch (error) {
        if (error.message === 'exists') {
            // sharedResource.logError(`FileTracking: File already inserted: ${fileName}`);
            throw error;
        } else {
            // console.log('Error while pushing data to FileTracking.');
            console.log('FileTracking:', fileName, error);
            throw error;
        }
    }
}

export default pushDataToFileTracking;
