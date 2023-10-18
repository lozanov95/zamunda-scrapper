import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faMinus, faCaretDown } from "@fortawesome/free-solid-svg-icons"
import { useRef, useEffect, useState } from "react"
import useOnScreen from "../hooks/useOnScreen"

export function TextField({ header, text, className }: { header: string, text: string, className?: string }) {

    return (
        <>
            {text?.length > 0 ?
                <div className={className}>
                    <span >{header}: </span>
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
        <label className="flex gap-1 justify-end">
            {labelVal}
            <input
                type={type}
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                defaultValue={defaultValue}
                defaultChecked={defaultChecked}
            />
        </label>
    )
}

export function NumberWithLabel({ labelVal, value, onChange, className, setValue }:
    { labelVal: string, value: number, className?: string, onChange: any, setValue: React.Dispatch<React.SetStateAction<number>> }) {
    function decrement() {
        setValue((val) => val - 1)
    }
    function increment() {
        setValue((val) => val + 1)
    }

    return (
        <label className="flex flex-col text-center gap-1">
            {labelVal}
            <span className="flex gap-2 justify-center items-center">
                <FontAwesomeIcon icon={faMinus} onClick={decrement} />
                <input className="text-center py-1 rounded-lg border-2 border-blue-200" type="number" value={value} onChange={onChange} />
                <FontAwesomeIcon icon={faPlus} onClick={increment} />
            </span>
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

export function ToggleablePanel({ label, children, onChange, className }:
    { label: string, children: React.ReactElement[] | React.ReactElement, onChange?: any, className?: string }) {
    const [toggled, setToggled] = useState<boolean>(true)

    function Toggle() {
        setToggled((toggled) => !toggled)
    }

    return (
        <div className="flex flex-col items-center gap-3 border-2 bg-blue-100 border-blue-200 shadow-md shadow-blue-300 px-6 py-4 rounded-lg w-[100%]">
            <div className="text-lg font-semibold text-center border-b-2 border-blue-200 px-4 flex justify-around items-center gap-2">{label}
                <FontAwesomeIcon
                    onClick={Toggle}
                    icon={faCaretDown}
                    className={`duration-300 ${toggled ? "rotate-180" : "rotate-0"}`}
                />
            </div>
            <HR />
            <div className={`${toggled ? "flex flex-col" : "hidden"} `} onChange={onChange}>
                {children}
            </div>
        </div>
    )
}
