import { useEffect, useState } from "react"

export function HeaderSection({ title, setTitle, displayFilter, displayMovies, setDisplayFilter, setDisplayMovies, URL, isMobile }:
    {
        title: string,
        isMobile: boolean,
        setTitle: React.Dispatch<React.SetStateAction<string>>,
        displayFilter: boolean,
        displayMovies: boolean,
        setDisplayFilter: React.Dispatch<React.SetStateAction<boolean>>
        setDisplayMovies: React.Dispatch<React.SetStateAction<boolean>>
        URL: string
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
        if (displayMovies && !displayFilter) {
            window.scrollTo(0, 0)
        }
    }, [URL])


    function handleToggleFilter() {
        if (!isMobile) {
            return
        }
        setDisplayFilter((displayFilter) => !displayFilter)
        setDisplayMovies((displayMovies) => !displayMovies)
        if (!displayFilter) {
            setScrollPos({ x: window.scrollX, y: window.scrollY })
        }
    }

    return (
        <div className="sticky top-0 left-0">
            <div className="flex justify-evenly bg-gradient-to-r from-cyan-700 via-cyan-950 to-cyan-700 py-2 border-b-2 border-cyan-900">
                <ToggleFilter toggled={displayFilter} handleClick={handleToggleFilter} />
                {/* bg-[#ece2c3] btn color */}
                <input
                    className="text-center px-6 py-1 rounded border-[3px] bg-gradient-to-t from-yellow-50 to-[#fafaf1] border-yellow-700 placeholder-cyan-800 text-cyan-900 font-semibold"
                    placeholder='търси по заглавие'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div></div>
            </div>
        </div>
    )
}

function ToggleFilter({ handleClick, toggled }: { handleClick: VoidFunction, toggled: boolean }) {
    return (
        <div className="flex flex-col gap-1 place-content-center" onClick={handleClick}>
            <div className={`sm:hidden h-[5px] bg-yellow-600 ${toggled ? "w-8" : "w-8"} duration-300 ease-out`}></div>
            <div className={`sm:hidden h-[5px] bg-yellow-700 ${toggled ? "w-6" : "w-8"} duration-300 ease-out`}></div>
            <div className={`sm:hidden h-[5px] bg-yellow-700 ${toggled ? "w-5" : "w-8"} duration-300 ease-out`}></div>
        </div>
    )
}
