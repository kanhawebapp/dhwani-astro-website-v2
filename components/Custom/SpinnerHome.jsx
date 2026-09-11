"use client";
import { useState } from "react";
import Image from "next/image";
import "../../app/styles/spin-pop.css";

export default function SpinnerHome() {
  const [open, setOpen] = useState(false);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const slices = ["Free Chat", "Cashback", "Try Again"];
  const centers = [60, 180, 300];
const spinWheel = () => {
  if (spinning) return;

  setSpinning(true);

  const sliceCount = slices.length; 
  const sliceAngle = 360 / sliceCount; 

  
  const randomIndex = Math.floor(Math.random() * sliceCount) ;


  const randomOffset = Math.random() * sliceAngle;


  const sliceStart = randomIndex * sliceAngle;

 
  const landingAngle = sliceStart + randomOffset;

 
  const fullRotations = 360 * (10 + Math.floor(Math.random() * 6));


  setAngle((prev) => prev + fullRotations + landingAngle);

  setTimeout(() => {
    console.log("Landed on:", slices[randomIndex]);
    setSpinning(false);
  }, 5200);
};


  return (
    <> 
<div
  onClick={() => window.open("https://wa.me/919319490827", "_blank")}
  className="cursor-pointer z-999"
>
  <img
    src="/ds-img/watsapp.gif"
    alt="Gift"
    className="sm:w-17 sm:h-17 w-13 h-13 object-contain fixed bottom-0 right-1 sm:right-5 z-10"
  />
</div>
      <div
        className="fixed hidden bottom-0 right-5 z-10 shake-cycle cursor-pointer"
        onClick={() => setOpen(true)}
       >
        <Image
          src="/ds-img/spinnn.png"
          alt="spinner"
          width={90}
          height={90}
          className="-mt-1"
        />
      </div>

      {open && (
        <div className="popup-overlay" onClick={() => setOpen(false)}>
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/ds-img/arrow.png"
              alt="arrow"
              width={90}
              height={90}
              className="arr-img"
            />

            <div className="content-wrapper-spin-im">
              <div className="spinn-app-img head-wrap overflow-hidden">
                <Image
                  className="spin-image-back w-full z-999 h-90 sm:h-85"
                  src="/ds-img/ors.png"
                  alt="spin chakra image"
                  unoptimized
                  loading="lazy"
                  width={50}
                  height={50}
                />

                {/* 🔥 ONLY CHANGE IS HERE */}
                <div
                  className="wheel-svg mob-app-image"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transition: spinning
                      ? "transform 5s cubic-bezier(.22,.61,.36,1)"
                      : "none",
                  }}
                >
                  {/* SVG — UNCHANGED */}
                  <svg width="230" height="230" viewBox="0 0 260 260">
                    <circle cx="130" cy="130" r="130" fill="white" />

                    <defs>
                      <path id="arc1" d="M130,30 A100,100 0 0,1 217.32,180" />
                      <path id="arc2" d="M217.32,180 A100,100 0 0,1 42.67,180" />
                      <path id="arc3" d="M42.67,180 A100,100 0 0,1 130,30" />
                    </defs>

                    <defs>
                      <radialGradient id="pathGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(42, 155, 123, 1)" />
                        <stop offset="50%" stopColor="rgba(87, 199, 133, 1)" />
                        <stop offset="100%" stopColor="rgba(165, 237, 83, 0.99)" />
                      </radialGradient>
                    </defs>

                    <path d="M130 130 L130 30 A100 100 0 0 1 217.32 180 Z" fill="url(#pathGradient)" />

                    <defs>
                      <linearGradient id="bottomPathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fcff9e" />
                        <stop offset="100%" stopColor="#c67700" />
                      </linearGradient>
                    </defs>

                    <path d="M130 130 L217.32 180 A100 100 0 0 1 42.67 180 Z" fill="url(#bottomPathGradient)" />

                    <defs>
                      <radialGradient id="lastPathGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(235, 21, 42, 1)" />
                        <stop offset="100%" stopColor="rgba(233, 148, 154, 1)" />
                      </radialGradient>
                    </defs>

                    <path d="M130 130 L42.67 180 A100 100 0 0 1 130 30 Z" fill="url(#lastPathGradient)" />

                    <text fontWeight="600" fill="#444">
                      <textPath className="text-spin" href="#arc1" startOffset="50%" textAnchor="middle">
                        Free Chat
                      </textPath>
                    </text>

                    <text fontWeight="600" fill="#444">
                      <textPath className="text-spin" href="#arc2" startOffset="50%" textAnchor="middle">
                        Cashback
                      </textPath>
                    </text>

                    <text fontWeight="600" fill="#444">
                      <textPath className="text-spin" href="#arc3" startOffset="50%" textAnchor="middle">
                        Try Again
                      </textPath>
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            <button
              className="spin-btn rounded-full shadow-2xl border-b border-gray-300"
              disabled={spinning}
              onClick={spinWheel}>
              {spinning ? "Spinning..." : "Spin"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
