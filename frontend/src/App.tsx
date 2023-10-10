import { useEffect, useState } from 'react'
import { FilterSection } from './components/filter'
import { MoviesSection } from './components/movie'
import { HeaderSection } from './components/header'
import './App.css'


function App() {
  const domain = import.meta.env["VITE_DOMAIN"] ?? "http://maimunda.vloz.website"

  const [filterParams, setFilterParams] = useState("")
  const [title, setTitle] = useState<string>("")
  const [displayFilter, setDisplayFilter] = useState<boolean>(false)
  const [displayMovies, setDisplayMovies] = useState<boolean>(true)

  const URL = `${domain}/movies?contains=${title}&${filterParams}`

  useEffect(() => {
    setDisplayFilter(() => window.innerWidth >= 1300 ? true : false)
  }, [])

  return (
    <div className='main-section grid grid-row-3'>
      <HeaderSection title={title} setTitle={setTitle}
        setDisplayFilter={setDisplayFilter}
        displayMovies={displayMovies}
        displayFilter={displayFilter}
        setDisplayMovies={setDisplayMovies}
        URL={URL}
      />
      <FilterSection
        setFilterParams={setFilterParams}
        domain={domain}
        hidden={!displayFilter} />
      <MoviesSection
        hidden={!displayMovies}
        title={title}
        filterParams={filterParams}
        domain={domain} />
    </div>
  )
}


export default App
