import DashboardRpsStats from './components/DashboardRpsStats'
import Panel1 from './components/Panel1'
import Panel2 from './components/Panel2'
import { parseBrandsDashboard } from '../../components/Functions/parseBrands'


function Dashboard(){
    const getStorage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
    const getbrands = parseBrandsDashboard(getStorage.settings)
    // const dispatch = useDispatch()

    return(
        <>
        
        {/** ---------------------- Affiche les Status dactivation des RPS ------------------------- */}
            <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
                {
                    getbrands.map((d, k) => {
                        return (
                            <DashboardRpsStats key={k} {...d} />
                        )
                    })
                }
            </div>



        {/** ---------------------- Blocs accueil du Dashboard ------------------------- */}
            <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
                <Panel1 />
                <Panel2 />
            </div>
        </>
    )
}

export default Dashboard