export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    value: number;
  }[];
}

export interface QuizResult {
  level: "low" | "moderate" | "high";
  title: string;
  description: string;
  recommendations: string[];
  cta: {
    text: string;
    link: string;
  };
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Over the past two weeks, how often have you felt down, depressed, or hopeless?",
    options: [
      { text: "Not at all", value: 0 },
      { text: "Several days", value: 1 },
      { text: "More than half the days", value: 2 },
      { text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: 2,
    question: "How often have you had little interest or pleasure in doing things?",
    options: [
      { text: "Not at all", value: 0 },
      { text: "Several days", value: 1 },
      { text: "More than half the days", value: 2 },
      { text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: 3,
    question: "How often have you felt nervous, anxious, or on edge?",
    options: [
      { text: "Not at all", value: 0 },
      { text: "Several days", value: 1 },
      { text: "More than half the days", value: 2 },
      { text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: 4,
    question: "How often have you had trouble relaxing?",
    options: [
      { text: "Not at all", value: 0 },
      { text: "Several days", value: 1 },
      { text: "More than half the days", value: 2 },
      { text: "Nearly every day", value: 3 },
    ],
  },
  {
    id: 5,
    question: "How would you rate your sleep quality recently?",
    options: [
      { text: "Excellent - I sleep well", value: 0 },
      { text: "Good - Occasional issues", value: 1 },
      { text: "Fair - Regular difficulties", value: 2 },
      { text: "Poor - Constant problems", value: 3 },
    ],
  },
  {
    id: 6,
    question: "How often do you feel overwhelmed by your responsibilities?",
    options: [
      { text: "Rarely or never", value: 0 },
      { text: "Sometimes", value: 1 },
      { text: "Often", value: 2 },
      { text: "Almost always", value: 3 },
    ],
  },
  {
    id: 7,
    question: "How connected do you feel to the people around you?",
    options: [
      { text: "Very connected", value: 0 },
      { text: "Somewhat connected", value: 1 },
      { text: "Not very connected", value: 2 },
      { text: "Isolated and alone", value: 3 },
    ],
  },
  {
    id: 8,
    question: "How often do you engage in self-care activities?",
    options: [
      { text: "Daily", value: 0 },
      { text: "A few times a week", value: 1 },
      { text: "Rarely", value: 2 },
      { text: "Never", value: 3 },
    ],
  },
  {
    id: 9,
    question: "How would you describe your energy levels?",
    options: [
      { text: "High - I feel energized", value: 0 },
      { text: "Moderate - Some tiredness", value: 1 },
      { text: "Low - Often fatigued", value: 2 },
      { text: "Very low - Constantly exhausted", value: 3 },
    ],
  },
  {
    id: 10,
    question: "Overall, how satisfied are you with your life right now?",
    options: [
      { text: "Very satisfied", value: 0 },
      { text: "Somewhat satisfied", value: 1 },
      { text: "Somewhat dissatisfied", value: 2 },
      { text: "Very dissatisfied", value: 3 },
    ],
  },
];

export const getQuizResult = (score: number): QuizResult => {
  const maxScore = quizQuestions.length * 3;
  const percentage = (score / maxScore) * 100;

  if (percentage <= 30) {
    return {
      level: "low",
      title: "You're Doing Well! 🌟",
      description:
        "Based on your responses, you appear to be managing your mental health well. You show signs of good emotional resilience and healthy coping mechanisms.",
      recommendations: [
        "Continue your current self-care practices",
        "Explore our mindfulness resources to maintain balance",
        "Consider preventive strategies to build resilience",
        "Stay connected with your support network",
      ],
      cta: {
        text: "Explore Wellness Resources",
        link: "/resources",
      },
    };
  } else if (percentage <= 60) {
    return {
      level: "moderate",
      title: "Some Support Could Help 💛",
      description:
        "Your responses suggest you may be experiencing some challenges. This is completely normal, and there are many effective strategies that can help.",
      recommendations: [
        "Try our guided meditation podcasts",
        "Download our free self-care checklist",
        "Consider speaking with a professional",
        "Practice daily stress-relief techniques",
      ],
      cta: {
        text: "Book a Consultation",
        link: "/book",
      },
    };
  } else {
    return {
      level: "high",
      title: "We're Here for You 💚",
      description:
        "Based on your responses, you may be going through a difficult time. Please know that support is available, and reaching out is a brave first step.",
      recommendations: [
        "Schedule a consultation with a therapist",
        "Reach out to a trusted friend or family member",
        "Consider joining a support group",
        "If in crisis, contact a helpline immediately",
      ],
      cta: {
        text: "Schedule a Session",
        link: "/book",
      },
    };
  }
};
