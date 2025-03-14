import axios from 'axios'
import { showNotification } from '../../../common/headerSlice';
import { randomString } from '../../../../components/Functions/outils';
import { YealinkGetToken } from './getToken';

export const YealinkDelDevice = async (devices, dispatch) => {
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
        data: JSON.stringify(devices),
        mode: 'cors'
    };
    const response = await axios.request(config)
        .then((response) => {
            console.log(response);

            if (response.data.failureCount > 0) {
                dispatch(showNotification({ message: response.errors[0].msg, status: 0 }))
            }
            if (response.data.successCount > 0) {
                dispatch(showNotification({ message: "Supprimé.s du RPS", status: 1 }))
            }

        })
        .catch(async (error) => {
            console.log("ERREUR YDD0001: " + error)
            if (error.status === 401) {
                
                dispatch(showNotification({message : "Rafraîchissement du token en cours", status : 1}))

                await dispatch(YealinkGetToken(dispatch))
                
                await YealinkDelDevice(devices, dispatch)
                
            } else {
                console.log(error);
            }
        });
};
