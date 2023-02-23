# ZAMUNDA SCRAPPER a.k.a BUDGET ZAMUNDA

The purpose of this project is to allow you to scrape the movie torrent information from ZAMUNDA.NET and provide a client with better filtering functionality.

## Configuring the application

Create a config.json file in the main repo directory enter the following config variables:

| Variable | Description                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| username | Your ZAMUNDA.NET username                                                                                                       |
| password | Your ZAMUNDA.NET password                                                                                                       |
| workers  | The number of parallel executions that will scrape results. More workers mean that there will be less downtime due to timeouts. |
| pageSize | The size of the pages that are going to be returned from the server. Default value is 100                                       |

## How much time it took on my pc to run the scrape fn with the following configuration

| Workers | Time   |
| ------- | ------ |
| 12      | 17m51s |
| 30      | 7m     |
| 50      | 4m10s  |
| 90      | 2m11s  |
| 100     | 1m56s  |
