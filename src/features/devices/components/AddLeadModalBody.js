import { useEffect } from "react"
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { useState } from "react"
import { useDispatch } from "react-redux"
import InputText from '../../../components/Input/InputText'
import ErrorText from '../../../components/Typography/ErrorText'
import { showNotification } from "../../common/headerSlice"
import { addNewLead, getLeadsContent } from "../leadSlice"
import { randomString, formatMacAddress } from '../../../components/Functions/outils'
import axios from 'axios'

const INITIAL_LEAD_OBJ = {
    brand : "",
    mac : "",
    uniqueServerUrl : ""
}
const yealinkPostDevice = createAsyncThunk('/devices/add', async (device) => {
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/v2/rps/addDevicesByMac',
        headers: { 
            'Access-Control-Allow-Origin': '*',
            'nonce': `${randomString(32)}`,
            'timestamp': `${Date.now()}`,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('YealinkToken')}`,
        },
        data : JSON.stringify(device),
        mode: 'cors'
    };
    const response =  await axios.request(config)
        .then((response) => {
            console.log("Response from Yealink:", response.data);
            if(response.data.failureCount > 0) { 
                // console.log(response.data.errors[0].errorInfo);
                showNotification({message : response.data, status : 0})
            } else {
                showNotification({message : "Yealink Added!", status : 1})
            }
        })
            .catch((error) => {
            console.log("ERREUR YPD0004: " + error);
        });
    return response;
})

function AddLeadModalBody({closeModal}){
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [leadObj, setLeadObj] = useState(INITIAL_LEAD_OBJ)


    const saveNewLead = () => {
        console.log(leadObj);
        if(leadObj.mac.trim() === "")return setErrorMessage("MAC is required!")
        else if(leadObj.uniqueServerUrl.trim() === "")return setErrorMessage("URL is required!")
        else{
            const sendDeviceInfo = [{
                mac: formatMacAddress(leadObj.mac),
                uniqueServerUrl: leadObj.uniqueServerUrl
            }]
            dispatch(yealinkPostDevice(sendDeviceInfo))
            
            let newLeadObj = {
                "id": 1,
                "mac": leadObj.mac,
                "uniqueServerUrl": leadObj.uniqueServerUrl,
                "brand": leadObj.brand,
                "button": "disabled"
            }
            dispatch(addNewLead({newLeadObj}))
            dispatch(showNotification({message : "New Device Added!", status : 1}))
            closeModal()
            dispatch(getLeadsContent())
        }
    }

    const updateFormValue = ({updateType, value}) => {
        setErrorMessage("")
        setLeadObj({...leadObj, [updateType] : value})
    }

    return(
        <>

            <InputText type="text" defaultValue={leadObj.mac} updateType="mac" containerStyle="mt-4" labelTitle="Adresse MAC" updateFormValue={updateFormValue}/>

            <InputText type="text" defaultValue={leadObj.mac} updateType="uniqueServerUrl" containerStyle="mt-4" labelTitle="URL" updateFormValue={updateFormValue}/>

            <InputText type="text" defaultValue={leadObj.brand} updateType="brand" containerStyle="mt-4" labelTitle="Constructeur" updateFormValue={updateFormValue}/>


            <ErrorText styleClass="mt-16">{errorMessage}</ErrorText>
            <div className="modal-action">
                <button  className="btn btn-ghost" onClick={() => closeModal()}>Quitter</button>
                <button  className="btn btn-primary px-6" onClick={() => saveNewLead()}>Enregistrer</button>
            </div>
        </>
    )
}

export default AddLeadModalBody