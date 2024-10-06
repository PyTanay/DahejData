create database Dahej_data;
USE dahej_data;

-- 1. Create dateTime Table
CREATE TABLE dateTime (
    DateTimeID INT AUTO_INCREMENT PRIMARY KEY,
    DateTime DATETIME NOT NULL,
    UNIQUE KEY (DateTime)
) AUTO_INCREMENT = 0;
ALTER TABLE dateTime AUTO_INCREMENT = 0;

-- 2. Create TagDetails Table
CREATE TABLE TagDetails (
    TagKey INT AUTO_INCREMENT PRIMARY KEY,
    TagName VARCHAR(255) NOT NULL,
    Description VARCHAR(255) NOT NULL,
    EnggUnits VARCHAR(50),
    AlarmValue FLOAT,
    SectionName VARCHAR(255) NOT NULL,
    SrNo INT NOT NULL,
    UNIQUE (SrNo, TagName, Description)
) AUTO_INCREMENT = 0;

-- 3. Create hourlyData Table
CREATE TABLE hourlyData (
    DateTimeID INT NOT NULL,
    TagKey INT NOT NULL,
    Value FLOAT NOT NULL,
    PRIMARY KEY (DateTimeID, TagKey)
);

-- 4. Create FileTracking Table
CREATE TABLE FileTracking (
    FileName VARCHAR(255) NOT NULL,
    Processed BIT NOT NULL DEFAULT 0,
    ProcessedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (FileName)
);
-- Add foreign key for DateTimeID in hourlyData
ALTER TABLE hourlyData
ADD CONSTRAINT FK_hourlyData_DateTimeID
FOREIGN KEY (DateTimeID)
REFERENCES dateTime(DateTimeID)
ON DELETE CASCADE;

-- Add foreign key for TagKey in hourlyData
ALTER TABLE hourlyData
ADD CONSTRAINT FK_hourlyData_TagKey
FOREIGN KEY (TagKey)
REFERENCES TagDetails(TagKey)
ON DELETE CASCADE;



-- Drop foreign key from dateTime table (if exists)
select count(*) as count from hourlyData;
SET SQL_SAFE_UPDATES = 0;
SELECT * FROM dateTime where DateTime='2020-10-29T23:30:00.000Z';

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE dateTime;  -- or DELETE FROM dateTime;
SET FOREIGN_KEY_CHECKS = 1;


SHOW PROCESSLIST;
KILL 20;

DELETE from hourlyData;
DELETE FROM FileTracking;
DELETE FROM TagDetails;

SET GLOBAL wait_timeout = 28800;  -- 8 hours
SET GLOBAL interactive_timeout = 28800;  -- 8 hours

SELECT 
    table_schema AS 'Database',
    SUM(data_length + index_length) / 1024 / 1024 AS 'Size (MB)'
FROM 
    information_schema.TABLES
WHERE 
    table_schema = 'Dahej_data'
GROUP BY 
    table_schema;
