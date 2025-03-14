import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import InputText from '../../../components/Input/InputText'
import SelectBox from '../../../components/Input/SelectBox'
import ErrorText from '../../../components/Typography/ErrorText'
import { formatMacAddress } from '../../../components/Functions/outils'
import { YealinkPostDevice } from "../../settings/yealinksettings/components/postDevices"
import { wazoCreateDevice } from "../../settings/wazosettings/WazoCallFunction"
import { parseBrands } from "../../../components/Functions/parseBrands"
import { stackServerProvdURL } from "../../../components/Functions/outils"
import { transformData } from "../../../components/Functions/outils"
import { getLeadsContent } from "../leadSlice"

const INITIAL_LEAD_OBJ = {
    brands : [],
    brand : "",
    mac : "",
    uniqueServerUrl : ""
}

function AddLeadModalBody({closeModal}){
    const dispatch = useDispatch()
    //si présent en localstorage on ajoute la valeur de url de provd dans le lead object par defaut
    const dataStorage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    const brands = parseBrands(dataStorage.settings)
    INITIAL_LEAD_OBJ.uniqueServerUrl = stackServerProvdURL(dataStorage)
    INITIAL_LEAD_OBJ.brands = brands
    ////
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [leadObj, setLeadObj] = useState(INITIAL_LEAD_OBJ)

    const saveNewLead = async () => {
        if(leadObj.mac.trim() === "")return setErrorMessage("MAC is required!")
        else if(leadObj.uniqueServerUrl.trim() === "")return setErrorMessage("URL is required!")
        else if(leadObj.brand.trim() === "")return setErrorMessage("Constructeur requis!")
        else{
            const sendDeviceInfo = {
                mac: formatMacAddress(leadObj.mac),
                uniqueServerUrl: leadObj.uniqueServerUrl,
                brand: leadObj.brand,
                tenantUUID: dataStorage.global.stackTenantUUID,
                tokenUUID: dataStorage.global.stackToken,
                domainURL: dataStorage.global.stackDomain
            }

            if (leadObj.brand === "yealink") {
                console.log(sendDeviceInfo);
                const devices = transformData(sendDeviceInfo)
                setLoading(true) // Définir loading sur true avant les appels asynchrones
                try {
                    await YealinkPostDevice(devices, dispatch)
                    await wazoCreateDevice(devices, dispatch)
                    dispatch(getLeadsContent())
                } catch (error) {
                    setErrorMessage("Une erreur s'est produite lors de la création du périphérique.")
                } finally {
                    setLoading(false) // Remettre loading sur false après les appels asynchrones
                }

            }else{
                return setErrorMessage("Constructeur non validé")
            }

            
            // let newLeadObj = {
            //     "id": 1,
            //     "mac": leadObj.mac,
            //     "uniqueServerUrl": leadObj.uniqueServerUrl,
            //     "brand": leadObj.brand,
            //     "button": "disabled"
            // }
            // dispatch(addNewLead({newLeadObj}))
            closeModal()
        }
    }

    const updateFormValue = ({updateType, value}) => {
        setErrorMessage("")
        setLeadObj({...leadObj, [updateType] : value})
    }

    return(
        <>

            <InputText type="text" defaultValue={leadObj.mac} updateType="mac" containerStyle="mt-4" labelTitle="Adresse MAC" updateFormValue={updateFormValue}/>

            <InputText type="text" defaultValue={leadObj.uniqueServerUrl} updateType="uniqueServerUrl" containerStyle="mt-4" labelTitle="URL" updateFormValue={updateFormValue}/>

            <SelectBox options={leadObj.brands} defaultValue={leadObj.brand} updateType="brand" containerStyle="mt-4" labelTitle="Constructeur" labelDescription="Ceci vous permet de choisir le bon serveur RPS" placeholder="Choisir" updateFormValue={updateFormValue}/>


            <ErrorText styleClass="mt-16">{errorMessage}</ErrorText>
            <div className="modal-action">
                <button  className="btn btn-ghost" onClick={() => closeModal()}>Quitter</button>
                <button  className="btn btn-primary px-6" onClick={() => saveNewLead()}>Enregistrer</button>
            </div>
        </>
    )
}

export default AddLeadModalBody