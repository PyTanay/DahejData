const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const {
  cleanCsvData,
  transposeData,
  extractInfoFromFilename,
  convertTimeTo24Hour,
  connectToDatabase,
  pushDataToPrimaryTable,
  pushDataToSecondaryTable,
  pushDataToFileTracking,
} = require("./functions");
const { format } = require("util");

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
            const timeRange = header.trim().split("\n-\n")[0]; // Extract the time range
            const timeIn24Hr = convertTimeTo24Hour(timeRange);

            // Clone baseDate to avoid mutation and add the current hour
            // console.log(baseDate, baseDate.getTime());
            var newDate = new Date(baseDate.getTime());
            if (timeIn24Hr < 5) {
              newDate = new Date(newDate.getTime() + 24 * 60 * 60 * 1000);
            }
            newDate.setHours(timeIn24Hr);
            // Convert the new date to the desired format
            const options = {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata", // Replace with your timezone
            };

            // Convert the date to your specified timezone
            return newDate.toLocaleString("en-GB", options).replace(",", "").replace(/\//g, "-");
          }
          return header;
        },
      })
    )
    .on("data", (row) => {
      cleanCsvData(row, cleanedData, state, baseDate);
    })
    .on("end", async () => {
      console.log("CSV file successfully processed.");

      // Transpose the cleaned data
      const transposedData = transposeData(cleanedData, state.cleanedHeaders);

      // Connect to the database
      const dbConnection = await connectToDatabase();

      try {
        // Check for duplicates in the secondary table and insert new entries if necessary
        const tagKey = await pushDataToSecondaryTable(dbConnection, cleanedData, sectionName);

        // Insert the cleaned and transposed data into the primary table
        await pushDataToPrimaryTable(dbConnection, tagKey, transposedData);

        // Log this file in the FileTracking table
        await pushDataToFileTracking(dbConnection, filename);

        console.log("Data pushed to database and file tracking updated.");
      } catch (error) {
        console.error("Error while pushing data:", error);
      } finally {
        dbConnection.close();
      }
    });
}

// Call the main function with your file path
const filePath = "./data/TDI-C201_Daily_Average_2_new%20(19%20Aug%202021_08%2025%2028)%20.csv";
processCsvFile(filePath);
