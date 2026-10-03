import Banner from "./Banner";
import Astronewcard from "./Astronewcard";
import SpinnerHome from "./Custom/SpinnerHome";

import RemecalcLazy from "./Custom/Remecalc.lazy";
import AstrostoreLazy from "./Custom/AstrostoreSection";
import AboutdirectLazy from "./Custom/AboutDirectorSection";
import CredentLazy from "./Custom/Credent.lazy";
import BlogsectionLazy from "./Custom/Blogsection.lazy";
import FAQueLazy from "./Custom/FAQue.lazy";
import TestimonLazy from "./Custom/Testimon.lazy";
import AboutUsLazy from "./Custom/AboutUs.lazy";
import DownappSection from "./Custom/DownappSection";
//import Problembase from "./Problembase";
//import Pujahome from "./Pujahome";
//import Pujacards from "./Homepagecomp/Probchallenge/Renderpage/Probcompo/Pujacards";
//import PujasuggestClient from "@/app/freeservices/kundali/getKundaliPage/suggestions/puja/Pujasuggest";

export default function Mainhomecom() {
  return (
    <div className="flex flex-col gap-5 pt-0 main_body-content w-full">

      {/* Primary page heading */}
      {/* <h1 className="text-[#2f1254] text-xl sm:text-2xl lg:text-3xl text-center font-semibold px-4">
        Online Astrology, Horoscope & Kundli Services
      </h1> */}

      <Banner />

      <Astronewcard />

      <SpinnerHome />

      {/* CLIENT lazy islands */}
      {/* <ProblembaseLazy /> */}
      {/* <Problembase /> */}
      {/* <Pujahome /> */}
      {/* <Pujacards /> */}
      {/* <PujasuggestClient /> */}
      <RemecalcLazy />

      <AstrostoreLazy />

      <DownappSection />

      <AboutdirectLazy />

      <CredentLazy />

      <BlogsectionLazy />

      <FAQueLazy />

      <TestimonLazy />

      <AboutUsLazy />

    </div>
  );
}