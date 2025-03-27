
import React, { useState, useEffect } from "react";
import { useDispatch } from 'react-redux'
import { openModal } from "../modalSlice";
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_CLOSE_TYPES, MODAL_BODY_TYPES } from '../../../utils/globalConstantUtil'
import { YealinkDelDevice } from "../../settings/yealinksettings/components/delDevice";
import { wazoDelDevice } from "../../settings/wazosettings/components/WazoCallFunction";
import { fanvilDelRequest } from "../../settings/fanvilsettings/components/fanvilRequest";
import { showNotification } from '../headerSlice'
import { getLeadsContent } from '../../devices/leadSlice'
import { setLoading } from "../loadingSlice";

function ConfirmationModalBody({ extraObject, closeModal}){

    const dispatch = useDispatch()
    const [errorMessage, setErrorMessage] = useState("")

    const { message, type, _id, cleanedLeadsToDelete, setValueLoad, setIsFetching } = extraObject

    const proceedWithYes = async() => {
        dispatch(setLoading(true));
        try {
            if(type === CONFIRMATION_MODAL_CLOSE_TYPES.LEAD_DELETE){
                setIsFetching(true)
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
                const groupDD = []
                const groupWazo = []
                for (const brand of Object.keys(groupedLeads)) {
                    console.log("Brand:", brand);
                    if (brand === "yealink") {
                        const [ydd, wdd] = await Promise.all([
                            // setValueLoad("yealink," + 0),
                            YealinkDelDevice(groupedLeads[brand].map(lead => ({ deviceIds: lead.id, mac: lead.mac })), dispatch, { callback: (progress) => {setValueLoad(progress)} }),
                            // setValueLoad("yealink," + 0),
                            wazoDelDevice(groupedLeads[brand].map(lead => ({ id_wazo: lead.id_wazo, mac: lead.mac })), { callback: (progress) => {setValueLoad(progress)} })
                        ]);
                        groupDD.push(...ydd)
                        groupWazo.push(...wdd)
                    }
                    if (brand === "fanvil") {
                        // dispatch(showNotification({message : `On contacte ${brand}`, status : 1}));
                        const [fdd, wdd] = await Promise.all([
                            // setValueLoad("fanvil," + 0),
                            await fanvilDelRequest(groupedLeads[brand].map(lead => ({ id: lead.id, mac: lead.mac })), dispatch, { callback: (progress) => {setValueLoad(progress)} }),
                            // setValueLoad("fanvil," + 0),
                            await wazoDelDevice(groupedLeads[brand].map(lead => ({ id_wazo: lead.id_wazo, mac: lead.mac })), { callback: (progress) => {setValueLoad(progress)} })
                        ]);
                        groupDD.push(...fdd)
                        groupWazo.push(...wdd)
                    }
                    if (brand === "snom") {
                        dispatch(showNotification({message : `On contacte ${brand}`, status : 1}));
                    }
                    if (brand === "gigaset") {
                        dispatch(showNotification({message : `On contacte ${brand}`, status : 1}));
                    }
                }
                // une fois les actions faites sur les RPS et Wazo on compare combine les résultats.
                const combinedResults = [...groupDD, ...groupWazo].sort((a, b) => a.mac.localeCompare(b.mac))
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
                // si il y a des données en erreur retournées par Wazo ou les RPS, on les affiche
                if (transformedResults.length > 0) {
                    dispatch(openModal({
                        title: "Erreur.s lors de la suppression",
                        bodyType: MODAL_BODY_TYPES.ERROR,
                        size: 'lg',
                        extraObject: { errors: transformedResults }
                    }));
                }
            }
            
        } catch (error) {
            setErrorMessage("Une erreur s'est produite lors de la création du périphérique.")
        } finally {
            dispatch(getLeadsContent({setValueLoad, setIsFetching}))
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