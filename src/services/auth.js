// Token management is now handled via HttpOnly cookies
export const getToken = () => null; // Deprecated
export const setToken = () => {}; // Deprecated
export const removeToken = () => {
  localStorage.removeItem("user");
};
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
export const setUser = (user) =>
  localStorage.setItem("user", JSON.stringify(user));
export const setEquippedItems = (items) =>
  localStorage.setItem("equipped_items", JSON.stringify(items));
export const getEquippedItems = () => {
  const items = localStorage.getItem("equipped_items");
  return items ? JSON.parse(items) : [];
};
