/*
 * Transcripción literal de la rutina original (Upper/Lower + PPL).
 * NO modificar ejercicios, series, rangos, agarres, técnicas ni variaciones:
 * lo único que cambió respecto al HTML original es el día de la semana asignado.
 */

/** Tipo de carga: define el % de subida y el incremento del equipo. */
export type Kind = 'heavy' | 'compound' | 'isolation';
export type Equip = 'barbell' | 'smith' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: [number, number];
  grip: string;
  effort: string;
  priority?: string;
  note?: string;
  variations: [string, string][];
  kind: Kind;
  equip: Equip;
  /** RIR objetivo una vez pasado el arranque (null si la meta es el fallo). */
  rir: number | null;
}

export interface Day {
  id: DayId;
  title: string;
  focus: string;
  minutes: string;
  /** Pesado (fuerza) o volumen. */
  heavy: boolean;
  exercises: Exercise[];
}

export type DayId = 'torso' | 'pierna-fuerza' | 'empuje' | 'jalon' | 'pierna-hipertrofia';

const ex = (e: Exercise) => e;

export const DAYS: Record<DayId, Day> = {
  torso: {
    id: 'torso',
    title: 'Torso',
    focus: 'Fuerza. Pecho, espalda, hombro y brazos.',
    minutes: '75–85 min',
    heavy: true,
    exercises: [
      ex({
        id: 'press-banca', name: 'Press banca con barra', sets: 4, reps: [5, 7],
        grip: 'Prono, 1.5 veces el ancho de hombros', effort: 'RIR 1', rir: 1,
        kind: 'heavy', equip: 'barbell',
        variations: [
          ['Press banca con mancuernas', 'agarre prono o semineutro'],
          ['Press en Smith', 'mismo agarre que con barra'],
          ['Press en máquina convergente', 'prono o neutro según las manijas'],
        ],
      }),
      ex({
        id: 'press-militar-mancuernas', name: 'Press militar con mancuernas sentado', sets: 4, reps: [6, 8],
        grip: 'Prono o semineutro', effort: 'RIR 1', rir: 1, priority: 'Hombro frontal',
        note: 'Va en segundo lugar para llegar fresco.', kind: 'compound', equip: 'dumbbell',
        variations: [
          ['Press militar con barra de pie', 'prono, al ancho de hombros; no al fallo'],
          ['Press de hombro en máquina', 'prono o neutro'],
          ['Press en Smith sentado', 'prono, un poco más abierto que los hombros'],
        ],
      }),
      ex({
        id: 'remo-pecho-apoyado', name: 'Remo con pecho apoyado', sets: 4, reps: [6, 8],
        grip: 'Prono, abierto', effort: 'RIR 1, pausa 1 s', rir: 1, priority: 'Espalda media',
        note: 'Codos a 45–60° del torso y escápulas atrás en cada repetición.', kind: 'compound', equip: 'machine',
        variations: [
          ['Remo en T con pecho apoyado', 'prono y abierto'],
          ['Remo en máquina tipo Hammer', 'prono'],
          ['Remo Seal con barra', 'prono, al ancho de hombros'],
        ],
      }),
      ex({
        id: 'jalon-pecho', name: 'Jalón al pecho', sets: 3, reps: [8, 10],
        grip: 'Prono, un poco más abierto que los hombros', effort: 'RIR 0–1', rir: 0,
        kind: 'compound', equip: 'cable',
        variations: [
          ['Dominadas pronas', 'mismo agarre'],
          ['Jalón con agarre neutro ancho', 'neutro'],
          ['Jalón unilateral en polea', 'neutro o semisupino'],
        ],
      }),
      ex({
        id: 'pec-deck-invertido', name: 'Pec deck invertido (pájaros)', sets: 3, reps: [12, 15],
        grip: 'Neutro o prono en las manijas', effort: 'Fallo + parciales en la última', rir: null,
        priority: 'Hombro posterior', kind: 'isolation', equip: 'machine',
        variations: [
          ['Pájaros con mancuernas en banco inclinado', 'neutro'],
          ['Cruces invertidos en polea', 'sin manija, tomando el cable con la mano'],
        ],
      }),
      ex({
        id: 'laterales-polea', name: 'Elevaciones laterales en polea', sets: 2, reps: [12, 15],
        grip: 'Neutro con manija D', effort: 'Fallo + parciales en la última', rir: null,
        note: 'Volumen de mantenimiento.', kind: 'isolation', equip: 'cable',
        variations: [
          ['Elevación lateral en polea por detrás del cuerpo', 'neutro'],
          ['Máquina de laterales', 'según las almohadillas'],
          ['Y-raise en polea', 'prono'],
        ],
      }),
      ex({
        id: 'curl-ez', name: 'Curl con barra EZ', sets: 3, reps: [8, 10],
        grip: 'Semisupino, al ancho de hombros', effort: 'Fallo en la última', rir: null,
        kind: 'isolation', equip: 'barbell',
        variations: [
          ['Curl con barra recta', 'supino'],
          ['Curl en polea con barra', 'supino'],
        ],
      }),
      ex({
        id: 'extension-triceps-polea', name: 'Extensión de tríceps sobre la cabeza en polea', sets: 3, reps: [10, 12],
        grip: 'Neutro con cuerda', effort: 'Fallo en la última', rir: null,
        kind: 'isolation', equip: 'cable',
        variations: [
          ['Con barra recta en polea', 'prono'],
          ['Unilateral con manija D', 'neutro'],
          ['Extensión cruzada (katana)', 'neutro'],
        ],
      }),
      ex({
        id: 'talones-prensa', name: 'Elevación de talones en prensa', sets: 3, reps: [10, 15],
        grip: 'Sin agarre, pies al ancho de cadera', effort: 'RIR 0–1, pausa 2 s abajo', rir: 0,
        kind: 'isolation', equip: 'machine',
        variations: [
          ['En máquina de pie', 'manijas laterales'],
          ['En Smith sobre un step', 'prono en la barra'],
        ],
      }),
    ],
  },

  'pierna-fuerza': {
    id: 'pierna-fuerza',
    title: 'Pierna',
    focus: 'Fuerza. Cuádriceps, isquios, glúteo, trapecio y abdomen.',
    minutes: '80–90 min',
    heavy: true,
    exercises: [
      ex({
        id: 'sentadilla', name: 'Sentadilla libre o hack', sets: 4, reps: [5, 7],
        grip: 'Prono, manos justo fuera de los hombros (barra libre)', effort: 'RIR 1', rir: 1,
        kind: 'heavy', equip: 'barbell',
        variations: [
          ['Hack squat', 'manijas de la máquina'],
          ['Sentadilla en Smith', 'prono'],
          ['Sentadilla en péndulo', 'manijas de la máquina'],
          ['Sentadilla frontal', 'agarre limpio o brazos cruzados'],
        ],
      }),
      ex({
        id: 'peso-muerto-rumano', name: 'Peso muerto rumano', sets: 3, reps: [6, 8],
        grip: 'Prono, al ancho de hombros (straps si se escapa)', effort: 'RIR 1–2', rir: 1,
        priority: 'Espalda baja', kind: 'heavy', equip: 'barbell',
        variations: [
          ['Rumano con mancuernas', 'neutro'],
          ['Rumano en Smith', 'prono'],
          ['Good morning con barra', 'barra en la espalda, prono'],
        ],
      }),
      ex({
        id: 'prensa', name: 'Prensa de piernas', sets: 3, reps: [10, 12],
        grip: 'Manijas laterales, pies al ancho de cadera', effort: 'RIR 0–1', rir: 0,
        kind: 'compound', equip: 'machine',
        variations: [
          ['Pies bajos y juntos', 'más cuádriceps'],
          ['Belt squat', 'manijas de la máquina'],
          ['Sentadilla en péndulo', 'manijas de la máquina'],
        ],
      }),
      ex({
        id: 'curl-femoral-sentado', name: 'Curl femoral sentado', sets: 3, reps: [10, 12],
        grip: 'Manijas laterales', effort: 'Fallo + parciales en la última', rir: null,
        kind: 'isolation', equip: 'machine',
        variations: [
          ['Curl femoral acostado', 'manijas de la máquina'],
          ['Curl nórdico', 'sin agarre'],
        ],
      }),
      ex({
        id: 'talones-de-pie', name: 'Elevación de talones de pie', sets: 4, reps: [8, 12],
        grip: 'Manijas o almohadillas de la máquina', effort: 'Pausa de 2 s abajo', rir: null,
        kind: 'isolation', equip: 'machine',
        variations: [
          ['En Smith sobre un step', 'prono'],
          ['Unilateral con mancuerna', 'neutro, la otra mano apoyada'],
        ],
      }),
      ex({
        id: 'encogimientos', name: 'Encogimientos con mancuernas', sets: 2, reps: [10, 15],
        grip: 'Neutro, brazos a los costados', effort: 'Pausa de 1 s arriba', rir: null,
        kind: 'isolation', equip: 'dumbbell',
        variations: [
          ['Con barra', 'prono, al ancho de hombros'],
          ['En Smith', 'prono'],
          ['En polea baja', 'neutro con manijas D'],
        ],
      }),
      ex({
        id: 'crunch-polea', name: 'Crunch en polea', sets: 3, reps: [10, 12],
        grip: 'Neutro con cuerda, junto a la cabeza', effort: 'RIR 0–1', rir: 0,
        kind: 'isolation', equip: 'cable',
        variations: [
          ['Crunch en máquina', 'manijas de la máquina'],
          ['Crunch con peso en banco declinado', 'disco al pecho'],
        ],
      }),
      ex({
        id: 'curl-polea-recta', name: 'Curl en polea con barra recta (superserie con el siguiente)', sets: 2, reps: [10, 12],
        grip: 'Supino, al ancho de hombros', effort: 'RIR 0–1', rir: 0, priority: 'Volumen extra de brazos',
        note: 'Haz una serie de curl e inmediatamente una de tríceps; descansa 1.5 min y repite.',
        kind: 'isolation', equip: 'cable',
        variations: [
          ['Curl con barra EZ en polea', 'semisupino'],
          ['Curl con mancuernas alterno de pie', 'supino'],
        ],
      }),
      ex({
        id: 'press-triceps-v', name: 'Press de tríceps en polea con barra V', sets: 2, reps: [10, 12],
        grip: 'Semineutro', effort: 'RIR 0–1', rir: 0, priority: 'Volumen extra de brazos',
        kind: 'isolation', equip: 'cable',
        variations: [
          ['Press con cuerda', 'neutro'],
          ['Fondos en banco', 'prono, manos atrás'],
        ],
      }),
    ],
  },

  empuje: {
    id: 'empuje',
    title: 'Empuje',
    focus: 'Pecho, hombro frontal y lateral, tríceps.',
    minutes: '75–85 min',
    heavy: false,
    exercises: [
      ex({
        id: 'press-inclinado-mancuernas', name: 'Press inclinado con mancuernas', sets: 4, reps: [8, 10],
        grip: 'Prono o semineutro, banco a 30°', effort: 'RIR 0–1', rir: 0,
        kind: 'compound', equip: 'dumbbell',
        variations: [
          ['Press inclinado con barra', 'prono, 1.5 veces el ancho de hombros'],
          ['Press inclinado en Smith', 'prono'],
          ['Press inclinado en máquina', 'prono o neutro'],
        ],
      }),
      ex({
        id: 'press-pecho-maquina', name: 'Press de pecho en máquina o fondos', sets: 3, reps: [10, 12],
        grip: 'Prono o neutro (máquina); neutro en paralelas (fondos)', effort: 'Fallo en la última', rir: null,
        kind: 'compound', equip: 'machine',
        variations: [
          ['Press plano con mancuernas', 'semineutro'],
          ['Press declinado con barra', 'prono'],
          ['Fondos asistidos', 'neutro'],
        ],
      }),
      ex({
        id: 'aperturas', name: 'Aperturas en polea o pec deck', sets: 3, reps: [12, 15],
        grip: 'Neutro', effort: 'Fallo + drop set en la última', rir: null,
        kind: 'isolation', equip: 'cable',
        variations: [
          ['Cruces en polea de abajo hacia arriba', 'supino, más pecho superior'],
          ['Aperturas con mancuernas en banco inclinado', 'neutro'],
        ],
      }),
      ex({
        id: 'elevacion-frontal-polea', name: 'Elevación frontal en polea', sets: 3, reps: [10, 12],
        grip: 'Prono con manija o neutro con cuerda', effort: 'Fallo + parciales en la última', rir: null,
        priority: 'Hombro frontal', note: 'Polea baja por detrás, el cable pasa entre las piernas.',
        kind: 'isolation', equip: 'cable',
        variations: [
          ['Elevación frontal con mancuerna', 'prono o neutro'],
          ['Elevación frontal con disco', 'neutro'],
          ['Elevación frontal con barra', 'prono, al ancho de hombros'],
        ],
      }),
      ex({
        id: 'laterales-mancuerna', name: 'Elevaciones laterales con mancuerna', sets: 3, reps: [12, 20],
        grip: 'Prono o neutro, codos un poco flexionados', effort: 'Fallo + myo-reps en la última', rir: null,
        kind: 'isolation', equip: 'dumbbell',
        variations: [
          ['Lateral inclinado apoyado (lean-away)', 'neutro'],
          ['Máquina de laterales', 'según las almohadillas'],
        ],
      }),
      ex({
        id: 'press-triceps-polea', name: 'Press de tríceps en polea', sets: 3, reps: [10, 12],
        grip: 'Prono con barra recta o neutro con cuerda', effort: 'Fallo', rir: null,
        kind: 'isolation', equip: 'cable',
        variations: [
          ['Con barra V', 'semineutro'],
          ['Unilateral con manija', 'supino'],
        ],
      }),
      ex({
        id: 'extension-triceps-mancuerna', name: 'Extensión de tríceps sobre la cabeza con mancuerna', sets: 2, reps: [12, 15],
        grip: 'Ambas manos bajo el disco, palmas arriba', effort: 'Fallo + parciales en la última', rir: null,
        kind: 'isolation', equip: 'dumbbell',
        variations: [
          ['Press francés con barra EZ', 'semineutro'],
          ['Extensión unilateral con mancuerna', 'neutro'],
        ],
      }),
      ex({
        id: 'curl-concentrado', name: 'Curl concentrado con mancuerna', sets: 2, reps: [12, 15],
        grip: 'Supino', effort: 'Fallo en la última', rir: null, priority: 'Volumen extra de brazos',
        kind: 'isolation', equip: 'dumbbell',
        variations: [
          ['Curl en máquina de bíceps', 'supino'],
          ['Curl unilateral en polea baja', 'supino'],
        ],
      }),
    ],
  },

  jalon: {
    id: 'jalon',
    title: 'Jalón',
    focus: 'Dorsal, espalda media, hombro posterior y bíceps.',
    minutes: '70–80 min',
    heavy: false,
    exercises: [
      ex({
        id: 'dominadas-neutro', name: 'Dominadas o jalón con agarre neutro', sets: 4, reps: [6, 10],
        grip: 'Neutro, al ancho de hombros', effort: 'RIR 0–1', rir: 0,
        kind: 'compound', equip: 'cable',
        variations: [
          ['Dominadas pronas', 'prono, un poco más abierto que los hombros'],
          ['Chin-ups', 'supino, al ancho de hombros'],
          ['Dominadas asistidas en máquina', 'neutro'],
        ],
      }),
      ex({
        id: 'remo-mancuerna', name: 'Remo con mancuerna a una mano', sets: 3, reps: [8, 12],
        grip: 'Neutro', effort: 'RIR 0–1', rir: 0,
        kind: 'compound', equip: 'dumbbell',
        variations: [
          ['Remo Meadows con barra landmine', 'prono'],
          ['Remo unilateral en polea', 'neutro'],
          ['Remo unilateral en máquina', 'neutro o prono'],
        ],
      }),
      ex({
        id: 'remo-sentado-polea', name: 'Remo sentado en polea', sets: 3, reps: [10, 12],
        grip: 'El agarre que ya usas (normalmente triángulo, neutro y cerrado)', effort: 'Fallo en la última', rir: null,
        note: 'Se queda igual. Opcional: escápulas atrás 1 s al final de cada repetición.',
        kind: 'compound', equip: 'cable',
        variations: [
          ['Con barra ancha', 'prono, solo si la máquina está ocupada'],
          ['Unilateral con manija D', 'neutro'],
        ],
      }),
      ex({
        id: 'pajaros-face-pull', name: 'Pájaros en máquina o face pull', sets: 4, reps: [12, 15],
        grip: 'Neutro o prono (máquina); neutro con cuerda (face pull)', effort: 'Fallo + myo-reps en la última', rir: null,
        priority: 'Hombro posterior', kind: 'isolation', equip: 'machine',
        variations: [
          ['Cruces invertidos en polea', 'tomando el cable con la mano'],
          ['Pájaros con mancuernas inclinado', 'neutro'],
        ],
      }),
      ex({
        id: 'curl-inclinado', name: 'Curl inclinado con mancuernas', sets: 3, reps: [10, 12],
        grip: 'Supino', effort: 'Fallo + parciales en la última', rir: null,
        kind: 'isolation', equip: 'dumbbell',
        variations: [
          ['Bayesian curl en polea', 'supino'],
          ['Curl en predicador inclinado', 'supino'],
        ],
      }),
      ex({
        id: 'curl-predicador-martillo', name: 'Curl predicador o martillo', sets: 2, reps: [12, 15],
        grip: 'Supino (predicador) o neutro (martillo)', effort: 'Fallo + drop set en la última', rir: null,
        kind: 'isolation', equip: 'dumbbell',
        variations: [
          ['Curl en polea con cuerda', 'neutro'],
          ['Curl araña', 'supino'],
        ],
      }),
      ex({
        id: 'press-triceps-unilateral', name: 'Press de tríceps unilateral en polea', sets: 2, reps: [12, 15],
        grip: 'Supino con manija D', effort: 'Fallo + myo-reps en la última', rir: null,
        priority: 'Volumen extra de brazos', kind: 'isolation', equip: 'cable',
        variations: [
          ['Patada de tríceps en polea', 'neutro'],
          ['Press de tríceps unilateral con agarre prono', 'prono'],
        ],
      }),
    ],
  },

  'pierna-hipertrofia': {
    id: 'pierna-hipertrofia',
    title: 'Pierna',
    focus: 'Hipertrofia. Pierna completa, espalda media y baja, abdomen.',
    minutes: '80–90 min',
    heavy: false,
    exercises: [
      ex({
        id: 'bulgara', name: 'Sentadilla búlgara', sets: 3, reps: [8, 10],
        grip: 'Neutro con mancuernas', effort: 'RIR 0–1, por pierna', rir: 0,
        kind: 'compound', equip: 'dumbbell',
        variations: [
          ['Búlgara en Smith', 'prono'],
          ['Búlgara con barra', 'prono en la espalda'],
          ['Zancada caminando', 'neutro con mancuernas'],
        ],
      }),
      ex({
        id: 'hip-thrust', name: 'Hip thrust', sets: 3, reps: [10, 12],
        grip: 'Prono, sujetando la barra sobre la cadera', effort: 'RIR 1', rir: 1,
        kind: 'compound', equip: 'barbell',
        variations: [
          ['Máquina de hip thrust', 'manijas de la máquina'],
          ['Puente de glúteo en Smith', 'prono'],
        ],
      }),
      ex({
        id: 'extension-cuadriceps', name: 'Extensión de cuádriceps', sets: 4, reps: [12, 15],
        grip: 'Manijas laterales', effort: 'Fallo + drop set en la última', rir: null,
        kind: 'isolation', equip: 'machine',
        variations: [
          ['Unilateral', 'manijas laterales'],
          ['Con el respaldo reclinado', 'más estiramiento del recto femoral'],
        ],
      }),
      ex({
        id: 'curl-femoral-acostado', name: 'Curl femoral acostado', sets: 4, reps: [12, 15],
        grip: 'Manijas de la máquina', effort: 'Fallo + parciales en la última', rir: null,
        kind: 'isolation', equip: 'machine',
        variations: [
          ['Curl femoral sentado', 'manijas laterales'],
          ['Curl unilateral de pie', 'manijas de la máquina'],
        ],
      }),
      ex({
        id: 'aductores', name: 'Máquina de aductores', sets: 2, reps: [12, 15],
        grip: 'Manijas laterales', effort: 'RIR 0–1', rir: 0,
        kind: 'isolation', equip: 'machine',
        variations: [
          ['Plancha Copenhague', 'sin agarre'],
          ['Aducción en polea baja', 'tobillera'],
        ],
      }),
      ex({
        id: 'remo-maquina-abierto', name: 'Remo en máquina con agarre abierto', sets: 3, reps: [12, 15],
        grip: 'Prono, abierto', effort: 'Pausa de 1 s en la contracción', rir: null,
        priority: 'Espalda media', kind: 'compound', equip: 'machine',
        variations: [
          ['Remo en T con agarre ancho', 'prono'],
          ['Remo en polea con barra ancha', 'prono'],
        ],
      }),
      ex({
        id: 'talones-sentado', name: 'Elevación de talones sentado', sets: 3, reps: [15, 20],
        grip: 'Manijas o almohadilla de la máquina', effort: 'Fallo', rir: null,
        kind: 'isolation', equip: 'machine',
        variations: [
          ['Sentado con barra en Smith', 'prono'],
          ['Sentado con mancuernas sobre las rodillas', 'neutro'],
        ],
      }),
      ex({
        id: 'hiperextensiones', name: 'Hiperextensiones a 45°', sets: 3, reps: [10, 15],
        grip: 'Brazos cruzados o disco al pecho', effort: 'RIR 1–2, control en la bajada', rir: 1,
        priority: 'Espalda baja', note: 'Al final de la sesión. Agrega peso cuando hagas 15 fácil.',
        kind: 'compound', equip: 'bodyweight',
        variations: [
          ['Reverse hyper', 'manijas de la máquina'],
          ['Extensión lumbar en máquina', 'sin agarre'],
        ],
      }),
      ex({
        id: 'elevaciones-piernas', name: 'Elevaciones de piernas colgado', sets: 3, reps: [10, 15],
        grip: 'Prono en barra fija (straps si falla el agarre)', effort: 'RIR 0–1', rir: 0,
        kind: 'isolation', equip: 'bodyweight',
        variations: [
          ['En silla romana', 'codos apoyados'],
          ['Crunch inverso en banco', 'prono en el banco'],
        ],
      }),
    ],
  },
};

