/**
 * Transposes the cleaned data to convert hourly columns into rows with DateTime and Value.
 *
 * @param {Object[]} cleanedData - The array of cleaned data objects.
 * @returns {Object[]} - An array of transposed data objects with DateTime and Value.
 */
function transposeData(cleanedData, cleanedHeaders) {
    const transposedData = [];
    cleanedData.forEach((item, index) => {
        for (let i = 10; i < cleanedHeaders.length; i++) {
            const key = cleanedHeaders[i];
            const value = item[key];
            if (value !== undefined) {
                transposedData.push({
                    SrNo: item['Sr No'],
                    TagName: item['Tag Name'],
                    DateTime: key,
                    Description: item['Description'],
                    Value: parseFloat(value) < 10000000000000n ? parseFloat(value) : 0, // Convert value to decimal
                });
            }
        }
    });
    return transposedData;
}

export default transposeData;
