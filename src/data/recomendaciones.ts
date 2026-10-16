import { DAYS, type DayId, type Exercise } from './rutina';

/*
 * Recomendaciones opcionales: una capa aparte de la rutina base, que no cambia.
 * Se registran igual que cualquier ejercicio y la app cuenta si se hicieron o no.
 */

export interface Rec {
  day: DayId;
  why: string;
  ex: Exercise;
}

const talones = DAYS.torso.exercises.find((e) => e.id === 'talones-prensa')!;

export const RECS: Rec[] = [
  {
    day: 'empuje',
    why: 'El core directo solo aparece el miércoles y el viernes. La rueda suma trabajo antiextensión, que protege la espalda baja en la sentadilla y el rumano.',
    ex: {
      id: 'rec-rueda-abdominal', name: 'Rueda abdominal', sets: 2, reps: [8, 12],
      grip: 'Prono en las manijas', effort: 'RIR 1–2, sin arquear la espalda', rir: 1,
      kind: 'isolation', equip: 'bodyweight',
      variations: [
        ['Plancha con peso', 'antebrazos apoyados'],
        ['Rollout con barra y discos', 'prono'],
      ],
    },
  },
  {
    day: 'jalon',
    why: 'Braquiorradial y agarre en el día de jalón, sin cansar más el bíceps. Ayuda a sostener los remos y el rumano pesados.',
    ex: {
      id: 'rec-curl-inverso', name: 'Curl inverso con barra EZ', sets: 2, reps: [12, 15],
      grip: 'Prono, al ancho de hombros', effort: 'RIR 1–2', rir: 1,
      kind: 'isolation', equip: 'barbell',
      variations: [
        ['Curl inverso en polea', 'prono con barra recta'],
        ['Curl martillo cruzado', 'neutro'],
      ],
    },
  },
  {
    day: 'pierna-hipertrofia',
    why: 'El deltoide lateral solo tiene 5 series a la semana. Con estas 3 llega a 8, más cerca de las ~10 que suele recomendar Nippard para un músculo que se recupera rápido.',
    ex: {
      id: 'rec-laterales-polea', name: 'Elevaciones laterales en polea (extra)', sets: 3, reps: [12, 15],
      grip: 'Neutro con manija D, polea a la altura de la cadera', effort: 'RIR 1–2', rir: 1,
      kind: 'isolation', equip: 'cable',
      variations: [
        ['Con mancuerna, lean-away', 'neutro'],
        ['Máquina de laterales', 'según las almohadillas'],
      ],
    },
  },
  {
    day: 'pierna-hipertrofia',
    why: 'Alternativa: si el jueves se te alarga, haz aquí la elevación de talones en prensa en lugar del jueves. Comparte historial con la del jueves.',
    ex: talones,
  },
  {
    day: 'pierna-fuerza',
    why: 'El agarre es lo primero que falla en el rumano y en los remos pesados. Dos series al final del día bastan.',
    ex: {
      id: 'rec-curl-muneca', name: 'Curl de muñeca con barra', sets: 2, reps: [12, 15],
      grip: 'Supino, antebrazos sobre el banco', effort: 'RIR 1–2', rir: 1,
      kind: 'isolation', equip: 'barbell',
      variations: [
        ['Caminata de granjero', 'neutro, 30–40 m'],
        ['Curl de muñeca con mancuerna', 'supino'],
      ],
    },
  },
  {
    day: 'pierna-fuerza',
    why: 'Core antirrotación con muy poca fatiga. Complementa el crunch en polea sin cargar la espalda baja después del rumano.',
    ex: {
      id: 'rec-pallof', name: 'Pallof press', sets: 2, reps: [10, 12],
      grip: 'Ambas manos en la manija, de lado a la polea', effort: 'RIR 2, por lado', rir: 2,
      kind: 'isolation', equip: 'cable',
      variations: [
        ['Con banda elástica', 'mismo agarre'],
        ['De rodillas', 'más estable'],
      ],
    },
  },
];

export const recsFor = (day: DayId) => RECS.filter((r) => r.day === day);
