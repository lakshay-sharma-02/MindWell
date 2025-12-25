# Unheard Pages (MindWell)

**A digital sanctuary for mental wellness, anonymous storytelling, and community support.**

"Unheard Pages" is a comprehensive mental health platform designed to provide a safe space for individuals to share their stories, access professional resources, and track their emotional well-being.

![Project Banner](https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2070&auto=format&fit=crop)

## 🌟 Key Features

###For Users
*   **Anonymous Storytelling:** Share personal experiences without judgment. Stories are vetted by admins before publication to ensure a safe environment.
*   **Resource Library:** A curated collection of mental health articles, guided meditations, and downloadable guides.
*   **Expert Podcasts:** Listen to interviews and insights from mental health professionals.
*   **Interactive Tools:**
    *   **Mood Tracker:** Log daily moods and view emotional trends.
    *   **Breathing Exercises:** Guided visual tools for anxiety relief (4-7-8 technique).
    *   **Daily Affirmations:** Positive reinforcement to start the day.
*   **Secure Authentication:** User profiles with bookmarking and history capabilities.

### For Admins
*   **Comprehensive Dashboard:** Real-time overview of platform statistics (Users, Blogs, Resources).
*   **Content Management:** Tools to approve/reject stories and manage blog posts.
*   **User Management:** detailed user list with search, ban/unban, and delete capabilities.
*   **Analytics:** Visual insights into platform growth and engagement.

## 🛠️ Technology Stack

*   **Frontend:** [React](https://react.dev/) (Vite), [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Backend & Auth:** [Supabase](https://supabase.com/)
*   **State Management:** [TanStack Query](https://tanstack.com/query/latest)
*   **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   Node.js (v18 or higher)
*   npm or bun
*   A [Supabase](https://supabase.com/) project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/lakshay-sharma-02/MindWell.git
    cd MindWell
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    bun install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup:**
    Navigate to the `database/migrations` folder and run the SQL scripts in your Supabase SQL Editor in the following order:
    1.  `migration_auth.sql` (Profiles & Triggers)
    2.  `migration_dashboard.sql` (Dashboard tables)
    3.  `migration_interactions.sql` (Likes & Shares)
    4.  `migration_tools.sql` (Mood Tracker)
    5.  `migration_admin.sql` (Admin Dashboard & RPCs)

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── admin/      # Admin-specific components (Overview, UsersManager)
│   ├── layout/     # Header, Footer, Sidebar
│   ├── tools/      # Interactive tools (Breathing, MoodTracker)
│   └── ui/         # Shadcn UI primitives
├── hooks/          # Custom React hooks (useAuth, useToast)
├── lib/            # Utilities (Supabase client, email service)
├── pages/          # Main route pages (Home, Auth, Profile, Admin)
└── types/          # TypeScript definitions
database/           # SQL migration files
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