/** Series directas por semana (sin cambios). `indirect`: recibe mucho trabajo indirecto. */
export const VOLUME: { muscle: string; sets: number; indirect: boolean }[] = [
  { muscle: 'Espalda (dorsal y media)', sets: 20, indirect: false },
  { muscle: 'Pecho', sets: 14, indirect: false },
  { muscle: 'Cuádriceps', sets: 14, indirect: false },
  { muscle: 'Isquios y glúteo', sets: 13, indirect: false },
  { muscle: 'Bíceps', sets: 12, indirect: true },
  { muscle: 'Tríceps', sets: 12, indirect: true },
  { muscle: 'Pantorrilla', sets: 10, indirect: false },
  { muscle: 'Hombro frontal', sets: 7, indirect: true },
  { muscle: 'Hombro posterior', sets: 7, indirect: true },
  { muscle: 'Abdomen', sets: 6, indirect: false },
  { muscle: 'Hombro lateral', sets: 5, indirect: true },
  { muscle: 'Espalda baja', sets: 3, indirect: true },
  { muscle: 'Trapecio superior', sets: 2, indirect: true },
  { muscle: 'Aductores', sets: 2, indirect: true },
];

export const GRIPS = [
  { name: 'Prono', text: 'Palmas hacia abajo o alejándose de ti. Más trabajo de dorsal superior, deltoide posterior y braquiorradial.' },
  { name: 'Supino', text: 'Palmas hacia arriba o hacia ti. Máximo trabajo de bíceps.' },
  { name: 'Neutro', text: 'Palmas enfrentadas, como sostener un martillo. Más cómodo para hombros y codos.' },
  { name: 'Semineutro', text: 'Punto medio entre prono y neutro, con las palmas a unos 45°. Típico de la barra EZ y los press con mancuerna.' },
];

