export const parseBrands = (json) => {
    const result = [];
    for (const brand in json) {
        if (json[brand].enabled) {
            result.push({ name: brand.charAt(0).toUpperCase() + brand.slice(1), value: brand });
        }
    }
    return result;
};