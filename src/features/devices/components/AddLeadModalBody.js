import { useState, useEffect, useContext } from "react"
import { useDispatch } from "react-redux"
import InputText from '../../../components/Input/InputText'
import TextAreaInput from "../../../components/Input/TextAreaInput"
import SelectBox from '../../../components/Input/SelectBox'
// import { Dropdown } from 'primereact/dropdown';
// import { FloatLabel } from 'primereact/floatlabel';
import ErrorText from '../../../components/Typography/ErrorText'
import { formatMacAddress, stackServerProvdURL, transformData } from '../../../components/Functions/outils'
import { YealinkPostDevice } from "../../settings/yealinksettings/components/postDevices"
import { wazoCreateDevice } from "../../settings/wazosettings/components/WazoCallFunction"
import { parseBrands } from "../../../components/Functions/parseBrands"
import { getLeadsContent } from "../leadSlice"
import { setLoading } from "../../common/loadingSlice"
import { openModal, closeModal } from "../../common/modalSlice"
import { MODAL_BODY_TYPES } from "../../../utils/globalConstantUtil"
import { showNotification } from "../../common/headerSlice"
import { YealinkGetServers } from "../../settings/yealinksettings/components/getServers"
import { fanvilRequest, fanvilAddRequest } from "../../settings/fanvilsettings/components/fanvilRequest"
import capitalize from 'lodash/capitalize'
// import { useDevices, DevicesProvider } from './DevicesContext'
// import { use } from "react"

const INITIAL_LEAD_OBJ = {
    brands: [],
    brand: "",
    mac: "",
    uniqueServerUrl: "",
    serverId: ""
}

function AddLeadModalBody({ closeModal, extraObject }) {
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
    // const [selectedServer, setSelectedServer] = useState(null);
    const { setValueLoad, setIsFetching } = extraObject;

    const fetchYealinkListServers = async (brand) => {
        setLoader(true)
        if (brand === "yealink") {
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
        if (brand === "fanvil") {
            await fanvilRequest("listServers", dispatch, { }).then(data => {
                const transformedData = data.map(server => ({
                    name: server,
                    value: server
                }))
                setServerLeadObj(transformedData)
                setLoader(false)
            })
        }
        
    }

    useEffect(()=> {
            fetchYealinkListServers(leadObj.brand)
    }, [leadObj.brand])

    const saveNewLead = async () => {
        if (leadObj.mac.trim() === "") return setErrorMessage("MAC is required!")
        else if (leadObj.uniqueServerUrl.trim() === "") return setErrorMessage("URL is required!")
        else if (leadObj.brand.trim() === "") return setErrorMessage("Constructeur requis!")
        else if (leadObj.serverId.trim() === "" && leadObj.brand === "fanvil") return setErrorMessage("Serveur Profil requis!")
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
                    dispatch(showNotification({ message: "Création des appareils en cours...", status: 1 }));
                    setIsFetching(true)
                    
                    const [ycd, wcd] = await Promise.all([
                        YealinkPostDevice(devices, dispatch, { callback: (progress) => setValueLoad(progress) }),
                        wazoCreateDevice(devices, dispatch, { callback: (progress) => setValueLoad(progress) })
                    ])

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
                } catch (error) {
                    setErrorMessage("Une erreur s'est produite lors de la création du périphérique.")
                } finally {
                    setIsFetching(true)
                    dispatch(getLeadsContent({setValueLoad, setIsFetching}))
                }

            } 
            
            if (leadObj.brand === "fanvil"){
                const devices = transformData(sendDeviceInfo)
                dispatch(setLoading(true)) // Définir loading sur true avant les appels asynchrones

                try {
                    dispatch(showNotification({ message: "Création des appareils en cours...", status: 1 }));
                    setIsFetching(true)
                    
                    const [fcd, wcd] = await Promise.all([
                        fanvilAddRequest(devices, dispatch, { callback: (progress) => setValueLoad(progress) }),
                        wazoCreateDevice(devices, dispatch, { callback: (progress) => setValueLoad(progress) })
                    ])


                    const combinedResults = [...fcd, ...wcd].sort((a, b) => a.mac.localeCompare(b.mac))
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
                } catch (error) {
                    setErrorMessage("Une erreur s'est produite lors de la création du périphérique.")
                } finally {
                    setIsFetching(true)
                    dispatch(getLeadsContent({setValueLoad, setIsFetching}))
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

            <InputText disabled={!!leadObj.serverId || leadObj.brand === 'fanvil'} type="text" defaultValue={leadObj.uniqueServerUrl} updateType="uniqueServerUrl" containerStyle="mt-4" labelTitle="URL de provisionning" updateFormValue={updateFormValue} />

            <SelectBox 
                options={leadObj.brands} 
                defaultValue={leadObj.brand} 
                updateType="brand" 
                containerStyle="w-full mt-4" 
                labelStyle={"text-base-content"} 
                labelTitle="Constructeur" 
                labelDescription="Ceci vous permet de choisir le bon serveur RPS" 
                placeholder="Choisir" 
                updateFormValue={updateFormValue} 
            />
            {/* <FloatLabel className="w-full md:w-14rem">
                <Dropdown 
                    inputId="dd-serverid"
                    value={leadObj.brand}
                    onChange={(e) => {
                        console.log("e.value", e);
                        
                        setLeadObj(e.value)}} 
                    options={leadObj.brands} 
                    optionLabel="name" 
                    checkmark={true} 
                    highlightOnSelect={false}
                    className="w-full md:w-14rem"
                    placeholder="Choisir" 
                />
                <label htmlFor="dd-serverid">Choisir la marque</label>
            </FloatLabel> */}

            {
                leadObj.brand === "yealink" || leadObj.brand === "fanvil" ? (
                    <>
                        <SelectBox 
                        options={ServerLeadObj} 
                        defaultValue={leadObj.serverId} 
                        updateType="serverId" 
                        containerStyle="w-full mt-4" 
                        labelStyle={"text-base-content"} 
                        labelTitle="Serveur profil" 
                        labelDescription={`Choix du modèle serveur ${capitalize(leadObj.brand)} pré-configuré`} 
                        placeholder="Aucun" 
                        updateFormValue={updateFormValue} 
                        loading={loading}
                        />
                        {/* <FloatLabel className="w-full md:w-14rem">
                            <Dropdown 
                                inputId="dd-serverid"
                                value={selectedServer}
                                onChange={(e) => {
                                    console.log("e.value", e);
                                    
                                    setSelectedServer(e.value)}} 
                                options={ServerLeadObj} 
                                optionLabel="name" 
                                editable 
                                // placeholder="Choisir" 
                                className="w-full md:w-14rem"
                                loading={loading}
                                // placeholder="Choisir..."
                            />
                            <label htmlFor="dd-serverid">Choisir un serveur (optionnel)</label>
                        </FloatLabel> */}
                        
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