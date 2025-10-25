-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum types only if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'mentor');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
        CREATE TYPE session_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meeting_type') THEN
        CREATE TYPE meeting_type AS ENUM ('one_on_one', 'group');
    END IF;
END $$;

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role user_role not null,
  avatar_url text,
  bio text,
  is_anonymous boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Mentor profiles (additional info for mentors)
create table if not exists public.mentor_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  expertise text[] default '{}',
  hourly_rate decimal(10, 2),
  years_of_experience integer,
  rating decimal(3, 2) default 0,
  total_sessions integer default 0,
  is_available boolean default true,
  created_at timestamp with time zone default now()
);

-- Availability schedule for mentors
create table if not exists public.availability (
  id uuid primary key default uuid_generate_v4(),
  mentor_id uuid references public.mentor_profiles(id) on delete cascade,
  day_of_week integer not null, -- 0 = Sunday, 6 = Saturday
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default now()
);

-- Sessions/Bookings
create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles(id) on delete cascade,
  mentor_id uuid references public.mentor_profiles(id) on delete cascade,
  title text not null,
  description text,
  scheduled_at timestamp with time zone not null,
  duration_minutes integer not null default 60,
  status session_status default 'pending',
  meeting_link text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Chat messages - ensure all columns are created
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Add receiver_id if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'receiver_id') THEN
        ALTER TABLE public.messages ADD COLUMN receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Group meetings/clubs
create table if not exists public.groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  mentor_id uuid references public.mentor_profiles(id) on delete cascade,
  max_participants integer default 10,
  created_at timestamp with time zone default now()
);

-- Group members
create table if not exists public.group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamp with time zone default now(),
  unique(group_id, user_id)
);

-- Reviews/Ratings
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.sessions(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  mentor_id uuid references public.mentor_profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now(),
  unique(session_id, student_id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.mentor_profiles enable row level security;
alter table public.availability enable row level security;
alter table public.sessions enable row level security;
alter table public.messages enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.reviews enable row level security;

-- Drop existing policies if they exist, then recreate them
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- RLS Policies for mentor_profiles
DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can view mentor profiles" ON public.mentor_profiles;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Anyone can view mentor profiles"
  on public.mentor_profiles for select
  using (true);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Mentors can update own profile" ON public.mentor_profiles;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Mentors can update own profile"
  on public.mentor_profiles for update
  using (auth.uid() = id);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Mentors can insert own profile" ON public.mentor_profiles;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Mentors can insert own profile"
  on public.mentor_profiles for insert
  with check (auth.uid() = id);

-- RLS Policies for availability
DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can view availability" ON public.availability;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Anyone can view availability"
  on public.availability for select
  using (true);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Mentors can manage own availability" ON public.availability;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Mentors can manage own availability"
  on public.availability for all
  using (auth.uid() = mentor_id);

-- RLS Policies for sessions
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Users can view their own sessions"
  on public.sessions for select
  using (auth.uid() = student_id or auth.uid() = mentor_id);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Students can create sessions" ON public.sessions;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Students can create sessions"
  on public.sessions for insert
  with check (auth.uid() = student_id);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can update their own sessions" ON public.sessions;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Users can update their own sessions"
  on public.sessions for update
  using (auth.uid() = student_id or auth.uid() = mentor_id);

-- RLS Policies for messages
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Users can view their own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Users can update their received messages"
  on public.messages for update
  using (auth.uid() = receiver_id);

-- RLS Policies for groups
DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can view groups" ON public.groups;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Anyone can view groups"
  on public.groups for select
  using (true);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Mentors can create groups" ON public.groups;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Mentors can create groups"
  on public.groups for insert
  with check (auth.uid() = mentor_id);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Mentors can update own groups" ON public.groups;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Mentors can update own groups"
  on public.groups for update
  using (auth.uid() = mentor_id);

-- RLS Policies for group_members
DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can view group members" ON public.group_members;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Anyone can view group members"
  on public.group_members for select
  using (true);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Users can join groups"
  on public.group_members for insert
  with check (auth.uid() = user_id);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Users can leave groups"
  on public.group_members for delete
  using (auth.uid() = user_id);

-- RLS Policies for reviews
DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Anyone can view reviews"
  on public.reviews for select
  using (true);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Students can create reviews for their sessions" ON public.reviews;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;
create policy "Students can create reviews for their sessions"
  on public.reviews for insert
  with check (auth.uid() = student_id);

-- Create indexes for better performance (only if they don't exist)
create index if not exists idx_sessions_student on public.sessions(student_id);
create index if not exists idx_sessions_mentor on public.sessions(mentor_id);
create index if not exists idx_sessions_scheduled on public.sessions(scheduled_at);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_receiver on public.messages(receiver_id);
create index if not exists idx_availability_mentor on public.availability(mentor_id);