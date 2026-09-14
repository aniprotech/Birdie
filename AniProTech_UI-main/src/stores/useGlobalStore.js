import { create } from "zustand";

export const useGlobalStore = create((set) => ({
    username: "",
    setUsername: (name) => set({ username: name }),

    isLoggedIn: false,
    setIsLoggedIn: (val) => set({ isLoggedIn: val }),

    selectedTab: "home",
    setSelectedTab: (tab) => set({ selectedTab: tab }),

    teamsData: [],          
    setTeamsData: (data) => set({ teamsData: data }),
    
    teamsPersonalDetailData: [],          
    setTeamsPersonalDetailData: (data) => set({ teamsPersonalDetailData: data }),

    clientsPersonalDetailData: [],          
    setClientsPersonalDetailData: (data) => set({ clientsPersonalDetailData: data }),

  }));
