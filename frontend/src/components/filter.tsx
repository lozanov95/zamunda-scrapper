import { useState, useEffect, SetStateAction, memo } from "react"
import { HR, InputWithLabel } from "./common"
import { SortingCriteria } from "./types"

export function FilterSection({ domain, setFilterParams, hidden }: { setFilterParams: React.Dispatch<SetStateAction<string>>, domain: string, hidden: boolean }) {
    const [actor, setActor] = useState<string>("")
    const [director, setDirector] = useState<string>("")
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [minRating, setMinRating] = useState<number>(0)
    const [fromYear, setFromYear] = useState<number>(0)
    const [bgAudio, setBgAudio] = useState<boolean>(false)
    const [bgSubs, setBgSubs] = useState<boolean>(false)
    const [sortCriteria, setSortCriteria] = useState<number>(0)
    const filterParams = `&fromYear=${fromYear}&minRating=${minRating}&actors=${actor.length > 2 ? actor : ""}&directors=${director.length > 2 ? director : ""}&genres=${selectedGenres.join(",")}&bgaudio=${bgAudio ? "1" : "0"}&bgsubs=${bgSubs ? "1" : "0"}&sort=${sortCriteria}`

    useEffect(() => {
        setFilterParams(filterParams)
    }, [filterParams])

    return (
        <div className={`filter${hidden ? " hidden-sm" : ""}`}>
            <div className="grid-cont">
                <GenresPanel domain={domain} setSelectedGenres={setSelectedGenres} />
                <div className='grid-cont bg-2 shadowed w-90 justify-items-right justify-content-space-around'>
                    <InputWithLabel labelVal='БГ Аудио' type='checkbox' checked={bgAudio} onChange={(e: any) => setBgAudio(e.target.checked)} />
                    <InputWithLabel labelVal='БГ Субтитри' type='checkbox' checked={bgSubs} onChange={(e: any) => setBgSubs(e.target.checked)} />
                </div>
                <SortingPanel setSortCriteria={setSortCriteria} />
                <div className='grid-cont bg-2 shadowed w-90'>
                    <InputWithLabel className='grid' labelVal='След година' type='number' value={fromYear} onChange={(e: any) => setFromYear(parseInt(e.target.value))} defaultValue={0} />
                </div>
                <div className='grid-cont bg-2 shadowed w-90'>
                    <InputWithLabel className='grid' labelVal='Минимален рейтинг' type='number' value={minRating} onChange={(e: any) => setMinRating(parseFloat(e.target.value))} defaultValue={0} />
                </div>
                <ActorsPanel domain={domain} actor={actor} setActor={setActor} />
                <DirectorsPanel domain={domain} director={director} setDirector={setDirector} />
            </div>
        </div >
    )
}

function GenresPanel({ domain, setSelectedGenres }: { domain: string, setSelectedGenres: React.Dispatch<SetStateAction<string[]>> }) {
    const [genres, setGenres] = useState<string[]>([])

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

    return (
        <div className='grid-cont bg-2 shadowed w-90'>
            <label className='text-header'>Жанрове (комбинирано)</label>
            <HR />
            <div className='grid-cont grid-cols-2 bg-2 pad-0 marg-0 justify-items-right'>
                {genres.map((val, idx) => {
                    return <InputWithLabel labelVal={val} type="checkbox" key={idx} value={val} onChange={HandleSelectGenres} />
                })}
            </div>
        </div>
    )
}

function SortingPanel({ setSortCriteria }: any) {
    function HandleChange(e: any) {
        setSortCriteria(e.target.value)
    }
    return (
        <form className='grid-cont bg-2 shadowed w-90' onChange={HandleChange}>
            <label className='text-header'>Сортиране</label>
            <HR />
            <div className="grid-cont bg-2 pad-0 marg-0 justify-items-right">
                <InputWithLabel labelVal='Не сортирай' type='radio' name='sort' value={SortingCriteria.SortSkip.toString()} defaultChecked={true} />
                <InputWithLabel labelVal='Рейтинг низходящо' type='radio' name='sort' value={SortingCriteria.SortRatingDescending.toString()} />
                <InputWithLabel labelVal='Рейтинг възходящо' type='radio' name='sort' value={SortingCriteria.SortRatingAscending.toString()} />
                <InputWithLabel labelVal='Година низходящо' type='radio' name='sort' value={SortingCriteria.SortYearDescending.toString()} />
                <InputWithLabel labelVal='Година възходящо' type='radio' name='sort' value={SortingCriteria.SortYearAscending.toString()} />
            </div>
        </form >
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

    return (
        <div className='grid-cont bg-2 shadowed w-90'>
            <label className='text-header'>
                {labelString}
            </label>
            <input type="text" value={value} onChange={handleChangeValue} />
            {suggestions.length > 0 && value.length > 2 && suggestions.map((suggestion: any, idx) => {
                return <span key={idx}>{suggestion}</span>
            })}
        </div>
    )
}