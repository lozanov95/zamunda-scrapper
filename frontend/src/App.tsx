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
    <div>
      <div>{movie.title}</div>
      <div>{movie.genres?.join(", ")}</div>
      <div>{movie.directors?.join(", ")}</div>
      <div>{movie.actors?.join(", ")}</div>
      <div>{movie.countries?.join(", ")}</div>
      <div>{movie.year}</div>
      <div>{movie.description}</div>
      <div>{movie.rating} star</div>
      <button onClick={ToggleTorrent}>Toggle torrents</button>
      <div>
        {displayTorrents && movie.torrents?.map((torrent, idx) => {
          return <Torrent torrent={torrent} key={idx} />
        })}
      </div>

    </div>
  )
}

function Torrent({ torrent }: { torrent: TorrentType }) {
  return (
    <div>
      <div>{torrent.bg_audio}</div>
      <div>{torrent.bg_subs}</div>
      <div>{torrent.link}</div>
      <div>{torrent.size}</div>
    </div>
  )
}

export default App
