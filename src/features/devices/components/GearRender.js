import { showNotification } from "../../common/headerSlice";
import { stackServerProvdURL } from "../../../components/Functions/outils";

//Fonction moteur permettant le retour normé pour la construction du tableau Devices
export function gearRender (wazo, brand, dispatch, {callback}) {
    callback(','+0);
    // On applatit le tableau brand pour faciliter le traitement
    const flattenedBrand = brand.reduce((acc, val) => acc.concat(val), []);
    // console.table(flattenedBrand);
    
    const storage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))

    //ici on tient compte des anciens réglages fait en filtrant aussi les servers URL configurés
    //ceci sert en dessous au filtrage des données 
    const {
        stackProvURL,
        stackProvHTTPS,
        customProv: { stackCustomProvURL, stackCustomProvHTTPS }
    } = storage.global.stackProvSettings;

    // dispatch(showNotification({message : "Moteur en cours", status : 1}));
    
    //par simplicité on combine les deux types de filtres
    //le filtre boolean permet de retirer les potentielles valeurs de serveurs vide
    const serverFilters = [stackProvURL, stackProvHTTPS, stackCustomProvURL, stackCustomProvHTTPS].filter(Boolean);
    
    // Initialisation du pourcentage et de l'intervalle pour le loader
    let percentageCompleted = 0;
    const interval = setInterval(() => {
        percentageCompleted = Math.min(percentageCompleted + 10, 100);
        callback('gear,'+percentageCompleted);
    }, 100);

    //on filtre les données recues par le brand, Le filtre est composé du serveur de provisionning Wazo (HTTPS si actif et HTTP) et des adresses mac connues dans le tenant. 
    // const filteredData = brand
    //     .filter(l => {
    //         const serverMatch = serverFilters.includes(l.serverUrl) || serverFilters.includes(l.uniqueServerUrl);
    //         const macMatch = wazo.some(w => w.mac === l.mac);
    //         return serverMatch && macMatch;
    //     })
    //     .map(l => {
    //         const wazoItem = wazo.find(w => w.mac === l.mac);
    //         return { ...l, id_wazo: wazoItem ? wazoItem.id : null };
    //     });
    
    // console.log("Filtered Data:", filteredData);
    // return filteredData
    
    //identique au code si dessus, juste refactoré.
    const filteredData = flattenedBrand
    .filter(l => {
        // Si les clés serverUrl ou uniqueServerUrl n'existent pas (donc en dehors de Yealink), on considère serverMatch comme "true"
        const serverMatch = (!l.serverUrl && !l.uniqueServerUrl) || 
                            (l.serverUrl && serverFilters.includes(l.serverUrl)) || 
                            (l.uniqueServerUrl && serverFilters.includes(l.uniqueServerUrl));
        const macMatch = wazo.some(w => w.mac === l.mac);
        return serverMatch && macMatch;
    })
    .map(l => {
        const wazoItem = wazo.find(w => w.mac === l.mac);
        return { ...l, id_wazo: wazoItem ? wazoItem.id : null };
    });

    // Arrêt de l'intervalle et mise à jour du pourcentage à 100%
    clearInterval(interval);
    callback('gear,'+100);

    // console.log("Filtered Data:", filteredData);
    
    return filteredData

}
