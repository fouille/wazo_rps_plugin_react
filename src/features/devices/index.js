import moment from "moment"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import TitleCard from "../../components/Cards/TitleCard"
import { openModal } from "../common/modalSlice"
import { deleteLead, getLeadsContent, setTokenRefreshing } from "./leadSlice"
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_BODY_TYPES } from '../../utils/globalConstantUtil'
import TrashIcon from '@heroicons/react/24/outline/TrashIcon'
import { parseBrands } from "../../components/Functions/parseBrands"

const TopSideButtons = () => {
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
            <button disabled={brandEnabled} className="btn px-6 btn-sm normal-case btn-primary" onClick={() => openAddNewLeadModal()}>Ajouter</button>
        </div>
    )
}

function Devices(){

    const {leads, isLoading, isTokenRefreshing } = useSelector(state => state.lead)
    // console.log(leads);
    
    const dispatch = useDispatch()

    useEffect(() => {
        console.log("Dispatch getLeadsContent...");
        if (isTokenRefreshing) {
                dispatch(getLeadsContent());
                dispatch(setTokenRefreshing(false));
        } else {
            dispatch(getLeadsContent())
        }
    }, [isTokenRefreshing, dispatch]);
    

    // const getDummyStatus = (index) => {
    //     if(index % 5 === 0)return <div className="badge">Not Interested</div>
    //     else if(index % 5 === 1)return <div className="badge badge-primary">In Progress</div>
    //     else if(index % 5 === 2)return <div className="badge badge-secondary">Sold</div>
    //     else if(index % 5 === 3)return <div className="badge badge-accent">Need Followup</div>
    //     else return <div className="badge badge-ghost">Open</div>
    // }

    const deleteCurrentLead = (index) => {       
        dispatch(openModal({title : "Confirmation", bodyType : MODAL_BODY_TYPES.CONFIRMATION, 
        extraObject : { message : `Are you sure you want to delete this ?`, type : CONFIRMATION_MODAL_CLOSE_TYPES.LEAD_DELETE, index}}))
    }

    return(
        <>
            
            <TitleCard title="Liste des périphériques" topMargin="mt-2" TopSideButtons={<TopSideButtons />}>

                {/* Leads List in table format loaded from slice after api call */}
            <div className="overflow-x-auto w-full">
                <table className="table w-full">
                    <thead>
                    <tr>
                        <th>Mac</th>
                        <th>Constructeur</th>
                        <th>Created At</th>
                        <th>Bound</th>
                        <th>URL</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                        {
                            leads.map((l, k) => {
                                return(
                                    <tr key={k}>
                                    <td>
                                        <div className="font-bold">{l.mac}</div>
                                    </td>
                                    <td>{(l.brand)?l.brand:""}</td>
                                    <td>{moment(l.dateRegistered).format("DD MMM YY")}</td>
                                    <td>{(l.lastConnected)?<div className="badge badge-success">{moment(l.dateRegistered).format("DD MMM YY | hh:mm:ss")}</div> : <div className="badge badge-warning">Jamais vu</div>}</td>
                                    <td>{l.serverUrl ? l.serverUrl : l.uniqueServerUrl}</td>
                                    <td><button disabled={(l.button)? l.button:""} className="btn btn-square btn-ghost" onClick={() => deleteCurrentLead(l.id)}><TrashIcon className="w-5"/></button></td>
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