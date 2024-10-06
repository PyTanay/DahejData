DELIMITER //

CREATE PROCEDURE InsertToPartitionedHourlyData()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE batch_size INT DEFAULT 100000;
    DECLARE total_rows INT DEFAULT 0;
    DECLARE inserted_rows INT DEFAULT 0;
    DECLARE current_percentage INT DEFAULT 0;
    DECLARE offset INT DEFAULT 0;

    -- Get total rows in hourlyData
    SELECT COUNT(*) INTO total_rows FROM hourlyData;

    -- Disable foreign key checks
    SET FOREIGN_KEY_CHECKS = 0;

    -- Loop for batch processing
    WHILE NOT done DO
        -- Insert data with offset and limit
        INSERT IGNORE INTO partitionedHourlyData (DateTime, TagKey, Value)
        SELECT DateTime, TagKey, Value
        FROM hourlyData
        LIMIT batch_size OFFSET offset;

        SET inserted_rows = ROW_COUNT();

        IF inserted_rows < batch_size THEN
            SET done = TRUE;
        END IF;

        -- Calculate percentage completion
        SET current_percentage = ROUND(((offset + inserted_rows) / total_rows) * 100);

        -- Insert the percentage completion into ProgressTracking
        INSERT INTO ProgressTracking (PercentageCompleted)
        VALUES (current_percentage);

        -- Increment the offset
        SET offset = offset + inserted_rows;

    END WHILE;

    -- Enable foreign key checks
    SET FOREIGN_KEY_CHECKS = 1;
END //

DELIMITER ;



CREATE TABLE ProgressTracking (
    BatchID INT AUTO_INCREMENT PRIMARY KEY,
    PercentageCompleted INT,
    InsertedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
select * from ProgressTracking;

SET SQL_SAFE_UPDATES = 0;
delete from partitionedhourlydata;
delete from ProgressTracking;
SET SQL_SAFE_UPDATES = 1;
CALL InsertToPartitionedHourlyData();


SHOW PROCESSLIST;
KILL 153;