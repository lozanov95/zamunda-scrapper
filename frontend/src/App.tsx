import { useEffect, useState } from 'react'
import { FilterSection } from './components/filter'
import { MoviesSection } from './components/movie'
import { HeaderSection } from './components/header'
import './App.css'


function App() {
  const domain = document.baseURI.match(`http:\/\/[^/:]+`)?.[0] ?? "http://maimunda.vloz.website"

  const [filterParams, setFilterParams] = useState("")
  const [title, setTitle] = useState<string>("")
  const [displayFilter, setDisplayFilter] = useState<boolean>(false)
  const [displayMovies, setDisplayMovies] = useState<boolean>(true)
  const isMobile = window.innerWidth < 640
  const URL = `${domain}/movies?contains=${title}&${filterParams}`

  useEffect(() => {
    setDisplayFilter(() => isMobile ? false : true)
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
      <div className='2xl:grid grid-cols-5 flex justify-items-center gap-4 mx-1 lg:m-auto'>
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
