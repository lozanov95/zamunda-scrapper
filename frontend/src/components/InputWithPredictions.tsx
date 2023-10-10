import { ChangeEventHandler, useState } from "react";

export default function InputWithPredictions({ predictions, onChange, value, handlePredictionClick, required, maxPredictions }: {
    predictions: string[],
    value: string,
    onChange: ChangeEventHandler<HTMLInputElement>,
    handlePredictionClick: (selection: string) => void,
    required?: boolean,
    maxPredictions?: number
}) {
    function onBlur() {
        const timeout = setTimeout(() => {
            setIsFocused(false)
        }, 100);
        setTimeoutId(timeout)
    }

    function onFocus() {
        clearTimeout(timeoutId)
        setIsFocused(true)
    }

    const [isFocused, setIsFocused] = useState(false)
    const [timeoutId, setTimeoutId] = useState<number>()
    const valFound = predictions.find((val) => val === value)
    const displayPredictions = isFocused && value.length > 0 && !valFound && predictions.length > 0


    return (
        <div onFocus={onFocus} onBlur={onBlur}>
            <input value={value} onChange={onChange} required={required} />
            {displayPredictions ?
                <div className="suggestions bg-3">
                    {predictions
                        .slice(0, maxPredictions ?? 5)
                        .map((pred, i) =>
                            <div className=""
                                key={i}
                                onClick={() => handlePredictionClick(pred)}
                                onKeyDown={(e) => e.key === "Enter" && handlePredictionClick(pred)}
                                tabIndex={0}>
                                {pred}
                            </div>)}
                </div>
                : ""
            }
        </div>
    )

}