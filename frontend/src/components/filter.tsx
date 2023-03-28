import { useState, useEffect } from "react"
import { HR, InputWithLabel } from "./common"
import { Filters, SortingCriteria } from "./types"

export function FilterSection({ filters, domain }: { filters: Filters, domain: string }) {

    return (
        <div className='filter grid-cont'>
            <GenresPanel domain={domain} filters={filters} />
            <div className='grid-cont bg-2 shadowed w-90 justify-items-right justify-content-space-around'>
                <InputWithLabel labelVal='БГ Аудио' type='checkbox' checked={filters.bgAudio} onChange={(e: any) => filters.setBgAudio(e.target.checked)} />
                <InputWithLabel labelVal='БГ Субтитри' type='checkbox' checked={filters.bgSubs} onChange={(e: any) => filters.setBgSubs(e.target.checked)} />
            </div>
            <SortingPanel setSortCriteria={filters.setSortCriteria} />
            <div className='grid-cont bg-2 shadowed w-90'>
                <InputWithLabel className='grid' labelVal='След година' type='number' value={filters.fromYear} onChange={(e: any) => filters.setFromYear(parseInt(e.target.value))} defaultValue={0} />
            </div>
            <div className='grid-cont bg-2 shadowed w-90'>
                <InputWithLabel className='grid' labelVal='Минимален рейтинг' type='number' value={filters.minRating} onChange={(e: any) => filters.setMinRating(parseFloat(e.target.value))} defaultValue={0} />
            </div>
            <ActorsPanel domain={domain} filters={filters} />
            <DirectorsPanel domain={domain} filters={filters} />
        </div >
    )
}

function GenresPanel({ domain, filters }: { domain: string, filters: Filters }) {
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
            filters.setSelectedGenres((g) => [...g, e.target.value])
            return
        }
        filters.setSelectedGenres((g) => g.filter((v) => v != e.target.value))
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

function ActorsPanel({ domain, filters }: { domain: string, filters: Filters, }) {
    const [actors, setActors] = useState<string[]>([])

    useEffect(() => {
        const controller = new AbortController()
        fetch(`${domain}/actors?contains=${filters.actor}`, { signal: controller.signal })
            .then((data) => {
                return data.json()
            }).then((actors) => {
                setActors(actors ?? [])
            }).catch((err) => {
                console.log(err)
            })

        return () => controller.abort()
    }, [filters.actor])


    return (
        <InputWithSuggestions labelString="С участието на " value={filters.actor} handleChangeValue={(e: any) => filters.setActor(e.target.value)} suggestions={actors} />
    )
}

function DirectorsPanel({ domain, filters }: { domain: string, filters: Filters, }) {
    const [directors, setDirectors] = useState<string[]>([])

    useEffect(() => {
        const controller = new AbortController()
        fetch(`${domain}/directors?contains=${filters.director}`, { signal: controller.signal })
            .then((data) => {
                return data.json()
            }).then((directors) => {
                setDirectors(directors ?? [])
            }).catch((err) => {
                console.log(err)
            })

        return () => controller.abort()
    }, [filters.director])

    return (
        <InputWithSuggestions labelString="Режисьор" value={filters.director} handleChangeValue={(e: any) => filters.setDirector(e.target.value)} suggestions={directors} />
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