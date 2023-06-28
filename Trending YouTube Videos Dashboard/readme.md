# Trending YouTube Video Dashboard

In this project I work as a video ad analyst at the Sterling & Draper advertising agency. I have devoted a lot of time to analyzing trending videos on YouTube to determine what content deserves marketing attention.

Each video has a specific category (Entertainment, Music, News & Politics, etc.), region, and trending date. 

Every week, the new employees ask the same questions:
- What video categories were trending last week?
- How were they distributed among various regions?
- What categories were especially popular in the United States?

I've decided that it's high time to make the process automated and create a dashboard

What steps need to be taken to design and build the dashboard?

After speaking with the team about the layout and structure, I've also spoken with the database administrators and data engineers and find out where and how the necessary data is collected and how it can be transformed.

After talking to the managers and database administrators, I've drawn up brief technical requirements:

- Business goal: analyze trending-video history on YouTube
- How often the dashboard will be used: at least once a day
- Target dashboard user: video ads planning managers
- Dashboard data content:
    - Trending videos from the past, broken down by day and category
    - Trending videos, broken down by countries
    - A table of correspondence between categories and countries
- Parameters according to which the data is to be grouped:
    - Trending date and time
    - Video category
    - Country
- The data:
    - Trending history — absolute values with a breakdown by day (two graphs: absolute numbers and percentage ratio)
    - Events, broken down by countries — relative values (% of events)
    - The correspondence between the categories and countries — absolute values (a table)

- Data sources for the dashboard: the data engineers promised to create an aggregate table called `trending_by_time`. Here's its structure:
    - `record_id` — primary key
    - `region` — country/geographical region
    - `trending_date` — date and time
    - `category_title` — the video category
    - `videos_count` — the number of videos in the trending section

- The table is stored in the `data-analyst-youtube-data.` database, which was created especially for this project's needs
- Data update interval: once every 24 hours, at midnight UTC

### Link to Dashboard:
[Trending YouTube Video Dashboard](https://public.tableau.com/views/YouTubeVideoTrendDashboard2/Dashboard1?:language=en-US&:display_count=n&:origin=viz_share_link)
