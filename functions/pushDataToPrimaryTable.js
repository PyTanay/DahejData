import mysql from 'mysql2/promise';
import sharedResource from './sharedResource.js';

/**
 * Inserts data into the hourlyData table.
 *
 * @param {mysql.Pool} dbConnection - The database connection pool.
 * @param {Object[]} data - The data to be inserted, each object containing DateTime and Value.
 * @returns {Promise<void>}
 */
async function pushDataToPrimaryTable(dbConnection, data) {
    const batchSize = Number(process.env.BATCHSIZE) || 2000;

    try {
        // Split data into batches
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize); // Get the current batch

            const connection = await dbConnection.getConnection();
            try {
                await connection.beginTransaction(); // Start transaction

                const values = [];
                const placeholders = [];

                for (const entry of batch) {
                    const { DateTime, Value, TagName, SrNo, Description } = entry;

                    // Fetch the TagKey from sharedResource
                    const tagKey = await sharedResource.getValue(SrNo + TagName + Description);
                    if (tagKey == null) {
                        console.log(await sharedResource.getAll());
                        console.log(tagKey, SrNo + TagName + Description, SrNo, TagName, Description);
                        throw new Error('TagKey is null');
                    }

                    // const dateTimeID = await sharedResource.getDateTimeID(new Date(DateTime).toISOString());
                    // if (!dateTimeID) {
                    //     console.log(`DateTimeID is null for DateTime: ${DateTime} `);
                    //     throw new Error('DateTimeID is null');
                    // }

                    // Prepare the values for insertion
                    values.push([tagKey, DateTime.replace('T', ' ').replace('Z', '').substring(0, 19), Value]);
                    placeholders.push('(?, ?, ?)'); // Each row has 3 placeholders
                }

                // Create the bulk insert query
                const bulkInsertQuery = `
                    INSERT INTO hourlyData (TagKey, DateTime, Value)
                    VALUES ${placeholders.join(', ')}`;

                // Execute the bulk insert
                await connection.query(bulkInsertQuery, values.flat());

                await connection.commit(); // Commit the transaction
            } catch (err) {
                await connection.rollback(); // Rollback on error
                if (err.code === 'ER_DUP_ENTRY') {
                    throw new Error('primary:duplicate'); // Handle duplicate entry error
                }
                console.log(`Error in batch primary table data push. Batch: ${i}`, err);
                throw err; // Rethrow other errors
            } finally {
                connection.release(); // Release the connection back to the pool
            }
        }
    } catch (err1) {
        if (err1.message === 'primary:duplicate') {
            sharedResource.logError(`primaryPush : Duplicate entry`);
            throw err1; // Rethrow duplicate entry error
        } else {
            console.log('Error in primary Table', err1);
            throw err1; // Rethrow other errors
        }
    }
}

export default pushDataToPrimaryTable;
