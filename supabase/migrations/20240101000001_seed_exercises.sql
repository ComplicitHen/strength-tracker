-- Insert default exercises (these are available to all users)
insert into public.exercises (name, category, is_custom, user_id) values
  -- Chest exercises
  ('Bench Press', 'chest', false, null),
  ('Incline Bench Press', 'chest', false, null),
  ('Decline Bench Press', 'chest', false, null),
  ('Dumbbell Press', 'chest', false, null),
  ('Incline Dumbbell Press', 'chest', false, null),
  ('Chest Fly', 'chest', false, null),
  ('Cable Fly', 'chest', false, null),
  ('Push-ups', 'chest', false, null),
  ('Dips', 'chest', false, null),

  -- Back exercises
  ('Deadlift', 'back', false, null),
  ('Barbell Row', 'back', false, null),
  ('Dumbbell Row', 'back', false, null),
  ('T-Bar Row', 'back', false, null),
  ('Lat Pulldown', 'back', false, null),
  ('Pull-ups', 'back', false, null),
  ('Chin-ups', 'back', false, null),
  ('Seated Cable Row', 'back', false, null),
  ('Face Pulls', 'back', false, null),
  ('Shrugs', 'back', false, null),

  -- Legs exercises
  ('Squat', 'legs', false, null),
  ('Front Squat', 'legs', false, null),
  ('Leg Press', 'legs', false, null),
  ('Romanian Deadlift', 'legs', false, null),
  ('Leg Curl', 'legs', false, null),
  ('Leg Extension', 'legs', false, null),
  ('Lunges', 'legs', false, null),
  ('Bulgarian Split Squat', 'legs', false, null),
  ('Calf Raise', 'legs', false, null),
  ('Seated Calf Raise', 'legs', false, null),

  -- Shoulders exercises
  ('Overhead Press', 'shoulders', false, null),
  ('Military Press', 'shoulders', false, null),
  ('Dumbbell Shoulder Press', 'shoulders', false, null),
  ('Arnold Press', 'shoulders', false, null),
  ('Lateral Raise', 'shoulders', false, null),
  ('Front Raise', 'shoulders', false, null),
  ('Rear Delt Fly', 'shoulders', false, null),
  ('Upright Row', 'shoulders', false, null),

  -- Arms exercises
  ('Barbell Curl', 'arms', false, null),
  ('Dumbbell Curl', 'arms', false, null),
  ('Hammer Curl', 'arms', false, null),
  ('Preacher Curl', 'arms', false, null),
  ('Cable Curl', 'arms', false, null),
  ('Tricep Dips', 'arms', false, null),
  ('Close-Grip Bench Press', 'arms', false, null),
  ('Tricep Pushdown', 'arms', false, null),
  ('Overhead Tricep Extension', 'arms', false, null),
  ('Skull Crushers', 'arms', false, null),

  -- Core exercises
  ('Plank', 'core', false, null),
  ('Side Plank', 'core', false, null),
  ('Crunches', 'core', false, null),
  ('Sit-ups', 'core', false, null),
  ('Russian Twists', 'core', false, null),
  ('Leg Raises', 'core', false, null),
  ('Mountain Climbers', 'core', false, null),
  ('Ab Wheel Rollout', 'core', false, null),
  ('Cable Crunch', 'core', false, null),
  ('Hanging Knee Raise', 'core', false, null);
