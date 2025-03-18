import axios from 'axios'
import { showNotification } from '../../../common/headerSlice';
import { randomString } from '../../../../components/Functions/outils';
import { YealinkGetToken } from './getToken';

export const YealinkDelDevice = async (devices, dispatch) => {
    // console.log("YL DEL DEVICES DATA", devices);
    
    const storage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/v2/rps/delDevices',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'nonce': `${randomString(32)}`,
            'timestamp': `${Date.now()}`,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storage.settings.yealink.token}`,
        },
        data: JSON.stringify({ deviceIds: devices.map(device => device.deviceIds) }),
        mode: 'cors'
    };
    const response = await axios.request(config)
        .then((response) => {

            if (response.data.failureCount > 0) {
                
                const transformedData = response.data.errors.map(item => {
                    const device = devices.find(device => device.deviceIds === item.field);
                    return {
                        source: "Yealink",
                        mac: device ? device.mac : "N/A",
                        message: item.msg
                    };
                });
                // console.log("YEALINK DEL DEVICE RETURN", transformedData);
                
                return transformedData
               
            }
            if (response.data.successCount > 0) {
                return []
            }

            else {
                return []
            }

        })
        .catch(async (error, dispatch) => {
            console.log("ERREUR YDD0001: " + error)
            if (error.status === 401) {

                await dispatch(YealinkGetToken(dispatch))
                
                await YealinkDelDevice(devices, dispatch)
                
            } 
            if (error.status === 412) {
                const retour = [{
                    source: "Yealink",
                    mac: "N/A",
                    message: error.message
                }]
                return retour
            }
            else {
                console.log(error);
            }
        });

        return response
};
