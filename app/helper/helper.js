


// const gst = (amount) => {
//     const gstRate=18;
//     const gstAmount = (amount * gstRate) / 100;
//     return gstAmount;

// }

// const totalAmount = (gstAmount, packageAmount) => {
//     return gstAmount + (packageAmount || 0);
//   };

//    function addTwoValues(a, b) {
//   return a + b;
// }

// const GstAmount= (amount) => {

//     const amountWithGST = Math.floor(amount  + amount * 18 / 100);
//     return amountWithGST;

// }


// export const rechargepercentage=(amount,rate)=>{
//      const amountWithGST = Math.floor( amount * rate / 100);
//     return amountWithGST;

// }


// export const formatDate = (dateString) => {
 
//   const cleanString = dateString.replace(/(\d+)(st|nd|rd|th)/, "$1");

//   const date = new Date(cleanString);

//   if (isNaN(date)) return dateString; 

//   return date.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };
// export{
//     gst,totalAmount,addTwoValues,GstAmount
// }