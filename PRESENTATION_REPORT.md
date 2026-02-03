# PromptBI - Presentation Brief

## What is PromptBI?

**AI-powered dashboard generator** that converts natural language descriptions into production-ready Power BI specifications in **30 seconds**. Users describe dashboards in plain English, and the app generates complete specs with DAX measures and M code.

---

## Problem & Solution

**Problem:** Building Power BI dashboards requires technical expertise, hours of manual work, and learning complex tools.

**Solution:** Describe what you want in plain English → Get complete Power BI specification in seconds.

---

## Key Features

### Core Functionality
- **Natural Language to Dashboard** - Upload CSV/Excel, describe dashboard, get Power BI spec
- **AI-Powered Refinement** - Chat-based dashboard modifications with smart suggestions
- **15+ Chart Types** - Bar, Line, Pie, Card, Table, Scatter, Histogram, Funnel, Gauge, Waterfall
- **Multiple Export Formats** - Power BI Template (PBIT), PDF, CSV, JSON with DAX measures

### Smart Features
- **Data Quality Validation** - Automatic quality scoring (0-100) with issue detection
- **Undo/Redo** - Full history stack (Cmd+Z/Cmd+Shift+Z)
- **Keyboard Shortcuts** - Cmd+G (generate), Cmd+S (save), Cmd+E (export), Cmd+? (help)
- **Onboarding Tutorial** - 5-step interactive walkthrough
- **Success Celebrations** - Confetti animations
- **Analytics Tracking** - PostHog integration

---

## Technical Stack

- **Frontend:** React + TypeScript + Vite
- **AI:** Google Gemini 2.5 Flash
- **UI:** shadcn/ui + Tailwind CSS + Framer Motion
- **State:** Zustand with persistence
- **Performance:** LRU caching, data sampling for large datasets (100K+ rows)
- **Testing:** Vitest infrastructure
- **Accessibility:** Full ARIA labels, keyboard navigation, screen reader support

---

## Value Proposition

1. **Speed** - 30-second generation vs hours of manual work
2. **No License Required** - Design dashboards without Power BI Desktop
3. **Zero Learning Curve** - Natural language interface
4. **Production-Ready** - Export complete Power BI specs with DAX/M code
5. **AI-Powered** - Smart suggestions and contextual refinements

---

## Demo Flow (30 seconds)

1. **Upload** → CSV/Excel file (or sample data)
2. **Describe** → "Show sales trends by region with bar charts"
3. **Generate** → AI creates dashboard specification
4. **Refine** → Chat-based modifications
5. **Export** → Power BI template ready for import

---

## Status

✅ **Production Ready** - Core features complete, analytics tracking, testing infrastructure, accessibility compliance

🚧 **Coming Soon** - Google Sheets integration, user authentication, enhanced collaboration

---

**Built for Microsoft Hackathon • Powered by Gemini AI**
