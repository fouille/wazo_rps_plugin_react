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
        }
    },
    global : {
        stackProvURL : "",
        stackDomain : "",
        stackToken : "",
        stackTenantUUID : ""

    }
}

async function updateObjStack(objects, context) {
    const domainStackProv = 'http://' + context.app.extra.stack.host + ':' + '8667';
    const domainStack = 'https://' + context.app.extra.stack.host + ':' + context.app.extra.stack.port;
    const userTokenStack = context.app.extra.stack.session.token;
    const userTenantIdStack = context.app.extra.tenant;
    objects.global.stackDomain = domainStack
    objects.global.stackProvURL = domainStackProv
    objects.global.stackToken = userTokenStack
    objects.global.stackTenantUUID = userTenantIdStack
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
