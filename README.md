# 🚀 OnboardAI

**OnboardAI** (formerly MeetWise/Summriate) is your personal **AI Onboarding Engineer**.
It helps new developers master any codebase in minutes, not weeks, by analyzing GitHub repositories and generating interactive architecture guides and learning plans.

![OnboardAI Dashboard](https://via.placeholder.com/800x400?text=OnboardAI+Dashboard+Preview)

## ✨ Key Features

-   **🧠 Senior Architect Analysis**: Instantly generates a high-level architecture overview of any project.
-   **📂 Critical File Detection**: Identifies the most important files/modules to read first.
-   **📅 Personalized Learning Plans**: Creates day-by-day onboarding tasks (Day 1: Setup, Day 2: First Feature, etc.).
-   **🔗 One-Click GitHub Import**: Paste any public repo URL to start onboarding immediately.
-   **🔒 Secure & Private**: Supports private repositories (Pro plan) and secure data handling.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
-   **Database**: Supabase (PostgreSQL)
-   **Auth**: Supabase Auth (Email/Password + Social Login)
-   **AI Engine**: OpenRouter (GPT-4o)
-   **Payments**: PayHere (Sri Lanka) integration
-   **Deployment**: Netlify

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   Supabase Account
-   OpenRouter API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/onboardai.git
    cd onboardai/frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Rename `.env.example` to `.env.local` and add your keys:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Deployment

### Deploy on Netlify

1.  Push your code to a Git repository (GitHub, GitLab, etc).
2.  Connect the repository to Netlify.
3.  Netlify should automatically detect the `netlify.toml` configuration included in this project.
4.  **Important**: Add your environment variables in the Netlify Dashboard under **Site settings > Environment variables**.

## 📄 License

This project is licensed under the MIT License.

