export const randomString = (length=1) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export const formatMacAddress = (mac) => {
  // Remove all non-alphanumeric characters
  const cleanedMac = mac.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
  // Add colons every two characters
  return cleanedMac.match(/.{1,2}/g).join(':');
};