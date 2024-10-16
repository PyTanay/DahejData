import mysql from 'mysql2/promise';
import sharedResource from './sharedResource.js';

/**
 * Inserts an entry into the FileTracking table to track processed files.
 * @param {mysql.PoolConnection} dbConnection - The database connection object.
 * @param {string} fileName - The name of the file that was processed.
 * @returns {Promise<void>}
 */
async function insertedFiles(dbConnection) {
    const inserted=[]
    try {
        // Use a single query to insert or update the file tracking entry
        const selectQuery = `
            SELECT FileName, Processed FROM filetracking WHERE Processed='1'
        `;

        // Execute the insert or update operation
        const [results]=await dbConnection.query(selectQuery);
        results.forEach(elem=>{
            inserted.push(elem.FileName)
        })
        return inserted;
    } catch (error) {
            throw error;
    }
}

export default insertedFiles;