// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Filler,
//   Legend,
// } from 'chart.js';
// import { Line } from 'react-chartjs-2';
import TitleCard from '../../../components/Cards/TitleCard';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Filler,
//   Legend
// );

function Panel1(){

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//     },
//   };

  
//   const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

//   const data = {
//   labels,
//   datasets: [
//     {
//       fill: true,
//       label: 'MAU',
//       data: labels.map(() => { return Math.random() * 100 + 500 }),
//       borderColor: 'rgb(53, 162, 235)',
//       backgroundColor: 'rgba(53, 162, 235, 0.5)',
//     },
//   ],
// };
  

    return(
      <TitleCard title={"Qu'est-ce ?"}>
          Le plugin RPS de Wazo vous permets de créer un poste par son adresse mac et de le lier à un serveur RPS.
      </TitleCard>
    )
}


export default Panel1