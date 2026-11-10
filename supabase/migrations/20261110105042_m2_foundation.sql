-- M2 foundation. OWNER REVIEW/APPLICATION REQUIRED. No remote reset.
begin;
create schema if not exists anansi_private;
revoke all on schema anansi_private from public, anon, authenticated;

create table public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Storyteller' check(char_length(btrim(display_name)) between 1 and 80),
 bio text not null default '' check(char_length(bio)<=500),
 preferred_language text not null default 'en' check(preferred_language in ('xh','en')),
 spoken_languages text[] not null default '{}' check(spoken_languages <@ array['xh','en']::text[] and array_position(spoken_languages,null) is null),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function anansi_private.new_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id) values(new.id) on conflict(id) do nothing; return new; end; $$;
revoke all on function anansi_private.new_profile() from public,anon,authenticated;
create trigger anansi_new_profile after insert on auth.users for each row execute function anansi_private.new_profile();
insert into public.profiles(id) select id from auth.users on conflict(id) do nothing;
create function anansi_private.touch_profile() returns trigger language plpgsql security invoker set search_path='' as $$
begin new.updated_at=pg_catalog.now(); return new; end; $$;
revoke all on function anansi_private.touch_profile() from public,anon,authenticated;
create trigger anansi_touch_profile before update on public.profiles for each row execute function anansi_private.touch_profile();

create table public.stories(
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references public.profiles(id) on delete cascade,
 kind text not null check(kind in ('original','translation')),
 language text not null,
 parent_story_id uuid,
 parent_kind text generated always as (case when kind='translation' then 'original'::text else null end) stored,
 title text not null check(char_length(btrim(title)) between 1 and 200),
 audio_path text, audio_duration_ms integer check(audio_duration_ms between 1 and 180000),
 status text not null default 'draft',
 ai_provider text check(ai_provider in ('openai','vulavula','mock')), ai_model text,
 created_at timestamptz not null default now(),
 unique(id,author_id,kind), unique(id,parent_story_id), unique(parent_story_id,language),
 check((kind='original' and language='xh' and parent_story_id is null and status in ('draft','transcribing','transcript_ready','transcription_failed','published')) or
       (kind='translation' and language='en' and parent_story_id is not null and status in ('pending','translating','awaiting_verification','translation_failed'))),
 check(parent_story_id is null or parent_story_id<>id),
 check(audio_path is null or split_part(audio_path,'/',1)=author_id::text),
 foreign key(parent_story_id,author_id,parent_kind) references public.stories(id,author_id,kind) on delete cascade
);
create table public.segments(
 id uuid primary key default gen_random_uuid(),story_id uuid not null references public.stories(id) on delete cascade,
 position integer not null check(position>=0),text text not null check(char_length(btrim(text))>0),
 start_ms integer, end_ms integer,timing_source text check(timing_source in ('provider','estimated')),
 source_segment_id uuid, source_story_id uuid,
 unique(story_id,position),unique(id,story_id),
 check((start_ms is null and end_ms is null) or (start_ms is not null and end_ms is not null and start_ms>=0 and end_ms>start_ms and end_ms<=180000)),
 check((source_segment_id is null)=(source_story_id is null)),
 foreign key(source_segment_id,source_story_id) references public.segments(id,story_id) on delete cascade,
 foreign key(story_id,source_story_id) references public.stories(id,parent_story_id) on delete cascade
);
create table public.reviews(
 id uuid primary key default gen_random_uuid(),
 translation_story_id uuid not null, target_kind text generated always as ('translation'::text) stored,
 reviewer_id uuid not null references public.profiles(id) on delete cascade,
 story_author_id uuid not null,
 decision text not null check(decision in ('approve','reject')),
 rating integer not null check(rating between 1 and 5),
 intent_comment text not null default '',created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(translation_story_id,reviewer_id),unique(id,translation_story_id),
 foreign key(translation_story_id,story_author_id,target_kind) references public.stories(id,author_id,kind) on delete cascade
);
create table public.review_edits(
 review_id uuid not null,segment_id uuid not null,translation_story_id uuid not null,
 corrected_text text not null check(char_length(btrim(corrected_text))>0),
 primary key(review_id,segment_id),
 foreign key(review_id,translation_story_id) references public.reviews(id,translation_story_id) on delete cascade,
 foreign key(segment_id,translation_story_id) references public.segments(id,story_id) on delete cascade
);
create table public.follows(
 follower_id uuid not null references public.profiles(id) on delete cascade,
 following_id uuid not null references public.profiles(id) on delete cascade,
 primary key(follower_id,following_id),check(follower_id<>following_id)
);
create table public.shares(
 user_id uuid not null references public.profiles(id) on delete cascade,
 story_id uuid not null references public.stories(id) on delete cascade,
 created_at timestamptz not null default now(),primary key(user_id,story_id)
);
create table public.translation_tasks(
 id uuid primary key default gen_random_uuid(),
 translation_story_id uuid not null references public.stories(id) on delete cascade,
 source_segment_id uuid not null, source_story_id uuid not null,
 source_fingerprint text not null,provider text not null check(provider in ('openai','vulavula','mock')),model text not null,
 state text not null default 'pending' check(state in ('pending','processing','complete','failed')),
 attempts integer not null default 0 check(attempts>=0), claim_token uuid,claim_expires_at timestamptz,
 sanitized_error text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(translation_story_id,source_segment_id),
 foreign key(source_segment_id,source_story_id) references public.segments(id,story_id) on delete cascade,
 foreign key(translation_story_id,source_story_id) references public.stories(id,parent_story_id) on delete cascade
);

