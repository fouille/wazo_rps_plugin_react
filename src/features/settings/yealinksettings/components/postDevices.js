import axios from 'axios'
import { randomString } from '../../../../components/Functions/outils.js'
import { showNotification } from '../../../common/headerSlice.js'
import { YealinkGetToken } from './getToken'
import { formatMacAddressString } from '../../../../components/Functions/outils.js'

export async function YealinkPostDevice (transformedData, dispatch, {callback}) {
    callback('yealink,'+0);
    const yealinkToken = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    dispatch(showNotification({message : "Enregistrement RPS en cours", status : 1}));
    
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/v2/rps/addDevicesByMac',
        headers: { 
            'Access-Control-Allow-Origin': '*',
            'timestamp': `${Date.now()}`,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${yealinkToken.settings.yealink.token}`,
        },
        mode: 'cors'
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let allErrors = [];

    const yealinkDevices = transformedData.for_brands.filter(item => item.brand === 'yealink');
    const chunks = Array.from({ length: Math.ceil(yealinkDevices.length / 100) }, (v, i) =>
        yealinkDevices.slice(i * 100, i * 100 + 100)
    );
    const totalChunks = chunks.length;
    let completedChunks = 0;
    for (const chunk of chunks) {
        config.data = JSON.stringify(chunk);
        config.headers.nonce = randomString(32);
        let compteur = 0;

        try {
            const response = await axios.request(config);
            if (response.data.failureCount > 0) {
                const transformedErrors = response.data.errors.map(item => ({
                    source: "Yealink",
                    mac: item.mac ? formatMacAddressString(item.mac) : "N/A",
                    message: item.errorInfo
                }));
                allErrors = allErrors.concat(transformedErrors);
            }
            await delay(100);
            compteur += response.data.successCount;
            dispatch(showNotification({message : `RPS : ${compteur}/${yealinkDevices.length} créé.s`, status : 1}));
        } catch (error) {
            console.log("ERREUR YPD0004: " + error);
            if (error.response && error.response.status === 401) {
                console.log('Token expired');
                console.log('Getting new token');
                
                dispatch(showNotification({message : "Rafraîchissement du token en cours", status : 1}));

                await dispatch(YealinkGetToken(dispatch));
                console.log('Token refreshed');
                console.log('Reloading data');
                
                await YealinkPostDevice(transformedData, dispatch, {callback});
                return;
            } else {
                console.log(error);
                const retour = [{
                    source: "Yealink",
                    mac: "N/A",
                    message: error.message
                }];
                allErrors = allErrors.concat(retour);
            }
        }
        completedChunks++;
        const percentageCompleted = Math.round((completedChunks / totalChunks) * 100);
        callback('yealink,'+percentageCompleted);
    }
    return allErrors;
}