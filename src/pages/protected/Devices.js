import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import Devices from '../../features/devices'
import { DevicesProvider } from '../../features/devices/components/DevicesContext'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Devices"}))
      }, [])


    return(
        <DevicesProvider>
            <Devices />
        </DevicesProvider>
        
    )
}

export default InternalPage