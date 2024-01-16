
#We will parse the data on weather in Chicago in November 2017 from the website using python first:
#[https://practicum-content.s3.us-west-1.amazonaws.com/data-analyst-eng/moved_chicago_weather_2017.html]
#The name of the DataFrame should be weather_records, and it should be specified when you search: attrs={"id": "weather_records"}
import pandas as pd
import requests 
from bs4 import BeautifulSoup

req = requests.get('https://practicum-content.s3.us-west-1.amazonaws.com/data-analyst-eng/moved_chicago_weather_2017.html')
soup = BeautifulSoup(req.text, 'lxml')
table = soup.find('table', attrs={"id": "weather_records"})

heading_table = []  
for row in table.find_all(
    'th'
):
     heading_table.append(
        row.text
    ) 

content = []  
for row in table.find_all('tr'):
    if not row.find_all('th'):
        content.append([element.text for element in row.find_all('td')])

weather_records = pd.DataFrame(content, columns=heading_table)
weather_records



-- using SQLite Studio
/*Print the company_name field. Find the number of taxi rides for each taxi company for November 15-16, 2017, 
name the resulting field trips_amount, and print it, too. Sort the results by the trips_amount field in descending order.*/
select 
    cabs.company_name as company_name,
    count(trips.trip_id) as trips_amount
from cabs
    join trips on cabs.cab_id = trips.cab_id
where
    cast(trips.start_ts as date) between '2017-11-15' AND '2017-11-16'
group by
    company_name
order by
    trips_amount desc; 
    
    
    
    
/* 
Find the number of rides for every taxi company whose name contains the words "Yellow" or "Blue" for November 1-7, 2017. 
Name the resulting variable trips_amount. Group the results by the company_name field. */
select
    *
from
   (select 
        cabs.company_name as company_name,
        count(trips.trip_id) as trips_amount
    from cabs
        join trips on cabs.cab_id = trips.cab_id
    where
        company_name like '%Yellow%'
        AND cast(trips.start_ts as date) between '2017-11-1' and '2017-11-7'
    group by 
        company_name
    union
    select 
        cabs.company_name as company_name,
        count(trips.trip_id) as trips_amount
    from cabs
        join trips on cabs.cab_id = trips.cab_id
    where
        company_name like '%Blue%'
        AND cast(trips.start_ts as date) between '2017-11-1' and '2017-11-7'
    group by 
        company_name)
as SUBQ




/*For November 1-7, 2017, the most popular taxi companies were Flash Cab and Taxi Affiliation Services. 
Find the number of rides for these two companies and name the resulting variable trips_amount. 
Join the rides for all other companies in the group "Other." Group the data by taxi company names. 
Name the field with taxi company names company. Sort the result in descending order by trips_amount. */
select
    case 
    when
    cabs.company_name in ('Flash Cab', 'Taxi Affiliation Services') then cabs.company_name 
    else 'Other' end as company,
    count(trips.trip_id) as trips_amount
from
    cabs
    join trips on trips.cab_id = cabs.cab_id
where
    cast(trips.start_ts as date) between '2017-11-1' and '2017-11-7'
group by
    company
order by
    trips_amount desc; 
    
    
    
    
-- Retrieve the identifiers of the O'Hare and Loop neighborhoods from the neighborhoods table.--
select
    neighborhood_id,
    name
from
    neighborhoods
where 
    name like '%Hare' 
    OR name LIKE 'Loop'



/* For each hour, retrieve the weather condition records from the weather_records table. 
Using the CASE operator, break all hours into two groups: Bad if the description field contains the words rain or storm, 
and Good for others. Name the resulting field weather_conditions. 
The final table must include two fields: date and hour (ts) and weather_conditions. */
select
    date_trunc('hour', ts) as ts,
    case
    when description like '%rain%' or description like '%storm%' then 'Bad'
    else 'Good' End as weather_conditions
from
    weather_records
    
    
    
    
/* Retrieve from the trips table all the rides that started in the Loop (pickup_location_id: 50) on a Saturday and ended at O'Hare 
(dropoff_location_id: 63). Get the weather conditions for each ride. Use the method you applied in the previous task. 
Also, retrieve the duration of each ride. Ignore rides for which data on weather conditions is not available.
The table columns should be in the following order:
- start_ts
- weather_conditions
- duration_seconds
Sort by trip_id. */
select
    date_trunc('hour', ts) as start_ts,
    case
    when description like '%rain%' or description like '%storm%' then 'Bad'
    else 'Good' End as weather_conditions,
    trips.duration_seconds as duration_seconds
from trips
    join weather_records on trips.start_ts = weather_records.ts
where
    trips.pickup_location_id = '50'
    and trips.dropoff_location_id = '63'
    and extract(DOW from trips.start_ts) = 6
order by
    trips.trip_id;

