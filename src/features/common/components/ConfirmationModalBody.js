
import React, { useState, useEffect } from "react";
import { useDispatch } from 'react-redux'
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_CLOSE_TYPES } from '../../../utils/globalConstantUtil'
import { YealinkDelDevice } from "../../settings/yealinksettings/components/delDevice";
import { wazoDelDevice } from "../../settings/wazosettings/WazoCallFunction";
import { showNotification } from '../headerSlice'
import { getLeadsContent } from '../../devices/leadSlice'

function ConfirmationModalBody({ extraObject, closeModal}){

    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const { message, type, _id, leadsToDelete} = extraObject

    const proceedWithYes = async() => {
        setLoading(true) // Définir loading sur true avant les appels asynchrones
        try {
            if(type === CONFIRMATION_MODAL_CLOSE_TYPES.LEAD_DELETE){
                console.log("modal", leadsToDelete);
                


                // Regrouper les leads par brand
                const groupedLeads = leadsToDelete.reduce((acc, lead) => {
                    let { brand, id, id_wazo } = lead;
                    //pour raison d'affichage dans le tableau la première lettre est en majuscule, 
                    // ici on la met en minuscule
                    brand = brand.charAt(0).toLowerCase() + brand.slice(1);
                    if (!acc[brand]) {
                        acc[brand] = [];
                    }
                    acc[brand].push({ id, id_wazo });
                    return acc;
                }, {});
                console.log(groupedLeads);
                

                //ici on match avec les brand parsées au dessus, pour faire les actions API par rapport aux brands
                // Itérer sur chaque clé de l'objet groupedLeads
                Object.keys(groupedLeads).forEach(async brand => {
                    if (brand === "yealink") {
                        dispatch(showNotification({message : `On contacte ${brand}`, status : 1}))
                        console.log("données de yealink :", groupedLeads[brand]);
                        console.log("IDs de yealink :", groupedLeads[brand].map(lead => lead.id));
                        await YealinkDelDevice({"deviceIds": groupedLeads[brand].map(lead => lead.id)}, dispatch)
                        await wazoDelDevice(groupedLeads[brand].map(lead => lead.id_wazo), dispatch)
                        dispatch(getLeadsContent());
                        // Ajoutez ici l'appel API pour yealink si nécessaire
                    }
                    if (brand === "fanvil") {
                        dispatch(showNotification({message : `On contacte ${brand}`, status : 1}))
                        // Ajoutez ici l'appel API pour fanvil si nécessaire
                    }
                    if (brand === "snom") {
                        dispatch(showNotification({message : `On contacte ${brand}`, status : 1}))
                        // Ajoutez ici l'appel API pour snom si nécessaire
                    }
                    if (brand === "gigaset") {
                        dispatch(showNotification({message : `On contacte ${brand}`, status : 1}))
                        // Ajoutez ici l'appel API pour gigaset si nécessaire
                    }
                });

                // Vérifier si index est un tableau, sinon le transformer en tableau
                // const array = Array.isArray(index) ? index : [index];
                // const newArray = {"deviceIds": array};
                // console.log(newArray);
                
                // positive response, call api or dispatch redux function
                // await YealinkDelDevice(newArray, dispatch)
                //     .then((data)=>{
                //         // dispatch(getLeadsContent());
                //     })
            }
            closeModal()
        } catch (error) {
            setErrorMessage("Une erreur s'est produite lors de la création du périphérique.")
        } finally {
            setLoading(false) // Remettre loading sur false après les appels asynchrones
        }
    }

    return(
        <> 
        <p className=' text-xl mt-8 text-center'>
            {message}
        </p>

        <div className="modal-action mt-12">
                
                <button className="btn btn-outline   " onClick={() => closeModal()}>Cancel</button>

                <button className="btn btn-primary w-36" onClick={() => proceedWithYes()}>Yes</button> 

        </div>
        </>
    )
}

export default ConfirmationModalBody