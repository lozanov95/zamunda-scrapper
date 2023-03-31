
export function HeaderSection({ title, setTitle, displayFilter, setDisplayFilter }:
    {
        title: string,
        setTitle: React.Dispatch<React.SetStateAction<string>>,
        displayFilter: boolean,
        setDisplayFilter: React.Dispatch<React.SetStateAction<boolean>>
    }) {
    function handleToggleFilter() {
        setDisplayFilter((displayFilter) => !displayFilter)
    }

    return (
        <div className='header-section grid-row-start-1 inline-flex-sm'>
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
