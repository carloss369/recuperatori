/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Radar, 
  Activity, 
  TrendingUp, 
  Maximize2, 
  ChevronRight, 
  Settings, 
  ShieldAlert,
  HelpCircle,
  Sparkles,
  HardDriveDownload
} from "lucide-react";

interface DashboardTabProps {
  onSelectTab: (tab: string) => void;
  onApplyTestCase: (testType: "interpolation" | "ode" | "roots") => void;
}

export default function DashboardTab({ onSelectTab, onApplyTestCase }: DashboardTabProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Editorial Slogan & Branding */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-teal-500/20 p-8 glow-border">
        {/* Animated matrix scanline */}
        <div className="absolute inset-0 radar-grid opacity-30 pointer-events-none" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950 border border-teal-500/40 rounded-full text-teal-400 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            U.M.S.A. · MÉTODOS NUMÉRICOS 2026
          </div>
          
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white mb-3">
            Sistema Interactivo de Simulación y Análisis de FANI
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 font-sans">
            Plataforma computacional científica para modelar y descifrar la cinemática, trayectoria, 
            estabilidad de señal de radar, dinámicas de contagio social y equilibrios energéticos de 
            <strong>Fenómenos Aéreos Anómalos No Identificados (FANI / OVNIs)</strong>. 
            Desarrollado para contrastar hipótesis físicas utilizando formulaciones numéricas exactas.
          </p>

          <div className="flex flex-wrap gap-4 font-mono text-xs">
            <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
              <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-ping" />
              <span className="text-slate-400">Radares Interactivos:</span>
              <span className="text-slate-200">3 Activos</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
              <span className="text-slate-400">Resolución EDO:</span>
              <span className="text-text/80 text-amber-400">Heun &amp; RK4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Test Case Box (Casos de Estudio Obligatorios - MANDATORIO) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 animate-pulse" />
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Casos de Estudio Obligatorios de Prueba
              </h2>
              <p className="text-slate-400 text-xs">
                Ejecución automatizada lista para evaluar la consistencia de los algoritmos de forma inmediata.
              </p>
            </div>
          </div>
          <span className="text-amber-400 font-mono text-xs font-semibold uppercase px-2 py-1 bg-amber-950/50 rounded border border-amber-500/30">
            Requerido
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Test Case 1: Interpolation */}
          <div className="flex flex-col justify-between bg-slate-950 border border-slate-800/80 hover:border-teal-500/40 p-5 rounded-xl transition duration-300">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono text-teal-400 font-semibold uppercase">Prueba 1 · Interpolación</span>
                <span className="text-[10px] font-mono text-slate-500">Newton / Lagrange</span>
              </div>
              <h3 className="font-display font-bold text-slate-200 text-sm mb-2">
                Reconstrucción de Trayectoria del FANI
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Usa tres instantes dispersos: <strong className="text-slate-300">t=[1, 5, 10]s</strong> con altitudes <strong className="text-slate-300">H=[800, 1200, 2500]m</strong>. 
                Estima la altitud en el segundo intermedio <strong className="text-teal-400 font-mono">t = 3 s</strong>.
              </p>
            </div>
            <button
              onClick={() => onApplyTestCase("interpolation")}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-teal-900/60 hover:bg-teal-500 text-teal-200 hover:text-slate-950 px-4 py-2 border border-teal-500/40 rounded-lg text-xs font-mono transition duration-300 cursor-pointer"
            >
              Cargar y Evaluar Caso 1
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Test Case 2: ODE Descenso */}
          <div className="flex flex-col justify-between bg-slate-950 border border-slate-800/80 hover:border-teal-500/40 p-5 rounded-xl transition duration-300">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono text-amber-400 font-semibold uppercase">Prueba 2 · ODEs</span>
                <span className="text-[10px] font-mono text-slate-500">Euler / Heun / RK4</span>
              </div>
              <h3 className="font-display font-bold text-slate-200 text-sm mb-2">
                Simulación Altitud con Aceleración
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Altitud inicial <strong className="text-slate-300">H₀ = 15000 m</strong>, atracción fija <strong className="text-slate-300">1500 m/s</strong>, empuje magnético opuesto <strong className="text-slate-300">400 m/s</strong>. 
                Halla el segundo exacto que cruza la zona de alarma fijada en <strong className="text-amber-400 font-mono">2000 m</strong>.
              </p>
            </div>
            <button
              onClick={() => onApplyTestCase("ode")}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-amber-950/40 hover:bg-amber-500 text-amber-200 hover:text-slate-950 px-4 py-2 border border-amber-500/30 rounded-lg text-xs font-mono transition duration-300 cursor-pointer"
            >
              Cargar y Evaluar Caso 2
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Test Case 3: Roots */}
          <div className="flex flex-col justify-between bg-slate-950 border border-slate-800/80 hover:border-teal-500/40 p-5 rounded-xl transition duration-300">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono text-teal-400 font-semibold uppercase">Prueba 3 · Raíces No Lineales</span>
                <span className="text-[10px] font-mono text-slate-500">Newton / Bisecc.</span>
              </div>
              <h3 className="font-display font-bold text-slate-200 text-sm mb-2">
                Equilibrio de Energía Térmica
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Energía base fijada en <strong className="text-slate-300">500 unidades</strong>, contra una curva de radiación supersónica que asciende a <strong className="text-slate-300">580 unidades</strong>. 
                Halla la raíz donde se neutralizan térmicamente.
              </p>
            </div>
            <button
              onClick={() => onApplyTestCase("roots")}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-teal-900/60 hover:bg-teal-500 text-teal-200 hover:text-slate-950 px-4 py-2 border border-teal-500/40 rounded-lg text-xs font-mono transition duration-300 cursor-pointer"
            >
              Cargar y Evaluar Caso 3
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Scientific Modules / Scenarios */}
      <div>
        <h2 className="font-display text-xl font-bold text-white mb-5 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-400" />
          Módulos de Simulación Matemática Incorporados
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module 1: Radar Triangulation (Escenario A) */}
          <div 
            onClick={() => onSelectTab("radar")}
            className="group bg-slate-900 border border-slate-800 hover:border-teal-500/30 p-5 rounded-xl hover:bg-slate-900/80 transition duration-300 cursor-pointer text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 bg-teal-950 rounded-lg border border-teal-500/40 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition duration-300">
                  <Radar className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-100 text-sm leading-tight">
                    Escenario A: Triangulación de Radar
                  </h3>
                  <span className="font-mono text-[9px] text-teal-500 uppercase">Sistemas de Ecuaciones LU</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Resuelve sistemas exactos 3x3 para triangular la ubicación (X, Y, Z) utilizando <strong>Factorización LU y Gauss-Seidel / SOR</strong>.
              </p>
            </div>
            <div className="flex items-center text-teal-400 text-xs font-mono gap-1 group-hover:translate-x-1 transition-transform">
              Ingresar al módulo <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Module 2: Descent Sim (Escenario B) */}
          <div 
            onClick={() => onSelectTab("descent")}
            className="group bg-slate-900 border border-slate-800 hover:border-teal-500/30 p-5 rounded-xl hover:bg-slate-900/80 transition duration-300 cursor-pointer text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 bg-teal-950 rounded-lg border border-teal-500/40 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition duration-300">
                  <Activity className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-100 text-sm leading-tight">
                    Escenario B: Descenso Atmosférico
                  </h3>
                  <span className="font-mono text-[9px] text-teal-500 uppercase">Resolución EDO Cinemáticas</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Simula el descenso dH/dt acoplando gravedad, fricción y empuje mediante algoritmos numéricos <strong>RK4, Euler y Heun</strong>.
              </p>
            </div>
            <div className="flex items-center text-teal-400 text-xs font-mono gap-1 group-hover:translate-x-1 transition-transform">
              Ingresar al módulo <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Module 3: Flight Path (Escenario C) */}
          <div 
            onClick={() => onSelectTab("interpolation")}
            className="group bg-slate-900 border border-slate-800 hover:border-teal-500/30 p-5 rounded-xl hover:bg-slate-900/80 transition duration-300 cursor-pointer text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 bg-teal-950 rounded-lg border border-teal-500/40 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition duration-300">
                  <TrendingUp className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-100 text-sm leading-tight">
                    Escenario C: Ruta de Vuelo Polinomial
                  </h3>
                  <span className="font-mono text-[9px] text-teal-500 uppercase">Polinomios de Newton &amp; Lagrange</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Modela una trayectoria continua que cruza de forma precisa todos los checkpoints del radar comercial.
              </p>
            </div>
            <div className="flex items-center text-teal-400 text-xs font-mono gap-1 group-hover:translate-x-1 transition-transform">
              Ingresar al módulo <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Module 4: Integration displacement (Escenario D) */}
          <div 
            onClick={() => onSelectTab("integration")}
            className="group bg-slate-900 border border-slate-800 hover:border-teal-500/30 p-5 rounded-xl hover:bg-slate-900/80 transition duration-300 cursor-pointer text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 bg-teal-950 rounded-lg border border-teal-500/40 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition duration-300">
                  <HardDriveDownload className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-100 text-sm leading-tight">
                    Escenario D: Integral Desplazada
                  </h3>
                  <span className="font-mono text-[9px] text-teal-500 uppercase">Integración Numérica Cerrada</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Suma el recorrido curvilíneo acumulado sobre ventanas temporales mediante reglas compuestas de <strong>Trapecio y Simpson</strong>.
              </p>
            </div>
            <div className="flex items-center text-teal-400 text-xs font-mono gap-1 group-hover:translate-x-1 transition-transform">
              Ingresar al módulo <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Module 5: thermal (Escenario E) */}
          <div 
            onClick={() => onSelectTab("equilibrium")}
            className="group bg-slate-900 border border-slate-800 hover:border-teal-500/30 p-5 rounded-xl hover:bg-slate-900/80 transition duration-300 cursor-pointer text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-300 group-hover:bg-slate-100 group-hover:text-slate-950 transition duration-300">
                  <Maximize2 className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-100 text-sm leading-tight">
                    Escenario E: Equilibrio Térmico
                  </h3>
                  <span className="font-mono text-[9px] text-slate-500 uppercase">Búsqueda de Raíces No Lineales</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Calcula temperaturas de estabilidad críticos comparando convergencia en <strong>Bisección, Newton y Secante</strong>.
              </p>
            </div>
            <div className="flex items-center text-slate-100 text-xs font-mono gap-1 group-hover:translate-x-1 transition-transform">
              Ingresar al módulo <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Module 6: Radar Sensitivity (Escenario F) */}
          <div 
            onClick={() => onSelectTab("radar_sensitivity")}
            className="group bg-slate-900 border border-slate-800 hover:border-amber-500/30 p-5 rounded-xl hover:bg-slate-900/80 transition duration-300 cursor-pointer text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 bg-amber-950 rounded-lg border border-amber-500/30 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition duration-300">
                  <ShieldAlert className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-100 text-sm leading-tight">
                    Escenario F: Estabilidad ante Camuflaje
                  </h3>
                  <span className="font-mono text-[9px] text-amber-500 uppercase">Número de Condición de Matrices</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Mide cómo pequeños porcentajes de ruido disperso alteran la estimación con el <strong>Número de Condición</strong>.
              </p>
            </div>
            <div className="flex items-center text-amber-400 text-xs font-mono gap-1 group-hover:translate-x-1 transition-transform">
              Ingresar al módulo <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Module 7: Social alarm (Escenario G) */}
          <div 
            onClick={() => onSelectTab("social")}
            className="group bg-slate-900 border border-slate-800 hover:border-teal-500/30 p-5 rounded-xl hover:bg-slate-900/80 transition duration-300 cursor-pointer text-left flex flex-col justify-between md:col-span-2 lg:col-span-3"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 bg-red-950/40 rounded-lg border border-red-500/30 text-red-450 group-hover:bg-red-500 group-hover:text-slate-950 transition duration-300">
                  <Settings className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-100 text-sm leading-tight">
                    Escenario G: Dinámica de Alarma Social
                  </h3>
                  <span className="font-mono text-[9px] text-red-500 uppercase">Modelación con Sistemas No Lineales Escépticos-Alarmados</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Simula la propagación de alarma, pánico colectivo posterior a avistamientos simultáneos utilizando sistemas acoplados RK4.
              </p>
            </div>
            <div className="flex items-center text-red-400 text-xs font-mono gap-1 group-hover:translate-x-1 transition-transform">
              Ingresar al módulo <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Schematic Interactive UI Panel */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-display text-base font-bold text-white mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          Notas Teóricas &amp; de Evaluación Científica
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed font-sans">
          Esta plataforma elimina el uso de consolas de depuración para proporcionar una 
          <strong> Interfaz de Impacto Directo en Pantalla</strong>. Todas las respuestas matemáticas, 
          incluyendo coeficientes de diferencias divididas de Newton, matrices de triangulación LU, 
          valores iterativos de convergencia y errores de estabilidad lineal, se visualizan de manera estructurada en 
          nuestras tablas científicas y gráficos en tiempo directo. El simulador protege la robustez física validando 
          impedimentos como determinantes igualados a cero o ingresos vacíos.
        </p>
      </div>
    </div>
  );
}
