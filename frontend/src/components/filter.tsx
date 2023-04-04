import { useState, useEffect, SetStateAction, KeyboardEventHandler, EventHandler, KeyboardEvent } from "react"
import { HR, InputWithLabel, NumberWithLabel } from "./common"
import { SortingCriteria } from "./types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCaretDown } from "@fortawesome/free-solid-svg-icons"

export function FilterSection({ domain, setFilterParams, hidden }: { setFilterParams: React.Dispatch<SetStateAction<string>>, domain: string, hidden: boolean }) {
    const [actor, setActor] = useState<string>("")
    const [director, setDirector] = useState<string>("")
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [minRating, setMinRating] = useState<number>(5)
    const [fromYear, setFromYear] = useState<number>(2000)
    const [bgAudio, setBgAudio] = useState<boolean>(false)
    const [bgSubs, setBgSubs] = useState<boolean>(false)
    const [sortCriteria, setSortCriteria] = useState<number>(0)
    const filterParams = `&fromYear=${fromYear}&minRating=${minRating}&actors=${actor.length > 2 ? actor : ""}&directors=${director.length > 2 ? director : ""}&genres=${selectedGenres.join(",")}&bgaudio=${bgAudio ? "1" : "0"}&bgsubs=${bgSubs ? "1" : "0"}&sort=${sortCriteria}`

    useEffect(() => {
        setFilterParams(filterParams)
    }, [filterParams])

    function handleNaN(value: number) {
        if (isNaN(value)) {
            return 0
        }

        return value
    }

    function handleYearChange(e: KeyboardEvent<HTMLInputElement>) {
        const year = parseInt(e.currentTarget.value)
        setFromYear(handleNaN(year))
    }

    function handleRatingChange(e: KeyboardEvent<HTMLInputElement>) {
        const rating = parseFloat(e.currentTarget.value)
        setMinRating(handleNaN(rating))
    }

    return (
        <div className={`grid-cont filter ${hidden ? "slide-out-left" : "slide-in-left-sm"}`} onTransitionEnd={(e) => hidden && e.currentTarget.classList.add("hidden-sm")}>
            <GenresPanel domain={domain} setSelectedGenres={setSelectedGenres} />
            <div className='grid-cont grid-cols-2 bg-2 shadowed w-90-md justify-items-right justify-content-space-around'>
                <InputWithLabel labelVal='БГ Аудио' type='checkbox' checked={bgAudio} onChange={(e: any) => setBgAudio(e.target.checked)} />
                <InputWithLabel labelVal='БГ Субтитри' type='checkbox' checked={bgSubs} onChange={(e: any) => setBgSubs(e.target.checked)} />
            </div>
            <div className='grid-cont bg-2 shadowed w-90-md'>
                <NumberWithLabel className='grid' labelVal='Година' value={fromYear} onChange={handleYearChange} setValue={setFromYear} />
                <NumberWithLabel className='grid' labelVal='Минимален рейтинг' value={minRating} onChange={handleRatingChange} setValue={setMinRating} />
            </div>
            <div className='grid-cont bg-2 shadowed w-90-md'>
                <ActorsPanel domain={domain} actor={actor} setActor={setActor} />
                <DirectorsPanel domain={domain} director={director} setDirector={setDirector} />
            </div>
            <SortingPanel setSortCriteria={setSortCriteria} />
        </div >
    )
}

function GenresPanel({ domain, setSelectedGenres }: { domain: string, setSelectedGenres: React.Dispatch<SetStateAction<string[]>> }) {
    const [genres, setGenres] = useState<string[]>([])
    const [displayGenres, setDisplayGenres] = useState<boolean>(true)

    useEffect(() => {
        fetch(`${domain}/genres`).then((data) => {
            return data.json()
        }).then((newMovies) => {
            setGenres(newMovies)
        }).catch((err) => {
            console.log(err)
        })
    }, [])

    function HandleSelectGenres(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.checked) {
            setSelectedGenres((g) => [...g, e.target.value])
            return
        }
        setSelectedGenres((g) => g.filter((v) => v != e.target.value))
    }

    function ToggleGenres() {
        setDisplayGenres((display) => !display)
    }

    return (
        <div className='grid-cont bg-2 shadowed w-90-md'>
            <label className='text-header'>Жанрове (комбинирано) <FontAwesomeIcon onClick={ToggleGenres} icon={faCaretDown} className={displayGenres ? "rotated" : ""} /></label>
            <HR />
            <div className={`pad-0 marg-0 grid-cont grid-cols-2 bg-2 justify-items-right ${displayGenres ? "toggled-on" : "toggled-off"}`}>
                {genres.map((val, idx) => {
                    return <InputWithLabel labelVal={val} type="checkbox" key={idx} value={val} onChange={HandleSelectGenres} />
                })}
            </div>
        </div>
    )
}

