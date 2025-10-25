-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'User'),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'student')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Create trigger only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created' 
        AND tgrelid = 'auth.users'::regclass
    ) THEN
        create trigger on_auth_user_created
          after insert on auth.users
          for each row
          execute function public.handle_new_user();
    END IF;
END $$;

-- Function to update mentor rating
create or replace function public.update_mentor_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.mentor_profiles
  set rating = (
    select avg(rating)::decimal(3,2)
    from public.reviews
    where mentor_id = new.mentor_id
  ),
  total_sessions = (
    select count(*)
    from public.sessions
    where mentor_id = new.mentor_id and status = 'completed'
  )
  where id = new.mentor_id;

  return new;
end;
$$;

-- Create trigger only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_review_created' 
        AND tgrelid = 'public.reviews'::regclass
    ) THEN
        create trigger on_review_created
          after insert on public.reviews
          for each row
          execute function public.update_mentor_rating();
    END IF;
END $$;