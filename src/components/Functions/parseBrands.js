export const parseBrands = (json) => {
    const result = [];
    for (const brand in json) {
        if (json[brand].enabled) {
            result.push({ name: brand.charAt(0).toUpperCase() + brand.slice(1), value: brand });
        }
    }
    return result;
};

//pour afficher dynamiquement les cartes des brands sur le dashboard
export const parseBrandsDashboard = (json) => {
    const result = [];
    for (const brand in json) {
        if (json[brand]) {
            result.push({ 
                title: brand.charAt(0).toUpperCase() + brand.slice(1), 
                value: (json[brand].enabled)? "Activé" : "Désactivé", 
                description: (json[brand].enabled)? "Les périphériques de ce serveur seront listés" : "Aucun périphérique ne sera listé", 
                colorIndex: (json[brand].enabled)? 0 : 1});
        }
    }
    return result;
};