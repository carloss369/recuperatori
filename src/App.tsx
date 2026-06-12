/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import DashboardTab from "./components/DashboardTab";
import RadarTab from "./components/RadarTab";
import DescentTab from "./components/DescentTab";
import InterpolationTab from "./components/InterpolationTab";
import IntegrationTab from "./components/IntegrationTab";
import EquilibriumTab from "./components/EquilibriumTab";
import RadarSensitivityTab from "./components/RadarSensitivityTab";
import SocialDynamicsTab from "./components/SocialDynamicsTab";
import { 
  Radar, 
  Brain, 
  Activity, 
  TrendingUp, 
  Maximize2, 
  LayoutDashboard,
  ShieldAlert,
  HardDriveDownload
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Quick automated test click handler
  const handleApplyTestCase = (testType: "interpolation" | "ode" | "roots") => {
    if (testType === "interpolation") {
      setActiveTab("interpolation");
    } else if (testType === "ode") {
      setActiveTab("descent");
    } else if (testType === "roots") {
      setActiveTab("equilibrium");
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab 
            onSelectTab={setActiveTab} 
            onApplyTestCase={handleApplyTestCase} 
          />
        );
      case "radar":
        return <RadarTab />;
      case "radar_sensitivity":
        return <RadarSensitivityTab />;
      case "descent":
        return <DescentTab />;
      case "interpolation":
        return <InterpolationTab />;
      case "integration":
        return <IntegrationTab />;
      case "equilibrium":
        return <EquilibriumTab />;
      case "social":
        return <SocialDynamicsTab />;
      default:
        return <DashboardTab onSelectTab={setActiveTab} onApplyTestCase={handleApplyTestCase} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Sci-fi top navigation and header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo brand and subtitle */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-950 border border-teal-500/30 rounded-lg animate-pulse">
              <Radar className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-white tracking-tight text-md">
                  OPERACIONES CIENTÍFICAS FANI
                </span>
                <span className="text-[9px] font-mono font-bold bg-teal-950 text-teal-400 px-1 rounded border border-teal-500/20 uppercase">
                  U.M.S.A.
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                MÉTODOS NUMÉRICOS · INVESTIGACIÓN DE FENÓMENOS AEROSPACIALES
              </p>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="hidden lg:flex items-center gap-6 font-mono text-[10px] text-slate-500">
            <div>
              <span className="text-slate-400">OPERADOR:</span>
              <span className="text-teal-400 ml-1">CARLITOS C.</span>
            </div>
            <div>
              <span className="text-slate-400">ESTADO RED:</span>
              <span className="text-emerald-400 ml-1">● SÍNCRONO</span>
            </div>
            <div>
              <span className="text-slate-400">TOLERANCIA:</span>
              <span className="text-amber-400 ml-1">10⁻⁵</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 overflow-x-auto">
          <nav className="flex space-x-1 font-sans text-xs md:text-sm py-1 pt-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              id="tab-dashboard"
              className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition duration-200 shrink-0 cursor-pointer ${
                activeTab === "dashboard"
                  ? "border-teal-500 text-teal-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Consola Operativa
            </button>

            <button
              onClick={() => setActiveTab("radar")}
              id="tab-radar"
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition duration-200 shrink-0 cursor-pointer ${
                activeTab === "radar"
                  ? "border-teal-500 text-teal-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Radar className="w-4 h-4" />
              Triangulación (Esc. A)
            </button>

            <button
              onClick={() => setActiveTab("descent")}
              id="tab-descent"
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition duration-200 shrink-0 cursor-pointer ${
                activeTab === "descent"
                  ? "border-teal-500 text-teal-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="w-4 h-4" />
              Descenso EDO (Esc. B)
            </button>

            <button
              onClick={() => setActiveTab("interpolation")}
              id="tab-interpolation"
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition duration-200 shrink-0 cursor-pointer ${
                activeTab === "interpolation"
                  ? "border-teal-500 text-teal-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Ruta Vuelo (Esc. C)
            </button>

            <button
              onClick={() => setActiveTab("integration")}
              id="tab-integration"
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition duration-200 shrink-0 cursor-pointer ${
                activeTab === "integration"
                  ? "border-teal-500 text-teal-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <HardDriveDownload className="w-4 h-4" />
              Distancia Integral (Esc. D)
            </button>

            <button
              onClick={() => setActiveTab("equilibrium")}
              id="tab-equilibrium"
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition duration-200 shrink-0 cursor-pointer ${
                activeTab === "equilibrium"
                  ? "border-teal-500 text-teal-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Equilibrio Térmico (Esc. E)
            </button>

            <button
              onClick={() => setActiveTab("radar_sensitivity")}
              id="tab-radar-sensitivity"
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition duration-200 shrink-0 cursor-pointer ${
                activeTab === "radar_sensitivity"
                  ? "border-teal-500 text-teal-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Sensibilidad Radar (Esc. F)
            </button>

            <button
              onClick={() => setActiveTab("social")}
              id="tab-social"
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition duration-200 shrink-0 cursor-pointer ${
                activeTab === "social"
                  ? "border-teal-500 text-teal-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Brain className="w-4 h-4" />
              Alarma Social (Esc. G)
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {renderActiveTab()}
      </main>

      {/* Scientific Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center text-slate-500 font-mono text-[10px] gap-4">
          <div className="text-center md:text-left">
            <p>© 2026 U.M.S.A. MÉTODOS NUMÉRICOS — DESAFÍO COMPUTACIONAL FANI</p>
            <p className="text-slate-600">Simulación interactiva y análisis de perturbaciones no convencionales en sistemas físicos.</p>
          </div>
          <div className="flex gap-4">
            <span className="text-teal-500/70">MÉTODOS: LU / GAUSS-SEIDEL / RK4 / NEWTON / SIMPSON</span>
            <span>PROYECTO COMPLETO ESTABLE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
