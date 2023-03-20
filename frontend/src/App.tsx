import { useEffect, useRef, useState, useMemo, memo } from 'react'
import './App.css'


enum SortingCriteria {
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
  selectedGenres: string[]
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>

  actor: string
  setActor: React.Dispatch<React.SetStateAction<string>>

  director: string
  setDirector: React.Dispatch<React.SetStateAction<string>>

  minRating: number
  setMinRating: React.Dispatch<React.SetStateAction<number>>

  fromYear: number
  setFromYear: React.Dispatch<React.SetStateAction<number>>

  bgAudio: boolean
  setBgAudio: React.Dispatch<React.SetStateAction<boolean>>

  bgSubs: boolean
  setBgSubs: React.Dispatch<React.SetStateAction<boolean>>

  sortCriteria: number
  setSortCriteria: React.Dispatch<React.SetStateAction<number>>
}

function App() {
  const [areMorePagesAvailable, setAreMorePagesAvailable] = useState<boolean>(true)
  const [title, setTitle] = useState<string>("")
  const [movies, setMovies] = useState<MovieType[]>([])
  const [movieCount, setMovieCount] = useState<number>(0)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  const [actor, setActor] = useState<string>("")
  const [director, setDirector] = useState<string>("")

  const [minRating, setMinRating] = useState<number>(0)
  const [fromYear, setFromYear] = useState<number>(0)
  const [page, setPage] = useState<number>(0)
  const [bgAudio, setBgAudio] = useState<boolean>(false)
  const [bgSubs, setBgSubs] = useState<boolean>(false)
  const [sortCriteria, setSortCriteria] = useState<number>(0)

  const [previousUrl, setPreviousURL] = useState("")

  const filters = {
    selectedGenres, setSelectedGenres, actor, setActor, minRating, setMinRating,
    fromYear, setFromYear, bgAudio, setBgAudio, bgSubs, setBgSubs, director, setDirector, sortCriteria, setSortCriteria
  }

  const URL = `http://localhost/movies?contains=${title}&fromYear=${fromYear}&minRating=${minRating}&actors=${actor.length > 2 ? actor : ""}&directors=${director.length > 2 ? director : ""}&genres=${selectedGenres.join(",")}&page=${page}&bgaudio=${bgAudio ? "1" : "0"}&bgsubs=${bgSubs ? "1" : "0"}&sort=${sortCriteria}`

  useEffect(() => {
    if (URL == previousUrl) {
      return
    }

    setPreviousURL(URL)
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
  }, [selectedGenres, minRating, fromYear, title, actor, director, bgAudio, bgSubs, sortCriteria])

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
    <>
      <HeaderSection title={title} setTitle={setTitle} />
      <FilterSection filters={filters} />
      <MoviesSection movies={movies} movieCount={movieCount} setPage={setPage} areMorePagesAvailable={areMorePagesAvailable} />
    </>
  )
}

function HeaderSection({ title, setTitle }: { title: string, setTitle: React.Dispatch<React.SetStateAction<string>> }) {
  return (
    <div className='header-section'>
      <input className='header-search' placeholder='търси по заглавие' value={title} onChange={(e) => setTitle(e.target.value)} />
    </div >
  )
}

function MoviesSection({ movies, movieCount, setPage, areMorePagesAvailable }:
  {
    movies: MovieType[], movieCount: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    areMorePagesAvailable: boolean
  }) {


  return (
    <div className='movies'>
      <div className="grid-cont">
        <MoviesList movieCount={movieCount} movies={movies} setPage={setPage} areMorePagesAvailable={areMorePagesAvailable} />
      </div>
    </div>
  )
}

const MoviesList = memo(function MoviesList({ movies, movieCount, setPage, areMorePagesAvailable }: {
  movies: MovieType[], movieCount: number, setPage: React.Dispatch<React.SetStateAction<number>>, areMorePagesAvailable: boolean
}) {
  const msg = `Има ${movieCount} ${movieCount == 1 ? "филм, който" : "филма, които"} отговарят на търсенето.`
  return (
    <>

      <div className='text-header bg-2 grid-cont shadowed'>{msg}</div>
      {movieCount == 0 ?
        "Не са намерени филми." :
        movies?.map((movie: MovieType, idx) => {
          return <Movie movie={movie} key={idx} />
        })
      }
      {areMorePagesAvailable && <TriggerOnVisible setPage={setPage} />}
    </>
  )
})

