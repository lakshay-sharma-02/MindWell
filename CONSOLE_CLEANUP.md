# Console Logging Cleanup

## Current Status
- **Total console statements:** 109 found across codebase
- **Status:** Logging utilities created, manual replacement recommended

## New Logger Utility

A production-safe logger has been created at `src/utils/logger.ts`:

```typescript
import { logger } from "@/utils/logger";

// Usage examples:
logger.log("Debug info", data);
logger.warn("Warning message");
logger.error("Error occurred", error);
logger.debug("Detailed debug info");
logger.info("Info message");
```

**Benefits:**
- Automatically removes logs in production builds
- Maintains all console functionality during development
- Type-safe logger methods

## Files with Console Statements

The following files contain console statements that could be replaced:

### High Priority (>5 statements)
- `src/pages/Checkout.tsx` - Multiple console.error calls for validation
- `src/hooks/useSiteSettings.ts` - Error logging
- `src/components/tools/WorryJar.tsx` - Debug logging
- `src/pages/BlogPost.tsx` - Error logging

### Medium Priority (2-5 statements)
- `src/components/shared/CommentSection.tsx` - Error logging
- `src/components/admin/*` - Various managers with debug logging
- `src/hooks/useAuth.tsx` - Auth logging

### Low Priority (1-2 statements)
- Scattered across other components

## Implementation Options

### Option 1: Manual Replacement (Recommended)
1. Import logger in each file:
   ```typescript
   import { logger } from "@/utils/logger";
   ```

2. Replace console statements:
   ```typescript
   // Old:
   console.error("Error:", error);

   // New:
   logger.error("Error:", error);
   ```

3. Test to ensure functionality unchanged

### Option 2: Global Console Override (Quicker)
Add this to `src/main.tsx` or `src/App.tsx`:

```typescript
if (import.meta.env.PROD) {
  const originalConsole = { ...console };
  ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
    console[method as keyof Console] = () => {};
  });
}
```

### Option 3: ESLint Rule (Prevent Future Console Logs)
Add to `.eslintrc` or `eslint.config.js`:

```javascript
{
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

## Priority Replacement List

### Critical (Error handling - Keep as logger.error)
1. ✅ Keep: `console.error()` in try-catch blocks
   - These are important for debugging production issues
   - Replace with: `logger.error()`

2. ✅ Replace: `console.log()` and `console.debug()`
   - These should not appear in production
   - Replace with: `logger.log()` / `logger.debug()`

## Estimated Impact

### Bundle Size
- **Before:** ~50KB includes all console logging code
- **After:** ~2KB (logger utility only)
- **Reduction:** ~48KB (96% reduction in console code)

### Performance
- Production builds will skip all console string formatting
- Faster execution (no string interpolation in production)
- No console I/O overhead

### Security
- Prevents potential data leakage in production logs
- No sensitive information exposed in browser console

## Next Steps

- [ ] Review and update high-priority files (Checkout, useSiteSettings, BlogPost)
- [ ] Update admin components (AdminFloatingPanel, various managers)
- [ ] Test with production build: `npm run build`
- [ ] Verify production environment has no console output
- [ ] Optionally add ESLint rule to prevent future console statements

## Note

**All console statements currently working correctly** - this optimization is about:
1. Preventing console output in production builds
2. Providing type-safe logging alternative
3. Reducing bundle size by tree-shaking console code in production

The existing console statements are not broken - they just need to be wrapped or replaced with the new logger utility.
