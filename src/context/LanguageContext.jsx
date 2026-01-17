import { createContext, useContext, useState, useEffect } from "react";
import { translations as defaultTranslations } from "../utils/translations";
import { translationAPI } from "../services/api";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Default to Indonesian ('id') if no preference saved
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "id"
  );

  // State for translations (default + fetched)
  const [translationsData, setTranslationsData] = useState(() => {
    const cached = localStorage.getItem("translations_cache");
    return cached ? JSON.parse(cached) : defaultTranslations;
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    // Optional: update HTML lang attribute
    document.documentElement.lang = language;
  }, [language]);

  // Helper helper for deep merge
  const deepMerge = (target, source) => {
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        Object.assign(source[key], deepMerge(target[key], source[key]));
      }
    }
    Object.assign(target || {}, source);
    return target;
  };

  // Fetch translations from Backend on mount
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const res = await translationAPI.getPublic();
        if (res.data?.data) {
          const apiData = res.data.data;

          // Deep merge API data ON TOP of default translations
          // We create a deep copy of defaultTranslations first to avoid mutating imports
          const mergedData = deepMerge(
            JSON.parse(JSON.stringify(defaultTranslations)),
            apiData
          );

          setTranslationsData(mergedData);
          localStorage.setItem(
            "translations_cache",
            JSON.stringify(mergedData)
          );
        }
      } catch (err) {
        console.error(
          "Failed to fetch dynamic translations, using fallback:",
          err
        );
      }
    };

    fetchTranslations();
  }, []);

  const t = (key, params = {}) => {
    const keys = key.split(".");
    let value = translationsData[language];

    // Fallback to ID if current language missing in root
    if (!value && language !== "id") {
      value = translationsData["id"];
    }

    // Also fallback to defaultTranslations if completely missing in state (safety net)
    if (!value) {
      value = defaultTranslations[language] || defaultTranslations["id"];
    }

    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // Try looking in defaultTranslations as last resort for missing keys
        let defaultValue = defaultTranslations[language];
        if (!defaultValue && language !== "id")
          defaultValue = defaultTranslations["id"];

        for (const dk of keys) {
          if (defaultValue && defaultValue[dk] !== undefined) {
            defaultValue = defaultValue[dk];
          } else {
            defaultValue = null;
            break;
          }
        }

        if (defaultValue) return defaultValue; // Found in default!

        return key; // Return key if translation truly missing
      }
    }

    let text = value || key;
    if (typeof text === "string" && Object.keys(params).length > 0) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`{${paramKey}}`, "g"), params[paramKey]);
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
