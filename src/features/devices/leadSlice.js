import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { randomString } from '../../components/Functions/outils'
import { YealinkGetToken } from '../settings/yealinksettings/components/getToken'
import { showNotification } from '../common/headerSlice'

import axios from 'axios'

export const getLeadsContent = createAsyncThunk('/leads/content', async (_, { dispatch }) => {
    const yealinkToken = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    const headers = { 
        'Access-Control-Allow-Origin': '*',
        'Nonce': randomString(32),
        'Timestamp': Date.now(),
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yealinkToken.settings.yealink.token}`
    }

    const response = await axios.post('/v2/rps/listDevices', 
        {
            "skip": 0,
            "limit": 20,
            "autoCount": true
        },
        {
            headers: headers
        }
    )
    .then((response) => {
        const storage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
        const serverFilter = storage.global.stackProvURL
        const donnees = response.data.data
        const filteredData = donnees
            .filter(l => l.serverUrl === serverFilter || l.uniqueServerUrl === serverFilter)
            .map(l => ({ ...l, brand: "Yealink" }));
        return filteredData
    })
    .catch(async (error) => {
        if (error.status === 401) {
            console.log('Token expired');
            console.log('Getting new token');
            
            dispatch(showNotification({message : "Rafraîchissement du token en cours", status : 1}))

            dispatch(YealinkGetToken(dispatch));
            console.log('Token refreshed');
            console.log('Reloading data');
        } else {
            console.log(error);
            throw error;
        } 
    })
    return response
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
            // console.log("DONNEES RECUES :", action.payload);
            
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