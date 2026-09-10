"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Personal from "@/components/Smcompo/Personal";
import { useSelector } from "react-redux";
import {
  useGetMatchAsktPMutation,
  useGetMatchObstMutation,
  useGetMatchAstroMutation,
  useGetMatchManglikMutation,
  useGetMatchMrepoMutation,
} from "@/app/redux/services/astrologyAPI";

const KundliMilan = () => {
  const matchData = useSelector((state) => state.daUserForm.matchForm);

  const [localMatchData, setLocalMatchData] = useState(null);
  const [matchObsData, setMatchObsData] = useState(null);
  const [astroData, setAstroData] = useState(null);
  const [manglikData, setManglikData] = useState(null);
  const [matchReport, setMatchReport] = useState(null);

  const [triggerMatch, { isLoading, isError, error }] =
    useGetMatchAsktPMutation();
  const [triggerMatchObs] = useGetMatchObstMutation();
  const [triggerMatchAstro] = useGetMatchAstroMutation();
  const [triggerManglik] = useGetMatchManglikMutation();
  const [triggerMatchReport] = useGetMatchMrepoMutation();

  useEffect(() => {
    if (!matchData?.boyData || !matchData?.girlData) return;

    const payload = {
      m_day: new Date(matchData.boyData.dob).getDate(),
      m_month: new Date(matchData.boyData.dob).getMonth() + 1,
      m_year: new Date(matchData.boyData.dob).getFullYear(),
      m_hour: +matchData.boyData.birthTime.split(":")[0],
      m_min: +matchData.boyData.birthTime.split(":")[1],
      m_lat: matchData.boyData.lat || 0,
      m_lon: matchData.boyData.lon || 0,
      m_tzone: 5.5,
      m_birthplace: matchData.boyData.birthplace,

      f_day: new Date(matchData.girlData.dob).getDate(),
      f_month: new Date(matchData.girlData.dob).getMonth() + 1,
      f_year: new Date(matchData.girlData.dob).getFullYear(),
      f_hour: +matchData.girlData.birthTime.split(":")[0],
      f_min: +matchData.girlData.birthTime.split(":")[1],
      f_lat: matchData.girlData.lat || 0,
      f_lon: matchData.girlData.lon || 0,
      f_tzone: 5.5,
      f_birthplace: matchData.girlData.birthplace,
    };

    const fetchData = async () => {
      try {
        const result = await triggerMatch(payload).unwrap();
        setLocalMatchData(result);

        const obsResult = await triggerMatchObs(payload).unwrap();
        setMatchObsData(obsResult);

        const astroResult = await triggerMatchAstro(payload).unwrap();
        setAstroData(astroResult);

        const manglikResult = await triggerManglik(payload).unwrap();
        setManglikData(manglikResult);

        const reportResult = await triggerMatchReport(payload).unwrap();
        setMatchReport(reportResult);
      } catch (err) {
        // console.error('API error:', err);
      }
    };

    fetchData();
  }, [
    matchData,
    triggerMatch,
    triggerMatchObs,
    triggerMatchAstro,
    triggerManglik,
    triggerMatchReport,
  ]);

  const renderAstroBlock = (title, data, bgColor, txtColor) => (
    <div className={`bg-${bgColor}-100 p-4 rounded-lg shadow-md`}>
      <h5 className="font-semibold text-xs sm:text-sm text-center mb-2">{title}</h5>
      <div className="grid grid-cols-1 text-sm sm:text-md gap-x-3 gap-y-1 text-black">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="flex text-xs sm:text-sm justify-between">
            <span className={`capitalize ${txtColor} font-semibold`}>
              {key.replace(/_/g, " ")}:
            </span>
            <span className="font-medium">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderManglikRules = (rules, title) => (
    <div className="mb-2 mt-5">
      <h5 className="font-semibold text-xs sm:text-sm text-purple-600">{title}</h5>
      <ul className="list-disc list-inside text-xs sm:text-sm text-black">
        {rules.map((rule, idx) => (
          <li key={idx}>{rule}</li>
        ))}
      </ul>
    </div>
  );

  const imageMap = {
    ashtakoota: "/ds-img/wedding-couple.png",
    manglik: "/ds-img/ology.webp",
    rajju_dosha: "/ds-img/galaxy.png",
    vedha_dosha: "/ds-img/k11.png",
  };

  return (
    <div className="min-h-screen flex flex-col items-center sm:py-4 p-2 sm:px-4">
      <h1 className="text-sm sm:text-lg text-black font-semibold">
        <span className=" text-sm sm:text-lg text-red-500">Free Match Making - Kundli Milan</span>
        Report
      </h1>

      <div className="w-full max-w-4xl mx-auto mt-4 flex flex-col gap-10">
        <div className="det-div w-full bg-white sm:p-6 p-4 rounded-lg shadow-xl">
          <div className="flex justify-center gap-10 mb-4">
            <Image
              src="/ds-img/newmatchboy.png"
              alt="boy"
              width={50}
              height={50}
            />
            <Image
              src="/ds-img/Couple.png"
              alt="couple"
              width={50}
              height={10}
            />
            <Image
              src="/ds-img/newmatchgrl.png"
              alt="girl"
              width={50}
              height={50}
            />
          </div>

          <div className="grid grid-cols-2 text-black md:grid-cols-2 gap-6 text-sm">
            <div className="bg-purple-200 text-xs sm:text-md p-4 rounded-lg flex flex-col gap-1">
              <p>
                <strong>Name:</strong> {matchData?.boyData?.name}
              </p>
              <p>
                <strong>Birth Date:</strong> {matchData?.boyData?.dob}
              </p>
              <p>
                <strong>Birth Time:</strong> {matchData?.boyData?.birthTime}
              </p>
              <p>
                <strong>Birth Place:</strong>{" "}
                {matchData?.boyData?.birthplace ||
                  matchData?.boyData?.birthPlace ||
                  "-"}
              </p>
            </div>
            <div className="bg-pink-200 text-xs sm:text-md p-4 rounded-lg flex flex-col gap-1">
              <p>
                <strong>Name:</strong> {matchData?.girlData?.name}
              </p>
              <p>
                <strong>Birth Date:</strong> {matchData?.girlData?.dob}
              </p>
              <p>
                <strong>Birth Time:</strong> {matchData?.girlData?.birthTime}
              </p>
              <p>
                <strong>Birth Place:</strong>{" "}
                {matchData?.girlData?.birthplace ||
                  matchData?.girlData?.birthPlace ||
                  "-"}
              </p>
            </div>
          </div>

          <div className="dosh-tf grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {matchReport && (
              <>
                {Object.entries(matchReport)
                  .filter(
                    ([key, value]) =>
                      key !== "conclusion" && value?.status !== undefined,
                  )
                  .map(([key, value], index) => (
                    <div
                      key={index}
                      className="px-2 py-2 rounded-lg shadow-lg point-bx flex gap-2 flex-col items-center justify-center bg-linear-to-r from-[#c54e5a6b] to-[#7042ac98]"
                    >
                       <Image width={100} height={100} 
                        src={imageMap[key] || "/assets/icons/default.png"}
                        alt={key}
                        className="w-11 h-11 sm:w-12 sm:h-12 object-contain mb-2"
                      />
                      <h4 className="text-md text-white font-semibold capitalize">
                        {key.replace("_", " ")}
                      </h4>
                      <p className="text-black bg-white rounded-full text-xs font-semibold px-5 py-1">
                        Status: {value.status ? "true" : "false"}
                      </p>
                    </div>
                  ))}
              </>
            )}

            {matchReport?.conclusion?.match_report && (
              <div className="mt-4 bg-purple-100 border border-purple-300 rounded-lg p-4 text-sm text-black shadow col-span-full">
                <h4 className="font-semibold  text-xs sm:text-sm text-purple-500 mb-2">
                  Conclusion :
                </h4>
                <p className="text-xs sm:text-sm">{matchReport.conclusion.match_report}</p>
              </div>
            )}
          </div>

          <div className="match-mang mt-8 p-4 bg-purple-50 border border-purple-200 rounded-lg text-sm text-black shadow">
            <h4 className="text-sm sm:text-md text-center font-semibold mb-3 text-purple-600">
              Manglik Dosha Analysis
            </h4>
            <div className="grid sm:grid-cols-2 text-xs sm:text-sm gap-5  ">
              {manglikData ? (
                <>
                  {["male", "female"].map((gender) => (
                    <div key={gender} className="mb-6 flex flex-col gap-1">
                      <h5 className="font-semibold text-xs sm:text-sm text-center mb-1 text-purple-500 capitalize">
                        {gender}'s Analysis
                      </h5>
                      <p className="flex gap-5">
                        <strong>Is Manglik:</strong>{" "}
                        {manglikData[gender].is_present ? "Yes" : "No"}
                      </p>
                      <p className="flex gap-5">
                        <strong>Manglik Status:</strong>{" "}
                        {manglikData[gender].manglik_status}
                      </p>
                      <p className="flex gap-5">
                        <strong>Manglik percentage:</strong>{" "}
                        {manglikData[gender].percentage_manglik_present}%
                      </p>
                      <p className="flex gap-5">
                        <strong>Manglik percentage After Cancellation :</strong>{" "}
                        {
                          manglikData[gender]
                            .percentage_manglik_after_cancellation
                        }
                        %
                      </p>
                      <p className="flex gap-5">
                        <strong>Report:</strong>{" "}
                        {manglikData[gender].manglik_report}
                      </p>
                      {renderManglikRules(
                        manglikData[gender].manglik_present_rule
                          .based_on_aspect,
                        "Based on Aspects",
                      )}
                      {renderManglikRules(
                        manglikData[gender].manglik_present_rule.based_on_house,
                        "Based on House",
                      )}
                      {renderManglikRules(
                        manglikData[gender].manglik_cancel_rule,
                        "Cancellation Rules",
                      )}
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-purple-100 rounded-lg w-full col-span-2">
                    <p>
                      <strong>Conclusion:</strong>{" "}
                      {manglikData.conclusion.report}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Manglik data not available.</p>
              )}
            </div>
          </div>

          {isLoading && (
            <p className="py-4 text-center text-purple-600 animate-pulse">
              Loading match details...
            </p>
          )}
          {isError && (
            <p className="py-4 text-center text-red-600">
              Error: {error?.data || error.error}
            </p>
          )}

          {localMatchData && (
            <div className="mt-6 askdoot">
              <h3 className="text-sm sm:text-md font-semibold text-center text-purple-700 mb-4">
                Ashtakoot Match Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(localMatchData).map(([key, val]) => {
                  if (key === "total" || key === "conclusion") return null;
                  return (
                    <div
                      key={key}
                      className="border-b bg-purple-100 border-purple-200 px-3 py-4 text-xs rounded-lg shadow-lg text-black flex flex-col gap-1.5"
                    >
                      <span className="font-semibold">{key.toUpperCase()}</span>
                      <div className="grid grid-cols-2 justify-between">
                        <div className="flex gap-1">
                          <span className="font-semibold text-purple-400">
                            Male:
                          </span>
                          <span>{val.male_koot_attribute}</span>
                        </div>
                        <div className="flex gap-1">
                          <span className="font-semibold text-pink-400">
                            Female:
                          </span>
                          <span>{val.female_koot_attribute}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 justify-between">
                        <div className="flex gap-1">
                          <span className="font-semibold text-purple-400">
                            Received Points:
                          </span>
                          <span>{val.received_points}</span>
                        </div>
                        <div className="flex gap-1">
                          <span className="font-semibold text-pink-400">
                            Total Points:
                          </span>
                          <span>{val.total_points}</span>
                        </div>
                      </div>
                      <p>
                        <b className="font-semibold text-purple-400">
                          Description:
                        </b>{" "}
                        {val.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {localMatchData.total && localMatchData.conclusion && (
                <div className="mt-6 p-4 bg-purple-100 border-purple-200 text-black rounded-lg">
                  <h4 className="font-semibold text-sm sm:text-md text-center">
                    Total Score: {localMatchData.total.received_points} /{" "}
                    {localMatchData.total.total_points}
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm">
                    {localMatchData.conclusion.report}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="match-obs mt-8 p-4 bg-purple-50 border text-xs sm:text-sm border-purple-200 rounded-lg  text-black shadow">
            <h4 className="text-sm sm:text-md font-semibold mb-2 text-center text-purple-600">
              Obstructions in Match Making
            </h4>
            {matchObsData ? (
              <>
                <p>
                  <strong>Is Vedha Present?</strong>{" "}
                  {matchObsData.is_present ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Vedha Report:</strong> {matchObsData.vedha_report}
                </p>
                {matchObsData.vedha_name && (
                  <p>
                    <strong>Vedha Name:</strong> {matchObsData.vedha_name}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-500">Vedha data not available.</p>
            )}
          </div>

          <div className="match-astro mt-8 sm:p-4 py-2 bg-white border border-purple-200 rounded-lg text-sm text-black shadow">
            <h4 className="text-sm sm:text-md text-center font-semibold mb-3 text-purple-600">
              Matching Astrological Birth Details
            </h4>
            {astroData ? (
              <div className="grid md:grid-cols-2 gap-6 text-sm sm:text-md sm:px-5 px-3">
                {renderAstroBlock(
                  "Male's Astrological Details",
                  astroData.male_astro_details,
                  "purple",
                  "text-purple-400",
                )}
                {renderAstroBlock(
                  "Female's Astrological Details",
                  astroData.female_astro_details,
                  "pink",
                  "text-pink-400",
                )}
              </div>
            ) : (
              <p className="text-gray-500">Astro data not available.</p>
            )}
          </div>
        </div>

        {/* <div className="result-compat border border-gray-400 rounded-lg p-5 text-black flex flex-col gap-5">
          <Personal />
        </div> */}
      </div>
    </div>
  );
};

export default KundliMilan;
