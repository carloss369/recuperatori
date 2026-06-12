/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { evaluateSocialDynamics, SocialState } from "../utils/methods";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Shield, Brain, Newspaper, UserCheck, RefreshCw, Cpu, Sparkles, HelpCircle } from "lucide-react";

export default function SocialDynamicsTab() {
  // Initial populations
  const [popE, setPopE] = useState<number>(5000); // Escépticos (Sceptics)
  const [popA, setPopA] = useState<number>(20);   // Alarmados (Alarmists)
  const [popM, setPopM] = useState<number>(5);    // Medios / Difusión (Media news)

  // Dynamic parameters
  const [coeffA, setCoeffA] = useState<number>(0.0004); // a: Sceptic conversion rate (infection susceptibility)
  const [coeffB, setCoeffB] = useState<number>(0.0002); // b: conversion back driven by media exaggeration
  const [coeffC, setCoeffC] = useState<number>(0.005);  // c: calming rate by official statement
  const [coeffK, setCoeffK] = useState<number>(0.05);   // k: news attention generation based on alarm
  const [coeffR, setCoeffR] = useState<number>(0.1);    // r: media boredom / fatigue decay rate

  const [tMax, setTMax] = useState<number>(60); // Max evaluation days/seconds
  const [dt, setDt] = useState<number>(0.5);   // Step resolution

  const [evolutionPlan, setEvolutionPlan] = useState<SocialState[]>([]);
  
  // Highlighting Peak Panic
  const [peakAlarm, setPeakAlarm] = useState<number>(0);
  const [peakTime, setPeakTime] = useState<number>(0);

  const calculateDynamics = () => {
    const data = evaluateSocialDynamics(
      popE, popA, popM, tMax, dt, 
      coeffA, coeffB, coeffC, coeffK, coeffR
    );
    setEvolutionPlan(data);

    // Analyze peak alarm
    let maxA = 0;
    let maxAT = 0;
    data.forEach(pt => {
      if (pt.A > maxA) {
        maxA = pt.A;
        maxAT = pt.t;
      }
    });
    setPeakAlarm(maxA);
    setPeakTime(maxAT);
  };

  useEffect(() => {
    calculateDynamics();
  }, [popE, popA, popM, coeffA, coeffB, coeffC, coeffK, coeffR, tMax, dt]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-red-400" />
          Módulo G: Dinámica de Alarma Social por Sighting (Sistemas EDO Acoplados)
        </h2>
        <p className="text-slate-400 text-xs text-left">
          Simulador epidemiológico de histeria colectiva post-avistamientos analizando tres poblaciones interactuantes: Escépticos (E), Alarme Social (A) y Medios (M).
        </p>
      </div>

      {/* Caja de Ayuda Intuitiva para Clientes No Académicos */}
      <div className="bg-slate-900/60 border border-red-500/10 rounded-xl p-5 font-sans leading-relaxed text-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-950/40 rounded-lg text-red-400 border border-red-500/20 mt-0.5 shrink-0">
            <HelpCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h4 className="font-display font-bold text-white text-[15px] flex items-center gap-2">
              Guía de Operación Sencilla: ¿Cómo se propaga el pánico por un OVNI?
            </h4>
            <p className="text-slate-300 text-xs mt-1">
              Este módulo simula cómo se transmite el nerviosismo o la alarma en una población después de un gran avistamiento en el cielo. Analiza 3 grupos: Escépticos (tranquilos), Alarmados (con pánico) y Medios de Comunicación (reportajes y noticias).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-800/60">
              <div className="text-xs">
                <span className="font-mono text-red-450 text-red-404 text-red-400 font-bold block mb-1">1. Define las personas iniciales</span>
                <p className="text-slate-400 leading-normal font-sans">
                  Modifica cuántos <strong className="text-slate-300">Escépticos</strong>, <strong className="text-slate-300">Alarmados</strong> o <strong className="text-slate-300">Reportes</strong> hay al empezar bajo la sección "Población Inicial".
                </p>
              </div>
              <div className="text-xs">
                <span className="font-mono text-amber-400 font-bold block mb-1">2. Ajusta el comportamiento</span>
                <p className="text-slate-400 leading-normal font-sans">
                  Desliza las barras de Coeficientes de Contagio:
                  <br />
                  • <strong className="text-slate-300">Conversión Alarma:</strong> Qué tan chismoso es el vecindario.
                  <br />• <strong className="text-slate-300">Exageración de Noticias:</strong> Cuánto asustan los titulares.
                  <br />• <strong className="text-slate-300">Calmante Oficial:</strong> Qué tan efectivo es el gobierno para calmar los nervios.
                </p>
              </div>
              <div className="text-xs">
                <span className="font-mono text-teal-400 font-bold block mb-1">3. Monitorea los resultados</span>
                <p className="text-slate-400 leading-normal font-sans">
                  Mira la tarjeta de <strong className="text-slate-300">"Métricas Críticas"</strong> arriba para ver el pico máximo de personas asustadas y si el pánico está bajo control o desbordado al final.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Populations and coefficients form controllers */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
            <h3 className="font-display font-semibold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="text-red-400 w-4 h-4" />
              Parámetros Poblacionales y Conductas
            </h3>

            {/* Populations */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase block border-b border-slate-800 pb-1">Población Inicial</span>
              
              {/* Escépticos E(0) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-300">Escépticos E(0):</span>
                  <span className="text-slate-100 font-bold">{popE} prs</span>
                </div>
                <div className="flex gap-1.5 items-center">
                  <button 
                    type="button"
                    onClick={() => setPopE(Math.max(0, popE - 500))}
                    className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[10px] text-slate-400 font-bold cursor-pointer transition shrink-0"
                    title="Restar 500"
                  >
                    -500
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPopE(Math.max(0, popE - 100))}
                    className="px-1.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[10px] text-slate-450 text-slate-400 font-bold cursor-pointer transition shrink-0"
                    title="Restar 100"
                  >
                    -100
                  </button>
                  <input
                    type="number"
                    value={popE}
                    onChange={(e) => setPopE(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 px-2 py-1 border border-slate-800 rounded font-mono text-xs text-slate-100 text-center focus:outline-none focus:border-red-500"
                    placeholder="Número"
                  />
                  <button 
                    type="button"
                    onClick={() => setPopE(popE + 100)}
                    className="px-1.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[10px] text-slate-450 text-slate-400 font-bold cursor-pointer transition shrink-0"
                    title="Sumar 100"
                  >
                    +100
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPopE(popE + 500)}
                    className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[10px] text-slate-450 text-slate-400 font-bold cursor-pointer transition shrink-0"
                    title="Sumar 500"
                  >
                    +500
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20000"
                  step="100"
                  value={popE}
                  onChange={(e) => setPopE(parseInt(e.target.value) || 0)}
                  className="w-full h-1 bg-slate-800 cursor-pointer accent-slate-300"
                />
              </div>

              {/* Alarmados A(0) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/50">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-red-400">Alarmados A(0):</span>
                  <span className="text-red-400 font-bold">{popA} prs</span>
                </div>
                <div className="flex gap-1.5 items-center">
                  <button 
                    type="button"
                    onClick={() => setPopA(Math.max(0, popA - 50))}
                    className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[10px] text-red-500/80 font-bold cursor-pointer transition shrink-0"
                    title="Restar 50"
                  >
                    -50
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPopA(Math.max(0, popA - 10))}
                    className="px-1.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[10px] text-red-500/80 font-bold cursor-pointer transition shrink-0"
                    title="Restar 10"
                  >
                    -10
                  </button>
                  <input
                    type="number"
                    value={popA}
                    onChange={(e) => setPopA(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 px-2 py-1 border border-slate-800 rounded font-mono text-xs text-red-400 text-center focus:outline-none focus:border-red-500"
                    placeholder="Número"
                  />
                  <button 
                    type="button"
                    onClick={() => setPopA(popA + 10)}
                    className="px-1.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[10px] text-red-500/80 font-bold cursor-pointer transition shrink-0"
                    title="Sumar 10"
                  >
                    +10
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPopA(popA + 50)}
                    className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[10px] text-red-500/80 font-bold cursor-pointer transition shrink-0"
                    title="Sumar 50"
                  >
                    +50
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={popA}
                  onChange={(e) => setPopA(parseInt(e.target.value) || 0)}
                  className="w-full h-1 bg-slate-800 cursor-pointer accent-red-400"
                />
              </div>

              {/* Reportes M(0) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/50">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-amber-400">Canales/Reportes M(0):</span>
                  <span className="text-amber-400 font-bold">{popM} reps</span>
                </div>
                <div className="flex gap-1.5 items-center">
                  <button 
                    type="button"
                    onClick={() => setPopM(Math.max(0, popM - 10))}
                    className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[10px] text-amber-500/80 font-bold cursor-pointer transition shrink-0"
                    title="Restar 10"
                  >
                    -10
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPopM(Math.max(0, popM - 2))}
                    className="px-1.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[10px] text-amber-500/80 font-bold cursor-pointer transition shrink-0"
                    title="Restar 2"
                  >
                    -2
                  </button>
                  <input
                    type="number"
                    value={popM}
                    onChange={(e) => setPopM(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 px-2 py-1 border border-slate-800 rounded font-mono text-xs text-amber-400 text-center focus:outline-none focus:border-amber-400"
                    placeholder="Número"
                  />
                  <button 
                    type="button"
                    onClick={() => setPopM(popM + 2)}
                    className="px-1.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[10px] text-amber-500/80 font-bold cursor-pointer transition shrink-0"
                    title="Sumar 2"
                  >
                    +2
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPopM(popM + 10)}
                    className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[10px] text-amber-500/80 font-bold cursor-pointer transition shrink-0"
                    title="Sumar 10"
                  >
                    +10
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="2"
                  value={popM}
                  onChange={(e) => setPopM(parseInt(e.target.value) || 0)}
                  className="w-full h-1 bg-slate-800 cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* Rate sliders */}
            <div className="space-y-4 pt-3 border-t border-slate-800/60 text-xs font-mono">
              <span className="text-[10px] text-slate-500 uppercase block">Coeficientes De Contagio (Tasas dE, dA, dM)</span>

              {/* Conversion Coeff a */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                  <span>Tasa Conversión Alarma (a):</span>
                  <span className="text-red-400 font-bold">{coeffA.toFixed(5)}</span>
                </div>
                <input
                  type="range"
                  min="0.00005"
                  max="0.005"
                  step="0.00005"
                  value={coeffA}
                  id="input-coeff-a"
                  onChange={(e) => setCoeffA(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 cursor-pointer accent-red-400"
                />
                <span className="text-[9px] text-slate-500 block">Riesgo de pánico por interacción Escéptico-Alarmado.</span>
              </div>

              {/* Exaggeration Coeff b */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                  <span>Tasa Exageración de Noticias (b):</span>
                  <span className="text-amber-400 font-bold">{coeffB.toFixed(5)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.002"
                  step="0.00005"
                  value={coeffB}
                  id="input-coeff-b"
                  onChange={(e) => setCoeffB(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 cursor-pointer accent-amber-400"
                />
                <span className="text-[9px] text-slate-500 block">Efecto multiplicador de titulares en asustar escépticos.</span>
              </div>

              {/* Containment Coeff c */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                  <span>Tasa Calmante Oficial (c):</span>
                  <span className="text-teal-400 font-bold">{coeffC.toFixed(4)}</span>
                </div>
                <input
                  type="range"
                  min="0.0005"
                  max="0.05"
                  step="0.0005"
                  value={coeffC}
                  id="input-coeff-c"
                  onChange={(e) => setCoeffC(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 cursor-pointer accent-teal-400"
                />
                <span className="text-[9px] text-slate-500 block">Capacidad oficial / calmante de medios para mitigar pánico.</span>
              </div>

              {/* Media attention coefficient k */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Generación Medios (k):</span>
                  <input
                    type="number"
                    step="0.01"
                    value={coeffK}
                    onChange={(e) => setCoeffK(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-950 px-2.5 py-1 border border-slate-850 rounded text-slate-300"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Decaimiento Fatiga (r):</span>
                  <input
                    type="number"
                    step="0.01"
                    value={coeffR}
                    onChange={(e) => setCoeffR(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-950 px-2.5 py-1 border border-slate-850 rounded text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Plotting multisection values */}
        <div className="lg:col-span-8 space-y-6">
          {/* Analysis peak panic card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-display font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
              <Sparkles className="text-red-400 w-4 h-4" />
              Métricas Críticas de Contención e Inundación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-mono text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-[10px] text-slate-500 block">Población Sana (E actual)</span>
                <span className="text-base font-bold text-slate-300">
                  {evolutionPlan.length > 0 ? evolutionPlan[evolutionPlan.length - 1].E.toFixed(0) : "—"}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Siguen escépticos</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-red-950/40">
                <span className="text-[10px] text-red-400 block">Pico Máximo de Alarma</span>
                <span className="text-base font-bold text-red-400">
                  {peakAlarm.toFixed(0)} Alborotados
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Día {peakTime.toFixed(1)}</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-[10px] text-slate-500 block">Estabilidad de la Epidemia</span>
                <span className="text-base font-bold text-teal-400">
                  {evolutionPlan.length > 0 && evolutionPlan[evolutionPlan.length - 1].A < 50 ? "Bajo Control" : "Desborde Activo"}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Estado al Día {tMax}</span>
              </div>
            </div>
          </div>

          {/* Social dynamic chart plotting */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">Modelado de Histeria Colectiva dE, dA, dM vs Tiempo (pasos)</span>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={evolutionPlan}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="t" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "10px" }}
                    labelStyle={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "11px" }}
                    itemStyle={{ fontFamily: "monospace", fontSize: "11px" }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />

                  <Line type="monotone" name="E: Escépticos" dataKey="E" stroke="#cbd5e1" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" name="A: Alarmados" dataKey="A" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" name="M: Cobertura Medios" dataKey="M" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Numerical logs steps (no console logs rule) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="font-display font-medium text-slate-200 text-sm mb-4">
          Bitácora Numérica de Alarma Social (Intervalos Muestreados)
        </h3>
        
        <div className="overflow-x-auto rounded-lg border border-slate-800 font-mono text-xs max-h-64">
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-900 text-slate-300">
              <tr className="bg-[#020617] text-slate-400 sticky top-0 border-b border-slate-800 font-bold">
                <td className="p-3">Día / Instante (t)</td>
                <td className="p-3">E: Escépticos</td>
                <td className="p-3 text-red-400">A: Alarma Social</td>
                <td className="p-3 text-amber-400">M: Medios de Comunicación</td>
              </tr>
              {evolutionPlan.map((row, idx) => {
                // sampling filter values
                if (idx % 8 !== 0) return null;
                return (
                  <tr key={idx} className="hover:bg-slate-950/40">
                    <td className="p-3 text-slate-500 font-bold">{row.t.toFixed(1)}</td>
                    <td className="p-3">{row.E.toFixed(0)}</td>
                    <td className="p-3 text-red-400 font-semibold">{row.A.toFixed(0)}</td>
                    <td className="p-3 text-amber-400">{row.M.toFixed(0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
