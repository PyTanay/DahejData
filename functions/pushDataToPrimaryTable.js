import pkg from 'mssql';
import { Mutex } from 'async-mutex';
const mutex = new Mutex();
import fs from 'fs';
const { Request, Transaction, NVarChar, DateTime: _DateTime, Decimal } = pkg;

// import { parseCustomDateTime, convertDateFormat } from './convertTimeTo24Hour';

/**
 * Inserts data into the hourlyData table.
 *
 * @param {sql.ConnectionPool} dbConnection - The database connection object.
 * @param {string} tagKey - The TagKey associated with the tag details.
 * @param {Object[]} data - The data to be inserted, each object containing DateTime and Value.
 * @returns {Promise<void>}
 */
async function pushDataToPrimaryTable(dbConnection, tagKey, data) {
    const batchSize = Number(process.env.BATCHSIZE) || 2000;
    try {
        // Split data into batches
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize); // Get the current batch

            const release = await mutex.acquire(); // Acquire mutex once per batch

            try {
                const transaction = new Transaction(dbConnection);
                await transaction.begin();
                const request = new Request(transaction);

                let bulkInsertQuery = `
                    INSERT INTO hourlyData (TagKey, DateTime, Value, Processed)
                    VALUES `;

                const values = [];

                // console.log(tagKey);
                // fs.writeFile(`./log${i}.json`, JSON.stringify(tagKey), (err) => {
                //     if (err) throw err;
                //     console.log('File was saved!');
                // });
                for (const entry of batch) {
                    const { DateTime, Value, TagName, SrNo, Description } = entry;

                    if (tagKey[SrNo + TagName + Description] == null) {
                        console.log(tagKey);
                        console.log(tagKey[SrNo + TagName + Description], SrNo, TagName);
                        throw Error('TagKey is null');
                    }

                    // Prepare the values for bulk insert
                    values.push(`(
                        '${tagKey[SrNo + TagName + Description]}',
                        '${DateTime}',
                        ${Value},
                        0
                    )`);
                }

                // Join all values to form a single bulk insert query for the current batch
                bulkInsertQuery += values.join(', ');
                // console.log(bulkInsertQuery);
                // Execute the bulk insert for the batch
                await request.query(bulkInsertQuery);

                // Commit the transaction for the batch
                await transaction.commit();
            } catch (err) {
                if (err.number === 10738) {
                    console.log('More than 1000 rows');
                    throw err();
                } else if (err.number === 2627) {
                    throw new Error('primary:duplicate');
                } else {
                    throw err;
                }
            } finally {
                release(); // Release the mutex after the batch is processed
            }
        }

        // const release = await mutex.acquire(); // Acquire the mutex
        // try {
        //     const transaction = new dbConnection.Transaction();
        //     await transaction.begin();
        //     const request = new Request(transaction);

        //     // console.log(tagKey);
        //     let bulkInsertQuery = `
        //         INSERT INTO hourlyData (TagKey, DateTime, Value, Processed)
        //         VALUES `;

        //     const values = [];
        //     for (const entry of data) {
        //         const { DateTime, Value, TagName, SrNo, Description } = entry;
        //         if (tagKey[SrNo + TagName + Description] == null) {
        //             console.log(tagKey);
        //             console.log(tagKey[SrNo + TagName + Description], SrNo, TagName);
        //             throw Error();
        //             // continue;
        //         }
        //         values.push(`(
        //                 '${tagKey[SrNo + TagName + Description]}',
        //                 '${DateTime.toISOString()}',
        //                 ${Value},
        //                 0
        //             )`);

        //         // Join all values to form a single bulk insert query
        //         bulkInsertQuery += values.join(', ');

        //         // Execute the bulk insert
        //         await request.query(bulkInsertQuery);

        //         await transaction.commit();
        //     }

        //     request.input('tagKey', NVarChar(36), tagKey[SrNo + TagName + Description]);
        //     request.input('dateTime', _DateTime, DateTime);
        //     request.input('value', Decimal(18, 2), Value); // Adjust precision and scale as needed
        //     await request.query(insertQuery);
        // } catch (error) {
        //     if (error.number === 2627) {
        //         // console.log(
        //         //     'Duplicate entry found, skipping:',
        //         //     entry.SrNo,
        //         //     entry.TagName,
        //         //     tagKey[entry.SrNo + entry.TagName + entry.Description]
        //         // );
        //         // continue;
        //         // console.error('Error in pushDataToPrimaryTable:', error.number);
        //         // throw error;
        //     } else {
        //         console.log('Error in pushDataToPrimaryTable:', entry);
        //         throw error;
        //     }
        // } finally {
        //     release();
        // }
    } catch (err1) {
        if (err1.message === 'primary:duplicate') {
            throw err1;
        } else {
            console.log('Error in primary Table', err1);
            throw err1;
        }
    }
}

export default pushDataToPrimaryTable;
