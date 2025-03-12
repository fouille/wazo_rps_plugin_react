import axios from 'axios'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { showNotification } from '../../common/headerSlice'

export const WazoCreateDevice = createAsyncThunk('/wazo/add', async (device, { dispatch }) => {
    console.log("Wazo MAC Envoyée : " + device);
    const config = {
        method: 'post',
        url: device.domainURL + '/api/confd/1.1/devices',
        headers: { 
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Auth-Token': `${device.tokenUUID}`,
            'Wazo-Tenant': `${device.tenantUUID}`
        },
        data : JSON.stringify({
            "mac": device.mac,
            "description" : "Added by Wazo EUC RPS Plugin"
        })
    };
    const response = await axios.request(config)
    .then((response) => {
        console.log(response.data);
        dispatch(showNotification({message : `Wazo ${device.mac} Ok!`, status : 1}))
        return response.data;
    })
    .catch((error) => {
        console.log(error);
        if (error.status === 401) {
            dispatch(showNotification({message : "Wazo : " + error.response.statusText, status : 0}))
        } else if (error.status === 400) {
            dispatch(showNotification({message : "Wazo : " + error.response.data[0], status : 0}))
        } else {
            console.log(error);
            throw error;
        }
    });
    return response;
});