const Movie = memo(function Movie({ movie }: { movie: MovieType }) {
  const [displayTorrents, setDisplayTorrents] = useState(false)

  function ToggleTorrent() {
    setDisplayTorrents((val) => !val)
  }

  return (
    <div className='grid-cont grid-cols-2 bg-2 shadowed'>
      <div>
        {movie.previewLink.startsWith("http") ?
          <img className='img-cover' src={movie.previewLink}></img> :
          <img className='img-cover' src={"https://zamunda.net" + movie.previewLink}></img>
        }
        <div className='col'>
          <button className='bg-3' onClick={ToggleTorrent}>{displayTorrents ? "Скрий торентите" : "Покажи торентите"}</button>
          <div className='flex-cont gap-5px'>
            {displayTorrents && movie.torrents?.map((torrent, idx) => {
              return <Torrent torrent={torrent} key={idx} />
            })}
          </div>
          {displayTorrents && <button className='bg-3' onClick={ToggleTorrent}>Скрий торентите</button>}
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
})

function Torrent({ torrent }: { torrent: TorrentType }) {
  return (
    <div className='grid-cont bg-5 fit-content'>
      {torrent.bg_subs && <TextField cN="bg-2 pad-5px br-6px marg-2px" header="БГ Суб" text='Да' />}
      {torrent.bg_audio && <TextField cN='bg-4 pad-5px br-6px marg-2px' header="БГ Аудио" text='Да' />}
      <TextField header='Размер' text={torrent.size} />
      <div><span className='text-header'>Линк: </span><a href={"https://zamunda.net" + torrent.link} target="_blank">тук</a></div>
    </div >
  )
}

function TextField({ header, text, cN }: { header: string, text: string, cN?: string }) {

  return (
    <>
      {text?.length > 0 ?
        <div className={cN}>
          <span className="text-header">{header}: </span>
          <span>{text}</span>
        </div> :
        <></>
      }
    </>
  )
}

function FilterSection({ filters }: { filters: Filters }) {
  const [genres, setGenres] = useState<string[]>([])
  const [actors, setActors] = useState<string[]>([])
  const [directors, setDirectors] = useState<string[]>([])

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
    fetch(`http://localhost/actors?contains=${filters.actor}`, { signal: controller.signal })
      .then((data) => {
        return data.json()
      }).then((actors) => {
        setActors(actors ?? [])
      }).catch((err) => {
        console.log(err)
      })

    return () => controller.abort()
  }, [filters.actor])

  useEffect(() => {
    const controller = new AbortController()
    fetch(`http://localhost/directors?contains=${filters.director}`, { signal: controller.signal })
      .then((data) => {
        return data.json()
      }).then((directors) => {
        setDirectors(directors ?? [])
      }).catch((err) => {
        console.log(err)
      })

    return () => controller.abort()
  }, [filters.director])


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
  function HandleDirectorTextChange(e: any) {
    filters.setDirector(e.target.value)
  }

  return (
    <div className='filter grid-cont'>
      <div className='grid-cont bg-2 shadowed'>
        <label className='text-header'>Жанрове (комбинирано)</label>
        <HR />
        <div className='grid-cont grid-cols-2 bg-2 pad-0 marg-0 '>
          {genres.map((val, idx) => {
            return <InputWithLabel labelVal={val} type="checkbox" key={idx} value={val} onChange={HandleSelectGenres} />
          })}
        </div>
      </div>
      <div className='grid-cont bg-2 shadowed'>
        <InputWithLabel labelVal='БГ Аудио' type='checkbox' checked={filters.bgAudio} onChange={(e: any) => filters.setBgAudio(e.target.checked)} />
        <InputWithLabel labelVal='БГ Субтитри' type='checkbox' checked={filters.bgSubs} onChange={(e: any) => filters.setBgSubs(e.target.checked)} />
      </div>
      <SortingPanel setSortCriteria={filters.setSortCriteria} />
      <div className='grid-cont bg-2 shadowed'>
        <InputWithLabel className='grid' labelVal='След година' type='number' value={filters.fromYear} onChange={(e: any) => filters.setFromYear(parseInt(e.target.value))} defaultValue={0} />
      </div>
      <div className='grid-cont bg-2 shadowed'>
        <InputWithLabel className='grid' labelVal='Минимален рейтинг' type='number' value={filters.minRating} onChange={(e: any) => filters.setMinRating(parseFloat(e.target.value))} defaultValue={0} />
      </div>
      <InputWithSuggestions labelString="С участието на " value={filters.actor} handleChangeValue={HandleActorTextChange} suggestions={actors} />
      <InputWithSuggestions labelString="Режисьор" value={filters.director} handleChangeValue={HandleDirectorTextChange} suggestions={directors} />
    </div >
  )
}

