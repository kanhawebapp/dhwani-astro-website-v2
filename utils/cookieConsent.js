export const CONSENT_KEY = "cookieConsent";

export const saveConsent = (consent) => {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
};

export const getConsent = () => {
  const data = localStorage.getItem(CONSENT_KEY);

  if (!data) return null;

  return JSON.parse(data);
};
