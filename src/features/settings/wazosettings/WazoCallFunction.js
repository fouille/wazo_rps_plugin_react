import axios from "axios";
import { convertMacFormat, LoadingInterface, formatMacAddressString } from "../../../components/Functions/outils";


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
        //on recupère et on ne convertis qu'uniquement les mac address
        const results = items.map(obj => ({
            mac: convertMacFormat(obj.mac),
            id: obj.id
        }));
        return results;
    })
    .catch((error) => {
        console.log(error);
        throw error;
    })

    return response;
};

export async function wazoCreateDevice (devices ) {
    const retour = []
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
        try {
            await axios.request(config);
        } catch (error) {
            if (error.status === 401) {
                console.log( "Wazo : " + error.response.statusText);
                
            } else if (error.status === 400) {
                retour.push({
                    "source": "Wazo",
                    "mac": device.mac,
                    "message": error.response.data[0]
                });
            } else {
                console.log(error);
            }
        }
    }
    return retour
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
    try {
        await axios.request(config)
    } catch (error) {
        console.log(error);
    }
};

export async function wazoDelDevice (devices) {
    const wazoData = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    // dispatch(showNotification({message : "Suppression des appareils Wazo en cours...", status : 1}));
    // setLoading(true)
    // LoadingInterface(true)
    const retour = [];
    for (const device of devices) {
        // exemple structure des elements parsés dans device :
        // {   
        //     id_wazo: "da6983d092aa4ad6877fa61c139a2337"
        //     mac: "3a1565bbb1a8"
        // }
        
        let config = {
            method: 'DELETE',
            url: wazoData.global.stackDomain + '/api/confd/1.1/devices/' + device.id_wazo,
            headers: { 
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Auth-Token': `${wazoData.global.stackToken}`,
                'Wazo-Tenant': `${wazoData.global.stackTenantUUID}`
            }
        };
        // dispatch(showNotification({message : `Wazo ${device} en cours`, status : 1}));
        try {
            await wazoResetDevice(device.id_wazo);
            await axios.request(config);
        } catch (error) {
            // showNotification({message : `Erreur lors de la suppression de l'appareil ${device}`, status : 0});
            retour.push({
                "source": "Wazo",
                "mac": formatMacAddressString(device.mac),
                "message": error.message
            });
        }

        // await delay(200); // Pause 
    }

    // dispatch(showNotification({message : "Suppression des appareils Wazo terminée", status : 1}));
    // setLoading(false)
    // LoadingInterface(false)
    return retour
};