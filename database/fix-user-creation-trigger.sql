-- Fix: Improve the user creation trigger to support church_id and phone
-- This allows admins to create parent accounts with proper church assignment

-- First, update the trigger function to set defaults for missing fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role, church_id, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'parent'),
        -- Try to get church_id from metadata, otherwise NULL
        (NEW.raw_user_meta_data->>'church_id')::uuid,
        NEW.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
EXCEPTION WHEN others THEN
    -- If insertion fails (e.g., missing church_id), retry with just required fields
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'parent')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
