export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  verified: boolean;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Emily Richardson",
    role: "Marketing Executive",
    content: "Working with Dr. Mitchell has been transformative. After struggling with anxiety for years, I finally feel like myself again. The techniques I've learned have changed how I approach challenges in both my personal and professional life.",
    rating: 5,
    avatar: "ER",
    verified: true,
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Software Engineer",
    content: "The podcast episodes on managing workplace stress were a game-changer for me. The evidence-based approach and warm delivery made me feel understood. I've recommended Psyche Space to all my colleagues.",
    rating: 5,
    avatar: "MC",
    verified: true,
  },
  {
    id: "3",
    name: "Sarah Williams",
    role: "Teacher",
    content: "I was skeptical about online therapy, but Dr. Mitchell made me feel comfortable from the first session. The flexibility of virtual appointments fits perfectly with my busy schedule, and the results speak for themselves.",
    rating: 5,
    avatar: "SW",
    verified: true,
  },
  {
    id: "4",
    name: "David Thompson",
    role: "Business Owner",
    content: "The resources and workbooks have been invaluable. I use the anxiety management techniques daily, and the progress I've made in just three months is remarkable. This is the best investment I've made in myself.",
    rating: 5,
    avatar: "DT",
    verified: true,
  },
  {
    id: "5",
    name: "Jessica Park",
    role: "Healthcare Worker",
    content: "As a nurse, I was burning out fast. Dr. Mitchell helped me develop coping strategies and set healthy boundaries. I'm now thriving at work and actually enjoying my time off. Grateful doesn't begin to cover it.",
    rating: 5,
    avatar: "JP",
    verified: true,
  },
  {
    id: "6",
    name: "Robert Anderson",
    role: "Retired Veteran",
    content: "After 30 years of service, transitioning to civilian life was harder than I expected. The compassionate care I received helped me process my experiences and find purpose in this new chapter. Highly recommend.",
    rating: 5,
    avatar: "RA",
    verified: true,
  },
];
