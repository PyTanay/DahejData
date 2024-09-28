const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const cliProgress = require('cli-progress');
const pLimit = require('p-limit');
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
} = require('./functions');
const { format } = require('util');

// Main function to read and process the CSV file
async function processCsvFile(filePath) {
  const filename = path.basename(filePath);

  // Extract date and section name from the filename
  const { sectionName, date: baseDate } = extractInfoFromFilename(filename);

  // Track data state
  const state = {
    rowCount: 0,
    cleanedHeaders: null,
  };

  // Store the cleaned CSV data
  const cleanedData = [];

  // Create a read stream and pipe it through the CSV parser
  fs.createReadStream(filePath)
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
      console.log('CSV file successfully processed.');

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
        if (error.message !== 'exists') {
          console.error('Error while pushing data:', error);
          throw error;
        } else {
          console.error('File already inserted!');
        }
      } finally {
        dbConnection.close();
      }
    });
  return Promise.resolve(`Processed ${filePath}`);
}

// Call the main function with your file path
const filePath = 'E:/hourly-log/esrvtdidhj/TDI-C201_Daily_Average_2_new%20(19%20Aug%202021_08%2025%2028)%20.csv';
// processCsvFile(filePath);
const b1 = new cliProgress.SingleBar({
  format:
    'File checking progress || {bar} || {percentage}% || {value}/{total} Files || ETA : {eta_formatted} || Time elapsed : {duration_formatted}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
});

async function processMultipleCsvFiles(directoryPath) {
  // Read the directory and filter for CSV files
  const files = fs.readdirSync(directoryPath).filter((file) => file.endsWith('.csv'));
  let total = 10,
    current = 0;
  // total=files.length;
  total !== 0 ? b1.start(total, current) : console.log('Nothing to download.');
  // Map over the files and process each one concurrently
  const processingPromises = files.map(async (file) => {
    const filePath = path.join(directoryPath, file);
    if (current >= total) {
      return false;
    }
    const limit = pLimit(5);
    return limit(async () => {
      await dummyFunction(3000);
      // await processCsvFile(filePath);
      if (current <= total) {
        b1.update(current);
        current++;
      } else {
        b1.stop();
      }
    });
  });

  // Wait for all processing to complete
  try {
    const results = await Promise.all(processingPromises);
    console.log('All files processed:');
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

const directoryPath = 'E:/hourly-log/esrvtdidhj'; // Change this to your CSV directory
processMultipleCsvFiles(directoryPath);

function dummyFunction(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Executed after ${duration} ms`);
    }, duration);
  });
}
