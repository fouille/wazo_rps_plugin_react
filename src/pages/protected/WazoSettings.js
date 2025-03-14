import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import WazoSettings from '../../features/settings/wazosettings'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Wazo Settings"}))
      }, [])


    return(
        <WazoSettings />
    )
}

export default InternalPage