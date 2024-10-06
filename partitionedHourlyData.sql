DELIMITER $$

CREATE PROCEDURE CreateHourlyDataTable()
BEGIN
    DECLARE v_year INT DEFAULT 2010;  -- Start from 2010
    DECLARE v_month INT DEFAULT 1;
    
    SET @sql = 'CREATE TABLE partitionedHourlyData (
                    DateTime DATETIME NOT NULL,
                    TagKey INT NOT NULL,
                    Value FLOAT NOT NULL,
                    PRIMARY KEY (DateTime, TagKey)
                ) PARTITION BY RANGE (YEAR(DateTime) * 100 + MONTH(DateTime)) (';
    
    WHILE v_year <= 2040 DO
        SET @sql = CONCAT(@sql, 'PARTITION p', LPAD(v_year, 4, '0'), LPAD(v_month, 2, '0'), ' VALUES LESS THAN (', 
                          (v_year * 100 + v_month + 1), '), ');

        SET v_month = v_month + 1;

        IF v_month > 12 THEN
            SET v_month = 1;
            SET v_year = v_year + 1;
        END IF;
    END WHILE;

    -- Remove the last comma and define the final partition for max value
    SET @sql = TRIM(TRAILING ', ' FROM @sql); 
    SET @sql = CONCAT(@sql, ', PARTITION p_max VALUES LESS THAN (208101));'); -- Last partition for values up to January 2081

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DELIMITER ;

-- Call the stored procedure to create the table
CALL CreateHourlyDataTable();

-- SHOW CREATE TABLE partitionedHourlyData;

-- SELECT 
--     TABLE_NAME,
--     PARTITION_NAME,
--     PARTITION_ORDINAL_POSITION,
--     PARTITION_METHOD,
--     SUBPARTITION_METHOD,
--     PARTITION_COMMENT,
--     DATA_LENGTH
-- FROM 
--     information_schema.PARTITIONS
-- WHERE 
--     TABLE_NAME = 'partitionedHourlyData';

