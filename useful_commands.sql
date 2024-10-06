select * from tagDetails order by TagKey desc;

select * from partitionedHourlyData where TagKey between 1 and 308;
select count(*) as count from hourlyData where TagKey between 1 and 308
AND DateTime between '2020-01-01' and '2024-01-01';
alter table partitionedHourlyData
RENAME COLUMN DateTimeID to DateTime;
SET SQL_SAFE_UPDATES = 0;
delete from hourlyData;
delete from TagDetails;
delete from FileTracking;
SET SQL_SAFE_UPDATES = 1;
ALTER TABLE hourlyData 
MODIFY COLUMN DateTime DATETIME NOT NULL;
ALTER TABLE TagDetails AUTO_INCREMENT = 1;  -- Start from max + 1
select count(*) from hourlyData;
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
SHOW PROCESSLIST;
KILL 151;
SHOW ENGINE INNODB STATUS;
SELECT * FROM INFORMATION_SCHEMA.PROCESSLIST WHERE ID = 87;
select tagkey from tagDetails;
-- Step 1: Enable profiling
SET profiling = 1;

-- Step 2: Run the query
SELECT count(*) FROM hourlyData WHERE DateTime BETWEEN '2015-01-15' AND '2018-01-24'
AND TagKey=16;

-- Step 3: Show profiling results
SHOW PROFILES;

-- Step 4: Optionally, get detailed profile
SHOW PROFILE FOR QUERY 87;  -- Replace 1 with the actual query ID
SHOW VARIABLES LIKE 'secure_file_priv';

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/hourlyData.csv'
IGNORE
INTO TABLE hourlyData
FIELDS TERMINATED BY ',' 
LINES TERMINATED BY '\n'
(DateTime, TagKey, Value);


-- Set buffer pool size to 128 MB
SET GLOBAL innodb_buffer_pool_size = 128 * 1024 * 1024;

-- Set buffer pool size to 256 MB
SET GLOBAL innodb_buffer_pool_size = 256 * 1024 * 1024;

-- Set buffer pool size to 512 MB
SET GLOBAL innodb_buffer_pool_size = 512 * 1024 * 1024;

-- Set buffer pool size to 1 GB
SET GLOBAL innodb_buffer_pool_size = 1 * 1024 * 1024 * 1024;

-- Set buffer pool size to 2 GB
SET GLOBAL innodb_buffer_pool_size = 2 * 1024 * 1024 * 1024;

-- Set buffer pool size to 4 GB
SET GLOBAL innodb_buffer_pool_size = 4 * 1024 * 1024 * 1024;

-- Set buffer pool size to 8 GB
SET GLOBAL innodb_buffer_pool_size = 8 * 1024 * 1024 * 1024;