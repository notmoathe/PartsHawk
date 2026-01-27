# PartHawk 🦅

> **The fastest automated parts tracker for car enthusiasts.**
> *Never miss a rare part again.*

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech Stack](https://img.shields.io/badge/stack-Next.js_14-black)

## 📖 About

PartHawk is a Micro-SaaS tool built to solve a specific problem for car enthusiasts: **Speed.**
Finding rare OEM parts on eBay is a race. PartHawk automates the search process, monitoring listings in real-time and delivering instant alerts so users can buy before the scalpers do.

**Key Features:**
- ⚡ **Instant Monitoring:** Checks for new listings every 60 seconds.
- 🎯 **Precision Filtering:** Filter by "Buy It Now", Price Caps, and Condition.
- 🛡️ **Trust Score:** Automatically filters out zero-feedback sellers and scams.
- 📱 **Real-Time Alerts:** (In Progress) SMS notifications via Twilio.

## 🛠️ Tech Stack

Built with the **T3 / Modern Stack** for speed and scalability.

- **Frontend:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + Shadcn UI
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Backend:** Node.js Server Actions
- **Scraping:** Puppeteer / eBay Browse API
- **Hosting:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites
- Node.js 18+ installed
- A Supabase account (Free Tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/notmoathe/PartHawk.git](https://github.com/notmoathe/PartHawk.git)
   cd PartHawk
