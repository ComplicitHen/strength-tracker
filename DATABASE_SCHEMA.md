# Database Schema Documentation

## Overview
This document describes the database schema for the Strength Tracker application.

## Tables

### 1. profiles
Extends the auth.users table with additional user information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK, FK) | References auth.users.id |
| email | text | User's email address |
| full_name | text | User's full name |
| current_weight | decimal(5,2) | User's current body weight |
| created_at | timestamp | Profile creation timestamp |
| updated_at | timestamp | Last update timestamp |

**RLS Policies:**
- Users can view, insert, and update their own profile only

### 2. exercises
Stores both default exercises and user-custom exercises.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| name | text | Exercise name |
| category | text | Category: chest, back, legs, shoulders, arms, core, other |
| is_custom | boolean | True if user-created, false if default |
| user_id | uuid (FK) | References auth.users.id (null for default exercises) |
| created_at | timestamp | Creation timestamp |

**Indexes:**
- user_id
- category

**RLS Policies:**
- Users can view all default exercises and their own custom exercises
- Users can insert, update, and delete their own custom exercises only

### 3. workouts
Stores individual workout sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| user_id | uuid (FK) | References auth.users.id |
| workout_date | date | Date of the workout |
| body_weight | decimal(5,2) | User's body weight on that day |
| notes | text | Optional workout notes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

**Indexes:**
- user_id
- workout_date (descending)

**RLS Policies:**
- Users can view, insert, update, and delete their own workouts only

### 4. workout_exercises
Junction table linking workouts to exercises with performance data.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| workout_id | uuid (FK) | References workouts.id |
| exercise_id | uuid (FK) | References exercises.id |
| sets | integer | Number of sets performed |
| reps | integer | Number of repetitions per set |
| weight | decimal(6,2) | Weight lifted |
| notes | text | Optional exercise notes |
| created_at | timestamp | Creation timestamp |

**Indexes:**
- workout_id
- exercise_id

**RLS Policies:**
- Users can view, insert, update, and delete workout exercises for their own workouts only

## Database Functions

### handle_new_user()
Automatically creates a profile entry when a new user signs up.

**Trigger:** on_auth_user_created (after insert on auth.users)

### handle_updated_at()
Automatically updates the updated_at timestamp on record modification.

**Triggers:**
- handle_profiles_updated_at (before update on profiles)
- handle_workouts_updated_at (before update on workouts)

## Security

All tables have Row Level Security (RLS) enabled, ensuring users can only access their own data.

## Setup Instructions

1. Create a Supabase project at https://supabase.com
2. Run the migrations in order:
   - `20240101000000_initial_schema.sql`
   - `20240101000001_seed_exercises.sql`
3. Copy your project URL and anon key to `.env.local`
