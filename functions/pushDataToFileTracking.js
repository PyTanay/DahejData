import mysql from 'mysql2/promise';
import sharedResource from './sharedResource.js';

/**
 * Inserts an entry into the FileTracking table to track processed files.
 * @param {mysql.PoolConnection} dbConnection - The database connection object.
 * @param {string} fileName - The name of the file that was processed.
 * @returns {Promise<void>}
 */
async function pushDataToFileTracking(dbConnection, fileName) {
    try {
        // Use a single query to insert or update the file tracking entry
        const insertQuery = `
            INSERT INTO FileTracking (FileName, Processed) 
            VALUES (?, 0) 
            ON DUPLICATE KEY UPDATE 
            Processed = VALUES(Processed);
        `;

        // Execute the insert or update operation
        await dbConnection.query(insertQuery, [fileName]);

        // Now retrieve the processed status
        const [rows] = await dbConnection.query('SELECT Processed FROM FileTracking WHERE FileName = ?;', [fileName]);

        // Handle the processed status as needed
        const processedStatus = rows[0] ? rows[0].Processed : null;
        if (processedStatus === 1) {
            throw new Error('exists'); // If processed is 1, file already processed
        }
        // console.log(`File tracking entry added for ${fileName}`);
    } catch (error) {
        if (error.message === 'exists') {
            // Handle the case where the file has already been processed
            // sharedResource.logError(`FileTracking: File already inserted: ${fileName}`);
            throw error;
        } else {
            // Log the error
            console.log('Error while pushing data to FileTracking:', fileName, error);
            throw error;
        }
    }
}

export default pushDataToFileTracking;
