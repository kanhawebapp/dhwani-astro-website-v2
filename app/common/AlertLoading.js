// components/LoadingPopup.js
"use client";

import React,{memo} from "react";


 function AlertLoading({ show = false, title }) {



  if (!show) return null;



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70">
      <div className="flex items-center gap-2 p-4 bg-white rounded-full shadow-lg">
          <div className="loader"></div>
          <p className="text-black text-amber-200">{title}</p>
        </div>
      {/* <div className=" flex justify-center flex-col gap-4 items-center h-32">
        <span className="loader-all"></span>
        <span className="ml-3 text-purple-600 font-medium">{title || "Please Wait..."}</span>
      </div> */}
      <style jsx>{`
          .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            animation: spin 1s linear infinite;
            
        
          }
  
   @keyframes spin {
          0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
    </div>
  );
}



export default React.memo(AlertLoading);