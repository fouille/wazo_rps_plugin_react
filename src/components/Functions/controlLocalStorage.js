import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY_HASH

/**
 * Exporte le contenu du localStorage sous la clé "wazo_plugin_rps" en fichier .json,
 * en excluant la clé "settings.yealink.token", et en chiffrant les données.
 */
export function exportLocalStorage() {
  const data = localStorage.getItem('wazo_plugin_rps');
  if (!data) {
    console.error('Aucune donnée trouvée sous la clé "wazo_plugin_rps".');
    return;
  }

  try {
    const parsedData = JSON.parse(data);

    // Supprimer la clé "settings.yealink.token" si elle existe
    if (parsedData.settings && parsedData.settings.yealink) {
      delete parsedData.settings.yealink.token;
    }
    console.log(SECRET_KEY);
    console.log(process.env);
    
    
    // Chiffrer les données
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(parsedData),
      SECRET_KEY
    ).toString();

    const blob = new Blob([encryptedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wazo_plugin_rpsbywazo.json';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur lors du traitement des données pour l\'exportation :', error);
  }
}

/**
 * Importe un fichier .json dans le localStorage sous la clé "wazo_plugin_rps",
 * en déchiffrant les données.
 * @param {File} file - Le fichier .json à importer
 */
export function importLocalStorage(file, { dispatch, showNotification }) {
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      // Déchiffrer les données
      const decryptedData = CryptoJS.AES.decrypt(
        event.target.result,
        SECRET_KEY
      ).toString(CryptoJS.enc.Utf8);

      const data = JSON.parse(decryptedData);
      localStorage.setItem('wazo_plugin_rps', JSON.stringify(data));
      dispatch(showNotification({ message: "Etats importés", status: 1 }));
    } catch (error) {
      console.error('Erreur lors de l\'importation des données :', error);
      dispatch(showNotification({ message: "Erreur import", status: 0 }));
    }
  };
  reader.readAsText(file);
}