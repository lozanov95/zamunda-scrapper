import { useEffect, useState } from 'react'
import { FilterSection } from './components/filter'
import { MovieType } from './components/types'
import './App.css'
import { MoviesSection } from './components/movie'


function App() {
  const DOMAIN = "http://maimunda.vloz.website"

  const [filterParams, setFilterParams] = useState("")
  const [title, setTitle] = useState<string>("")
  const [areMorePagesAvailable, setAreMorePagesAvailable] = useState<boolean>(true)
  const [movies, setMovies] = useState<MovieType[]>([])
  const [movieCount, setMovieCount] = useState<number>(0)
  const [page, setPage] = useState<number>(0)
  const [displayFilter, setDisplayFilter] = useState<boolean>(false)

  const URL = `${DOMAIN}/movies?contains=${title}&${filterParams}`

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
    <div className='main-section grid grid-row-3'>
      <HeaderSection title={title} setTitle={setTitle} setDisplayFilter={setDisplayFilter} displayFilter={displayFilter} />
      <FilterSection setFilterParams={setFilterParams} domain={DOMAIN} hidden={!displayFilter} />
      <MoviesSection movies={movies} movieCount={movieCount} setPage={setPage} areMorePagesAvailable={areMorePagesAvailable} />
    </div>
  )
}

function HeaderSection({ title, setTitle, displayFilter, setDisplayFilter }:
  {
    title: string,
    setTitle: React.Dispatch<React.SetStateAction<string>>,
    displayFilter: boolean,
    setDisplayFilter: React.Dispatch<React.SetStateAction<boolean>>
  }) {
  function handleToggleFilter() {
    setDisplayFilter((displayFilter) => !displayFilter)
  }

  return (
    <div className='header-section grid-row-start-1 inline-flex-sm'>
      <ToggleFilter toggled={displayFilter} handleClick={handleToggleFilter} />
      <input className='header-search' placeholder='търси по заглавие' value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className='flex-1'></div>
    </div >
  )
}

function ToggleFilter({ handleClick, toggled }: { handleClick: VoidFunction, toggled: boolean }) {
  return (
    <div onClick={handleClick} className={`hamburger flex-1${toggled ? " toggled" : ""}`}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export default App