function SortingPanel({ setSortCriteria }: any) {
    const [displaySorting, setDisplaySorting] = useState<boolean>(true)

    function HandleChange(e: any) {
        setSortCriteria(e.target.value)
    }

    function ToggleSorting() {
        setDisplaySorting((displaySorting) => !displaySorting)
    }

    return (
        <div className='grid-cont bg-2 shadowed w-90-md' onChange={HandleChange}>
            <label className='text-header'>Сортиране <FontAwesomeIcon onClick={ToggleSorting} icon={faCaretDown} className={displaySorting ? "rotated" : ""} /></label>
            <HR />
            <div className={`grid-cont bg-2 pad-0 marg-0 justify-items-right ${displaySorting ? "toggled-on" : "toggled-off"}`}>
                <InputWithLabel labelVal='Не сортирай' type='radio' name='sort' value={SortingCriteria.SortSkip.toString()} defaultChecked={true} />
                <InputWithLabel labelVal='Рейтинг низходящо' type='radio' name='sort' value={SortingCriteria.SortRatingDescending.toString()} />
                <InputWithLabel labelVal='Рейтинг възходящо' type='radio' name='sort' value={SortingCriteria.SortRatingAscending.toString()} />
                <InputWithLabel labelVal='Година низходящо' type='radio' name='sort' value={SortingCriteria.SortYearDescending.toString()} />
                <InputWithLabel labelVal='Година възходящо' type='radio' name='sort' value={SortingCriteria.SortYearAscending.toString()} />
            </div>
        </div >
    )
}

function ActorsPanel({ domain, actor, setActor }: { domain: string, actor: string, setActor: React.Dispatch<SetStateAction<string>> }) {
    const [actors, setActors] = useState<string[]>([])

    useEffect(() => {
        const controller = new AbortController()
        fetch(`${domain}/actors?contains=${actor}`, { signal: controller.signal })
            .then((data) => {
                return data.json()
            }).then((actors) => {
                setActors(actors ?? [])
            }).catch((err) => {
                console.log(err)
            })

        return () => controller.abort()
    }, [actor])


    return (
        <InputWithSuggestions labelString="С участието на " value={actor} handleChangeValue={(e: any) => setActor(e.target.value)} suggestions={actors} />
    )
}

function DirectorsPanel({ domain, director, setDirector }: { domain: string, director: string, setDirector: React.Dispatch<SetStateAction<string>> }) {
    const [directors, setDirectors] = useState<string[]>([])

    useEffect(() => {
        const controller = new AbortController()
        fetch(`${domain}/directors?contains=${director}`, { signal: controller.signal })
            .then((data) => {
                return data.json()
            }).then((directors) => {
                setDirectors(directors ?? [])
            }).catch((err) => {
                console.log(err)
            })

        return () => controller.abort()
    }, [director])

    return (
        <InputWithSuggestions labelString="Режисьор" value={director} handleChangeValue={(e: any) => setDirector(e.target.value)} suggestions={directors} />
    )
}

function InputWithSuggestions({ labelString, value, handleChangeValue, suggestions }:
    { labelString: string, value: string, handleChangeValue: any, suggestions: string[] }) {

    function onClick(e: React.MouseEvent<HTMLElement>) {
        handleChangeValue(e)
    }

    const dropdownVisible = () => { return suggestions.length > 0 && value.length > 2 && value !== suggestions[0] }

    return (
        <div className="flex-cont flex-col">
            <label className='text-header'>
                {labelString}
            </label>
            <input type="text" value={value} onChange={handleChangeValue} />
            {dropdownVisible() &&
                <div className="flex-cont flex-col dropdown">
                    {suggestions.map((suggestion: any, idx) => {
                        return <option className="drop-item" value={suggestion} onClick={onClick} key={idx}>{suggestion}</option>
                    })}
                </div>
            }
        </div>
    )
}