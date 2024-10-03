import pkg from 'mssql';
// import { v4 as uuidv4 } from 'uuid';
const { Request, NVarChar, Float } = pkg;
// import { appendFile } from 'fs';
import sharedResource from './sharedResource.js';
import pushDataToPrimaryTable from './pushDataToPrimaryTable.js';
import fileProcessed from './fileProcessed.js';

/**
 * Inserts or updates entries in the TagDetails table using a single query.
 * If an entry with the same Tag Name, Description, Engg Units, and Alarm Value exists, it returns the existing TagKey.
 * Otherwise, it inserts a new entry and returns the newly generated TagKey.
 *
 * @param {sql.ConnectionPool} dbConnection - The database connection object.
 * @param {Array} tagDetails - The array of tag details to be inserted or checked.
 * @param {string} sectionName - The section name extracted from the filename.
 * @param {number} maxRetries - The maximum number of retries for handling errors like 2627.
 * @returns {Promise<Array<string>>} - The list of TagKeys of the inserted or existing entries.
 */
async function pushDataToSecondaryTable(dbConnection, tagDetails, sectionName, transposedData, filename) {
    try {
        for (let i = 1; i < tagDetails.length; i++) {
            const uniqueKey = tagDetails[i]['Sr No'] + tagDetails[i]['Tag Name'] + tagDetails[i].Description;

            // Check if the key already exists in sharedResource
            const existingTagKey = await sharedResource.getValue(uniqueKey);
            if (existingTagKey) {
                // Skip SQL query, use the existing tagKey
                continue;
            }

            // const uniqID = uuidv4();
            let maxRetries = 3;
            let retryCount = 0;
            let success = false;

            while (!success && retryCount < maxRetries) {
                try {
                    const request = new Request(dbConnection);

                    // Use the MERGE statement to insert or return existing TagKey
                    const mergeQuery = `DECLARE @TagKey INT;

    -- Check for existing TagKey
    SELECT @TagKey = TagKey
    FROM TagDetails
    WHERE TagName = @tagName AND Description = @description;

    -- If no TagKey found, insert new record
    IF @TagKey IS NULL
    BEGIN
        INSERT INTO TagDetails (TagName, Description, EnggUnits, AlarmValue, SectionName)
        VALUES (@tagName, @description, @enggUnits, @alarmValue, @sectionName);

        -- Get the TagKey of the newly inserted record
        SET @TagKey = SCOPE_IDENTITY();
    END;

    -- Return the TagKey
    SELECT @TagKey AS TagKey;`;

                    // request.input('tagKey', NVarChar(36), uniqID);
                    request.input('tagName', NVarChar, tagDetails[i]['Tag Name']);
                    request.input('description', NVarChar, tagDetails[i].Description);
                    request.input('enggUnits', NVarChar, tagDetails[i]['Engg Units']);
                    request.input('alarmValue', Float, Number(tagDetails[i]['Alarm\nValue']));
                    request.input('sectionName', NVarChar, sectionName);

                    const result = await request.query(mergeQuery);

                    // Store the TagKey in the sharedResource
                    const tagKey = result.recordset[0].TagKey;
                    await sharedResource.addKeyValue(uniqueKey, tagKey);

                    if (!tagKey) {
                        throw new Error('TagKey not pushed into the object!');
                    }

                    success = true; // If the code reaches here, the operation was successful
                } catch (err) {
                    if (err.number !== 2627) {
                        retryCount++;
                        const logData = JSON.stringify(tagDetails[i]);
                        // console.log(`Error 2627 encountered. Retrying ${retryCount}/${maxRetries}...`);
                        sharedResource.logError(`Max retries reached for ${tagDetails[i]},${filename},${logData}`);
                        if (retryCount >= maxRetries) {
                            // console.log(`Max retries reached for ${tagDetails[i]['Tag Name']}`);
                            throw err; // If max retries are reached, throw the error
                        }
                    } else {
                        // If it's not a 2627 error, throw it immediately
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
        await pushDataToPrimaryTable(dbConnection, transposedData, filename);
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
