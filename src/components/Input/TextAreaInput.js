import { useState } from "react"
import InformationCircleIcon from "@heroicons/react/24/outline/InformationCircleIcon"


function TextAreaInput({labelTitle, labelDescription, labelStyle, type, containerStyle, defaultValue, placeholder, updateFormValue, updateType}){

    const [value, setValue] = useState(defaultValue)

    const updateInputValue = (val) => {
        setValue(val)
        updateFormValue({updateType, value : val})
    }

    return(
        <div className={`form-control w-full ${containerStyle}`}>
            <label className="label">
                <span className={"label-text text-base-content " + labelStyle}>{labelTitle} 
                    {labelDescription && <div className="tooltip tooltip-right" data-tip={labelDescription}><InformationCircleIcon className='w-4 h-4'/></div>}
                </span>
            </label>
            <textarea value={value} className="textarea textarea-bordered w-full" placeholder={placeholder || ""} onChange={(e) => updateInputValue(e.target.value)}></textarea>
        </div>
    )
}


export default TextAreaInput