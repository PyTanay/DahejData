SET profiling = 1;
-- select count(*) from hourlydata;
-- SELECT 
--     td.Description,
--     hd.Value,
--     hd.DateTime,
--    --  sum(td.alarmValue),
--     -- count(td.enggunits),
--     td.tagname
-- FROM 
--     hourlyData hd
--     -- partitionedHourlyData hd
-- JOIN 
--     TagDetails td ON hd.TagKey = td.TagKey
-- WHERE 
--     td.TagName = 'PI36648' 
--     AND hd.DateTime BETWEEN '2015-01-01 00:00:00' AND '2020-02-15 23:59:59'
-- ORDER BY
-- 	hd.DateTime DESC
-- LIMIT 1000 OFFSET 0;

-- OPTIMIZE TABLE partitionedHourlyData;
-- select * from tagdetails;
-- ALTER TABLE hourlyData ROW_FORMAT=COMPRESSED;
-- CREATE INDEX idx_TagKey ON partitionedHourlyData (TagKey);
-- CREATE INDEX idx_DateTime ON partitionedHourlyData (DateTime);
-- DROP INDEX idx_DateTime ON partitionedHourlyData;

-- select DateTime,Value from partitionedHourlyData Where TagKey=42 and DateTime between '2015-01-01 00:00:00' AND '2020-02-15 23:59:59' LIMIT 1000 OFFSET 0;
SELECT 
    DATE(DateTime) as Date,
    avg(Value) as Average
--     hd2.Value AS TagValue2  -- Value for the second TagKey
FROM 
    partitionedHourlyData hd
-- JOIN 
--     partitionedHourlyData hd2 ON hd1.DateTime = hd2.DateTime
WHERE 
    TagKey = 76  -- Replace with the first TagKey
--     AND hd2.TagKey = 52  -- Replace with the second TagKey
    AND DateTime BETWEEN '2011-01-01 00:00:00' AND '2020-02-15 23:59:59'

GROUP BY
	hd.DATE(DateTime)
LIMIT 1000 OFFSET 0;


SHOW PROFILES;