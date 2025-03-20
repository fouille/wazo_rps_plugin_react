import axios from 'axios'
import { randomString } from '../../../../components/Functions/outils.js'
import { showNotification } from '../../../common/headerSlice.js'
import { YealinkGetToken } from './getToken.js'

export async function YealinkGetServers (dispatch) {
  const storage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
  const result = []
    const Config = {
      method: 'POST',
      maxBodyLength: Infinity,
      url: '/v2/rps/listServers',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'nonce': `${randomString(32)}`,
        'timestamp': `${Date.now()}`,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storage.settings.yealink.token}`,
      },
      data: {
        "skip": 0,
        "limit": 50,
        "autoCount": true
      }
    };
    dispatch(showNotification({message : "Récupération liste serveurs", status : 1}))
    try {
      const request = await axios.request(Config)
      console.log(request);
      
      return request.data.data
      
    } catch (error) {
      console.log("ERREUR YGS0001: " + error.message)
        if (error.status === 401) {
            console.log('Token expired');
            console.log('Getting new token');
            
            dispatch(showNotification({message : "Rafraîchissement du token en cours", status : 1}))

            await dispatch(YealinkGetToken(dispatch));
            console.log('Token refreshed');
            console.log('Reloading data');
            
            const response = await YealinkGetServers(dispatch)
            
            return response
        }
    } finally {
      dispatch(showNotification({message : "Récupération terminée", status : 1}))
    }
    // await axios.request(Config)
    // .then((response) => {
    //     yealinkCred.settings.yealink.token = response.data.access_token
    //     localStorage.setItem('wazo_plugin_rps', JSON.stringify(yealinkCred))
    //     dispatch(showNotification({message : "Token rafraichis", status : 1}))
    //     // dispatch(setTokenRefreshing(true))
    // })
    // .catch((error) => {
    //   console.log("ERREUR YPD0005: " + error.message)
    //   if (error.status === 401) {
          
    //       dispatch(showNotification({message : error.response.data.message, status : 0}))
          
    //   } else {
    //       console.log(error);
    //       // throw error;
    //   }
    // });
};