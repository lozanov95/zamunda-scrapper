import { useEffect, useState } from "react"

export function HeaderSection({ title, setTitle, displayFilter, setDisplayFilter, setDisplayMovies, movieCount }:
    {
        title: string,
        setTitle: React.Dispatch<React.SetStateAction<string>>,
        displayFilter: boolean,
        setDisplayFilter: React.Dispatch<React.SetStateAction<boolean>>
        setDisplayMovies: React.Dispatch<React.SetStateAction<boolean>>
        movieCount: number
    }) {

    const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (!displayFilter) {
            window.scrollTo(scrollPos.x, scrollPos.y)
        } else {
            window.scrollTo(0, 0)
        }
    }, [displayFilter])

    useEffect(() => {
        setScrollPos({ x: 0, y: 0 })
    }, [movieCount])


    function handleToggleFilter() {
        setDisplayFilter((displayFilter) => !displayFilter)
        setDisplayMovies((displayMovies) => !displayMovies)
        if (!displayFilter) {
            setScrollPos({ x: window.scrollX, y: window.scrollY })
        }
    }

    return (
        <div className='header-section grid-row-start-1 inline-flex'>
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
