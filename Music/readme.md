## Introduction <a id='intro'></a>
In this project, we will compare the music preferences of the cities of Springfield and Shelbyville. We'll study real Yandex.Music data to test the hypotheses below and compare user behavior for these two cities.

### Goal: 
Test three hypotheses:
1. User activity differs depending on the day of the week and from city to city. 
2. On Monday mornings, Springfield and Shelbyville residents listen to different genres. This is also true for Friday evenings. 
3. Springfield and Shelbyville listeners have different preferences. In Springfield, they prefer pop, while Shelbyville has more rap fans.

### Data
Data on user behavior is stored in the file `/datasets/music_project_en.csv`. There is no information about the quality of the data, so we will need to explore it before testing the hypotheses. 

According to the documentation:
- `'userID'` — user identifier
- `'Track'` — track title
- `'artist'` — artist's name
- `'genre'`
- `'City'` — user's city
- `'time'` — the exact time the track was played
- `'Day'` — day of the week

First, we will evaluate the quality of the data and see whether its issues are significant. Then, during data preprocessing, we will try to account for the most critical problems.