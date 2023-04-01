import { useEffect, useState } from 'react'
import { FilterSection } from './components/filter'
import { MovieType } from './components/types'
import { MoviesSection } from './components/movie'
import { HeaderSection } from './components/header'
import './App.css'


function App() {
  const DOMAIN = "http://maimunda.vloz.website"

  const [filterParams, setFilterParams] = useState("")
  const [title, setTitle] = useState<string>("")
  const [areMorePagesAvailable, setAreMorePagesAvailable] = useState<boolean>(true)
  const [movies, setMovies] = useState<MovieType[]>([])
  const [movieCount, setMovieCount] = useState<number>(0)
  const [page, setPage] = useState<number>(0)
  const [displayFilter, setDisplayFilter] = useState<boolean>(false)
  const [displayMovies, setDisplayMovies] = useState<boolean>(true)

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
      <HeaderSection title={title} setTitle={setTitle} setDisplayFilter={setDisplayFilter} displayFilter={displayFilter} setDisplayMovies={setDisplayMovies} movieCount={movieCount} />
      <FilterSection setFilterParams={setFilterParams} domain={DOMAIN} hidden={!displayFilter} />
      <MoviesSection movies={movies} movieCount={movieCount} setPage={setPage} areMorePagesAvailable={areMorePagesAvailable} hidden={!displayMovies} />
    </div>
  )
}


export default App
