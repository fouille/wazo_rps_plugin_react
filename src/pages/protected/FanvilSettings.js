import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import FanvilSettings from '../../features/settings/fanvilsettings'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Fanvil Settings"}))
      }, [])


    return(
        <FanvilSettings />
    )
}

export default InternalPage