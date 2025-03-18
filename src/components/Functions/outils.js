// Generateur de string ramdon
export const randomString = (length=1) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
// convertisseur de mac address au format sans ":" (utiliser pour reformater les macs en provenance de Wazo)
export const convertMacFormat = (mac) => mac.replace(/:/g, '');

//formateur de mac address au format xx:xx:xx:xx:xx retourne sous forme de tableau
export const formatMacAddress = (macs) => {
  // Split the input string by commas, spaces, or semicolons to get individual MAC addresses
  const macArray = macs.split(/[,;]\s*/);

  // Process each MAC address
  return macArray.map(mac => {
    // Remove all non-alphanumeric characters
    const cleanedMac = mac.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
    // Add colons every two characters
    return cleanedMac.match(/.{1,2}/g).join(':');
  });
};

//transforamtion de données utilisée pour l'envoi de masse aux RPS Yealink et Wazo
export const transformData = (data) => {
  
  const for_brands = [];
  for (let i = 0; i < data.mac.length; i++) {
    for_brands.push({
      brand: data.brand,
      mac: data.mac[i],
      uniqueServerUrl: data.uniqueServerUrl
    });
  }

  const for_wazo = {
    tenantUUID: data.tenantUUID,
    tokenUUID: data.tokenUUID,
    domainURL: data.domainURL
  };

  const global = {
    for_brands: for_brands,
    for_wazo: for_wazo
  };

  return global
  
};

//Fonction pour retourner le serveur de provisionning entre http, https ou Custom
export const stackServerProvdURL = (getStorage) => {
  const dataProv = getStorage.global.stackProvSettings

  if (dataProv.customProv.enabledCustom) {
    if (dataProv.customProv.enabledCustom_https) {
      return dataProv.customProv.stackCustomProvHTTPS
    } else {
      return dataProv.customProv.stackCustomProvURL
    }
  } else {
    if (dataProv.enabled_https) {
      return dataProv.stackProvHTTPS
    } else {
      return dataProv.stackProvURL
    }
  }
}

//affichage forcé du loading
export const LoadingInterface = (usage) => {
  return usage ? document.body.classList.add('loading-indicator') : document.body.classList.remove('loading-indicator');
}