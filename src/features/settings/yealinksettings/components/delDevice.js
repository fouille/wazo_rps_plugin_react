import axios from 'axios'
import { showNotification } from '../../../common/headerSlice';
import { randomString, formatMacAddressString } from '../../../../components/Functions/outils';
import { YealinkGetToken } from './getToken';

const MAX_DEVICES_PER_REQUEST = 200;

export const YealinkDelDevice = async (devices, dispatch, {callback}) => {
    // console.log("YL DEL DEVICES DATA", devices);
    callback('yealink,'+0);
    const storage = JSON.parse(localStorage.getItem("wazo_plugin_rps"));

    const deleteDevicesBatch = async (devicesBatch) => {
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
            data: JSON.stringify({ deviceIds: devicesBatch.map(device => device.deviceIds) }),
            mode: 'cors'
        };

        return axios.request(config)
            .then((response) => {
                if (response.data.failureCount > 0) {
                    const transformedData = response.data.errors.map(item => {
                        const device = devicesBatch.find(device => device.deviceIds === item.field);
                        return {
                            source: "Yealink",
                            mac: device ? formatMacAddressString(device.mac) : "N/A",
                            message: item.msg
                        };
                    });
                    return transformedData;
                }
                if (response.data.successCount > 0) {
                    return [];
                } else {
                    return [];
                }
            })
            .catch(async (error) => {
                console.log("ERREUR YDD0001: " + error);
                if (error.status === 401) {
                    await dispatch(YealinkGetToken(dispatch));
                    const retour = await deleteDevicesBatch(devicesBatch, dispatch, {callback});
                    return retour;
                }
                if (error.status === 412) {
                    return [{
                        source: "Yealink",
                        mac: "N/A",
                        message: error.message
                    }];
                } else {
                    console.log(error);
                }
            });
    };

    const allResponses = [];
    const totalBatches = Math.ceil(devices.length / MAX_DEVICES_PER_REQUEST);
    let completedBatches = 0;
    for (let i = 0; i < devices.length; i += MAX_DEVICES_PER_REQUEST) {
        const devicesBatch = devices.slice(i, i + MAX_DEVICES_PER_REQUEST);
        const response = await deleteDevicesBatch(devicesBatch);
        allResponses.push(...response);
        
        completedBatches++;
        const percentageCompleted = Math.round((completedBatches / totalBatches) * 100);
        callback('yealink,'+percentageCompleted);
    }

    return allResponses;
};