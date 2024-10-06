SET profiling = 1;
-- select count(*) from hourlydata;
SELECT 
    count(td.Description),
    avg(hd.Value),
    sum(td.alarmValue),
    count(td.enggunits),
    count(td.tagname)
FROM 
    -- hourlyData hd
    partitionedHourlyData hd
JOIN 
    TagDetails td ON hd.TagKey = td.TagKey
WHERE 
    td.TagName = 'TIC36620' 
    AND hd.DateTime BETWEEN '2015-01-01 00:00:00' AND '2025-12-31 23:59:59';
SHOW PROFILES;
-- OPTIMIZE TABLE partitionedHourlyData;
-- select * from tagdetails;
-- ALTER TABLE hourlyData ROW_FORMAT=COMPRESSED;


