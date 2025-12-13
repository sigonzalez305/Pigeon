// Pigeon MSG — browser-only Tamagotchi messenger
// This file keeps all gameplay, storage, and UI wiring in one place so it can run on GitHub Pages.

const AREA_CODE_DATA = [
  { code: '201', state: 'New Jersey', city: 'Jersey City', lat: 40.7282, lon: -74.0776 },
  { code: '202', state: 'District of Columbia', city: 'Washington', lat: 38.9072, lon: -77.0369 },
  { code: '203', state: 'Connecticut', city: 'New Haven', lat: 41.3083, lon: -72.9279 },
  { code: '205', state: 'Alabama', city: 'Birmingham', lat: 33.5186, lon: -86.8104 },
  { code: '206', state: 'Washington', city: 'Seattle', lat: 47.6062, lon: -122.3321 },
  { code: '207', state: 'Maine', city: 'Portland', lat: 43.6591, lon: -70.2568 },
  { code: '208', state: 'Idaho', city: 'Boise', lat: 43.615, lon: -116.2023 },
  { code: '209', state: 'California', city: 'Stockton', lat: 37.9577, lon: -121.2908 },
  { code: '210', state: 'Texas', city: 'San Antonio', lat: 29.4241, lon: -98.4936 },
  { code: '212', state: 'New York', city: 'New York City', lat: 40.7128, lon: -74.006 },
  { code: '213', state: 'California', city: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { code: '214', state: 'Texas', city: 'Dallas', lat: 32.7767, lon: -96.797 },
  { code: '215', state: 'Pennsylvania', city: 'Philadelphia', lat: 39.9526, lon: -75.1652 },
  { code: '216', state: 'Ohio', city: 'Cleveland', lat: 41.4993, lon: -81.6944 },
  { code: '217', state: 'Illinois', city: 'Springfield', lat: 39.7817, lon: -89.6501 },
  { code: '218', state: 'Minnesota', city: 'Duluth', lat: 46.7867, lon: -92.1005 },
  { code: '219', state: 'Indiana', city: 'Gary', lat: 41.5934, lon: -87.3464 },
  { code: '220', state: 'Ohio', city: 'Newark', lat: 40.0581, lon: -82.4013 },
  { code: '224', state: 'Illinois', city: 'Arlington Heights', lat: 42.0884, lon: -87.9806 },
  { code: '225', state: 'Louisiana', city: 'Baton Rouge', lat: 30.4515, lon: -91.1871 },
  { code: '227', state: 'Maryland', city: 'Gaithersburg', lat: 39.1434, lon: -77.2014 },
  { code: '228', state: 'Mississippi', city: 'Biloxi', lat: 30.396, lon: -88.8853 },
  { code: '229', state: 'Georgia', city: 'Albany', lat: 31.5785, lon: -84.1557 },
  { code: '231', state: 'Michigan', city: 'Muskegon', lat: 43.2342, lon: -86.2484 },
  { code: '234', state: 'Ohio', city: 'Akron', lat: 41.0814, lon: -81.519 },
  { code: '239', state: 'Florida', city: 'Fort Myers', lat: 26.6406, lon: -81.8723 },
  { code: '240', state: 'Maryland', city: 'Frederick', lat: 39.4143, lon: -77.4105 },
  { code: '248', state: 'Michigan', city: 'Troy', lat: 42.6064, lon: -83.1498 },
  { code: '251', state: 'Alabama', city: 'Mobile', lat: 30.6954, lon: -88.0399 },
  { code: '252', state: 'North Carolina', city: 'Greenville', lat: 35.6127, lon: -77.3664 },
  { code: '253', state: 'Washington', city: 'Tacoma', lat: 47.2529, lon: -122.4443 },
  { code: '254', state: 'Texas', city: 'Waco', lat: 31.5493, lon: -97.1467 },
  { code: '256', state: 'Alabama', city: 'Huntsville', lat: 34.7304, lon: -86.5861 },
  { code: '260', state: 'Indiana', city: 'Fort Wayne', lat: 41.0793, lon: -85.1394 },
  { code: '262', state: 'Wisconsin', city: 'Racine', lat: 42.7261, lon: -87.7829 },
  { code: '267', state: 'Pennsylvania', city: 'Philadelphia', lat: 39.9526, lon: -75.1652 },
  { code: '269', state: 'Michigan', city: 'Kalamazoo', lat: 42.2917, lon: -85.5872 },
  { code: '270', state: 'Kentucky', city: 'Bowling Green', lat: 36.9903, lon: -86.4436 },
  { code: '272', state: 'Pennsylvania', city: 'Scranton', lat: 41.4089, lon: -75.6624 },
  { code: '274', state: 'Wisconsin', city: 'La Crosse', lat: 43.8014, lon: -91.2396 },
  { code: '281', state: 'Texas', city: 'Houston', lat: 29.7604, lon: -95.3698 },
  { code: '301', state: 'Maryland', city: 'Bethesda', lat: 38.9807, lon: -77.1003 },
  { code: '302', state: 'Delaware', city: 'Wilmington', lat: 39.7447, lon: -75.5484 },
  { code: '303', state: 'Colorado', city: 'Denver', lat: 39.7392, lon: -104.9903 },
  { code: '304', state: 'West Virginia', city: 'Charleston', lat: 38.3498, lon: -81.6326 },
  { code: '305', state: 'Florida', city: 'Miami', lat: 25.7617, lon: -80.1918 },
  { code: '307', state: 'Wyoming', city: 'Cheyenne', lat: 41.140, lon: -104.8202 },
  { code: '308', state: 'Nebraska', city: 'North Platte', lat: 41.1403, lon: -100.7601 },
  { code: '309', state: 'Illinois', city: 'Peoria', lat: 40.6936, lon: -89.5889 },
  { code: '310', state: 'California', city: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { code: '312', state: 'Illinois', city: 'Chicago', lat: 41.8781, lon: -87.6298 },
  { code: '313', state: 'Michigan', city: 'Detroit', lat: 42.3314, lon: -83.0458 },
  { code: '314', state: 'Missouri', city: 'St. Louis', lat: 38.627, lon: -90.1994 },
  { code: '315', state: 'New York', city: 'Syracuse', lat: 43.0481, lon: -76.1474 },
  { code: '316', state: 'Kansas', city: 'Wichita', lat: 37.6872, lon: -97.3301 },
  { code: '317', state: 'Indiana', city: 'Indianapolis', lat: 39.7684, lon: -86.1581 },
  { code: '319', state: 'Iowa', city: 'Cedar Rapids', lat: 41.9779, lon: -91.6656 },
  { code: '320', state: 'Minnesota', city: 'St. Cloud', lat: 45.5579, lon: -94.1632 },
  { code: '321', state: 'Florida', city: 'Orlando', lat: 28.5383, lon: -81.3792 },
  { code: '323', state: 'California', city: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { code: '325', state: 'Texas', city: 'Abilene', lat: 32.4487, lon: -99.7331 },
  { code: '330', state: 'Ohio', city: 'Akron', lat: 41.0814, lon: -81.519 },
  { code: '331', state: 'Illinois', city: 'Aurora', lat: 41.7606, lon: -88.3201 },
  { code: '334', state: 'Alabama', city: 'Montgomery', lat: 32.3668, lon: -86.300 },
  { code: '336', state: 'North Carolina', city: 'Greensboro', lat: 36.0726, lon: -79.792 },
  { code: '337', state: 'Louisiana', city: 'Lafayette', lat: 30.2241, lon: -92.0198 },
  { code: '339', state: 'Massachusetts', city: 'Lynn', lat: 42.4668, lon: -70.9495 },
  { code: '340', state: 'U.S. Virgin Islands', city: 'Charlotte Amalie', lat: 18.3419, lon: -64.9307 },
  { code: '341', state: 'California', city: 'Oakland', lat: 37.8044, lon: -122.2711 },
  { code: '346', state: 'Texas', city: 'Houston', lat: 29.7604, lon: -95.3698 },
  { code: '347', state: 'New York', city: 'New York City', lat: 40.7128, lon: -74.006 },
  { code: '351', state: 'Massachusetts', city: 'Lowell', lat: 42.6334, lon: -71.3162 },
  { code: '352', state: 'Florida', city: 'Gainesville', lat: 29.6516, lon: -82.3248 },
  { code: '360', state: 'Washington', city: 'Olympia', lat: 47.0379, lon: -122.9007 },
  { code: '361', state: 'Texas', city: 'Corpus Christi', lat: 27.8006, lon: -97.3964 },
  { code: '364', state: 'Kentucky', city: 'Owensboro', lat: 37.7742, lon: -87.1133 },
  { code: '380', state: 'Ohio', city: 'Columbus', lat: 39.9612, lon: -82.9988 },
  { code: '385', state: 'Utah', city: 'Salt Lake City', lat: 40.7608, lon: -111.891 },
  { code: '386', state: 'Florida', city: 'Daytona Beach', lat: 29.2108, lon: -81.0228 },
  { code: '401', state: 'Rhode Island', city: 'Providence', lat: 41.824, lon: -71.4128 },
  { code: '402', state: 'Nebraska', city: 'Omaha', lat: 41.2565, lon: -95.9345 },
  { code: '404', state: 'Georgia', city: 'Atlanta', lat: 33.749, lon: -84.388 },
  { code: '405', state: 'Oklahoma', city: 'Oklahoma City', lat: 35.4676, lon: -97.5164 },
  { code: '406', state: 'Montana', city: 'Helena', lat: 46.5891, lon: -112.0391 },
  { code: '407', state: 'Florida', city: 'Orlando', lat: 28.5383, lon: -81.3792 },
  { code: '408', state: 'California', city: 'San Jose', lat: 37.3382, lon: -121.8863 },
  { code: '409', state: 'Texas', city: 'Galveston', lat: 29.3013, lon: -94.7977 },
  { code: '410', state: 'Maryland', city: 'Baltimore', lat: 39.2904, lon: -76.6122 },
  { code: '412', state: 'Pennsylvania', city: 'Pittsburgh', lat: 40.4406, lon: -79.9959 },
  { code: '413', state: 'Massachusetts', city: 'Springfield', lat: 42.1015, lon: -72.5898 },
  { code: '414', state: 'Wisconsin', city: 'Milwaukee', lat: 43.0389, lon: -87.9065 },
  { code: '415', state: 'California', city: 'San Francisco', lat: 37.7749, lon: -122.4194 },
  { code: '417', state: 'Missouri', city: 'Springfield', lat: 37.2089, lon: -93.2923 },
  { code: '419', state: 'Ohio', city: 'Toledo', lat: 41.6528, lon: -83.5379 },
  { code: '423', state: 'Tennessee', city: 'Chattanooga', lat: 35.0456, lon: -85.3097 },
  { code: '424', state: 'California', city: 'Long Beach', lat: 33.7701, lon: -118.1937 },
  { code: '425', state: 'Washington', city: 'Bellevue', lat: 47.6101, lon: -122.2015 },
  { code: '430', state: 'Texas', city: 'Tyler', lat: 32.3513, lon: -95.3011 },
  { code: '432', state: 'Texas', city: 'Midland', lat: 31.9974, lon: -102.0779 },
  { code: '434', state: 'Virginia', city: 'Charlottesville', lat: 38.0293, lon: -78.4767 },
  { code: '435', state: 'Utah', city: 'St. George', lat: 37.0965, lon: -113.5684 },
  { code: '440', state: 'Ohio', city: 'Lake County', lat: 41.6612, lon: -81.3899 },
  { code: '442', state: 'California', city: 'Escondido', lat: 33.1192, lon: -117.0864 },
  { code: '443', state: 'Maryland', city: 'Baltimore', lat: 39.2904, lon: -76.6122 },
  { code: '469', state: 'Texas', city: 'Dallas', lat: 32.7767, lon: -96.797 },
  { code: '470', state: 'Georgia', city: 'Atlanta', lat: 33.749, lon: -84.388 },
  { code: '475', state: 'Connecticut', city: 'Bridgeport', lat: 41.1792, lon: -73.1894 },
  { code: '478', state: 'Georgia', city: 'Macon', lat: 32.8407, lon: -83.6324 },
  { code: '479', state: 'Arkansas', city: 'Fayetteville', lat: 36.0822, lon: -94.1719 },
  { code: '480', state: 'Arizona', city: 'Mesa', lat: 33.4152, lon: -111.8315 },
  { code: '484', state: 'Pennsylvania', city: 'Allentown', lat: 40.6023, lon: -75.4714 },
  { code: '501', state: 'Arkansas', city: 'Little Rock', lat: 34.7465, lon: -92.2896 },
  { code: '502', state: 'Kentucky', city: 'Louisville', lat: 38.2527, lon: -85.7585 },
  { code: '503', state: 'Oregon', city: 'Portland', lat: 45.5152, lon: -122.6784 },
  { code: '504', state: 'Louisiana', city: 'New Orleans', lat: 29.9511, lon: -90.0715 },
  { code: '505', state: 'New Mexico', city: 'Albuquerque', lat: 35.0844, lon: -106.6504 },
  { code: '507', state: 'Minnesota', city: 'Rochester', lat: 44.0121, lon: -92.4802 },
  { code: '508', state: 'Massachusetts', city: 'Worcester', lat: 42.2626, lon: -71.8023 },
  { code: '509', state: 'Washington', city: 'Spokane', lat: 47.6588, lon: -117.426 },
  { code: '510', state: 'California', city: 'Oakland', lat: 37.8044, lon: -122.2711 },
  { code: '512', state: 'Texas', city: 'Austin', lat: 30.2672, lon: -97.7431 },
  { code: '513', state: 'Ohio', city: 'Cincinnati', lat: 39.1031, lon: -84.512 },
  { code: '515', state: 'Iowa', city: 'Des Moines', lat: 41.5868, lon: -93.625 },
  { code: '516', state: 'New York', city: 'Hempstead', lat: 40.7062, lon: -73.6187 },
  { code: '517', state: 'Michigan', city: 'Lansing', lat: 42.7325, lon: -84.5555 },
  { code: '518', state: 'New York', city: 'Albany', lat: 42.6526, lon: -73.7562 },
  { code: '520', state: 'Arizona', city: 'Tucson', lat: 32.2226, lon: -110.9747 },
  { code: '530', state: 'California', city: 'Redding', lat: 40.5865, lon: -122.3917 },
  { code: '534', state: 'Wisconsin', city: 'Eau Claire', lat: 44.8113, lon: -91.4985 },
  { code: '539', state: 'Oklahoma', city: 'Tulsa', lat: 36.1539, lon: -95.9928 },
  { code: '540', state: 'Virginia', city: 'Roanoke', lat: 37.2707, lon: -79.9414 },
  { code: '541', state: 'Oregon', city: 'Eugene', lat: 44.0521, lon: -123.0868 },
  { code: '551', state: 'New Jersey', city: 'Jersey City', lat: 40.7282, lon: -74.0776 },
  { code: '557', state: 'Missouri', city: 'St. Louis', lat: 38.627, lon: -90.1994 },
  { code: '559', state: 'California', city: 'Fresno', lat: 36.7378, lon: -119.7871 },
  { code: '561', state: 'Florida', city: 'Palm Beach', lat: 26.7056, lon: -80.0364 },
  { code: '562', state: 'California', city: 'Long Beach', lat: 33.7701, lon: -118.1937 },
  { code: '563', state: 'Iowa', city: 'Davenport', lat: 41.5236, lon: -90.5776 },
  { code: '567', state: 'Ohio', city: 'Toledo', lat: 41.6528, lon: -83.5379 },
  { code: '570', state: 'Pennsylvania', city: 'Wilkes-Barre', lat: 41.2459, lon: -75.8813 },
  { code: '571', state: 'Virginia', city: 'Arlington', lat: 38.8816, lon: -77.091 },
  { code: '573', state: 'Missouri', city: 'Jefferson City', lat: 38.5767, lon: -92.1735 },
  { code: '574', state: 'Indiana', city: 'South Bend', lat: 41.6764, lon: -86.252 },
  { code: '575', state: 'New Mexico', city: 'Las Cruces', lat: 32.3199, lon: -106.7637 },
  { code: '580', state: 'Oklahoma', city: 'Lawton', lat: 34.6036, lon: -98.3959 },
  { code: '585', state: 'New York', city: 'Rochester', lat: 43.1566, lon: -77.6088 },
  { code: '586', state: 'Michigan', city: 'Warren', lat: 42.5145, lon: -83.0147 },
  { code: '601', state: 'Mississippi', city: 'Jackson', lat: 32.2988, lon: -90.1848 },
  { code: '602', state: 'Arizona', city: 'Phoenix', lat: 33.4484, lon: -112.074 },
  { code: '603', state: 'New Hampshire', city: 'Manchester', lat: 42.9956, lon: -71.4548 },
  { code: '605', state: 'South Dakota', city: 'Sioux Falls', lat: 43.5446, lon: -96.7311 },
  { code: '606', state: 'Kentucky', city: 'Ashland', lat: 38.4784, lon: -82.6379 },
  { code: '607', state: 'New York', city: 'Binghamton', lat: 42.0987, lon: -75.9179 },
  { code: '608', state: 'Wisconsin', city: 'Madison', lat: 43.0731, lon: -89.4012 },
  { code: '609', state: 'New Jersey', city: 'Trenton', lat: 40.2171, lon: -74.7429 },
  { code: '610', state: 'Pennsylvania', city: 'Reading', lat: 40.3356, lon: -75.9269 },
  { code: '612', state: 'Minnesota', city: 'Minneapolis', lat: 44.9778, lon: -93.265 },
  { code: '614', state: 'Ohio', city: 'Columbus', lat: 39.9612, lon: -82.9988 },
  { code: '615', state: 'Tennessee', city: 'Nashville', lat: 36.1627, lon: -86.7816 },
  { code: '616', state: 'Michigan', city: 'Grand Rapids', lat: 42.9634, lon: -85.6681 },
  { code: '617', state: 'Massachusetts', city: 'Boston', lat: 42.3601, lon: -71.0589 },
  { code: '618', state: 'Illinois', city: 'Belleville', lat: 38.5201, lon: -89.9839 },
  { code: '619', state: 'California', city: 'San Diego', lat: 32.7157, lon: -117.1611 },
  { code: '620', state: 'Kansas', city: 'Hutchinson', lat: 38.0608, lon: -97.9298 },
  { code: '623', state: 'Arizona', city: 'Glendale', lat: 33.5387, lon: -112.186 },
  { code: '626', state: 'California', city: 'Pasadena', lat: 34.1478, lon: -118.1445 },
  { code: '628', state: 'California', city: 'San Rafael', lat: 37.9735, lon: -122.5311 },
  { code: '629', state: 'Tennessee', city: 'Nashville', lat: 36.1627, lon: -86.7816 },
  { code: '630', state: 'Illinois', city: 'Naperville', lat: 41.7508, lon: -88.1535 },
  { code: '631', state: 'New York', city: 'Islip', lat: 40.729, lon: -73.2104 },
  { code: '636', state: 'Missouri', city: 'St. Charles', lat: 38.7881, lon: -90.4974 },
  { code: '641', state: 'Iowa', city: 'Mason City', lat: 43.1536, lon: -93.201 },
  { code: '646', state: 'New York', city: 'New York City', lat: 40.7128, lon: -74.006 },
  { code: '650', state: 'California', city: 'Palo Alto', lat: 37.4419, lon: -122.143 },
  { code: '651', state: 'Minnesota', city: 'St. Paul', lat: 44.9537, lon: -93.090 },
  { code: '657', state: 'California', city: 'Anaheim', lat: 33.8366, lon: -117.9143 },
  { code: '659', state: 'Alabama', city: 'Birmingham', lat: 33.5186, lon: -86.8104 },
  { code: '660', state: 'Missouri', city: 'Sedalia', lat: 38.7045, lon: -93.2283 },
  { code: '661', state: 'California', city: 'Bakersfield', lat: 35.3733, lon: -119.0187 },
  { code: '662', state: 'Mississippi', city: 'Tupelo', lat: 34.2576, lon: -88.7034 },
  { code: '667', state: 'Maryland', city: 'Baltimore', lat: 39.2904, lon: -76.6122 },
  { code: '678', state: 'Georgia', city: 'Atlanta', lat: 33.749, lon: -84.388 },
  { code: '681', state: 'West Virginia', city: 'Charleston', lat: 38.3498, lon: -81.6326 },
  { code: '682', state: 'Texas', city: 'Fort Worth', lat: 32.7555, lon: -97.3308 },
  { code: '689', state: 'Florida', city: 'Orlando', lat: 28.5383, lon: -81.3792 },
  { code: '701', state: 'North Dakota', city: 'Bismarck', lat: 46.8083, lon: -100.7837 },
  { code: '702', state: 'Nevada', city: 'Las Vegas', lat: 36.1699, lon: -115.1398 },
  { code: '703', state: 'Virginia', city: 'Alexandria', lat: 38.8048, lon: -77.0469 },
  { code: '704', state: 'North Carolina', city: 'Charlotte', lat: 35.2271, lon: -80.8431 },
  { code: '706', state: 'Georgia', city: 'Augusta', lat: 33.4735, lon: -82.0105 },
  { code: '707', state: 'California', city: 'Santa Rosa', lat: 38.4405, lon: -122.7144 },
  { code: '708', state: 'Illinois', city: 'Oak Lawn', lat: 41.71998, lon: -87.74795 },
  { code: '712', state: 'Iowa', city: 'Sioux City', lat: 42.4967, lon: -96.4059 },
  { code: '713', state: 'Texas', city: 'Houston', lat: 29.7604, lon: -95.3698 },
  { code: '714', state: 'California', city: 'Orange', lat: 33.7879, lon: -117.8531 },
  { code: '715', state: 'Wisconsin', city: 'Wausau', lat: 44.9591, lon: -89.6301 },
  { code: '716', state: 'New York', city: 'Buffalo', lat: 42.8864, lon: -78.8784 },
  { code: '717', state: 'Pennsylvania', city: 'Harrisburg', lat: 40.2732, lon: -76.8867 },
  { code: '718', state: 'New York', city: 'New York City', lat: 40.7128, lon: -74.006 },
  { code: '719', state: 'Colorado', city: 'Colorado Springs', lat: 38.8339, lon: -104.8214 },
  { code: '720', state: 'Colorado', city: 'Denver', lat: 39.7392, lon: -104.9903 },
  { code: '724', state: 'Pennsylvania', city: 'Greensburg', lat: 40.3015, lon: -79.5389 },
  { code: '725', state: 'Nevada', city: 'Las Vegas', lat: 36.1699, lon: -115.1398 },
  { code: '727', state: 'Florida', city: 'Clearwater', lat: 27.9659, lon: -82.8001 },
  { code: '731', state: 'Tennessee', city: 'Jackson', lat: 35.6145, lon: -88.8139 },
  { code: '732', state: 'New Jersey', city: 'New Brunswick', lat: 40.4862, lon: -74.4518 },
  { code: '734', state: 'Michigan', city: 'Ann Arbor', lat: 42.2808, lon: -83.743 },
  { code: '737', state: 'Texas', city: 'Austin', lat: 30.2672, lon: -97.7431 },
  { code: '740', state: 'Ohio', city: 'Lancaster', lat: 39.7137, lon: -82.5993 },
  { code: '747', state: 'California', city: 'San Fernando', lat: 34.2819, lon: -118.4389 },
  { code: '754', state: 'Florida', city: 'Fort Lauderdale', lat: 26.1224, lon: -80.1373 },
  { code: '757', state: 'Virginia', city: 'Norfolk', lat: 36.8508, lon: -76.2859 },
  { code: '760', state: 'California', city: 'Oceanside', lat: 33.1959, lon: -117.3795 },
  { code: '762', state: 'Georgia', city: 'Columbus', lat: 32.4609, lon: -84.9877 },
  { code: '763', state: 'Minnesota', city: 'Maple Grove', lat: 45.0725, lon: -93.4558 },
  { code: '765', state: 'Indiana', city: 'Lafayette', lat: 40.4167, lon: -86.8753 },
  { code: '769', state: 'Mississippi', city: 'Jackson', lat: 32.2988, lon: -90.1848 },
  { code: '770', state: 'Georgia', city: 'Marietta', lat: 33.9526, lon: -84.5499 },
  { code: '772', state: 'Florida', city: 'Port St. Lucie', lat: 27.273, lon: -80.3582 },
  { code: '773', state: 'Illinois', city: 'Chicago', lat: 41.8781, lon: -87.6298 },
  { code: '774', state: 'Massachusetts', city: 'Worcester', lat: 42.2626, lon: -71.8023 },
  { code: '775', state: 'Nevada', city: 'Reno', lat: 39.5296, lon: -119.8138 },
  { code: '779', state: 'Illinois', city: 'Rockford', lat: 42.2711, lon: -89.0937 },
  { code: '781', state: 'Massachusetts', city: 'Quincy', lat: 42.2529, lon: -71.0023 },
  { code: '785', state: 'Kansas', city: 'Topeka', lat: 39.0473, lon: -95.6752 },
  { code: '786', state: 'Florida', city: 'Miami', lat: 25.7617, lon: -80.1918 },
  { code: '801', state: 'Utah', city: 'Salt Lake City', lat: 40.7608, lon: -111.891 },
  { code: '803', state: 'South Carolina', city: 'Columbia', lat: 34.0007, lon: -81.0348 },
  { code: '804', state: 'Virginia', city: 'Richmond', lat: 37.5407, lon: -77.436 },
  { code: '805', state: 'California', city: 'Santa Barbara', lat: 34.4208, lon: -119.6982 },
  { code: '806', state: 'Texas', city: 'Amarillo', lat: 35.2219, lon: -101.8313 },
  { code: '808', state: 'Hawaii', city: 'Honolulu', lat: 21.3099, lon: -157.8581 },
  { code: '810', state: 'Michigan', city: 'Flint', lat: 43.0125, lon: -83.6875 },
  { code: '812', state: 'Indiana', city: 'Evansville', lat: 37.9716, lon: -87.5711 },
  { code: '813', state: 'Florida', city: 'Tampa', lat: 27.9506, lon: -82.4572 },
  { code: '814', state: 'Pennsylvania', city: 'Erie', lat: 42.1292, lon: -80.0851 },
  { code: '815', state: 'Illinois', city: 'Joliet', lat: 41.525, lon: -88.0817 },
  { code: '816', state: 'Missouri', city: 'Kansas City', lat: 39.0997, lon: -94.5786 },
  { code: '817', state: 'Texas', city: 'Fort Worth', lat: 32.7555, lon: -97.3308 },
  { code: '818', state: 'California', city: 'Burbank', lat: 34.1808, lon: -118.3089 },
  { code: '828', state: 'North Carolina', city: 'Asheville', lat: 35.5951, lon: -82.5515 },
  { code: '830', state: 'Texas', city: 'New Braunfels', lat: 29.703, lon: -98.1245 },
  { code: '831', state: 'California', city: 'Salinas', lat: 36.6777, lon: -121.6555 },
  { code: '832', state: 'Texas', city: 'Houston', lat: 29.7604, lon: -95.3698 },
  { code: '843', state: 'South Carolina', city: 'Charleston', lat: 32.7765, lon: -79.9311 },
  { code: '845', state: 'New York', city: 'Poughkeepsie', lat: 41.7004, lon: -73.9209 },
  { code: '847', state: 'Illinois', city: 'Evanston', lat: 42.0451, lon: -87.6877 },
  { code: '848', state: 'New Jersey', city: 'New Brunswick', lat: 40.4862, lon: -74.4518 },
  { code: '850', state: 'Florida', city: 'Pensacola', lat: 30.4213, lon: -87.2169 },
  { code: '854', state: 'South Carolina', city: 'Charleston', lat: 32.7765, lon: -79.9311 },
  { code: '856', state: 'New Jersey', city: 'Camden', lat: 39.9259, lon: -75.1196 },
  { code: '857', state: 'Massachusetts', city: 'Boston', lat: 42.3601, lon: -71.0589 },
  { code: '858', state: 'California', city: 'San Diego', lat: 32.7157, lon: -117.1611 },
  { code: '859', state: 'Kentucky', city: 'Lexington', lat: 38.0406, lon: -84.5037 },
  { code: '860', state: 'Connecticut', city: 'Hartford', lat: 41.7658, lon: -72.6734 },
  { code: '862', state: 'New Jersey', city: 'Newark', lat: 40.7357, lon: -74.1724 },
  { code: '863', state: 'Florida', city: 'Lakeland', lat: 28.0395, lon: -81.9498 },
  { code: '864', state: 'South Carolina', city: 'Greenville', lat: 34.8526, lon: -82.394 },
  { code: '865', state: 'Tennessee', city: 'Knoxville', lat: 35.9606, lon: -83.9207 },
  { code: '870', state: 'Arkansas', city: 'Jonesboro', lat: 35.8423, lon: -90.7043 },
  { code: '878', state: 'Pennsylvania', city: 'Pittsburgh', lat: 40.4406, lon: -79.9959 },
  { code: '901', state: 'Tennessee', city: 'Memphis', lat: 35.1495, lon: -90.049 },
  { code: '903', state: 'Texas', city: 'Tyler', lat: 32.3513, lon: -95.3011 },
  { code: '904', state: 'Florida', city: 'Jacksonville', lat: 30.3322, lon: -81.6557 },
  { code: '906', state: 'Michigan', city: 'Marquette', lat: 46.5436, lon: -87.3954 },
  { code: '907', state: 'Alaska', city: 'Anchorage', lat: 61.2181, lon: -149.9003 },
  { code: '908', state: 'New Jersey', city: 'Elizabeth', lat: 40.6639, lon: -74.2107 },
  { code: '909', state: 'California', city: 'San Bernardino', lat: 34.1083, lon: -117.2898 },
  { code: '910', state: 'North Carolina', city: 'Fayetteville', lat: 35.0527, lon: -78.8784 },
  { code: '912', state: 'Georgia', city: 'Savannah', lat: 32.0809, lon: -81.0912 },
  { code: '913', state: 'Kansas', city: 'Overland Park', lat: 38.9822, lon: -94.6708 },
  { code: '914', state: 'New York', city: 'Yonkers', lat: 40.9312, lon: -73.8988 },
  { code: '915', state: 'Texas', city: 'El Paso', lat: 31.7619, lon: -106.485 },
  { code: '916', state: 'California', city: 'Sacramento', lat: 38.5816, lon: -121.4944 },
  { code: '917', state: 'New York', city: 'New York City', lat: 40.7128, lon: -74.006 },
  { code: '918', state: 'Oklahoma', city: 'Tulsa', lat: 36.1539, lon: -95.9928 },
  { code: '919', state: 'North Carolina', city: 'Raleigh', lat: 35.7796, lon: -78.6382 },
  { code: '920', state: 'Wisconsin', city: 'Green Bay', lat: 44.5133, lon: -88.0133 },
  { code: '925', state: 'California', city: 'Concord', lat: 37.9779, lon: -122.0311 },
  { code: '927', state: 'Florida', city: 'Orlando', lat: 28.5383, lon: -81.3792 },
  { code: '928', state: 'Arizona', city: 'Flagstaff', lat: 35.1983, lon: -111.6513 },
  { code: '929', state: 'New York', city: 'New York City', lat: 40.7128, lon: -74.006 },
  { code: '930', state: 'Indiana', city: 'Bloomington', lat: 39.1653, lon: -86.5264 },
  { code: '931', state: 'Tennessee', city: 'Clarksville', lat: 36.5298, lon: -87.3595 },
  { code: '934', state: 'New York', city: 'Suffolk County', lat: 40.9849, lon: -72.6151 },
  { code: '936', state: 'Texas', city: 'Conroe', lat: 30.3119, lon: -95.4561 },
  { code: '937', state: 'Ohio', city: 'Dayton', lat: 39.7589, lon: -84.1916 },
  { code: '938', state: 'Alabama', city: 'Huntsville', lat: 34.7304, lon: -86.5861 },
  { code: '940', state: 'Texas', city: 'Denton', lat: 33.2148, lon: -97.1331 },
  { code: '941', state: 'Florida', city: 'Sarasota', lat: 27.3364, lon: -82.5307 },
  { code: '947', state: 'Michigan', city: 'Southfield', lat: 42.4734, lon: -83.2219 },
  { code: '949', state: 'California', city: 'Irvine', lat: 33.6846, lon: -117.8265 },
  { code: '951', state: 'California', city: 'Riverside', lat: 33.9806, lon: -117.3755 },
  { code: '952', state: 'Minnesota', city: 'Bloomington', lat: 44.8408, lon: -93.2983 },
  { code: '954', state: 'Florida', city: 'Hollywood', lat: 26.0112, lon: -80.1495 },
  { code: '956', state: 'Texas', city: 'Brownsville', lat: 25.9017, lon: -97.4975 },
  { code: '959', state: 'Connecticut', city: 'Hartford', lat: 41.7658, lon: -72.6734 },
  { code: '970', state: 'Colorado', city: 'Fort Collins', lat: 40.5853, lon: -105.0844 },
  { code: '971', state: 'Oregon', city: 'Portland', lat: 45.5152, lon: -122.6784 },
  { code: '972', state: 'Texas', city: 'Plano', lat: 33.0198, lon: -96.6989 },
  { code: '973', state: 'New Jersey', city: 'Paterson', lat: 40.9168, lon: -74.1718 },
  { code: '975', state: 'Missouri', city: 'Columbia', lat: 38.9517, lon: -92.3341 },
  { code: '978', state: 'Massachusetts', city: 'Lowell', lat: 42.6334, lon: -71.3162 },
  { code: '979', state: 'Texas', city: 'College Station', lat: 30.6279, lon: -96.3344 },
  { code: '980', state: 'North Carolina', city: 'Charlotte', lat: 35.2271, lon: -80.8431 },
  { code: '984', state: 'North Carolina', city: 'Raleigh', lat: 35.7796, lon: -78.6382 },
  { code: '985', state: 'Louisiana', city: 'Houma', lat: 29.5958, lon: -90.7195 },
  { code: '986', state: 'Idaho', city: 'Boise', lat: 43.615, lon: -116.2023 },
  { code: '989', state: 'Michigan', city: 'Saginaw', lat: 43.4195, lon: -83.9508 },
];


const AREA_CODE_LOOKUP = AREA_CODE_DATA.reduce((map, entry) => {
  map[entry.code] = entry;
  return map;
}, {});

const WEATHER_IMPACT = {
  Tailwind: 0.9,
  Clear: 1,
  Clouds: 1.05,
  Drizzle: 1.1,
  Rain: 1.2,
  Storm: 1.4,
  Snow: 1.3,
  Unavailable: 1,
};

const BADGE_RULES = [
  { id: 'first-flight', label: 'First Flight', test: (s) => s.messages.length >= 1 },
  { id: 'weather-warrior', label: 'Weather Warrior', test: (s) => s.messages.some((m) => /Storm|Snow/.test(m.weatherImpact)) },
  { id: 'marathon', label: 'Marathon Flyer', test: (s) => s.mileage >= 50 },
];

const deepClone = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const DEFAULT_STATE = {
  pigeon: {
    name: 'Sky Courier',
    color: 'silver',
    accessory: 'Tamagotchi Buddy Pack',
    level: 1,
    xp: 0,
  },
  mileage: 0,
  badges: [],
  messages: [],
  lastMessageDate: null,
  weather: {
    from: { areaCode: '', summary: 'Waiting for forecast…', location: '' },
    to: { areaCode: '', summary: 'Waiting for forecast…', location: '' },
    impact: 'Check both area codes to see the impact.',
    modifier: 1,
  },
  etaMinutes: 0,
  mood: 'curious',
};

let state = loadState();
const root = document.documentElement;

// DOM lookups
const levelEl = document.getElementById('pigeonLevel');
const xpTextEl = document.getElementById('xpText');
const xpBarEl = document.getElementById('xpBar');
const badgeListEl = document.getElementById('badgeList');
const milesEl = document.getElementById('milesFlown');
const timelineEl = document.getElementById('flightTimeline');
const weatherSummaryEl = document.getElementById('weatherSummary');
const weatherImpactEl = document.getElementById('weatherImpact');
const pigeonNameInput = document.getElementById('pigeonName');
const pigeonColorInput = document.getElementById('pigeonColor');
const pigeonAccessoryLabel = document.getElementById('pigeonAccessoryLabel');
const dailyStatusEl = document.getElementById('dailyStatus');
const checkWeatherBtn = document.getElementById('checkWeather');
const form = document.getElementById('messageForm');
const purposeSelect = document.getElementById('purpose');
const messageInput = document.getElementById('message');
const chatWindow = document.getElementById('chatWindow');
const historyListEl = document.getElementById('historyList');
const etaTextEl = document.getElementById('etaText');
const tabButtons = document.querySelectorAll('[data-screen-button]');
const screens = document.querySelectorAll('[data-screen]');
const fromPhoneInput = document.getElementById('fromPhone');
const toPhoneInput = document.getElementById('toPhone');
const fromRegionEl = document.getElementById('fromRegion');
const toRegionEl = document.getElementById('toRegion');
const editCoopBtn = document.getElementById('editCoop');
const petBtn = document.getElementById('petPigeon');
const feedBtn = document.getElementById('feedPigeon');
const moodEl = document.getElementById('pigeonMood');
const dailyResetBtn = document.getElementById('dailyReset');

// map elements
const mapSvg = document.getElementById('flightMap');
const mapGrid = document.getElementById('mapGrid');
const usOutline = document.getElementById('usOutline');
const fromMarker = document.getElementById('fromMarker');
const toMarker = document.getElementById('toMarker');
const flightPath = document.getElementById('flightPath');
const flightSprite = document.getElementById('flightSprite');
const fromLabel = document.getElementById('fromLabel');
const toLabel = document.getElementById('toLabel');

let deliveryTimer;

function loadState() {
  const cached = localStorage.getItem('pigeon-msg-state');
  if (!cached) return deepClone(DEFAULT_STATE);
  try {
    const parsed = JSON.parse(cached);
    return {
      ...deepClone(DEFAULT_STATE),
      ...parsed,
      weather: {
        ...deepClone(DEFAULT_STATE.weather),
        ...parsed.weather,
        from: { ...deepClone(DEFAULT_STATE.weather.from), ...(parsed.weather?.from || {}) },
        to: { ...deepClone(DEFAULT_STATE.weather.to), ...(parsed.weather?.to || {}) },
      },
    };
  } catch (err) {
    return deepClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem('pigeon-msg-state', JSON.stringify(state));
}

function alreadySentToday() {
  const today = new Date().toDateString();
  return state.lastMessageDate === today;
}

function renderStats() {
  levelEl.textContent = state.pigeon.level;
  const nextLevelTarget = state.pigeon.level * 20;
  xpTextEl.textContent = `${state.pigeon.xp} / ${nextLevelTarget} XP`;
  const percent = Math.min(100, Math.round((state.pigeon.xp / nextLevelTarget) * 100));
  xpBarEl.style.width = `${percent}%`;
  milesEl.textContent = state.mileage.toFixed(1);

  const colorFilters = {
    silver: 'brightness(1)',
    gold: 'sepia(0.35) saturate(1.6) hue-rotate(-20deg)',
    indigo: 'hue-rotate(200deg) saturate(1.4)',
    rose: 'hue-rotate(320deg) saturate(1.3)',
  };
  const baseShadow = 'drop-shadow(0 6px 0 #0b0f1a)';
  const colorFilter = colorFilters[state.pigeon.color] || 'brightness(1)';
  root.style.setProperty('--pigeon-filter', `${colorFilter} ${baseShadow}`);
  pigeonAccessoryLabel.textContent = state.pigeon.accessory;
  pigeonNameInput.value = state.pigeon.name;
  pigeonColorInput.value = state.pigeon.color;
  moodEl.textContent = `Your pigeon looks ${state.mood}.`;
}

function renderBadges() {
  badgeListEl.innerHTML = '';
  if (!state.badges.length) {
    const empty = document.createElement('span');
    empty.className = 'tiny';
    empty.textContent = 'No badges yet.';
    badgeListEl.appendChild(empty);
    return;
  }

  state.badges.forEach((badge) => {
    const tag = document.createElement('span');
    tag.className = 'badge-tag badge-earned';
    tag.textContent = badge;
    badgeListEl.appendChild(tag);
  });
}

function renderTimeline() {
  timelineEl.innerHTML = '';
  const sorted = [...state.messages].sort((a, b) => b.sentAt - a.sentAt).slice(0, 5);
  if (!sorted.length) {
    const empty = document.createElement('div');
    empty.className = 'timeline-item';
    empty.textContent = 'No flights yet. Your pigeon is stretching its wings.';
    timelineEl.appendChild(empty);
    return;
  }

  sorted.forEach((msg) => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    const etaCopy = msg.status === 'delivered' ? 'Delivered' : `In flight: ETA ${msg.etaMinutes}m`;
    item.innerHTML = `<strong>${msg.from} → ${msg.to}</strong><br>${msg.text}<br><em>${etaCopy} | ${msg.weatherImpact}</em>`;
    timelineEl.appendChild(item);
  });
}

function renderWeather() {
  weatherSummaryEl.textContent = `${state.weather.from.summary} | ${state.weather.to.summary}`;
  weatherImpactEl.textContent = state.weather.impact;
  etaTextEl.textContent = state.etaMinutes
    ? `Estimated delivery: ${state.etaMinutes} minutes.`
    : 'ETA will appear after weather check (1–5 minutes).';

  fromRegionEl.textContent = state.weather.from.location || 'Waiting for area code…';
  toRegionEl.textContent = state.weather.to.location || 'Waiting for area code…';
  toggleWeatherButton();
}

function renderChat() {
  chatWindow.innerHTML = '';
  const sorted = [...state.messages].sort((a, b) => a.sentAt - b.sentAt);
  if (!sorted.length) {
    const empty = document.createElement('div');
    empty.className = 'chat-bubble';
    empty.textContent = 'No chats yet. Customize your pigeon then send a daily note!';
    chatWindow.appendChild(empty);
    return;
  }

  sorted.forEach((msg) => {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    const etaCopy = msg.status === 'delivered'
      ? 'Delivered'
      : `ETA ${Math.max(0, Math.ceil((msg.deliverAt - Date.now()) / 60000))}m`;
    bubble.innerHTML = `
      <div class="route">${msg.from} → ${msg.to}</div>
      <div>${msg.text}</div>
      <div class="meta"><span>${msg.purpose}</span><span>${etaCopy}</span></div>
    `;
    chatWindow.appendChild(bubble);
  });
}

function renderHistory() {
  historyListEl.innerHTML = '';
  const sorted = [...state.messages].sort((a, b) => b.sentAt - a.sentAt);
  if (!sorted.length) {
    const empty = document.createElement('div');
    empty.className = 'history-card';
    empty.textContent = 'No history yet. Your coop will remember each flight here.';
    historyListEl.appendChild(empty);
    return;
  }

  sorted.forEach((msg) => {
    const card = document.createElement('div');
    card.className = 'history-card';
    const date = new Date(msg.sentAt).toLocaleString();
    const etaCopy = msg.status === 'delivered' ? 'Delivered' : `In flight (${msg.etaMinutes}m)`;
    const arrival = msg.deliverAt ? new Date(msg.deliverAt).toLocaleTimeString() : 'Pending';
    card.innerHTML = `
      <p class="route">${msg.from} → ${msg.to}</p>
      <p>${msg.text}</p>
      <div class="meta"><span>${msg.purpose}</span><span>${etaCopy}</span></div>
      <div class="meta"><span>Sent: ${date}</span><span>Arrives: ${arrival}</span></div>
      <div class="meta"><span>${msg.weatherImpact}</span><span>Miles: ${msg.miles.toFixed(1)}</span></div>
    `;
    historyListEl.appendChild(card);
  });
}

function renderEverything() {
  renderStats();
  renderBadges();
  renderTimeline();
  renderWeather();
  renderChat();
  renderHistory();
  refreshMap();
}

function checkBadges() {
  const newlyEarned = BADGE_RULES.filter((rule) => rule.test(state) && !state.badges.includes(rule.label))
    .map((rule) => rule.label);
  if (newlyEarned.length) {
    state.badges.push(...newlyEarned);
  }
}

function gainXp(amount) {
  state.pigeon.xp += amount;
  const target = state.pigeon.level * 20;
  if (state.pigeon.xp >= target) {
    state.pigeon.level += 1;
    state.pigeon.xp = state.pigeon.xp - target;
    state.pigeon.accessory = pickNewAccessory(state.pigeon.level);
  }
}

function pickNewAccessory(level) {
  if (level >= 5) return 'Royal Cloak';
  if (level >= 3) return 'Storm Runner Scarf';
  return 'Scout Satchel';
}

function formatPhone(raw) {
  const digits = (raw || '').replace(/\D/g, '').slice(-10);
  if (!digits) return '';
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function parseAreaCode(raw) {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length < 3) return '';
  return digits.slice(0, 3);
}

function handleSend(event) {
  event.preventDefault();
  if (alreadySentToday()) {
    dailyStatusEl.textContent = 'You already sent today. Come back tomorrow!';
    return;
  }

  const fromAreaCode = parseAreaCode(fromPhoneInput.value);
  const toAreaCode = parseAreaCode(toPhoneInput.value);
  const fromEntry = AREA_CODE_LOOKUP[fromAreaCode];
  const toEntry = AREA_CODE_LOOKUP[toAreaCode];
  if (!fromEntry || !toEntry) {
    dailyStatusEl.textContent = 'Use valid US area codes so the pigeon can chart a course.';
    return;
  }

  const msg = {
    id: crypto.randomUUID?.() || `msg-${Math.random().toString(16).slice(2)}`,
    from: formatPhone(fromPhoneInput.value),
    to: formatPhone(toPhoneInput.value),
    fromAreaCode,
    toAreaCode,
    text: messageInput.value.trim(),
    purpose: purposeSelect.value,
    status: 'in-flight',
    sentAt: Date.now(),
    etaMinutes: state.etaMinutes || calculateEtaMinutes(),
    deliverAt: Date.now() + (state.etaMinutes || 1) * 60 * 1000,
    weatherImpact: state.weather.impact,
    miles: calculateMiles(fromEntry, toEntry),
  };

  if (!msg.text) {
    dailyStatusEl.textContent = 'Please fill out every field so your pigeon knows where to go!';
    return;
  }

  state.lastMessageDate = new Date().toDateString();
  dailyStatusEl.textContent = 'Pigeon launched! Tracking delivery time…';

  state.weather.from.areaCode = fromAreaCode;
  state.weather.to.areaCode = toAreaCode;

  state.messages.push(msg);
  state.mileage += msg.miles;
  gainXp(10);
  checkBadges();
  saveState();
  renderEverything();
  triggerFlightAnimation(fromEntry, toEntry);

  scheduleDeliveryCheck();

  form.reset();
  state.etaMinutes = 0;
  etaTextEl.textContent = 'ETA will appear after weather check (1–5 minutes).';
  state.weather.impact = 'Check both area codes to see the impact.';
  state.weather.from.summary = 'Waiting for forecast…';
  state.weather.to.summary = 'Waiting for forecast…';
  state.weather.from.location = '';
  state.weather.to.location = '';
  toggleWeatherButton();
}

function calculateEtaMinutes(modifier = state.weather.modifier || 1) {
  const baseMinutes = 1 + Math.random() * 4;
  const adjusted = Math.min(5, Math.max(1, Math.round(baseMinutes * modifier)));
  state.etaMinutes = adjusted;
  return adjusted;
}

async function handleWeatherCheck() {
  const fromArea = parseAreaCode(fromPhoneInput.value);
  const toArea = parseAreaCode(toPhoneInput.value);
  const fromEntry = AREA_CODE_LOOKUP[fromArea];
  const toEntry = AREA_CODE_LOOKUP[toArea];

  if (!fromEntry || !toEntry) {
    weatherImpactEl.textContent = 'Add both US area codes to check the route.';
    return;
  }

  weatherImpactEl.textContent = 'Checking skies…';
  state.weather.from.areaCode = fromArea;
  state.weather.to.areaCode = toArea;
  state.weather.from.location = `${fromEntry.city}, ${fromEntry.state}`;
  state.weather.to.location = `${toEntry.city}, ${toEntry.state}`;

  const [fromForecast, toForecast] = await Promise.all([
    fetchWeatherSummary(fromEntry),
    fetchWeatherSummary(toEntry),
  ]);

  const fromImpact = pickImpactLabel(fromForecast);
  const toImpact = pickImpactLabel(toForecast);
  const modifier = (WEATHER_IMPACT[fromImpact] + WEATHER_IMPACT[toImpact]) / 2;

  state.weather.from.summary = `${fromImpact} at sender`;
  state.weather.to.summary = `${toImpact} at recipient`;
  state.weather.impact = `${fromImpact} → ${toImpact} conditions influence the ETA.`;
  state.weather.modifier = modifier;
  state.etaMinutes = calculateEtaMinutes(modifier);

  saveState();
  renderWeather();
}

async function fetchWeatherSummary(area) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${area.lat}&longitude=${area.lon}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Bad response');
    const data = await res.json();
    return mapWeatherCode(data.current_weather?.weathercode);
  } catch (err) {
    weatherImpactEl.textContent = 'Weather check failed. Try again soon.';
    return 'Unavailable';
  }
}

function mapWeatherCode(code) {
  if (code === undefined || code === null) return 'Unavailable';
  if ([95, 96, 99].includes(code)) return 'Storm';
  if ([80, 81, 82, 51, 53, 55, 56, 57].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([45, 48, 1, 2, 3].includes(code)) return 'Clouds';
  if (code === 0) return 'Clear';
  return 'Clear';
}

function pickImpactLabel(description) {
  if (/thunder|storm/i.test(description)) return 'Storm';
  if (/snow|sleet/i.test(description)) return 'Snow';
  if (/rain|drizzle/i.test(description)) return 'Rain';
  if (/cloud/i.test(description)) return 'Clouds';
  if (/wind/i.test(description)) return 'Tailwind';
  return 'Clear';
}

function handleNameChange(event) {
  state.pigeon.name = event.target.value || 'Sky Courier';
  saveState();
}

function handleColorChange(event) {
  state.pigeon.color = event.target.value;
  saveState();
  renderStats();
}

function toggleWeatherButton() {
  const hasCodes = Boolean(parseAreaCode(toPhoneInput.value) && parseAreaCode(fromPhoneInput.value));
  checkWeatherBtn.classList.toggle('hidden', !hasCodes);
}

function switchScreen(target) {
  screens.forEach((section) => {
    const isMatch = section.dataset.screen === target;
    section.toggleAttribute('hidden', !isMatch && section.hasAttribute('data-screen'));
  });
  tabButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.screenButton === target));
}

