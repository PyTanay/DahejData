import mysql from 'mysql2/promise';
import sharedResource from './sharedResource.js';
import pushDataToPrimaryTable from './pushDataToPrimaryTable.js';
import fileProcessed from './fileProcessed.js';

/**
 * Inserts or updates entries in the TagDetails table using a single query.
 * If an entry with the same Tag Name, Description, Engg Units, and Alarm Value exists, it returns the existing TagKey.
 * Otherwise, it inserts a new entry and returns the newly generated TagKey.
 *
 * @param {mysql.PoolConnection} dbConnection - The database connection object.
 * @param {Array} tagDetails - The array of tag details to be inserted or checked.
 * @param {string} sectionName - The section name extracted from the filename.
 * @param {Array} transposedData - The transposed data to be inserted into the primary table.
 * @param {string} filename - The name of the file being processed.
 * @returns {Promise<boolean>} - Returns true if processing is successful.
 */
async function pushDataToSecondaryTable(dbConnection, tagDetails, sectionName, transposedData, filename) {
    try {
        for (let i = 1; i < tagDetails.length; i++) {
            const uniqueKey = tagDetails[i]['Tag Name'] + tagDetails[i].Description.toLowerCase();

            // Check if the key already exists in sharedResource
            const existingTagKey = await sharedResource.getValue(uniqueKey);
            if (existingTagKey) {
                // Skip SQL query, use the existing tagKey
                continue;
            }

            let maxRetries = 3;
            let retryCount = 0;
            let success = false;

            while (!success && retryCount < maxRetries) {
                try {
                    const request = dbConnection;

                    // Use INSERT ... ON DUPLICATE KEY UPDATE to insert or return existing TagKey
                    const mergeQuery = `
                        INSERT IGNORE INTO TagDetails (TagName, Description, EnggUnits, AlarmValue, SectionName)
                        VALUES (?, ?, ?, ?, ?);`; // This allows us to get the existing TagKey

                    const params = [
                        tagDetails[i]['Tag Name'],
                        tagDetails[i].Description,
                        tagDetails[i]['Engg Units'],
                        Number(tagDetails[i]['Alarm\nValue']),
                        sectionName,
                    ];

                    // Execute the query
                    const [result] = await request.query(mergeQuery, params);
                    // Get the TagKey
                    const tagKey = result.insertId; // Use insertId for new entry or existing TagKey

                    // Store the TagKey in the sharedResource
                    if (tagKey !== null && tagKey !== 0) {
                        await sharedResource.addKeyValue(uniqueKey, tagKey);
                    }

                    // if (!tagKey) {
                    //     throw new Error('TagKey not pushed into the object!');
                    // }

                    success = true; // If the code reaches here, the operation was successful
                } catch (err) {
                    if (err.code !== 'ER_DUP_ENTRY') {
                        // Adjusted error check for MySQL
                        retryCount++;
                        const logData = JSON.stringify(tagDetails[i]);
                        sharedResource.logError(`Max retries reached for ${tagDetails[i]},${filename},${logData}`);
                        if (retryCount >= maxRetries) {
                            throw err; // If max retries are reached, throw the error
                        }
                    } else {
                        // If it's a duplicate entry error, throw it immediately
                        console.log('Error while pushing data to secondary table after 3 retries!', err);
                        throw err;
                    }
                }
            }
        }
    } catch (error) {
        console.error('pushDataToSecondaryTable:', error);
        throw error;
    }

    // Proceed with primary table and file processing
    try {
        await pushDataToPrimaryTable(transposedData, filename);
        await fileProcessed(dbConnection, filename);
    } catch (err5) {
        if (err5.message === 'primary:duplicate') {
            await fileProcessed(dbConnection, filename);
            sharedResource.logError(`secondaryPush: primaryPush : Duplicate entry found.: ${filename}`);
        }
        throw err5;
    }

    return true;
}

export default pushDataToSecondaryTable;
