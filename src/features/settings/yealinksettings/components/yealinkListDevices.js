import axios from "axios"
import { randomString } from "../../../../components/Functions/outils"
import { showNotification } from "../../../common/headerSlice"
import { YealinkGetToken } from "./getToken"

export async function yealinkListDevices (dispatch, {callback}) {
    callback(0)
    const getStorage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))


    let allData = []
    let skip = 0
    const limit = 100
    let total = 0
    let hasError = false

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

    do {
        await axios.post('/v2/rps/listDevices', 
            {
                "skip": skip,
                "limit": limit,
                "autoCount": true
            },
            {
                headers: { 
                    'Access-Control-Allow-Origin': '*',
                    'Nonce': randomString(32),
                    'Timestamp': Date.now(),
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getStorage.settings.yealink.token}`
                }
            }
        )
        .then((response) => {
            const json = response.data.data
            if (total === 0) {
                total = response.data.total
            }
            
            //on ajoute le brand d'origne pour le fournir au moteur de données du tableau
            const result = json.map((l) => ({ ...l, brand: "Yealink" }))
            allData = [...allData, ...result]
            skip += json.length
            total -= json.length

            const percentageCompleted = Math.round((skip / (total + skip)) * 100)
            callback(percentageCompleted)
        })
        .catch(async (error) => {
            hasError = true
            dispatch(showNotification({ message: "Yealink, il y a eu une erreur dans le Loop - YLD0001", status: 0 }))
            if (error.response && error.response.status === 401) {
                console.log('Token expired')
                console.log('Getting new token')
                
                dispatch(showNotification({ message: "Rafraîchissement du token en cours", status: 1 }))

                await dispatch(YealinkGetToken(dispatch))
                console.log('Token refreshed')
                console.log('Reloading data')
                //on reboucle la fonction pour retourner le résultat suite à un rafraichissement de token 
                const result = await yealinkListDevices(dispatch)
                
                allData = result

            } 
            if (error.response && error.response.status === 504) {
                dispatch(showNotification({ message: error.message, status: 0 }))
            } else {
                console.log(error)
                // throw error;
            } 
        })

        // Ajout d'une pause de 200ms
        await delay(100)

    } while (total > 0 && !hasError)
    
    return allData
}