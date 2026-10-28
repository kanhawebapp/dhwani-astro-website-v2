// import Astronewcard from "./Astronewcard";
import AstrologerSection from "./Custom/AstrologerSection"
import SpinnerHome from "./Custom/SpinnerHome";
import Banner from "./Custom/Banner"
import RemecalcLazy from "./Custom/Remecalc.lazy";
import AstrostoreLazy from "./Custom/AstrostoreSection";
import AboutdirectLazy from "./Custom/AboutDirectorSection";
import CredentLazy from "./Custom/Credent.lazy";
import BlogsectionLazy from "./Custom/Blogsection.lazy";
import FAQueLazy from "./Custom/FAQue.lazy";
import TestimonLazy from "./Custom/Testimon.lazy";
import AboutUsLazy from "./Custom/AboutUs.lazy";
import DownappSection from "./Custom/DownappSection";
import PujaSection from "../app/puja-services/PujaSection"
// import Consulque from "./Consulque";
// import ProblembaseClient from "./Custom/ProblembaseClient";



export default function Mainhomecom() {
  return (
    <div className="flex flex-col gap-5 pt-0 main_body-content w-full">


      <Banner />

      {/* <Astronewcard /> */}
      <AstrologerSection />
      {/* <Consulque /> */}

     
      {/* <ProblembaseClient /> */}

      <SpinnerHome />

    
      <RemecalcLazy />

      <PujaSection />

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