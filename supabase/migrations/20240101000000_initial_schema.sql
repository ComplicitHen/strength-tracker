-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  current_weight decimal(5,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create exercises table
create table public.exercises (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null check (category in ('chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'other')),
  is_custom boolean default false,
  user_id uuid references auth.users on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(name, user_id)
);

-- Create index for faster exercise queries
create index exercises_user_id_idx on public.exercises(user_id);
create index exercises_category_idx on public.exercises(category);

-- Create workouts table
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  workout_date date not null default current_date,
  body_weight decimal(5,2),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster workout queries
create index workouts_user_id_idx on public.workouts(user_id);
create index workouts_date_idx on public.workouts(workout_date desc);

-- Create workout_exercises table (junction table with exercise details)
create table public.workout_exercises (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references public.workouts on delete cascade not null,
  exercise_id uuid references public.exercises on delete restrict not null,
  sets integer not null check (sets > 0),
  reps integer not null check (reps > 0),
  weight decimal(6,2) not null check (weight >= 0),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster workout exercise queries
create index workout_exercises_workout_id_idx on public.workout_exercises(workout_id);
create index workout_exercises_exercise_id_idx on public.workout_exercises(exercise_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Exercises policies
create policy "Users can view default exercises and their own custom exercises"
  on public.exercises for select
  using (is_custom = false or auth.uid() = user_id);

create policy "Users can insert their own custom exercises"
  on public.exercises for insert
  with check (auth.uid() = user_id and is_custom = true);

create policy "Users can update their own custom exercises"
  on public.exercises for update
  using (auth.uid() = user_id and is_custom = true);

create policy "Users can delete their own custom exercises"
  on public.exercises for delete
  using (auth.uid() = user_id and is_custom = true);

-- Workouts policies
create policy "Users can view their own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own workouts"
  on public.workouts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);

-- Workout exercises policies
create policy "Users can view their own workout exercises"
  on public.workout_exercises for select
  using (exists (
    select 1 from public.workouts
    where workouts.id = workout_exercises.workout_id
    and workouts.user_id = auth.uid()
  ));

create policy "Users can insert their own workout exercises"
  on public.workout_exercises for insert
  with check (exists (
    select 1 from public.workouts
    where workouts.id = workout_exercises.workout_id
    and workouts.user_id = auth.uid()
  ));

create policy "Users can update their own workout exercises"
  on public.workout_exercises for update
  using (exists (
    select 1 from public.workouts
    where workouts.id = workout_exercises.workout_id
    and workouts.user_id = auth.uid()
  ));

create policy "Users can delete their own workout exercises"
  on public.workout_exercises for delete
  using (exists (
    select 1 from public.workouts
    where workouts.id = workout_exercises.workout_id
    and workouts.user_id = auth.uid()
  ));

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Triggers for updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_workouts_updated_at
  before update on public.workouts
  for each row execute procedure public.handle_updated_at();
