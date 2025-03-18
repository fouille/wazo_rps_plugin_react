import axios from 'axios'
import { randomString } from '../../../../components/Functions/outils.js'
import { showNotification } from '../../../common/headerSlice.js'
import { YealinkGetToken } from './getToken'

export async function YealinkPostDevice (transformedData, dispatch) {
    const yealinkToken = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    dispatch(showNotification({message : "Enregistrement RPS en cours", status : 1}));
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
            if(response.data.failureCount > 0) {
                const transformedData = response.data.errors.map(item => {
                    return {
                        source: "Yealink",
                        mac: item.mac ? item.mac : "N/A",
                        message: item.errorInfo
                    };
                });
                
                return transformedData
            }
            await delay(100)
            dispatch(showNotification({message : `RPS : ${response.data.successCount}/${response.data.total} créé.s`, status : 1}));
            return []
        })
        .catch(async (error, dispatch) => {
        console.log("ERREUR YPD0004: " + error)
            if (error.status === 401) {
                console.log('Token expired');
                console.log('Getting new token');
                
                dispatch(showNotification({message : "Rafraîchissement du token en cours", status : 1}))

                await dispatch(YealinkGetToken(dispatch));
                console.log('Token refreshed');
                console.log('Reloading data');
                
                dispatch(YealinkPostDevice(transformedData))
                
            } else {
                console.log(error);
                const retour = [{
                    source: "Yealink",
                    mac: "N/A",
                    message: error.message
                }]
                return retour
            }
        });
    return response
}