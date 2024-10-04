import pkg from 'mssql';
const { Request } = pkg;
import sharedResource from './sharedResource.js';

async function getDateTimeData(dbConnection) {
    const request = new Request(dbConnection);
    const dateTimeQuery = `SELECT * FROM dateTime`;
    const result = await request.query(dateTimeQuery);
    const dateTimeData = {};
    await Promise.all(
        result.recordsets[0].map(async (record) => {
            dateTimeData[new Date(record['DateTime']).toISOString()] = record['DateTimeID'];
        })
    );
    await sharedResource.setDateTimeData(dateTimeData);
    // throw new Error('Error to stop execution!!');
}

export default getDateTimeData;
