# Renderri - AI Image Generation Platform

Welcome to Renderri! This is a Next.js application designed to help you generate, edit, and enhance images using the power of AI, with Supabase for backend and user management, and Genkit for AI functionalities.

## Features

*   **AI Image Generation:** Create stunning images from text prompts.
*   **Image Enhancement:** Improve the quality and resolution of your images.
*   **User Authentication:** Secure login and signup powered by Supabase.
*   **Generation History:** Keep track of your creations and their prompts.
*   **Weekly Generation Limits:** Users have a set number of free generations per week.

## Tech Stack

*   **Frontend:** Next.js (App Router), React, TypeScript
*   **UI:** ShadCN UI Components, Tailwind CSS
*   **Backend & Database:** Supabase
*   **AI Integration:** Genkit (with Google Gemini models)
*   **Styling:** Tailwind CSS, CSS Variables

## Getting Started

### Prerequisites

*   Node.js (version 18.x or later recommended)
*   npm, yarn, or pnpm

### Environment Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd renderri 
    ```
    (Replace `<your-repository-url>` with the actual URL of your repository)

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Supabase:**
    *   Create a project on [Supabase.io](https://supabase.io).
    *   In your Supabase project dashboard, go to **Project Settings > API**.
    *   You will need your **Project URL** and the **`anon` (public) key**.
    *   You will also need the **`service_role` key** if you intend to use administrative functions (like the `resetWeeklyLimits` function in `src/actions/aiImageActions.ts`).

4.  **Configure Environment Variables:**
    *   This project includes the `.env` file directly in the repository as per specific requirements.
    *   Open the `.env` file in the root of the project.
    *   Update it with your Supabase credentials:
        ```env
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
        SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY # Required for admin functions like resetting limits
        ```
    *   **Important Security Note:** You have requested the `.env` file to be committed. While this is done, be aware that committing files with sensitive credentials like `SUPABASE_SERVICE_ROLE_KEY` to a version control system (especially a public one) is generally not recommended. Ensure your repository's visibility and access control align with this decision.

5.  **Database Schema:**
    *   The application requires specific tables in your Supabase database: `user_profiles` and `generations`.
    *   The schema for these tables is defined in `src/lib/database.types.ts`.
    *   You can use the SQL editor in your Supabase project dashboard to create these tables if they don't exist. Here's a basic DDL to get you started (you might need to adjust it based on your exact `database.types.ts` or if you've made custom changes):
        ```sql
        -- User Profiles Table
        create table public.user_profiles (
          user_id uuid not null references auth.users (id) on delete cascade,
          weekly_generations_remaining integer not null default 50,
          last_generation_reset_at timestamp with time zone,
          updated_at timestamp with time zone default timezone('utc'::text, now()),
          primary key (user_id)
        );
        -- Enable RLS
        alter table public.user_profiles enable row level security;
        -- Example Policies for user_profiles (Review and adjust to your security needs)
        create policy "Users can view their own profile." on public.user_profiles for select using (auth.uid() = user_id);
        create policy "Users can insert their own profile." on public.user_profiles for insert with check (auth.uid() = user_id);
        create policy "Users can update their own profile." on public.user_profiles for update using (auth.uid() = user_id);
        -- For service_role key operations on all users (like resetWeeklyLimits):
        -- create policy "Service role can access all profiles" on public.user_profiles for all using (true); -- Or be more specific.

        -- Generations Table
        create table public.generations (
          id uuid not null default gen_random_uuid(),
          user_id uuid not null references auth.users (id) on delete cascade,
          prompt_text text not null,
          image_url text not null, 
          model_used text,
          created_at timestamp with time zone not null default timezone('utc'::text, now()),
          primary key (id)
        );
        -- Enable RLS
        alter table public.generations enable row level security;
        -- Example Policies for generations (Review and adjust to your security needs)
        create policy "Users can CRUD their own generations." on public.generations for all using (auth.uid() = user_id);
        ```
    *   Ensure you have enabled Row Level Security (RLS) on these tables and set up appropriate policies for access control. The example policies above are a starting point.

### Running the Development Server

1.  **Start the Next.js app:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    The application will typically be available at `http://localhost:9002`.

2.  **Start the Genkit development server (in a separate terminal):**
    For AI functionalities to work, Genkit needs to be running.
    ```bash
    npm run genkit:dev
    # or
    yarn genkit:dev
    # or
    pnpm genkit:dev
    ```
    This usually starts Genkit on `http://localhost:3400` by default. Check the console output for the exact port.

## Project Structure Highlights

*   `src/app/`: Next.js App Router pages and layouts.
*   `src/components/`: Reusable React components (including ShadCN UI).
    *   `src/components/ui/`: ShadCN UI components.
    *   `src/components/auth/`: Authentication related forms.
    *   `src/components/layout/`: Layout components like Header.
*   `src/actions/`: Next.js Server Actions for backend logic (e.g., `authActions.ts`, `aiImageActions.ts`).
*   `src/ai/`: Genkit related code.
    *   `src/ai/flows/`: Genkit flows defining AI interactions.
    *   `src/ai/genkit.ts`: Genkit plugin initialization.
*   `src/lib/`: Utility functions, Supabase client setup, type definitions.
    *   `src/lib/supabase/`: Supabase client (browser) and server configurations.
    *   `src/lib/database.types.ts`: TypeScript types generated from (or for) your Supabase schema.
*   `src/hooks/`: Custom React hooks (e.g., `useToast.ts`).
*   `src/middleware.ts`: Next.js middleware for route protection.
*   `public/`: Static assets.

## Key Scripts in `package.json`

*   `dev`: Starts the Next.js development server (and Turbopack).
*   `genkit:dev`: Starts the Genkit development server.
*   `genkit:watch`: Starts the Genkit development server in watch mode.
*   `build`: Builds the Next.js application for production.
*   `start`: Starts the Next.js production server.
*   `lint`: Runs ESLint.
*   `typecheck`: Runs TypeScript compiler for type checking.

## Contributing

[If you have contribution guidelines, add them here. For now, this is a placeholder.]

## License

[Specify your project's license here, e.g., MIT License. For now, this is a placeholder.]

---

This `README.md` was generated for the Renderri project.
