import pkg from 'mssql';
import { Mutex } from 'async-mutex';
const mutex = new Mutex();
const { Request, NVarChar, DateTime: _DateTime, Decimal } = pkg;

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
    try {
        for (const entry of data) {
            const release = await mutex.acquire(); // Acquire the mutex
            try {
                const { DateTime, Value, TagName, SrNo, Description } = entry;
                const request = new Request(dbConnection);
                // console.log(tagKey);
                const insertQuery = `
                  INSERT INTO hourlyData (TagKey, DateTime, Value, Processed)
                  VALUES (@tagKey, @dateTime, @value, 0)`;

                if (tagKey[SrNo + TagName + Description] == null) {
                    console.log(tagKey);
                    console.log(tagKey[SrNo + TagName + Description], SrNo, TagName);
                    throw Error();
                    // continue;
                }
                request.input('tagKey', NVarChar(36), tagKey[SrNo + TagName + Description]);
                request.input('dateTime', _DateTime, DateTime);
                request.input('value', Decimal(18, 2), Value); // Adjust precision and scale as needed
                await request.query(insertQuery);
            } catch (error) {
                if (error.number === 2627) {
                    console.log(
                        'Duplicate entry found, skipping:',
                        entry.SrNo,
                        entry.TagName,
                        tagKey[entry.SrNo + entry.TagName + entry.Description]
                    );
                    continue;
                    // console.error('Error in pushDataToPrimaryTable:', error.number);
                    // throw error;
                } else {
                    console.log('Error in pushDataToPrimaryTable:', entry);
                    throw error;
                }
            } finally {
                release();
            }
        }
    } catch (err) {
        console.log('Error in primary Table', err);
        throw err;
    }
}

export default pushDataToPrimaryTable;