export const TECHNIQUES = [
  { name: 'Parciales', text: 'Tras llegar al fallo, haz 4–6 repeticiones de medio rango en la parte donde el músculo está estirado.' },
  { name: 'Myo-reps', text: 'Tras el fallo, descansa 15 s y haz 3–5 repeticiones más. Repite 2–3 veces.' },
  { name: 'Drop set', text: 'Tras el fallo, baja el peso 25–30% y sigue sin descanso hasta el fallo otra vez.' },
  { name: 'RIR', text: 'Repeticiones en reserva. RIR 1 significa que terminas la serie cuando te queda 1 repetición limpia.' },
];

export const RULES = [
  { name: 'Arranque', text: 'Las primeras 2 semanas trabaja a RIR 1–2 en todo, sin técnicas de intensidad. Después baja a lo que indica cada ejercicio.' },
  { name: 'Descansos', text: '2–3 min en compuestos y 1.5–2 min en aislamientos. En las series FST-7, 30–45 s.' },
  { name: 'Doble progresión', text: 'Cuando completes todas las series en el tope del rango, sube el peso entre 2.5 y 5% y vuelve al mínimo del rango.' },
  { name: 'Calentamiento', text: 'Antes del primer ejercicio del día, 2–3 series de aproximación al 50%, 70% y 85% del peso de trabajo.' },
  { name: 'Descarga', text: 'Cada 5–6 semanas, una semana con la mitad de las series, a RIR 3–4 y sin técnicas.' },
  { name: 'Sin fallo en pesados', text: 'Nunca llevas al fallo la sentadilla, el peso muerto rumano, el press banca con barra, el press militar de pie ni las hiperextensiones con peso.' },
  { name: 'Espalda baja', text: 'Si notas rigidez lumbar en la sentadilla o el rumano de la semana siguiente, baja las hiperextensiones a 2 series o a RIR 2.' },
  { name: 'Si algo falla', text: 'Si una articulación molesta o el rendimiento cae 2 semanas seguidas, quita primero las técnicas y luego una serie por ejercicio.' },
  { name: 'Variaciones', text: 'Cambia un ejercicio solo por una de sus variaciones y mantenla al menos un bloque de 5–6 semanas para poder medir tu progreso.' },
];

