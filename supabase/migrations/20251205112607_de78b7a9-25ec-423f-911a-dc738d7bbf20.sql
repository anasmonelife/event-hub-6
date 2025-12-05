-- Drop existing restrictive policies on team_members
DROP POLICY IF EXISTS "Allow public delete" ON public.team_members;
DROP POLICY IF EXISTS "Allow public insert" ON public.team_members;
DROP POLICY IF EXISTS "Allow public read" ON public.team_members;
DROP POLICY IF EXISTS "Allow public update" ON public.team_members;

-- Create permissive policies for public access
CREATE POLICY "Enable read access for all" ON public.team_members
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all" ON public.team_members
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all" ON public.team_members
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all" ON public.team_members
FOR DELETE USING (true);