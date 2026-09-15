"use client";

import { useParams } from "next/navigation";
import Inhoro from "@/components/navbarcomp/Horoscope/Horoscope";
import Kundlimain from "@/components/Kundli/Kundlimain";
import Chatastro from "@/components/navbarcomp/Chatastro";
import Callastro from "@/components/navbarcomp/Callastro";
import Dhservices from "@/components/navbarcomp/Dhservices";
import Healing from "@/components/Healing/Healing";
import Kuninter from "@/components/Kundli/Kundliinter/Kuninter";
import Numerohome from "@/components/navbarcomp/Numerohome";
import Formdcalc from "@/components/Homepagecomp/Formdcalc";
import Muhurata from "@/components/Homepagecomp/Perastroserv/Muhurata";
import Yearlyy from "@/components/Homepagecomp/Perastroserv/Yearly";
import Child from "@/components/Homepagecomp/Perastroserv/Child";
import Property from "@/components/Homepagecomp/Perastroserv/Property";
import Legal from "@/components/Homepagecomp/Perastroserv/Legal";
import Business from "@/components/Homepagecomp/Perastroserv/Business";
import Matching from "@/components/Homepagecomp/Perastroserv/Matching";
import Loveproblem from "@/components/Homepagecomp/Probchallenge/Loveprob";
import Jobprob from "@/components/Homepagecomp/Probchallenge/Jobprob";
import Moneyprob from "@/components/Homepagecomp/Probchallenge/Money";
import Healthprob from "@/components/Homepagecomp/Probchallenge/Healthpr";
import Pregprob from "@/components/Homepagecomp/Probchallenge/Pregnancy";
import Education from "@/components/Homepagecomp/Probchallenge/Education";
import Marriageprob from "@/components/Homepagecomp/Probchallenge/Marriageprob";
import Index from "@/components/Homepagecomp/Probchallenge/Renderpage/Intercompo";
import Marriageconsult from "@/components/Homepagecomp/Perastroserv/Marriage";
import Healthcon from "@/components/Homepagecomp/Perastroserv/Health";
import Astrology from "@/components/Homepagecomp/Consultations/Astrologyy/Astrology";
import Medical from "@/components/Homepagecomp/Consultations/Astrologyy/Medical";
import Premium from "@/components/Homepagecomp/Consultations/Astrologyy/Premium";
import Businesscon from "@/components/Homepagecomp/Consultations/Astrologyy/Business";
import Pastlife from "@/components/Homepagecomp/Consultations/Astrologyy/Pastlife";
import Devotional from "@/components/Homepagecomp/Consultations/Astrologyy/Devotional";
import Selectastro from "@/components/Healing/Selectastro";
import CartPage from "@/components/Smcompo/Paycomp/CartPage";
import Spelling from "@/components/Healing/Spellcompo/Spelling";
import Heal from "@/components/Healing/Healcompo/Index";
import Spell from "@/components/Healing/Spellcompo/Index";
import SignInModal from "@/components/Homepagecomp/Signin/Signin";
import Doubleform from "../doubleform/page";
import AstroCCard from "@/components/navbarcomp/AstroCCard";
import RePack from "@/components/Smcompo/RePack";

import Userchatscr from "@/components/Smcompo/Userchatscr";
import AstrowaitPop from "@/components/Smcompo/AstrowaitPop";
import Lalkitab from "@/app/freeservices/kundali/getKundaliPage/lalkitab/LalkitabClient";
import CallOptionModal from "@/components/Smcompo/CallOptionModal";
// import Numerokundli from "@/components/Kundli/Kundliinter/Numerokundli/Numerokundli";
// import Nakshatra from "@/components/Kundli/Kundliinter/Nakshatra/Nakshatra";
import Charyogd from "@/app/freeservices/kundali/getKundaliPage/charyogdasha/page";


