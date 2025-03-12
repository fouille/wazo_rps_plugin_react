import moment from "moment"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import TitleCard from "../../../components/Cards/TitleCard"
import { showNotification } from '../../common/headerSlice'
import InputText from '../../../components/Input/InputText'
// import TextAreaInput from '../../../components/Input/TextAreaInput'
import ToogleInput from '../../../components/Input/ToogleInput'

function GigasetSettings(){


    const dispatch = useDispatch()

    // Call API to update profile settings changes
    const updateProfile = () => {
        dispatch(showNotification({message : "Profile Updated", status : 1}))    
    }

    const updateFormValue = ({updateType, value}) => {
        console.log(updateType)
    }

    return(
        <>
            
            <TitleCard title="Configuration (Non disponible actuellement)" topMargin="mt-2">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputText disabled labelTitle="AccessKey ID" defaultValue="xxxxxxxxxx" updateFormValue={updateFormValue}/>
                    <InputText disabled labelTitle="AccessKey Secret" defaultValue="xxxxxxxxxxxx" updateFormValue={updateFormValue}/>
                    {/* <InputText labelTitle="Title" defaultValue="UI/UX Designer" updateFormValue={updateFormValue}/>
                    <InputText labelTitle="Place" defaultValue="California" updateFormValue={updateFormValue}/>
                    <TextAreaInput labelTitle="About" defaultValue="Doing what I love, part time traveller" updateFormValue={updateFormValue}/> */}
                </div>
                <div className="divider" ></div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    {/* <InputText labelTitle="Language" defaultValue="English" updateFormValue={updateFormValue}/>
                    <InputText labelTitle="Timezone" defaultValue="IST" updateFormValue={updateFormValue}/>
                    <ToogleInput updateType="syncData" labelTitle="Sync Data" defaultValue={true} updateFormValue={updateFormValue}/> */}
                    <ToogleInput disabled updateType="Activer" labelTitle="Activer" defaultValue={false} updateFormValue={updateFormValue}/>
                </div>
                

                <div className="mt-16"><button disabled className="btn btn-primary float-right" onClick={() => updateProfile()}>Enregistrer</button></div>
            </TitleCard>
        </>
    )
}


export default GigasetSettings