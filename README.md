# ZAMUNDA SCRAPPER a.k.a BUDGET ZAMUNDA

The purpose of this project is to allow you to scrape the movie torrent information from ZAMUNDA.NET and provide a client with better filtering functionality.

## Prerequisites

You will need the following:

- A zamunda.net account
- Docker
- Make

## Configuring the application

Create a config.json file in the main repo directory enter the following config variables:

| Variable | Description                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| username | Your ZAMUNDA.NET username.                                                                                                      |
| password | Your ZAMUNDA.NET password.                                                                                                      |
| workers  | The number of parallel executions that will scrape results. More workers mean that there will be less downtime due to timeouts. |
| pageSize | The size of the pages that are going to be returned from the server. Default value is 100.                                      |

## Scraping the movies information

```sh
make scrape
```

This will start scraping the Zamunda.NET movies and in the end a _movies.json_ file will appear in the top level directory.

## Running the server

```sh
make prod
```

This will pull the latest version of the code and start a docker compose deployment.

## How much time it took on my pc to run the scrape fn with the following configuration

| Workers | Time   |
| ------- | ------ |
| 12      | 17m51s |
| 30      | 7m     |
| 50      | 4m10s  |
| 90      | 2m11s  |
| 100     | 1m56s  |

There is a delay between each request, because otherwise the requests get throttled. More workers result in faster scrape time, but this also does a significantly more load on the zamunda's backend. My suggestion is to use the lowest amount of workers that fits your timeframe.
