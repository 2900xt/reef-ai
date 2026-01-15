create extension if not exists "pg_cron" with schema "pg_catalog";

drop policy "Users can view own purchases" on "public"."credit_purchases";

drop policy "Enable read access for all users" on "public"."reef_papers";

revoke delete on table "public"."credit_purchases" from "anon";

revoke insert on table "public"."credit_purchases" from "anon";

revoke references on table "public"."credit_purchases" from "anon";

revoke select on table "public"."credit_purchases" from "anon";

revoke trigger on table "public"."credit_purchases" from "anon";

revoke truncate on table "public"."credit_purchases" from "anon";

revoke update on table "public"."credit_purchases" from "anon";

revoke delete on table "public"."credit_purchases" from "authenticated";

revoke insert on table "public"."credit_purchases" from "authenticated";

revoke references on table "public"."credit_purchases" from "authenticated";

revoke select on table "public"."credit_purchases" from "authenticated";

revoke trigger on table "public"."credit_purchases" from "authenticated";

revoke truncate on table "public"."credit_purchases" from "authenticated";

revoke update on table "public"."credit_purchases" from "authenticated";

revoke delete on table "public"."credit_purchases" from "service_role";

revoke insert on table "public"."credit_purchases" from "service_role";

revoke references on table "public"."credit_purchases" from "service_role";

revoke select on table "public"."credit_purchases" from "service_role";

revoke trigger on table "public"."credit_purchases" from "service_role";

revoke truncate on table "public"."credit_purchases" from "service_role";

revoke update on table "public"."credit_purchases" from "service_role";

alter table "public"."credit_purchases" drop constraint "credit_purchases_stripe_session_id_key";

alter table "public"."credit_purchases" drop constraint "credit_purchases_user_id_fkey";

alter table "public"."credit_purchases" drop constraint "credit_purchases_pkey";

drop index if exists "public"."credit_purchases_pkey";

drop index if exists "public"."credit_purchases_stripe_session_id_key";

drop index if exists "public"."idx_credit_purchases_stripe_session_id";

drop index if exists "public"."idx_credit_purchases_user_id";

drop table "public"."credit_purchases";


  create table "public"."reef_credit_purchases" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "stripe_session_id" text not null,
    "credits_added" integer not null,
    "amount_paid" integer,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."reef_credit_purchases" enable row level security;

alter table "public"."profiles" add column "api_key" uuid default gen_random_uuid();

alter table "public"."reef_searches" add column "abstract" text;

CREATE UNIQUE INDEX profiles_api_key_key ON public.profiles USING btree (api_key);

CREATE UNIQUE INDEX credit_purchases_pkey ON public.reef_credit_purchases USING btree (id);

CREATE UNIQUE INDEX credit_purchases_stripe_session_id_key ON public.reef_credit_purchases USING btree (stripe_session_id);

CREATE INDEX idx_credit_purchases_stripe_session_id ON public.reef_credit_purchases USING btree (stripe_session_id);

CREATE INDEX idx_credit_purchases_user_id ON public.reef_credit_purchases USING btree (user_id);

alter table "public"."reef_credit_purchases" add constraint "credit_purchases_pkey" PRIMARY KEY using index "credit_purchases_pkey";

alter table "public"."profiles" add constraint "profiles_api_key_key" UNIQUE using index "profiles_api_key_key";

alter table "public"."reef_credit_purchases" add constraint "credit_purchases_stripe_session_id_key" UNIQUE using index "credit_purchases_stripe_session_id_key";

alter table "public"."reef_credit_purchases" add constraint "credit_purchases_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."reef_credit_purchases" validate constraint "credit_purchases_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.cleanup_old_reef_searches()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  delete from public.reef_searches
  where created_at < now() - interval '3 days';
$function$
;

grant delete on table "public"."reef_credit_purchases" to "anon";

grant insert on table "public"."reef_credit_purchases" to "anon";

grant references on table "public"."reef_credit_purchases" to "anon";

grant select on table "public"."reef_credit_purchases" to "anon";

grant trigger on table "public"."reef_credit_purchases" to "anon";

grant truncate on table "public"."reef_credit_purchases" to "anon";

grant update on table "public"."reef_credit_purchases" to "anon";

grant delete on table "public"."reef_credit_purchases" to "authenticated";

grant insert on table "public"."reef_credit_purchases" to "authenticated";

grant references on table "public"."reef_credit_purchases" to "authenticated";

grant select on table "public"."reef_credit_purchases" to "authenticated";

grant trigger on table "public"."reef_credit_purchases" to "authenticated";

grant truncate on table "public"."reef_credit_purchases" to "authenticated";

grant update on table "public"."reef_credit_purchases" to "authenticated";

grant delete on table "public"."reef_credit_purchases" to "service_role";

grant insert on table "public"."reef_credit_purchases" to "service_role";

grant references on table "public"."reef_credit_purchases" to "service_role";

grant select on table "public"."reef_credit_purchases" to "service_role";

grant trigger on table "public"."reef_credit_purchases" to "service_role";

grant truncate on table "public"."reef_credit_purchases" to "service_role";

grant update on table "public"."reef_credit_purchases" to "service_role";


  create policy "Users can view own purchases"
  on "public"."reef_credit_purchases"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



