import axios from 'axios'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { randomString } from '../../../../components/Functions/outils.js'
import { showNotification } from '../../../common/headerSlice.js'
import { setTokenRefreshing } from '../../../devices/leadSlice.js'

export const YealinkGetToken = createAsyncThunk('/token/content', async (dispatch) => {
  const yealinkCred = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    const Config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: '/v2/token',
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'nonce': `${randomString(32)}`, 
        'timestamp': `${Date.now()}`, 
        'Content-Type': 'application/json', 
        'Authorization': `Basic ${yealinkCred.settings.yealink.b64}`
      },
      data : JSON.stringify({"grant_type": "client_credentials"}),
      mode: 'cors'
    };

    await axios.request(Config)
    .then((response) => {
        yealinkCred.settings.yealink.token = response.data.access_token
        localStorage.setItem('wazo_plugin_rps', JSON.stringify(yealinkCred))
        dispatch(showNotification({message : "Token rafraichis", status : 1}))
        // dispatch(setTokenRefreshing(true))
    })
    .catch((error) => {
      console.log("ERREUR YPD0005: " + error.message)
      if (error.status === 401) {
          
          dispatch(showNotification({message : error.response.data.message, status : 0}))
          
      } else {
          console.log(error);
          // throw error;
      }
    });
});