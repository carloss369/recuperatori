/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  calculateDividedDifferences, 
  evaluateNewton, 
  evaluateLagrange, 
  DataPoint 
} from "../utils/methods";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceDot
} from "recharts";
import { TrendingUp, Plus, Trash2, Cpu, HelpCircle } from "lucide-react";

export default function InterpolationTab() {
  // Discrete captured flight events
  const [points, setPoints] = useState<DataPoint[]>([
    { t: 1.0, val: 800.0 },
    { t: 5.0, val: 1200.0 },
    { t: 10.0, val: 2500.0 }
  ]);

  // Query time input for C.3
  const [queryTime, setQueryTime] = useState<number>(3.0);

  // New coordinate inputs
  const [newT, setNewT] = useState<string>("");
  const [newVal, setNewVal] = useState<string>("");

  // Divided differences table result
  const [diffTable, setDiffTable] = useState<number[][]>([]);
  const [coefs, setCoefs] = useState<number[]>([]);

  // Re-calculate divided differences table and coefficients on points update
  useEffect(() => {
    if (points.length < 2) {
      setCoefs([]);
      setDiffTable([]);
      return;
    }
    const sorted = [...points].sort((a, b) => a.t - b.t);
    const { coefs: c, table: t } = calculateDividedDifferences(sorted);
    setCoefs(c);
    setDiffTable(t);
  }, [points]);

  const addPoint = () => {
    const t = parseFloat(newT);
    const val = parseFloat(newVal);
    if (isNaN(t) || isNaN(val)) return;
    
    // Avoid coordinate duplication
    if (points.some(p => p.t === t)) {
      alert("Ya existe un evento registrado en ese segundo.");
      return;
    }

    setPoints([...points, { t, val }].sort((a, b) => a.t - b.t));
    setNewT("");
    setNewVal("");
  };

  const removePoint = (targetT: number) => {
    const next = points.filter(p => p.t !== targetT);
    setPoints(next);
  };

  // Build continuous graph path using steps
  const getInterpolatedChartData = () => {
    if (points.length < 2) return [];
    const sorted = [...points].sort((a, b) => a.t - b.t);
    const start = sorted[0].t;
    const end = sorted[sorted.length - 1].t;
    const data = [];
    const steps = 60;
    const dt = (end - start) / steps;

    for (let i = 0; i <= steps; i++) {
      const t = start + i * dt;
      data.push({
        t: parseFloat(t.toFixed(3)),
        Curva: parseFloat(evaluateNewton(coefs, sorted, t).toFixed(2))
      });
    }

    // Add actual query point to make sure it exists on the line
    const queryVal = evaluateNewton(coefs, sorted, queryTime);
    data.push({
      t: parseFloat(queryTime.toFixed(3)),
      Curva: parseFloat(queryVal.toFixed(2))
    });

    return data.sort((a, b) => a.t - b.t);
  };

  const sortedPoints = [...points].sort((a, b) => a.t - b.t);
  const chartData = getInterpolatedChartData();
  const queryEstimateNewton = coefs.length > 0 ? evaluateNewton(coefs, sortedPoints, queryTime) : 0;
  const queryEstimateLagrange = sortedPoints.length > 0 ? evaluateLagrange(sortedPoints, queryTime) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-teal-400" />
          Escenario C: Reconstrucción de la Trayectoria del Vuelo FANI (Interpolación)
        </h2>
        <p className="text-slate-400 text-xs">
          Modela una curva suave y continua a partir de observaciones de radar dispersas utilizando polinomios interpolantes clásicos de Lagrange y Newton.
        </p>
      </div>

      {/* Guide Box */}
      <div className="bg-slate-900/60 border border-teal-500/10 rounded-xl p-5 font-sans leading-relaxed text-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-teal-950/80 rounded-lg text-teal-400 border border-teal-500/20 mt-0.5 shrink-0">
            <HelpCircle className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h4 className="font-display font-bold text-white text-[15px] flex items-center gap-2">
              Guía de Operación Sencilla: ¿Cómo modelar la trayectoria?
            </h4>
            <p className="text-slate-300 text-xs mt-1">
              Si nuestro radar solo detectó al objeto un par de veces (ej. en el segundo 1, 5 y 10), las matemáticas nos ayudan a adivinar dónde estaba en los segundos intermedios (ej. en el segundo 3) dibujando una línea curva perfecta que pase exactamente por todos los puntos.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-800/60">
              <div className="text-xs">
                <span className="font-mono text-teal-400 font-bold block mb-1">1. Registra tus lecturas</span>
                <p className="text-slate-400 leading-normal">
                  Usa las casillas para agregar coordenadas individuales. Verás que los nuevos puntos se añaden a la lista de registros activos abajo.
                </p>
              </div>
              <div className="text-xs">
                <span className="font-mono text-teal-400 font-bold block mb-1">2. Estima un segundo cualquiera</span>
                <p className="text-slate-400 leading-normal">
                  Mueve la barra deslizante de <strong className="text-slate-300">"Tiempo a Consultar (t)"</strong> y verás dónde debió estar el FANI según las fórmulas de <strong className="text-teal-400">Lagrange y Newton</strong>.
                </p>
              </div>
              <div className="text-xs">
                <span className="font-mono text-teal-400 font-bold block mb-1">3. Observa la gráfica y la tabla</span>
                <p className="text-slate-400 leading-normal">
                  Dibujamos la curva completa para ti. Abajo encontrarás la <strong className="text-slate-300">Tabla de Diferencias Divididas</strong> paso a paso que comprueba nuestro cálculo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Points registration and query */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-display font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
              <Cpu className="text-teal-400 w-4 h-4" />
              Eventos de Trayectoria y Consulta
            </h3>

            {/* Quick point insertion form */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 mb-4 space-y-3 font-mono text-xs">
              <span className="text-[10px] text-slate-500 uppercase block">Inyectar Coordenada de Radar</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1">Tiempo (seg):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newT}
                    id="new-pt-t"
                    onChange={(e) => setNewT(e.target.value)}
                    placeholder="Ej. 3"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Altitud (H):</label>
                  <input
                    type="number"
                    step="10"
                    value={newVal}
                    id="new-pt-val"
                    onChange={(e) => setNewVal(e.target.value)}
                    placeholder="Ej. 1100"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>
              <button
                onClick={addPoint}
                id="btn-register-coordinate"
                className="w-full cursor-pointer bg-teal-900 hover:bg-teal-500 hover:text-slate-950 font-bold py-1.5 rounded transition text-center text-teal-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Registrar Punto
              </button>
            </div>

            {/* List of active points */}
            <div className="bg-slate-950 rounded-xl border border-slate-900 overflow-hidden mb-5">
              <span className="text-[10px] text-slate-500 uppercase font-mono px-4 py-2.5 bg-slate-950 border-b border-slate-900 block font-bold">
                Puntos Capturados
              </span>
              <div className="max-h-52 overflow-y-auto divide-y divide-slate-900">
                {points.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-500 font-mono">No hay puntos en la base de datos.</p>
                ) : (
                  sortedPoints.map((pt) => (
                    <div key={pt.t} className="flex justify-between items-center p-3 hover:bg-slate-900/40 text-xs font-mono">
                      <div className="flex gap-4">
                        <span className="text-slate-400">t = <strong className="text-slate-200 font-bold">{pt.t} s</strong></span>
                        <span className="text-slate-400">Altitud H = <span className="text-teal-400 font-bold">{pt.val} m</span></span>
                      </div>
                      <button 
                        onClick={() => removePoint(pt.t)}
                        className="text-red-400 hover:text-red-500 p-1 rounded transition hover:bg-red-950/20 cursor-pointer"
                        title="Eliminar evento de trayectoria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sub-block interactive query slider */}
            <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">Estimar Altitud en Tiempo Específico:</span>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between font-mono text-xs text-slate-400">
                  <span>Tiempo a Consultar (t):</span>
                  <span className="text-teal-400 font-bold">{queryTime.toFixed(2)} s</span>
                </div>
                <input
                  type="range"
                  min={sortedPoints.length > 0 ? sortedPoints[0].t : 0}
                  max={sortedPoints.length > 1 ? sortedPoints[sortedPoints.length - 1].t : 15}
                  step="0.1"
                  value={queryTime}
                  id="query-time-range"
                  disabled={points.length < 2}
                  onChange={(e) => setQueryTime(parseFloat(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer h-1 bg-slate-850 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <div className="grid grid-cols-2 gap-3 mt-2 text-center font-mono text-xs">
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded">
                    <span className="text-[9px] text-slate-500 uppercase block mb-1">Polinomio Newton</span>
                    <span className="text-sm font-bold text-white">
                      {points.length >= 2 ? `${queryEstimateNewton.toFixed(4)} m` : "—"}
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded">
                    <span className="text-[9px] text-slate-500 uppercase block mb-1">Fórmula Lagrange</span>
                    <span className="text-sm font-bold text-teal-400">
                      {points.length >= 2 ? `${queryEstimateLagrange.toFixed(4)} m` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reconstructed curve */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-sans">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">Reconstrucción de la Curva de Vuelo Continuo</span>
            {points.length < 2 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-880 rounded-lg text-slate-500 text-xs text-center p-4">
                <span className="font-display font-bold text-slate-300 block mb-1">Se necesitan más datos</span>
                <span className="text-slate-400 max-w-xs leading-normal">
                  Para poder dibujar la curva suave y completa del vuelo, el sistema necesita que registres al menos <strong className="text-teal-400">2 puntos de posición</strong> a la izquierda.
                </span>
              </div>
            ) : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="t" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "10px" }}
                        labelStyle={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "11px" }}
                        itemStyle={{ color: "#14b8a6", fontFamily: "monospace", fontSize: "11px" }}
                      />
                      <Line type="monotone" name="Curva Continuada" dataKey="Curva" stroke="#14b8a6" strokeWidth={2.5} dot={false} />
                      
                      {/* Highlight actual coordinates */}
                      {sortedPoints.map((pt, idx) => (
                        <ReferenceDot key={idx} x={pt.t} y={pt.val} r={4} fill="#020617" stroke="#06b6d4" strokeWidth={2} />
                      ))}

                      {/* Pulsing reference dot on the estimated query */}
                      <ReferenceDot x={queryTime} y={queryEstimateNewton} r={5} fill="#14b8a6" stroke="#fff" strokeWidth={1.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-[10px] font-mono text-slate-500 mt-2">
                  <span className="flex items-center gap-1.5"><strong className="w-2 h-2 rounded-full border border-teal-500 bg-slate-950" /> Puntos capturados</span>
                  <span className="flex items-center gap-1.5"><strong className="w-2 h-2 rounded-full bg-teal-400" /> Posición interpolada</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Numerical calculations: Divided Differences Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="font-display font-semibold text-slate-200 text-sm mb-1">
          Tabla de Diferencias Divididas de Newton
        </h3>
        <p className="text-xs text-slate-500 mb-4 leading-normal font-sans">
          La siguiente tabla muestra la matriz triangular de diferencias divididas utilizada para formular el polinomio analítico.
        </p>

        {points.length < 2 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-850 rounded-lg">
            Registra al menos 2 puntos de posición para calcular la tabla de diferencias divididas.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-900 font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#020617] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">i</th>
                  <th className="p-3">Tiempo (t_i)</th>
                  <th className="p-3">Altitud f[x_i]</th>
                  {Array(Math.max(0, points.length - 1)).fill(0).map((_, idx) => (
                    <th key={idx} className="p-3 font-semibold text-slate-300">Orden {idx + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {sortedPoints.map((pt, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-950/40">
                    <td className="p-3 text-slate-500 font-bold">{rIdx}</td>
                    <td className="p-3 font-semibold text-slate-100">{pt.t} s</td>
                    <td className="p-3 text-teal-400 font-bold">{pt.val}</td>
                    
                    {Array(Math.max(0, points.length - 1)).fill(0).map((_, cIdx) => {
                      const cellVal = diffTable[rIdx]?.[cIdx + 1];
                      return (
                        <td key={cIdx} className="p-3">
                          {cellVal !== undefined && cellVal !== 0 && rIdx < points.length - (cIdx + 1)
                            ? cellVal.toFixed(6)
                            : <span className="text-slate-800">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {coefs.length > 0 && (
          <div className="mt-4 bg-slate-950/80 border border-slate-900 p-4 rounded-xl font-mono text-xs">
            <span className="text-slate-400 font-bold uppercase block mb-1">Ecuación Polinómica Correspondiente:</span>
            <div className="p-2 bg-slate-900 rounded select-all font-semibold text-teal-400 leading-relaxed overflow-x-auto">
              P(t) = {coefs[0].toFixed(2)}
              {coefs.slice(1).map((c, idx) => {
                let term = "";
                for (let i = 0; i <= idx; i++) {
                  term += `(t - ${sortedPoints[i].t})`;
                }
                const sign = c >= 0 ? " + " : " - ";
                return `${sign}${Math.abs(c).toFixed(4)}${term}`;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
