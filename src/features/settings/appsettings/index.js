import { useState, useRef } from "react";
import { useDispatch } from "react-redux"
import { showNotification } from '../../common/headerSlice'
import TitleCard from "../../../components/Cards/TitleCard"
import {exportLocalStorage, importLocalStorage} from "../../../components/Functions/controlLocalStorage"

const Text = ({ children }) => <span>{children}</span>

function AppSettings(){
    const dispatch = useDispatch();
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleImport = () => {
        if (selectedFile) {
            importLocalStorage(selectedFile, { dispatch, showNotification });
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Réinitialise la valeur du champ input
            }
        } else {
            dispatch(showNotification({ message: "Veuillez sélectionner un fichier avant d'importer.", status: 0 }));
        }
    };

    return(
        <>
            
            <TitleCard title="Application | Sauvegarde" topMargin="mt-2">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-10">
                    <Text>
                        Les états de configuration étant stockés localement dans votre navigateur, vous pouvez les exporter et les importer.
                    </Text>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Text>
                        <b>Exporter les états de configuration :</b>
                    </Text>
                    <Text>
                        <b>Importer les états de configuration :</b>
                    </Text>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="mt-8">
                    <button className="btn btn-primary float-left" onClick={() => exportLocalStorage() }>Exporter</button>
                    </div>
                    <div className="mt-8">
                    <input
                        type="file"
                        className="file-input"
                        accept="application/json"
                        ref={fileInputRef}
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <button disabled={!selectedFile} className="btn btn-primary ml-5" onClick={handleImport}>Importer</button>
                    </div>
                </div>
            </TitleCard>
        </>
    )
}


export default AppSettings