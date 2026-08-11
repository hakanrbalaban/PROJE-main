let audioCtx = null

function getContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
  }
  return audioCtx
}

export async function resumeAudio() {
  const ctx = getContext()
  if (ctx?.state === 'suspended') {
    await ctx.resume()
  }
}

/** Soft ding between breath phases via Web Audio API */
export function playDing() {
  const ctx = getContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(660, now)
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.18)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.4)
}
