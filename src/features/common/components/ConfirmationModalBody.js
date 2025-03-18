
import React, { useState, useEffect } from "react";
import { useDispatch } from 'react-redux'
import { openModal } from "../modalSlice";
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_CLOSE_TYPES, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil'
import { YealinkDelDevice } from "../../settings/yealinksettings/components/delDevice";
import { wazoDelDevice } from "../../settings/wazosettings/WazoCallFunction";
import { showNotification } from '../headerSlice'
import { getLeadsContent } from '../../devices/leadSlice'
import { LoadingInterface } from "../../../components/Functions/outils";
import { setLoading } from "../loadingSlice";

function ConfirmationModalBody({ extraObject, closeModal}){

    const dispatch = useDispatch()
    // const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const { message, type, _id, cleanedLeadsToDelete } = extraObject

    const proceedWithYes = async() => {
        // setLoading(true) // Définir loading sur true avant les appels asynchrones
        dispatch(setLoading(true));
        // LoadingInterface(true)
        try {
            if(type === CONFIRMATION_MODAL_CLOSE_TYPES.LEAD_DELETE){

                // Regrouper les leads par brand
                const groupedLeads = cleanedLeadsToDelete.reduce((acc, lead) => {
                    let { brand, id, id_wazo, mac } = lead;
                    //pour raison d'affichage dans le tableau la première lettre est en majuscule, 
                    // ici on la met en minuscule
                    brand = brand.charAt(0).toLowerCase() + brand.slice(1);
                    if (!acc[brand]) {
                        acc[brand] = [];
                    }
                    acc[brand].push({ id, id_wazo, mac, key: id }); // Ajout de la clé unique ici
                    return acc;
                }, {});
                
                //ici on match avec les brand parsées au dessus, pour faire les actions API par rapport aux brands
                // Itérer sur chaque clé de l'objet groupedLeads
                closeModal()
                for (const brand of Object.keys(groupedLeads)) {
                    if (brand === "yealink") {
                        dispatch(showNotification({message : `On contacte ${brand}`, status : 1}));
                        dispatch(showNotification({message : "Suppression des appareils Yealink RPS", status : 1}));
                        const ydd = await YealinkDelDevice(groupedLeads[brand].map(lead => ({ deviceIds: lead.id, mac: lead.mac })), dispatch);
                        dispatch(showNotification({message : "Suppression des appareils Yealink terminé", status : 1}));
                        dispatch(showNotification({message : "Suppression des appareils Wazo en cours...", status : 1}));
                        const wdd = await wazoDelDevice(groupedLeads[brand].map(lead => ({ id_wazo: lead.id_wazo, mac: lead.mac })));
                        dispatch(showNotification({message : "Suppression des appareils Wazo Terminé", status : 1}));
    
                        const combinedResults = [...ydd, ...wdd];
                        if (combinedResults.length > 0) {
                            dispatch(openModal({
                                title: "Erreur.s lors de la suppression",
                                bodyType: MODAL_BODY_TYPES.ERROR,
                                size: 'lg',
                                extraObject: { errors: combinedResults }
                            }));
                        }
                    }
                    if (brand === "fanvil") {
                        dispatch(showNotification({message : `On contacte ${brand}`, status : 1}));
                    }
                    if (brand === "snom") {
                        dispatch(showNotification({message : `On contacte ${brand}`, status : 1}));
                    }
                    if (brand === "gigaset") {
                        dispatch(showNotification({message : `On contacte ${brand}`, status : 1}));
                    }
                }
            }
            
        } catch (error) {
            setErrorMessage("Une erreur s'est produite lors de la création du périphérique.")
        } finally {
            dispatch(getLeadsContent());
        }
    }

    return(
        <> 
        <p className=' text-xl mt-8 text-center'>
            {message}
        </p>

        <div className="modal-action mt-12">
                
                <button className="btn btn-outline   " onClick={() => closeModal()}>Quitter</button>

                <button className="btn btn-primary w-36" onClick={() => proceedWithYes()}>Oui</button> 

        </div>
        </>
    )
}

export default ConfirmationModalBody