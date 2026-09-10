'use client';
import Image from "next/image";
import { useState } from "react";

export default function Prodetail({ initialQty = 1, totalQuantity = 10,amount }) {
        const [qty, setQty] = useState(initialQty);
   const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
  const minusQty = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const plusQty = () => {
    if (qty < totalQuantity) setQty(qty + 1);
  };
  return (
    <div className="flex flex-col overflow-hidden border border-gray-200 upr-div rounded-xl">
        <div className="flex items-center justify-between p-4 text-sm font-semibold bg-gray-100 sm:text-base">
          <span >Product</span>
          <span>No of Healing</span>
          <span>Price</span>
        </div>

        <div className="flex items-center justify-between p-4 border-t ">
          {/* Product Info */}
          <div className="flex flex-col items-center w-1/3 gap-4 sm:flex-row">
            <Image width={100} height={100} src="/ds-img/ser1.webp" alt="Pregnancy Healing" className="object-cover w-12 h-12 rounded sm:w-16 sm:h-16" />
            <div>
              <div className="text-xs font-medium sm:text-base">Pregnancy Healing</div>
              {/* <span className="text-xs text-white px-3 py-1 rounded-lg hidden sm:block place-self-center bg-[linear-gradient(to_right,_#a65ed677_54%,_#ba38cb67_100%)]">
                Selected Astrologer : Healer Gauri
              </span> */}
            </div>
              
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-center w-1/3 ">
            <div className="flex items-center gap-2 p-1 bg-white border border-gray-300 rounded-full shadow-sm sm:gap-3 sm:p-2 w-fit">
              <input
                type="hidden"
                id="qty"
                name="product_qty[]"
                value={qty}
              />
              <input
                type="hidden"
                id="totalquantity"
                name="totalquantity"
                value={totalQuantity}
              />

              <button aria-label="Decrease quantity" 
                onClick={minusQty}
                className="w-4 h-4 text-sm font-semibold bg-purple-100 rounded-xl sm:w-6 sm:h-6 hover:bg-purple-200 sm:text-lg sm:font-bold"> - </button>

              <span
                id="viewQtys"
                className="px-2 py-1 text-xs text-center text-gray-700 bg-gray-100 border border-gray-200 rounded-xl sm:px-4 sm:text-sm"> {qty} </span>

              <button aria-label="Increase quantity"
                onClick={plusQty}
                className="w-4 h-4 text-sm font-semibold bg-purple-100 rounded-xl sm:w-6 sm:h-6 hover:bg-purple-200 sm:text-lg sm:font-bold"> + </button>
            </div>
          </div>

          <div className="flex items-center justify-end w-1/3 text-base font-semibold sm:text-lg place-items-center">
            <span> {amount ?? 0}</span>
          </div>
          
        </div>
           <span className="text-xs text-white px-3 py-1 rounded-lg  sm:hidden place-self-center my-2 bg-[linear-gradient(to_right,#a65ed677_54%,#ba38cb67_100%)]">
                Selected Astrologer : Healer Gauri
              </span>
      </div>
  );
}