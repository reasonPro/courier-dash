# Supabase technical baseline

- `config.toml` is the local Supabase CLI configuration.
- `schema.snapshot.json` is a read-only snapshot of the linked project's
  `public` schema. It includes tables, columns, nullability, defaults, primary
  and foreign keys, constraints, indexes, RLS flags and policies, functions,
  and triggers.
- `../lib/database.types.ts` is generated from the linked remote schema.

Refresh TypeScript types with:

```sh
npm run supabase:types
```

The standard full SQL schema dump requires Docker Desktop:

```sh
npx supabase db dump --linked --schema public --file supabase/schema.sql
```

Never run `db push`, `db reset`, `migration repair`, or apply remote migrations
without separate user approval.
