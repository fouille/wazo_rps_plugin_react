import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import AppSettings from '../../features/settings/appsettings'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "App Settings"}))
      }, [])


    return(
        <AppSettings />
    )
}

export default InternalPage