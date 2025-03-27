const baseStructure = {
    settings : {
        yealink : {
            id : "",
            secret : "",
            enabled : false,
            b64 : "",
            token : ""
        },
        fanvil : {
            b64 : "",
            enabled : false,
            id : "",
            secret : "",
            token : ""
        },
        snom : {
            b64 : "",
            enabled : false,
            id : "",
            secret : "",
            token : ""
        },
        gigaset : {
            b64 : "",
            enabled : false,
            id : "",
            secret : "",
            token : ""
        }
    },
    global : {
        appFirstname : "",
        appLastname : "",
        accountType : "",
        stackDomain : "",
        stackToken : "",
        stackTenantUUID : "",
        stackProvSettings : {
            stackProvURL : "",
            stackProvHTTPS : "",
            enabled_https : false,
            customProv : {
                enabledCustom : false,
                stackCustomProvURL : "",
                stackCustomProvHTTPS : "",
                enabledCustom_https : false
            }
        }
    }
}

function mergeObjects(base, target) {
    // Supprimer les clés supplémentaires dans target
    for (const key in target) {
        if (target.hasOwnProperty(key) && !base.hasOwnProperty(key)) {
            delete target[key];
        }
    }

    // Ajouter ou mettre à jour les clés manquantes ou différentes dans target
    for (const key in base) {
        if (base.hasOwnProperty(key)) {
            if (typeof base[key] === 'object' && base[key] !== null) {
                if (!target[key]) {
                    target[key] = {};
                }
                mergeObjects(base[key], target[key]);
            } else {
                if (!target.hasOwnProperty(key)) {
                    target[key] = base[key];
                }
            }
        }
    }
}

async function updateObjStack(objects, context) {
    const domainStackProv = 'http://' + context.app.extra.stack.host + ':' + '8667';
    const domainStack = 'https://' + context.app.extra.stack.host + ':' + context.app.extra.stack.port;
    const userTokenStack = context.app.extra.stack.session.token;
    const userTenantIdStack = context.app.extra.tenant;
    const accountType = context.app.extra.administrator.organization.resource;
    const appFirstname = context.app.extra.administrator.firstname;
    const appLastname = context.app.extra.administrator.lastname;

    // Fusionner baseStructure avec les objets pour s'assurer que toutes les clés sont présentes, supprime aussi  si une ancienne clé est en trop.
    mergeObjects(baseStructure, objects);

    objects.global.stackDomain = domainStack
    objects.global.stackProvSettings.stackProvURL = domainStackProv
    objects.global.stackProvSettings.stackProvHTTPS = domainStack + "/device/provisioning/"
    objects.global.stackToken = userTokenStack
    objects.global.stackTenantUUID = userTenantIdStack
    objects.global.accountType = accountType
    objects.global.appFirstname = appFirstname
    objects.global.appLastname = appLastname
    localStorage.setItem("wazo_plugin_rps", JSON.stringify(objects))
}

async function setLocalStorageItem(key, value) {
    localStorage.setItem(key, value);
    const parsedValues = JSON.parse(value)
    return parsedValues
}

export const SetLocalStorage = async (portal) => {
    const getStorage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    if (getStorage){
        console.log("Localstorage déjà Initialisé");
        await updateObjStack(getStorage, portal)
        return portal
        
        
    } else {
        const storage = await setLocalStorageItem("wazo_plugin_rps", JSON.stringify(baseStructure))
        .then((data)=>{
            return data
        })
        
        await updateObjStack(storage, portal);
        console.log("LocalStorage Initialisé");
        return portal
    }
    
}
