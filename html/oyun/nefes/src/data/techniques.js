export const TECHNIQUES = [
  {
    id: '478',
    name: '4-7-8 Tekniği',
    description: 'Rahatlama ve uykuya dalmak için klasik nefes ritmi.',
    benefit: 'Rahatlama / Uyku',
    estimatedMinutes: 5,
    icon: 'moon',
    accent: 'from-indigo-400/30 to-violet-500/20',
    phases: [
      { key: 'inhale', label: 'Nefes Al', duration: 4, scale: 1.35 },
      { key: 'hold', label: 'Tut', duration: 7, scale: 1.35 },
      { key: 'exhale', label: 'Nefes Ver', duration: 8, scale: 0.75 },
    ],
  },
  {
    id: 'box',
    name: 'Kutu Nefesi',
    description: 'Eşit aralıklı nefeslerle zihni sakinleştirip odaklan.',
    benefit: 'Odaklanma',
    estimatedMinutes: 4,
    icon: 'box',
    accent: 'from-sky-400/25 to-indigo-500/20',
    phases: [
      { key: 'inhale', label: 'Nefes Al', duration: 4, scale: 1.35 },
      { key: 'hold', label: 'Tut', duration: 4, scale: 1.35 },
      { key: 'exhale', label: 'Nefes Ver', duration: 4, scale: 0.75 },
      { key: 'holdEmpty', label: 'Tut', duration: 4, scale: 0.75 },
    ],
  },
  {
    id: 'deep',
    name: 'Derin Nefes',
    description: 'Basit nefes al–ver döngüsüyle genel rahatlama.',
    benefit: 'Genel rahatlama',
    estimatedMinutes: 3,
    icon: 'wind',
    accent: 'from-teal-400/25 to-violet-500/20',
    phases: [
      { key: 'inhale', label: 'Nefes Al', duration: 4, scale: 1.4 },
      { key: 'exhale', label: 'Nefes Ver', duration: 4, scale: 0.7 },
    ],
  },
]

export const DURATION_OPTIONS = [3, 5, 10]

export function getCycleSeconds(technique) {
  return technique.phases.reduce((sum, phase) => sum + phase.duration, 0)
}

export function getTotalRounds(technique, minutes) {
  const cycle = getCycleSeconds(technique)
  return Math.max(1, Math.floor((minutes * 60) / cycle))
}
