import { useEffect, useState } from 'react'
import './App.css'


type MovieType = {
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

type TorrentType = {
  link: string,
  size: string,
  bg_audio: boolean,
  bg_subs: boolean,
}

type Filters = {
  selectedGenres: string[],
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>
  actor: string,
  setActor: React.Dispatch<React.SetStateAction<string>>
  minRating: number,
  setMinRating: React.Dispatch<React.SetStateAction<number>>
  fromYear: number,
  setFromYear: React.Dispatch<React.SetStateAction<number>>
  availableActors: never[],
  setAvailableActors: React.Dispatch<React.SetStateAction<never[]>>
}
// TODO: show how many movies satisfy the parameters
function App() {
  const [movies, setMovies] = useState<MovieType[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [actor, setActor] = useState<string>("")
  const [minRating, setMinRating] = useState<number>(0)
  const [fromYear, setFromYear] = useState<number>(0)
  const [availableActors, setAvailableActors] = useState([])

  const filters = {
    selectedGenres, setSelectedGenres, actor, setActor, minRating, setMinRating,
    fromYear, setFromYear, availableActors, setAvailableActors
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch(`http://localhost/movies?fromYear=${filters.fromYear}&minRating=${filters.minRating}&actors=${actor}&genres=${selectedGenres.join(",")}`, { signal: controller.signal }).then((data) => {
      return data.json()
    }).then((newMovies) => {
      setMovies(newMovies)
    }).catch((err) => {
      console.log(err)
    })

    return () => { controller.abort() }
  }, [selectedGenres, minRating, fromYear])

  return (
    <>
      <FilterPanel filters={filters} />
      <MoviesSection movies={movies} />
    </>
  )
}

function MoviesSection({ movies }: { movies: MovieType[] }) {
  return (
    <div className='movies'>
      {
        movies?.length === 0 ? <div>Loading movies...</div> :
          <div className="grid-cont bg-2">
            {movies?.map((movie: MovieType, idx) => {
              return <Movie movie={movie} key={idx} />
            })
            }
          </div>
      }
    </div>
  )
}

function Movie({ movie }: { movie: MovieType }) {
  const [displayTorrents, setDisplayTorrents] = useState(false)

  function ToggleTorrent() {
    setDisplayTorrents((val) => !val)
  }

  return (
    <div className='grid-cont grid-cols-2 bg-3'>
      <div>
        {movie.previewLink.startsWith("http") ?
          <img className='img-cover' src={movie.previewLink}></img> :
          <img className='img-cover' src={"https://zamunda.net" + movie.previewLink}></img>
        }
        <div className='col'>
          <button onClick={ToggleTorrent}>{displayTorrents ? "Скрий торентите" : "Покажи торентите"}</button>
          {displayTorrents && movie.torrents?.map((torrent, idx) => {
            return <Torrent torrent={torrent} key={idx} />
          })}
          {displayTorrents && <button onClick={ToggleTorrent}>Скрий торентите</button>}
        </div>
      </div>
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
    </div>
  )
}

function Torrent({ torrent }: { torrent: TorrentType }) {
  return (
    <div className='grid-cont bg-2'>
      {torrent.bg_subs && <TextField header="БГ Суб" text='Да' />}
      {torrent.bg_audio && <TextField header="БГ Аудио" text='Да' />}
      <TextField header='Размер' text={torrent.size} />
      <div><span className='text-header'>Линк: </span><a href={"https://zamunda.net" + torrent.link} target="_blank">тук</a></div>
    </div >
  )
}

function TextField({ header, text }: { header: string, text: string }) {

  return (
    <>
      {text?.length > 0 ?
        <div>
          <span className='text-header'>{header}: </span>
          <span>{text}</span>
        </div> :
        <></>
      }
    </>
  )
}

function FilterPanel({ filters }: { filters: Filters }) {
  const [genres, setGenres] = useState<string[]>([])

  useEffect(() => {
    fetch("http://localhost/genres").then((data) => {
      return data.json()
    }).then((newMovies) => {
      setGenres(newMovies)
    }).catch((err) => {
      console.log(err)
    })
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch(`http://localhost/actors?contains=${filters.actor}&fromYear=${filters.fromYear}&minRating=${filters.minRating}`, { signal: controller.signal })
      .then((data) => {
        return data.json()
      }).then((actors) => {
        filters.setAvailableActors(actors ?? [])
      }).catch((err) => {
        console.log(err)
      })

    return () => controller.abort()
  }, [filters.actor])

  useEffect(() => {
    console.log(filters.selectedGenres)
  }, [filters.selectedGenres])

  function HandleSelectGenres(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      filters.setSelectedGenres((g) => [...g, e.target.value])
      return
    }
    filters.setSelectedGenres((g) => g.filter((v) => v != e.target.value))
  }

  function HandleActorTextChange(e: any) {
    filters.setActor(e.target.value)
  }

  return (
    <div className='filter grid-cont'>
      <label className='text-header'>Жанрове (комбинирано)</label>
      <div className='grid-cont grid-cols-2 bg-3'>
        {genres.map((val, idx) => {
          return (
            <label className='text-header'>
              {val}
              <input type="checkbox" key={idx} value={val} onChange={HandleSelectGenres} />
            </label>
          )
        })}
      </div>
      <div className='grid-cont bg-3'>
        <label className='text-header'>
          След година
        </label>
        <input type="number" value={filters.fromYear} onChange={(e) => filters.setFromYear(parseInt(e.target.value))} max={new Date().getFullYear()} min="1900" />
      </div>
      <div className='grid-cont bg-3'>
        <label className='text-header'>
          Минимален рейтинг
          <input type="number" value={filters.minRating} onChange={(e) => filters.setMinRating(parseFloat(e.target.value))} max="10" min="0" />
        </label>
      </div>
      <div className='grid-cont bg-3'>
        <label className='text-header'>
          С участието на
        </label>
        <input type="text" value={filters.actor} onChange={HandleActorTextChange} />
        {filters.availableActors.length > 0 && filters.availableActors.map((actor) => {
          return <li>{actor}</li>
        })}
      </div>
    </div>
  )
}

export default App
