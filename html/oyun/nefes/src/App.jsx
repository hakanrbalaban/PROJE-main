import { useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import HomePage from './components/HomePage'
import DurationSelect from './components/DurationSelect'
import ExerciseScreen from './components/ExerciseScreen'
import CompletionScreen from './components/CompletionScreen'
import StatsPage from './components/StatsPage'
import {
  loadStats,
  loadSoundPreference,
  recordSession,
  saveSoundPreference,
} from './utils/storage'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [technique, setTechnique] = useState(null)
  const [durationMinutes, setDurationMinutes] = useState(5)
  const [completedMinutes, setCompletedMinutes] = useState(0)
  const [stats, setStats] = useState(() => loadStats())
  const [soundOn, setSoundOn] = useState(() => loadSoundPreference())

  const toggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev
      saveSoundPreference(next)
      return next
    })
  }

  const handleFinish = useCallback((minutes) => {
    const updated = recordSession(minutes)
    setStats(updated)
    setCompletedMinutes(minutes)
    setScreen('complete')
  }, [])

  return (
    <div className="app-bg min-h-full">
      <div className="mx-auto min-h-full max-w-lg">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <HomePage
              key="home"
              onSelectTechnique={(t) => {
                setTechnique(t)
                setScreen('duration')
              }}
              onOpenStats={() => setScreen('stats')}
              soundOn={soundOn}
              onToggleSound={toggleSound}
            />
          )}

          {screen === 'duration' && technique && (
            <DurationSelect
              key="duration"
              technique={technique}
              onBack={() => setScreen('home')}
              onStart={(minutes) => {
                setDurationMinutes(minutes)
                setScreen('exercise')
              }}
            />
          )}

          {screen === 'exercise' && technique && (
            <ExerciseScreen
              key="exercise"
              technique={technique}
              durationMinutes={durationMinutes}
              soundOn={soundOn}
              onFinish={handleFinish}
              onAbort={() => setScreen('home')}
            />
          )}

          {screen === 'complete' && (
            <CompletionScreen
              key="complete"
              minutes={completedMinutes}
              onHome={() => {
                setTechnique(null)
                setScreen('home')
              }}
            />
          )}

          {screen === 'stats' && (
            <StatsPage
              key="stats"
              stats={stats}
              onBack={() => setScreen('home')}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
