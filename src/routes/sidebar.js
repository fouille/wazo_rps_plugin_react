import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon'
import CircleStackIcon from '@heroicons/react/24/outline/CircleStackIcon'
import Cog6ToothIcon from '@heroicons/react/24/outline/Cog6ToothIcon'
import InboxArrowDownIcon from '@heroicons/react/24/outline/InboxArrowDownIcon'
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon'

const iconClasses = `h-6 w-6`
const submenuIconClasses = `h-5 w-5`

const routes = [

  {
    path: '/app/dashboard',
    icon: <Squares2X2Icon className={iconClasses}/>, 
    name: 'Accueil',
  },
  {
    path: '/app/devices', // url
    icon: <InboxArrowDownIcon className={iconClasses}/>, // icon component
    name: 'Périphériques', // name that appear in Sidebar
  },
  {
    path: '', //no url needed as this has submenu
    icon: <Cog6ToothIcon className={`${iconClasses} inline` }/>, // icon component
    name: 'Paramètres', // name that appear in Sidebar
    submenu : [
      {
        path: '/app/settings-fanvil', //url
        icon: <CircleStackIcon className={submenuIconClasses}/>, // icon component
        name: 'Fanvil', // name that appear in Sidebar
      },
      {
        path: '/app/settings-gigaset',
        icon: <CircleStackIcon className={submenuIconClasses}/>,
        name: 'Gigaset',
      },
      {
        path: '/app/settings-snom', // url
        icon: <CircleStackIcon className={submenuIconClasses}/>, // icon component
        name: 'Snom', // name that appear in Sidebar
      },
      {
        path: '/app/settings-yealink', // url
        icon: <CircleStackIcon className={submenuIconClasses}/>, // icon component
        name: 'Yealink', // name that appear in Sidebar
      },
      {
        path: '/app/settings-wazo', // url
        icon: <PhoneIcon className={submenuIconClasses}/>, // icon component
        name: 'Wazo', // name that appear in Sidebar
      }
    ]
  }
  
]

export default routes


