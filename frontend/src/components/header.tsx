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
            <div className="flex justify-evenly bg-blue-100 py-2 border-b-2 border-blue-200">
                <ToggleFilter toggled={displayFilter} handleClick={handleToggleFilter} />
                <input
                    className="text-center px-10 py-1 rounded-lg border-2 border-blue-200"
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
            <div className="lg:hidden w-8 h-[5px] bg-gray-600"></div>
            <div className="lg:hidden w-8 h-[5px] bg-gray-600"></div>
            <div className="lg:hidden w-8 h-[5px] bg-gray-600"></div>
        </div>
    )
}