export default function ServicePage() {
    const params = useParams();
    const path = Array.isArray(params.main) ? params.main : [params.main];

    const navmainComponent = {
        chatAstro: <Chatastro />,
        callAstro: <Callastro />,
        healingservices: <Healing />,
        inHoroscope: <Inhoro />,
        inKundli: <Kundlimain />,
        problemLove: <Loveproblem />,
        numerohome: <Numerohome />,
        formdcalc: <Formdcalc />,
        muhurata: <Muhurata />,
        yearlyy: <Yearlyy />,
        child: <Child />,
        healthcon: <Healthcon />,
        property: <Property />,
        legal: <Legal />,
        business: <Business />,
        marriagecon: <Marriageconsult />,
        matching: <Matching />,
        jobprob: <Jobprob />,
        moneyprob: <Moneyprob />,
        health: <Healthprob />,
        pregnancy: <Pregprob />,
        education: <Education />,
        marriage: <Marriageprob />,
        astrology: <Astrology />,
        medical: <Medical />,
        premium: <Premium />,
        businesscon: <Businesscon />,
        pastlife: <Pastlife />,
        devotional: <Devotional />,
        spelling: <Spelling />,
        signin: <SignInModal />,
        doubleform: <Doubleform />,
        ccpage: <AstroCCard />,

        userchat: <Userchatscr />,
        lalkitab: <Lalkitab />,
        webmob: <CallOptionModal />,
        // kundlislug: <KundliMilanPage />,

    };

    const getKundlibtn = {
        getKundlipage: <Kuninter />,

        repack: <RePack />,
        signin: <SignInModal />,
        astrowaitpop: <AstrowaitPop />,
        // numerokundli: <Numerokundli />,
        // nakhome: <Nakshatra />,

        birth: <Heal pageName="birth" />,
        faceread: <Heal pageName="faceread" />,
        pastlife: <Heal pageName="pastlife" />,
        pendulum: <Heal pageName="pendulum" />,

        pranic: <Heal pageName="pranic" />,
        child: <Heal pageName="child" />,
        legalmatter: <Heal pageName="legalmatter" />,
        prosperity: <Heal pageName="prosperity" />,
        career: <Heal pageName="career" />,
        medical: <Heal pageName="medical" />,
        angel: <Heal pageName="angel" />,
        reiki: <Heal pageName="reiki" />,
        chakra: <Heal pageName="chakra" />,
        relation: <Heal pageName="relation" />,
        feng: <Heal pageName="feng" />,
        crystal: <Heal pageName="crystal" />,
        veda: <Heal pageName="veda" />,
        shamanic: <Heal pageName="shamanic" />,
        theta: <Heal pageName="theta" />,
        infinity: <Heal pageName="infinity" />,
        hypnosis: <Heal pageName="hypnosis" />,
        energy: <Heal pageName="energy" />,
        sound: <Heal pageName="sound" />,
        faith: <Heal pageName="faith" />,

        sp1: <Spell pageName="sp1" />,
        sp2: <Spell pageName="sp2" />,
        sp3: <Spell pageName="sp3" />,
        sp4: <Spell pageName="sp4" />,
        sp5: <Spell pageName="sp5" />,
        sp6: <Spell pageName="sp6" />,
        sp7: <Spell pageName="sp7" />,
        sp8: <Spell pageName="sp8" />,
        sp9: <Spell pageName="sp9" />,
        sp10: <Spell pageName="sp10" />,
        sp11: <Spell pageName="sp11" />,
        sp12: <Spell pageName="sp12" />,
        sp13: <Spell pageName="sp13" />,
        sp14: <Spell pageName="sp14" />,
        sp15: <Spell pageName="sp15" />,
        sp16: <Spell pageName="sp16" />,
        sp17: <Spell pageName="sp17" />,
        sp18: <Spell pageName="sp18" />,
        sp19: <Spell pageName="sp19" />,
        sp20: <Spell pageName="sp20" />,
        sp21: <Spell pageName="sp21" />,

        jobpendant: <Index pageName="job" subcategoryName="pendant" />,
        jobcombo: <Index pageName="job" subcategoryName="combo" />,
        jobyantra: <Index pageName="job" subcategoryName="yantra" />,
        jobring: <Index pageName="job" subcategoryName="ring" />,
        jobtree: <Index pageName="job" subcategoryName="tree" />,
        jobidol: <Index pageName="job" subcategoryName="idol" />,
        jobmala: <Index pageName="job" subcategoryName="mala" />,

        moneypen: <Index pageName="money" subcategoryName="pendant" />,
        moneypyra: <Index pageName="money" subcategoryName="yantra" />,
        moneyidol: <Index pageName="money" subcategoryName="idol" />,
        moneyring: <Index pageName="money" subcategoryName="ring" />,
        moneytree: <Index pageName="money" subcategoryName="tree" />,
        moneyzibu: <Index pageName="money" subcategoryName="zibu" />,
        moneycombo: <Index pageName="money" subcategoryName="combo" />,
        moneycrystal: <Index pageName="money" subcategoryName="crystal" />,
        moneymala: <Index pageName="money" subcategoryName="mala" />,

        healthpendant: <Index pageName="health" subcategoryName="pendant" />,
        healthring: <Index pageName="health" subcategoryName="ring" />,
        healthtree: <Index pageName="health" subcategoryName="tree" />,
        healthpyra: <Index pageName="health" subcategoryName="pyramid" />,
        healthmala: <Index pageName="health" subcategoryName="mala" />,
        healthcombo: <Index pageName="health" subcategoryName="combo" />,

        pregcombo: <Index pageName="pregnancy" subcategoryName="combo" />,
        pregring: <Index pageName="pregnancy" subcategoryName="ring" />,
        pregpendant: <Index pageName="pregnancy" subcategoryName="pendant" />,
        pregmala: <Index pageName="pregnancy" subcategoryName="mala" />,
        pregtree: <Index pageName="pregnancy" subcategoryName="tree" />,

        luvzibu: <Index pageName="love" subcategoryName="zibu" />,
        luvbrass: <Index pageName="love" subcategoryName="brass" />,
        luvring: <Index pageName="love" subcategoryName="ring" />,
        luvmala: <Index pageName="love" subcategoryName="mala" />,
        luvcombo: <Index pageName="love" subcategoryName="combo" />,
        luvpyra: <Index pageName="love" subcategoryName="yantra" />,

        eduyantra: <Index pageName="education" subcategoryName="yantra" />,
        edurings: <Index pageName="education" subcategoryName="ring" />,
        edumala: <Index pageName="education" subcategoryName="mala" />,
        eduidol: <Index pageName="education" subcategoryName="idol" />,
        edutree: <Index pageName="education" subcategoryName="tree" />,
        edupro: <Index pageName="education" subcategoryName="pen" />,
        edupendant: <Index pageName="education" subcategoryName="pendant" />,

        martree: <Index pageName="marriage" subcategoryName="tree" />,
        marrings: <Index pageName="marriage" subcategoryName="ring" />,
        marcombo: <Index pageName="marriage" subcategoryName="combo" />,
        marpyra: <Index pageName="marriage" subcategoryName="yantra" />,
    };

    const tarotpredict = {
        selectastro: <Selectastro />,
        paynow: <CartPage />,
        yogdasha: <Charyogd />,
    };

    const paynow = {
        paynow: <CartPage />,
    };

    let Componentrender = null;

    if (path.length === 1 && navmainComponent[path[0]]) {
        Componentrender = navmainComponent[path[0]];
    }

    const twoLevelKeys = [
        "inKundli",
        "spelling",
        "callAstro",
        "chatAstro",
        "tarotmain",
        "blogComp",
        "problemLove",
        "jobprob",
        "ccpage",
        "moneyprob",
        "health",
        "marriage",
        "pregnancy",
        "education",
        "healingservices",
        "inKundli",
    ];

    if (
        path.length === 2 &&
        twoLevelKeys.includes(path[0]) &&
        getKundlibtn[path[1]]
    ) {
        Componentrender = getKundlibtn[path[1]];
    }

    if (path.length === 3) {
        if (path[0] === "singleform" && path[1] === "singleresult" && getKundlibtn[path[2]]) {
            Componentrender = getKundlibtn[path[2]];
        }
        else if (
            (path[0] === "chatAstro" || path[0] === "callAstro") &&
            path[1] === "repack" &&
            paynow[path[2]]
        ) {
            Componentrender = paynow[path[2]];
        } else if (
            path[0] === "healingservices" &&
            getKundlibtn[path[1]] &&
            tarotpredict[path[2]]
        ) {
            Componentrender = tarotpredict[path[2]];
        } else if (
            path[0] === "spelling" &&
            getKundlibtn[path[1]] &&
            tarotpredict[path[2]]
        ) {
            Componentrender = tarotpredict[path[2]];
        } else if (
            path[0] === "inKundli" &&
            getKundlibtn[path[1]] &&
            tarotpredict[path[2]]
        ) {
            Componentrender = tarotpredict[path[2]];
        }
    } else if (
        path.length === 4 &&
        path[0] === "healingservices" &&
        getKundlibtn[path[1]] &&
        tarotpredict[path[2]] &&
        paynow[path[3]]
    ) {
        Componentrender = paynow[path[3]];
    } else if (
        path.length === 4 &&
        path[0] === "spelling" &&
        getKundlibtn[path[1]] &&
        tarotpredict[path[2]] &&
        paynow[path[3]]
    ) {
        Componentrender = paynow[path[3]];
    }

    return (
        <>
            {Componentrender ? (
                Componentrender
            ) : (
                <div className="text-blue-500 text-2xl font-semibold ">Page not found - Main Home page </div>
            )}
        </>
    );
}
