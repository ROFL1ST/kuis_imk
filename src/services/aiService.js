import axios from "axios";
import api from "./api";

export const aiService = {
  translate: async (text, targetLang) => {
    try {
      const response = await api.post("/ai/translate", {
        text,
        target_lang: targetLang,
      });
      return response.data;
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  },
  translateBulk: async (items, targetLang) => {
    try {
      const response = await api.post("/ai/translate-bulk", {
        items,
        target_lang: targetLang,
      });
      return response.data;
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  },
  health: async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_ML_URL);
      return response.data;
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  },  
};
