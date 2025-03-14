
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"
import moment from "moment"
import TitleCard from "../../components/Cards/TitleCard"
import { openModal } from "../common/modalSlice"
import { deleteLead, getLeadsContent, setTokenRefreshing } from "./leadSlice"
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_BODY_TYPES } from '../../utils/globalConstantUtil'
import CheckBox from "../../components/Input/CheckBox"
import TrashIcon from '@heroicons/react/24/outline/TrashIcon'
import { parseBrands } from "../../components/Functions/parseBrands"

const TopSideButtons = ({ isDeleteEnabled, onDelete }) => {
    const storage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))

    //on regarde si un brand est actif, si cest le cas on retourne, si ce n'est pas le cas "disabled", dans ce dernier on affiche pas le bouton "ajouter"
    const brands = parseBrands(storage.settings)
    const brandEnabled = (brands.length > 0)? "" : "disabled"

    const dispatch = useDispatch()

    const openAddNewLeadModal = () => {
        dispatch(openModal({title : "Nouveau périphérique", bodyType : MODAL_BODY_TYPES.LEAD_ADD_NEW}))
    }

    return(
        <div className="inline-block float-right">
            <button className="btn px-6 btn-sm normal-case btn-disable mr-5" onClick={() => dispatch(getLeadsContent())}>Actualiser</button>
            <button disabled={!isDeleteEnabled} className="btn px-6 btn-sm normal-case btn-error mr-5" onClick={onDelete}>Supprimer</button>
            <button disabled={brandEnabled} className="btn px-6 btn-sm normal-case btn-primary" onClick={() => openAddNewLeadModal()}>Ajouter</button>
        </div>
    )
}

function Devices(){

    const {leads, isLoading, isTokenRefreshing } = useSelector(state => state.lead)
    // console.log(leads);
    
    const dispatch = useDispatch()

    const [checkedItems, setCheckedItems] = useState({});

    useEffect(() => {
        console.log("Dispatch getLeadsContent...");
        if (isTokenRefreshing) {
                dispatch(getLeadsContent());
                dispatch(setTokenRefreshing(false));
        } else {
            dispatch(getLeadsContent())
        }
    }, [isTokenRefreshing, dispatch]);

    const deleteCurrentLead = (leadsToDelete) => {
        console.log("deleteCurrentLead", leadsToDelete);
        
        dispatch(openModal({
            title: "Confirmation",
            bodyType: MODAL_BODY_TYPES.CONFIRMATION,
            extraObject: {
                message: `Are you sure you want to delete these leads?`,
                type: CONFIRMATION_MODAL_CLOSE_TYPES.LEAD_DELETE,
                leadsToDelete
            }
        }));
    };

    const handleCheckBoxChange = (id, { value }) => {
        console.log(value);
        setCheckedItems(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleDelete = () => {
        const checkedIds = Object.keys(checkedItems).filter(id => checkedItems[id]);
        // console.log("Checked IDs to delete:", checkedIds);
        
        const leadsToDelete = leads.filter(lead => checkedIds.includes(lead.id.toString())).map(lead => ({
            id: lead.id,
            brand: lead.brand,
            id_wazo: lead.id_wazo
        }));
        
        deleteCurrentLead(leadsToDelete);
    };

    const isDeleteEnabled = Object.values(checkedItems).some(isChecked => isChecked);

    return(
        <>
            
            <TitleCard title="Liste des périphériques" topMargin="mt-2" TopSideButtons={<TopSideButtons isDeleteEnabled={isDeleteEnabled} onDelete={handleDelete} />}>

                {/* Leads List in table format loaded from slice after api call */}
            <div className="overflow-x-auto w-full">
                <table className="table w-full">
                    <thead>
                    <tr>
                        <th>Mac</th>
                        {/* <th>Dans Tenant</th> */}
                        <th>Constructeur</th>
                        <th>Created At</th>
                        <th>Bound</th>
                        <th>URL</th>
                        <th></th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                        {
                            leads.map((l, k) => {
                                let mac = l.mac
                                let macFormatted = mac.match(/.{1,2}/g).join(':')

                                return(
                                    <tr key={k}>
                                    <td>
                                        <div className="font-bold">{macFormatted}</div>
                                    </td>
                                    {/* <td>{(l.existInTenant === undefined)?"N/A":(l.existInTenant)?<div className="badge badge-success">Oui</div>:<div className="badge badge-error">Non</div>}</td> */}
                                    <td>{(l.brand)?l.brand:""}</td>
                                    <td>{moment(l.dateRegistered).format("DD MMM YY")}</td>
                                    <td>{(l.lastConnected)?<div className="badge badge-success">{moment(l.dateRegistered).format("DD MMM YY | hh:mm:ss")}</div> : <div className="badge badge-warning">Jamais vu</div>}</td>
                                    <td>{l.serverUrl ? l.serverUrl : l.uniqueServerUrl}</td>
                                    <td><button disabled={(l.button)? l.button:""} className="btn btn-square btn-ghost" onClick={() => deleteCurrentLead([{"id": l.id, "brand": l.brand, "id_wazo": l.id_wazo}])}><TrashIcon className="w-5"/></button></td>
                                    <td><CheckBox updateType={l.id} defaultValue={checkedItems[l.id]} updateFormValue={(e) => handleCheckBoxChange(l.id, e)} /></td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
            </TitleCard>
        </>
    )
}


export default Devices