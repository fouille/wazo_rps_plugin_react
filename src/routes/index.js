// All components mapping with path for internal routes

import { lazy } from 'react'

const Dashboard = lazy(() => import('../pages/protected/Dashboard'))
const Page404 = lazy(() => import('../pages/protected/404'))
const Blank = lazy(() => import('../pages/protected/Blank'))
const Devices = lazy(() => import('../pages/protected/Devices'))
const GigasetSettings = lazy(() => import('../pages/protected/GigasetSettings'))
const FanvilSettings = lazy(() => import('../pages/protected/FanvilSettings'))
const YealinkSettings = lazy(() => import('../pages/protected/YealinkSettings'))
const SnomSettings = lazy(() => import('../pages/protected/SnomSettings'))
const WazoSettings = lazy(() => import('../pages/protected/WazoSettings'))
const AppSettings = lazy(() => import('../pages/protected/AppSettings'))

const routes = [
  {
    path: '/dashboard', // the url
    component: Dashboard, // view rendered
  },
  {
    path: '/devices',
    component: Devices,
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
    path: '/settings-app',
    component: AppSettings,
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
