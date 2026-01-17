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
};
