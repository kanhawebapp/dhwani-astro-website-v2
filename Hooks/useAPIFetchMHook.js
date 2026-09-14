"use client";

import { useMemo, useState, useEffect, useRef } from "react";

export const useAPIFetchMHook = (
  mainTrigger,
  daUserForm,
  dependentTrigger = null,
  dependentCondition = true,
  dependentFilterId = "",
  extraTriggersMap = {},
) => {
  const [mainData, setMainData] = useState(null);
  const [dependentData, setDependentData] = useState([]);
  const [extraData, setExtraData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Validate payload
  const isValidPayload = (payload) => {
    if (!payload) return false;
    const keys = ["day", "month", "year", "hour", "min", "lat", "lon", "tzone"];
    return keys.every(
      (k) =>
        payload[k] !== undefined &&
        payload[k] !== null &&
        !isNaN(Number(payload[k])),
    );
  };

  // ✅ Memoized payload
  const payload = useMemo(() => {
    if (!daUserForm) return null;

    const safeNumber = (val, fallback = 0) => {
      const num = Number(val);
      return isNaN(num) ? fallback : num;
    };

    return {
      day: safeNumber(daUserForm.day),
      month: safeNumber(daUserForm.month),
      year: safeNumber(daUserForm.year),
      hour: safeNumber(daUserForm.hour),
      min: safeNumber(daUserForm.min),
      lat: safeNumber(daUserForm.lat, 0),
      lon: safeNumber(daUserForm.lon, 0),
      tzone: safeNumber(daUserForm.tzone, 5.5),
    };
  }, [daUserForm]);

  // ✅ Store API triggers in refs (avoid infinite re-render)
  const mainTriggerRef = useRef(mainTrigger);
  const dependentTriggerRef = useRef(dependentTrigger);
  const extraTriggersRef = useRef(extraTriggersMap);
  useEffect(() => {
    mainTriggerRef.current = mainTrigger;
  }, [mainTrigger]);

  useEffect(() => {
    dependentTriggerRef.current = dependentTrigger;
  }, [dependentTrigger]);

  useEffect(() => {
    extraTriggersRef.current = extraTriggersMap;
  }, [extraTriggersMap]);
  const executeTrigger = async (trigger, payload) => {
    const result = trigger(payload);

    if (result && typeof result.unwrap === "function") {
      return await result.unwrap(); // RTK Query
    }

    return await result; // Normal async function
  };
  useEffect(() => {
    const fetchData = async () => {
      if (!isValidPayload(payload)) {
        setMainData(null);
        setDependentData([]);
        setExtraData({});
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let res = null;

        // 🔹 Main API call
        if (mainTriggerRef.current) {
          res = await executeTrigger(mainTriggerRef.current, payload);
          setMainData(res);
        }

        // 🔹 Dependent API call
        if (dependentTriggerRef.current && dependentCondition && res?.present) {
          const depRes = await executeTrigger(
            dependentTriggerRef.current,
            payload,
          );
          const filtered =
            depRes?.suggestions?.filter(
              (s) => s.puja_id === dependentFilterId,
            ) || [];
          setDependentData(filtered);
        } else {
          setDependentData([]);
        }

        // 🔹 Extra API calls
        const extraResponses = {};
        const extraKeys = Object.keys(extraTriggersRef.current);

        if (extraKeys.length > 0) {
          const results = await Promise.all(
            extraKeys.map(async (key) => {
              try {
                const r = await executeTrigger(
                  extraTriggersRef.current[key],
                  payload,
                );
                return { key, data: r };
              } catch (err) {
                console.error(`❌ API Fetch Error for ${key}:`, err);
                return { key, data: null };
              }
            }),
          );

          results.forEach(({ key, data }) => {
            if (data !== null) extraResponses[key] = data;
          });

          setExtraData(extraResponses);
        } else {
          setExtraData({});
        }
      } catch (err) {
        console.error("❌ API Fetch Error:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [payload, dependentCondition, dependentFilterId]);

  useEffect(() => {
  }, [payload]);

  return { mainData, dependentData, extraData, loading, error };
};
