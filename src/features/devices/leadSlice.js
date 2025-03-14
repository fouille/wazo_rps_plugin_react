import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { showNotification } from '../common/headerSlice'
import { parseBrands } from '../../components/Functions/parseBrands'
import { yealinkListDevices } from "../settings/yealinksettings/components/yealinkListDevices"
import { wazoListDevices } from "../settings/wazosettings/WazoCallFunction"
import { gearRender } from "./components/GearRender"

export const getLeadsContent = createAsyncThunk('/leads/content', async (_, {dispatch}) => {
    const getStorage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    
    //on regarde si un brand est actif, si cest le cas on retour "true", si ce n'est pas le cas "false", dans ce dernier cas on exécute pas l'appel API
    const brands = parseBrands(getStorage.settings)
    const brandEnabled = (brands.length > 0)? true : false
    
    if (brandEnabled) {
        const results = [];
        
        for (const b of brands) {
            if (b.value === "yealink") {
                dispatch(showNotification({message : `On contacte ${b.name}`, status : 1}))
                const dataFromYealink = await yealinkListDevices(dispatch)
                const dataFromWazo = await wazoListDevices(dispatch)
                // console.log(dataFromWazo);
                const gearData = await gearRender(dataFromWazo, dataFromYealink, dispatch)
                console.log(gearData);
                
                results.push(...gearData)
            }
            if (b.value === "fanvil") {
                dispatch(showNotification({message : `On contacte ${b.name}`, status : 1}))
                // Ajoutez ici l'appel API pour fanvil si nécessaire
            }
            if (b.value === "snom") {
                dispatch(showNotification({message : `On contacte ${b.name}`, status : 1}))
                // Ajoutez ici l'appel API pour snom si nécessaire
            }
            if (b.value === "gigaset") {
                dispatch(showNotification({message : `On contacte ${b.name}`, status : 1}))
                // Ajoutez ici l'appel API pour gigaset si nécessaire
            }
        }
        
        return results;
    } else {
        dispatch(showNotification({message : "Il n'y a pas de RPS actif", status : 0}))
        return []
    }
})

export const leadsSlice = createSlice({
    name: 'leads',
    initialState: {
        isLoading: false,
        leads: [],
        isTokenRefreshing: false
    },
    reducers: {
        addNewLead: (state, action) => {
            let { newLeadObj } = action.payload
            state.leads = [...state.leads, newLeadObj]
        },

        deleteLead: (state, action) => {
            let { index } = action.payload
            state.leads.splice(index, 1)
        },

        setTokenRefreshing: (state, action) => {
            state.isTokenRefreshing = action.payload;
        }
    },

    extraReducers: {
        [getLeadsContent.pending]: state => {
            // console.trace("getLeadsContent est appelé !");
            state.isLoading = true;
        },
        [getLeadsContent.fulfilled]: (state, action) => {
            // console.log("getLeadsContent DONNEES RECUES :", action);
            
            if (Array.isArray(action.payload)) {
                state.leads = action.payload;
            } else {
                console.warn("Format inattendu, on garde l'ancien state !");
            }
            state.isLoading = false;
        },
        [getLeadsContent.rejected]: state => {
            state.isLoading = false;
        },
    }
})

export const { addNewLead, deleteLead, setTokenRefreshing } = leadsSlice.actions

export default leadsSlice.reducer