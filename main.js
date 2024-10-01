import allFunctions from './functions/index.js';
import { createReadStream, readdirSync, appendFile } from 'fs';
import { basename, join } from 'path';
import csvParser from 'csv-parser';
import dotenv from 'dotenv';
import pLimit from 'p-limit';

const {
    sharedResource,
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
    tagNameCorrector,
} = allFunctions;
dotenv.config();

// This is central tagKeyList store and is kept here so that all concurrent instances can use the store

// Main function to read and process the CSV file
async function processCsvFile(filePath, dbConnection) {
    const filename = basename(filePath);

    // Extract date and section name from the filename
    const { sectionName, date: baseDate } = extractInfoFromFilename(filename);

    // Track data state
    const state = {
        rowCount: 0,
        cleanedHeaders: null,
    };

    // Create a read stream and pipe it through the CSV parser
    return new Promise(async (resolve, reject) => {
        // Store the cleaned CSVdata
        const cleanedData = [];
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
                            // console.log(newDate.toISOString());
                            return newDate.toISOString();
                        }
                        return header;
                    },
                })
            )
            .on('data', (row) => {
                cleanCsvData(row, cleanedData, state, baseDate);
            })
            .on('end', async () => {
                tagNameCorrector(cleanedData);
                // Transpose the cleaned data

                const transposedData = transposeData(cleanedData, state.cleanedHeaders);

                try {
                    // Check if file has been already inserted into the database
                    // Log this file in the FileTracking table
                    await pushDataToFileTracking(dbConnection, filename);
                    // Check for duplicates in the secondary table and insert new entries if necessary
                    await pushDataToSecondaryTable(dbConnection, cleanedData, sectionName, transposedData, filename);
                    // Insert the cleaned and transposed data into the primary table
                    // await pushDataToPrimaryTable(dbConnection, transposedData);
                    // console.log('Data pushed to database and file tracking updated.');
                    // await fileProcessed(dbConnection, filename);
                    resolve(`Processed ${filePath}`);
                } catch (err3) {
                    if (err3.message === 'exists') {
                        // console.error('File already inserted!');
                        resolve(`Processed ${filePath} with error!`);
                    } else if (err3.message === 'primary:duplicate') {
                        appendFile('./logfile.log', `Main : ProcessCSV : ${filename}\n`, (err) => {
                            if (err) console.error('Error appending to logfile', err);
                        });
                        resolve(`Processed ${filePath} with error!`);
                        // reject(err3);
                        // throw err3;
                    } else {
                        console.log('Main : ProcessCSV : ', filename);
                        console.error('Error:', err3);
                        throw err3;
                    }
                }
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
    let files = readdirSync(directoryPath).filter((file) => file.endsWith('.csv'));
    const limit = pLimit(Number(process.env.PLIMIT_MAX) || 5);
    let total = 200 || files.length,
        current = 0;
    total !== 0 ? b1.start(total, current) : console.log('Nothing to download.');
    files = files.slice(current, total);
    // Connect to the database
    const dbConnection = await connectToDatabase();

    // Map over the files and process each one concurrently
    let errorOccurred = false; // Flag to track if an error has occurred
    const processingPromises = files.map((file) => {
        const filePath = join(directoryPath, file);
        if (current >= total) return false;
        return limit(async () => {
            if (errorOccurred || current >= total) return; // Stop if an error occurred
            try {
                await processCsvFile(filePath, dbConnection);
                current++;
                b1.update(current);
            } catch (err4) {
                if (err4.message === 'primary:duplicate') {
                    console.error('File skipped!');
                    current++;
                    b1.update(current);
                    return 'Not Done';
                } else {
                    errorOccurred = true; // Set flag if an error occurs
                    console.log(err4.message, 'From final');
                }
                // b1.stop();
            }
            if (current === total) b1.stop();
            return 'Done';
        });
    });

    // Wait for all processing to complete
    try {
        const results = await Promise.all(processingPromises);
        console.log('All files processed:');
        results.forEach((result, index) => {
            // console.log(result, index);
            if (result.status === 'rejected') {
                console.error(`Error processing file ${files[index]}: ${result}`);
            } else {
                // console.log(result);
            }
        });
    } catch (error) {
        console.error(error.message, error);
    } finally {
        await dbConnection.close();
    }
}

const directoryPath = process.env.FOLDER_PATH || './data'; // Change this to your CSV directory
processMultipleCsvFiles(directoryPath);

function dummyFunction(duration) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Executed after ${duration} ms`);
        }, duration);
    });
}
