import { useEffect, useState } from 'react'
import './App.css'


type MovieType = {
  title: string,
  genres: string[] | null,
  directors: string[],
  actors: string[],
  countries: string[],
  year: number,
  description: string,
  rating: number,
  torrents: TorrentType[],
}

type TorrentType = {
  link: string,
  size: string,
  bg_audio: boolean,
  bg_subs: boolean,
}

function App() {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    fetch("http://localhost/movies").then((data) => {
      return data.json()
    }).then((newMovies) => {
      setMovies(newMovies)
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  return (
    <div className="flex-cont flex-col">
      {movies?.map((movie: MovieType, idx) => {
        return <Movie movie={movie} key={idx} />
      })}
    </div>
  )
}

function Movie({ movie }: { movie: MovieType }) {
  const [displayTorrents, setDisplayTorrents] = useState(false)

  function ToggleTorrent() {
    setDisplayTorrents((val) => !val)
  }

  return (
    <div className='container'>
      <div className='title'>{movie.title}</div>
      <TextField header='Жанр' text={movie.genres?.join(", ")} />
      <TextField header='Режисьор' text={movie.directors?.join(", ")} />
      <TextField header='Актьори' text={movie.actors?.join(", ")} />
      <TextField header='Държавa' text={movie.countries?.join(", ")} />
      {movie.rating > 0 && <TextField header='Рейтинг' text={movie.rating.toString()} />}
      <TextField header='Година' text={movie.year.toString()} />
      <TextField header='Резюме' text={movie.description} />
      <div>
        <button onClick={ToggleTorrent}>{displayTorrents ? "Скрий торентите" : "Покажи торентите"}</button>
        <div className='flex-col'>
          {displayTorrents && movie.torrents?.map((torrent, idx) => {
            return <Torrent torrent={torrent} key={idx} />
          })}
        </div>
      </div>

    </div>
  )
}

function Torrent({ torrent }: { torrent: TorrentType }) {
  return (
    <div className='flex-row'>
      <div>{torrent.bg_audio ? "БГ Аудио" : ""}</div>
      <div>{torrent.bg_subs ? "БГ Субтитри" : ""}</div>
      <div><a href={"https://zamunda.net" + torrent.link} target="_blank">Link</a></div>
      <div>{torrent.size}</div>
    </div >
  )
}

function TextField({ header, text }: { header: string, text?: string }) {

  return (
    <div>
      <span className='text-header'>{header}: </span>
      <span>{text}</span>
    </div>
  )
}

export default App
