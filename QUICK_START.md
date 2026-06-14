# 🚀 MindWell Quick Start Guide

## Getting Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier)
- OpenRouter account (free tier)

---

## Step 1: Clone & Install (1 min)

```bash
cd MindWell
npm install
```

---

## Step 2: Get API Keys (2 min)

### Supabase (Required)
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → API
4. Copy "Project URL" and "anon public" key

### OpenRouter (Required for AI)
1. Go to https://openrouter.ai
2. Sign up (free)
3. Create API key
4. Copy key (starts with `sk-or-v1-`)

---

## Step 3: Configure Environment (1 min)

Create `.env` file:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_OPENROUTER_API_KEY_1=sk-or-v1-xxxxx
```

---

## Step 4: Setup Database (1 min)

1. Go to Supabase SQL Editor
2. Run these files in order (from `database/migrations/`):
   - `migration_auth.sql`
   - `migration_dashboard.sql`
   - `migration_interactions.sql`
   - `migration_tools.sql`
   - `migration_admin.sql`
   - `create_community_posts_table.sql`
   - `migration_engagement.sql`

---

## Step 5: Run Development Server (10 seconds)

```bash
npm run dev
```

Open http://localhost:5173

---

## 🎉 Done! Test These Features:

1. **Sign Up** → Create account
2. **Dashboard** → See AI affirmations, streak, mental health score
3. **Tools** → 
   - Log 3+ moods → see AI insights
   - AI Journal tab → analyze entry
   - Coping tab → generate strategies
4. **Chat Bot** → Click floating bot icon (bottom-right)
5. **Stories** → Share anonymous story

---

## 🚀 Deploy to Vercel (5 min)

```bash
npm run build  # Test build locally
```

1. Push to GitHub
2. Import on Vercel
3. Add environment variables
4. Deploy!

---

## 🆘 Troubleshooting

### "No API keys available"
- Check `.env` file exists in project root
- Restart dev server after adding keys

### Build errors
- Run `npm install` again
- Check Node version: `node -v` (need 18+)

### AI not working
- Verify OpenRouter key is valid
- Check browser console for errors
- Try different free model in `openrouter.ts`

---

## 📚 Learn More

- Full docs: `AI_INTEGRATION.md`
- Features: `FEATURES_ROADMAP.md`
- Setup details: `AI_SETUP.md`

---

**Need help?** Open an issue on GitHub or check the docs!
