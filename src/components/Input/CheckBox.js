import { useState } from "react"


function CheckBox({disabled, type, containerStyle, defaultValue, updateFormValue, updateType}){

    const [value, setValue] = useState(defaultValue)

    const updateToogleValue = () => {
        setValue(!value)
        updateFormValue({updateType, value : !value})
    }

    return(
        <div className={`form-control w-full ${containerStyle}`}>
            {/* <label className="label cursor-pointer">
                <span className={"label-text text-base-content " + labelStyle}>{labelTitle}</span> */}
                <input disabled={disabled} type="checkbox" checked={value}  onChange={(e) => updateToogleValue()}/>
            {/* </label> */}
        </div>
    )
}


export default CheckBox
