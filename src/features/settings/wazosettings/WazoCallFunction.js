import axios from "axios";
import { convertMacFormat, LoadingInterface, formatMacAddressString } from "../../../components/Functions/outils";
import { showNotification } from "../../common/headerSlice";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function wazoListDevices (dispatch, {callback}) {
    callback(0);
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

    // calcul interval de temps pour le loader
    let percentageCompleted = 0;
    const interval = setInterval(() => {
        percentageCompleted = Math.min(percentageCompleted + 10, 100);
        callback(percentageCompleted);
    }, 1000);

    const response = await axios.request(config)
    .then((data) => {
        clearInterval(interval);
        const items = data.data.items
        //on recupère et on ne convertis qu'uniquement les mac address
        const results = items.map(obj => ({
            mac: convertMacFormat(obj.mac),
            id: obj.id
        }));
        callback(100);
        return results;
    })
    .catch((error) => {
        console.log(error);
        throw error;
    })

    return response;
};

export async function wazoCreateDevice (devices, dispatch, {callback} ) {
    dispatch(showNotification({ message: "WAZO : Création des appareils en cours...", status: 1 }));
    callback(0);
    const retour = []
    const totalDevices = devices.for_brands.length;
    
    let completedDevices = 0;
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
        completedDevices++;
        const percentageCompleted = Math.round((completedDevices / totalDevices) * 100);
        callback(percentageCompleted);
    }
    dispatch(showNotification({ message: "Création des appareils Dans Wazo Terminé", status: 1 }));
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

export async function wazoDelDevice (devices, { callback }) {
    callback(0);
    const wazoData = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    // dispatch(showNotification({message : "Suppression des appareils Wazo en cours...", status : 1}));
    // setLoading(true)
    // LoadingInterface(true)
    const retour = [];
    const totalDevices = devices.length;
    let completedDevices = 0;
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
        completedDevices++;
        const percentageCompleted = Math.round((completedDevices / totalDevices) * 100);
        callback(percentageCompleted);
    }
    return retour
};