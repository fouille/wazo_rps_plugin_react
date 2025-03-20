import TitleCard from '../../../components/Cards/TitleCard';
const Text = ({ children }) => <span>{children}</span>

function Panel1(){
    return(
      <TitleCard titleClass={"text-primary"} title={"Bienvenue sur le plugin RPS by Wazo"}>
      <Text>
        Ce plugin vous permets : <br />
        <br />
        <li class="ml-5">D'activer ou de désactiver des Serveurs RPS</li>
        <li class="ml-5">D'ajouter des périphériques à un serveur RPS et à votre site Wazo</li>
        <li class="ml-5">De supprimer des périphériques d'un serveur RPS et de votre site Wazo</li>
        <li class="ml-5">De réaliser des ajouts et des suppressions en masse</li>
      </Text>
      </TitleCard>
    )
}


export default Panel1