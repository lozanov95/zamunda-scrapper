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
        <div onFocus={onFocus} onBlur={onBlur} className="flex gap-2 justify-center">
            <input
                value={value}
                onChange={onChange}
                required={required}
                className="text-center px-10 py-1 rounded-lg border-2 border-blue-200"
            />
            {displayPredictions ?
                <div className="absolute translate-y-9 bg-blue-200 rounded-lg border-2 border-blue-200 shadow-sm shadow-blue-300">
                    {predictions
                        .slice(0, maxPredictions ?? 5)
                        .map((pred, i) =>
                            <div
                                className="hover:bg-blue-300 px-3 py-1 rounded-lg"
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