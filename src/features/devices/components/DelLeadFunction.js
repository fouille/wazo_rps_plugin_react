import { randomString } from '../../../components/Functions/outils'
import { showNotification } from "../../common/headerSlice"
import axios from 'axios'

export const yealinkDelDevice = async (devices) => {
    const token = localStorage.getItem('YealinkToken');
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: '/v2/rps/delDevices',
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'nonce': `${randomString(32)}`,
        'timestamp': `${Date.now()}`,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      data : JSON.stringify(devices),
      mode: 'cors'
    };
    const response =  await axios.request(config)
    .then((response) => {
        showNotification({message : "Supprimé", status : 0})
        return response.data
    })
    .catch((error) => {
      console.log(error)
      showNotification({message : error.data, status : 0})
    });
    return response;
  };
