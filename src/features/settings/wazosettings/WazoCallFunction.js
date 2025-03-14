import axios from "axios";
import { showNotification } from "../../common/headerSlice";
import { convertMacFormat } from "../../../components/Functions/outils";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function wazoListDevices (dispatch) {
    const wazoData = JSON.parse(localStorage.getItem("wazo_plugin_rps"))

    const config = {
        method: 'GET',
        url: wazoData.global.stackDomain + '/api/confd/1.1/devices',
        headers: { 
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Auth-Token': `${wazoData.global.stackToken}`,
            'Wazo-Tenant': `${wazoData.global.stackTenantUUID}`
        }
    };

    const response = await axios.request(config)
    .then((data) => {
        const items = data.data.items
        dispatch(showNotification({message : "Wazo en cours", status : 1}));
        //on recupère et on ne convertis qu'uniquement les mac address
        const results = items.map(obj => ({
            mac: convertMacFormat(obj.mac),
            id: obj.id
        }));
        // console.log("RETOUR WAZO : ", results);
        
        return results;
    })
    .catch((error) => {
        console.log(error);
        throw error;
    })

    return response;
};

export async function wazoCreateDevice (devices, dispatch ) {
    console.log("Wazo MAC Envoyée : ", devices);
    for (const device of devices.for_brands) {
        const config = {
            method: 'post',
            url: devices.for_wazo.domainURL + '/api/confd/1.1/devices',
            headers: { 
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Auth-Token': `${devices.for_wazo.tokenUUID}`,
                'Wazo-Tenant': `${devices.for_wazo.tenantUUID}`
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
        })
        .catch((error) => {
            console.log(error);
            if (error.status === 401) {
                dispatch(showNotification({message : "Wazo : " + error.response.statusText, status : 0}))
            } else if (error.status === 400) {
                dispatch(showNotification({message : "Wazo : " + error.response.data[0], status : 0}))
            } else {
                console.log(error);
            }
        });
        await delay(1000);
    }
};

async function wazoResetDevice (device) {
    const wazoData = JSON.parse(localStorage.getItem("wazo_plugin_rps"))

    const config = {
        method: 'GET',
        url: wazoData.global.stackDomain + '/api/confd/1.1/devices/' + device + '/autoprov',
        headers: { 
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Auth-Token': `${wazoData.global.stackToken}`,
            'Wazo-Tenant': `${wazoData.global.stackTenantUUID}`
        }
    };

    await axios.request(config)
        .then((data) => {
            console.log("RETOUR WAZO RESET: ", data);
        })
        .catch((error) => {
            console.log(error);
        })
};

export async function wazoDelDevice (devices, dispatch) {
    const wazoData = JSON.parse(localStorage.getItem("wazo_plugin_rps"))

    for (const device of devices) {
        let config = {
            method: 'DELETE',
            url: wazoData.global.stackDomain + '/api/confd/1.1/devices/' + device,
            headers: { 
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Auth-Token': `${wazoData.global.stackToken}`,
                'Wazo-Tenant': `${wazoData.global.stackTenantUUID}`
            }
        };
        dispatch(showNotification({message : `Wazo ${device} en cours`, status : 1}));
        await wazoResetDevice(device)
        await axios.request(config)
            .then((data) => {
                dispatch(showNotification({message : "ok", status : 1}));
                console.log("RETOUR WAZO DELETE: ", data);
            })
            .catch((error) => {
                dispatch(showNotification({message : device, status : 0}));
                console.log(error);
            })

        await delay(500); // Pause de 1 seconde
    }
};