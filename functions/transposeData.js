/**
 * Transposes the cleaned data to convert hourly columns into rows with DateTime and Value.
 *
 * @param {Object[]} cleanedData - The array of cleaned data objects.
 * @returns {Object[]} - An array of transposed data objects with DateTime and Value.
 */
function transposeData(cleanedData, cleanedHeaders) {
  // console.log(cleanedHeaders);
  const transposedData = [];

  cleanedData.forEach((item, index) => {
    // Loop through each hourly column
    // console.log(item);

    for (let i = 10; i < cleanedHeaders.length; i++) {
      // From 5 AM to 11 PM
      const key = cleanedHeaders[i];
      const value = item[key];
      // console.log(key);
      // Create a new object for each hour's data
      if (value !== undefined) {
        transposedData.push({
          TagName: item["Tag Name"],
          DateTime: key, // Set hours for 5 AM to 11 PM
          Value: parseFloat(value), // Convert value to decimal
          SectionName: item.sectionName,
        });
      }
    }

    // Handle the 12 AM to 4 AM transition
    // for (let i = 10; i < cleanedHeaders.length; i++) {
    //   // From 12 AM to 4 AM
    //   const key = cleanedHeaders[i];
    //   const value = item[key];
    //   console.log(key, value, item);
    //   if (value !== undefined) {
    //     transposedData.push({
    //       DateTime: new Date(item.date).setHours(24 + hour, 0, 0), // Set hours for next day 12 AM to 4 AM
    //       Value: parseFloat(value), // Convert value to decimal
    //       SectionName: item.sectionName,
    //     });
    //   }
    // }
  });
  // console.log(transposedData);
  return transposedData;
}

module.exports = transposeData;
