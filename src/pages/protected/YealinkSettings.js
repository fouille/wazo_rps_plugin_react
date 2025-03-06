import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import YealinkSettings from '../../features/settings/yealinksettings'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Yealink Settings"}))
      }, [])


    return(
        <YealinkSettings />
    )
}

export default InternalPage