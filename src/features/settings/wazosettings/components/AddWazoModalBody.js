import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { formatMacAddress } from "../../../../components/Functions/outils"


function AddWazoModalBody({ extraObject, closeModal}){

    ////
    const dispatch = useDispatch()
        const [loading, setLoading] = useState(false)
        const [errorMessage, setErrorMessage] = useState("")
    
        const { message, type, _id, errors } = extraObject
        console.log("MODAL ERROR", extraObject);
        


    return(
        <>
            <div className="overflow-x-auto w-full">
                    <table className="table w-full">
                        <thead>
                        <tr>
                            <th>Source</th>
                            <th>Mac</th>
                            <th>Erreur</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            errors.map((l) => {
                                // let mac = l.mac
                                let macFormatted = formatMacAddress(l.mac)

                                return(
                                    <tr>
                                        <td>{l.source}</td>
                                        <td>
                                            <div className="font-bold">{macFormatted}</div>
                                        </td>
                                        <td>{l.message}</td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </table>
            </div>

        </>
    )
}

export default AddWazoModalBody