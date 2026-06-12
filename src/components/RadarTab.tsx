/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  solveLU3x3, 
  solveGaussSeidel3x3, 
  matrixNormInf, 
  invert3x3 
} from "../utils/methods";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { Radar, RefreshCw, Layers, Cpu, HelpCircle } from "lucide-react";

export default function RadarTab() {
  // Matrix A (3x3 default, diagonally dominant for stability)
  const [matrix, setMatrix] = useState<number[][]>([
    [6.0, -1.0, 1.0],
    [-2.0, 8.0, 2.0],
    [1.0, -2.0, 7.0]
  ]);

  // Measured Vector b (representing radar distance perturbations)
  const [vectorB, setVectorB] = useState<number[]>([12.0, 15.0, 9.0]);

  // Initial iteration guess
  const [x0, setX0] = useState<number[]>([0.0, 0.0, 0.0]);

  // SOR relaxation factor (omega)
  const [omega, setOmega] = useState<number>(1.0);

  // Tolerance limit
  const [tolerance, setTolerance] = useState<number>(1e-5);
  
  // Results
  const [luResult, setLuResult] = useState<any>(null);
  const [gsResult, setGsResult] = useState<any[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleMatrixChange = (row: number, col: number, val: string) => {
    const num = parseFloat(val);
    const next = [...matrix.map(r => [...r])];
    next[row][col] = isNaN(num) ? 0 : num;
    setMatrix(next);
  };

  const handleVectorChange = (idx: number, val: string) => {
    const num = parseFloat(val);
    const next = [...vectorB];
    next[idx] = isNaN(num) ? 0 : num;
    setVectorB(next);
  };

  const calculateMethods = () => {
    setValidationError(null);

    // 1. Exact solver through LU
    const lu = solveLU3x3(matrix, vectorB);
    if (!lu) {
      setValidationError("El sistema no tiene solución única o tiene ceros críticos en su diagonal principal. Modifique los coeficientes.");
      return;
    }
    setLuResult(lu);

    // 2. Iterative solve through Gauss-Seidel / SOR
    const iterations = solveGaussSeidel3x3(matrix, vectorB, x0, omega, tolerance, 60);
    setGsResult(iterations);
  };

  useEffect(() => {
    calculateMethods();
  }, [matrix, vectorB, omega, tolerance, x0]);

  const fmt = (v: number) => {
    if (v === undefined || isNaN(v)) return "0";
    return v % 1 === 0 ? v.toString() : v.toFixed(4);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <Radar className="w-6 h-6 text-teal-400" />
          Escenario A: Triangulación de Posición de Radar (Sistemas de Ecuaciones Lineales)
        </h2>
        <p className="text-slate-400 text-xs">
          Triangulación tridimensional (X, Y, Z) mediante métodos directos (Factorización LU) e iterativos (Gauss-Seidel / SOR) de forma simultánea.
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
              Guía de Operación Sencilla: ¿Cómo localizar el FANI?
            </h4>
            <p className="text-slate-300 text-xs mt-1">
              Obtén la ubicación espacial exacta cruzando los datos de tres estaciones receptoras de radar convencionales.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-800/60">
              <div className="text-xs">
                <span className="font-mono text-teal-400 font-bold block mb-1">1. Edita los coeficientes</span>
                <p className="text-slate-400 leading-normal">
                  Puedes ingresar la matriz de distancias relativas <strong className="text-slate-300">[A]</strong> y el vector de lectura <strong className="text-teal-400">[b]</strong> en el panel izquierdo.
                </p>
              </div>
              <div className="text-xs">
                <span className="font-mono text-teal-400 font-bold block mb-1">2. Localización por LU</span>
                <p className="text-slate-400 leading-normal">
                  A la derecha verás las coordenadas exactas de impacto físico resueltas al instante por el método de factorización Doolittle.
                </p>
              </div>
              <div className="text-xs">
                <span className="font-mono text-teal-400 font-bold block mb-1">3. Práctica la relajación SOR</span>
                <p className="text-slate-400 leading-normal">
                  Varía el coeficiente <strong className="text-teal-400">omega (ω)</strong> para ver cómo se reduce o incrementa el número total de iteraciones necesarias para converger.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Equations Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-display font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
              <Cpu className="text-teal-400 w-4 h-4" />
              Coeficientes de la Ecuación Radar [A] y Lecturas [b]
            </h3>

            {validationError && (
              <div className="mb-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs p-3 rounded-lg">
                {validationError}
              </div>
            )}

            <div className="space-y-4">
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg">
                <span className="text-slate-500 font-mono text-[10px] uppercase block mb-3">Matriz de Radar [A] y Respuestas [b]</span>
                <div className="space-y-3 font-mono text-sm">
                  {matrix.map((row, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-2">
                      <div className="grid grid-cols-3 gap-2 flex-1">
                        {row.map((val, cIdx) => (
                          <div key={cIdx} className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={matrix[rIdx][cIdx]}
                              id={`node-A-${rIdx}-${cIdx}`}
                              onChange={(e) => handleMatrixChange(rIdx, cIdx, e.target.value)}
                              className="w-full bg-slate-900 text-right text-slate-200 border border-slate-800 rounded px-2 py-1 focus:border-teal-400 focus:outline-none transition"
                            />
                            <span className="absolute bottom-1.5 left-1 text-[9px] text-slate-500 select-none">
                              a{rIdx+1}{cIdx+1}
                            </span>
                          </div>
                        ))}
                      </div>
                      <span className="text-slate-400 font-bold px-1">=</span>
                      <div className="w-20 relative">
                        <input
                          type="number"
                          step="0.1"
                          id={`node-B-${rIdx}`}
                          value={vectorB[rIdx]}
                          onChange={(e) => handleVectorChange(rIdx, e.target.value)}
                          className="w-full bg-slate-900 text-right text-teal-400 font-bold border border-slate-800 rounded px-2 py-1 focus:border-teal-400 focus:outline-none transition"
                        />
                        <span className="absolute bottom-1.5 left-1 text-[9px] text-slate-500 select-none">
                          b{rIdx+1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equational form output */}
              <div className="p-3 bg-slate-950/50 border border-slate-900 rounded-lg space-y-1">
                <span className="text-slate-500 font-mono text-[10px] uppercase block mb-1">Representación Lineal Activa</span>
                <div className="font-mono text-xs text-slate-300 space-y-0.5">
                  <p>
                    ({fmt(matrix[0][0])})x + ({fmt(matrix[0][1])})y + ({fmt(matrix[0][2])})z = <span className="text-teal-400">{fmt(vectorB[0])}</span>
                  </p>
                  <p>
                    ({fmt(matrix[1][0])})x + ({fmt(matrix[1][1])})y + ({fmt(matrix[1][2])})z = <span className="text-teal-400">{fmt(vectorB[1])}</span>
                  </p>
                  <p>
                    ({fmt(matrix[2][0])})x + ({fmt(matrix[2][1])})y + ({fmt(matrix[2][2])})z = <span className="text-teal-400">{fmt(vectorB[2])}</span>
                  </p>
                </div>
              </div>

              {/* Iteration Parameters */}
              <div className="bg-slate-950/70 border border-slate-900 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-slate-200 font-display font-semibold text-xs">Aproximación Numérica de Convergencia</span>
                </div>

                <div className="space-y-4">
                  {/* Relaxation Coefficient Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                      <span>Fac. Relajación SOR (ω):</span>
                      <span className="text-teal-400 font-bold">{omega}</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.9"
                      step="0.05"
                      value={omega}
                      id="input-omega"
                      onChange={(e) => setOmega(parseFloat(e.target.value))}
                      className="w-full cursor-pointer accent-teal-400 h-1 bg-slate-850 rounded"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0.5 (Amortiguado)</span>
                      <span>1.0 (Gauss-Seidel normal)</span>
                      <span>1.9 (SOR Extremo)</span>
                    </div>
                  </div>

                  {/* Guess vector x0 */}
                  <div>
                    <span className="text-xs font-mono text-slate-400 block mb-2">Vector Inicial de Partida [x₀]:</span>
                    <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                      {x0.map((val, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span className="text-slate-500">
                            {idx === 0 ? "x" : idx === 1 ? "y" : "z"}:
                          </span>
                          <input
                            type="number"
                            step="0.1"
                            value={val}
                            id={`initial-guess-${idx}`}
                            onChange={(e) => {
                              const next = [...x0];
                              next[idx] = parseFloat(e.target.value) || 0;
                              setX0(next);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 text-right px-2 py-1 rounded text-slate-200 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tolerance Selection */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-400">Tolerancia de Parada (Error):</span>
                    <select
                      value={tolerance}
                      id="select-tolerance"
                      onChange={(e) => setTolerance(parseFloat(e.target.value))}
                      className="bg-slate-900 border border-slate-800 rounded font-mono text-xs text-teal-400 px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      <option value="1e-3">1e-3 (Relajado)</option>
                      <option value="1e-5">1e-5 (Óptimo)</option>
                      <option value="1e-7">1e-7 (Fino Máximo)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: LU, Stability, and SOR graph */}
        <div className="lg:col-span-7 space-y-6">
          {/* LU Solution Card */}
          {luResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="font-display font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
                <Layers className="text-teal-400 w-4 h-4" />
                Resultados Método Directo: Factorización LU Doolittle
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visual Coordinates */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Coordenadas de Posición Exactas (X, Y, Z):</span>
                  <div className="space-y-2 mt-2 font-mono">
                    <div className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded border border-slate-850">
                      <span className="text-slate-400 text-xs">Eje X (Ancho):</span>
                      <span className="text-teal-400 font-bold text-sm">{luResult.x[0].toFixed(6)} m</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded border border-slate-850">
                      <span className="text-slate-400 text-xs">Eje Y (Largo):</span>
                      <span className="text-teal-400 font-bold text-sm">{luResult.x[1].toFixed(6)} m</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded border border-slate-850">
                      <span className="text-slate-400 text-xs">Eje Z (Altitud):</span>
                      <span className="text-emerald-400 font-bold text-sm">{luResult.x[2].toFixed(6)} m</span>
                    </div>
                  </div>
                </div>

                {/* Sub-matrices display L & U */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/80 flex flex-col justify-between font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">Matrices Triangulares L y U:</span>
                    <div className="space-y-3">
                      <div>
                        <span className="text-teal-500 font-bold">Matriz L (Inferior):</span>
                        <div className="p-2 bg-slate-900 rounded font-mono mt-1 text-slate-300">
                          [{fmt(luResult.L[0][0])}, {fmt(luResult.L[0][1])}, {fmt(luResult.L[0][2])}]<br/>
                          [{fmt(luResult.L[1][0])}, {fmt(luResult.L[1][1])}, {fmt(luResult.L[1][2])}]<br/>
                          [{fmt(luResult.L[2][0])}, {fmt(luResult.L[2][1])}, {fmt(luResult.L[2][2])}]
                        </div>
                      </div>
                      <div>
                        <span className="text-teal-500 font-bold">Matriz U (Superior):</span>
                        <div className="p-2 bg-slate-900 rounded font-mono mt-1 text-slate-300">
                          [{fmt(luResult.U[0][0])}, {fmt(luResult.U[0][1])}, {fmt(luResult.U[0][2])}]<br/>
                          [{fmt(luResult.U[1][0])}, {fmt(luResult.U[1][1])}, {fmt(luResult.U[1][2])}]<br/>
                          [{fmt(luResult.U[2][0])}, {fmt(luResult.U[2][1])}, {fmt(luResult.U[2][2])}]
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SOR / Gauss Seidel Convergence details */}
      {gsResult.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-4">
            <div>
              <h3 className="font-display font-semibold text-slate-200 text-sm flex items-center gap-2">
                <RefreshCw className="text-teal-400 w-4 h-4" />
                Análisis de Convergencia Iterativa (SOR / Gauss-Seidel)
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                El algoritmo iteró <strong className="text-teal-400">{gsResult.length - 1} veces</strong> para alcanzar la solución según la tolerancia definida.
              </p>
            </div>
            <div className="flex font-mono text-xs gap-3">
              <div className="px-3 py-1.5 bg-slate-950 rounded border border-slate-850">
                <span className="text-slate-500 mr-2">X:</span>
                <span className="text-slate-300">{gsResult[gsResult.length - 1].x[0].toFixed(5)}</span>
              </div>
              <div className="px-3 py-1.5 bg-slate-950 rounded border border-slate-850">
                <span className="text-slate-500 mr-2">Y:</span>
                <span className="text-slate-300">{gsResult[gsResult.length - 1].x[1].toFixed(5)}</span>
              </div>
              <div className="px-3 py-1.5 bg-slate-950 rounded border border-slate-850">
                <span className="text-slate-500 mr-2">Z:</span>
                <span className="text-slate-300">{gsResult[gsResult.length - 1].x[2].toFixed(5)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Chart Area */}
            <div className="xl:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-900/80">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">Gráfica de Declive de Error Relativo (Escala Logarítmica)</span>
              <div className="h-64 h-min-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={gsResult.slice(1)} // skip step zero (empty error)
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="iter" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false} 
                      scale="log" 
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "10px" }}
                      labelStyle={{ color: "#94a3b8", fontFamily: "monospace", fontSize: "11px" }}
                      itemStyle={{ color: "#14b8a6", fontFamily: "monospace", fontSize: "11px" }}
                    />
                    <Line
                      name="Error Relativo (Log)"
                      type="monotone"
                      dataKey="error"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#14b8a6", strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Iterations Tabular view */}
            <div className="xl:col-span-5 bg-slate-950 rounded-xl border border-slate-900/80 h-64 overflow-y-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    <th className="p-3">it (k)</th>
                    <th className="p-3">x⁽ᵏ⁾</th>
                    <th className="p-3">y⁽ᵏ⁾</th>
                    <th className="p-3">z⁽ᵏ⁾</th>
                    <th className="p-3 text-right">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {gsResult.map((row) => (
                    <tr key={row.iter} className="hover:bg-slate-900/60 transition bg-slate-950">
                      <td className="p-3 text-slate-500 font-bold">{row.iter}</td>
                      <td className="p-3 text-slate-100">{row.x[0].toFixed(4)}</td>
                      <td className="p-3 text-slate-100">{row.x[1].toFixed(4)}</td>
                      <td className="p-3 text-emerald-400">{row.x[2].toFixed(4)}</td>
                      <td className="p-3 text-right text-teal-400">
                        {row.iter === 0 ? "—" : row.error.toExponential(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
