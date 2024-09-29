import pkg from 'mssql';
import { v4 as uuidv4 } from 'uuid';
const { Request, NVarChar, Float } = pkg;
import { Mutex } from 'async-mutex';
const mutex = new Mutex();
import fs from 'fs';
import { release } from 'os';
/**
 * Inserts or updates entries in the TagDetails table.
 * If an entry with the same Tag Name, Description, Engg Units, and Alarm Value exists, it returns the existing TagKey.
 * Otherwise, it inserts a new entry and returns the newly generated TagKey.
 *
 * @param {sql.ConnectionPool} dbConnection - The database connection object.
 * @param {Array} tagDetails - The array of tag details to be inserted or checked.
 * @param {string} sectionName - The section name extracted from the filename.
 * @returns {Promise<Array<string>>} - The list of TagKeys of the inserted or existing entries.
 */
async function pushDataToSecondaryTable(dbConnection, tagDetails, sectionName, tagKeyList) {
    // const tagKeyList = {};
    // corrector function for duplicate description in file
    // const descriptionList = [];
    // for (let elem of tagDetails) {
    //     descriptionList.push(elem['Description']);
    // }
    // descriptionList.forEach((elem, j) => {
    //     var conflictNo = 1;
    //     for (let i = j + 1; i < descriptionList.length; i++) {
    //         if (descriptionList[i] === descriptionList[j]) {
    //             descriptionList[i] = descriptionList[i] + '_' + conflictNo;
    //             conflictNo++;
    //         }
    //     }
    // });
    // if (tagDetails.length !== descriptionList.length)
    //     throw new Error(
    //         'Error in push to secondary table corrector function for duplicate discription entries. Lenght of corrected array does not match actual data!'
    //     );
    // for (let k = 0; k < tagDetails.length; k++) {
    //     tagDetails[k]['Description'] = descriptionList[k];
    // }
    // for(let k=0;k<descriptionList["Description"].length)
    // fs.writeFile('./log.json', JSON.stringify(tagDetails), (err) => {
    //     if (err) throw err;
    //     console.log('File was saved!');
    // });

    try {
        for (let i = 1; i < tagDetails.length; i++) {
            const uniqID = uuidv4();
            const request = new Request(dbConnection);
            // console.log(tagDetails[i]);
            // console.log(tagDetails[i]);
            try {
                // First, check if an entry with the same Tag Name, Description, Engg Units, Alarm Value, and SectionName exists
                const selectQuery = `
                  SELECT TagKey FROM TagDetails
                  WHERE TagName = @tagName
                    AND Description = @descriptiom`;

                request.input('tagName', NVarChar, tagDetails[i]['Tag Name']);
                request.input('descriptiom', NVarChar, tagDetails[i]['Description']);

                const result = await request.query(selectQuery);

                if (result.recordset.length > 0) {
                    // If entry exists, return the existing TagKey
                    // console.log(`TagKey found for ${tagDetails[i]['Tag Name']}:`, tagDetails[i]['Tag Name'], tagDetails[i].Description);
                    const release1 = await mutex.acquire(); // Acquire the mutex
                    try {
                        if (!tagKeyList[tagDetails[i]['Sr No'] + tagDetails[i]['Tag Name'] + tagDetails[i].Description])
                            tagKeyList[tagDetails[i]['Sr No'] + tagDetails[i]['Tag Name'] + tagDetails[i].Description] =
                                result.recordset[0].TagKey;
                    } catch (err) {
                        throw err;
                    } finally {
                        release1();
                    }
                } else {
                    // If entry does not exist, insert a new entry
                    const insertRequest = new Request(dbConnection);
                    const insertQuery = `
                      INSERT INTO TagDetails (TagKey, TagName, Description, EnggUnits, AlarmValue, SectionName)
                      OUTPUT inserted.TagKey
                      VALUES (@tagKey , @tagName, @description, @enggUnits, @alarmValue, @sectionName)`;

                    insertRequest.input('tagKey', NVarChar(36), uniqID);
                    insertRequest.input('tagName', NVarChar, tagDetails[i]['Tag Name']);
                    insertRequest.input('description', NVarChar, tagDetails[i].Description);
                    insertRequest.input('enggUnits', NVarChar, tagDetails[i]['Engg Units']);
                    insertRequest.input('alarmValue', Float, Number(tagDetails[i]['Alarm\nValue']));
                    insertRequest.input('sectionName', NVarChar, sectionName);

                    const insertResult = await insertRequest.query(insertQuery);

                    const release2 = await mutex.acquire(); // Acquire the mutex
                    try {
                        tagKeyList[tagDetails[i]['Sr No'] + tagDetails[i]['Tag Name'] + tagDetails[i].Description] =
                            insertResult.recordset[0].TagKey;
                    } catch (err) {
                        throw err;
                    } finally {
                        release2();
                    }
                }
            } catch (err) {
                // console.log('Error while pushing data to secondary table.');
                // throw err;
                if (err.number === 2627) {
                    return false;
                } else {
                    console.log('Error while pushing data to secondary table:', err);
                    throw err;
                }
            }
        }
    } catch (error) {
        console.error('Error in pushDataToSecondaryTable:', error);
        throw error;
    } finally {
        release();
    }
    // return tagKeyList;
}

export default pushDataToSecondaryTable;
