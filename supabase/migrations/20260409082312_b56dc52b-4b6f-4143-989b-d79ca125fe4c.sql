
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Announcements table
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active announcements"
ON public.announcements FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert announcements"
ON public.announcements FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update announcements"
ON public.announcements FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete announcements"
ON public.announcements FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add difficulty to questions
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard'));
