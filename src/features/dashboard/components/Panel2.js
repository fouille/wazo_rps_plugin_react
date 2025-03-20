import TitleCard from '../../../components/Cards/TitleCard';
const Text = ({ children }) => <span>{children}</span>

function Panel2(){

    return(
      <TitleCard titleClass={"text-primary"} title={"Comment faire ?"}>
          <Text>
            Afin de faire fonctionner le plugin RPS by Wazo, vous devez activer au minimum un serveur RPS. <br />
            Le traitement des périphériques est possible uniquement si un serveur RPS est activé. <br />
            <br />
            L'intégralité des fonctionnalités du plugin RPS by Wazo sont disponibles dans le menu de gauche. <br />
            <br />
            Le menu "Périphériques" vous permet d'ajouter et supprimer des périphériques directement dans le serveur RPS choisi et dans votre site Wazo. <br />
          </Text>
      </TitleCard>

    )
}


export default Panel2