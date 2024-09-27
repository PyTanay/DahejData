const { convertTimeTo24Hour } = require("./convertTimeTo24Hour");
/**
 * Cleans the CSV data row by row as it's parsed in a stream.
 * The first 3 rows are ignored, and headers are modified once the 4th row is reached.
 *
 * @param {Array} row - The current row being parsed by the CSV parser.
 * @param {Array} cleanedData - The array where cleaned rows are stored.
 * @param {Object} state - Tracks the row count and header transformation status.
 * @param {Date} baseDate - The base date extracted from the filename (date - 1 day at 5:00 AM).
 */
function cleanCsvData(row, cleanedData, state, baseDate) {
  // Track the current row count
  state.rowCount++;

  // Ignore the first 3 rows
  // if (state.rowCount <= 3) {
  //   return;
  // }

  // Handle the 4th row (header row)
  if (state.rowCount === 1) {
    // console.log(Object.keys(row));
    const cleanedHeaders = Object.keys(row);

    // // Modify headers: Convert the time-related columns to datetime format
    // const cleanedHeaders = headers.map((header, index) => {
    //   if (index > 9) {
    //     // Skip first 10 static columns
    //     const timeRange = header.trim().split("\n-\n")[0]; // Extract the time range
    //     const timeIn24Hr = convertTimeTo24Hour(timeRange);

    //     // Clone baseDate to avoid mutation and add the current hour
    //     const newDate = new Date(baseDate.getTime());
    //     newDate.setHours(timeIn24Hr);

    //     // Convert the new date to the desired format
    //     return newDate.toISOString().replace("T", " ").slice(0, 16); // 'YYYY-MM-DD HH:MM'
    //   }
    //   return header;
    // });

    // // Store cleaned headers in state
    state.cleanedHeaders = cleanedHeaders;
    cleanedData.push(cleanedHeaders);
  }
  // Handle subsequent data rows
  else {
    cleanedData.push(row);
  }
}

module.exports = cleanCsvData;
