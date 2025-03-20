import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import InputText from '../../../components/Input/InputText'
import TextAreaInput from "../../../components/Input/TextAreaInput"
import SelectBox from '../../../components/Input/SelectBox'
import ErrorText from '../../../components/Typography/ErrorText'
import { formatMacAddress, stackServerProvdURL, transformData } from '../../../components/Functions/outils'
import { YealinkPostDevice } from "../../settings/yealinksettings/components/postDevices"
import { wazoCreateDevice } from "../../settings/wazosettings/WazoCallFunction"
import { parseBrands } from "../../../components/Functions/parseBrands"
import { getLeadsContent } from "../leadSlice"
import { setLoading } from "../../common/loadingSlice"
import { openModal } from "../../common/modalSlice"
import { MODAL_BODY_TYPES } from "../../../utils/globalConstantUtil"
import { showNotification } from "../../common/headerSlice"
import { YealinkGetServers } from "../../settings/yealinksettings/components/getServers"

const INITIAL_LEAD_OBJ = {
    brands: [],
    brand: "",
    mac: "",
    uniqueServerUrl: "",
    serverId: ""
}

function AddLeadModalBody({ closeModal }) {
    const dispatch = useDispatch()
    //si présent en localstorage on ajoute la valeur de url de provd dans le lead object par defaut
    const dataStorage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    const brands = parseBrands(dataStorage.settings)
    INITIAL_LEAD_OBJ.uniqueServerUrl = stackServerProvdURL(dataStorage)
    INITIAL_LEAD_OBJ.brands = brands
    ////
    const [loading, setLoader] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [leadObj, setLeadObj] = useState(INITIAL_LEAD_OBJ)
    const [ServerLeadObj, setServerLeadObj] = useState([])

    const fetchListServers = async () => {
        setLoader(true)
        await YealinkGetServers(dispatch)
            .then(data => {
                const transformedData = data.map(server => ({
                    name: server.serverName,
                    value: server.id
                }))
                setServerLeadObj(transformedData)
                setLoader(false)
            })
    }

    useEffect(()=> {
        if (leadObj.brand === "yealink") {
            fetchListServers()
        }

    }, [leadObj.brand])

    const saveNewLead = async () => {
        if (leadObj.mac.trim() === "") return setErrorMessage("MAC is required!")
        else if (leadObj.uniqueServerUrl.trim() === "") return setErrorMessage("URL is required!")
        else if (leadObj.brand.trim() === "") return setErrorMessage("Constructeur requis!")
        else {
            closeModal()
            const sendDeviceInfo = {
                mac: formatMacAddress(leadObj.mac),
                uniqueServerUrl: (leadObj.serverId)? "" : leadObj.uniqueServerUrl,
                brand: leadObj.brand,
                serverId: leadObj.serverId,
                tenantUUID: dataStorage.global.stackTenantUUID,
                tokenUUID: dataStorage.global.stackToken,
                domainURL: dataStorage.global.stackDomain
            }

            if (leadObj.brand === "yealink") {
                // console.log(sendDeviceInfo);
                const devices = transformData(sendDeviceInfo)
                dispatch(setLoading(true)) // Définir loading sur true avant les appels asynchrones

                try {
                    const ycd = await YealinkPostDevice(devices, dispatch)
                    dispatch(showNotification({ message: "Création des appareils Dans Wazo en cours...", status: 1 }));
                    const wcd = await wazoCreateDevice(devices, dispatch)
                    dispatch(showNotification({ message: "Création des appareils Dans Wazo Terminé", status: 1 }));
                    console.log("YCD", ycd);
                    console.log("WCD", wcd);


                    const combinedResults = [...ycd, ...wcd].sort((a, b) => a.mac.localeCompare(b.mac))
                    // Transformer les résultats pour masquer la deuxième clé MAC si elle est identique à la précédente
                    // Cela permet de ne pas afficher la même erreur pour chaque appareil sur le modal d'erreur
                    const transformedResults = combinedResults.map((result, index, array) => {
                        if (index > 0 && result.mac === array[index - 1].mac) {
                            return {
                                ...result,
                                mac: ""
                            };
                        }
                        return result;
                    });

                    if (transformedResults.length > 0) {
                        dispatch(openModal({
                            title: "Erreur.s lors de l'ajout",
                            bodyType: MODAL_BODY_TYPES.ERROR,
                            size: 'lg',
                            extraObject: { errors: transformedResults }
                        }));
                    }

                    // dispatch(getLeadsContent())
                } catch (error) {
                    setErrorMessage("Une erreur s'est produite lors de la création du périphérique.")
                } finally {
                    dispatch(getLeadsContent())
                }

            } else {
                return setErrorMessage("Constructeur non validé")
            }

        }
    }

    const updateFormValue = ({ updateType, value }) => {

        setLeadObj({ ...leadObj, [updateType]: value });
        
    };

    return (
        <>

            <TextAreaInput type="text" defaultValue={leadObj.mac} updateType="mac" containerStyle="mt-4" labelTitle="Adresse MAC" labelDescription="Pour un import de masse, les séparateurs espace, virgule et point-virgule sont acceptés" updateFormValue={updateFormValue} />

            <InputText disabled={!!leadObj.serverId} type="text" defaultValue={leadObj.uniqueServerUrl} updateType="uniqueServerUrl" containerStyle="mt-4" labelTitle="URL de provisionning" updateFormValue={updateFormValue} />

            <SelectBox options={leadObj.brands} defaultValue={leadObj.brand} updateType="brand" containerStyle="w-full mt-4" labelStyle={"text-base-content"} labelTitle="Constructeur" labelDescription="Ceci vous permet de choisir le bon serveur RPS" placeholder="Choisir" updateFormValue={updateFormValue} />

            {
                leadObj.brand === "yealink" ? (
                    <>
                        <SelectBox 
                        options={ServerLeadObj} 
                        defaultValue={leadObj.serverId} 
                        updateType="serverId" 
                        containerStyle="w-full mt-4" 
                        labelStyle={"text-base-content"} 
                        labelTitle="Serveur profil" 
                        labelDescription="Choix du modèle serveur Yealink pré-configuré" 
                        placeholder="Aucun" 
                        updateFormValue={updateFormValue} 
                        loading={loading}
                        />
                    </>
                    ) : ""
                
            }

            <ErrorText styleClass="mt-16">{errorMessage}</ErrorText>
            <div className="modal-action">
                <button className="btn btn-ghost" onClick={() => closeModal()}>Quitter</button>
                <button className="btn btn-primary px-6" onClick={() => saveNewLead()}>Enregistrer</button>
            </div>
        </>
    )
}

export default AddLeadModalBody