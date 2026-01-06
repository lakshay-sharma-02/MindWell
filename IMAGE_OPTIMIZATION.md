# Image Optimization Recommendations

## Images to Optimize

### 1. og-image.png (578KB)
- **Current Size:** 578KB
- **Target Size:** < 100KB
- **Recommended Format:** WebP with 80% quality
- **Tools:** Use Squoosh.app, TinyPNG, or ImageOptim API
- **Command:**
  ```bash
  # Using Squoosh.app or similar
  # Or convert with cwebp:
  cwebp -q 80 public/og-image.png -o public/og-image.webp
  ```
- **Update references:** Update any hardcoded references to use .webp with .png fallback

### 2. payment-qr.jpg (166KB)
- **Current Size:** 166KB
- **Target Size:** < 20KB (as SVG or optimized WebP)
- **Recommended Format:** SVG (best for QR codes) or highly optimized PNG/WebP
- **QR Code Best Practices:**
  - Use vector SVG format for QR codes (crisp at any size)
  - Or use high-contrast PNG with minimal compression artifacts
  - QR codes are simple, should not be 166KB!

### Conversion Commands

#### Convert QR Code to SVG (Recommended)
```bash
# Using qrencode if available
qrencode -t SVG -o public/payment-qr.svg "YOUR_QR_DATA"

# Or use online tool: qrserver.com/generate
```

#### Optimize OG Image
```bash
# Using cwebp (WebP)
cwebp -q 80 -resize 1200 630 public/og-image.png -o public/og-image.webp

# Using ImageMagick
convert public/og-image.png -quality 80 -resize 1200x630 public/og-image-optimized.jpg
```

### Expected Results
- **og-image.webp:** ~80-100KB (83-86% reduction)
- **payment-qr.svg:** ~2-5KB (97% reduction)

## Additional Image Optimization

### All Other Images
- Use responsive images with `srcset` attributes
- Implement lazy loading with `loading="lazy"`
- Consider using a CDN with automatic optimization (Cloudinary, imgix)
- Add image format detection in code (WebP with PNG/JPEG fallback)

### Code Implementation Example

```tsx
// In components that use images:
<img
  src="/payment-qr.webp"
  type="image/webp"
  alt="Payment QR Code"
  loading="lazy"
  width="300"
  height="300"
/>
```

## Timeline
- [ ] Convert og-image.png to WebP
- [ ] Convert payment-qr.jpg to SVG or optimize PNG
- [ ] Update HTML meta tags to reference optimized images
- [ ] Update component imports and references
- [ ] Test on different browsers (WebP support)
- [ ] Update PWA manifest if needed
