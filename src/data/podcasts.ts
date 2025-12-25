export interface PodcastEpisode {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration: string;
  publishedAt: string;
  audioUrl: string;
  episodeNumber: number;
  season: number;
  guest?: {
    name: string;
    title: string;
  };
  topics: string[];
}

export const podcastEpisodes: PodcastEpisode[] = [
  {
    id: "1",
    slug: "healing-through-connection",
    title: "Healing Through Connection: The Power of Community",
    description: "In this episode, we explore how social connections impact our mental health and practical ways to build meaningful relationships in an increasingly isolated world.",
    duration: "42:15",
    publishedAt: "2024-01-18",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    episodeNumber: 24,
    season: 2,
    guest: {
      name: "Dr. James Chen",
      title: "Social Psychology Researcher"
    },
    topics: ["connection", "relationships", "community", "loneliness"]
  },
  {
    id: "2",
    slug: "understanding-burnout",
    title: "Understanding and Recovering from Burnout",
    description: "Burnout has reached epidemic levels. Learn to recognize the signs, understand the root causes, and discover evidence-based recovery strategies.",
    duration: "38:42",
    publishedAt: "2024-01-11",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    episodeNumber: 23,
    season: 2,
    topics: ["burnout", "work-life balance", "stress", "recovery"]
  },
  {
    id: "3",
    slug: "parenting-mental-health",
    title: "Parenting and Mental Health: Finding Balance",
    description: "A candid conversation about the mental health challenges of parenting and how to prioritize your wellbeing while caring for others.",
    duration: "45:30",
    publishedAt: "2024-01-04",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    episodeNumber: 22,
    season: 2,
    guest: {
      name: "Dr. Emily Rodriguez",
      title: "Family Therapist"
    },
    topics: ["parenting", "self-care", "family", "balance"]
  },
  {
    id: "4",
    slug: "trauma-informed-living",
    title: "Trauma-Informed Living: Daily Practices for Healing",
    description: "Understanding how trauma affects our daily lives and practical strategies for creating safety, building resilience, and fostering growth.",
    duration: "51:18",
    publishedAt: "2023-12-28",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    episodeNumber: 21,
    season: 2,
    guest: {
      name: "Dr. Marcus Thompson",
      title: "Trauma Specialist"
    },
    topics: ["trauma", "healing", "resilience", "safety"]
  },
  {
    id: "5",
    slug: "sleep-mental-health",
    title: "The Sleep-Mental Health Connection",
    description: "Explore the bidirectional relationship between sleep and mental health, and learn practical strategies for improving your sleep hygiene.",
    duration: "35:45",
    publishedAt: "2023-12-21",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    episodeNumber: 20,
    season: 2,
    topics: ["sleep", "insomnia", "mental health", "wellness"]
  },
  {
    id: "6",
    slug: "setting-boundaries",
    title: "The Art of Setting Healthy Boundaries",
    description: "Why boundaries are essential for mental health and step-by-step guidance for establishing and maintaining them in all your relationships.",
    duration: "40:22",
    publishedAt: "2023-12-14",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    episodeNumber: 19,
    season: 2,
    topics: ["boundaries", "relationships", "self-respect", "communication"]
  }
];
