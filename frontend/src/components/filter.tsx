import { useState, useEffect, SetStateAction, KeyboardEvent } from "react"
import { InputWithLabel, NumberWithLabel, ToggleablePanel } from "./common"
import { SortingCriteria } from "./types"
import useFetch from "../hooks/useFetch"
import InputWithPredictions from "./InputWithPredictions"

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
    const { data, loading } = useFetch(`${domain}/genres`)

    function HandleSelectGenres(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.checked) {
            setSelectedGenres((g) => [...g, e.target.value])
            return
        }
        setSelectedGenres((g) => g.filter((v) => v != e.target.value))
    }
    return (
        <ToggleablePanel label="Жанрове (комбинирано)" className="grid-cols-2">
            {loading ? <div>loading...</div> :
                data && data.map((val: string, idx: number) => {
                    return <InputWithLabel labelVal={val} type="checkbox" key={idx} value={val} onChange={HandleSelectGenres} />
                })}
        </ToggleablePanel>
    )
}

function SortingPanel({ setSortCriteria }: any) {
    function HandleChange(e: any) {
        setSortCriteria(e.target.value)
    }

    return (
        <ToggleablePanel label="Сортиране" onChange={HandleChange}>
            <InputWithLabel labelVal='Не сортирай' type='radio' name='sort' value={SortingCriteria.SortSkip.toString()} defaultChecked={true} />
            <InputWithLabel labelVal='Рейтинг низходящо' type='radio' name='sort' value={SortingCriteria.SortRatingDescending.toString()} />
            <InputWithLabel labelVal='Рейтинг възходящо' type='radio' name='sort' value={SortingCriteria.SortRatingAscending.toString()} />
            <InputWithLabel labelVal='Година низходящо' type='radio' name='sort' value={SortingCriteria.SortYearDescending.toString()} />
            <InputWithLabel labelVal='Година възходящо' type='radio' name='sort' value={SortingCriteria.SortYearAscending.toString()} />
        </ToggleablePanel>
    )
}

function ActorsPanel({ domain, actor, setActor }: { domain: string, actor: string, setActor: React.Dispatch<SetStateAction<string>> }) {
    const { data } = useFetch(`${domain}/actors?contains=${actor}`)

    function handlePredictionClick(val: string) {
        setActor(val)
    }

    return (
        <label className="text-header">
            С участието на
            <InputWithPredictions
                predictions={data ?? []}
                value={actor}
                handlePredictionClick={handlePredictionClick}
                onChange={(e) => setActor(e.target.value)}
            />
        </label>
    )
}

function DirectorsPanel({ domain, director, setDirector }: { domain: string, director: string, setDirector: React.Dispatch<SetStateAction<string>> }) {
    const { data } = useFetch(`${domain}/directors?contains=${director}`)
    function handlePredictionClick(val: string) {
        setDirector(val)
    }

    return (
        <label className="text-header">
            Режисьор
            <InputWithPredictions
                predictions={data ?? []}
                value={director}
                handlePredictionClick={handlePredictionClick}
                onChange={(e) => setDirector(e.target.value)}
            />
        </label>
    )
}
