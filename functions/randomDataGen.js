import { appendFileSync } from 'fs';

const tagList = [
    2, 1, 6, 7, 11, 12, 16, 17, 22, 21, 26, 27, 32, 31, 36, 37, 41, 42, 47, 46, 51, 52, 57, 56, 61, 62, 67, 66, 71, 72,
    77, 76, 82, 78, 86, 87, 91, 92, 96, 97, 101, 102, 107, 106, 111, 112, 117, 116, 121, 122, 127, 126, 131, 132, 137,
    136, 142, 141, 147, 146, 152, 151, 156, 157, 162, 161, 166, 167, 172, 171, 177, 176, 182, 181, 186, 187, 191, 192,
    196, 197, 202, 201, 206, 207, 212, 211, 213, 217, 218, 222, 227, 226, 228, 232, 237, 233, 242, 238, 243, 247, 248,
    252, 257, 253, 261, 262, 267, 266, 271, 272, 277, 273, 281, 282, 286, 287, 292, 288, 297, 293, 302, 301, 306, 307,
    312, 311, 317, 316, 321, 322, 327, 326, 332, 331, 336, 337, 342, 338, 346, 347, 352, 351, 357, 356, 361, 362, 367,
    366, 372, 371, 376, 377, 382, 381, 386, 387, 391, 392, 396, 397, 402, 401, 406, 407, 412, 411, 416, 417, 422, 421,
    427, 426, 431, 432, 436, 437, 442, 438, 447, 446, 451, 452, 456, 457, 462, 461, 466, 467, 472, 471, 476, 477, 482,
    481, 486, 487, 488, 492, 496, 497, 502, 501, 507, 506, 512, 511, 516, 517, 521, 522, 526, 527, 532, 531, 537, 536,
    542, 541, 547, 546, 552, 551, 557, 556, 562, 561, 567, 566, 572, 571, 576, 577, 581, 582, 586, 587, 592, 591, 597,
    596, 602, 601, 606, 607, 611, 612, 616, 617, 621, 622, 626, 627, 632, 631, 636, 637, 642, 641, 646, 647, 652, 651,
    657, 656, 661, 662, 666, 667, 671, 672, 677, 676, 682, 681, 686, 687, 691, 692, 696, 697, 702, 701, 707, 706, 712,
    711, 717, 716, 722, 721, 727, 726, 731, 732, 737, 736, 741, 742, 746, 747, 752, 751, 757, 756, 762, 761, 767, 766,
    771, 772, 777, 776, 782, 781, 787, 786, 791, 792, 796, 797, 802, 801, 806, 807, 812, 811, 816, 817, 822, 821, 826,
    827, 831, 832, 837, 836, 842, 841, 846, 847, 851, 852, 857, 856, 862, 861, 867, 866, 871, 872, 876, 877, 881, 882,
    887, 886, 891, 892, 896, 897, 901, 902, 907, 906, 912, 911, 916, 917, 921, 922, 927, 926, 931, 932, 936, 937, 941,
    942, 947, 946, 951, 952, 957, 956, 961, 962, 967, 966, 972, 971, 976, 977, 981, 982, 987, 986, 992, 991, 996, 997,
    1001, 1002, 1006, 1007, 1012, 1011, 1016, 1017, 1022, 1021, 1026, 1027, 1032, 1031, 1036, 1037, 1041, 1042, 1047,
    1046, 1052, 1051, 1056, 1057, 1062, 1061, 1067, 1066, 1071, 1072, 1077, 1076, 1081, 1082, 1087, 1086, 1092, 1091,
    1096, 1097, 1102, 1101, 1107, 1106, 1112, 1111, 1116, 1117, 1122, 1118, 1127, 1126, 1132, 1131, 1136, 1137, 1142,
    1141, 1146, 1147, 1152, 1151, 1157, 1156, 1162, 1161, 1166, 1167, 1172, 1171, 1176, 1177, 1182, 1181, 1186, 1187,
    1192, 1191, 1196, 1197, 1202, 1201, 1207, 1206, 1212, 1211, 1217, 1216, 1221, 1222, 1226, 1227, 1232, 1231, 1237,
    1236, 1242, 1241, 1247, 1246, 1252, 1251, 1256, 1257, 1262, 1261, 1266, 1267, 1271, 1272, 1277, 1276, 1281, 1282,
    1287, 1286, 1292, 1291, 1297, 1296, 1301, 1302, 1307, 1306, 1311, 1312, 1317, 1316, 1321, 1322, 1327, 1326, 1331,
    1332, 1337, 1336, 1342, 1341, 1347, 1346, 1352, 1351, 1357, 1356, 1361, 1362, 1366, 1367, 1372, 1371, 1377, 1376,
    1382, 1381, 1386, 1387, 1392, 1391, 1396, 1397, 1402, 1401, 1406, 1407, 1412, 1411, 1416, 1417, 1422, 1421, 1427,
    1426, 1432, 1431, 1436, 1437, 1441, 1442, 1447, 1446, 1452, 1451, 1457, 1456, 1462, 1461, 1466, 1467, 1472, 1471,
    1477, 1476, 1482, 1481, 1487, 1486, 1492, 1491, 1496, 1497, 1502, 1501, 1506, 1507, 1512, 1511, 1517, 1516, 1522,
    1521, 1527, 1526, 1532, 1531, 1536,
];
const tagStore = {};
const startDate = new Date('2020-10-11 00:00:00');
const endDate = new Date();

const generateRandomData = async (lastValues, startDate, endDate) => {
    let data = [];
    let currentDate = new Date(startDate);
    const timeDiff = 3600 * 1000; // One hour in milliseconds

    while (currentDate <= endDate) {
        for (const tag of tagList) {
            // Get the last value for the tag
            let lastValue = lastValues[tag] || Math.random() * 1000; // Initialize with a random value if no last value exists

            // Generate a new value within +/- 5% of the last value
            const Change = (Math.random() * 0.1 - 0.05) * 1000; // Random change between -5% to +5%
            const newValue = parseFloat((lastValue + Change).toFixed(2)); // New value

            // Store the new value
            data.push(`,,,${currentDate.toISOString().split('.')[0] + 'Z'},${newValue},,,${tag}`);

            // Update last value for the next iteration
            lastValues[tag] = newValue;
        }
        appendFileSync(csvFilePath, data.join('\n') + '\n', () => {});
        data = [];
        // Move to the next hour
        currentDate = new Date(currentDate.getTime() + timeDiff);
    }

    // return data;
};
// Specify the output CSV file name
const csvFilePath = 'hourlyData.csv';
generateRandomData(tagStore, startDate, endDate);
// Write to the CSV file without headers
// appendFile(csvFilePath, randomData.join('\n'), (err) => {
//     if (err) {
//         console.error('Error writing to file:', err);
//     } else {
//         console.log(`Successfully wrote records to ${csvFilePath}`);
//     }
// });

// Following headers are to be used!
// #group,false,false,true,false,false,true,true
// #datatype,string,long,dateTime:RFC3339,double,string,string,string
// #default,,,,,tagname,dhjdata,
// ,,table,_time,_value,_field,_measurement,_tag
