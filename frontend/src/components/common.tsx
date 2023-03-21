export function TextField({ header, text, cN: className }: { header: string, text: string, cN?: string }) {

    return (
        <>
            {text?.length > 0 ?
                <div className={className}>
                    <span className="text-header">{header}: </span>
                    <span>{text}</span>
                </div> :
                <></>
            }
        </>
    )
}

export function InputWithSuggestions({ labelString, value, handleChangeValue, suggestions }:
    { labelString: string, value: string, handleChangeValue: any, suggestions: string[] }) {

    return (
        <div className='grid-cont bg-2 shadowed'>
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

export function InputWithLabel({ labelVal, type, name, value, checked, onChange, defaultValue, defaultChecked, className }:
    {
        labelVal: string, type?: string, name?: string, value?: string | number,
        checked?: boolean, onChange?: any, defaultValue?: string | number, defaultChecked?: boolean, className?: string
    }) {
    return (
        <label className={className + " text-header"}>
            {labelVal}
            <input type={type} name={name} value={value} checked={checked} onChange={onChange} defaultValue={defaultValue} defaultChecked={defaultChecked} />
        </label>
    )
}

export function Tag({ value, className }: { value: string, className?: string }) {
    return (
        <div className={["pad-5px br-6px marg-2px text-header", className].join(" ")}>
            {value}
        </div>
    )
}


export function HR() {
    return (
        <hr style={{
            color: 'black',
            backgroundColor: 'black',
            height: "0.5px",
            width: "100%"
        }}></hr>
    )
}
