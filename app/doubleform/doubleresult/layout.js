import Callchatsec from "@/components/Smcompo/Callchatsec";
import FAQue from "@/components/FAQue";
import Kuninterimg from "@/components/Kundli/Kundliinter/Kunfreeimg";
import Bestsell from "@/components/Smcompo/Bestsell/Bestsell";
// import Freereport from "@/components/Smcompo/Freereport";
// import Recastro from "@/components/Smcompo/Recastro";
import Sidebanner from "@/components/Smcompo/Sidebanner";
import Link from "next/link";
export default function layout({ children }) {
  return (
    <>
      <section className="kundli-inter-page w-full flex flex-col items-center justify-center md:p-5 p-2">
        <div className="kundli-top-sec w-full">
          <Kuninterimg />
        </div>

        <div className="kundli-items-box-side flex flex-col md:grid grid-cols-4 md:px-0 lg:px-20 gap-2 lg:gap-5 py-5">
          <div className="kundli-items-main col-span-3 flex flex-col gap-10">
            <Link
              href={"/"}
              className="text-2xl flex items-center gap-2 font-bold text-[#2f1254]"
            >
              <svg width={18} height={18} viewBox="0 0 640 640">
                <path d="M169.4 297.4C156.9 309.9 156.9 330.2 169.4 342.7L361.4 534.7C373.9 547.2 394.2 547.2 406.7 534.7C419.2 522.2 419.2 501.9 406.7 489.4L237.3 320L406.6 150.6C419.1 138.1 419.1 117.8 406.6 105.3C394.1 92.8 373.8 92.8 361.3 105.3L169.3 297.3z" />
              </svg>{" "}
              <small className="text-xs font-extralight">Go to main page1</small>
            </Link>
            {children}
          </div>
          <div className="kundli-side flex flex-col items-center justify-start gap-3">
            <Bestsell />
            <Sidebanner />
          </div>
        </div>

        {/* <Freereport /> */}
        {/* <Recastro /> */}
        <FAQue />
        <Callchatsec />
      </section>
    </>
  );
}
