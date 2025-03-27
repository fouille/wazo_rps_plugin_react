/**
 * Exporte le contenu du localStorage sous la clé "wazo_plugin_rps" en fichier .json,
 * en excluant la clé "settings.yealink.token".
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

    const filteredData = JSON.stringify(parsedData, null, 2); // Beautify JSON output
    const blob = new Blob([filteredData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wazo_plugin_rps.json';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur lors du traitement des données pour l\'exportation :', error);
  }
}
  
/**
 * Importe un fichier .json dans le localStorage sous la clé "wazo_plugin_rps"
 * @param {File} file - Le fichier .json à importer
 */
export function importLocalStorage(file, { dispatch, showNotification }) {
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);
      localStorage.setItem('wazo_plugin_rps', JSON.stringify(data));
      dispatch(showNotification({ message: "Etats importés", status: 1 }))
    } catch (error) {
      console.error('Erreur lors de l\'importation des données :', error);
      dispatch(showNotification({ message: "Erreur import", status: 0 }))
    }
  };
  reader.readAsText(file);
}