function triggerFlightAnimation(fromEntry, toEntry) {
  const start = projectToMap(fromEntry || { lat: 39, lon: -95 });
  const end = projectToMap(toEntry || { lat: 39, lon: -95 });
  const path = `M ${start.x} ${start.y} Q ${(start.x + end.x) / 2} ${Math.min(start.y, end.y) - 40} ${end.x} ${end.y}`;
  flightPath.setAttribute('d', path);

  fromMarker.setAttribute('cx', start.x);
  fromMarker.setAttribute('cy', start.y);
  toMarker.setAttribute('cx', end.x);
  toMarker.setAttribute('cy', end.y);
  fromLabel.setAttribute('x', start.x + 12);
  fromLabel.setAttribute('y', start.y - 10);
  toLabel.setAttribute('x', end.x + 12);
  toLabel.setAttribute('y', end.y - 10);

  const length = flightPath.getTotalLength();
  let startTime;
  flightSprite.style.opacity = 1;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min(1, (timestamp - startTime) / 5000);
    const point = flightPath.getPointAtLength(progress * length);
    flightSprite.setAttribute('transform', `translate(${point.x} ${point.y})`);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function drawMap() {
  if (!mapSvg) return;
  // light grid
  const cols = 10;
  const rows = 6;
  const width = 800;
  const height = 480;
  let grid = '';
  for (let i = 1; i < cols; i += 1) {
    grid += `<line x1="${(width / cols) * i}" y1="0" x2="${(width / cols) * i}" y2="${height}" />`;
  }
  for (let j = 1; j < rows; j += 1) {
    grid += `<line y1="${(height / rows) * j}" x1="0" y2="${(height / rows) * j}" x2="${width}" />`;
  }
  mapGrid.innerHTML = grid;

  // minimal US outline polygon for pixel effect
  const outline = [
    { x: 80, y: 340 }, { x: 120, y: 260 }, { x: 200, y: 220 }, { x: 260, y: 160 }, { x: 320, y: 130 },
    { x: 380, y: 110 }, { x: 440, y: 120 }, { x: 520, y: 150 }, { x: 620, y: 170 }, { x: 690, y: 200 },
    { x: 710, y: 260 }, { x: 650, y: 300 }, { x: 560, y: 330 }, { x: 480, y: 360 }, { x: 380, y: 370 },
    { x: 300, y: 360 }, { x: 210, y: 360 }, { x: 140, y: 380 },
  ];
  const outlinePath = outline.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  usOutline.innerHTML = `<path d="${outlinePath}" />`;
}

function projectToMap(entry) {
  const lat = entry.lat;
  const lon = entry.lon;
  const latMin = 24;
  const latMax = 49;
  const lonMin = -125;
  const lonMax = -66;
  const x = ((lon - lonMin) / (lonMax - lonMin)) * 760 + 20;
  const y = ((latMax - lat) / (latMax - latMin)) * 420 + 30;
  return { x, y };
}

function refreshMap() {
  if (!state.weather.from.areaCode || !state.weather.to.areaCode) return;
  const fromEntry = AREA_CODE_LOOKUP[state.weather.from.areaCode];
  const toEntry = AREA_CODE_LOOKUP[state.weather.to.areaCode];
  if (fromEntry && toEntry) {
    triggerFlightAnimation(fromEntry, toEntry);
  }
}

function calculateMiles(fromEntry, toEntry) {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(toEntry.lat - fromEntry.lat);
  const dLon = toRad(toEntry.lon - fromEntry.lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(fromEntry.lat)) * Math.cos(toRad(toEntry.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function updateMood(message) {
  state.mood = message;
  moodEl.textContent = `Your pigeon looks ${message}.`;
  saveState();
}

function toggleEditMode() {
  const isEditing = !pigeonNameInput.disabled;
  if (isEditing) {
    pigeonNameInput.disabled = true;
    pigeonColorInput.disabled = true;
    editCoopBtn.textContent = 'Edit';
    saveState();
  } else {
    pigeonNameInput.disabled = false;
    pigeonColorInput.disabled = false;
    pigeonNameInput.focus();
    editCoopBtn.textContent = 'Save';
  }
}

function clearDailyLimit() {
  state.lastMessageDate = null;
  dailyStatusEl.textContent = 'Daily limit cleared for testing. Everything else stays intact.';
  saveState();
}

function scheduleDeliveryCheck() {
  processDeliveries();
  if (deliveryTimer) clearTimeout(deliveryTimer);
  deliveryTimer = setTimeout(scheduleDeliveryCheck, 30 * 1000);
}

function processDeliveries() {
  const now = Date.now();
  let changed = false;
  state.messages.forEach((msg) => {
    if (msg.status === 'in-flight' && msg.deliverAt && msg.deliverAt <= now) {
      msg.status = 'delivered';
      msg.etaMinutes = 0;
      changed = true;
    }
  });
  if (changed) {
    gainXp(2);
    checkBadges();
    saveState();
    renderEverything();
  }
}

function hydrateRegions() {
  const fromEntry = AREA_CODE_LOOKUP[parseAreaCode(fromPhoneInput.value)];
  const toEntry = AREA_CODE_LOOKUP[parseAreaCode(toPhoneInput.value)];
  fromRegionEl.textContent = fromEntry ? `${fromEntry.city}, ${fromEntry.state}` : 'Waiting for area code…';
  toRegionEl.textContent = toEntry ? `${toEntry.city}, ${toEntry.state}` : 'Waiting for area code…';
  state.weather.from.location = fromEntry ? `${fromEntry.city}, ${fromEntry.state}` : '';
  state.weather.to.location = toEntry ? `${toEntry.city}, ${toEntry.state}` : '';
}

function init() {
  drawMap();
  renderEverything();

  form.addEventListener('submit', handleSend);
  checkWeatherBtn.addEventListener('click', handleWeatherCheck);
  pigeonNameInput.addEventListener('input', handleNameChange);
  pigeonColorInput.addEventListener('change', handleColorChange);
  [fromPhoneInput, toPhoneInput].forEach((input) => {
    input.addEventListener('input', () => {
      hydrateRegions();
      toggleWeatherButton();
    });
  });
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => switchScreen(btn.dataset.screenButton));
  });
  petBtn.addEventListener('click', () => updateMood('content after some head scratches'));
  feedBtn.addEventListener('click', () => updateMood('energized after a snack'));
  editCoopBtn.addEventListener('click', toggleEditMode);
  dailyResetBtn.addEventListener('click', clearDailyLimit);

  if (alreadySentToday()) {
    dailyStatusEl.textContent = 'You already sent today. Check back tomorrow!';
  }

  hydrateRegions();
  switchScreen('coop');
  scheduleDeliveryCheck();
}

init();
