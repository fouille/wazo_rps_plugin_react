import moment from "moment"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import TitleCard from "../../../components/Cards/TitleCard"
import { showNotification } from '../../common/headerSlice'
import InputText from '../../../components/Input/InputText'
// import TextAreaInput from '../../../components/Input/TextAreaInput'
import ToogleInput from '../../../components/Input/ToogleInput'
import { SetLocalStorage } from "../../common/baseLocalstorage"

function YealinkSettings(){
    const getObjYealink = JSON.parse(localStorage.getItem('wazo_plugin_rps'))

    const INITIAL_YEALINK_OBJ = {
        id : "",
        secret : "",
        enabled : false
    }
    if (getObjYealink !== null) {
            INITIAL_YEALINK_OBJ.id = getObjYealink.settings.yealink.id
            INITIAL_YEALINK_OBJ.secret = getObjYealink.settings.yealink.secret
            INITIAL_YEALINK_OBJ.enabled = getObjYealink.settings.yealink.enabled
    }


    const dispatch = useDispatch()
    const [yealinkFormObj, setyealinkFormObj] = useState(INITIAL_YEALINK_OBJ)
    // Call API to update profile settings changes
    const updateProfile = () => {
        console.log(yealinkFormObj);
        if (getObjYealink !== null) {
            const concernedObj = getObjYealink.settings.yealink
            concernedObj.id = yealinkFormObj.id
            concernedObj.secret = yealinkFormObj.secret
            concernedObj.enabled = yealinkFormObj.enabled
            concernedObj.b64 = btoa(`${yealinkFormObj.id}:${yealinkFormObj.secret}`);
            //on supprimer le token existant si Disabled
            (yealinkFormObj.enabled === false) ? concernedObj.token = "" : console.log(true);
            ;
            localStorage.setItem('wazo_plugin_rps', JSON.stringify(getObjYealink))
        } else {
            dispatch(SetLocalStorage())
            dispatch(updateProfile())
        }
        
        dispatch(showNotification({message : "Profile Updated", status : 1}))    
    }

    const updateFormValue = ({updateType, value}) => {
        setyealinkFormObj({...yealinkFormObj, [updateType] : value})
        
    }

    return(
        <>
            
            <TitleCard title="Profile Settings" topMargin="mt-2">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputText labelTitle="AccessKey ID" defaultValue={INITIAL_YEALINK_OBJ.id} updateType="id" updateFormValue={updateFormValue}/>
                    <InputText type="password" labelTitle="AccessKey Secret" defaultValue={INITIAL_YEALINK_OBJ.secret} updateType="secret" updateFormValue={updateFormValue}/>
                    {/* <InputText labelTitle="Title" defaultValue="UI/UX Designer" updateFormValue={updateFormValue}/>
                    <InputText labelTitle="Place" defaultValue="California" updateFormValue={updateFormValue}/>
                    <TextAreaInput labelTitle="About" defaultValue="Doing what I love, part time traveller" updateFormValue={updateFormValue}/> */}
                </div>
                <div className="divider" ></div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    {/* <InputText labelTitle="Language" defaultValue="English" updateFormValue={updateFormValue}/>
                    <InputText labelTitle="Timezone" defaultValue="IST" updateFormValue={updateFormValue}/>
                    <ToogleInput updateType="syncData" labelTitle="Sync Data" defaultValue={true} updateFormValue={updateFormValue}/> */}
                    <ToogleInput labelTitle="Activer" defaultValue={INITIAL_YEALINK_OBJ.enabled} updateType="enabled" updateFormValue={updateFormValue}/>
                </div>
                

                <div className="mt-16"><button className="btn btn-primary float-right" onClick={() => updateProfile()}>Enregistrer</button></div>
            </TitleCard>
        </>
    )
}


export default YealinkSettings