function InputWithSuggestions({ labelString, value, handleChangeValue, suggestions }:
  { labelString: string, value: string, handleChangeValue: any, suggestions: string[] }) {

  return (
    <div className='grid-cont bg-2 shadowed'>
      <label className='text-header'>
        {labelString}
      </label>
      <input type="text" value={value} onChange={handleChangeValue} />
      {suggestions.length > 0 && value.length > 2 && suggestions.map((suggestion: any, idx) => {
        return <span key={idx}>{suggestion}</span>
      })}
    </div>
  )
}

function SortingPanel({ setSortCriteria }: any) {
  function HandleChange(e: any) {
    setSortCriteria(e.target.value)
  }
  return (
    <form className='grid-cont bg-2 shadowed' onChange={HandleChange}>
      <fieldset>
        <legend className='text-header'>Сортиране</legend>
        <InputWithLabel labelVal='Не сортирай' type='radio' name='sort' value={SortingCriteria.SortSkip.toString()} defaultChecked={true} />
        <InputWithLabel labelVal='Рейтинг низходящо' type='radio' name='sort' value={SortingCriteria.SortRatingDescending.toString()} />
        <InputWithLabel labelVal='Рейтинг възходящо' type='radio' name='sort' value={SortingCriteria.SortRatingAscending.toString()} />
        <InputWithLabel labelVal='Година низходящо' type='radio' name='sort' value={SortingCriteria.SortRatingDescending.toString()} />
        <InputWithLabel labelVal='Година възходящо' type='radio' name='sort' value={SortingCriteria.SortYearAscending.toString()} />
      </fieldset>
    </form >
  )
}

function InputWithLabel({ labelVal, type, name, value, checked, onChange, defaultValue, defaultChecked, className }:
  {
    labelVal: string, type?: string, name?: string, value?: string | number,
    checked?: boolean, onChange?: any, defaultValue?: string | number, defaultChecked?: boolean, className?: string
  }) {
  return (
    <label className={className + " text-header"}>
      {labelVal}
      <input type={type} name={name} value={value} checked={checked} onChange={onChange} defaultValue={defaultValue} defaultChecked={defaultChecked} />
    </label>
  )
}

function TriggerOnVisible({ setPage }: { setPage: React.Dispatch<React.SetStateAction<number>> }) {
  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useOnScreen(ref, '600px')

  useEffect(() => {
    if (isVisible) {
      setPage((p) => p + 1)
    }
  }, [isVisible])

  return (
    <div ref={ref}></div>
  )
}

function useOnScreen(ref: any, rootMargin: string) {
  const [isIntersecting, setIntersecting] = useState(false)

  const observer = useMemo(() => new IntersectionObserver(
    ([entry]) => setIntersecting(entry.isIntersecting)
    , { rootMargin }), [ref])


  useEffect(() => {
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return isIntersecting
}

function HR() {
  return (
    <hr style={{
      color: 'black',
      backgroundColor: 'black',
      height: "0.5px",
      width: "100%"
    }}></hr>
  )
}

export default App
