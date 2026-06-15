# Phase 1 Engagement Features - Testing Checklist

## Pre-Deployment Checklist

### Database Migration
- [ ] Run `supabase/migrations/20260615_phase1_engagement.sql` in Supabase SQL Editor
- [ ] Verify tables created: `daily_checkins`, `daily_rewards`, `companion_memory`, `proactive_messages`
- [ ] Verify profile columns added: `companion_name`, `companion_avatar`, `last_active_at`, etc.
- [ ] Test RLS policies working (try accessing tables as logged-in user)
- [ ] Verify functions exist: `has_completed_checkin_today()`, `has_claimed_reward_today()`

### Dependencies
- [x] Install canvas-confetti: `npm install canvas-confetti`
- [x] Build passes without errors

---

## Feature Testing

### 1. Daily Reward Wheel

**Test Cases:**
- [ ] **First Spin**
  - Login to dashboard
  - Wheel appears at top with "Spin the Wheel!" button
  - Click spin → Wheel animates for 2 seconds
  - Reward modal appears with prize
  - Confetti animation plays (common: small, rare: medium, legendary: big)
  - Can click "Awesome!" to close

- [ ] **Already Claimed**
  - Refresh page after spinning
  - Should show "Daily Reward Claimed!" with lock icon
  - Button should be disabled
  
- [ ] **Next Day**
  - Wait until next day OR manually change date in DB
  - Wheel should be available again

- [ ] **Reward Distribution**
  - Spin 10 times (across multiple accounts/days)
  - Should see ~6 common, ~3 rare, ~1 legendary

**Expected Behavior:**
- ✅ Smooth animation
- ✅ Confetti matches rarity
- ✅ Reward saved to database
- ✅ One spin per day per user

---

### 2. Daily Check-In Flow

**Morning Check-In Test:**
- [ ] Click "Morning Check-In" card on dashboard
- [ ] **Step 1:** Sleep quality → Select option → Click Next
- [ ] **Step 2:** Type intention → Click Next
- [ ] **Step 3:** Select mood → Click Complete
- [ ] AI generates insight (2 seconds loading)
- [ ] Success screen shows with checkmark
- [ ] Modal auto-closes after 3 seconds
- [ ] Dashboard shows morning check-in as completed (green ✓)
- [ ] Streak increases by 1

**Evening Check-In Test:**
- [ ] Click "Evening Reflection" card
- [ ] **Step 1:** Drag slider (1-10) → Click Next
- [ ] **Step 2:** Type what went well → Click Next
- [ ] **Step 3:** Type tomorrow's focus → Click Complete
- [ ] AI insight appears
- [ ] Success screen
- [ ] Dashboard shows evening completed

**Edge Cases:**
- [ ] Click "Back" button → Goes to previous step
- [ ] Try to click "Next" with empty field → Button disabled
- [ ] Close modal mid-flow → Can restart later
- [ ] Complete both check-ins → Dashboard shows celebration "All Done for Today! 🎉"

**Expected Behavior:**
- ✅ 3-step wizard smooth
- ✅ AI insight relevant
- ✅ Data saved to `daily_checkins` table
- ✅ Streak protection works
- ✅ Can't complete same check-in twice in one day

---

### 3. AI Companion Upgrade

**Initial Setup:**
- [ ] Click floating bot button (bottom right)
- [ ] Chat window opens
- [ ] Default greeting: "Hello! I'm Luna..."
- [ ] Green dot shows "Always here for you"

**Customization:**
- [ ] Click settings icon
- [ ] Change companion name → Click Save
- [ ] Select different avatar (try Sunny ☀️)
- [ ] Close settings
- [ ] Name and avatar updated in header
- [ ] Close and reopen chat → Settings persist

**Memory Test:**
- [ ] Type: "I'm stressed about work deadlines"
- [ ] AI responds empathetically
- [ ] Close chat
- [ ] Wait 5 seconds
- [ ] Reopen chat
- [ ] AI should reference work stress in greeting OR conversation history visible

**Proactive Messaging:**
- [ ] Manually insert proactive message in DB:
```sql
INSERT INTO proactive_messages (user_id, message, message_type, priority, delivered)
VALUES ('YOUR_USER_ID', 'Hey! Just checking in. How are you? 😊', 'check_in', 5, false);
```
- [ ] Refresh page
- [ ] Floating button should have red "!" indicator
- [ ] Open chat → Proactive message appears first
- [ ] Message marked as delivered in DB

**Chat Persistence:**
- [ ] Have 5-message conversation
- [ ] Close chat
- [ ] Refresh page
- [ ] Reopen chat
- [ ] Last 20 messages should be visible

**Expected Behavior:**
- ✅ Customization saved to profile
- ✅ Chat history persists
- ✅ Memory stored in `companion_memory`
- ✅ Proactive messages delivered
- ✅ Emoji avatars display correctly

---

### 4. Dashboard Integration

**Check Overall Flow:**
- [ ] Login to dashboard
- [ ] Components appear in order:
  1. Welcome Widget
  2. **Daily Reward Wheel** (NEW)
  3. **Daily Check-In Widget** (NEW)
  4. Daily Affirmation
  5. Streak & Score
  6. Mood Summary
  7. AI Features
  8. Weekly Report

- [ ] All animations smooth (stagger effect)
- [ ] No layout shifts
- [ ] Mobile responsive (test on narrow window)

**Expected Behavior:**
- ✅ New components integrated seamlessly
- ✅ No performance issues
- ✅ Animations feel polished

---

## Database Verification

### Check Data Saved Correctly

