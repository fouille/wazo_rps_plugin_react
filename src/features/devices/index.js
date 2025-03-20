
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import moment from "moment"
import { setLoading } from "../common/loadingSlice";
import TitleCard from "../../components/Cards/TitleCard"
import { openModal } from "../common/modalSlice"
import { getLeadsContent, setTokenRefreshing } from "./leadSlice"
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_BODY_TYPES } from '../../utils/globalConstantUtil'
import { parseBrands } from "../../components/Functions/parseBrands"

const TopSideButtons = ({ isDeleteEnabled, onDelete, refresh }) => {
    const storage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))

    //on regarde si un brand est actif, si cest le cas on retourne, si ce n'est pas le cas "disabled", dans ce dernier on affiche pas le bouton "ajouter"
    const brands = parseBrands(storage.settings)
    const brandEnabled = (brands.length > 0)? "" : "disabled"

    const dispatch = useDispatch()

    const openAddNewLeadModal = () => {
        dispatch(openModal({title : "Nouveau.x périphérique.s", bodyType : MODAL_BODY_TYPES.LEAD_ADD_NEW}))
    }

    return(
        <div className="inline-block float-right">
            <button className="btn px-6 btn-sm normal-case btn-disable mr-5" onClick={refresh}>Actualiser</button>
            <button disabled={!isDeleteEnabled} className="btn px-6 btn-sm normal-case btn-error mr-5" onClick={onDelete}>Supprimer</button>
            <button disabled={brandEnabled} className="btn px-6 btn-sm normal-case btn-primary" onClick={() => openAddNewLeadModal()}>Ajouter</button>
        </div>
    )
}

function Devices(){

    const {leads, isLoading, isTokenRefreshing } = useSelector(state => state.lead)
    const loading = useSelector(state => state.loading);
    // console.log(leads);
    
    const dispatch = useDispatch()

    // const [checkedItems, setCheckedItems] = useState({});
    const [devices, setDevices] = useState([]);
    const [filters, setFilters] = useState({
        mac: { value: null, matchMode: FilterMatchMode.ENDS_WITH },
        brand: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    });
    const [selectedDevices, setSelectedDevices] = useState();
    // const [rowClick, setRowClick] = useState(true);
    // const [loading, setLoading] = useState(true);

    const fetchLeadsContent = () => {
        dispatch(setLoading(true));
        dispatch(getLeadsContent())
            .unwrap()
            .then(data => {
                setDevices(data);
                setSelectedDevices([]);
                dispatch(setLoading(false));
            })
            .catch(error => {
                console.error('Failed to fetch leads content:', error);
                dispatch(setLoading(false));
            });
    };

    useEffect(() => {
        // console.log("Dispatch getLeadsContent...");
        if (isTokenRefreshing) {
                dispatch(setTokenRefreshing(false));
        } else {
            fetchLeadsContent();
        }
    }, [isTokenRefreshing, dispatch]);

    useEffect(() => {
        setDevices(leads);
    }, [leads]);

    useEffect(() => {
        setSelectedDevices([]);
    }, [devices]);

    const deleteCurrentLead = (leadsToDelete) => {
        // console.log("deleteCurrentLead", leadsToDelete);

        const cleanedLeadsToDelete = leadsToDelete.map(lead => {
            const { dateRegistered, ipAddress, lastConnected, remark, serverId, serverName, serverUrl, sn, uniqueServerUrl, ...rest } = lead; // Remplacez key1, key2 par les clés que vous souhaitez supprimer
            return rest;
         });
        //  console.log("clean : ", cleanedLeadsToDelete);
         
        dispatch(openModal({
            title: "Confirmation",
            bodyType: MODAL_BODY_TYPES.CONFIRMATION,
            extraObject: {
                message: `Etes-vous sûr de vouloir supprimer la sélection de ${cleanedLeadsToDelete.length} périphériques ?`,
                type: CONFIRMATION_MODAL_CLOSE_TYPES.LEAD_DELETE,
                cleanedLeadsToDelete
            }
        }));
    };


    const isDeleteEnabled = selectedDevices && selectedDevices.length > 0 ;

    // const footer = `In total there are ${devices ? devices.length : 0} devices.`;

    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const formatMacAddress = (rowData) => {
        return rowData.mac.match(/.{1,2}/g).join(':');
    };
    const dateRegistered = (rowData) => {
        return moment(rowData.dateRegistered).format("DD MMM YY");
    }
    const formatLastConnected = (rowData) => {
        if (rowData.lastConnected) {
            return <div className="badge badge-success">{moment(rowData.lastConnected).format("DD MMM YY")}</div>;
        } else {
            return <div className="badge badge-warning">Jamais vu</div>
        }
        
    };
    const getServerUrl = (rowData) => {
        return rowData.serverUrl || rowData.uniqueServerUrl;
    };

    return(
        <>
            
            <TitleCard title="Liste des périphériques" topMargin="mt-2" TopSideButtons={<TopSideButtons isDeleteEnabled={isDeleteEnabled} onDelete={() => deleteCurrentLead(selectedDevices)} refresh={fetchLeadsContent} />}>

            <div className="overflow-x-auto w-full">
                <DataTable 
                            value={devices} 
                            // footer={footer} 
                            removableSort
                            stripedRows 
                            paginator 
                            dataKey="id"
                            filters={filters} 
                            filterDisplay="row" 
                            loading={loading}
                            emptyMessage="No devices found."
                            rows={10} 
                            rowsPerPageOptions={[10, 20, 50, 100, 200]} 
                            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                            currentPageReportTemplate="{first} à {last} de {totalRecords}" 
                            paginatorLeft={paginatorLeft} 
                            paginatorRight={paginatorRight}
                            selection={selectedDevices} 
                            onSelectionChange={(e) => setSelectedDevices(e.value)}
                            tableStyle={{ minWidth: '50rem' }}
                            >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    <Column field="mac" header="Mac" body={formatMacAddress} filter filterPlaceholder="Recherche par mac (fin)" sortable ></Column>
                    <Column field="brand" header="Constructeur" filter filterPlaceholder="Recherche par marque" ></Column>
                    <Column field="dateRegistered" body={dateRegistered} header="Créé le"></Column>
                    <Column field="lastConnected" body={formatLastConnected} header="Vu le"></Column>
                    <Column field="serverUrl" body={getServerUrl} header="URL Provisionning"></Column>
                </DataTable >
            </div>
            </TitleCard>
        </>
    )
}


export default Devices