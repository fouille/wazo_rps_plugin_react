export default async function simulateProgress(callback, brand, stopSignal) {
    let percentageCompleted = 0;

    while (percentageCompleted < 100) {
        if (stopSignal.isCancelled) {
            // console.log("Progress simulation stopped.");
            callback(',' + 0);
            break; // Arrête la boucle si le signal d'arrêt est activé
        }

        percentageCompleted = Math.min(percentageCompleted + 10, 100); // Incrémentation par 10%
        callback(brand + ',' + percentageCompleted);

        // Attendre 1 seconde avant la prochaine incrémentation
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}