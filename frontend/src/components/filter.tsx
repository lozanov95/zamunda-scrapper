import { useState, useEffect } from "react"
import { HR, InputWithLabel, InputWithSuggestions } from "./common"
import { Filters, SortingCriteria } from "./types"

export function FilterSection({ filters, domain }: { filters: Filters, domain: string }) {
    const [genres, setGenres] = useState<string[]>([])
    const [actors, setActors] = useState<string[]>([])
    const [directors, setDirectors] = useState<string[]>([])

    useEffect(() => {
        fetch(`${domain}/genres`).then((data) => {
            return data.json()
        }).then((newMovies) => {
            setGenres(newMovies)
        }).catch((err) => {
            console.log(err)
        })
    }, [])

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


    function HandleSelectGenres(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.checked) {
            filters.setSelectedGenres((g) => [...g, e.target.value])
            return
        }
        filters.setSelectedGenres((g) => g.filter((v) => v != e.target.value))
    }

    function HandleActorTextChange(e: any) {
        filters.setActor(e.target.value)
    }
    function HandleDirectorTextChange(e: any) {
        filters.setDirector(e.target.value)
    }

    return (
        <div className='grid-col-1 grid-cont w-100'>
            <div className='grid-cont bg-2 shadowed w-90'>
                <label className='text-header'>Жанрове (комбинирано)</label>
                <HR />
                <div className='grid-cont grid-cols-2 bg-2 pad-0 marg-0 justify-items-right'>
                    {genres.map((val, idx) => {
                        return <InputWithLabel labelVal={val} type="checkbox" key={idx} value={val} onChange={HandleSelectGenres} />
                    })}
                </div>
            </div>
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
            <InputWithSuggestions labelString="С участието на " value={filters.actor} handleChangeValue={HandleActorTextChange} suggestions={actors} />
            <InputWithSuggestions labelString="Режисьор" value={filters.director} handleChangeValue={HandleDirectorTextChange} suggestions={directors} />
        </div >
    )
}

export function SortingPanel({ setSortCriteria }: any) {
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
