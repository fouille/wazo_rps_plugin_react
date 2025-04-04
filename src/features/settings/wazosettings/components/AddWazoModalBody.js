import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { formatMacAddress } from "../../../../components/Functions/outils"


function AddWazoModalBody({ extraObject, closeModal}){

    ////
    const dispatch = useDispatch()
        const [loading, setLoading] = useState(false)
        const [errorMessage, setErrorMessage] = useState("")
    
        const { message, type, _id, errors } = extraObject

    return(
        <>
            <div className="overflow-x-auto w-full">
                    <table className="table w-full">
                        <thead>
                        <tr>
                            <th>Mac</th>
                            <th>Source</th>
                            <th>Erreur</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            errors.map((l) => {
                                return(
                                    <tr>
                                        <td>
                                            <div className="font-bold">{l.mac}</div>
                                        </td>
                                        <td>{l.source}</td>
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