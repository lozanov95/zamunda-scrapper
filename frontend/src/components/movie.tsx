import { memo, useState } from "react"
import { TriggerOnVisible, TextField, Tag } from "./common"
import { MovieType, TorrentType } from "./types"

export function MoviesSection({ movies, movieCount, setPage, areMorePagesAvailable }:
    {
        movies: MovieType[], movieCount: number,
        setPage: React.Dispatch<React.SetStateAction<number>>,
        areMorePagesAvailable: boolean
    }) {


    return (
        <div className="movies-section">
            <div className="grid-cont">
                <MoviesList movieCount={movieCount} movies={movies} setPage={setPage} areMorePagesAvailable={areMorePagesAvailable} />
            </div>
        </div>
    )
}

export const MoviesList = memo(function MoviesList({ movies, movieCount, setPage, areMorePagesAvailable }: {
    movies: MovieType[], movieCount: number, setPage: React.Dispatch<React.SetStateAction<number>>, areMorePagesAvailable: boolean
}) {
    const msg = `Има ${movieCount} ${movieCount == 1 ? "филм, който" : "филма, които"} отговарят на търсенето.`
    return (
        <>

            <div className='text-header bg-2 grid-cont shadowed w-90'>{msg}</div>
            {movieCount == 0 ?
                "Не са намерени филми." :
                movies?.map((movie: MovieType, idx) => {
                    return <Movie movie={movie} key={movie.title} />
                })
            }
            {areMorePagesAvailable && <TriggerOnVisible setPage={setPage} />}
        </>
    )
})

export const Movie = memo(function Movie({ movie }: { movie: MovieType }) {


    return (
        <div className='grid-cont grid-cols-2 bg-2 shadowed w-90'>
            <div>
                {movie.previewLink.startsWith("http") ?
                    <img className='br-12px img-cover' src={movie.previewLink}></img> :
                    <img className='br-12px img-cover' src={"https://zamunda.net" + movie.previewLink}></img>
                }
                <TorrentSection movie={movie} />
            </div>
            <ResumeSection movie={movie} />
        </div>
    )
})

export function TorrentSection({ movie }: { movie: MovieType }) {
    const [displayTorrents, setDisplayTorrents] = useState(false)
    const btnClass = "bg-3"

    function ToggleTorrent() {
        setDisplayTorrents((val) => !val)
    }

    return (
        <div className='col'>
            <button className={btnClass} onClick={ToggleTorrent}>{displayTorrents ? "Скрий торентите" : "Покажи торентите"}</button>
            <div className='flex-cont gap-5px'>
                {displayTorrents && movie.torrents?.map((torrent, idx) => {
                    return <Torrent torrent={torrent} key={idx} />
                })}
            </div>
            {displayTorrents && <button className={btnClass} onClick={ToggleTorrent}>Скрий торентите</button>}
        </div>
    )
}

export function Torrent({ torrent }: { torrent: TorrentType }) {
    return (
        <div className='grid-cont bg-5 fit-content'>
            <TextField header='Размер' text={torrent.size} />
            <div><span className='text-header'>Линк: </span><a href={"https://zamunda.net" + torrent.link} target="_blank">тук</a></div>
            {torrent.bg_audio && <Tag className='bg-4 ' value="БГ Аудио" />}
            {torrent.bg_subs && <Tag className='bg-2 ' value="БГ Субтитри" />}
        </div >
    )
}

export function ResumeSection({ movie }: { movie: MovieType }) {
    return (
        <div>
            <div className='title'>{movie.title}</div>
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
