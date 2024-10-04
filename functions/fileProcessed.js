import mysql from 'mysql2/promise';

/**
 * Marks a file as processed in the FileTracking table.
 * @param {mysql.Pool} dbConnection - The database connection pool.
 * @param {string} fileName - The name of the file to mark as processed.
 * @returns {Promise<void>}
 */
const fileProcessed = async (dbConnection, fileName) => {
    try {
        const updateQuery = `UPDATE FileTracking
                             SET Processed = 1
                             WHERE FileName = ?;`; // Use '?' for parameterized query

        const [result] = await dbConnection.execute(updateQuery, [fileName]);
        // Optionally, you can log the result
        // console.log(`${fileName} Processed: ${result.affectedRows} row(s) updated`);
    } catch (err) {
        console.log(`fileProcessed: ${fileName}`);
        throw err;
    }
};

export default fileProcessed;
