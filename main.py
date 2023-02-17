# coding=utf-8

from dataclasses import dataclass, asdict
import json
import time
from typing import List, Dict, Optional
from re import compile
import re

from playwright.sync_api import (
    sync_playwright,
    Browser,
    Page,
    ElementHandle,
    TimeoutError,
)


@dataclass
class Config:
    username: str
    password: str

    @classmethod
    def load_from_json_file(self, file_name: str):
        with open(file_name, "r") as f:
            loaded_cfg = json.load(f)

        return Config(**loaded_cfg)


@dataclass
class Movie:
    title: str
    genres: List[str]
    year: int
    bg_audio: bool
    bg_subs: bool
    description: str
    actors: List[str]
    country: List[str]
    rating: Optional[float]

    def toJSON(self):
        return asdict(self)


@dataclass
class Selectors:
    USERNAME: str = 'input[name="username"]'
    PASSWORD: str = 'input[name="password"]'
    NEXT_PAGE: str = ".gotonext"
    CATALOG_ROWS: str = "table.test > tbody > tr"
    MOVIE_DESCRIPTION: str = "td > #description"
    MOVIE_TITLE: str = ".colheadd"
    AUDIO_ICONS: str = "center > img"
    GENRES_SELECTOR: str = "b > u"
    IMDB_RATING: float = ".imdtextrating"


@dataclass
class ExtractedMovieDescriptionResult:
    director: List[str]
    actors: List[str]
    country: List[str]
    year: int
    description: str


@dataclass
class Regexes:
    FullPattern: re.Pattern = compile(
        r"Режисьор\W+(?P<director>[\w\s,-]+).+В ролите\W+(?P<actors>[\w ,-]+).+Държава\W+(?P<country>[\w, ]+).+Година\W+(?P<year>\d{4}).+Резюме\W+(?P<description>.+)",
        flags=re.S,
    )


class ZamundaClient:
    def __init__(self, cfg_file_name: str = "config.json") -> None:
        self.loginURL = "https://zamunda.net/login.php"
        self.moviesURL = "https://zamunda.net/catalogs/movies&t=movie"
        self.cfg = Config.load_from_json_file(cfg_file_name)
        self.movies = []

    def _login(self, browser: Browser) -> Page:
        page: Page = browser.new_page()
        page.goto(self.loginURL)
        page.fill(Selectors.USERNAME, self.cfg.username)
        page.fill(Selectors.PASSWORD, self.cfg.password)
        page.press(Selectors.PASSWORD, "Enter")

        return page

    def _get_scraped_movie(self, movies: List[Movie], title: str) -> Optional[Movie]:
        for movie in movies:
            if movie.title == title:
                return movie

        return

    def _scrape_movie(self, catalog_row: ElementHandle) -> Optional[Movie]:
        title = self._extract_movie_title(catalog_row)
        description = self._extract_movie_description_data(catalog_row=catalog_row)
        is_bg_audio = self._is_bg_audio_available(catalog_row=catalog_row)
        is_bg_subs = self._is_bg_subs_available(catalog_row=catalog_row)
        genres = self._extract_movie_genres(catalog_row=catalog_row)
        rating = self._extract_imdb_rating(catalog_row=catalog_row)

        if description is None or title == "" or len(genres) == 0:
            print(f"failed to parse the movie {title}")
            return

        existing_movie = self._get_scraped_movie(self.movies, title)
        if existing_movie is not None:
            print(f"{title} is already in the list of movies")
            if is_bg_audio:
                existing_movie.bg_audio = is_bg_audio
            if is_bg_subs:
                existing_movie.bg_subs = is_bg_subs

            return

        return Movie(
            title=title,
            genres=genres,
            year=description.year,
            bg_audio=is_bg_audio,
            bg_subs=is_bg_subs,
            description=description.description,
            actors=description.actors,
            country=description.country,
            rating=rating,
        )

    def _browse_torrent_pages(self, page: Page):
        try:
            page.goto(self.moviesURL)
            while True:
                print(f"opened page {page.url}")
                time.sleep(0.5)
                catalog_rows = page.query_selector_all(Selectors.CATALOG_ROWS)
                for i in range(2, len(catalog_rows)):
                    movie = self._scrape_movie(catalog_row=catalog_rows[i])

                    if movie is not None:
                        print(f"added movie {movie.title}")
                        self.movies.append(movie)
                page.click(Selectors.NEXT_PAGE)
                
        except TimeoutError:
            print("Operation timed out. Possibly there are no more movie pages.")
        except KeyboardInterrupt:
            print("The script was cancelled. Saving the scraped data and exiting.")
        except Exception as e:
            print(e)
        finally:
            return self.movies

    def _extract_movie_description_data(
        self, catalog_row: ElementHandle
    ) -> Optional[ExtractedMovieDescriptionResult]:
        movie_description = (
            catalog_row.query_selector(Selectors.MOVIE_DESCRIPTION)
            .text_content()
            .strip()
        )
        fp = Regexes.FullPattern.search(movie_description)

        if fp is None:
            return

        group_dict: Dict = fp.groupdict()
        director = group_dict.get("director").split(", ")
        actors = group_dict.get("actors").split(", ")
        country = group_dict.get("country").split(", ")
        year = int(group_dict.get("year"))
        description = group_dict.get("description")

        return ExtractedMovieDescriptionResult(
            director=director,
            actors=actors,
            country=country,
            year=year,
            description=description,
        )

    def _extract_movie_title(self, catalog_row: ElementHandle) -> str:
        return catalog_row.query_selector(Selectors.MOVIE_TITLE).text_content().strip()

    def _is_bg_audio_available(self, catalog_row: ElementHandle) -> bool:
        icons = catalog_row.query_selector_all(Selectors.AUDIO_ICONS)
        for icon in icons:
            if "bgaudio" in icon.get_property("src").__repr__():
                return True

        return False

    def _is_bg_subs_available(self, catalog_row: ElementHandle) -> bool:
        icons = catalog_row.query_selector_all(Selectors.AUDIO_ICONS)
        for icon in icons:
            if "bgsub" in icon.get_property("src").__repr__():
                return True

        return False

    def _extract_movie_genres(self, catalog_row: ElementHandle) -> List[str]:
        return [
            genre.text_content()
            for genre in catalog_row.query_selector_all(Selectors.GENRES_SELECTOR)
        ]

    def _extract_imdb_rating(self, catalog_row: ElementHandle) -> Optional[float]:
        rating = catalog_row.query_selector(Selectors.IMDB_RATING)

        if rating is None:
            return

        return float(rating.text_content())

    def main(self):
        with sync_playwright() as p:
            browser = p.firefox.launch(headless=False)
            # browser = p.chromium.launch(headless=False)
            context = browser.new_context()
            page = self._login(browser=context)
            movies = self._browse_torrent_pages(page=page)
            with open("movies.json", "w", encoding="utf-8") as f:
                json.dump(movies, f, default=lambda o: asdict(o))


if __name__ == "__main__":
    zc = ZamundaClient()
    zc.main()
