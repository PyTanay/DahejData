import { createReadStream, readdirSync } from 'fs';
import { basename, join } from 'path';
import csvParser from 'csv-parser';
import dotenv from 'dotenv';
import pLimit from 'p-limit';
import allFunctions from './functions/index.js';
const {
    cleanCsvData,
    transposeData,
    extractInfoFromFilename,
    convertTimeTo24Hour,
    connectToDatabase,
    pushDataToPrimaryTable,
    pushDataToSecondaryTable,
    pushDataToFileTracking,
    fileProcessed,
    b1,
} = allFunctions;
dotenv.config();

// Main function to read and process the CSV file
async function processCsvFile(filePath) {
    const filename = basename(filePath);

    // Extract date and section name from the filename
    const { sectionName, date: baseDate } = extractInfoFromFilename(filename);

    // Track data state
    const state = {
        rowCount: 0,
        cleanedHeaders: null,
    };

    // Store the cleaned CSVdata
    const cleanedData = [];

    // Create a read stream and pipe it through the CSV parser
    return new Promise((resolve, reject) => {
        createReadStream(filePath)
            .pipe(
                csvParser({
                    skipLines: 3,
                    mapHeaders: ({ header, index }) => {
                        if (index > 9) {
                            // Skip first 10 static columns
                            const timeRange = header.trim().split('\n-\n')[0]; // Extract the time range
                            const timeIn24Hr = convertTimeTo24Hour(timeRange);

                            var newDate = new Date(baseDate.getTime());

                            newDate = newDate.getTime() + (index - 9) * 60 * 60 * 1000; // Set the hour to 4 AM
                            newDate = new Date(newDate);

                            return newDate;
                        }
                        return header;
                    },
                })
            )
            .on('data', (row) => {
                cleanCsvData(row, cleanedData, state, baseDate);
            })
            .on('end', async () => {
                // Transpose the cleaned data
                const transposedData = transposeData(cleanedData, state.cleanedHeaders);

                // Connect to the database
                const dbConnection = await connectToDatabase();

                try {
                    // Check if file has been already inserted into the database
                    // Log this file in the FileTracking table
                    await pushDataToFileTracking(dbConnection, filename);

                    // Check for duplicates in the secondary table and insert new entries if necessary
                    const tagKey = await pushDataToSecondaryTable(dbConnection, cleanedData, sectionName);

                    // Insert the cleaned and transposed data into the primary table
                    await pushDataToPrimaryTable(dbConnection, tagKey, transposedData);

                    // console.log('Data pushed to database and file tracking updated.');
                    await fileProcessed(dbConnection, filename);
                } catch (error) {
                    if (error.message === 'exists') {
                        // console.error('File already inserted!');
                    } else {
                        console.error('Error while pushing data:', error);
                        throw error;
                    }
                } finally {
                    dbConnection.close();
                }
                resolve(`Processed ${filePath}`);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Call the main function with your file path
// const filePath = 'E:/hourly-log/esrvtdidhj/TDI-C201_Daily_Average_2_new%20(19%20Aug%202021_08%2025%2028)%20.csv';
// processCsvFile(filePath);

async function processMultipleCsvFiles(directoryPath) {
    // Read the directory and filter for CSV files
    const files = readdirSync(directoryPath).filter((file) => file.endsWith('.csv'));
    const limit = pLimit(Number(process.env.PLIMIT_MAX) || 5);
    let total = files.length,
        current = 0;
    // total !== 0 ? b1.start(total, current) : console.log('Nothing to download.');
    // Map over the files and process each one concurrently
    let errorOccurred = false; // Flag to track if an error has occurred
    const processingPromises = files.map((file) => {
        const filePath = join(directoryPath, file);
        if (current >= total) return false;
        return limit(async () => {
            if (errorOccurred || current >= total) return; // Stop if an error occurred
            try {
                await processCsvFile(filePath);
                // await dummyFunction(500);
                // if (current === 3) throw new Error(`This is error generated in file number ${current + 1}!`);
                current++;
                // b1.update(current);
            } catch (err) {
                errorOccurred = true; // Set flag if an error occurs
                // b1.stop();
                throw err;
            }
            if (current === total) b1.stop();
        });
    });

    // Wait for all processing to complete
    try {
        const results = await Promise.all(processingPromises);
        console.log('All files processed:');
    } catch (error) {
        console.error(error.message);
    }
}

const directoryPath = './data'; // Change this to your CSV directory
processMultipleCsvFiles(directoryPath);

function dummyFunction(duration) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Executed after ${duration} ms`);
        }, duration);
    });
}
