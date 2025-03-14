import axios from "axios"
import { randomString } from "../../../../components/Functions/outils"
import { showNotification } from "../../../common/headerSlice"
import { YealinkGetToken } from "./getToken"



export async function yealinkListDevices (dispatch) {

    const getStorage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    
    const headers = { 
        'Access-Control-Allow-Origin': '*',
        'Nonce': randomString(32),
        'Timestamp': Date.now(),
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getStorage.settings.yealink.token}`
    }

    const response = await axios.post('/v2/rps/listDevices', 
        {
            "skip": 0,
            "limit": 100,
            "autoCount": true,
            // "filter" :{
            //     "serverUrl" : "http://franckprov.wazo.io:8667",
            //     "uniqueServerUrl" : "http://franckprov.wazo.io:8667"
            // }
        },
        {
            headers: headers
        }
    )
    .then( (response) => {
        const json = response.data.data
        
        dispatch(showNotification({message : "Recherche en cours", status : 1}));
        //on ajoute le brand d'origne pour le fournir au moteur de données du tableau
        const result = json.map((l)=>({...l, brand: "Yealink"}))
        // console.log("API Response Data:", json); 
        return result

    })
    .catch(async (error) => {
        if (error.status === 401) {
            console.log('Token expired');
            console.log('Getting new token');
            
            dispatch(showNotification({message : "Rafraîchissement du token en cours", status : 1}));

            await dispatch(YealinkGetToken(dispatch))
            console.log('Token refreshed');
            console.log('Reloading data');
            //on reboucle la fonction pour retourner le résultat suite à un rafraichissement de token 
            const result = await yealinkListDevices(dispatch)
            return result

        } else {
            console.log(error);
            // throw error;
        } 
    })

    return response
}