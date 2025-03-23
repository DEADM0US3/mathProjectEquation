// Función para la ecuación diferencial: dy/dx = x + y
const f = (x, y) => {
    return x + y;
};

// Método de Euler para resolver la ecuación diferencial
const solveEuler = (f, x0, y0, h, n) => {
    const points = [{ x: x0, y: y0 }];
    let x = x0, y = y0;
    for (let i = 0; i < n; i++) {
        y += h * f(x, y); // Método de Euler
        x += h;
        points.push({ x, y });
    }
    return points;
};

// Valor exacto usando la solución analítica de la ecuación dy/dx = x + y
const exactValue = (x, y0) => {
    return Math.exp(x) - x - 1 + y0; // Solución exacta para y(x) = Ce^x - x - 1
};

// Configuración inicial
const x0 = 0;      // Valor inicial de x
const y0 = 1;      // Valor inicial de y
const h = 0.1;     // Paso (h)
const n = 10;      // Número de pasos

// Resolver la ecuación usando el método de Euler
const result = solveEuler(f, x0, y0, h, n);

// Mostrar los resultados en la consola
console.log("Iteración\tValor Exacto\t\tValor Aproximado\tError (%)");
result.forEach((point, i) => {
    const exact = exactValue(point.x, y0);
    const error = Math.abs((point.y - exact) / exact) * 100;
    console.log(`${i + 1}\t\t${exact.toFixed(4)}\t\t${point.y.toFixed(4)}\t\t\t${error.toFixed(4)}%`);
});
