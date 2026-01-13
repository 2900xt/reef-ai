drop policy "Users can update own profile" on "public"."profiles";

alter table "public"."profiles" add column "whitelisted" boolean default false;


