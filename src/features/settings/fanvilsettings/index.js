import moment from "moment"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import CryptoJS from "crypto-js";
import TitleCard from "../../../components/Cards/TitleCard"
import { showNotification } from '../../common/headerSlice'
import InputText from '../../../components/Input/InputText'
import ToogleInput from '../../../components/Input/ToogleInput'
import { SetLocalStorage } from "../../common/baseLocalstorage"
import { openLink } from "../../../components/Functions/outils"
const Text = ({ children }) => <span>{children}</span>

function FanvilSettings(){
    const getObjFanvil = JSON.parse(localStorage.getItem('wazo_plugin_rps'))
    const INITIAL_FANVIL_OBJ = {
        id: "",
        secret: "",
        enabled: false
    }
    if (getObjFanvil !== null) {
        INITIAL_FANVIL_OBJ.id = getObjFanvil.settings.fanvil.id
        INITIAL_FANVIL_OBJ.secret = getObjFanvil.settings.fanvil.secret
        INITIAL_FANVIL_OBJ.enabled = getObjFanvil.settings.fanvil.enabled
    }

    const dispatch = useDispatch()
    const [fanvilFormObj, setFanvilFormObj] = useState(INITIAL_FANVIL_OBJ)
    
    const doubleMD5 = (value) => {
        const firstHash = CryptoJS.MD5(value).toString();
        return CryptoJS.MD5(firstHash).toString();
    };

    const updateProfile = () => {
        if (getObjFanvil !== null) {
            if (!fanvilFormObj.id || !fanvilFormObj.secret) {
                dispatch(showNotification({ message: "Merci de saisir tout les champs", status: 0 }))
            } else {
                const concernedObj = getObjFanvil.settings.fanvil
                concernedObj.id = fanvilFormObj.id
                concernedObj.secret = fanvilFormObj.secret
                concernedObj.enabled = fanvilFormObj.enabled
                concernedObj.b64 = btoa(`${fanvilFormObj.id}:${doubleMD5(fanvilFormObj.secret)}`);
                //on supprimer le token existant si Disabled
                (fanvilFormObj.enabled === false) ? concernedObj.token = "" : console.log(true);

                localStorage.setItem('wazo_plugin_rps', JSON.stringify(getObjFanvil))
                dispatch(showNotification({ message: "Profil Fanvil Mis à jour", status: 1 }))
            }
        } else {
            dispatch(SetLocalStorage())
            dispatch(updateProfile())
        }   
    }

    const updateFormValue = ({updateType, value}) => {
        setFanvilFormObj({...fanvilFormObj, [updateType]: value})
        console.log(updateType)
    }

    return(
        <>
            
            <TitleCard title="Fanvil | Réglages RPS (Beta)" topMargin="mt-2"
                TopSideButtons={
                    <ToogleInput 
                        containerStyle={"flex justify-end"} 
                        toggleStyle={"success"} 
                        labelStyle={"font-bold"} 
                        labelTitle="Activer" 
                        defaultValue={INITIAL_FANVIL_OBJ.enabled} 
                        updateType="enabled" 
                        updateFormValue={updateFormValue} 
                    />
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-10">
                    <Text>
                        Afin de pouvoir utiliser le service RPS, vous devez saisir les informations d'identification de votre compte Fanvil FDPS.
                    </Text>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputText labelStyle={"font-bold"} labelTitle="Nom d'utilisateur" defaultValue={INITIAL_FANVIL_OBJ.id} updateType="id" updateFormValue={updateFormValue} />
                <InputText labelStyle={"font-bold"} type="password" labelTitle="Mot de passe" defaultValue={INITIAL_FANVIL_OBJ.secret} updateType="secret" updateFormValue={updateFormValue} />
                </div>
                <div className="divider" ></div>

                <div className="mt-16">
                    <button className="btn btn-primary float-right" onClick={() => updateProfile()}>Enregistrer</button>
                    <button className="btn btn-disable float-right mr-10" onClick={() => openLink("https://fdps.fanvil.com")}>Ouvrir FDPS</button>
                </div>
            </TitleCard>
        </>
    )
}


export default FanvilSettings