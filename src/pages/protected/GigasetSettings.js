import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import GigasetSettings from '../../features/settings/gigasetsettings'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Gigaset Settings"}))
      }, [])


    return(
        <GigasetSettings />
    )
}

export default InternalPage