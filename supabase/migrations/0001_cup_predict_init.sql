-- Cup Predict — initial schema + seed (32-team knockout bracket)
-- Run this in the Supabase SQL Editor (project ggxqzbfhfiwetncakybo).
-- Games are updated MANUALLY: set matches.winner / score / status as results come in.

-- ─────────────────────────── Tables ───────────────────────────
create table if not exists teams (
  id    text primary key,          -- lowercase code, e.g. 'bra'
  code  text not null,             -- 'BRA'
  name  text not null,             -- 'Brazil'
  iso   text not null,             -- flag code, e.g. 'br', 'gb-eng'
  side  text not null check (side in ('left','right')),
  seed  int  not null
);

create table if not exists matches (
  id       text primary key,       -- 'M74' ... 'M104'
  round    text not null check (round in ('R32','R16','QF','SF','F','3P')),
  side     text not null check (side in ('left','right','center')),
  team_a   text references teams(id),   -- seeded team (R32) or null
  team_b   text references teams(id),
  feed_a   text references matches(id), -- feeder match (winner advances) or null
  feed_b   text references matches(id),
  winner   text references teams(id),   -- set manually when finished
  score_a  text,                        -- free text, e.g. '1 (3)'
  score_b  text,
  kickoff  timestamptz,
  status   text not null default 'scheduled' check (status in ('scheduled','live','finished')),
  sort     int  not null default 0
);

create table if not exists pool (
  id                int primary key default 1,
  tournament        text not null default 'World Cup',
  prize_pool_sol    numeric not null default 0,
  pool_wallet       text,
  final_at          timestamptz,
  updated_at        timestamptz not null default now()
);

create table if not exists predictions (
  id                uuid primary key default gen_random_uuid(),
  wallet            text not null,
  picks             jsonb not null,          -- { matchId: teamId }
  champion_team_id  text references teams(id),
  stake_sol         numeric not null,
  tx_sig            text,
  status            text not null default 'pending' check (status in ('pending','won','lost')),
  score             int not null default 0,
  created_at        timestamptz not null default now()
);
create index if not exists predictions_wallet_idx on predictions(wallet);

-- ─────────────────────────── RLS ───────────────────────────
alter table teams        enable row level security;
alter table matches      enable row level security;
alter table pool         enable row level security;
alter table predictions  enable row level security;

-- Public read for bracket data + pool
drop policy if exists teams_read   on teams;        create policy teams_read   on teams        for select using (true);
drop policy if exists matches_read on matches;      create policy matches_read on matches      for select using (true);
drop policy if exists pool_read    on pool;         create policy pool_read    on pool         for select using (true);
-- Predictions: anyone can read + insert their pick; no update/delete from client
drop policy if exists predictions_read   on predictions; create policy predictions_read   on predictions for select using (true);
drop policy if exists predictions_insert on predictions; create policy predictions_insert on predictions for insert with check (true);
-- (Manual game updates & payouts are done via the service_role key / dashboard, which bypass RLS.)

-- ─────────────────────────── Seed: teams ───────────────────────────
insert into teams (id, code, name, iso, side, seed) values
  ('ger','GER','Germany','de','left',1),   ('par','PAR','Paraguay','py','left',2),
  ('fra','FRA','France','fr','left',3),     ('swe','SWE','Sweden','se','left',4),
  ('rsa','RSA','South Africa','za','left',5),('can','CAN','Canada','ca','left',6),
  ('ned','NED','Netherlands','nl','left',7),('mar','MAR','Morocco','ma','left',8),
  ('por','POR','Portugal','pt','left',9),   ('cro','CRO','Croatia','hr','left',10),
  ('esp','ESP','Spain','es','left',11),     ('aut','AUT','Austria','at','left',12),
  ('usa','USA','USA','us','left',13),       ('bih','BIH','Bosnia & Herz.','ba','left',14),
  ('bel','BEL','Belgium','be','left',15),   ('sen','SEN','Senegal','sn','left',16),
  ('bra','BRA','Brazil','br','right',1),    ('jpn','JPN','Japan','jp','right',2),
  ('civ','CIV','Ivory Coast','ci','right',3),('nor','NOR','Norway','no','right',4),
  ('mex','MEX','Mexico','mx','right',5),    ('ecu','ECU','Ecuador','ec','right',6),
  ('eng','ENG','England','gb-eng','right',7),('cod','COD','DR Congo','cd','right',8),
  ('arg','ARG','Argentina','ar','right',9), ('cpv','CPV','Cape Verde','cv','right',10),
  ('aus','AUS','Australia','au','right',11),('egy','EGY','Egypt','eg','right',12),
  ('sui','SUI','Switzerland','ch','right',13),('alg','ALG','Algeria','dz','right',14),
  ('col','COL','Colombia','co','right',15), ('gha','GHA','Ghana','gh','right',16)
