
import React, { useState, useEffect } from "react";
import {useDispatch, useSelector} from 'react-redux'
import axios from 'axios'
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_CLOSE_TYPES } from '../../../utils/globalConstantUtil'
import { deleteLead } from '../../devices/leadSlice'
import { YealinkDelDevice } from '../../devices/components/DelLeadFunction'
import { showNotification } from '../headerSlice'
import { getLeadsContent } from '../../devices/leadSlice'

function ConfirmationModalBody({ extraObject, closeModal}){

    const dispatch = useDispatch()

    const { message, type, _id, index} = extraObject

    const proceedWithYes = async() => {
        if(type === CONFIRMATION_MODAL_CLOSE_TYPES.LEAD_DELETE){
            console.log("modal", index);
        
            // Vérifier si index est un tableau, sinon le transformer en tableau
            const array = Array.isArray(index) ? index : [index];
            const newArray = {"deviceIds": array};
            console.log(newArray);
            
            // positive response, call api or dispatch redux function
            await YealinkDelDevice(newArray, dispatch)
                .then((data)=>{
                    dispatch(getLeadsContent());
                })
        }
        closeModal()
    }

    return(
        <> 
        <p className=' text-xl mt-8 text-center'>
            {message}
        </p>

        <div className="modal-action mt-12">
                
                <button className="btn btn-outline   " onClick={() => closeModal()}>Cancel</button>

                <button className="btn btn-primary w-36" onClick={() => proceedWithYes()}>Yes</button> 

        </div>
        </>
    )
}

export default ConfirmationModalBody