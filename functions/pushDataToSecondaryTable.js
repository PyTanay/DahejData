import pkg from 'mssql';
import { v4 as uuidv4 } from 'uuid';
const { Request, NVarChar, Float } = pkg;
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
async function pushDataToSecondaryTable(
    dbConnection,
    tagDetails,
    sectionName,
    transposedData,
    filename,
    maxRetries = 3
) {
    try {
        for (let i = 1; i < tagDetails.length; i++) {
            const uniqID = uuidv4();
            let retryCount = 0;
            let success = false;

            while (!success && retryCount < maxRetries) {
                try {
                    const request = new Request(dbConnection);

                    // Use the MERGE statement to insert or return existing TagKey
                    const mergeQuery = `
                      MERGE TagDetails AS target
                      USING (SELECT @tagName AS TagName, @description AS Description, @enggUnits AS EnggUnits, @alarmValue AS AlarmValue, @sectionName AS SectionName) AS source
                      ON target.TagName = source.TagName AND target.Description = source.Description
                      WHEN MATCHED THEN 
                          UPDATE SET target.TagKey = target.TagKey
                      WHEN NOT MATCHED THEN 
                          INSERT (TagKey, TagName, Description, EnggUnits, AlarmValue, SectionName)
                          VALUES (@tagKey , source.TagName, source.Description, source.EnggUnits, source.AlarmValue, source.SectionName)
                      OUTPUT inserted.TagKey;`;

                    request.input('tagKey', NVarChar(36), uniqID);
                    request.input('tagName', NVarChar, tagDetails[i]['Tag Name']);
                    request.input('description', NVarChar, tagDetails[i].Description);
                    request.input('enggUnits', NVarChar, tagDetails[i]['Engg Units']);
                    request.input('alarmValue', Float, Number(tagDetails[i]['Alarm\nValue']));
                    request.input('sectionName', NVarChar, sectionName);

                    const result = await request.query(mergeQuery);

                    // Store the TagKey in the sharedResource
                    const tagKey = result.recordset[0].TagKey;
                    await sharedResource.addKeyValue(
                        tagDetails[i]['Sr No'] + tagDetails[i]['Tag Name'] + tagDetails[i].Description,
                        tagKey
                    );

                    if (!tagKey) {
                        throw new Error('TagKey not pushed into the object!');
                    }

                    success = true; // If the code reaches here, the operation was successful
                } catch (err) {
                    if (err.number === 2627) {
                        retryCount++;
                        // console.log(`Error 2627 encountered. Retrying ${retryCount}/${maxRetries}...`);
                        if (retryCount >= maxRetries) {
                            console.log(`Max retries reached for ${tagDetails[i]['Tag Name']}`);
                            throw err; // If max retries are reached, throw the error
                        }
                    } else {
                        // If it's not a 2627 error, throw it immediately
                        console.log('Error while pushing data to secondary table:', err);
                        throw err;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in pushDataToSecondaryTable:', error);
        throw error;
    }

    // Proceed with primary table and file processing
    await pushDataToPrimaryTable(dbConnection, transposedData, filename);
    await fileProcessed(dbConnection, filename);

    return true;
}

export default pushDataToSecondaryTable;
