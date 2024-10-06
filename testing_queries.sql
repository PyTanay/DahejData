SET profiling = 1;
-- select count(*) from hourlydata;
SELECT 
    td.Description,
    hd.Value,
    hd.DateTime,
   --  sum(td.alarmValue),
    -- count(td.enggunits),
    td.tagname
FROM 
    -- hourlyData hd
    partitionedHourlyData hd
JOIN 
    TagDetails td ON hd.TagKey = td.TagKey
WHERE 
    td.TagName = 'TIC36620' 
    AND hd.DateTime BETWEEN '2015-01-01 00:00:00' AND '2020-02-15 23:59:59';
SHOW PROFILES;
-- OPTIMIZE TABLE partitionedHourlyData;
-- select * from tagdetails;
-- ALTER TABLE hourlyData ROW_FORMAT=COMPRESSED;
-- CREATE INDEX idx_TagKey ON partitionedHourlyData (TagKey);
-- CREATE INDEX idx_DateTime ON partitionedHourlyData (DateTime);
-- DROP INDEX idx_DateTime ON partitionedHourlyData;


