import DashboardStats from './components/DashboardStats'
import AmountStats from './components/AmountStats'
import PageStats from './components/PageStats'

import UserGroupIcon  from '@heroicons/react/24/outline/UserGroupIcon'
import UsersIcon  from '@heroicons/react/24/outline/UsersIcon'
import CircleStackIcon  from '@heroicons/react/24/outline/CircleStackIcon'
import CreditCardIcon  from '@heroicons/react/24/outline/CreditCardIcon'
// import UserChannels from './components/UserChannels'
import Panel1 from './components/Panel1'
import Panel2 from './components/Panel2'
// import DashboardTopBar from './components/DashboardTopBar'
// import { useDispatch } from 'react-redux'
// import {showNotification} from '../common/headerSlice'
// import DoughnutChart from './components/DoughnutChart'
// import { useState } from 'react'

const statsData = [
    {title : "Yealink", value : "Actif", icon : <UserGroupIcon className='w-8 h-8'/>, description : ""},
    {title : "Fanvil", value : "Désactivé", icon : <CreditCardIcon className='w-8 h-8'/>, description : ""},
    {title : "Snom", value : "Désactivé", icon : <CircleStackIcon className='w-8 h-8'/>, description : ""},
    {title : "Gigaset", value : "Désactivé", icon : <UsersIcon className='w-8 h-8'/>, description : ""},
]



function Dashboard(){

    // const dispatch = useDispatch()
 

    // const updateDashboardPeriod = (newRange) => {
    //     // Dashboard range changed, write code to refresh your values
    //     dispatch(showNotification({message : `Period updated to ${newRange.startDate} to ${newRange.endDate}`, status : 1}))
    // }

    return(
        <>
        {/** ---------------------- Select Period Content ------------------------- */}
            {/* <DashboardTopBar updateDashboardPeriod={updateDashboardPeriod}/> */}
        
        {/** ---------------------- Different stats content 1 ------------------------- */}
            <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
                {
                    statsData.map((d, k) => {
                        return (
                            <DashboardStats key={k} {...d} colorIndex={k}/>
                        )
                    })
                }
            </div>



        {/** ---------------------- Different charts ------------------------- */}
            <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
                <Panel1 />
                <Panel2 />
            </div>
            
        {/** ---------------------- Different stats content 2 ------------------------- */}
        
            {/* <div className="grid lg:grid-cols-2 mt-10 grid-cols-1 gap-6">
                <AmountStats />
                <PageStats />
            </div> */}

        {/** ---------------------- User source channels table  ------------------------- */}
        
            {/* <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
                <UserChannels />
                <DoughnutChart />
            </div> */}
        </>
    )
}

export default Dashboard