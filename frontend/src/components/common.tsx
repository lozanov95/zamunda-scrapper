import { useRef, useEffect, useState, useMemo } from "react"

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



export function InputWithLabel({ labelVal, type, name, value, checked, onChange, defaultValue, defaultChecked, className }:
    {
        labelVal: string, type?: string, name?: string, value?: string | number,
        checked?: boolean, onChange?: any, defaultValue?: string | number, defaultChecked?: boolean, className?: string
    }) {
    return (
        <label className={["text-header", className].join(" ")}>
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

export function TriggerOnVisible({ setPage }: { setPage: React.Dispatch<React.SetStateAction<number>> }) {
    const ref = useRef<HTMLDivElement>(null)
    const isVisible = useOnScreen(ref, '600px')

    useEffect(() => {
        if (isVisible) {
            setPage((p) => p + 1)
        }
    }, [isVisible])

    return (
        <div ref={ref}></div>
    )
}

function useOnScreen(ref: any, rootMargin: string) {
    const [isIntersecting, setIntersecting] = useState(false)

    const observer = useMemo(() => new IntersectionObserver(
        ([entry]) => setIntersecting(entry.isIntersecting)
        , { rootMargin }), [ref])


    useEffect(() => {
        observer.observe(ref.current)
        return () => observer.disconnect()
    }, [])

    return isIntersecting
}