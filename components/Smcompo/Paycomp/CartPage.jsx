// 'use client';

// import { useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import Prodetail from "./Prodetail";
// //import PriceGST from "./PriceGST";
// import PayOPT from "./PayOPT";
// import Booking from "./Booking";
// import { decryptData } from "@/app/helper/cryptoHelper";
// import { addTwoValues, gst } from "@/app/helper/helper";





// export default function CartPage() {

//   const searchParams = useSearchParams();
//   const amount = decryptData(searchParams.get('amount'));
//   const orderid = decryptData(searchParams.get('orderId'))
//   const [showProDetail, setShowProDetail] = useState(true);
//   const [show, setShow] = useState(false);

//   const selectedPack = {
//     name: searchParams.get("pack"),
//     price: parseFloat(searchParams.get("price") || 0),
//     talktime: parseFloat(searchParams.get("talktime") || 0),
//   };



//   useEffect(() => {
//     const param = searchParams.get("showProDetail");
//     if (param === "false") {
//       setShow(true);
//       setShowProDetail(false);
//     }
//   }, [searchParams]);

//   const totalgst = (amount) => {
//     const parsedAmount = parseInt(amount);

//     return gst(parsedAmount);
//   };


//   const finalamount = addTwoValues(parseInt(amount), totalgst(parseInt(amount)));



//   return (
//     <div className="text-gray-500 lg:w-[70%] w-full md:p-4 p-2 bg-white rounded-xl shadow-md flex flex-col gap-3 my-2 md:my-8">
//       <h5 className="sm:text-xl text-base font-semibold bg-purple-400 text-white rounded-full px-15 py-2 place-self-center">
//         Booking Information
//       </h5>

//       {/* {showProDetail && <Prodetail pack={selectedPack}  amount={amount}/>} */}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

//         <> <div className="p-2 text-white shadow-2xl rounded-xl sm:p-4">
//           <h3 className=" bg-[linear-gradient(to_right,#a65ed677_54%,#ba38cb67_100%)] py-1 px-2 place-self-center w-full rounded-lg text-sm sm:text-lg font-bold mb-2">Payment </h3>
//           <div className="p-2 space-y-2 text-black bg-white rounded-xl sm:p-4">
//             <div className="flex justify-between">
//               <span className="text-sm font-medium">Amount</span>
//               <span className="text-sm">{amount} </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium">GST @18%</span>
//               <span className="text-sm">{totalgst(parseInt(amount))}</span>
//             </div>

//             <hr />
//             <div className="flex justify-between border border-gray-gray-200 rounded-2xl p-2 bg-gray-100">
//             <input type="text" />
//             <button className="text-green-300 text-sm">Apply Coupon</button>
//             </div>
//             <hr />

//             <div className="flex justify-between text-lg font-bold">
//               <span className="text-sm font-medium">Total Payable Amount</span>
//               <span className="text-sm">{addTwoValues(parseInt(amount), totalgst(parseInt(amount)))}</span>
//             </div>
//           </div>
//         </div></>

//         {
//           show ?
//             <PayOPT /> : <Booking amount={parseInt(amount)} generateid={orderid} />
//         }


//       </div>
//     </div>
//   );
// }
