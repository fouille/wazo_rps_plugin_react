// All components mapping with path for internal routes

import { lazy } from 'react'

const Dashboard = lazy(() => import('../pages/protected/Dashboard'))
const Welcome = lazy(() => import('../pages/protected/Welcome'))
const Page404 = lazy(() => import('../pages/protected/404'))
const Blank = lazy(() => import('../pages/protected/Blank'))
const Charts = lazy(() => import('../pages/protected/Charts'))
const Devices = lazy(() => import('../pages/protected/Devices'))
const Integration = lazy(() => import('../pages/protected/Integration'))
const Calendar = lazy(() => import('../pages/protected/Calendar'))
const Transactions = lazy(() => import('../pages/protected/Transactions'))
const GigasetSettings = lazy(() => import('../pages/protected/GigasetSettings'))
const FanvilSettings = lazy(() => import('../pages/protected/FanvilSettings'))
const YealinkSettings = lazy(() => import('../pages/protected/YealinkSettings'))
const SnomSettings = lazy(() => import('../pages/protected/SnomSettings'))
const WazoSettings = lazy(() => import('../pages/protected/WazoSettings'))

const routes = [
  {
    path: '/dashboard', // the url
    component: Dashboard, // view rendered
  },
  {
    path: '/welcome', // the url
    component: Welcome, // view rendered
  },
  {
    path: '/devices',
    component: Devices,
  },
  {
    path: '/calendar',
    component: Calendar,
  },
  {
    path: '/transactions',
    component: Transactions,
  },
  {
    path: '/settings-fanvil',
    component: FanvilSettings,
  },
  {
    path: '/settings-gigaset',
    component: GigasetSettings,
  },
  {
    path: '/settings-yealink',
    component: YealinkSettings,
  },
  {
    path: '/settings-snom',
    component: SnomSettings,
  },
  {
    path: '/settings-wazo',
    component: WazoSettings,
  },
  {
    path: '/integration',
    component: Integration,
  },
  {
    path: '/charts',
    component: Charts,
  },
  {
    path: '/404',
    component: Page404,
  },
  {
    path: '/blank',
    component: Blank,
  },
]

export default routes
