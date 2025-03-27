import TitleCard from '../../../components/Cards/TitleCard';
const Text = ({ children }) => <span>{children}</span>
const storage = JSON.parse(localStorage.getItem("wazo_plugin_rps"))
const accountType = storage.global.accountType
const firstname = storage.global.appFirstname;
const lastname = storage.global.appLastname;
function User(){
    return(
        <TitleCard titleClass={"text-primary"} title={`Bonjour ${firstname + ' ' + lastname}`}>
            <Text>
                Vous êtes connecté en tant que : {accountType}<br />
                Vous pouvez utiliser {(accountType === "resellers" || accountType === "administrators")? "et paramétrer" : ""} l'application RPS by Wazo
            </Text>
        </TitleCard>
    )
}


export default User