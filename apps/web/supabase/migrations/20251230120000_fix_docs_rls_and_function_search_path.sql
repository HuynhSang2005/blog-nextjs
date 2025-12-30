-- ============================================
-- DOCS: Fix RLS policy perf + function search_path
-- ============================================

-- Fix: function_search_path_mutable
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
CREATE OR REPLACE FUNCTION public.update_docs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix: auth_rls_initplan + avoid evaluating admin policy for anon
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
DROP POLICY IF EXISTS "Admin full access" ON public.docs;

CREATE POLICY "Admin full access"
  ON public.docs
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE public.profiles.id = (SELECT auth.uid())
        AND public.profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE public.profiles.id = (SELECT auth.uid())
        AND public.profiles.role = 'admin'
    )
  );
