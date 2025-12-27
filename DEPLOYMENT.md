
# 🚀 Deployment Guide for MindWell

This guide explains how to deploy the **MindWell** (The Human Architecture) project to a new environment, whether it's for a friend, a new developer, or yourself on a different machine.

## 📋 Prerequisites

Before you begin, ensure you have the following:

1.  **Node.js**: Installed on your computer (Version 18+ recommended).
2.  **Git**: For version control.
3.  **Supabase Account**: For the database and authentication.
4.  **Vercel Account** (Optional): For easy web hosting.
5.  **Resend API Key**: For sending emails (Newsletter, Contact form).

---

## 🛠️ Step 1: Database Setup (Supabase)

The core validation and data storage rely on Supabase. You need to create a new project and set up the schema.

1.  **Create Project**: Go to [Supabase](https://supabase.com) and create a new project.
2.  **Get Credentials**:
    *   Go to **Project Settings** -> **API**.
    *   Copy the `Project URL` and `anon public` key. You will need these for the Environment Variables.
3.  **Run SQL Schema**:
    *   In your Supabase dashboard, go to the **SQL Editor** (looks like a terminal icon).
    *   Click **New Query**.
    *   Open the file `supabase/schema.sql` from this project repository.
    *   Copy the **entire content** of `schema.sql` and paste it into the Supabase SQL Editor.
    *   Click **Run**.
    *   *Result*: This will create all the necessary tables (`profiles`, `mood_logs`, `gratitude_logs`, etc.) and set up security policies.
4.  **Configure Auth**:
    *   Go to **Authentication** -> **Providers**.
    *   Ensure "Email" is enabled.
    *   (Optional) Enable Google/Github if you plan to implement them.

---

## 💻 Step 2: Local Setup (Your Computer)

To run the project on your own machine:

1.  **Clone the Repository**:
    ```bash
    git clone <your-repo-url>
    cd <repo-name>
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    *   Create a file named `.env` in the root directory.
    *   Add the following keys (replace with your values):

    ```env
    VITE_SUPABASE_URL=https://your-project-id.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key-here
    VITE_RESEND_API_KEY=your-resend-api-key
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    *   Open the link shown (usually `http://localhost:8080`) to see the site.

---

## ☁️ Step 3: Deploying to Vercel (Public Website)

To put the website on the internet:

1.  **Push to GitHub**: Make sure your latest code is on GitHub.
2.  **Import to Vercel**:
    *   Go to [Vercel](https://vercel.com).
    *   Click "Add New..." -> "Project".
    *   Select your GitHub repository.
3.  **Configure Environment Variables**:
    *   In the "Environment Variables" section of the import screen, add the same keys you used locally:
        *   `VITE_SUPABASE_URL`
        *   `VITE_SUPABASE_ANON_KEY`
        *   `VITE_RESEND_API_KEY`
4.  **Deploy**:
    *   Click **Deploy**.
    *   Wait a moment, and Vercel will give you a live URL (e.g., `mindwell.vercel.app`).

---

## 🔒 Admin Setup (Optional)

If you need Admin access (to manage blogs, resources):

1.  Sign up as a normal user on your new site.
2.  Go to your Supabase Table Editor.
3.  Open `user_roles` table.
4.  Find your user ID and change the role from `user` to `admin`.
5.  Refresh your site, and you will have access to the `/admin` dashboard.

---

**That's it! Your project is now fully redeployed.**
