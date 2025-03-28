import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const solveNumericalMethod = (method, f, x0, y0, h, maxIterations = 1000) => {
    const points = [{ x: x0, y: y0 }];
    let x = x0, y = y0, error = Infinity;
    let iter = 0;

    while (error > 0.0001 && iter < maxIterations) {
        const yNext = method(f, x, y, h);
        error = Math.abs((yNext - y) / yNext);
        x = parseFloat((x + h).toFixed(10));
        y = yNext;
        points.push({ x, y });
        iter++;
    }
    return points;
};

const euler = (f, x, y, h) => y + h * f(x, y);
const eulerMejorado = (f, x, y, h) => {
    const yPredict = y + h * f(x, y);
    return y + (h / 2) * (f(x, y) + f(x + h, yPredict));
};
const rungeKutta = (f, x, y, h) => {
    const k1 = h * f(x, y);
    const k2 = h * f(x + h / 2, y + k1 / 2);
    const k3 = h * f(x + h / 2, y + k2 / 2);
    const k4 = h * f(x + h, y + k3);
    return y + (k1 + 2 * k2 + 2 * k3 + k4) / 6;
};

export default function ODECalculator() {
    const [tableData, setTableData] = useState([]);
    const [data, setData] = useState([]);
    const [func, setFunc] = useState("x + y");
    const [x0, setX0] = useState(0);
    const [y0, setY0] = useState(0);
    const [h, setH] = useState(0.1);
    const [methodUsed, setMethodUsed] = useState("");
    const [isEditing, setIsEditing] = useState(true);
    const [latexPreview, setLatexPreview] = useState("x + y");

    const evaluateFunction = (x, y) => {
        try {
            const sanitizedFunc = func
                .replace(/\^/g, '**')
                .replace(/e\^(\w+)/g, 'Math.exp($1)')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/sqrt\(/g, 'Math.sqrt(')
                .replace(/π/g, 'Math.PI');
            return new Function("x", "y", `return ${sanitizedFunc};`)(x, y);
        } catch (error) {
            console.error("Error evaluating function:", error);
            return 0;
        }
    };

    const exactValue = (x) => 2 * Math.exp(x) - x - 1;

    const handleSolve = (solver, methodName) => {
        setMethodUsed(methodName);
        const result = solveNumericalMethod(solver, evaluateFunction, parseFloat(x0), parseFloat(y0), parseFloat(h));

        const exactResults = result.map((point) => ({
            x: point.x,
            y: point.y,
            exact: exactValue(point.x),
        }));

        setData(exactResults);

        setTableData(exactResults.map((point, i) => ({
            iteracion: i + 1,
            valorExacto: point.exact,
            valorAproximado: point.y,
            errorPorcentaje: Math.abs((point.y - point.exact) / point.exact) * 100,
        })));
    };

    const updateLatexPreview = (value) => {
        setFunc(value);
        try {
            // Convertir a formato LaTeX para la vista previa
            const latex = value
                .replace(/\*\*/g, '^')
                .replace(/Math\./g, '')
                .replace(/\*/g, ' \\cdot ')
                .replace(/sin/g, '\\sin')
                .replace(/cos/g, '\\cos')
                .replace(/tan/g, '\\tan')
                .replace(/sqrt/g, '\\sqrt')
                .replace(/log/g, '\\log')
                .replace(/ln/g, '\\ln')
                .replace(/exp/g, 'e^');
            setLatexPreview(latex);
        } catch {
            setLatexPreview(value);
        }
    };

    const commonEquations = [
        { label: "Lineal", value: "x + y", latex: "x + y" },
        { label: "Cuadrática", value: "x^2 + y^2", latex: "x^2 + y^2" },
        { label: "Exponencial", value: "exp(x) * y", latex: "e^x \\cdot y" },
        { label: "Trigonométrica", value: "sin(x) + cos(y)", latex: "\\sin(x) + \\cos(y)" },
        { label: "Logarítmica", value: "log(x) + y", latex: "\\log(x) + y" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <header className="bg-blue-600 text-white py-6 text-center font-bold text-2xl shadow-md">
                <h1>Calculadora de Ecuaciones Diferenciales</h1>
            </header>

            <div className="flex flex-1 flex-col md:flex-row p-4 gap-4">
                <div className="w-full md:w-1/3">
                    <Card className="shadow-lg">
                        <CardContent className="p-6">
                            <h2 className="font-semibold text-lg mb-4 text-gray-800">Parámetros</h2>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Ecuación diferencial <InlineMath>{'\\frac{dy}{dx} = f(x,y)'}</InlineMath>:
                                </label>

                                {isEditing ? (
                                    <div className="space-y-2">
                                        <Input
                                            value={func}
                                            onChange={(e) => updateLatexPreview(e.target.value)}
                                            placeholder="Ej: x + y, x^2 + y, sin(x)*y"
                                            className="w-full font-mono"
                                        />
                                        <div className="flex justify-between">
                                            <Button
                                                size="sm"
                                                onClick={() => setIsEditing(false)}
                                                className="mt-2"
                                            >
                                                Vista Previa
                                            </Button>
                                            <div className="text-xs text-gray-500 mt-3">
                                                Usa sintaxis JavaScript (ej: x^2 para x²)
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="p-2 border rounded-md min-h-10 bg-gray-50">
                                            <BlockMath>{`f(x,y) = ${latexPreview}`}</BlockMath>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => setIsEditing(true)}
                                            className="mt-2"
                                        >
                                            Editar Ecuación
                                        </Button>
                                    </div>
                                )}

                                <div className="mt-3">
                                    <p className="text-sm font-medium mb-2">Ejemplos rápidos:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {commonEquations.map((eq, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setFunc(eq.value);
                                                    setLatexPreview(eq.latex);
                                                    setIsEditing(false);
                                                }}
                                            >
                                                {eq.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid hidden grid-cols-3 gap-3 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1"><InlineMath>x_0</InlineMath>:</label>
                                    <Input
                                        type="number"
                                        value={x0}
                                        onChange={(e) => setX0(e.target.value)}
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1"><InlineMath>y_0</InlineMath>:</label>
                                    <Input
                                        type="number"
                                        value={y0}
                                        onChange={(e) => setY0(e.target.value)}
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Paso <InlineMath>h</InlineMath>:</label>
                                    <Input
                                        type="number"
                                        value={h}
                                        onChange={(e) => setH(e.target.value)}
                                        step="0.01"
                                        min="0.001"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                <Button
                                    onClick={() => handleSolve(euler, "Euler")}
                                    className="flex-1 min-w-[100px] bg-blue-600 hover:bg-blue-700"
                                >
                                    Euler
                                </Button>
                                <Button
                                    onClick={() => handleSolve(eulerMejorado, "Euler Mejorado")}
                                    className="flex-1 min-w-[100px] bg-green-600 hover:bg-green-700"
                                >
                                    Euler Mejorado
                                </Button>
                                <Button
                                    onClick={() => handleSolve(rungeKutta, "Runge-Kutta")}
                                    className="flex-1 min-w-[100px] bg-purple-600 hover:bg-purple-700"
                                >
                                    Runge-Kutta
                                </Button>
                            </div>

                            {methodUsed && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                    <p className="font-medium mb-2">Configuración actual:</p>
                                    <BlockMath>{`\\frac{dy}{dx} = ${latexPreview}`}</BlockMath>
                                    <div className="flex space-x-4 text-sm mt-2">
                                        <p><InlineMath>{`x_0 = ${x0}`}</InlineMath></p>
                                        <p><InlineMath>{`y_0 = ${y0}`}</InlineMath></p>
                                        <p><InlineMath>{`h = ${h}`}</InlineMath></p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="w-full md:w-2/3 space-y-4">
                    <Card className="shadow-lg">
                        <CardContent className="p-6">
                            <h2 className="font-semibold text-lg mb-4 text-gray-800">Resultados Gráficos</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis
                                            dataKey="x"
                                            label={{ value: 'x', position: 'insideBottomRight', offset: -10 }}
                                        />
                                        <YAxis
                                            label={{ value: 'y', angle: -90, position: 'insideLeft' }}
                                        />
                                        <Tooltip
                                            formatter={(value, name) => [
                                                parseFloat(value).toFixed(6),
                                                name === 'y' ? 'Aproximado' : 'Exacto'
                                            ]}
                                            labelFormatter={(x) => `x = ${x.toFixed(4)}`}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="y"
                                            stroke="#3b82f6"
                                            name="Aproximado"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="exact"
                                            stroke="#10b981"
                                            name="Exacto"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Tabla de Resultados</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Iteración</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Valor Exacto</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Valor Aproximado</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Error (%)</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {tableData.map((row, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{row.iteracion}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono">
                                                {typeof row.valorExacto === 'number' ? row.valorExacto.toFixed(6) : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono">
                                                {row.valorAproximado.toFixed(6)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono">
                                                {typeof row.errorPorcentaje === 'number'
                                                    ? row.errorPorcentaje < 0.0001
                                                        ? '< 0.0001%'
                                                        : row.errorPorcentaje.toFixed(4) + '%'
                                                    : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}