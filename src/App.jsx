import { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

export default function App() {
  const [velocidad, setVelocidad] = useState(5);
  const [tiempo, setTiempo] = useState(5);
  const [respuesta, setRespuesta] = useState('');
  const [feedback, setFeedback] = useState('');
  const [puntaje, setPuntaje] = useState(0);
  const [errores, setErrores] = useState(() => parseInt(localStorage.getItem('errores') || '0'));
  const [intentos, setIntentos] = useState(() => parseInt(localStorage.getItem('intentos') || '0'));
  const startTimeRef = useRef(Date.now());

  // Evento de cierre para registrar tiempo total
  useEffect(() => {
    const start = Date.now();
    const handleBeforeUnload = () => {
      const tiempoTotal = (Date.now() - start) / 1000;
      localStorage.setItem('tiempo', tiempoTotal.toFixed(2));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const calcularDistancia = (v, t) => v * t;

  const evaluar = () => {
    const correcta = calcularDistancia(velocidad, tiempo);
    const tiempoApp = (Date.now() - startTimeRef.current) / 1000;
    localStorage.setItem('tiempo', tiempoApp.toFixed(2));

    const nuevoIntento = intentos + 1;
    setIntentos(nuevoIntento);
    localStorage.setItem('intentos', nuevoIntento);

    if (Math.abs(parseFloat(respuesta) - correcta) < 0.1) {
      setFeedback('✅ Correcto. d = v × t');
      setPuntaje(p => p + 10);
    } else {
      const nuevosErrores = errores + 1;
      setErrores(nuevosErrores);
      localStorage.setItem('errores', nuevosErrores);
      console.log(`Fallo #${nuevosErrores}`);

      if (nuevosErrores >= 3) {
        setFeedback('⚠️ Parece que estás teniendo dificultades. Revisa el concepto de MRU o pide ayuda al docente.');
      } else {
        setFeedback('❌ Incorrecto. Revisa la fórmula: d = v × t');
      }

      setPuntaje(p => Math.max(p - 5, 0));
    }
  };

  const mostrarAnaliticas = () => {
    const tiempo = localStorage.getItem('tiempo') || '0';
    const errores = localStorage.getItem('errores') || '0';
    const intentos = localStorage.getItem('intentos') || '0';
    const puntajeActual = puntaje;
    console.log('Analítica del Aprendizaje:');
    console.log(`Tiempo total: ${tiempo} segundos`);
    console.log(`Intentos: ${intentos}`);
    console.log(`Errores: ${errores}`);
    console.log(`Puntaje: ${puntajeActual}`);
  };

  const tiempos = Array.from({ length: tiempo + 1 }, (_, i) => i);
  const posiciones = tiempos.map(t => calcularDistancia(velocidad, t));

  const data = {
    datasets: [{
      label: 'Posición (m)',
      data: tiempos.map(t => ({ x: t, y: calcularDistancia(velocidad, t) })),
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      tension: 0.2
    }]
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Gráfica Posición vs Tiempo (MRU)' }
    },
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: 'Tiempo (s)' },
        min: 0,
        max: 20
      },
      y: {
        title: { display: true, text: 'Posición (m)' },
        min: 0,
        max: 400
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Menú lateral */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-2xl font-extrabold mb-6">Lecciones</h2>
        <nav className="space-y-2">
          {[
            'Movimiento Rectilíneo Uniforme',
            'Fuerza y Resorte',
            'Ley de Hooke en acción',
            'Retos con masas',
            'Simulación interactiva',
            'Evaluación final'
          ].map((item, idx) => (
            <div key={idx}>
              <a
                href="#"
                className={`block px-3 py-2 rounded transition duration-200 ${idx === 0
                  ? 'bg-blue-700 font-semibold'
                  : 'hover:bg-blue-800'
                  }`}
              >
                {item}
              </a>
              {idx !== 5 && <hr className="border-gray-700 my-1" />}
            </div>
          ))}
        </nav>
      </aside>

      {/* Área principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Movimiento Rectilíneo Uniforme</h1>

        <div className="w-[95%] max-w-5xl mx-auto mb-6 grid grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-2">Velocidad (m/s): {velocidad}</label>
            <input type="range" min="1" max="20" value={velocidad} onChange={e => setVelocidad(+e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="block font-semibold mb-2">Tiempo (s): {tiempo}</label>
            <input type="range" min="1" max="20" value={tiempo} onChange={e => setTiempo(+e.target.value)} className="w-full" />
          </div>
        </div>

        {/* Gráfico */}
        <div className="w-[95%] max-w-5xl h-[400px] mx-auto">
          <Line data={data} options={options} />
        </div>

        {/* Ingreso de respuesta */}
        <div className="bg-gray-100 p-4 rounded shadow-md mb-4">
          <p className="mb-2 font-medium">¿Cuál es la distancia recorrida si v = {velocidad} m/s y t = {tiempo} s?</p>
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              step="any"
              value={respuesta}
              onChange={e => setRespuesta(e.target.value)}
              placeholder="Ingresa tu respuesta aquí"
              className="flex-1 border p-2 rounded"
            />
            <button
              onClick={evaluar}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
            >
              Evaluar
            </button>
          </div>
        </div>

        {/* Feedback */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700">Mensajes de retroalimentación / Respuestas</h2>

          {feedback && (
            <div className="mt-4 bg-blue-100 p-4 rounded shadow">
              <p className="text-blue-800 font-semibold">{feedback}</p>
              {feedback.includes('Incorrecto') && (
                <p className="text-gray-700 mt-2">
                  Revisa: La fórmula del MRU es <strong>d = v × t</strong>. Si v = {velocidad} m/s y t = {tiempo} s, entonces d = {velocidad * tiempo} m.
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500">Puntaje: {puntaje}</p>
        </div>

        {/* Barra de progreso */}
        <div className="mt-6">
          <h3 className="text-sm text-gray-500">Progreso:</h3>
          <div className="w-full bg-gray-200 rounded h-4 mt-1">
            <div
              className="bg-green-500 h-4 rounded"
              style={{ width: `${puntaje}%` }}
            />
          </div>
        </div>

        {/* Medalla */}
        {puntaje >= 30 && (
          <div className="mt-4 text-center text-yellow-600 font-bold">
            🏅 ¡Desbloqueaste la medalla “Buen inicio”!
          </div>
        )}

        {/* Botones: reiniciar y analíticas */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => {
              setPuntaje(0);
              setFeedback('');
              setRespuesta('');
              setErrores(0);
              setIntentos(0);
              localStorage.removeItem('errores');
              localStorage.removeItem('tiempo');
              localStorage.removeItem('intentos');
              console.clear();
              console.log('Progreso reiniciado.');
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reiniciar progreso
          </button>

          <button
            onClick={mostrarAnaliticas}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Mostrar analíticas
          </button>
        </div>
      </main>
    </div>
  );
}
