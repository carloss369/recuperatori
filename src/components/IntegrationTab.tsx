/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  calculateDividedDifferences, 
  integrateInterpolated,
  DataPoint 
} from "../utils/methods";
import { HardDriveDownload, HelpCircle, AlertTriangle, Plus, Trash2, Cpu } from "lucide-react";

export default function IntegrationTab() {
  // Flight points representing velocity/distance checkpoints
  const [points, setPoints] = useState<DataPoint[]>([
    { t: 1.0, val: 800.0 },
    { t: 5.0, val: 1200.0 },
    { t: 10.0, val: 2500.0 }
  ]);

  const [newT, setNewT] = useState<string>("");
  const [newVal, setNewVal] = useState<string>("");

  // Integration variables for Scenario D
  const [intA, setIntA] = useState<number>(1.0);
  const [intB, setIntB] = useState<number>(10.0);
  const [intSegments, setIntSegments] = useState<number>(12); // N slices

  const [trapResult, setTrapResult] = useState<number>(0);
  const [simp13Result, setSimp13Result] = useState<number>(0);
  const [simp38Result, setSimp38Result] = useState<number>(0);

  // Run Integration whenever points, limits, or segments change
  useEffect(() => {
    if (points.length < 2) {
      setTrapResult(0);
      setSimp13Result(0);
      setSimp38Result(0);
      return;
    }
    const sorted = [...points].sort((a, b) => a.t - b.t);
    
    // Bounds validation
    const clampedA = Math.max(sorted[0].t, intA);
    const clampedB = Math.min(sorted[sorted.length - 1].t, intB);

    setTrapResult(integrateInterpolated(sorted, clampedA, clampedB, intSegments, "trapezoid"));
    setSimp13Result(integrateInterpolated(sorted, clampedA, clampedB, intSegments, "simpson13"));
    setSimp38Result(integrateInterpolated(sorted, clampedA, clampedB, intSegments, "simpson38"));
  }, [points, intA, intB, intSegments]);

  const addPoint = () => {
    const t = parseFloat(newT);
    const val = parseFloat(newVal);
    if (isNaN(t) || isNaN(val)) return;
    
    if (points.some(p => p.t === t)) {
      alert("Ya existe una lectura registrada para ese tiempo.");
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

  const sortedPoints = [...points].sort((a, b) => a.t - b.t);

  // Scenario D Classical physics comparison
  const classicalVelocity = sortedPoints.length > 1
    ? (sortedPoints[sortedPoints.length - 1].val - sortedPoints[0].val) / ((sortedPoints[sortedPoints.length - 1].t - sortedPoints[0].t) || 1)
    : 0;
  const classicalDisplacement = Math.abs(classicalVelocity) * (intB - intA);
  
  // Percent anomalies formula
  const getPercentDeviation = (numericalVal: number) => {
    if (classicalDisplacement === 0) return 0;
    return ((numericalVal - classicalDisplacement) / classicalDisplacement) * 100;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <HardDriveDownload className="w-6 h-6 text-teal-400" />
          Escenario D: Cálculo de Desplazamiento Total Acumulado (Integración Numérica)
        </h2>
        <p className="text-slate-400 text-xs">
          Calcula la distancia acumulada integrando la curva espacial sobre el rango de observación mediante métodos cerrados compuestos.
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
              Guía de Operación Sencilla: ¿Cómo medir la distancia recorrida mediante integración?
            </h4>
            <p className="text-slate-300 text-xs mt-1">
              La velocidad del FANI no es constante; acelera de forma extraña. Al integrar numéricamente los instantes capturados de su curva, podemos calcular los metros totales que se desplazó. Luego los contrastamos con un modelo lineal estándar.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-800/60">
              <div className="text-xs">
                <span className="font-mono text-teal-400 font-bold block mb-1">1. Fija tu Rango de Análisis</span>
                <p className="text-slate-400 leading-normal">
                  Define el <strong className="text-slate-300">Límite Inf (a)</strong> y <strong className="text-slate-300">Límite Sup (b)</strong> en segundos. Esto indica la ventana temporal que quieres sumar.
                </p>
              </div>
              <div className="text-xs">
                <span className="font-mono text-teal-400 font-bold block mb-1">2. Elige el número de cortes</span>
                <p className="text-slate-400 leading-normal">
                  Puedes cambiar el número de segmentos (<strong className="text-slate-300">n</strong>) para ver cómo las fórmulas matemáticas de <strong className="text-teal-400">Simpson y el Trapecio</strong> se vuelven más finas y convergen.
                </p>
              </div>
              <div className="text-xs">
                <span className="font-mono text-teal-400 font-bold block mb-1">3. Evalúa la Anomalía</span>
                <p className="text-slate-400 leading-normal">
                  La desviación en porcentaje te revelará qué tan drásticamente difiere el vuelo del FANI del modelo tradicional de física lineal clásica recta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Data setup */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="font-display font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
              <Cpu className="text-teal-400 w-4.5 h-4.5" />
              Puntos del Perfil Espacial para Integrar
            </h3>

            {/* Quick point insertion form */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 mb-4 space-y-3 font-mono text-xs">
              <span className="text-[10px] text-slate-500 uppercase block">Inyectar Punto de Telemetría</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1">Tiempo (seg):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newT}
                    id="new-point-t"
                    onChange={(e) => setNewT(e.target.value)}
                    placeholder="Ej. 3"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Altitud (metros):</label>
                  <input
                    type="number"
                    step="10"
                    value={newVal}
                    id="new-point-val"
                    onChange={(e) => setNewVal(e.target.value)}
                    placeholder="Ej. 1100"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>
              <button
                onClick={addPoint}
                id="btn-add-point"
                className="w-full cursor-pointer bg-teal-900 hover:bg-teal-500 hover:text-slate-950 font-bold py-1.5 rounded transition text-center text-teal-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Registrar Punto
              </button>
            </div>

            {/* List of active points */}
            <div className="bg-slate-950 rounded-xl border border-slate-905 overflow-hidden">
              <span className="text-[10px] text-slate-500 uppercase font-mono px-4 py-2.5 bg-slate-950 border-b border-slate-900 block font-bold">
                Puntos Registrados Activos
              </span>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-900">
                {points.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-500 font-mono">No hay puntos cargados.</p>
                ) : (
                  sortedPoints.map((pt, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-900/40 text-xs font-mono">
                      <div className="flex gap-4">
                        <span className="text-slate-400">Tiempo: <strong className="text-slate-200">{pt.t} s</strong></span>
                        <span className="text-slate-400">Altitud: <strong className="text-teal-400">{pt.val} m</strong></span>
                      </div>
                      <button 
                        onClick={() => removePoint(pt.t)}
                        className="text-red-400 hover:text-red-500 p-1 rounded transition hover:bg-red-950/20 cursor-pointer"
                        title="Eliminar punto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations and anomalies */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">Estimación de Distancia Relativa por Métodos Compuestos</span>
            
            {points.length < 2 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-850 rounded-lg font-mono">
                Se requiere tener al menos 2 puntos registrados para habilitar los cálculos de integración.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  {/* Slicing Options */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3 col-span-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Rango de Integración</span>
                    <div>
                      <span className="text-slate-500 block mb-1">Límite Inf (a):</span>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                        value={intA}
                        id="integration-intA"
                        onChange={(e) => setIntA(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Límite Sup (b):</span>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                        value={intB}
                        id="integration-intB"
                        onChange={(e) => setIntB(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Particiones (n):</span>
                      <select
                        value={intSegments}
                        id="integration-select-segments"
                        onChange={(e) => setIntSegments(parseInt(e.target.value) || 6)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none text-xs"
                      >
                        <option value="6">6 Intervalos</option>
                        <option value="12">12 Intervalos</option>
                        <option value="24">24 Intervalos</option>
                        <option value="48">48-Máxima Fino</option>
                      </select>
                    </div>
                  </div>

                  {/* Integral Results */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-4 col-span-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block mb-2">Desplazamiento Obtenido</span>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded border border-slate-850">
                          <span className="text-slate-400">Regla del Trapecio:</span>
                          <span className="text-teal-400 font-bold text-sm">{trapResult.toFixed(4)} m</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded border border-slate-850">
                          <span className="text-slate-400">Regla Simpson 1/3:</span>
                          <span className="text-teal-400 font-bold text-sm">{simp13Result.toFixed(4)} m</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded border border-slate-850">
                          <span className="text-slate-400">Regla Simpson 3/8:</span>
                          <span className="text-emerald-400 font-bold text-sm">{simp38Result.toFixed(4)} m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Physics Comparison */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-900 flex flex-col md:flex-row justify-between gap-4 font-mono text-xs">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-[10px] text-slate-500 uppercase">Modelo Lineal Estándar de Referencia</span>
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-slate-400 text-[11px] leading-relaxed">
                      Si el FANI se moviera en línea recta lisa con velocidad media, la distancia teórica estimada daría:
                      <div className="text-white font-bold text-base mt-1.5">{classicalDisplacement.toFixed(2)} m</div>
                    </div>
                  </div>

                  <div className="flex-1 border-l border-slate-900 pl-4 flex flex-col justify-between bg-slate-900/20 p-3 rounded-lg">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Anomalía Detectada (Simpson 3/8)</span>
                      <p className="text-slate-400 text-[11px] mt-1">
                        Desviación de la trayectoria real vs. física plana clásica:
                      </p>
                    </div>
                    <div className="text-right mt-3">
                      <span className={`font-bold text-lg ${Math.abs(getPercentDeviation(simp38Result)) > 20 ? "text-red-400 animate-pulse" : "text-amber-400"}`}>
                        {getPercentDeviation(simp38Result).toFixed(2)} %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
