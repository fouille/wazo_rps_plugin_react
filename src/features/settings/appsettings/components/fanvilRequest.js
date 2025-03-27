import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { formatMacAddressPlain, formatMacAddressString, convertMacFormat } from "../../../../components/Functions/outils";
import simulateProgress from "../../../../components/Functions/simulateProgress";


export async function fanvilRequest(method, dispatch, { callback = () => {} }) {
    // l'appel de fonction callback au dessus est différente, car certains appels comme listServers ne retourne pas de callback
    // j'utilises donc un appel "noop" de la fonction callback pour éviter les erreurs
    callback('fanvil,'+0);
    const storage = JSON.parse(localStorage.getItem('wazo_plugin_rps'))
    const fanvilSettingsB64 = storage.settings.fanvil.b64
    let data = `<?xml version='1.0' encoding='UTF-8'?>
                    <methodCall>
                        <methodName>redirect.${method}</methodName>
                        <params>
                        </params>
                    </methodCall>
                `;
    let config = {
        method: 'POST',
        url: '/fanvil',
        headers: {
            'Content-Type': 'application/xml',
            'Authorization': `Basic ${fanvilSettingsB64}` 
        },
        data: data
    };

    // Créez un signal d'arrêt pour la progression
    const stopSignal = { isCancelled: false };

    // Simuler la progression en parallèle
    simulateProgress(callback, 'fanvil', stopSignal);

    try {
        const response = await axios.request(config);
        const parser = new XMLParser();
        const parsedData = parser.parse(response.data);
        if (method === 'listDevices') {
            const devices = parsedData.methodResponse.params.param.value.array.data.value[1].array.data.value.map(v => v.string);
            // console.log(devices);
            const devicesFormatted = formatMacAddressPlain(devices)
            const devicesWithBrand = devicesFormatted.map(mac => ({
                id: mac,
                mac: mac,
                brand: "Fanvil"
            }));
            // console.log("Devices with Brand:", devicesWithBrand);
            // callback('fanvil,' + 100); // Mise à jour finale à 100%
            // Arrêtez la progression une fois que les données sont prêtes
            stopSignal.isCancelled = true;
            return devicesWithBrand;
        }
        if (method === 'listServers') {
            // Arrêtez la progression une fois que les données sont prêtes
            // nest pas utilisé en soit car on ne retourne pas le callback lors de l'appel listServers
            stopSignal.isCancelled = true;

            const booleanValue = parsedData.methodResponse.params.param.value.array.data.value[0].boolean;
        
            if (booleanValue !== 1) {
                console.error("Erreur : La réponse de l'API indique un échec.");
                return;
            }
        
            const serversString = parsedData.methodResponse.params.param.value.array.data.value[1].string;
            try {
                // Suppression des caractères d'encodage JSON et parsing en tableau
                const servers = JSON.parse(serversString.replace(/&#34;/g, '"'));
                // console.log("Liste des serveurs :", servers);
                return servers;
            } catch (error) {
                console.error("Erreur lors du parsing des serveurs :", error);
            }
        }
        // console.log("Parsed Response:", parsedData);
    } catch (error) {
        console.error("Error:", error);
        // Arrêtez la progression une fois que les données sont prêtes
        stopSignal.isCancelled = true;
    }
}

export async function fanvilDelRequest(leads, dispatch, { callback }) {
    callback('fanvil,' + 0);
    const storage = JSON.parse(localStorage.getItem('wazo_plugin_rps'));
    const fanvilSettingsB64 = storage.settings.fanvil.b64;

    const retour = [];
    let percentageCompleted = 0;
    const totalLeads = leads.length;

    for (const lead of leads) {
        const data = `<?xml version='1.0' encoding='UTF-8'?>
            <methodCall>
                <methodName>redirect.deRegisterDevice</methodName>
                <params>
                    <param>
                        <value>
                            <string>${lead.mac}</string>
                        </value>
                    </param>
                </params>
            </methodCall>`;

        const config = {
            method: 'POST',
            url: '/fanvil',
            headers: {
                'Content-Type': 'application/xml',
                'Authorization': `Basic ${fanvilSettingsB64}`,
            },
            data: data,
        };

        try {
            const response = await axios.request(config);
            const parser = new XMLParser();
            const parsedData = parser.parse(response.data);

            const deRegisteredDevices = parsedData.methodResponse.params.param.value.array.data.value;
            // console.log("De-Registered Devices:", deRegisteredDevices);
            
            if (deRegisteredDevices[0].boolean === 1) {
                // console.log(`Device ${lead.mac} successfully deregistered.`);
            } else if (deRegisteredDevices[0].boolean === 0) {
                console.error(`Error deregistering device ${lead.mac}: ${deRegisteredDevices[1]}`);
                retour.push({
                    source: "Fanvil",
                    mac: lead.mac ? formatMacAddressString(lead.mac) : "N/A",
                    message: deRegisteredDevices[1].string,
                });
            }
        } catch (error) {
            console.error(`Error processing lead ${lead.mac}:`, error);
        }

        // Mise à jour de la progression
        percentageCompleted++;
        const percentage = Math.round((percentageCompleted / totalLeads) * 100);
        
        callback('fanvil,' + percentage);
    }

    return retour;
}

export async function fanvilAddRequest(leads, dispatch, { callback }) {
    callback('fanvil' + 0);
    console.log("Fanvil Leads ADD:", leads);
    
    const storage = JSON.parse(localStorage.getItem('wazo_plugin_rps'));
    const fanvilSettingsB64 = storage.settings.fanvil.b64;

    const retour = [];
    let percentageCompleted = 0;
    const totalLeads = leads.for_brands.length;
    
    for (const lead of leads.for_brands) {
        const data = `<?xml version='1.0' encoding='UTF-8'?>
            <methodCall>
                <methodName>redirect.registerDevice</methodName>
                <params>
                    <param>
                        <value>
                            <string>${convertMacFormat(lead.mac)}</string>
                        </value>
                    </param>
                    <param>
                        <value>
                            <string>${lead.serverId}</string>
                        </value>
                    </param>
                </params>
            </methodCall>`;

        const config = {
            method: 'POST',
            url: '/fanvil',
            headers: {
                'Content-Type': 'application/xml',
                'Authorization': `Basic ${fanvilSettingsB64}`,
            },
            data: data,
        };

        try {
            const response = await axios.request(config);
            const parser = new XMLParser();
            const parsedData = parser.parse(response.data);

            const RegisteredDevices = parsedData.methodResponse.params.param.value.array.data.value;
            console.log("Registered Devices:", RegisteredDevices);
            
            if (RegisteredDevices[0].boolean === 1) {
                console.log(`Device ${lead.mac} successfully registered.`);
            } else if (RegisteredDevices[0].boolean === 0) {
                console.error(`Error registering device ${lead.mac}: ${RegisteredDevices[1]}`);
                retour.push({
                    source: "Fanvil",
                    mac: lead.mac ? formatMacAddressString(lead.mac) : "N/A",
                    message: RegisteredDevices[1].string,
                });
            }
        } catch (error) {
            console.error(`Error processing lead ${lead.mac}:`, error);
        }

        // Mise à jour de la progression
        percentageCompleted++;
        const percentage = Math.round((percentageCompleted / totalLeads) * 100);
        console.log("Percentage Completed:", percentage);
        
        callback('fanvil,' + percentage);
    }

    return retour;
}