import { create } from "zustand";

interface LocationStore {
  city: string;
  setCity: (city: string) => void;
  fetchCity: () => Promise<void>;
}

const useLocationStore = create<LocationStore>((set) => ({
  city: "Tel Aviv",
  setCity: (city) => set({ city }),
  fetchCity: async () => {
    try {
      const cached = localStorage.getItem("user_city");
      if (cached) {
        set({ city: cached });
        return;
      }

      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      const city = data.city || "Tel Aviv";
      localStorage.setItem("user_city", city);
      set({ city });
    } catch (error) {
      console.error("Error fetching location:", error);
      set({ city: "Tel Aviv" });
    }
  },
}));

export default useLocationStore;
