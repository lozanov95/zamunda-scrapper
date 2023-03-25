import { useEffect, useState } from 'react'
import { FilterSection } from './components/filter'
import { MovieType } from './components/types'
import './App.css'
import { MoviesSection } from './components/movie'


function App() {
  const DOMAIN = "http://localhost"

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

  const URL = `${DOMAIN}/movies?contains=${title}&fromYear=${fromYear}&minRating=${minRating}&actors=${actor.length > 2 ? actor : ""}&directors=${director.length > 2 ? director : ""}&genres=${selectedGenres.join(",")}&page=${page}&bgaudio=${bgAudio ? "1" : "0"}&bgsubs=${bgSubs ? "1" : "0"}&sort=${sortCriteria}`

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
      <FilterSection filters={filters} domain={DOMAIN} />
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



export default App
