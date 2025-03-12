import axios from 'axios'
import { useDispatch, useSelector } from "react-redux"
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { randomString } from '../../../../components/Functions/outils.js'
import { showNotification } from '../../../common/headerSlice.js'
import { setTokenRefreshing } from '../../../devices/leadSlice.js'
import { WazoCreateDevice } from '../../../devices/components/WazoLead.js'
import { YealinkGetToken } from './getToken'
import { transformData } from '../../../../components/Functions/outils.js'

export const YealinkPostDevice = createAsyncThunk('/devices/add', async (_, { dispatch }) => {
    const yealinkToken = JSON.parse(localStorage.getItem("wazo_plugin_rps"))

    // Transformation des données
    const transformedData = transformData(_)
    // const transformedData = ""
    console.log(transformedData);
    
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
        data : JSON.stringify(transformedData.for_brands),
        mode: 'cors'
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const response =  await axios.request(config)
        .then(async (response) => {
            
            console.log("Response from Yealink:", response.data);
            if(response.data.failureCount > 0) { 
                response.data.errors.forEach(async (error, index) => {
                    await delay(100);
                    dispatch(showNotification({message : `Mac ${error.mac} : ${error.errorInfo}`, status : 0}));
                });
                await delay(100);
                dispatch(showNotification({message : "Wazo : Pas de création de périphérique possible", status : 0}));
            }
            
            if (response.data.successCount > 0) {
                await delay(100);
                dispatch(showNotification({message : `Yealink RPS Ok!`, status : 1}));
            }
            
            if (response.data.successCount === response.data.total) {
                for (const brand of transformedData.for_brands) {
                    const deviceData = {
                        mac: brand.mac,
                        tenantUUID: transformedData.for_wazo.tenantUUID,
                        tokenUUID: transformedData.for_wazo.tokenUUID,
                        domainURL: transformedData.for_wazo.domainURL
                    };
                    dispatch(WazoCreateDevice(deviceData));
                    await delay(1000); // Pause de 1 seconde
                }
            }

            await delay(100)
            dispatch(showNotification({message : `RPS : ${response.data.successCount}/${response.data.total} created`, status : 1}));
            dispatch(setTokenRefreshing(true));
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