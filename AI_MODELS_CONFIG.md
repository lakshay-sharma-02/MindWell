# Free AI Models Configuration

## Models Used in MindWell

### OpenRouter (Primary for Phase 1 Features)
**File:** `src/lib/openrouter.ts`

```typescript
const FREE_MODELS = [
  'openai/gpt-oss-120b:free',      // Primary - Fast, reliable
  'google/gemma-4-31b-it:free',    // Fallback - Good quality
];
```

**Used in:**
- Daily Check-In AI Insights
- AI Companion Chat
- Proactive Messaging
- All Phase 1 engagement features

**Fallback Strategy:**
1. Try `openai/gpt-oss-120b:free` with all API keys
2. If all fail, try `google/gemma-4-31b-it:free` with all keys
3. Rotate through multiple API keys for rate limit handling

---

### Gemini API (Legacy Features)
**File:** `src/lib/gemini.ts`

```typescript
// Primary: Gemini 2.0 Flash Experimental (Free)
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

// Fallback: OpenRouter free model
model: 'openai/gpt-oss-120b:free'
```

**Used in:**
- Legacy chatbot (if still in use)
- Blog refinement tools
- Admin content generation

---

## Why These Models?

### openai/gpt-oss-120b:free
- ✅ **Free tier available**
- ✅ Fast response times (1-3 seconds)
- ✅ Good quality for conversational AI
- ✅ 120B parameters = solid performance
- ✅ No rate limits on OpenRouter free tier

### google/gemma-4-31b-it:free
- ✅ **Free tier available**
- ✅ Instruction-tuned for better following prompts
- ✅ Good fallback when primary is down
- ✅ 31B parameters = lighter, faster

### gemini-2.0-flash-exp
- ✅ Google's free experimental model
- ✅ Very fast (flash = optimized for speed)
- ✅ Good for simple text generation
- ⚠️ Experimental = may change

---

## API Key Management

### OpenRouter Keys
**Location:** Environment variable `VITE_OPENROUTER_API_KEYS`

**Format:** Comma-separated list
```env
VITE_OPENROUTER_API_KEYS=sk-or-v1-xxx,sk-or-v1-yyy,sk-or-v1-zzz
```

**How it works:**
1. All keys stored in array
2. Rotates through keys on each request
3. If one key hits rate limit, uses next key
4. Tries all keys before falling back to next model

### Gemini Keys
**Location:** Supabase `site_settings` table

**Fields:**
- `gemini_api_key` - Primary key
- `gemini_fallback_key` - Backup OpenRouter key

---

## Rate Limits & Costs

### OpenRouter Free Tier
- **Cost:** $0.00
- **Rate Limit:** Varies by model, typically 100 req/min per key
- **Strategy:** Use multiple keys to increase throughput
- **Fallback:** Automatic model switching

### Gemini Free Tier
- **Cost:** $0.00
- **Rate Limit:** 60 requests/minute, 1,500/day
- **Strategy:** Use OpenRouter as fallback
- **Quota:** Generous for small-medium sites

---

## Model Selection Strategy

### When to Use OpenRouter (New Features)
✅ Real-time chat (AI Companion)
✅ Short, conversational responses
✅ User-facing interactive features
✅ Need fallback redundancy

### When to Use Gemini (Legacy)
✅ Admin tools (blog refinement)
✅ Batch processing
✅ Less critical features
✅ Longer content generation

---

## Adding More Models

### To add a new free model to OpenRouter:

1. Find model on https://openrouter.ai/models
2. Filter by "Free" pricing
3. Add to `FREE_MODELS` array:

```typescript
const FREE_MODELS = [
  'openai/gpt-oss-120b:free',
  'google/gemma-4-31b-it:free',
  'meta/llama-3.1-8b-instruct:free',  // New model
];
```

4. Test with:
```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta/llama-3.1-8b-instruct:free",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## Monitoring & Debugging

### Check which model is being used:

```typescript
// In openrouter.ts, line 110
console.warn(`Failed with model ${currentModel}, key ${keyAttempt + 1}:`, error);
```

### Check API key rotation:

```typescript
// In openrouter.ts, line 42
console.log('Using API key:', this.currentKeyIndex);
```

### Monitor costs:
- OpenRouter dashboard: https://openrouter.ai/activity
- Gemini dashboard: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com

---

## Troubleshooting

### "All AI models failed"
**Cause:** All models and keys exhausted
**Fix:**
1. Check OpenRouter keys are valid
2. Check rate limits not exceeded
3. Try different free model
4. Add more API keys

### "API Error (429): Too Many Requests"
**Cause:** Rate limit hit on current key
**Fix:** Automatic - rotates to next key
**Manual:** Add more keys to pool

### "Invalid response format from API"
**Cause:** Model returned unexpected structure
**Fix:**
1. Check model is still available on OpenRouter
2. Update FREE_MODELS array
3. Check OpenRouter API changes

### Slow responses (>5 seconds)
**Cause:** Model overloaded or wrong model chosen
**Fix:**
1. Switch model order in FREE_MODELS
2. Use faster model (gemma vs gpt-oss)
3. Reduce maxTokens in request

---

## Best Practices

1. **Always have fallback models** - Never rely on single model
2. **Rotate API keys** - Distribute load across multiple keys
3. **Monitor usage** - Check daily to catch issues early
4. **Cache responses** - Store common AI responses in localStorage
5. **Set appropriate timeouts** - Don't wait forever (5s max)
6. **Handle errors gracefully** - Show user-friendly messages
7. **Log model usage** - Track which models are most reliable

---

## Cost Comparison (If You Go Paid)

| Model | Cost per 1M tokens | Use Case |
|-------|-------------------|----------|
| gpt-4o | $5.00 | Complex reasoning |
| claude-3-5-sonnet | $3.00 | Long conversations |
| gpt-3.5-turbo | $1.50 | Fast, cheap |
| **openai/gpt-oss-120b:free** | **$0.00** | ✅ **Current choice** |
| **google/gemma-4-31b-it:free** | **$0.00** | ✅ **Current fallback** |

**Projected Monthly Cost (if paid):**
- 100 users × 20 chats/month × 200 tokens/chat = 400K tokens/month
- With gpt-3.5-turbo: $0.60/month
- **With free models: $0.00/month** ✅

---

## Future Considerations

### When to Switch to Paid Models?

**Stay Free When:**
- ✅ < 1,000 daily active users
- ✅ Response quality acceptable
- ✅ Speed acceptable (3-5s)
- ✅ Rate limits not hit

**Consider Paid When:**
- ❌ > 5,000 daily active users
- ❌ Need < 1s response time
- ❌ Need more sophisticated responses
- ❌ Free tier consistently fails
- ❌ Generating revenue (can afford)

### Recommended Paid Upgrade Path:
1. Start: Free models
2. Growth: gpt-3.5-turbo ($1.50/1M tokens)
3. Scale: claude-3-5-haiku ($1.00/1M tokens)
4. Premium: gpt-4o for power users ($5/1M tokens)

---

## Configuration Summary

```env
# .env
VITE_OPENROUTER_API_KEYS=sk-or-v1-xxx,sk-or-v1-yyy
```

```typescript
// src/lib/openrouter.ts
const FREE_MODELS = [
  'openai/gpt-oss-120b:free',
  'google/gemma-4-31b-it:free',
];
```

```typescript
// src/lib/gemini.ts
// Primary: gemini-2.0-flash-exp
// Fallback: openai/gpt-oss-120b:free via OpenRouter
```

**All Phase 1 features use 100% free models!** 🎉
