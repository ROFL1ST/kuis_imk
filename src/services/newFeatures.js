import api from "./api";

// Classroom Endpoints
export const classroomAPI = {
  createClassroom: (data) => api.post("/classrooms", data),
  joinClassroom: (code) => api.post("/classrooms/join", { code }),
  getMyClassrooms: () => api.get("/classrooms"),
  getClassroomDetails: (id) => api.get(`/classrooms/${id}`),
  createAssignment: (id, data) =>
    api.post(`/classrooms/${id}/assignments`, data),
};

// Report Endpoints
export const reportAPI = {
  createReport: (data) => api.post("/reports", data), // data: { target_id, target_type, reason }
};

// Review Endpoints
export const reviewAPI = {
  addReview: (quizId, data) => api.post(`/quizzes/${quizId}/reviews`, data), // data: { rating, comment }
  getReviews: (quizId) => api.get(`/quizzes/${quizId}/reviews`),
};

// Survival Endpoints
export const survivalAPI = {
  startSurvival: () => api.post("/survival/start"),
  answerSurvival: (data) => api.post("/survival/answer", data), // data: { question_id, answer, streak, seed }
};

// Global Leaderboard
export const leaderboardAPI = {
  getGlobal: () => api.get("/global/leaderboard"),
};
