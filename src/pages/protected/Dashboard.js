import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import Dashboard from '../../features/dashboard/index'
import { SetLocalStorage } from '../../features/common/baseLocalstorage'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "RPS pour Wazo"}))
        // dispatch(SetLocalStorage())
      }, [])


    return(
        <Dashboard />
    )
}

export default InternalPage