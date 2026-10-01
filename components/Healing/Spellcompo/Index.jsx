
// import { useRouter } from 'next/navigation'; 
// import { spelldata } from './spelldata';
// import { useState } from 'react';
// import Imagecom from '@/components/Homepagecomp/Consultations/Concompo/Imagecom';
// import Healdetail from '../Healcompo/Healdetail';
// import toast from 'react-hot-toast';
// import CustomButton from '@/components/Custom/CustomButton';

// const Spell = ({ pageName }) => {
//   const router = useRouter();
//   const pageContent = spelldata[pageName] || null;
//   const [pkgId, setPkgId] = useState(null);

//   if (!pageContent) {
//     return <div>Page not found</div>;
//   }
//    const scrollToTop = () => {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//     };
//   const handleBooking = () => {
//     if (!pkgId) {
//       toast.error('Please select a session package before booking.');
//       return;
//     }

//     //toast.success('Session selected. Proceeding to booking...') ;
//     setTimeout(() => {
//       router.push(`/spelling/${pageName}/selectastro`);
//     }, 1000);
//   };

//   return (
//     <div className="flex items-start justify-start px-2 sm:px-4  py-5 md:py-10">
//       <div className="bg-white shadow-2xl rounded-3xl overflow-hidden max-w-7xl w-full flex flex-col sm:flex-row items-start">
//         <div className="md:w-1/2  flex items-center justify-center p-4">
//           <Imagecom data={pageContent.firstSection} />
//         </div>

//         <div className="md:w-1/2 w-full py-4 px-3  sm:pr-8 flex flex-col justify-between">
//           <Healdetail data={pageContent.secondSection} pkgId={pkgId} setPkgId={setPkgId} />

//           <CustomButton aria-label="Book Spell Session" variant={"purple"} 
//             className="mt-5  rounded-xl  duration-300 place-self-center w-[50%]"
//             onClick={handleBooking}>
//             Book Now
//           </CustomButton>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Spell;
