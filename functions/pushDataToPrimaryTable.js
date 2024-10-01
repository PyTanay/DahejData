import pkg from 'mssql';
import { appendFile } from 'fs';
import sharedResource from './sharedResource.js';

const { Request, Transaction, NVarChar, DateTime: _DateTime, Decimal } = pkg;

/**
 * Inserts data into the hourlyData table.
 *
 * @param {sql.ConnectionPool} dbConnection - The database connection object.
 * @param {string} tagKey - The TagKey associated with the tag details.
 * @param {Object[]} data - The data to be inserted, each object containing DateTime and Value.
 * @returns {Promise<void>}
 */
async function pushDataToPrimaryTable(dbConnection, data) {
    const batchSize = Number(process.env.BATCHSIZE) || 2000;
    try {
        // Split data into batches
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize); // Get the current batch

            let transaction;
            try {
                transaction = new Transaction(dbConnection);
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

                    if ((await sharedResource.getValue(SrNo + TagName + Description)) == null) {
                        console.log(await sharedResource.getAll());
                        console.log(
                            await sharedResource.getValue(SrNo + TagName + Description),
                            SrNo + TagName + Description,
                            SrNo,
                            TagName,
                            Description
                        );
                        throw Error('TagKey is null');
                    }

                    values.push(`(
                        '${await sharedResource.getValue(SrNo + TagName + Description)}',
                        '${DateTime}',
                        ${Value},
                        0
                    )`);
                }

                // Join all values to form a single bulk insert query for the current batch
                bulkInsertQuery += values.join(', ');

                // Execute the bulk insert for the batch
                await request.query(bulkInsertQuery);

                // Commit the transaction for the batch
                await transaction.commit();
            } catch (err) {
                if (transaction) {
                    await transaction.rollback(); // Ensure rollback on error
                }
                if (err.number === 10738) {
                    console.log('More than 1000 rows');
                    throw err;
                } else if (err.number === 2627) {
                    throw new Error('primary:duplicate');
                } else {
                    console.log(`Error in batch primary table data push. Batch: ${i}`);
                    throw err;
                }
            }
        }
    } catch (err1) {
        if (err1.message === 'primary:duplicate') {
            appendFile('./logfile.log', 'primaryPush : Duplicate entry\n', (err) => {
                if (err) console.error('Error appending to logfile', err);
            });
            throw err1;
        } else {
            console.log('Error in primary Table', err1);
            throw err1;
        }
    }
}

export default pushDataToPrimaryTable;
