CREATE TABLE `newHourlyData` (
  `TagKey` int NOT NULL,
  `DateTime` datetime NOT NULL,
  `Value` float NOT NULL,
  PRIMARY KEY (`TagKey`, `DateTime`),
  KEY `idx_newHourlyData_DateTime` (`DateTime`)  -- Retained for DateTime-only queries
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
PARTITION BY RANGE (YEAR(DateTime)) (
  PARTITION p2010 VALUES LESS THAN (2011),
  PARTITION p2011 VALUES LESS THAN (2012),
  PARTITION p2012 VALUES LESS THAN (2013),
  PARTITION p2013 VALUES LESS THAN (2014),
  PARTITION p2014 VALUES LESS THAN (2015),
  PARTITION p2015 VALUES LESS THAN (2016),
  PARTITION p2016 VALUES LESS THAN (2017),
  PARTITION p2017 VALUES LESS THAN (2018),
  PARTITION p2018 VALUES LESS THAN (2019),
  PARTITION p2019 VALUES LESS THAN (2020),
  PARTITION p2020 VALUES LESS THAN (2021),
  PARTITION p2021 VALUES LESS THAN (2022),
  PARTITION p2022 VALUES LESS THAN (2023),
  PARTITION p2023 VALUES LESS THAN (2024),
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION p2026 VALUES LESS THAN (2027),
  PARTITION p2027 VALUES LESS THAN (2028),
  PARTITION p2028 VALUES LESS THAN (2029),
  PARTITION p2029 VALUES LESS THAN (2030),
  PARTITION p2030 VALUES LESS THAN (2031),
  PARTITION p_future VALUES LESS THAN (2147483647)  -- Catch-all for years beyond 2030
);
CREATE TABLE `DataPushLog` (
  `PushID` INT NOT NULL AUTO_INCREMENT,
  `BatchSize` INT NOT NULL,
  `StartTime` DATETIME NOT NULL,
  `EndTime` DATETIME NOT NULL,
  `Duration` FLOAT NOT NULL,  -- Duration in seconds
  PRIMARY KEY (`PushID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DELIMITER //

CREATE PROCEDURE PushDataToNewTable(IN batchSize INT, IN numberOfBatches INT, IN startBatch INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE startTime DATETIME;
    DECLARE endTime DATETIME;
    DECLARE totalRowsInserted INT DEFAULT 0;
    DECLARE batchCount INT DEFAULT 0;

    -- Disable keys for faster insertion
    ALTER TABLE newHourlyData DISABLE KEYS;

    -- Loop to push data in batches
    WHILE NOT done AND batchCount < startBatch + numberOfBatches DO
        -- Set start time
        SET startTime = NOW();

        -- Insert data from hourlyData to newHourlyData in batches
        INSERT INTO newHourlyData (TagKey, DateTime, Value)
        SELECT h.TagKey, d.DateTime, h.Value
        FROM hourlyData h
        JOIN dateTime d ON h.DateTimeID = d.DateTimeID
        WHERE NOT EXISTS (
            SELECT 1 
            FROM newHourlyData n 
            WHERE n.TagKey = h.TagKey AND n.DateTime = d.DateTime
        )
        ORDER BY d.DateTime ASC
        LIMIT batchSize;

        -- Get the number of rows inserted
        SET totalRowsInserted = ROW_COUNT();
        
        -- Check if rows were inserted
        IF totalRowsInserted = 0 THEN
            SET done = TRUE;  -- No more rows to insert
        END IF;

        -- Set end time
        SET endTime = NOW();

        -- Log the push duration if any rows were inserted
        IF totalRowsInserted > 0 THEN
            INSERT INTO DataPushLog (BatchSize, StartTime, EndTime, Duration)
            VALUES (totalRowsInserted, startTime, endTime, TIMESTAMPDIFF(SECOND, startTime, endTime));
        END IF;

        SET batchCount = batchCount + 1;  -- Increment batch counter
    END WHILE;

    -- Enable keys after insertion
    ALTER TABLE newHourlyData ENABLE KEYS;
END //

DELIMITER ;






CALL PushDataToNewTable(100000,10,0);
select count(*) from newHourlyData;
SET SQL_SAFE_UPDATES = 0;
DELETE from newHourlyData;
SET SQL_SAFE_UPDATES = 1;
select * from datapushlog;