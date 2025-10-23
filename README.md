# Strength Tracker

A modern, full-featured fitness tracking web application for logging strength training workouts and monitoring your progress over time.

![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Database-3ecf8e)

## Features

### 🔐 User Authentication
- Secure email/password authentication via Supabase
- Protected routes for logged-in users only
- User profile management

### 💪 Workout Logging
- Log individual workout sessions with date and body weight
- Add multiple exercises per workout
- Track sets, reps, and weight for each exercise
- Add optional notes for workouts and individual exercises

### 📚 Exercise Library
- Pre-populated with 50+ common exercises
- Organized by muscle groups (chest, back, legs, shoulders, arms, core)
- Create and manage custom exercises
- Search and filter exercises

### 📊 Progress Tracking
- View complete workout history
- Interactive charts for body weight trends
- Exercise-specific progress visualization (weight and volume)
- Personal records tracking
- Export progress data to CSV

### 🎨 Modern UI/UX
- Responsive, mobile-first design
- Dark mode support with toggle
- Clean, intuitive interface
- Loading states and error handling

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Authentication)
- **Charts**: Recharts
- **Date Handling**: date-fns

## Database Schema

The application uses a PostgreSQL database with the following tables:

- `profiles` - Extended user information
- `exercises` - Exercise library (default + custom)
- `workouts` - Workout sessions
- `workout_exercises` - Exercise details per workout

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete schema documentation.

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works great)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/strength-tracker.git
cd strength-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In your Supabase project dashboard, go to the SQL Editor
3. Run the migrations in order:
   - Copy and execute `supabase/migrations/20240101000000_initial_schema.sql`
   - Copy and execute `supabase/migrations/20240101000001_seed_exercises.sql`

### 4. Configure Environment Variables

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy the Project URL and anon/public key

3. Update `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create an Account

1. Click "Get Started" on the landing page
2. Sign up with your email and password
3. Start logging workouts!

## Usage Guide

### Logging Your First Workout

1. Click "Log New Workout" from the dashboard
2. Set the workout date and your body weight
3. Add exercises from the dropdown menu
4. Enter sets, reps, and weight for each exercise
5. Save your workout

### Tracking Progress

1. Navigate to the "Progress" page
2. Select an exercise from the dropdown
3. View your strength progression over time
4. Switch between weight and volume charts
5. Export data to CSV for external analysis

### Managing Exercises

1. Go to the "Exercises" page
2. Browse or search for exercises
3. Filter by muscle group
4. Add custom exercises as needed

## Project Structure

```
strength-tracker/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication callbacks
│   ├── dashboard/         # Main dashboard
│   ├── exercises/         # Exercise library
│   ├── login/            # Login page
│   ├── profile/          # User profile
│   ├── progress/         # Progress tracking
│   ├── signup/           # Signup page
│   └── workouts/         # Workout logging & history
├── components/            # Reusable components
├── lib/                  # Utility functions and types
│   ├── supabase/        # Supabase client configuration
│   └── types/           # TypeScript type definitions
├── supabase/            # Database migrations
└── public/              # Static assets
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Features in Detail

### Row Level Security (RLS)

All database tables have RLS policies enabled to ensure:
- Users can only access their own data
- Default exercises are visible to everyone
- Custom exercises are private to their creator

### Mobile Responsive

The app is fully responsive with:
- Mobile-first design approach
- Touch-friendly UI elements
- Optimized layouts for all screen sizes

### Dark Mode

- Automatic detection of system preference
- Manual toggle available in navigation
- Preference saved to localStorage

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your environment variables in Vercel project settings
4. Deploy!

### Environment Variables for Production

Make sure to set these in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues or have questions:
1. Check the [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) documentation
2. Ensure your Supabase migrations ran successfully
3. Verify environment variables are set correctly

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication and database by [Supabase](https://supabase.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
