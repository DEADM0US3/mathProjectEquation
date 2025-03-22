import { useState } from "react";
import { LineChart, Line, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parse } from "mathjs"; // Usaremos mathjs para evaluar la función de manera segura

// Función para resolver la ecuación diferencial usando el método de Euler
const solveEuler = (f: (x: number, y: number) => number, x0: number, y0: number, h: number, n: number) => {
    const points = [{ x: x0, y: y0 }];
    let x = x0, y = y0;
    for (let i = 0; i < n; i++) {
        y += h * f(x, y);
        x += h;
        points.push({ x, y });
    }
    return points;
};

// Función para resolver la ecuación diferencial usando el método de Euler Mejorado
const solveEulerMejorado = (f: (x: number, y: number) => number, x0: number, y0: number, h: number, n: number) => {
    const points = [{ x: x0, y: y0 }];
    let x = x0, y = y0;
    for (let i = 0; i < n; i++) {
        const yPredict = y + h * f(x, y);
        const yCorrect = y + (h / 2) * (f(x, y) + f(x + h, yPredict));
        x += h;
        y = yCorrect;
        points.push({ x, y });
    }
    return points;
};

// Función para resolver la ecuación diferencial usando el método de Runge-Kutta
const solveRungeKutta = (f: (x: number, y: number) => number, x0: number, y0: number, h: number, n: number) => {
    const points = [{ x: x0, y: y0 }];
    let x = x0, y = y0;
    for (let i = 0; i < n; i++) {
        const k1 = h * f(x, y);
        const k2 = h * f(x + h / 2, y + k1 / 2);
        const k3 = h * f(x + h / 2, y + k2 / 2);
        const k4 = h * f(x + h, y + k3);
        y += (k1 + 2 * k2 + 2 * k3 + k4) / 6;
        x += h;
        points.push({ x, y });
    }
    return points;
};

export default function ODECalculator() {
    const [tableData, setTableData] = useState<any[]>([]); // Datos de la tabla
    const [data, setData] = useState<{ x: number; y: number }[]>([]);
    const [x0, setX0] = useState(0);
    const [y0, setY0] = useState(1);
    const [h, setH] = useState(0.1);
    const [n, setN] = useState(10);
    const [equation, setEquation] = useState(""); // Ecuación diferencial ingresada por el usuario

    // Función para evaluar la ecuación ingresada
    const evaluateFunction = (x: number, y: number): number => {
        try {
            // Usamos mathjs para evaluar la función ingresada
            const scope = { x, y };
            const parsedExpression = parse(equation);
            return parsedExpression.evaluate(scope);
        } catch (error) {
            console.error("Error al evaluar la ecuación:", error);
            return 0;
        }
    };

    // Función para calcular el valor exacto (esto depende de la ecuación exacta, aquí pongo un ejemplo)
    const exactValue = (x: number): number => {
        // Asumiendo una solución exacta, por ejemplo, y = e^x
        return Math.exp(x);
    };

    const handleSolve = (solver: (f: (x: number, y: number) => number, x0: number, y0: number, h: number, n: number) => any) => {
        let result1: any[] = [];

        result1 = solver(evaluateFunction, x0, y0, h, n);
        setData(result1);
        // Calcular tabla de resultados
        setTableData(result1.map((point, i) => ({
            iteracion: i + 1,
            valorExacto: exactValue(point.x),
            valorAproximado: point.y,
            errorPorcentaje: Math.abs((point.y - exactValue(point.x)) / exactValue(point.x)) * 100,
        })));

    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="bg-blue-600 text-white py-4 text-center font-bold text-xl">
                <h1>Calculadora de Ecuaciones Diferenciales</h1>
            </header>

            <div className="flex flex-1">
                {/* Panel izquierdo */}
                <div className="w-1/3 p-4 bg-gray-100">
                    <Card>
                        <CardContent>
                            <h2 className="font-semibold text-lg mb-4">Configuración de Parámetros</h2>

                            <div className="mb-4">
                                <label className="block">Ecuación Diferencial</label>
                                <Input
                                    value={equation}
                                    onChange={(e) => setEquation(e.target.value)}
                                    placeholder="Ejemplo: x + y"
                                    className="mb-4"
                                />
                            </div>

                            <Input
                                type="number"
                                value={x0}
                                onChange={(e) => setX0(parseFloat(e.target.value))}
                                placeholder="Valor inicial x0"
                                className="mb-2"
                            />
                            <Input
                                type="number"
                                value={y0}
                                onChange={(e) => setY0(parseFloat(e.target.value))}
                                placeholder="Valor inicial y0"
                                className="mb-2"
                            />
                            <Input
                                type="number"
                                value={h}
                                onChange={(e) => setH(parseFloat(e.target.value))}
                                placeholder="Paso h"
                                className="mb-2"
                            />
                            <Input
                                type="number"
                                value={n}
                                onChange={(e) => setN(parseInt(e.target.value))}
                                placeholder="Número de pasos n"
                                className="mb-4"
                            />

                            <div className="flex gap-2">
                                <Button onClick={() => {
                                    handleSolve(solveEuler)
                                    setData(solveEuler(evaluateFunction, x0, y0, h, n))
                                }}>Euler</Button>
                                <Button onClick={() => {
                                    handleSolve(solveEulerMejorado)
                                    setData(solveEulerMejorado(evaluateFunction, x0, y0, h, n))
                                }}>Euler Mejorado</Button>
                                <Button onClick={() => {
                                    handleSolve(solveRungeKutta)
                                    setData(solveRungeKutta(evaluateFunction, x0, y0, h, n))
                                }}>Runge-Kutta</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Panel derecho */}
                <div className="w-2/3 p-4">
                    <Card>
                        <CardContent>
                            <h2 className="font-semibold text-lg mb-4">Resultados</h2>
                            <LineChart width={500} height={300} data={data}>
                                <XAxis dataKey="x" />
                                <YAxis />
                                <Line type="monotone" dataKey="y" stroke="#8884d8" />
                            </LineChart>
                            {/* Aquí podrías agregar una tabla si lo necesitas */}
                        </CardContent>
                    </Card>

                    {/* Tabla de resultados */}
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-4">Tabla de Resultados</h2>
                        <table className="min-w-full table-auto border-collapse border border-gray-200">
                            <thead>
                            <tr>
                                <th className="border px-4 py-2">Iteración</th>
                                <th className="border px-4 py-2">Valor Exacto</th>
                                <th className="border px-4 py-2">Valor Aproximado</th>
                                <th className="border px-4 py-2">Porcentaje de Error</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tableData.map((row, index) => (
                                <tr key={index}>
                                    <td className="border px-4 py-2">{row.iteracion}</td>
                                    <td className="border px-4 py-2">{row.valorExacto.toFixed(4)}</td>
                                    <td className="border px-4 py-2">{row.valorAproximado.toFixed(4)}</td>
                                    <td className="border px-4 py-2">{row.errorPorcentaje.toFixed(2)}%</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
