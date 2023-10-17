import { memo, useEffect, useState } from "react"
import { TriggerOnVisible, TextField, Tag } from "./common"
import { MovieType, TorrentType } from "./types"

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
        <div className="flex flex-col gap-2 items-center">
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
            <div className="border-2 bg-blue-100 border-blue-200 shadow-md shadow-blue-300 px-6 py-4 rounded-lg w-[100%] justify-center">{msg}</div>
            {movies?.map((movie: MovieType) => {
                return <Movie movie={movie} key={movie.title} />
            })
            }
            {areMorePagesAvailable && <TriggerOnVisible setPage={setPage} />}
        </>
    )
})

export const Movie = memo(function Movie({ movie }: { movie: MovieType }) {

    return (
        <div className="flex flex-col gap-3 border-2 bg-blue-100 border-blue-200 shadow-md shadow-blue-300 px-6 py-4 rounded-lg w-[100%] justify-center">
            <div className="text-xl font-semibold">{movie.title}</div>
            <MovieImage previewLink={movie.previewLink} />
            <ResumeSection movie={movie} />
            <TorrentSection movie={movie} />
        </div>
    )
})

export function TorrentSection({ movie }: { movie: MovieType }) {
    const [displayTorrents, setDisplayTorrents] = useState(false)
    const btnClass = "bg-3 scale-1"

    function ToggleTorrent() {
        setDisplayTorrents((val) => !val)
    }

    return (
        <>
            <div>
                <button className={btnClass} onClick={ToggleTorrent}>{displayTorrents ? "Скрий торентите" : "Покажи торентите"}</button>
                <div >
                    {displayTorrents && movie.torrents?.map((torrent, idx) => {
                        return <Torrent torrent={torrent} key={idx} />
                    })}
                </div>
                {displayTorrents && <button className={btnClass} onClick={ToggleTorrent}>Скрий торентите</button>}
            </div>
        </>
    )
}

export function Torrent({ torrent }: { torrent: TorrentType }) {
    return (
        <div >
            <TextField header='Размер' text={torrent.size} />
            <div><span >Линк: </span><a href={"https://zamunda.net" + torrent.link} target="_blank">тук</a></div>
            {torrent.bg_audio && <Tag value="БГ Аудио" />}
            {torrent.bg_subs && <Tag value="БГ Субс" />}
        </div >
    )
}

export function ResumeSection({ movie }: { movie: MovieType }) {
    return (
        <div >
            <TextField header='Жанр' text={movie.genres?.join(", ")} />
            <TextField header='Режисьор' text={movie.directors?.join(", ")} />
            <TextField header='Актьори' text={movie.actors?.join(", ")} />
            <TextField header='Държавa' text={movie.countries?.join(", ")} />
            {movie.rating > 0 && <TextField header='Рейтинг' text={movie.rating.toString() + '/10'} />}
            <TextField header='Година' text={movie.year.toString()} />
            <TextField header='Резюме' text={movie.description} />
        </div>
    )
}

function MovieImage({ previewLink }: { previewLink: string }) {
    const src = previewLink.startsWith("http")
        ? previewLink
        : "https://zamunda.net" + previewLink

    return (
        <img src={src} className="" />
    )
}