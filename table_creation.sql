create database Dahej_data;
USE dahej_data;

-- 1. Create dateTime Table
CREATE TABLE dateTime (
    DateTimeID INT AUTO_INCREMENT PRIMARY KEY,
    DateTime DATETIME NOT NULL,
    UNIQUE KEY (DateTime)
) AUTO_INCREMENT = 0;

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
ALTER TABLE dateTime
ADD CONSTRAINT FK_hourlyData_DateTimeID
FOREIGN KEY (DateTimeID)
REFERENCES hourlyData(DateTimeID)
ON DELETE CASCADE;

ALTER TABLE hourlyData ADD INDEX (TagKey);


ALTER TABLE TagDetails
ADD CONSTRAINT FK_hourlyData_TagKey
FOREIGN KEY (TagKey)
REFERENCES hourlyData(TagKey)
ON DELETE CASCADE;

