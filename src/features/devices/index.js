
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import moment from "moment"
import { setLoading } from "../common/loadingSlice";
import TitleCard from "../../components/Cards/TitleCard"
import { openModal } from "../common/modalSlice"
import { getLeadsContent, setTokenRefreshing } from "./leadSlice"
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_BODY_TYPES } from '../../utils/globalConstantUtil'
import { parseBrands } from "../../components/Functions/parseBrands"
import { ArrowPathIcon, FolderArrowDownIcon, TrashIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { DevicesProvider, useDevices } from './components/DevicesContext'
import capitalize from 'lodash/capitalize'
const Text = ({ children }) => <span textsizeadjust="true">{children}</span>

const TopSideButtons = ({ isDeleteEnabled, onDelete, refresh, exportCSV, setValueLoad, setIsFetching}) => {
    const storage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))

    //on regarde si un brand est actif, si cest le cas on retourne, si ce n'est pas le cas "disabled", dans ce dernier on affiche pas le bouton "ajouter"
    const brands = parseBrands(storage.settings)
    const brandEnabled = (brands.length > 0)? "" : "disabled"

    const dispatch = useDispatch()
    // const { setValueLoad, setIsFetching } = useDevices();
    const openAddNewLeadModal = (setValueLoad, setIsFetching) => {
        dispatch(openModal(
            {
            title : "Nouveau.x périphérique.s", 
            bodyType : MODAL_BODY_TYPES.LEAD_ADD_NEW,
            extraObject : {setValueLoad, setIsFetching} 
            }
        ))
    }

    return(
        <div className="inline-block float-right">
            <button className="btn px-6 btn-sm normal-case btn-disable mr-5" onClick={refresh}>< ArrowPathIcon className={'h-6 w-6'} />Actualiser</button>
            <button className="btn px-6 btn-sm normal-case btn-disable mr-5" onClick={exportCSV}>< FolderArrowDownIcon className={'h-6 w-6'} />Exporter</button>
            <button disabled={!isDeleteEnabled} className="btn px-6 btn-sm normal-case btn-error mr-5" onClick={onDelete}>< TrashIcon className={'h-6 w-6'} />Supprimer</button>
            <button disabled={brandEnabled} className="btn px-6 btn-sm normal-case btn-primary" onClick={() => openAddNewLeadModal(setValueLoad, setIsFetching)}>< PlusCircleIcon className={'h-6 w-6'} />Ajouter</button>
        </div>
    )
}

function Devices(){
    
    const {leads, isLoading, isTokenRefreshing } = useSelector(state => state.lead)
    const loading = useSelector(state => state.loading);
    // console.log(leads);
    
    const dispatch = useDispatch()

    // const { isFetching, setIsFetching, valueLoad, setValueLoad } = useDevices();
    const [isFetching, setIsFetching] = useState(false);
    const [valueLoad, setValueLoad] = useState(0);
    const [devices, setDevices] = useState([]);
    const [filters, setFilters] = useState({
        mac: { value: null, matchMode: FilterMatchMode.ENDS_WITH },
        brand: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    });
    const [selectedDevices, setSelectedDevices] = useState();
    const toast = useRef(null);
    const dt = useRef(null);

    const fetchLeadsContent = () => {
        setIsFetching(true);
        setValueLoad(","+0);
        dispatch(setLoading(true));
        dispatch(getLeadsContent({setValueLoad, setIsFetching}))
        .unwrap()
        .then(data => {
            setDevices(data);
            setSelectedDevices([]);
        })
        .catch(error => {
            console.error('Failed to fetch leads content:', error);
            setIsFetching(false);
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

    const deleteCurrentLead = (leadsToDelete, setValueLoad, setIsFetching) => {

        const cleanedLeadsToDelete = leadsToDelete.map(lead => {
            const { dateRegistered, ipAddress, lastConnected, remark, serverId, serverName, serverUrl, sn, uniqueServerUrl, ...rest } = lead; // Remplacez key1, key2 par les clés que vous souhaitez supprimer
            return rest;
         });
         
        dispatch(openModal({
            title: "Confirmation",
            bodyType: MODAL_BODY_TYPES.CONFIRMATION,
            extraObject: {
                message: `Etes-vous sûr de vouloir supprimer la sélection de ${cleanedLeadsToDelete.length} périphériques ?`,
                type: CONFIRMATION_MODAL_CLOSE_TYPES.LEAD_DELETE,
                cleanedLeadsToDelete,
                setValueLoad,
                setIsFetching
            }
        }));
    };


    const isDeleteEnabled = selectedDevices && selectedDevices.length > 0 ;

    const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    const paginatorRight = <Button type="button" icon="pi pi-download" text />;

    const exportCSV = () => {
        if (selectedDevices && selectedDevices.length > 0) {
            dt.current.exportCSV({ selectionOnly: true });
        } else {
            dt.current.exportCSV({ selectionOnly: false });
        }
    };

    const formatMacAddress = (rowData) => {
        return rowData.mac.match(/.{1,2}/g).join(':');
    };
    const dateRegistered = (rowData) => {
        if (rowData.dateRegistered) {
            return moment(rowData.dateRegistered).format("DD MMM YY");
        } else {
            return "N/A";
        }
    }
    const formatLastConnected = (rowData) => {
        if (rowData.lastConnected) {
            return <div className="badge badge-success">{moment(rowData.lastConnected).format("DD MMM YY")}</div>;
        } else {
            return <div className="badge badge-warning">Non communiqué</div>
        }
        
    };
    const getServerUrl = (rowData) => {
        if (rowData.serverUrl || rowData.uniqueServerUrl) {
            return rowData.serverUrl || rowData.uniqueServerUrl;
        } else {
            return "Non communiqué";
        }
    };

    const valueTemplate = (value) => {
        console.log(value);
        
        const {text, percent} = decomposeData(value);
        return (
            <React.Fragment>
                <Text>Traitement {capitalize(text)} - {percent}%</Text>
            </React.Fragment>
        );
    };

    const decomposeData = (data) => {
        const [text, percent] = data.split(',');
        return { text, percent };
    };

    return(
        <DevicesProvider>
            
            <TitleCard title="Liste des périphériques" topMargin="mt-2" TopSideButtons={<TopSideButtons isDeleteEnabled={isDeleteEnabled} onDelete={() => deleteCurrentLead(selectedDevices, setValueLoad, setIsFetching)} refresh={fetchLeadsContent} exportCSV={exportCSV} setValueLoad={setValueLoad} setIsFetching={setIsFetching} />}>
            {isFetching && ( // Affiche la div  uniquement pendant le chargement
                <div className="card">
                    <Toast ref={toast}></Toast>
                    <ProgressBar value={decomposeData(valueLoad).percent} displayValueTemplate={() => valueTemplate(valueLoad)} ></ProgressBar>
                </div>
            )}
            <div className="overflow-x-auto w-full">
                <DataTable 
                            ref={dt}
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
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                    <Column field="mac" header="Mac" body={formatMacAddress} filter filterPlaceholder="Recherche par mac (fin)" sortable ></Column>
                    <Column field="brand" header="Constructeur" filter filterPlaceholder="Recherche par marque" ></Column>
                    <Column field="dateRegistered" body={dateRegistered} header="Créé le"></Column>
                    <Column field="lastConnected" body={formatLastConnected} header="Vu le"></Column>
                    <Column exportField={getServerUrl} field="serverUrl" body={getServerUrl} header="URL Provisionning"></Column>
                </DataTable >
            </div>
            </TitleCard>
            </DevicesProvider>
    )
}


export default Devices