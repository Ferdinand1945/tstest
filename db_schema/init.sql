-- Transiett database schema + seed data (PostgreSQL 16)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';
SET default_table_access_method = heap;

CREATE TABLE public.campaigns (
    id integer NOT NULL,
    prefix character varying(50) NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency character(3) NOT NULL,
    valid_from date NOT NULL,
    valid_to date NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE public.campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.campaigns_id_seq OWNED BY public.campaigns.id;

CREATE TABLE public.vouchers (
    id bigint NOT NULL,
    campaign_id integer NOT NULL,
    code character varying(64) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE public.vouchers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.vouchers_id_seq OWNED BY public.vouchers.id;

ALTER TABLE ONLY public.campaigns ALTER COLUMN id SET DEFAULT nextval('public.campaigns_id_seq'::regclass);
ALTER TABLE ONLY public.vouchers ALTER COLUMN id SET DEFAULT nextval('public.vouchers_id_seq'::regclass);

COPY public.campaigns (id, prefix, amount, currency, valid_from, valid_to, created_at) FROM stdin;
1	DISCOUNT	10.00	EUR	2026-06-03	2027-06-03	2026-06-03 22:33:20.279+00
2	DISCOUNT	10.00	EUR	2026-06-03	2027-06-03	2026-06-03 22:47:16.454+00
3	DISCOUNT	10.00	EUR	2026-06-03	2027-06-03	2026-06-03 22:47:17.082+00
4	DISCOUNT	10.00	EUR	2026-06-03	2027-06-03	2026-06-03 22:47:17.55+00
\.

COPY public.vouchers (id, campaign_id, code, created_at) FROM stdin;
\.

SELECT pg_catalog.setval('public.campaigns_id_seq', 4, true);
SELECT pg_catalog.setval('public.vouchers_id_seq', 1, false);

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_code_key UNIQUE (code);

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (id);

CREATE INDEX vouchers_campaign_id ON public.vouchers USING btree (campaign_id);

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE;
