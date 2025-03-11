import { useDispatch, useSelector } from "react-redux"
import { randomString } from '../../../components/Functions/outils'
import { showNotification } from "../../common/headerSlice"
import axios from 'axios'

export const YealinkDelDevice = async (devices, dispatch) => {
  const yealinkToken = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: '/v2/rps/delDevices',
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'nonce': `${randomString(32)}`,
        'timestamp': `${Date.now()}`,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yealinkToken.settings.yealink.token}`,
      },
      data : JSON.stringify(devices),
      mode: 'cors'
    };
    const response =  await axios.request(config)
    .then((response) => {
        dispatch(showNotification({message : "Supprimé du RPS", status : 1}))
    })
    .catch((error) => {
      console.log(error)
      dispatch(showNotification({message : error.data, status : 0}))
    });
  };