on conflict (id) do nothing;

-- ─────────────────────────── Seed: matches ───────────────────────────
insert into matches (id, round, side, team_a, team_b, feed_a, feed_b, winner, score_a, score_b, kickoff, status, sort) values
  -- Left R32
  ('M74','R32','left','ger','par',null,null,'par','1 (3)','1 (4)',null,'finished',1),
  ('M77','R32','left','fra','swe',null,null,'fra','3','0',null,'finished',2),
  ('M73','R32','left','rsa','can',null,null,'can','0','1',null,'finished',3),
  ('M75','R32','left','ned','mar',null,null,'mar','1 (2)','1 (3)',null,'finished',4),
  ('M83','R32','left','por','cro',null,null,null,null,null,'2026-07-03 00:00+00','scheduled',5),
  ('M84','R32','left','esp','aut',null,null,null,null,null,'2026-07-02 20:00+00','scheduled',6),
  ('M81','R32','left','usa','bih',null,null,'usa','2','0',null,'finished',7),
  ('M82','R32','left','bel','sen',null,null,'bel','3','2',null,'finished',8),
  -- Right R32
  ('M76','R32','right','bra','jpn',null,null,'bra','2','1',null,'finished',1),
  ('M78','R32','right','civ','nor',null,null,'nor','1','2',null,'finished',2),
  ('M79','R32','right','mex','ecu',null,null,'mex','2','0',null,'finished',3),
  ('M80','R32','right','eng','cod',null,null,'eng','2','1',null,'finished',4),
  ('M86','R32','right','arg','cpv',null,null,null,null,null,'2026-07-03 23:00+00','scheduled',5),
  ('M88','R32','right','aus','egy',null,null,null,null,null,'2026-07-03 19:00+00','scheduled',6),
  ('M85','R32','right','sui','alg',null,null,null,null,null,'2026-07-03 04:00+00','scheduled',7),
  ('M87','R32','right','col','gha',null,null,null,null,null,'2026-07-04 02:30+00','scheduled',8),
  -- Left R16
  ('M89','R16','left',null,null,'M74','M77',null,null,null,'2026-07-04 22:00+00','scheduled',1),
  ('M90','R16','left',null,null,'M73','M75',null,null,null,'2026-07-04 18:00+00','scheduled',2),
  ('M93','R16','left',null,null,'M83','M84',null,null,null,'2026-07-06 20:00+00','scheduled',3),
  ('M94','R16','left',null,null,'M81','M82',null,null,null,'2026-07-07 01:00+00','scheduled',4),
  -- Right R16
  ('M91','R16','right',null,null,'M76','M78',null,null,null,'2026-07-05 21:00+00','scheduled',1),
  ('M92','R16','right',null,null,'M79','M80',null,null,null,'2026-07-06 01:00+00','scheduled',2),
  ('M95','R16','right',null,null,'M86','M88',null,null,null,'2026-07-07 17:00+00','scheduled',3),
  ('M96','R16','right',null,null,'M85','M87',null,null,null,'2026-07-07 21:00+00','scheduled',4),
  -- QF
  ('M97','QF','left',null,null,'M89','M90',null,null,null,'2026-07-09 21:00+00','scheduled',1),
  ('M98','QF','left',null,null,'M93','M94',null,null,null,'2026-07-10 20:00+00','scheduled',2),
  ('M99','QF','right',null,null,'M91','M92',null,null,null,'2026-07-11 22:00+00','scheduled',1),
  ('M100','QF','right',null,null,'M95','M96',null,null,null,'2026-07-12 02:00+00','scheduled',2),
  -- SF
  ('M101','SF','left',null,null,'M97','M98',null,null,null,'2026-07-14 20:00+00','scheduled',1),
  ('M102','SF','right',null,null,'M99','M100',null,null,null,'2026-07-15 20:00+00','scheduled',1),
  -- Final + 3rd place
  ('M104','F','center',null,null,'M101','M102',null,null,null,'2026-07-19 20:00+00','scheduled',1),
  ('M103','3P','center',null,null,'M101','M102',null,null,null,'2026-07-18 22:00+00','scheduled',1)
on conflict (id) do nothing;

-- ─────────────────────────── Seed: pool ───────────────────────────
insert into pool (id, tournament, prize_pool_sol, pool_wallet, final_at) values
  (1,'World Cup',0,'GiqhcpjzbHqkU1h1yEyLMfFCRFwz14gVr1mxZc1S5sSW','2026-07-19 20:00+00')
on conflict (id) do update set pool_wallet = excluded.pool_wallet, final_at = excluded.final_at;
