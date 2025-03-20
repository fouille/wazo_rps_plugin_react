import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import TitleCard from "../../../components/Cards/TitleCard"
import { showNotification } from '../../common/headerSlice'
import InputText from '../../../components/Input/InputText'
// import TextAreaInput from '../../../components/Input/TextAreaInput'
import ToogleInput from '../../../components/Input/ToogleInput'
import { SetLocalStorage } from "../../common/baseLocalstorage"

function WazoSettings(){
    const getStorage = JSON.parse(localStorage.getItem('wazo_plugin_rps'))

    const INITIAL_WAZO_OBJ = {
        stackProvURL : "",
        stackProvHTTPS : "",
        enabled_https : false,
        customProv : {
            enabledCustom : false,
            stackCustomProvURL : "",
            stackCustomProvHTTPS : "",
            enabledCustom_https : false
        }
    }
    if (getStorage) {
            INITIAL_WAZO_OBJ.stackProvURL = getStorage.global.stackProvSettings.stackProvURL
            INITIAL_WAZO_OBJ.stackProvHTTPS = getStorage.global.stackProvSettings.stackProvHTTPS
            INITIAL_WAZO_OBJ.enabled_https = getStorage.global.stackProvSettings.enabled_https
            INITIAL_WAZO_OBJ.customProv.enabledCustom = getStorage.global.stackProvSettings.customProv.enabledCustom
            INITIAL_WAZO_OBJ.customProv.stackCustomProvURL = getStorage.global.stackProvSettings.customProv.stackCustomProvURL
            INITIAL_WAZO_OBJ.customProv.stackCustomProvHTTPS = getStorage.global.stackProvSettings.customProv.stackCustomProvHTTPS
            INITIAL_WAZO_OBJ.customProv.enabledCustom_https = getStorage.global.stackProvSettings.customProv.enabledCustom_https
    }


    const dispatch = useDispatch()
    const [wazoFormObj, setwazoFormObj] = useState(INITIAL_WAZO_OBJ)

    const updateProfile = () => {
        console.log(wazoFormObj);
        console.log(wazoFormObj.customProv.enabledCustom);
        
        if (getStorage || getStorage.global.stackProvSettings || getStorage.global.stackProvSettings.customProv) {
            const concernedObj = getStorage.global.stackProvSettings
            concernedObj.enabled_https = wazoFormObj.enabled_https
            concernedObj.customProv.enabledCustom = wazoFormObj.customProv.enabledCustom
            concernedObj.customProv.stackCustomProvURL = wazoFormObj.customProv.stackCustomProvURL
            concernedObj.customProv.stackCustomProvHTTPS = wazoFormObj.customProv.stackCustomProvHTTPS
            concernedObj.customProv.enabledCustom_https = wazoFormObj.customProv.enabledCustom_https

            localStorage.setItem('wazo_plugin_rps', JSON.stringify(getStorage))
        } else {
            dispatch(SetLocalStorage())
            dispatch(updateProfile())
        }
        
        dispatch(showNotification({message : "Réglages Wazo mis à jour", status : 1}))    
    }

    //ici les éléments updateType sont envoyées sous forme de tableau car nous en avons besoin pour placer les valeurs parsées dans le localstorage
    const updateFormValue = ({ updateType, value }) => {
        const keys = Array.isArray(updateType) ? updateType : [updateType];
        const updatedFormObj = { ...wazoFormObj };
    
        let obj = updatedFormObj;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
    
        setwazoFormObj(updatedFormObj);
    };

    return(
        <>
            
            <TitleCard title="Wazo | Réglages serveur provisionning" topMargin="mt-2">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-10">
                    Ici les réglages du serveur de provisionning Wazo sont affichés. Vous pouvez activer le provisionning HTTPS par défaut (Ce service doit être activé et installé au préalable sur votre stack).
                </div>
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputText disabled labelTitle="Default HTTP Server URL" defaultValue={INITIAL_WAZO_OBJ.stackProvURL} updateType={["stackProvURL"]} updateFormValue={updateFormValue}/>
                    <InputText disabled labelTitle="Default HTTPS Server URL" defaultValue={INITIAL_WAZO_OBJ.stackProvHTTPS} updateType={["stackProvHTTPS"]} updateFormValue={updateFormValue}/>
                    <ToogleInput disabled={wazoFormObj.customProv.enabledCustom || wazoFormObj.customProv.enabledCustom_https} toggleStyle={"success"} labelStyle={(wazoFormObj.enabled_https)?"font-bold":""} labelTitle="Activer Provisionning HTTPS par défaut" defaultValue={INITIAL_WAZO_OBJ.enabled_https} updateType={["enabled_https"]} updateFormValue={updateFormValue}/>
                </div>
                <div className="divider" ></div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-10">
                    Vous pouvez activer le provisionning personnalisé pour utiliser un serveur de provisionning externe ou avec une URL différente que celle précisée ci-dessus. L'activation du provisionning HTTPS personnalisé nécessite que le provisionning HTTPS en question soit activé sur votre stack.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ToogleInput disabled={wazoFormObj.customProv.enabledCustom_https} toggleStyle={"success"} labelStyle={(wazoFormObj.customProv.enabledCustom)?"font-bold":""} labelTitle="Activer Provisionning Custom" defaultValue={INITIAL_WAZO_OBJ.customProv.enabledCustom} updateType={["customProv", "enabledCustom"]} updateFormValue={updateFormValue}/>
                    <ToogleInput disabled={wazoFormObj.customProv.enabledCustom} toggleStyle={"success"} labelStyle={(wazoFormObj.customProv.enabledCustom_https)?"font-bold":""} labelTitle="Activer Provisionning HTTPS Custom" defaultValue={INITIAL_WAZO_OBJ.customProv.enabledCustom_https} updateType={["customProv", "enabledCustom_https"]} updateFormValue={updateFormValue}/>
                    <InputText disabled={wazoFormObj.customProv.enabledCustom_https || !wazoFormObj.customProv.enabledCustom} labelTitle="Custom HTTP Server URL" defaultValue={INITIAL_WAZO_OBJ.customProv.stackCustomProvURL} updateType={["customProv", "stackCustomProvURL"]} updateFormValue={updateFormValue}/>
                    <InputText disabled={wazoFormObj.customProv.enabledCustom || !wazoFormObj.customProv.enabledCustom_https} labelTitle="Custom HTTPS Server URL" defaultValue={INITIAL_WAZO_OBJ.customProv.stackCustomProvHTTPS} updateType={["customProv", "stackCustomProvHTTPS"]} updateFormValue={updateFormValue}/>
                </div>
                <div className="divider" ></div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-10 mb-10">
                    <strong>Pour information :</strong> L'ensemble des URL de serveur de provisionning configurées ici seront utilisées pour la recherche des périphériques dans les serveurs RPS activés.
                </div>
                <div className="mt-16"><button className="btn btn-primary float-right" onClick={() => updateProfile()}>Enregistrer</button></div>
            </TitleCard>
        </>
    )
}


export default WazoSettings