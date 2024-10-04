import mysql from 'mysql2/promise';

/**
 * Creates a database connection pool with a max of 5 concurrent connections.
 * @returns {Promise<mysql.Pool>} - Returns the connection pool.
 */
async function connectToDatabase() {
    const config = {
        host: process.env.DATABASE_SERVER, // or your server address
        user: process.env.DATABASE_USER, // replace with your MySQL username
        password: process.env.DATABASE_PASSWORD, // replace with your MySQL password
        database: 'Dahej_data', // replace with your database name
        waitForConnections: true,
        connectionLimit: Number(process.env.DATABASE_POOL_MAX) || 5, // Max concurrent connections
        queueLimit: 0, // No limit on queueing connections
    };

    try {
        const pool = mysql.createPool(config);
        return pool;
    } catch (err) {
        console.error('Error creating connection pool:', err);
        throw err;
    }
}

export default connectToDatabase;
