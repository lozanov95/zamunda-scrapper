import { useState } from "react"

type SliderProps = {
    label: string,
    min: number,
    max: number,
    value: number,
    onChange: any
    step?: number
}

export default function Slider({ step, value, onChange, max, min, label }: SliderProps) {


    return (
        <label className="flex flex-col items-center gap-1">
            {label}
            <input className="accent-yellow-500 hover:accent-yellow-600" max={max} min={min} value={value} onChange={onChange} step={step} type="range"></input>
            <span className="border-yellow-500 border-2 px-1 rounded text-sm font-bold">{value}</span>
        </label>
    )
}