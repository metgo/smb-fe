export const loadSettings = () => {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem("settings");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveSettings = (settings: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("settings", JSON.stringify(settings));
};

export const loadUserInfo = () => {
  if (typeof window === "undefined") return null;

  try {
    const data = sessionStorage.getItem("user_info");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveUserInfo = (userInfo: any) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("user_info", JSON.stringify(userInfo));
};
