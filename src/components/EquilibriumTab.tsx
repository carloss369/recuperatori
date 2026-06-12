/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  solveBisection, 
  solveNewtonRaphson, 
  solveSecant, 
  thermalBalanceFunction, 
  dThermalBalanceFunction 
} from "../utils/methods";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from "recharts";
import { Settings, RefreshCw, Layers, ZoomIn, Info, HelpCircle } from "lucide-react";

export default function EquilibriumTab() {
  // Analytical / Numerical parameter states
  const [baseEnergy, setBaseEnergy] = useState<number>(500);
  const [emittedEnergy, setEmittedEnergy] = useState<number>(580);
  const [coeffK, setCoeffK] = useState<number>(0.2); // exp constant

  // Solver initial parameters
  const [bisA, setBisA] = useState<number>(1.0);
  const [bisB, setBisB] = useState<number>(20.0);
  const [nrX0, setNrX0] = useState<number>(15.0);
  const [secX0, setSecX0] = useState<number>(5.0);
  const [secX1, setSecX1] = useState<number>(15.0);

  const [tolerance, setTolerance] = useState<number>(1e-5);
  const [activeMethod, setActiveMethod] = useState<"bisection" | "newton" | "secant">("newton");

  // Solver results
  const [bisectionResult, setBisectionResult] = useState<any[]>([]);
  const [newtonResult, setNewtonResult] = useState<any[]>([]);
  const [secantResult, setSecantResult] = useState<any[]>([]);

  const runRootsSolvers = () => {
    const f = (v: number) => thermalBalanceFunction(v, baseEnergy, emittedEnergy, coeffK);
    const df = (v: number) => dThermalBalanceFunction(v, baseEnergy, emittedEnergy, coeffK);

    const bis = solveBisection(f, bisA, bisB, tolerance, 60);
    setBisectionResult(bis);

    const nr = solveNewtonRaphson(f, df, nrX0, tolerance, 60);
    setNewtonResult(nr);

    const sec = solveSecant(f, secX0, secX1, tolerance, 60);
    setSecantResult(sec);
  };

  useEffect(() => {
    runRootsSolvers();
  }, [baseEnergy, emittedEnergy, coeffK, bisA, bisB, nrX0, secX0, secX1, tolerance]);

  // Selected method table data
  const getActiveResult = () => {
    if (activeMethod === "bisection") return bisectionResult;
    if (activeMethod === "newton") return newtonResult;
    return secantResult;
  };

  const activeResult = getActiveResult();
  const foundRoot = activeResult.length > 0 ? (activeResult[activeResult.length - 1]?.xVal ?? null) : null;

  const getExactRoot = () => {
    if (emittedEnergy <= baseEnergy) return null;
    const ratio = baseEnergy / emittedEnergy;
    if (ratio >= 1) return null;
    return - (1 / coeffK) * Math.log(1 - ratio);
  };

  const exactRoot = getExactRoot();

  // Chart function plot generator
  const getChartPlotData = () => {
    const data = [];
    const steps = 50;
    const maxScale = Math.max(bisB, secX1, nrX0, 20);
    const minScale = 0;
    const delta = (maxScale - minScale) / steps;

    for (let i = 0; i <= steps; i++) {
      const v = minScale + i * delta;
      data.push({
        v: parseFloat(v.toFixed(3)),
        f_v: parseFloat(thermalBalanceFunction(v, baseEnergy, emittedEnergy, coeffK).toFixed(3)),
        sensor: baseEnergy,
        radiation: parseFloat((emittedEnergy * (1 - Math.exp(-coeffK * v))).toFixed(3)),
      });
    }

    if (foundRoot !== null) {
      data.push({
        v: parseFloat(foundRoot.toFixed(3)),
        f_v: 0.0,
        sensor: baseEnergy,
        radiation: baseEnergy,
      });
    }

    return data.sort((a, b) => a.v - b.v);
  };

  const chartData = getChartPlotData();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          Módulo E: Umbral de Propulsión de Equilibrio Térmico (Raíces No Lineales)
        </h2>
        <p className="text-slate-400 text-xs">
          Halla la velocidad límite exacta f(v) = 0 donde la radiación supersónica emitida por la fricción del aire coincide con la energía disipada base.
        </p>
      </div>

      {/* Caja de Ayuda Intuitiva para Clientes No Académicos */}
      <div className="bg-slate-900/60 border border-emerald-500/10 rounded-xl p-5 font-sans leading-relaxed text-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-950/40 rounded-lg text-emerald-400 border border-emerald-500/20 mt-0.5 shrink-0">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-display font-bold text-white text-[15px] flex items-center gap-2">
              Guía de Operación Sencilla: ¿Cómo encontrar el punto de equilibrio térmico?
            </h4>
            <p className="text-slate-300 text-xs mt-1">
              Al volar a velocidades súper veloces en el aire, se genera muchísima fricción que produce calor. Modela el punto exacto donde el calor generado es neutralizado o equivalente a la energía consumida base (Raíz de la Ecuación No Lineal).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-800/60">
              <div className="text-xs">
                <span className="font-mono text-emerald-400 font-bold block mb-1">1. Ajusta los niveles base</span>
                <p className="text-slate-400 leading-normal font-sans">
                  Cambia la <strong className="text-slate-305 text-slate-300">Energía del Sensor Base</strong> y el <strong className="text-slate-303 text-slate-300">Límite Radiográfico</strong>. Notarás cómo la curva rosa del gráfico sube o baja de forma dinámica.
                </p>
              </div>
              <div className="text-xs">
                <span className="font-mono text-emerald-400 font-bold block mb-1">2. Elige tu estimación de partida</span>
                <p className="text-slate-400 leading-normal font-sans">
                  En el recuadro gris de la izquierda, puedes dar "números de aproximación inicial" de donde crees que empezará a buscar el algoritmo. ¡Prueba a cambiar esos valores!
                </p>
              </div>
              <div className="text-xs">
                <span className="font-mono text-emerald-400 font-bold block mb-1">3. Evalúa la rapidez</span>
                <p className="text-slate-400 leading-normal font-sans">
                  Observa el cuadro <strong className="text-slate-300">Velocidad de Convergencia comparada</strong> a la derecha. Te revela cuántos intentos le toma a cada método matemático hallar la respuesta exacta. ¡Toca las pestañas de abajo para ver la lista de cada paso!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Parameters */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="font-display font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
              <RefreshCw className="text-emerald-400 w-4 h-4" />
              Parámetros de Energía y Coeficientes
            </h3>

            {/* Quick Test Case Loader */}
            <div className="mb-4 flex justify-between items-center bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold block">Prueba de Campo 3</span>
                <span className="text-[9px] text-slate-500 font-mono">Equilibrio de Energía Térmica</span>
              </div>
              <button
                onClick={() => {
                  setBaseEnergy(500);
                  setEmittedEnergy(580);
                  setCoeffK(0.2);
                  setBisA(1.0);
                  setBisB(20.0);
                  setNrX0(15.0);
                  setSecX0(5.0);
                  setSecX1(15.0);
                  setTolerance(1e-5);
                }}
                className="px-2.5 py-1 bg-emerald-800/40 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-emerald-500/35 text-[10px] font-mono rounded transition cursor-pointer font-bold"
              >
                Cargar Prueba 3
              </button>
            </div>

            <div className="space-y-4">
              {/* Base energy */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 block" htmlFor="input-base-energy">
                  Energía del Sensor Base (E_base):
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    id="input-base-energy"
                    value={baseEnergy}
                    onChange={(e) => setBaseEnergy(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 font-mono text-sm text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:border-emerald-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-mono">unidades</span>
                </div>
              </div>

              {/* Radiation cap / Emitted peak */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 block" htmlFor="input-emitted-energy">
                  Límite Radiográfico Emitido (E_emitted):
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    id="input-emitted-energy"
                    value={emittedEnergy}
                    onChange={(e) => setEmittedEnergy(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 font-mono text-sm text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:border-emerald-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-mono">unidades</span>
                </div>
              </div>

              {/* Exponent constant k */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 block" htmlFor="input-coeffK">
                  Coeficiente de Atenuación Térmica (k):
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="input-coeffK"
                  value={coeffK}
                  onChange={(e) => setCoeffK(Math.max(0.01, parseFloat(e.target.value) || 0.1))}
                  className="w-full bg-slate-950 font-mono text-sm text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {/* Method-specific boundaries */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-905 border-slate-900 space-y-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase block border-b border-slate-900 pb-2">Límites Específicos del Solucionador</span>

                {/* Bisection interval */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono text-slate-400 block">Intervalo de Bisección [a, b]:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="a"
                      id="input-bisA"
                      value={bisA}
                      onChange={(e) => setBisA(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 font-mono text-xs text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none focus:border-emerald-400"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="b"
                      id="input-bisB"
                      value={bisB}
                      onChange={(e) => setBisB(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 font-mono text-xs text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                {/* Newton x0 */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 block" htmlFor="input-nrX0">
                    Aproximación Inicial Newton-Raphson (x₀):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="input-nrX0"
                    value={nrX0}
                    onChange={(e) => setNrX0(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 font-mono text-xs text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none"
                  />
                </div>

                {/* Secant boundaries [x0, x1] */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono text-slate-400 block">Puntos Iniciales Secante [x₀, x₁]:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      id="input-secX0"
                      value={secX0}
                      onChange={(e) => setSecX0(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 font-mono text-xs text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none"
                    />
                    <input
                      type="number"
                      step="0.1"
                      id="input-secX1"
                      value={secX1}
                      onChange={(e) => setSecX1(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 font-mono text-xs text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tolerance Selection */}
                <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                  <span className="text-xs font-mono text-slate-400 font-semibold">Tolerancia:</span>
                  <select
                    value={tolerance}
                    id="select-roots-tolerance"
                    onChange={(e) => setTolerance(parseFloat(e.target.value))}
                    className="bg-slate-900 border border-slate-800 rounded font-mono text-xs text-emerald-400 px-2 py-1.5 focus:outline-none"
                  >
                    <option value="1e-3">1e-3</option>
                    <option value="1e-5">1e-5 (Estándar)</option>
                    <option value="1e-7">1e-7 (Alta precisión)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Plotting functions and comparison analysis */}
        <div className="lg:col-span-7 space-y-6">
          {/* Solvers speed performance comparison */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-display font-semibold text-slate-200 text-sm flex items-center gap-2">
              <ZoomIn className="text-emerald-400 w-4 h-4 font-mono" />
              Velocidad de Convergencia comparada
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center font-mono text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Bisección (Lineal)</span>
                <span className="text-base font-bold text-slate-300">
                  {bisectionResult.length > 0 ? `${bisectionResult.length} iteraciones` : "Inestable o error"}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">
                  Raíz: {bisectionResult.length > 0 ? bisectionResult[bisectionResult.length - 1].xVal.toFixed(4) : "—"}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Newton-Raphson (Cuadrática)</span>
                <span className="text-base font-bold text-emerald-400">
                  {newtonResult.length > 0 ? `${newtonResult.length} iteraciones` : "Inestable o error"}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">
                  Raíz: {newtonResult.length > 0 ? newtonResult[newtonResult.length - 1].xVal.toFixed(4) : "—"}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 border-teal-800/40">
                <span className="text-[10px] text-teal-400 uppercase block mb-1">Secante (Superlineal)</span>
                <span className="text-base font-bold text-teal-300 block">
                  {secantResult.length > 0 ? `${secantResult.length} iters` : "Error"}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">
                  Raíz: {secantResult.length > 0 ? secantResult[secantResult.length - 1].xVal.toFixed(4) : "—"}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/25">
                <span className="text-[10px] text-emerald-400 block mb-1 uppercase">Exacto Analítico</span>
                <span className="text-base font-bold text-emerald-300 block">
                  {exactRoot !== null ? `${exactRoot.toFixed(5)} m/s` : "No real"}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">
                  Fórmula directa: Logaritmo
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-slate-950/40 border border-slate-900 p-3 rounded-lg text-xs leading-relaxed text-slate-400">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Fórmula de equilibrio térmico: <strong className="text-teal-400 font-mono">f(v) = {emittedEnergy} × (1 - e^(-{coeffK}v)) - {baseEnergy} = 0</strong>. El solucionador Newton-Raphson demuestra su convergencia cuadrática (menor cantidad de pasos). El valor exacto analítico teórico es <strong className="text-emerald-400 font-mono">{exactRoot !== null ? `${exactRoot.toFixed(6)} m/s` : "indeterminado"}</strong>.
              </span>
            </div>
          </div>

          {/* Graphical roots curve plotting */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">Gráfico Térmico f(v) vs Velocidad Supersonica (v)</span>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="v" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "10px" }}
                    labelStyle={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "11px" }}
                    itemStyle={{ fontFamily: "monospace", fontSize: "11px" }}
                  />
                  
                  {/* Balance zero equilibrium line */}
                  <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
                  
                  {/* Base energy reference */}
                  <Line type="monotone" name="Energía Base (Sensor)" dataKey="sensor" stroke="#64748b" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" name="Radiación Emitida" dataKey="radiation" stroke="#06b6d4" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" name="Balance Térmico f(v)" dataKey="f_v" stroke="#ec4899" strokeWidth={2.5} dot={false} />
                  
                  {/* Root dot */}
                  {foundRoot !== null && (
                    <ReferenceDot x={foundRoot} y={0} r={5} fill="#10b981" stroke="#fff" strokeWidth={2} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-[10px] font-mono text-slate-500 mt-2">
              <span className="flex items-center gap-1.5"><strong className="w-2.5 h-1 bg-[#ec4899]" /> Balance f(v)</span>
              <span className="flex items-center gap-1.5"><strong className="w-2 h-2 rounded-full bg-[#10b981]" /> Raíz / Punto de equilibrio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Numerical list of step by step iterations for the active solver (no consol logging allowed!) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-4">
          <div>
            <h3 className="font-display font-semibold text-slate-100 text-sm">
              Tabla Detallada de Pasos Iterativos: {activeMethod.toUpperCase()}
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Verifica y comprueba la reducción de error relativo de manera tabular.
            </p>
          </div>
          <div className="flex border border-slate-800 rounded p-1 bg-slate-950 font-mono text-xs">
            <button
              onClick={() => setActiveMethod("bisection")}
              className={`px-3 py-1.5 rounded transition ${activeMethod === "bisection" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              1. Bisección
            </button>
            <button
              onClick={() => setActiveMethod("newton")}
              className={`px-3 py-1.5 rounded transition ${activeMethod === "newton" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              2. Newton-Raphson
            </button>
            <button
              onClick={() => setActiveMethod("secant")}
              className={`px-3 py-1.5 rounded transition ${activeMethod === "secant" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              3. Secante
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800 font-mono text-xs select-none">
          <table className="w-full text-left">
            <thead className="bg-[#020617] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">it (k)</th>
                {activeMethod === "bisection" && <th className="p-3">a (Inf)</th>}
                {activeMethod === "bisection" && <th className="p-3">b (Sup)</th>}
                <th className="p-3">Velocidad v⁽ᵏ⁾</th>
                <th className="p-3">Fuerza Residuo f(v⁽ᵏ⁾)</th>
                {activeMethod === "newton" && <th className="p-3">Derivada f'(v)</th>}
                <th className="p-3 text-right">Error Relativo (ε)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {activeResult.length > 0 ? (
                activeResult.map((row) => (
                  <tr key={row.step} className="hover:bg-slate-950/40 transition">
                    <td className="p-3 text-slate-500 font-bold">{row.step}</td>
                    {activeMethod === "bisection" && <td className="p-3">{row.a.toFixed(5)}</td>}
                    {activeMethod === "bisection" && <td className="p-3">{row.b.toFixed(5)}</td>}
                    <td className="p-3 text-emerald-400 font-bold">{row.xVal.toFixed(6)} m/s</td>
                    <td className="p-3 text-slate-200">{row.fxVal.toFixed(6)}</td>
                    {activeMethod === "newton" && <td className="p-3 text-slate-400">{row.dfxVal?.toFixed(4)}</td>}
                    <td className="p-3 text-right text-teal-400">
                      {row.error.toExponential(4)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-red-400 bg-red-950/10">
                    ❌ Parámetros incoherentes o no se pudo ubicar raíz dentro del rango provisto. Verifique el intervalo [a, b].
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
