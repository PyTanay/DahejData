import pkg from 'mssql';
const { Request, NVarChar } = pkg;
const fileProcessed = async (dbConnection, fileName) => {
    try {
        const request = new Request(dbConnection);
        const insertQuery = `UPDATE FileTracking
                            SET Processed = 1
                            WHERE FileName = @fileName;`;
        request.input('fileName', NVarChar, fileName);
        await request.query(insertQuery);
        // console.log(fileName + ' Processed : 1');
    } catch (err) {
        console.log(`fileProcessed: ${fileName}`);
        throw err;
    }
};

export default fileProcessed;
