import { memo, useEffect, useMemo, useState } from "react"
import { TriggerOnVisible, TextField, Tag } from "./common"
import { MovieType, TorrentType } from "./types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar } from "@fortawesome/free-solid-svg-icons"

export function MoviesSection({ domain, hidden, filterParams, title }: { domain: string, title: string, filterParams: string, hidden: boolean }) {
    const [areMorePagesAvailable, setAreMorePagesAvailable] = useState<boolean>(true)
    const [movies, setMovies] = useState<MovieType[]>([])
    const [movieCount, setMovieCount] = useState<number>(0)
    const [page, setPage] = useState<number>(0)

    const URL = `${domain}/movies?contains=${title}&${filterParams}`

    useEffect(() => {
        setPage(0)
        const controller = new AbortController();
        fetch(URL,
            { signal: controller.signal })
            .then((data) => {
                return data.json()
            }).then(({ value, count }) => {
                setMovies(value)
                setMovieCount(count)
            }).catch((err) => {
                console.log(err)
            })

        return () => { controller.abort() }
    }, [URL])

    useEffect(() => {
        if (page == 0) {
            return
        }
        const controller = new AbortController();
        fetch(`${URL}&page=${page}`,
            { signal: controller.signal })
            .then((data) => {
                return data.json()
            }).then(({ value, count }) => {
                if (value.length == 0) {
                    setAreMorePagesAvailable(false)
                }
                setMovies((v) => [...v, ...value])
                setMovieCount(count)
            }).catch((err) => {
                console.log(err)
            })

        return () => { controller.abort() }
    }, [page])

    return (
        <div className={`flex flex-col gap-2 items-center lg:w-[70%] ${hidden && 'hidden'}`}>
            <MoviesList movieCount={movieCount} movies={movies} setPage={setPage} areMorePagesAvailable={areMorePagesAvailable} />
        </div>
    )
}

export const MoviesList = memo(function MoviesList({ movies, movieCount, setPage, areMorePagesAvailable }: {
    movies: MovieType[], movieCount: number, setPage: React.Dispatch<React.SetStateAction<number>>, areMorePagesAvailable: boolean
}) {
    const msg = `Има ${movieCount} ${movieCount == 1 ? "филм, който" : "филма, които"} отговарят на търсенето.`
    return (
        <>
            <div className="border-2 bg-blue-100 border-blue-200 shadow-md shadow-blue-300 px-6 py-4 rounded-lg w-[100%] justify-center text-center font-semibold">{msg}</div>
            <div className="flex flex-wrap gap-2 justify-center">
                {movies?.map((movie: MovieType) => {
                    return <Movie movie={movie} key={movie.title} />
                })
                }
                {areMorePagesAvailable && <TriggerOnVisible setPage={setPage} />}
            </div>
        </>
    )
})

export function Movie({ movie }: { movie: MovieType }) {
    const [toggled, setToggled] = useState(false)
    const subs = useMemo(
        () => movie.torrents.find((el) => el.bg_subs === true) !== undefined,
        [movie.torrents]
    )
    const audio = useMemo(
        () => movie.torrents.find((el) => el.bg_audio === true) !== undefined,
        [movie.torrents]
    )



    return (
        <div
            className="flex flex-col lg:flex-row gap-2 bg-blue-100 py-4 px-4 border-2 border-blue-200 shadow-md shadow-blue-300 rounded-lg min-w-full hover:border-blue-400 hover:shadow-blue-400 cursor-pointer"
            onClick={() => setToggled((value) => !value)}
        >
            <div className="flex flex-col justify-items-center min-w-fit gap-1 place-items-center">
                <div>
                    <MovieImage previewLink={movie.previewLink} />
                </div>
                <Rating rating={movie.rating} />
                <div className="flex gap-1 justify-center">
                    {subs && <div className="bg-teal-900 text-gray-200 shadow-lg px-2 py-1 rounded-lg font-semibold text-center">БГ Суб</div>}
                    {audio && <div className="bg-lime-900 text-gray-200 shadow-lg px-2 py-1 rounded-lg font-semibold text-center">БГ Аудио</div>}
                </div>
            </div>
            <div className="px-1 flex flex-col gap-1">
                <div className="font-semibold">{movie.title}</div>
                <div className="text-sm text-gray-500 font-semibold">{movie.year}{movie.genres.length > 0 && ` - ${movie.genres.join(", ")}`} </div>
                <div className="border-t-2 border-blue-200 indent-3">{movie.description}</div>
                <div className={`${toggled ? "flex flex-col" : "hidden"} border-t-2 border-blue-200 gap-2`}>
                    <div className="flex flex-col gap-2">
                        {movie.directors.length > 0 && <div className="flex text-sm text-gray-500 font-bold">Режисиран от {movie.directors.join(", ")}</div>}
                        {movie.actors.length > 0 && <div className="flex text-sm text-gray-500 font-bold">С участието на {movie.actors.join(", ")}</div>}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {movie.torrents.map((torrent, i) => <Torrent torrent={torrent} key={i} />)}
                    </div>
                </div>
            </div>
        </div>
    )
}

function Torrent({ torrent }: { torrent: TorrentType }) {
    return (
        <div
            className="bg-blue-300 gap-2 max-w-fit px-4 py-2 rounded-lg place-items-center place-content-center flex flex-col cursor-pointer border-2 border-blue-300 hover:border-blue-400 shadow-sm shadow-blue-500"
            onClick={() => { window.open(`https://zamunda.net${torrent.link}`) }}
        >

            {torrent.bg_audio || torrent.bg_subs &&
                <div className="flex flex-col gap-2">
                    {torrent.bg_audio &&
                        <div className="bg-lime-900 text-gray-200 shadow-sm shadow-teal-800 px-2 py-1 rounded-lg font-semibold text-center">БГ Аудио</div>
                    }
                    {torrent.bg_subs &&
                        <div className="bg-teal-900 text-gray-200 shadow-sm shadow-teal-800 px-2 py-1 rounded-lg font-semibold text-center">БГ Субс</div>
                    }
                </div>
            }
            <div className="text-sm font-semibold text-gray-600">
                {torrent.size}
            </div>
        </div>
    )
}

function MovieImage({ previewLink }: { previewLink: string }) {
    const src = previewLink.startsWith("http")
        ? previewLink
        : "https://zamunda.net" + previewLink

    return (
        <img src={src} className="max-w-[200px] max-h-[200px] rounded-lg" />
    )
}

function Rating({ rating }: { rating: string | number }) {
    return (
        <div className="font-bold text-center flex gap-1 items-center justify-center">
            <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
            <span>{rating}</span>
        </div>
    )
}