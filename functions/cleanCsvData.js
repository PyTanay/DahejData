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
    // Handle the 4th row (header row)
    if (state.rowCount === 1) {
        // console.log(Object.keys(row));
        const cleanedHeaders = Object.keys(row);

        // // Store cleaned headers in state
        state.cleanedHeaders = cleanedHeaders;
        cleanedData.push(cleanedHeaders);
    }

    cleanedData.push(row);
}

export default cleanCsvData;
