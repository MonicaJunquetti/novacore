import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Dashboard = {
  id_dashboard: number;
  nome_dashboard: string;
  descricao?: string;
  pode_editar?: boolean;
};

type DashboardContextData = {
  plantaAtiva: Dashboard | null;
  setPlantaAtiva: (dash: Dashboard) => void;
  carregarPlantaAtiva: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextData>({} as DashboardContextData);

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [plantaAtiva, setPlantaAtivaState] = useState<Dashboard | null>(null);

  useEffect(() => {
    carregarPlantaAtiva();
  }, []);

  const carregarPlantaAtiva = async () => {
    try {
      const dashSalvo = await AsyncStorage.getItem("dashboardAtivo");
      if (dashSalvo) {
        setPlantaAtivaState(JSON.parse(dashSalvo));
      }
    } catch (error) {
      console.log("Erro ao carregar planta do AsyncStorage:", error);
    }
  };

  const setPlantaAtiva = async (dash: Dashboard) => {
    setPlantaAtivaState(dash);
    await AsyncStorage.setItem("dashboardAtivo", JSON.stringify(dash));
  };

  return (
    <DashboardContext.Provider value={{ plantaAtiva, setPlantaAtiva, carregarPlantaAtiva }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);