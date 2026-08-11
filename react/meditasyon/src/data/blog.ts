export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  content: string[]
  pullQuote: string
  author: string
  authorRole: string
  authorAvatar: string
  date: string
  readTime: string
  image: string
  category: string
  featured?: boolean
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'five-minute-morning-meditation',
    title: 'A Five-Minute Morning Meditation to Set Your Day',
    excerpt:
      'Start each morning with intention. This simple practice takes only five minutes and helps you meet the day with clarity and calm.',
    content: [
      'The first moments after waking shape the tone of your entire day. Before checking messages or rushing into tasks, pause. A short morning meditation creates space between sleep and the demands ahead.',
      'Sit comfortably, either on a cushion or at the edge of your bed. Close your eyes and notice three natural breaths. Feel the cool air at the tip of your nose on the inhale, and the gentle warmth on the exhale.',
      'Bring your attention to an intention for the day — not a to-do list, but a quality you want to carry: patience, presence, or kindness. Hold that word softly in your mind for one minute.',
      'When thoughts arise, acknowledge them without judgment and return to your breath. This is the practice — not emptying the mind, but gently returning, again and again.',
      'End by placing a hand on your heart and offering yourself a quiet wish for the day. Open your eyes slowly. You have already begun with intention.',
    ],
    pullQuote:
      'This is the practice — not emptying the mind, but gently returning, again and again.',
    author: 'Maya Chen',
    authorRole: 'Meditation Teacher',
    authorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    date: 'March 12, 2026',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=700&fit=crop',
    category: 'Meditation',
    featured: true,
  },
  {
    slug: 'sleep-hygiene-for-restless-minds',
    title: 'Sleep Hygiene for Restless Minds',
    excerpt:
      'When your thoughts keep you awake, small evening rituals can make a profound difference. Learn gentle habits that invite deeper rest.',
    content: [
      'A restless mind at bedtime is one of the most common barriers to restorative sleep. The good news: your evening environment and habits can quietly retrain your nervous system toward rest.',
      'Dim the lights an hour before bed. Bright screens signal alertness to your brain; soft, warm light tells it that night has arrived. Pair this with a short sleep story or soundscape — something familiar and low-stakes.',
      'Keep a notepad by your bed for a “mind dump.” Write down lingering worries or tomorrow’s tasks so they don’t need to loop in your head. You are not solving them at midnight — you are setting them aside.',
      'Breathing techniques like 4-7-8 (inhale for 4, hold for 7, exhale for 8) activate the parasympathetic system. Practice them lying down, eyes closed, without forcing sleep to arrive.',
      'Consistency matters more than perfection. A calm evening ritual, repeated most nights, becomes a cue your body learns to trust.',
    ],
    pullQuote:
      'Soft, warm light tells your brain that night has arrived.',
    author: 'Jonas Berg',
    authorRole: 'Sleep Specialist',
    authorAvatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    date: 'March 5, 2026',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=700&fit=crop',
    category: 'Sleep',
  },
  {
    slug: 'managing-stress-with-breath',
    title: 'Managing Everyday Stress with Your Breath',
    excerpt:
      'Your breath is always with you. Discover how simple breathing patterns can interrupt stress spirals in under two minutes.',
    content: [
      'Stress often feels like something that happens to us — a flood of sensations we cannot control. Yet one of the most reliable ways to influence your nervous system is already happening: your breath.',
      'Box breathing is a practical tool used by athletes and first responders alike. Inhale for four counts, hold for four, exhale for four, hold for four. Repeat for two to four rounds when you notice tension rising.',
      'The key is not to force calm, but to give the body a predictable rhythm. Predictability signals safety. Safety allows the stress response to soften.',
      'Practice when you are already relatively calm, so the pattern is familiar when you need it most — before a meeting, in traffic, or after a difficult conversation.',
      'Over time, you may notice you reach for your breath before reaching for distraction. That shift alone is a meaningful form of mindfulness.',
    ],
    pullQuote:
      'Predictability signals safety. Safety allows the stress response to soften.',
    author: 'Elena Vasquez',
    authorRole: 'Mindfulness Expert',
    authorAvatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    date: 'February 22, 2026',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=700&fit=crop',
    category: 'Stress',
  },
  {
    slug: 'building-a-mindful-habit',
    title: 'Building a Mindful Habit That Actually Sticks',
    excerpt:
      'Consistency beats intensity. Here is how to grow a sustainable meditation practice without guilt or overwhelm.',
    content: [
      'Many people begin meditation with ambitious goals — thirty minutes every morning — and abandon the practice within weeks. Habit research suggests a gentler path works better.',
      'Anchor your practice to something you already do. After pouring coffee, sit for three minutes. After brushing your teeth at night, lie down for a short body scan. Existing routines become reliable reminders.',
      'Track streaks not as pressure, but as evidence of care. Missing a day is not failure; returning the next day is the practice. Self-compassion sustains habits longer than self-criticism.',
      'Start shorter than you think you need. Two minutes of genuine presence outweighs twenty minutes of restless obligation. Length can grow naturally once the habit feels like home.',
      'Celebrate the act of showing up. The goal is not a perfect mind — it is a willing one.',
    ],
    pullQuote:
      'Two minutes of genuine presence outweighs twenty minutes of restless obligation.',
    author: 'Maya Chen',
    authorRole: 'Meditation Teacher',
    authorAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    date: 'February 14, 2026',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&h=700&fit=crop',
    category: 'Mindful Living',
  },
  {
    slug: 'guided-vs-unguided-meditation',
    title: 'Guided vs. Unguided Meditation: Finding Your Fit',
    excerpt:
      'Both paths lead toward presence. Understanding the difference helps you choose what your mind needs on any given day.',
    content: [
      'Guided meditation offers a voice to follow — instructions, imagery, and pacing that keep wandering minds gently oriented. It is especially helpful for beginners and for days when focus feels fragile.',
      'Unguided practice asks you to rest with the breath, body, or open awareness on your own. It builds independence and can feel spacious once you are comfortable sitting with silence.',
      'Neither is superior. Think of them as different tools in the same kit. Use guidance when you need structure; sit unguided when you crave simplicity.',
      'Many practitioners alternate. A guided sleep story at night, a quiet morning sit at dawn. Let your energy and intention choose.',
      'The Still library includes both — so you can explore freely and notice what brings you home to yourself.',
    ],
    pullQuote:
      'Neither is superior. Think of them as different tools in the same kit.',
    author: 'David Okonkwo',
    authorRole: 'App Lead & Practitioner',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    date: 'February 1, 2026',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200&h=700&fit=crop',
    category: 'Meditation',
  },
  {
    slug: 'mindfulness-at-work',
    title: 'Bringing Mindfulness Into a Busy Workday',
    excerpt:
      'You do not need a silent retreat. Micro-moments of awareness can transform how you move through meetings, email, and deadlines.',
    content: [
      'Workdays rarely offer a quiet hour for meditation — and they do not need to. Mindfulness at work is about brief, intentional pauses woven into what you already do.',
      'Before opening your inbox, take three conscious breaths. Before a meeting, feel your feet on the floor for ten seconds. These micro-practices interrupt autopilot without demanding a schedule change.',
      'Notice transitions. Walking between rooms, waiting for a call to connect — these are natural cues to return to your body. Presence accumulates in small deposits.',
      'If stress peaks mid-afternoon, step away for a two-minute breathing exercise. Even a closed-door box-breathing session can reset your nervous system before the next wave of tasks.',
      'Mindful work is not about doing less. It is about meeting what you do with a clearer, kinder attention.',
    ],
    pullQuote:
      'Presence accumulates in small deposits.',
    author: 'Elena Vasquez',
    authorRole: 'Mindfulness Expert',
    authorAvatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    date: 'January 20, 2026',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=1200&h=700&fit=crop',
    category: 'Mindful Living',
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getFeaturedPost(): BlogPost {
  return blogPosts.find((post) => post.featured) ?? blogPosts[0]
}
