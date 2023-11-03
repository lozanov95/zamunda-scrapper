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
  const isMobile = window.innerWidth < 768
  const URL = `${domain}/movies?contains=${title}&${filterParams}`

  useEffect(() => {
    setDisplayFilter(() => window.innerWidth >= 1300 ? true : false)
  }, [])

  return (
    <div className='text-gray-800 bg-gradient-to-t from-yellow-200 to-cyan-100 flex flex-col gap-2'>
      <HeaderSection title={title} setTitle={setTitle}
        setDisplayFilter={setDisplayFilter}
        displayMovies={displayMovies}
        displayFilter={displayFilter}
        setDisplayMovies={setDisplayMovies}
        URL={URL}
        isMobile={isMobile}
      />
      <div className='lg:grid grid-cols-5'>
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
    </div>
  )
}


export default App
