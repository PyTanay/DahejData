import pkg from 'mssql';
import fs from 'fs';
const { connect } = pkg;
import { v4 as uuidv4 } from 'uuid';
/**
 * Creates a database connection pool with a max of 5 concurrent connections.
 * @returns {Promise<sql.ConnectionPool>} - Returns the connection pool.
 */
async function connectToDatabase() {
    const config = {
        user: process.env.DATABASE_USER, // replace with your SQL Server username
        password: process.env.DATABASE_PASSWORD, // replace with your SQL Server password
        server: process.env.DATABASE_SERVER, // or your server address
        database: 'Dahej_data', // replace with your database name
        options: {
            encrypt: true, // If you're connecting to Azure, you will need encryption
            trustServerCertificate: true, // Required for self-signed certificates
        },
        pool: {
            max: Number(process.env.DATABASE_POOL_MAX) || 5, // Max concurrent connections
            min: 0,
            idleTimeoutMillis: 30000, // Timeout for idle connections
        },
    };

    try {
        const pool = await connect(config);

        return pool;
    } catch (err) {
        console.error('Error creating connection pool:', err);
        throw err;
    }
}

export default connectToDatabase;
