import mysql from 'mysql2/promise';
import sharedResource from './sharedResource.js';

/**
 * Fetches dateTime data from the database and stores it in sharedResource.
 * @param {mysql.Pool} dbConnection - The database connection pool.
 * @returns {Promise<void>}
 */
async function getTagListData(dbConnection) {
    try {
        const dateTimeQuery = `SELECT TagKey,TagName,Description FROM tagdetails`;

        // Execute the query
        const [rows] = await dbConnection.execute(dateTimeQuery);

        const tagList = {};

        // Map the results into the dateTimeData object
        await Promise.all(
            rows.map(async (record) => {
                tagList[record['TagName'] + record['Description'].toLowerCase()] = record['TagKey'];
            })
        );

        // Store the dateTimeData in sharedResource
        await sharedResource.setTagKeyData(tagList);

        // Uncomment the line below if you want to throw an error to stop execution
        // throw new Error('Error to stop execution!!');
    } catch (err) {
        console.error('Error fetching dateTime data:', err);
        throw err;
    }
}

export default getTagListData;
