export const randomString = (length=1) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

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