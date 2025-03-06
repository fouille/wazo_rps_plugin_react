import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import SnomSettings from '../../features/settings/snomsettings'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Snom Settings"}))
      }, [])


    return(
        <SnomSettings />
    )
}

export default InternalPage