**After testing, verify in Supabase:**

```sql
-- Check check-ins saved
SELECT * FROM daily_checkins WHERE user_id = 'YOUR_USER_ID' ORDER BY created_at DESC LIMIT 5;

-- Check rewards saved
SELECT * FROM daily_rewards WHERE user_id = 'YOUR_USER_ID' ORDER BY claimed_at DESC LIMIT 5;

-- Check companion memory
SELECT * FROM companion_memory WHERE user_id = 'YOUR_USER_ID' ORDER BY updated_at DESC;

-- Check proactive messages
SELECT * FROM proactive_messages WHERE user_id = 'YOUR_USER_ID' ORDER BY created_at DESC;

-- Check profile updates
SELECT companion_name, companion_avatar, last_active_at FROM profiles WHERE id = 'YOUR_USER_ID';
```

---

## Performance Testing

- [ ] **Page Load Time:** Dashboard loads in < 2 seconds
- [ ] **Animation FPS:** Confetti and transitions smooth (60fps)
- [ ] **AI Response Time:** Check-in insights return in < 3 seconds
- [ ] **Chat Response Time:** AI companion responds in < 4 seconds
- [ ] **Mobile Performance:** No lag on mobile devices

---

## Browser Testing

- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (iOS)
- [ ] Edge (desktop)

---

## Accessibility Testing

- [ ] Tab navigation works through all components
- [ ] Screen reader announces rewards/check-ins
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible
- [ ] Keyboard shortcuts work (Enter to submit, Esc to close)

---

## Edge Cases & Error Handling

- [ ] **No Internet:** Shows appropriate error messages
- [ ] **API Timeout:** AI calls timeout gracefully
- [ ] **Invalid User Session:** Redirects to login
- [ ] **Database Error:** Shows user-friendly error
- [ ] **Concurrent Spins:** Only one reward saved (test with multiple tabs)
- [ ] **Timezone Edge Cases:** Works across midnight in different timezones

---

## Regression Testing

**Verify existing features still work:**
- [ ] Original mood tracker
- [ ] Gratitude journal
- [ ] Breathing exercises
- [ ] Streak widget (original)
- [ ] Mental health score
- [ ] AI crisis predictor
- [ ] Weekly report
- [ ] Goal setter

---

## User Acceptance Testing

**Test with real users (5-10 people):**
- [ ] Can they figure out reward wheel without instructions?
- [ ] Do they complete check-ins naturally?
- [ ] Do they customize AI companion?
- [ ] Do they return the next day?
- [ ] What's their favorite feature?
- [ ] Any confusion or frustration?

---

## Metrics to Monitor (Post-Launch)

**Week 1:**
- Daily reward spin rate
- Check-in completion rate (morning vs evening)
- AI companion customization rate
- Chat messages per session
- Streak retention
- Daily active users

**Week 2:**
- Returning users (2-day, 7-day)
- Average session time
- Sessions per week
- Feature adoption rate
- Drop-off points

---

## Known Issues / Future Improvements

**Not Critical but Nice to Have:**
- [ ] Push notifications for check-in reminders (requires PWA service worker)
- [ ] Share rewards on social media
- [ ] Reward history page
- [ ] Companion voice mode
- [ ] More avatar options
- [ ] Custom check-in times per user
- [ ] Reward trading system
- [ ] Leaderboard for streaks

---

## Rollback Plan

If issues occur post-launch:

1. **Disable Reward Wheel:**
   - Comment out `<DailyRewardWheel />` in Dashboard.tsx
   - Deploy

2. **Disable Check-Ins:**
   - Comment out `<DailyCheckInWidget />` in Dashboard.tsx
   - Deploy

3. **Revert Database:**
```sql
-- Drop new tables (if needed)
DROP TABLE IF EXISTS proactive_messages;
DROP TABLE IF EXISTS companion_memory;
DROP TABLE IF EXISTS daily_rewards;
DROP TABLE IF EXISTS daily_checkins;

-- Remove profile columns
ALTER TABLE profiles 
DROP COLUMN IF EXISTS companion_name,
DROP COLUMN IF EXISTS companion_avatar,
DROP COLUMN IF EXISTS last_active_at,
DROP COLUMN IF EXISTS morning_checkin_time,
DROP COLUMN IF EXISTS evening_checkin_time,
DROP COLUMN IF EXISTS checkin_notifications;
```

---

## Launch Checklist

**Day Before Launch:**
- [ ] All tests passed
- [ ] Database migration applied to production
- [ ] Code deployed to staging
- [ ] Stakeholder demo complete
- [ ] Documentation updated
- [ ] Monitoring/analytics setup

**Launch Day:**
- [ ] Deploy to production
- [ ] Smoke test in production (create account, test features)
- [ ] Monitor error logs
- [ ] Watch user activity metrics
- [ ] Be available for hotfixes

**Day After Launch:**
- [ ] Review metrics dashboard
- [ ] Check user feedback
- [ ] Identify any bugs
- [ ] Plan Phase 2 timing

---

## Success Criteria

**Phase 1 is successful if:**
- ✅ 80%+ users spin reward wheel on first day
- ✅ 50%+ users complete at least one check-in
- ✅ 30%+ users customize AI companion
- ✅ Daily active users increase by 50%+ in week 1
- ✅ Average session time increases by 60%+
- ✅ No critical bugs reported
- ✅ < 5% error rate on new features

---

## Ready to Launch?

If all checkboxes above are checked, **Phase 1 is ready for production!** 🚀

Next: **Phase 2 - Gamification** (XP, Levels, Badges, Challenges)
