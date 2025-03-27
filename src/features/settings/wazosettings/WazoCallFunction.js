import axios from "axios";
import { convertMacFormat, formatMacAddressString } from "../../../components/Functions/outils";
import { showNotification } from "../../common/headerSlice";
import simulateProgress from "../../../components/Functions/simulateProgress";
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function wazoListDevices (dispatch, {callback}) {
    callback('wazo,'+0);
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

    // Créez un signal d'arrêt pour la progression
    const stopSignal = { isCancelled: false };

    // Simuler la progression en parallèle
    simulateProgress(callback, 'wazo', stopSignal);

    const response = await axios.request(config)
    .then((data) => {
        
        const items = data.data.items
        //on recupère et on ne convertis qu'uniquement les mac address
        const results = items.map(obj => ({
            mac: convertMacFormat(obj.mac),
            id: obj.id
        }));
        callback('wazo,'+100);
        return results;
    })
    .catch((error) => {
        console.log(error);
        stopSignal.isCancelled = true; // Arrêtez également en cas d'erreur
        throw error;
    })

    // Arrêtez la progression une fois que les données sont prêtes
    stopSignal.isCancelled = true;
    return response;
};

export async function wazoCreateDevice (devices, dispatch, {callback} ) {
    dispatch(showNotification({ message: "WAZO : Création des appareils en cours...", status: 1 }));
    callback('wazo,'+0);
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
                retour.push({
                    "source": "Wazo",
                    "mac": device.mac,
                    "message": error.response.statusText
                });
                
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
        callback('wazo,'+percentageCompleted);
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
    callback('wazo,'+0);
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
        callback('wazo,'+percentageCompleted);
    }
    return retour
};