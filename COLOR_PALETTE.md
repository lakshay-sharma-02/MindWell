# MindWell Color Palette

This document provides a reference for the color system used in the MindWell application. The project uses CSS variables for theming, allowing for seamless light and dark mode switching.

## Core Theme Colors

These colors automatically adapt based on the active theme (Light/Dark).

| Color Name | Tailwind Class | CSS Variable | Light Mode (HM) | Dark Mode (HM) | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Background** | `bg-background` | `--background` | `45 30% 97%` | `170 30% 8%` | Page background (Deep Forest tint in dark mode) |
| **Foreground** | `text-foreground` | `--foreground` | `220 25% 12%` | `30 15% 92%` | Default text color |
| **Card** | `bg-card` | `--card` | `45 25% 99%` | `170 25% 12%` | Card backgrounds |
| **Card FG** | `text-card-foreground` | `--card-foreground` | `220 25% 12%` | `30 15% 92%` | Text on cards |
| **Popover** | `bg-popover` | `--popover` | `45 25% 99%` | `170 25% 12%` | Popovers/Modals |
| **Popover FG** | `text-popover-foreground` | `--popover-foreground` | `220 25% 12%` | `30 15% 92%` | Text in popovers |
| **Primary** | `bg-primary` / `text-primary` | `--primary` | `170 55% 32%` | `170 55% 50%` | Main brand color (Teal) |
| **Primary FG** | `text-primary-foreground` | `--primary-foreground` | `45 30% 97%` | `225 20% 9%` | Text on primary color |
| **Secondary** | `bg-secondary` | `--secondary` | `38 30% 93%` | `170 20% 16%` | Secondary elements |
| **Secondary FG** | `text-secondary-foreground` | `--secondary-foreground` | `220 25% 12%` | `30 15% 92%` | Text on secondary |
| **Muted** | `bg-muted` | `--muted` | `38 25% 88%` | `170 20% 18%` | Muted backgrounds |
| **Muted FG** | `text-muted-foreground` | `--muted-foreground` | `220 15% 40%` | `30 12% 62%` | Muted text |
| **Accent** | `bg-accent` | `--accent` | `18 45% 50%` | `20 50% 55%` | Accent highlights (Copper) |
| **Accent FG** | `text-accent-foreground` | `--accent-foreground` | `0 0% 100%` | `0 0% 100%` | Text on accent |
| **Destructive** | `bg-destructive` | `--destructive` | `350 65% 55%` | `350 60% 55%` | Error/Delete actions (Organic Rose) |
| **Destructive FG** | `text-destructive-foreground`| `--destructive-foreground` | `0 0% 100%` | `0 0% 100%` | Text on destructive |
| **Border** | `border-border` | `--border` | `38 20% 85%` | `170 20% 22%` | Borders |
| **Input** | `border-input` | `--input` | `38 20% 85%` | `170 20% 22%` | Input borders |
| **Ring** | `ring-ring` | `--ring` | `165 45% 35%` | `168 45% 52%` | Focus rings |

## Shadow Definitions (Light Mode)

Shadows now derive from the primary Deep Teal hue (`170 55% 10%`) for a premium effect.

| Shadow Token | Value |
| :--- | :--- |
| `--shadow-soft` | `0 2px 8px -2px hsl(170 55% 10% / 0.04), 0 4px 12px -4px hsl(170 55% 10% / 0.06)` |
| `--shadow-card` | `0 4px 20px -4px hsl(170 55% 10% / 0.08), 0 8px 32px -8px hsl(170 55% 10% / 0.06)` |
| `--shadow-elevated` | `0 12px 48px -12px hsl(170 55% 10% / 0.12), 0 20px 60px -20px hsl(170 55% 10% / 0.08)` |

## Extended Palette

Additional semantic colors mapped in `tailwind.config.ts`.

| Color Name | Tailwind Class | CSS Variable | Light Mode (HM) | Dark Mode (HM) |
| :--- | :--- | :--- | :--- | :--- |
| **Sage** | `bg-sage` | `--sage` | `165 45% 35%` | `168 45% 52%` |
| **Sage Light** | `bg-sage-light` | `--sage-light` | `165 35% 92%` | `168 30% 20%` |
| **Sage Dark** | `bg-sage-dark` | `--sage-dark` | `165 50% 28%` | `168 50% 42%` |
| **Cream** | `bg-cream` | `--cream` | `45 30% 97%` | `225 20% 9%` |
| **Cream Dark** | `bg-cream-dark` | `--cream-dark` | `38 30% 90%` | `225 18% 14%` |
| **Terracotta** | `bg-terracotta` | `--terracotta` | `18 60% 55%` | `20 65% 58%` |
| **Terracotta Light**| `bg-terracotta-light` | `--terracotta-light` | `18 55% 92%` | `20 40% 18%` |
| **Charcoal** | `bg-charcoal` | `--charcoal` | `220 25% 12%` | `30 15% 92%` |
| **Charcoal Light** | `bg-charcoal-light` | `--charcoal-light` | `220 20% 28%` | `30 10% 70%` |

## Accent Colors

Specific accent colors (values shown are defined in root/light mode, but may be overridden or used as static values).

| Color Name | Tailwind Class | CSS Variable | Value (HSL) |
| :--- | :--- | :--- | :--- |
| **Violet** | `bg-violet` | `--violet` | `270 35% 55%` |
| **Rose** | `bg-rose` | `--rose` | `345 45% 58%` |
| **Amber** | `bg-amber` | `--amber` | `35 70% 52%` |
| **Cyan** | `bg-cyan` | `--cyan` | `178 40% 45%` |
| **Indigo** | `bg-indigo` | `--indigo` | `235 45% 52%` |
