import mysql from 'mysql2/promise';
import sharedResource from './sharedResource.js';

/**
 * Fetches dateTime data from the database and stores it in sharedResource.
 * @param {mysql.Pool} dbConnection - The database connection pool.
 * @returns {Promise<void>}
 */
async function getDateTimeData(dbConnection) {
    try {
        const dateTimeQuery = `SELECT * FROM dateTime`;

        // Execute the query
        const [rows] = await dbConnection.execute(dateTimeQuery);

        const dateTimeData = {};

        // Map the results into the dateTimeData object
        await Promise.all(
            rows.map(async (record) => {
                dateTimeData[new Date(record['DateTime']).toISOString()] = record['DateTimeID'];
            })
        );

        // Store the dateTimeData in sharedResource
        await sharedResource.setDateTimeData(dateTimeData);

        // Uncomment the line below if you want to throw an error to stop execution
        // throw new Error('Error to stop execution!!');
    } catch (err) {
        console.error('Error fetching dateTime data:', err);
        throw err;
    }
}

export default getDateTimeData;
