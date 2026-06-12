/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  solveLU3x3, 
  matrixNormInf, 
  invert3x3, 
  vectorNormInf 
} from "../utils/methods";
import { ShieldAlert, RefreshCw, Cpu, HelpCircle, Info } from "lucide-react";

export default function RadarSensitivityTab() {
  // Matrix A (3x3 default, diagonally dominant for stability)
  const [matrix, setMatrix] = useState<number[][]>([
    [6.0, -1.0, 1.0],
    [-2.0, 8.0, 2.0],
    [1.0, -2.0, 7.0]
  ]);

  // Measured Vector b (representing radar distance perturbations)
  const [vectorB, setVectorB] = useState<number[]>([12.0, 15.0, 9.0]);

  // Perturbation level (represented as percent slider: default 5% as required by Scenario F)
  const [perturbationPercent, setPerturbationPercent] = useState<number>(5.0);

  // Results
  const [baseLU, setBaseLU] = useState<any>(null);
  const [condNumber, setCondNumber] = useState<number>(0);
  const [invMatrix, setInvMatrix] = useState<number[][] | null>(null);
  const [perturbedSol, setPerturbedSol] = useState<number[]>([]);
  const [relativeErrorB, setRelativeErrorB] = useState<number>(0);
  const [relativeErrorX, setRelativeErrorX] = useState<number>(0);
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

  const calculatePerturbations = () => {
    setValidationError(null);

    // 1. Solution to base system
    const lu = solveLU3x3(matrix, vectorB);
    if (!lu) {
      setValidationError("El sistema no tiene solución única o tiene ceros críticos en su diagonal principal.");
      return;
    }
    setBaseLU(lu);

    // 2. Condition number computation
    const normA = matrixNormInf(matrix);
    const inverse = invert3x3(matrix);
    setInvMatrix(inverse);

    if (inverse) {
      const normInv = matrixNormInf(inverse);
      const cond = normA * normInv;
      setCondNumber(cond);

      // Apply perturbation to vector b
      const scaleFactor = perturbationPercent / 100.0;
      const deltaB = vectorB.map(val => val * scaleFactor);
      const perturbedB = vectorB.map((val, idx) => val + deltaB[idx]);
      
      const perturbedLU = solveLU3x3(matrix, perturbedB);
      if (perturbedLU) {
        setPerturbedSol(perturbedLU.x);

        // Relative error in RHS
        const normDeltaB = vectorNormInf(deltaB);
        const normB = vectorNormInf(vectorB);
        const relB = normB > 0 ? normDeltaB / normB : 0;
        setRelativeErrorB(relB);

        // Relative error in solution x
        const deltaX = perturbedLU.x.map((val, idx) => val - lu.x[idx]);
        const normDeltaX = vectorNormInf(deltaX);
        const normX = vectorNormInf(lu.x);
        const relX = normX > 0 ? normDeltaX / normX : 0;
        setRelativeErrorX(relX);
      }
    } else {
      setCondNumber(999999);
    }
  };

  useEffect(() => {
    calculatePerturbations();
  }, [matrix, vectorB, perturbationPercent]);

  const fmt = (v: number) => {
    if (v === undefined || isNaN(v)) return "0";
    return v % 1 === 0 ? v.toString() : v.toFixed(4);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-400" />
          Escenario F: Estabilidad ante Camuflaje y Número de Condición
        </h2>
        <p className="text-slate-400 text-xs">
          Mide el nivel de desestabilización del rastreo radar cuando el FANI perturba activamente su firma electromagnética.
        </p>
      </div>

      {/* Guide Box (Pistola de ayuda No Académica) */}
      <div className="bg-slate-900/60 border border-amber-500/10 rounded-xl p-5 font-sans leading-relaxed text-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-950/40 rounded-lg text-amber-400 border border-amber-500/20 mt-0.5 shrink-0">
            <HelpCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="font-display font-bold text-white text-[15px] flex items-center gap-2">
              Guía de Operación Sencilla: ¿Cómo testear si las señales son estables ante camuflaje?
            </h4>
            <p className="text-slate-300 text-xs mt-1">
              Los ovnis a veces emiten campos de interferencia para "confundir" a los radares. Si nuestras antenas reciben una señal un poco distorsionada (con ruido), ¿la posición final cambiará drásticamente o se mantendrá parecida? El "Número de Condición" nos da esta respuesta.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-800/60">
              <div className="text-xs">
                <span className="font-mono text-amber-400 font-bold block mb-1">1. Fija el Ruido del OVNI</span>
                <p className="text-slate-400 leading-normal">
                  Usa el selector para cambiar el porcentaje de <strong className="text-slate-300">"Perturbación en la Señal"</strong>. Por defecto es <strong className="text-amber-400">5%</strong>.
                </p>
              </div>
              <div className="text-xs">
                <span className="font-mono text-amber-400 font-bold block mb-1">2. Semáforo de Alerta</span>
                <p className="text-slate-400 leading-normal">
                  Revisa el cuadro de la derecha. Te dirá en español simple si el sistema es <strong className="text-emerald-400">"Estable"</strong> o <strong className="text-red-400">"Inestable"</strong> (Mal condicionado) para la antena actual.
                </p>
              </div>
              <div className="text-xs">
                <span className="font-mono text-amber-400 font-bold block mb-1">3. Cambia los números del radar</span>
                <p className="text-slate-400 leading-normal">
                  Prueba a poner números muy pequeños o desequilibrados en la matriz izquierda y verás cómo el "Número de Condición" se dispara, haciendo que el radar falle por completo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation alert */}
      {validationError && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-300 text-xs p-3 rounded-lg font-mono">
          {validationError}
        </div>
      )}

      {/* Workspace Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input: Coefs matrices A and b */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-display font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
              <Cpu className="text-amber-400 w-4 h-4" />
              Lecturas Básicas del Radar [A] y [b]
            </h3>

            <div className="space-y-4">
              <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg">
                <span className="text-slate-500 font-mono text-[10px] uppercase block mb-3">Señales recibidas en antenas (X, Y, Z)</span>
                <div className="space-y-3 font-mono text-sm m-1">
                  {matrix.map((row, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-2">
                      <div className="grid grid-cols-3 gap-2 flex-1">
                        {row.map((val, cIdx) => (
                          <div key={cIdx} className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={matrix[rIdx][cIdx]}
                              id={`sens-A-${rIdx}-${cIdx}`}
                              onChange={(e) => handleMatrixChange(rIdx, cIdx, e.target.value)}
                              className="w-full bg-slate-900 text-right text-slate-200 border border-slate-800 rounded px-2 py-1 focus:border-amber-400 focus:outline-none transition"
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
                          id={`sens-B-${rIdx}`}
                          value={vectorB[rIdx]}
                          onChange={(e) => handleVectorChange(rIdx, e.target.value)}
                          className="w-full bg-slate-900 text-right text-amber-400 font-bold border border-slate-800 rounded px-2 py-1 focus:border-amber-400 focus:outline-none transition"
                        />
                        <span className="absolute bottom-1.5 left-1 text-[9px] text-slate-500 select-none">
                          b{rIdx+1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slider for Perturbation Percent */}
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-lg space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Porcentaje de Ruido / Interferencia:</span>
                  <span className="text-amber-400 font-bold">{perturbationPercent} %</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={perturbationPercent}
                  id="perturbation-percent-slider"
                  onChange={(e) => setPerturbationPercent(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1 bg-slate-850 rounded"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.5% (Mínimo ruido)</span>
                  <span>5.0% (Caso F estándar)</span>
                  <span>20.0% (Interferencia Extrema)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: Stability analysis */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-display font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
              <ShieldAlert className="text-amber-400 w-4 h-4" />
              Resultado del Análisis de Sensibilidad y Estabilidad
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-900">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Desglose del Condicionamiento:</span>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between">
                    <span>Norma de la Matriz (||A||):</span>
                    <span className="text-slate-300 font-bold">{matrixNormInf(matrix).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Norma de la Inversa (||A⁻¹||):</span>
                    <span className="text-slate-300 font-bold">
                      {invMatrix ? matrixNormInf(invMatrix).toFixed(2) : "Singular"}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-900 pt-2 text-sm bg-slate-900/50 px-2 py-1 rounded">
                    <span className="text-slate-400 font-bold">Número de Condición:</span>
                    <span className={`font-bold ${condNumber > 50 ? "text-red-400" : condNumber > 15 ? "text-amber-400" : "text-emerald-400"}`}>
                      {condNumber.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">Estado del Semáforo de Riesgo:</span>
                  <p className="mt-2 text-slate-300 text-[11.5px] leading-relaxed font-sans">
                    {condNumber < 15 ? (
                      <span className="text-emerald-400 font-bold block">✓ RÁDAR ESTABLE (Sano)</span>
                    ) : condNumber < 50 ? (
                      <span className="text-amber-400 font-bold block">⚠ RÁDAR REFRACTARIO (Sensible)</span>
                    ) : (
                      <span className="text-red-400 font-bold block">❌ RÁDAR CON COLAPSO DE CÁLCULO</span>
                    )}
                    <span className="text-slate-400 text-xs block mt-1.5 leading-normal">
                      {condNumber < 15 
                        ? "Las variaciones externas no alteran de forma grave la posición real." 
                        : condNumber < 50 
                        ? "Pequeños ecos dispersos darán posiciones algo borrosas o tambaleantes."
                        : "Cualquier imperfección de señal causa fallos masivos en la ubicación."}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Contrast table */}
            {baseLU && perturbedSol.length > 0 && (
              <div className="mt-6 border-t border-slate-800/80 pt-5">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">Comparación de Soluciones (Base vs Con Interferencia):</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-900 font-mono text-xs">
                    <span className="text-slate-500 text-[9px] uppercase block mb-2">Coordenadas Reales:</span>
                    <div className="space-y-1">
                      <div className="flex justify-between"><span>Eje X:</span><span className="text-slate-100 font-bold">{baseLU.x[0].toFixed(5)} m</span></div>
                      <div className="flex justify-between"><span>Eje Y:</span><span className="text-slate-100 font-bold">{baseLU.x[1].toFixed(5)} m</span></div>
                      <div className="flex justify-between"><span>Eje Z (Altitud):</span><span className="text-slate-100 font-bold">{baseLU.x[2].toFixed(5)} m</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-900 font-mono text-xs border-amber-500/10">
                    <span className="text-amber-400 text-[9px] uppercase block mb-2">Con Ruido del {perturbationPercent}%:</span>
                    <div className="space-y-1">
                      <div className="flex justify-between"><span>Eje X:</span><span className="text-amber-400 font-bold">{perturbedSol[0].toFixed(5)} m</span></div>
                      <div className="flex justify-between"><span>Eje Y:</span><span className="text-amber-400 font-bold">{perturbedSol[1].toFixed(5)} m</span></div>
                      <div className="flex justify-between"><span>Eje Z (Altitud):</span><span className="text-amber-400 font-bold">{perturbedSol[2].toFixed(5)} m</span></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-slate-950 p-4 rounded-lg flex flex-col md:flex-row justify-between text-xs font-mono text-slate-400 border border-slate-900 gap-2">
                  <div>
                    <span className="block text-[9px] text-slate-500">Deformación en Entrada (||Δb|| / ||b||):</span>
                    <span className="text-amber-400 font-bold">{(relativeErrorB * 100).toFixed(2)} %</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500">Desfase Real en Posición Calculada (||Δx|| / ||x||):</span>
                    <span className="text-red-400 font-bold">{(relativeErrorX * 100).toFixed(2)} %</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500">Evaluación de la Cota Matemática:</span>
                    <span className="text-slate-300 font-semibold italic">
                      Error Solución ({(relativeErrorX * 100).toFixed(1)}%) ≤ Condición ({condNumber.toFixed(1)}) × Error Señal ({(relativeErrorB * 100).toFixed(1)}%)
                    </span>
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