create index stories_author on public.stories(author_id);
create index stories_published on public.stories(status,created_at desc,id);
create index segments_source on public.segments(source_segment_id,source_story_id);
create index reviews_reviewer on public.reviews(reviewer_id);
create index review_edits_segment on public.review_edits(segment_id,translation_story_id);
create index follows_target on public.follows(following_id);
create index shares_story on public.shares(story_id);
create index tasks_source on public.translation_tasks(source_segment_id,source_story_id);
create index tasks_pending on public.translation_tasks(state,claim_expires_at);

alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.segments enable row level security;
alter table public.reviews enable row level security;
alter table public.review_edits enable row level security;
alter table public.follows enable row level security;
alter table public.shares enable row level security;
alter table public.translation_tasks enable row level security;
revoke all on public.profiles,public.stories,public.segments,public.reviews,public.review_edits,public.follows,public.shares,public.translation_tasks from anon,authenticated;
grant select on public.profiles,public.stories,public.segments,public.reviews,public.review_edits,public.follows,public.shares to authenticated;
grant update(display_name,bio,preferred_language,spoken_languages) on public.profiles to authenticated;
grant all on public.profiles,public.stories,public.segments,public.reviews,public.review_edits,public.follows,public.shares,public.translation_tasks to service_role;
create policy profiles_read on public.profiles for select to authenticated using(true);
create policy profiles_own_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy stories_read on public.stories for select to authenticated using(
 (kind='original' and (status='published' or author_id=(select auth.uid()))) or
 (kind='translation' and status='awaiting_verification')
);
create policy segments_read on public.segments for select to authenticated using(exists(select 1 from public.stories s where s.id=story_id));
create policy reviews_read on public.reviews for select to authenticated using(exists(select 1 from public.stories s where s.id=translation_story_id));
create policy edits_read on public.review_edits for select to authenticated using(exists(select 1 from public.reviews r where r.id=review_id));
create policy follows_read on public.follows for select to authenticated using(true);
create policy shares_read on public.shares for select to authenticated using(exists(select 1 from public.stories s where s.id=story_id));
-- Intentionally no ordinary write grants/policies for future workflows/tasks.

insert into storage.buckets(id,name,public) values('story-audio','story-audio',false);
create policy anansi_audio_read on storage.objects for select to authenticated using(
 bucket_id='story-audio' and exists(select 1 from public.stories s where s.kind='original' and s.audio_path=name and (s.author_id=(select auth.uid()) or s.status='published'))
);
-- Upload/update/delete access is deferred to M3; bucket is private from creation.
commit;
