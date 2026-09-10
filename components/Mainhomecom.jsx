import Banner from "./Banner";
import Astronewcard from "./Astronewcard";
import SpinnerHome from "./Custom/SpinnerHome";

// Lazy islands
import RemecalcLazy from "./Custom/Remecalc.lazy";
import AstrostoreLazy from "./Custom/AstrostoreSection";
import AboutdirectLazy from "./Custom/AboutDirectorSection";
import CredentLazy from "./Custom/Credent.lazy";
import BlogsectionLazy from "./Custom/Blogsection.lazy";
import FAQueLazy from "./Custom/FAQue.lazy";
import TestimonLazy from "./Custom/Testimon.lazy";
import AboutUsLazy from "./Custom/AboutUs.lazy";
import DownappSection from "./Custom/DownappSection";
import Problembase from "./Problembase";

export default function  Mainhomecom() {
  return (
    <div className="flex flex-col gap-5 pt-0 main_body-content w-full">

      {/* SERVER (fast!) */}
      <Banner />
      <Astronewcard />
      {/* <SpinnerHome /> */}

      {/* CLIENT lazy islands */}
      {/* <ProblembaseLazy /> */}
      {/* <Problembase /> */}
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
