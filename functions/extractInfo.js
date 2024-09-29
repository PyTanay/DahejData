import path from 'path';

/**
 * Extracts the section name and date from the given filename.
 * @param {string} filename - The name of the file to extract information from.
 * @returns {Object} - An object containing the section name and date.
 */
function extractInfoFromFilename(filename) {
  // Extract section name (everything before the first '-')
  const sectionName = filename.split('-')[0];

  // Extract date from the filename
  const dateRegex = /(\d{1,2})%20([A-Za-z]+)%20(\d{4})/; // Matches the date format
  const match = filename.match(dateRegex);
  let date = null;
  if (match) {
    const day = match[1];
    const month = match[2];
    const year = match[3];
    date = new Date(`${month} ${day}, ${year}`);
    // Adjust to the day before at 5:00 AM
    date.setDate(date.getDate() - 1);
    date.setHours(3, 0, 0);
  }
  return { sectionName, date };
}

export default extractInfoFromFilename;
