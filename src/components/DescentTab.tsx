/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { solveODE, findCrossingTime } from "../utils/methods";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from "recharts";
import { Activity, Play, AlertCircle, Info, TrendingDown, Clock, HelpCircle } from "lucide-react";

export default function DescentTab() {
  // Inputs
  const [initialAlt, setInitialAlt] = useState<number>(15000);
  const [attraction, setAttraction] = useState<number>(1500);
  const [thrust, setThrust] = useState<number>(400);
  const [alarmAlt, setAlarmAlt] = useState<number>(2000);
  const [stepSize, setStepSize] = useState<number>(0.1); // dt
  const [tMax, setTMax] = useState<number>(15);
  const [useAcceleration, setUseAcceleration] = useState<boolean>(true);
  const [initialVel, setInitialVel] = useState<number>(0);

  // Solvers results
  const [eulerNodes, setEulerNodes] = useState<any[]>([]);
  const [heunNodes, setHeunNodes] = useState<any[]>([]);
  const [rk4Nodes, setRk4Nodes] = useState<any[]>([]);

  // Cross times
  const [eulerCross, setEulerCross] = useState<number | null>(null);
  const [heunCross, setHeunCross] = useState<number | null>(null);
  const [rk4Cross, setRk4Cross] = useState<number | null>(null);

  const computeSolvers = () => {
    // Solve with Euler
    const euler = solveODE("euler", initialAlt, tMax, stepSize, attraction, thrust, alarmAlt, useAcceleration, initialVel);
    setEulerNodes(euler);
    setEulerCross(findCrossingTime(euler, alarmAlt));

    // Solve with Heun
    const heun = solveODE("heun", initialAlt, tMax, stepSize, attraction, thrust, alarmAlt, useAcceleration, initialVel);
    setHeunNodes(heun);
    setHeunCross(findCrossingTime(heun, alarmAlt));

    // Solve with RK4
    const rk4 = solveODE("rk4", initialAlt, tMax, stepSize, attraction, thrust, alarmAlt, useAcceleration, initialVel);
    setRk4Nodes(rk4);
    setRk4Cross(findCrossingTime(rk4, alarmAlt));
  };

  useEffect(() => {
    computeSolvers();
  }, [initialAlt, attraction, thrust, alarmAlt, stepSize, tMax, useAcceleration, initialVel]);

  // Combine data for charting
  const getChartData = () => {
    const data = [];
    const maxLen = Math.max(eulerNodes.length, heunNodes.length, rk4Nodes.length);
    for (let i = 0; i < maxLen; i++) {
      const point: any = {};
      
      if (eulerNodes[i]) {
        point.t = eulerNodes[i].t;
        point.Euler = eulerNodes[i].h;
        // Analytical exact curve
        const t = eulerNodes[i].t;
        point.Exacto = useAcceleration
          ? Math.max(0, initialAlt + initialVel * t + 0.5 * (thrust - attraction) * t * t)
          : Math.max(0, initialAlt + (thrust - attraction) * t);
      }
      if (heunNodes[i]) {
        point.Heun = heunNodes[i].h;
      }
      if (rk4Nodes[i]) {
        point.RK4 = rk4Nodes[i].h;
      }
      
      // Stop charting below ground
      if (point.Euler <= 0 && point.Heun <= 0 && point.RK4 <= 0) {
        break;
      }
      data.push(point);
    }
    return data;
  };

  const chartData = getChartData();

  // Load a smaller paginated version for the iteration steps table to prevent lag
  const getTableRows = () => {
    const tableData = [];
    const maxLen = Math.max(eulerNodes.length, heunNodes.length, rk4Nodes.length);
    for (let i = 0; i < maxLen; i += Math.max(1, Math.round(maxLen / 30))) {
      const idx = Math.min(i, maxLen - 1);
      const t = rk4Nodes[idx]?.t ?? 0;
      const exactVal = useAcceleration
        ? Math.max(0, initialAlt + initialVel * t + 0.5 * (thrust - attraction) * t * t)
        : Math.max(0, initialAlt + (thrust - attraction) * t);

      tableData.push({
        t,
        euler: eulerNodes[idx]?.h ?? null,
        heun: heunNodes[idx]?.h ?? null,
        rk4: rk4Nodes[idx]?.h ?? null,
        exact: exactVal,
      });
    }
    return tableData;
  };

  const tableRows = getTableRows();

  const getExactCrossingTime = () => {
    if (!useAcceleration) {
      if (thrust - attraction === 0) return null;
      const tVal = (alarmAlt - initialAlt) / (thrust - attraction);
      return tVal >= 0 ? tVal : null;
    } else {
      const a = thrust - attraction;
      if (a === 0) {
        if (initialVel === 0) return null;
        const tVal = (alarmAlt - initialAlt) / initialVel;
        return tVal >= 0 ? tVal : null;
      }
      const Aq = 0.5 * a;
      const Bq = initialVel;
      const Cq = initialAlt - alarmAlt;
      
      const disc = Bq * Bq - 4 * Aq * Cq;
      if (disc < 0) return null;
      
      const root1 = (-Bq + Math.sqrt(disc)) / (2 * Aq);
      const root2 = (-Bq - Math.sqrt(disc)) / (2 * Aq);
      
      const validRoots = [root1, root2].filter(rt => rt >= 0);
      if (validRoots.length === 0) return null;
      return Math.min(...validRoots);
    }
  };

  const exactCrossingTime = getExactCrossingTime();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-amber-400" />
          Módulo B: Simulación de Descenso Cinemático de FANI (ODEs)
        </h2>
        <p className="text-slate-400 text-xs">
          Análisis predictivo de pérdida de altitud resolviendo dH/dt = Empuje(t) - Atracción(t) con solucionadores de paso variable.
        </p>
      </div>

      {/* Caja de Ayuda Intuitiva para Clientes No Académicos */}
      <div className="bg-slate-900/60 border border-amber-500/10 rounded-xl p-5 font-sans leading-relaxed text-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-950/40 rounded-lg text-amber-400 border border-amber-500/20 mt-0.5 shrink-0">
            <HelpCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="font-display font-bold text-white text-[15px] flex items-center gap-2">
              Guía de Operación Sencilla: ¿Cómo simular la bajada del FANI?
            </h4>
            <p className="text-slate-300 text-xs mt-1">
              Imagina que un objeto volador misterioso está bajando de la atmósfera. La gravedad lo jala hacia abajo (Atracción), mientras que su motor magnético empuja hacia arriba (Empuje). Queremos calcular en qué segundo exacto cruzará la altura donde vuelan los aviones.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-800/60">
              <div className="text-xs">
                <span className="font-mono text-amber-400 font-bold block mb-1">1. Elige las Alturas y Fuerzas</span>
                <p className="text-slate-400 leading-normal font-sans">
                  Cambia la <strong className="text-slate-300">Altitud Inicial</strong>, la velocidad de <strong className="text-slate-300">Atracción</strong> (fuerza hacia abajo) y el <strong className="text-slate-305 text-slate-300">Empuje Contrario</strong> (fuerza hacia arriba).
                </p>
              </div>
              <div className="text-xs">
                <span className="font-mono text-amber-400 font-bold block mb-1">2. Fija la Alerta Comercial</span>
                <p className="text-slate-400 leading-normal font-sans">
                  Establece el <strong className="text-slate-300">Límite Espacio Comercial</strong>. Por defecto es <strong className="text-amber-400">2000 metros</strong>, que es la zona estándar de riesgo para aviones civiles.
                </p>
              </div>
              <div className="text-xs">
                <span className="font-mono text-amber-400 font-bold block mb-1">3. Compara los métodos</span>
                <p className="text-slate-400 leading-normal font-sans">
                  En el recuadro <strong className="text-slate-305 text-slate-300">Tiempo Preciso de Tránsito</strong>, el sistema te dirá en qué segundo exacto el objeto cruzará ese límite usando diferentes fórmulas de cálculo físico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Parameters form panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-display font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
              <TrendingDown className="text-amber-400 w-4 h-4" />
              Parámetros de Fricción y Lanzamiento
            </h3>

            <div className="space-y-4">
              {/* Modelo de Física EDO */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 block" htmlFor="select-physics-mode">
                  Modelo de Dinámica EDO:
                </label>
                <select
                  id="select-physics-mode"
                  value={useAcceleration ? "acceleration" : "velocity"}
                  onChange={(e) => setUseAcceleration(e.target.value === "acceleration")}
                  className="w-full bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 cursor-pointer"
                >
                  <option value="acceleration">Caída con Aceleración Constante (2do Orden)</option>
                  <option value="velocity">Descenso a Velocidad Constante (1er Orden)</option>
                </select>
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                  {useAcceleration 
                    ? "Resuelve d²H/dt² = Empuje - Atracción acoplada con velocidad h'(t) = v." 
                    : "Resuelve dH/dt = Empuje - Atracción lineal simple."}
                </p>
              </div>

              {/* Initial Velocity - Only shown if using acceleration */}
              {useAcceleration && (
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 block" htmlFor="input-initial-vel">
                    Velocidad Inicial (v₀):
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      id="input-initial-vel"
                      value={initialVel}
                      onChange={(e) => setInitialVel(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 font-mono text-sm text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <span className="text-xs text-slate-500 font-mono">m/s</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">Velocidad vertical inicial (ej. 0 para caída libre inicial).</p>
                </div>
              )}

              {/* Initial Alt */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 block" htmlFor="input-initial-alt">
                  Altitud Inicial (H₀):
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    id="input-initial-alt"
                    value={initialAlt}
                    onChange={(e) => setInitialAlt(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 font-mono text-sm text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <span className="text-xs text-slate-500 font-mono">metros</span>
                </div>
              </div>

              {/* Descent / Attraction depletion rate */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 block" htmlFor="input-attraction">
                  Tasa de Atracción Atmosférica:
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    id="input-attraction"
                    value={attraction}
                    onChange={(e) => setAttraction(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 font-mono text-sm text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <span className="text-xs text-slate-500 font-mono">{useAcceleration ? "m/s²" : "m/s"}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">Simboliza atracción gravitacional y arrastre de aire.</p>
              </div>

              {/* Inverse magnetic thrust */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 block" htmlFor="input-thrust">
                  Empuje Contrario Magnético (Propulsión):
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    id="input-thrust"
                    value={thrust}
                    onChange={(e) => setThrust(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 font-mono text-sm text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <span className="text-xs text-slate-500 font-mono">{useAcceleration ? "m/s²" : "m/s"}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">Empuje ascendente desacelerador del campo del FANI.</p>
              </div>

              {/* Alarm altitude */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 block" htmlFor="input-alarm-alt">
                  Límite Espacio Comercial (Incursión):
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    id="input-alarm-alt"
                    value={alarmAlt}
                    onChange={(e) => setAlarmAlt(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 font-mono text-sm text-slate-200 border border-slate-800 rounded px-2.5 py-1.5 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <span className="text-xs text-slate-500 font-mono">metros</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono block">En la aviación civil, suele fijarse en 2000m.</span>
              </div>

              {/* Step size (dt) */}
              <div className="space-y-1 border-t border-slate-800 pt-3">
                <label className="text-xs font-mono text-slate-400 block" htmlFor="input-step-size">
                  Paso de Integración Numérica (dt):
                </label>
                <select
                  value={stepSize}
                  id="input-step-size"
                  onChange={(e) => setStepSize(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 rounded px-2 py-1.5 focus:outline-none focus:border-amber-400"
                >
                  <option value="0.01">0.01 s (Máxima exactitud)</option>
                  <option value="0.1">0.1 s  (Estándar)</option>
                  <option value="0.5">0.5 s  (Rápido)</option>
                  <option value="1.0">1.0 s  (Grueso)</option>
                </select>
              </div>

              {/* Max simulation time */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 block" htmlFor="input-t-max">
                  Tiempo Máximo de Observación:
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  id="input-t-max"
                  value={tMax}
                  onChange={(e) => setTMax(Math.max(5, Math.min(100, parseInt(e.target.value) || 20)))}
                  className="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded px-2 py-1 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Crossing analytical results panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Analytical summary card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-display font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
              <Clock className="text-amber-400 w-4 h-4 animate-pulse" />
              Tiempo Preciso de Tránsito (H = {alarmAlt}m)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center font-mono">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Euler (O(h))</span>
                <span className="text-sm font-bold text-slate-400">
                  {eulerCross ? `${eulerCross.toFixed(4)} s` : "No incursionó"}
                </span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Heun (O(h²))</span>
                <span className="text-sm font-bold text-amber-300">
                  {heunCross ? `${heunCross.toFixed(4)} s` : "No incursionó"}
                </span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">RK4 (O(h⁴))</span>
                <span className="text-sm font-bold text-emerald-400">
                  {rk4Cross ? `${rk4Cross.toFixed(4)} s` : "No incursionó"}
                </span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-teal-800/40">
                <span className="text-[10px] text-teal-400 uppercase block mb-1">Exacto Analítico</span>
                <span className="text-sm font-bold text-teal-400">
                  {exactCrossingTime !== null 
                    ? `${exactCrossingTime.toFixed(4)} s`
                    : "No coincide"}
                </span>
              </div>
            </div>

            {/* Deviation warning */}
            {rk4Cross && (
              <div className="mt-3 flex items-start gap-2 bg-slate-950 border border-slate-850 p-3 rounded-lg text-xs leading-relaxed text-slate-400">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  El solucionador <strong className="text-emerald-400 font-mono">Runge-Kutta de 4to Orden (RK4)</strong> provee una aproximación excelente. En modo {useAcceleration ? "Aceleración Constante (2do Orden)" : "Velocidad Constante (1er Orden)"}, el error de truncamiento se mantiene mínimo, demostrando el rigor matemático de los solucionadores clásicos aplicados a sistemas dinámicos.
                </span>
              </div>
            )}
          </div>

          {/* Graphical display */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">Historial de Descenso: Altitud vs Tiempo (s)</span>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="t" stroke="#64748b" fileName="Tiempo (s)" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "10px" }}
                    labelStyle={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "11px" }}
                    itemStyle={{ fontFamily: "monospace", fontSize: "11px" }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
                  
                  {/* Alarm threshold marker */}
                  <ReferenceLine 
                    y={alarmAlt} 
                    stroke="#f59e0b" 
                    strokeDasharray="4 4" 
                    label={{ value: "Límite Alarma (2000m)", fill: "#f59e0b", position: "top", fontSize: 10, fontFamily: "monospace" }} 
                  />

                  <Line type="monotone" name="Euler" dataKey="Euler" stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                  <Line type="monotone" name="Heun" dataKey="Heun" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" name="RK4" dataKey="RK4" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" name="Analítico" dataKey="Exacto" stroke="#06b6d4" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Step Convergence Table (no consol logging requirement) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display font-medium text-slate-200 text-sm">
            Tabla Comparativa de Convergencia EDO (Muestreo Representativo)
          </h3>
          <span className="font-mono text-[10px] text-slate-500">Muestras del Sistema</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead className="bg-[#020617] text-slate-400 sticky top-0 border-b border-slate-800">
              <tr>
                <th className="p-3">Tiempo (s)</th>
                <th className="p-3">Analítico Exacto (m)</th>
                <th className="p-3 text-red-400">Euler H(t)</th>
                <th className="p-3 text-amber-400">Heun H(t)</th>
                <th className="p-3 text-emerald-400">RK4 H(t)</th>
                <th className="p-3 text-right">Error Global RK4</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {tableRows.map((row, idx) => {
                const r4Val = row.rk4 ?? 0;
                const err = Math.abs(r4Val - row.exact);
                return (
                  <tr key={idx} className="hover:bg-slate-950/40 transition">
                    <td className="p-3 text-slate-500 font-bold">{row.t.toFixed(2)}</td>
                    <td className="p-3 text-teal-400 font-semibold">{row.exact.toFixed(2)}</td>
                    <td className="p-3">{row.euler !== null ? row.euler.toFixed(2) : "—"}</td>
                    <td className="p-3">{row.heun !== null ? row.heun.toFixed(2) : "—"}</td>
                    <td className="p-3 text-emerald-400 font-semibold">{row.rk4 !== null ? row.rk4.toFixed(2) : "—"}</td>
                    <td className="p-3 text-right text-slate-500">
                      {err < 1e-12 ? "0" : err.toExponential(4)}
                    </td>
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
