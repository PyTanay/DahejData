/**
 * Converts 12-hour time format to 24-hour format.
 *
 * @param {string} time - The time in 12-hour format (e.g., "5am", "4 PM")
 * @returns {number} - The hour in 24-hour format (0-23)
 */
function convertTimeTo24Hour(time) {
  const [hour, modifier] = time.trim().split(/(?=[AP]M|am|pm)/i);
  let hourIn24 = parseInt(hour, 10);

  if (modifier.toLowerCase() === 'pm' && hourIn24 < 12) {
    hourIn24 += 12; // Convert PM hours
  } else if (modifier.toLowerCase() === 'am' && hourIn24 === 12) {
    hourIn24 = 0; // Convert 12 AM to 0
  }

  return hourIn24;
}

function convertDateFormat(dateStr) {
  // Split the date and time
  const [datePart, timePart] = dateStr.split(' ');
  const [day, month, year] = datePart.split('-');
  let [hours, minutes] = timePart.split(':');

  // Adjust hours for AM/PM
  if (timePart.includes('pm') && hours !== '12') {
    hours = parseInt(hours) + 12; // Convert to 24-hour format
  } else if (timePart.includes('am') && hours === '12') {
    hours = '00'; // Midnight case
  }

  // Format hours and minutes to ensure two digits
  hours = String(hours).padStart(2, '0');
  minutes = String(minutes).padStart(2, '0');

  // Construct the final date string
  return `${year}-${month}-${day} ${hours}:${minutes}:00`;
}

function parseCustomDateTime(dateTimeStr) {
  // Match the format DD-MM-YYYY HH:mm AM/PM
  const regex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})\s?([AaPp][Mm])$/;
  const match = dateTimeStr.match(regex);
  // console.log(match);

  if (match) {
    const day = match[1];
    const month = match[2] - 1; // Month is 0-indexed in JavaScript Date
    const year = match[3];
    let hour = parseInt(match[4], 10);
    const minute = parseInt(match[5], 10);
    const ampm = match[6];

    // Adjust the hour for AM/PM
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    // Return a new Date object with the parsed components
    return new Date(year, month, day, hour, minute);
  }
}

module.exports = {
  convertTimeTo24Hour,
  parseCustomDateTime,
  convertDateFormat,
};
