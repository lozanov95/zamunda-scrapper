import { useEffect, useState } from 'react'
import './App.css'

// type ExtractedMovieDescriptionResult struct {
// 	Directors   []string `json:"directors"`
// 	Actors      []string `json:"actors"`
// 	Countries   []string `json:"countries"`
// 	Year        int      `json:"year"`
// 	Description string   `json:"description"`
// }

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
    <div className="App">
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
      <div>{movie.title}</div>
      <div>Жанр: {movie.genres?.join(", ")}</div>
      <div>Режисьор: {movie.directors?.join(", ")}</div>
      <div>Актьори: {movie.actors?.join(", ")}</div>
      {movie.countries?.length > 0 && <div>Държави: {movie.countries?.join(", ")}</div>}
      {movie.year > 0 && <div>Година: {movie.year}</div>}
      <div>Резюме: {movie.description}</div>
      {movie.rating > 0 && <div>Рейтинг: {movie.rating} &#9733;</div>}
      <button onClick={ToggleTorrent}>{displayTorrents ? "Скрий торентите" : "Покажи торентите"}</button>
      <div className='flex-col'>
        {displayTorrents && movie.torrents?.map((torrent, idx) => {
          return <Torrent torrent={torrent} key={idx} />
        })}
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

export default App
