import mysql from 'mysql2/promise';

const connectionConfig = {
    host: 'localhost', // Change as needed
    user: '8979', // Change as needed
    password: 'tsg123', // Change as needed
    database: 'Dahej_data', // Your database name
};

async function insertDateTimes() {
    const connection = await mysql.createConnection(connectionConfig);

    try {
        // Start transaction
        await connection.beginTransaction();

        const insertSQL = 'INSERT INTO dateTime (DateTime) VALUES ?';

        // Generate datetime array from 1/1/10 to 31/12/40
        const startDate = new Date('2010-01-01T00:30:00Z');
        const endDate = new Date('2040-12-31T23:30:00Z');

        const dateTimes = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dateTimes.push([currentDate.toISOString().slice(0, 19).replace('T', ' ')]); // Format as 'YYYY-MM-DD HH:mm:ss'
            currentDate.setHours(currentDate.getHours() + 1); // Increment by 1 hour
        }

        // Batch insert
        const [result] = await connection.query(insertSQL, [dateTimes]);

        // Commit transaction
        await connection.commit();
        console.log(`Inserted ${result.affectedRows} rows into dateTime table.`);
    } catch (error) {
        console.error('Error occurred:', error);
        // Rollback transaction in case of error
        await connection.rollback();
    } finally {
        // Close the connection
        await connection.end();
    }
}

// Execute the function
insertDateTimes();