/** Prioridades con los días renombrados al nuevo calendario. */
export const PRIORITIES = [
  { name: 'Hombro frontal', items: ['Press militar en 2º lugar del jueves (Torso), 4 × 6–8.', 'Elevación frontal en polea el lunes (Empuje).'] },
  { name: 'Hombro posterior', items: ['Pec deck invertido el jueves (Torso).', 'Pájaros o face pull a 4 series el martes (Jalón).'] },
  { name: 'Espalda media', items: ['Remo con pecho apoyado con agarre abierto y pausa.', 'Remo en máquina abierto el miércoles (Pierna hipertrofia).', 'El remo sentado en polea se queda igual.'] },
  { name: 'Espalda baja', items: ['Peso muerto rumano el viernes (Pierna fuerza).', 'Hiperextensiones a 45° al final del miércoles (Pierna hipertrofia).'] },
];

export const DIET = {
  intro: 'Para 82 kg y 1.93 m. Mantenimiento estimado de 2,950–3,000 kcal, asumiendo unos 22 años y 5 entrenamientos por semana. Con este volumen de entrenamiento, empieza en el rango alto.',
  macros: [
    { value: '3,300', label: 'kcal al día', key: true },
    { value: '170 g', label: 'Proteína, unos 2 g por kg' },
    { value: '80–90 g', label: 'Grasa, unos 25% de las calorías' },
    { value: '440–460 g', label: 'Carbohidratos, el resto' },
  ],
  goal: 'Meta: ganar 0.2–0.4 kg por semana (1–1.5 kg al mes).',
  meals: [
    ['Desayuno', '4 huevos, 100 g de avena con plátano y 1 vaso de leche.'],
    ['Comida', '200 g de pechuga o carne magra, 250 g de arroz cocido, frijoles y verduras.'],
    ['Pre-entreno', '2 tortillas o pan con crema de cacahuate y 1 fruta.'],
    ['Post-entreno', '1 scoop de proteína con leche y 1 plátano.'],
    ['Cena', '180 g de pescado, pollo o res, 300 g de papa o pasta cocida y verduras con aceite de oliva.'],
    ['Colación', 'Yogur griego con granola o un puño de nueces.'],
  ] as [string, string][],
  adjust: [
    'Pésate cada mañana al despertar, después de ir al baño, y compara el promedio semanal.',
    'Si en 2 semanas no subes, agrega 150–200 kcal, de preferencia en carbohidratos.',
    'Si subes más de 0.5 kg por semana o ganas grasa en la cintura, quita 150 kcal.',
    'Mantén la proteína fija y mueve solo carbohidratos y grasas.',
  ],
  recovery: 'Creatina monohidratada 3–5 g al día. Duerme 7–9 horas. Usa proteína en polvo solo si no llegas a los 170 g con comida.',
};

export const ALL_EXERCISES: Exercise[] = Object.values(DAYS).flatMap((d) => d.exercises);
export const exerciseById = (id: string) => ALL_EXERCISES.find((e) => e.id === id);
