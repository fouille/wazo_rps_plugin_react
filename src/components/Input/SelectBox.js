
import axios from 'axios'
import capitalize from 'capitalize-the-first-letter'
import React, { useState, useEffect } from 'react'
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon'


function SelectBox(props){
    
    const {labelTitle, labelDescription, defaultValue, containerStyle, placeholder, labelStyle, options, updateType, updateFormValue, loading} = props

    const [value, setValue] = useState(defaultValue || "")


    const updateValue = (newValue) => {
        const selectedOption = options.find(option => option.value === newValue);
        updateFormValue({ updateType, value: newValue, name: selectedOption ? selectedOption.name : '' });
        setValue(newValue);
    };


    return (
        <div className={`inline-block ${containerStyle}`}>
            <label  className={`label  ${labelStyle}`}>
                <div className="label-text">{labelTitle} 
                {labelDescription && <div className="tooltip tooltip-right" data-tip={labelDescription}><InformationCircleIcon className='w-4 h-4'/></div>}
                </div>
            </label>
            
            <select className="select select-bordered w-full" 
                value={value} 
                onChange={(e) => updateValue(e.target.value)}
                disabled={loading}
                >
                {loading ? (
                <option value="">Chargement...</option> // Affichage du loader
                ) : (
                    <>
                    <option value="">{placeholder}</option>
                    {
                        options.map((o, k) => {
                            return <option value={o.value || o.name} key={k}>{o.name}</option>
                        })
                    }
                    </>
                )}
            </select>
        </div>
    )
}

export default SelectBox
