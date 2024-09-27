const sql = require("mssql");

/**
 * Creates a database connection pool with a max of 5 concurrent connections.
 * @returns {Promise<sql.ConnectionPool>} - Returns the connection pool.
 */
async function connectToDatabase() {
  const config = {
    user: "8979", // replace with your SQL Server username
    password: "tsg123", // replace with your SQL Server password
    server: "localhost", // or your server address
    database: "Dahej_data", // replace with your database name
    options: {
      encrypt: true, // If you're connecting to Azure, you will need encryption
      trustServerCertificate: true, // Required for self-signed certificates
    },
    pool: {
      max: 5, // Max concurrent connections
      min: 0,
      idleTimeoutMillis: 30000, // Timeout for idle connections
    },
  };

  try {
    const pool = await sql.connect(config);
    console.log("Database connection pool created successfully");
    return pool;
  } catch (err) {
    console.error("Error creating connection pool:", err);
    throw err;
  }
}

module.exports = connectToDatabase;
