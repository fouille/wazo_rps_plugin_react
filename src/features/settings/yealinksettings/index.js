import { useState } from "react"
import { useDispatch } from "react-redux"
import TitleCard from "../../../components/Cards/TitleCard"

import { showNotification } from '../../common/headerSlice'
import InputText from '../../../components/Input/InputText'
import ToogleInput from '../../../components/Input/ToogleInput'
import { SetLocalStorage } from "../../common/baseLocalstorage"


function YealinkSettings() {
    const getObjYealink = JSON.parse(localStorage.getItem('wazo_plugin_rps'))

    const INITIAL_YEALINK_OBJ = {
        id: "",
        secret: "",
        enabled: false
    }
    if (getObjYealink !== null) {
        INITIAL_YEALINK_OBJ.id = getObjYealink.settings.yealink.id
        INITIAL_YEALINK_OBJ.secret = getObjYealink.settings.yealink.secret
        INITIAL_YEALINK_OBJ.enabled = getObjYealink.settings.yealink.enabled
    }


    const dispatch = useDispatch()
    const [yealinkFormObj, setyealinkFormObj] = useState(INITIAL_YEALINK_OBJ)

    // Call API to update profile settings changes
    const updateProfile = async () => {
        if (getObjYealink !== null) {
            if (!yealinkFormObj.id || !yealinkFormObj.secret) {
                dispatch(showNotification({ message: "Merci de saisir les champs ID et Secret", status: 0 }))
            } else {
                const concernedObj = getObjYealink.settings.yealink
                concernedObj.id = yealinkFormObj.id
                concernedObj.secret = yealinkFormObj.secret
                concernedObj.enabled = yealinkFormObj.enabled
                concernedObj.b64 = btoa(`${yealinkFormObj.id}:${yealinkFormObj.secret}`);
                //on supprimer le token existant si Disabled
                (yealinkFormObj.enabled === false) ? concernedObj.token = "" : console.log(true);

                localStorage.setItem('wazo_plugin_rps', JSON.stringify(getObjYealink))
                dispatch(showNotification({ message: "Profil Yealink Mis à jour", status: 1 }))
            }
        } else {
            dispatch(SetLocalStorage())
            dispatch(updateProfile())
        }
    }

    const openLink = (url) => {
        window.open(url, "_blank")
    }

    const updateFormValue = ({ updateType, value }) => {
        setyealinkFormObj({ ...yealinkFormObj, [updateType]: value });
    };

    const Text = ({ children }) => <span>{children}</span>

    return (
        <>

            <TitleCard 
                title="Yealink | Réglages RPS" topMargin="mt-2" 
                TopSideButtons={
                    <ToogleInput 
                        containerStyle={"flex justify-end"} 
                        toggleStyle={"success"} 
                        labelStyle={"font-bold"} 
                        labelTitle="Activer" 
                        defaultValue={INITIAL_YEALINK_OBJ.enabled} 
                        updateType="enabled" 
                        updateFormValue={updateFormValue} 
                    />
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-10">
                <Text>
                    Afin de pouvoir utiliser le service RPS, vous devez saisir les informations d'identification de votre compte Yealink.
                </Text>
                <Text>
                    Retrouvez ces informations dans votre espace YMCS <b>System &gt; Integration &gt; API</b>.
                </Text>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputText labelStyle={"font-bold"} labelTitle="AccessKey ID" defaultValue={INITIAL_YEALINK_OBJ.id} updateType="id" updateFormValue={updateFormValue} />
                    <InputText labelStyle={"font-bold"} type="password" labelTitle="AccessKey Secret" defaultValue={INITIAL_YEALINK_OBJ.secret} updateType="secret" updateFormValue={updateFormValue} />
                </div>

                {/* <div className="divider" ></div> */}
                <div className="mt-16">
                    <button className="btn btn-primary float-right" onClick={() => updateProfile()}>Enregistrer</button>
                    <button className="btn btn-disable float-right mr-10" onClick={() => openLink("https://eu.ymcs.yealink.com")}>Ouvrir YMCS</button>
                </div>
            </TitleCard>
        </>
    )
}


export default YealinkSettings