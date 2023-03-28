export enum SortingCriteria {
    // Don't sort the movies
    SortSkip = 0,

    // Sort the movies by rating in descending order
    SortRatingDescending,
    // Sort the movies by rating in ascending order
    SortRatingAscending,

    // Sort the movies by year descending order
    SortYearDescending,
    // Sort the movies by year in ascending order
    SortYearAscending,
}

export type MovieType = {
    title: string,
    genres: string[],
    directors: string[],
    actors: string[],
    countries: string[],
    year: number,
    description: string,
    rating: number,
    previewLink: string,
    torrents: TorrentType[],
}

export type TorrentType = {
    link: string,
    size: string,
    bg_audio: boolean,
    bg_subs: boolean,
}