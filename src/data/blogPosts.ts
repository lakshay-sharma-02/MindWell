export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    credentials: string;
  };
  publishedAt: string;
  readingTime: number;
  featuredImage: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "understanding-anxiety-modern-world",
    title: "Understanding Anxiety in the Modern World",
    excerpt: "Explore evidence-based strategies for managing anxiety in our fast-paced, digitally connected society.",
    content: `
Anxiety has become increasingly prevalent in our modern world. The constant connectivity, information overload, and societal pressures create a perfect storm for anxious thoughts and feelings.

## Recognizing the Signs

Anxiety manifests differently for everyone. Common symptoms include:

- Persistent worry or fear
- Physical symptoms like rapid heartbeat
- Difficulty concentrating
- Sleep disturbances
- Avoidance behaviors

## Evidence-Based Strategies

### 1. Mindfulness and Present-Moment Awareness

Research consistently shows that mindfulness practices can significantly reduce anxiety symptoms. Start with just 5 minutes daily of focused breathing.

### 2. Cognitive Restructuring

Learning to identify and challenge anxious thoughts is a cornerstone of cognitive-behavioral therapy (CBT). Ask yourself: "Is this thought based on facts or feelings?"

### 3. Building Stress Resilience

Regular exercise, adequate sleep, and social connection form the foundation of mental wellness. These aren't luxuries—they're necessities for managing anxiety.

## When to Seek Help

If anxiety is interfering with your daily life, relationships, or work, it may be time to consult with a mental health professional. There's no shame in seeking support—it's a sign of strength.

Remember: You don't have to navigate this alone. Healing is possible, and support is available.
    `,
    category: "Anxiety",
    tags: ["anxiety", "mental health", "coping strategies", "mindfulness"],
    author: {
      name: "Dr. Sarah Mitchell",
      avatar: "/placeholder.svg",
      credentials: "Ph.D., Licensed Clinical Psychologist"
    },
    publishedAt: "2024-01-15",
    readingTime: 6,
    featuredImage: "/placeholder.svg"
  },
  {
    id: "2",
    slug: "power-of-self-compassion",
    title: "The Transformative Power of Self-Compassion",
    excerpt: "Discover how treating yourself with kindness can fundamentally change your relationship with yourself and others.",
    content: `
Self-compassion is often misunderstood as self-indulgence or weakness. In reality, it's one of the most powerful tools we have for emotional resilience and growth.

## What Is Self-Compassion?

Dr. Kristin Neff, a pioneering researcher in this field, defines self-compassion through three core components:

1. **Self-kindness** - Treating yourself with warmth rather than harsh judgment
2. **Common humanity** - Recognizing that struggle is part of the shared human experience
3. **Mindfulness** - Holding difficult emotions with balanced awareness

## The Science Behind It

Research shows that self-compassion is associated with:

- Lower levels of anxiety and depression
- Greater emotional resilience
- Improved motivation and goal achievement
- Better relationship satisfaction

## Practical Exercises

### The Self-Compassion Break

When facing a difficult moment:
1. Acknowledge the difficulty: "This is a moment of struggle."
2. Connect to common humanity: "Many people experience this."
3. Offer yourself kindness: "May I be patient with myself."

### Write a Letter to Yourself

Imagine a wise, compassionate friend writing to you about your current struggle. What would they say? How would they encourage you?

## Moving Forward

Self-compassion is a practice, not a destination. Be patient with yourself as you develop this skill—that patience itself is an act of self-compassion.
    `,
    category: "Self-Care",
    tags: ["self-compassion", "self-care", "emotional wellness", "personal growth"],
    author: {
      name: "Dr. Sarah Mitchell",
      avatar: "/placeholder.svg",
      credentials: "Ph.D., Licensed Clinical Psychologist"
    },
    publishedAt: "2024-01-08",
    readingTime: 5,
    featuredImage: "/placeholder.svg"
  },
  {
    id: "3",
    slug: "navigating-relationship-challenges",
    title: "Navigating Relationship Challenges with Grace",
    excerpt: "Learn communication strategies and emotional tools for building stronger, healthier connections.",
    content: `
Relationships are both our greatest source of joy and, at times, our greatest challenge. Whether romantic, familial, or friendships, all relationships require intentional care.

## The Foundation: Emotional Attunement

Healthy relationships are built on emotional attunement—the ability to recognize, understand, and respond to your partner's emotional states.

### Key Principles

1. **Active Listening** - Give full attention without planning your response
2. **Validation** - Acknowledge feelings before problem-solving
3. **Curiosity** - Approach differences with openness rather than judgment

## Common Communication Pitfalls

### The Four Horsemen (Dr. John Gottman)

- **Criticism** - Attacking character rather than behavior
- **Contempt** - Expressing disgust or superiority
- **Defensiveness** - Refusing to take responsibility
- **Stonewalling** - Withdrawing from interaction

## Building Repair Skills

Conflict is inevitable; disconnection is not. What matters most is our ability to repair after ruptures.

### The Repair Conversation

1. Choose a calm moment
2. Take responsibility for your part
3. Express understanding of their perspective
4. Commit to specific changes
5. Follow through consistently

## Seeking Support

Couples therapy isn't just for crisis—it can be a powerful tool for strengthening already-good relationships and preventing future issues.

Remember: Every relationship has challenges. What defines a healthy relationship is how you navigate them together.
    `,
    category: "Relationships",
    tags: ["relationships", "communication", "couples", "connection"],
    author: {
      name: "Dr. Sarah Mitchell",
      avatar: "/placeholder.svg",
      credentials: "Ph.D., Licensed Clinical Psychologist"
    },
    publishedAt: "2024-01-01",
    readingTime: 7,
    featuredImage: "/placeholder.svg"
  },
  {
    id: "4",
    slug: "mindfulness-meditation-beginners",
    title: "Mindfulness Meditation: A Beginner's Guide",
    excerpt: "Start your mindfulness journey with practical, accessible techniques for cultivating present-moment awareness.",
    content: `
Mindfulness meditation has moved from ancient Buddhist practice to mainstream mental health tool. Here's how to begin your own practice.

## What Is Mindfulness?

Mindfulness is the practice of intentionally paying attention to the present moment with openness and curiosity, without judgment.

## Starting Your Practice

### Finding Your Space

You don't need a meditation room. Any quiet space where you can sit comfortably works perfectly.

### Basic Breath Awareness

1. Sit comfortably with spine straight but not rigid
2. Close your eyes or soften your gaze downward
3. Bring attention to your natural breath
4. When mind wanders (it will!), gently return to breath
5. Start with 5 minutes, gradually increasing

## Common Misconceptions

**"I can't stop my thoughts"** - Mindfulness isn't about stopping thoughts; it's about changing your relationship to them.

**"I'm not doing it right"** - There's no perfect meditation. Noticing you've wandered IS the practice.

**"I don't have time"** - Even 3 minutes daily creates real benefits.

## Building a Sustainable Practice

### Tips for Consistency

- Link meditation to an existing habit
- Same time, same place helps
- Use guided meditations initially
- Be patient with yourself

The benefits of mindfulness are cumulative. Trust the process and keep showing up.
    `,
    category: "Mindfulness",
    tags: ["mindfulness", "meditation", "stress reduction", "beginners"],
    author: {
      name: "Dr. Sarah Mitchell",
      avatar: "/placeholder.svg",
      credentials: "Ph.D., Licensed Clinical Psychologist"
    },
    publishedAt: "2023-12-20",
    readingTime: 5,
    featuredImage: "/placeholder.svg"
  },
  {
    id: "5",
    slug: "depression-more-than-sadness",
    title: "Depression: Understanding It's More Than Sadness",
    excerpt: "Explore the complex nature of depression and discover paths toward healing and recovery.",
    content: `
Depression is often reduced to "feeling sad," but it's a complex condition that affects every aspect of life. Understanding it is the first step toward healing.

## Beyond Sadness

Depression isn't just emotional—it's physical, cognitive, and behavioral.

### Physical Symptoms
- Fatigue and low energy
- Sleep disturbances
- Changes in appetite
- Physical aches and pains

### Cognitive Symptoms
- Difficulty concentrating
- Negative thought patterns
- Memory issues
- Indecisiveness

### Behavioral Symptoms
- Social withdrawal
- Decreased productivity
- Loss of interest in activities
- Neglecting responsibilities

## The Biology of Depression

Depression involves complex interactions between:
- Neurotransmitter systems
- Brain structure and function
- Hormonal balance
- Genetic predisposition
- Environmental factors

## Paths to Recovery

### Professional Treatment

- **Psychotherapy** - CBT, interpersonal therapy, and other approaches
- **Medication** - Antidepressants can help restore brain chemistry
- **Combined approach** - Often most effective

### Self-Care Strategies

1. Maintain routines even when difficult
2. Gentle movement and exercise
3. Social connection, even minimal
4. Limit alcohol and substances
5. Practice self-compassion

## Hope for Recovery

Depression is treatable. With the right support and treatment, most people recover. If you're struggling, please reach out—you deserve help, and help is available.
    `,
    category: "Depression",
    tags: ["depression", "mental health", "treatment", "recovery"],
    author: {
      name: "Dr. Sarah Mitchell",
      avatar: "/placeholder.svg",
      credentials: "Ph.D., Licensed Clinical Psychologist"
    },
    publishedAt: "2023-12-15",
    readingTime: 8,
    featuredImage: "/placeholder.svg"
  }
];

export const categories = ["All", "Anxiety", "Self-Care", "Relationships", "Mindfulness", "Depression"];

export const allTags = [...new Set(blogPosts.flatMap(post => post.tags))];
