const sql = require("mssql");
const { v4: uuidv4 } = require("uuid");

/**
 * Inserts or updates entries in the TagDetails table.
 * If an entry with the same Tag Name, Description, Engg Units, and Alarm Value exists, it returns the existing TagKey.
 * Otherwise, it inserts a new entry and returns the newly generated TagKey.
 *
 * @param {sql.ConnectionPool} dbConnection - The database connection object.
 * @param {Array} tagDetails - The array of tag details to be inserted or checked.
 * @param {string} sectionName - The section name extracted from the filename.
 * @returns {Promise<Array<string>>} - The list of TagKeys of the inserted or existing entries.
 */
async function pushDataToSecondaryTable(dbConnection, tagDetails, sectionName) {
  const tagKeyList = {};

  try {
    for (let i = 1; i < tagDetails.length; i++) {
      const uniqID = uuidv4();
      const request = new sql.Request(dbConnection);
      // console.log(tagDetails[i]);

      // First, check if an entry with the same Tag Name, Description, Engg Units, Alarm Value, and SectionName exists
      const selectQuery = `
                SELECT TagKey FROM TagDetails
                WHERE TagName = @tagName
                  AND Description = @description
                  AND EnggUnits = @enggUnits
                  AND AlarmValue = @alarmValue
                  AND SectionName = @sectionName`;

      request.input("tagName", sql.NVarChar, tagDetails[i]["Tag Name"]);
      request.input("description", sql.NVarChar, tagDetails[i].Description);
      request.input("enggUnits", sql.NVarChar, tagDetails[i]["Engg Units"]);
      request.input("alarmValue", sql.Float, Number(tagDetails[i]["Alarm\nValue"]));
      request.input("sectionName", sql.NVarChar, sectionName);

      const result = await request.query(selectQuery);

      if (result.recordset.length > 0) {
        // If entry exists, return the existing TagKey
        console.log(`TagKey found for ${tagDetails[i]["Tag Name"]}:`, tagDetails[i]["Tag Name"], tagDetails[i].Description);
        tagKeyList[tagDetails[i]["Tag Name"]] = result.recordset[0].TagKey;
      } else {
        // If entry does not exist, insert a new entry
        const insertRequest = new sql.Request(dbConnection);
        const insertQuery = `
                    INSERT INTO TagDetails (TagKey, TagName, Description, EnggUnits, AlarmValue, SectionName)
                    OUTPUT inserted.TagKey
                    VALUES (@tagKey, @tagName, @description, @enggUnits, @alarmValue, @sectionName)`;

        insertRequest.input("tagKey", sql.NVarChar(36), uniqID);
        insertRequest.input("tagName", sql.NVarChar, tagDetails[i]["Tag Name"]);
        insertRequest.input("description", sql.NVarChar, tagDetails[i].Description);
        insertRequest.input("enggUnits", sql.NVarChar, tagDetails[i]["Engg Units"]);
        insertRequest.input("alarmValue", sql.Float, Number(tagDetails[i]["Alarm\nValue"]));
        insertRequest.input("sectionName", sql.NVarChar, sectionName);

        const insertResult = await insertRequest.query(insertQuery);

        console.log(`New TagKey inserted for ${tagDetails[i]["Tag Name"]}:`, tagDetails[i]["Tag Name"], tagDetails[i].Description);
        tagKeyList[tagDetails[i]["Tag Name"]] = insertResult.recordset[0].TagKey;
      }
    }
  } catch (error) {
    console.error("Error in pushDataToSecondaryTable:", error);
    throw error;
  }

  return tagKeyList;
}

module.exports = pushDataToSecondaryTable;
