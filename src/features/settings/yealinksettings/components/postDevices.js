import axios from 'axios'
import { useDispatch, useSelector } from "react-redux"
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { randomString } from '../../../../components/Functions/outils.js'
import { showNotification } from '../../../common/headerSlice.js'
import { setTokenRefreshing } from '../../../devices/leadSlice.js'
import { WazoCreateDevice } from '../../../devices/components/WazoLead.js'
import { YealinkGetToken } from './getToken'

export const YealinkPostDevice = createAsyncThunk('/devices/add', async (_, { dispatch }) => {
    const yealinkToken = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    console.log(_);
    const device = _
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/v2/rps/addDevicesByMac',
        headers: { 
            'Access-Control-Allow-Origin': '*',
            'nonce': `${randomString(32)}`,
            'timestamp': `${Date.now()}`,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${yealinkToken.settings.yealink.token}`,
        },
        data : JSON.stringify(device),
        mode: 'cors'
    };
    const response =  await axios.request(config)
        .then((response) => {
            
            console.log("Response from Yealink:", response.data);
            if(response.data.failureCount > 0) { 
                // console.log(response.data.errors[0].errorInfo);
                dispatch(showNotification({message : response.data.errors[0].errorInfo, status : 0}))
            } else {
                dispatch(showNotification({message : `Yealink RPS Ok!`, status : 1}))
                device.map((l) => {
                    dispatch(WazoCreateDevice(l))
                })
                dispatch(setTokenRefreshing(true));
            }
        })
        .catch((error) => {
        console.log("ERREUR YPD0004: " + error)
            if (error.status === 401) {
                console.log('Token expired');
                console.log('Getting new token');
                
                dispatch(showNotification({message : "Rafraîchissement du token en cours", status : 1}))

                dispatch(YealinkGetToken(dispatch));
                console.log('Token refreshed');
                console.log('Reloading data');
                dispatch(YealinkPostDevice(_))
                
            } else {
                console.log(error);
                throw error;
            }
        });
    return response;
})