--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3 (Ubuntu 15.3-1.pgdg22.04+1)
-- Dumped by pg_dump version 17.3 (Ubuntu 17.3-3.pgdg22.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookmarks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookmarks (
    bookmark_id integer NOT NULL,
    user_google_id character varying(255) NOT NULL,
    plant_id integer NOT NULL,
    bookmarked_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bookmarks OWNER TO postgres;

--
-- Name: bookmarks_bookmark_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookmarks_bookmark_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookmarks_bookmark_id_seq OWNER TO postgres;

--
-- Name: bookmarks_bookmark_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookmarks_bookmark_id_seq OWNED BY public.bookmarks.bookmark_id;


--
-- Name: plants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plants (
    plant_id integer NOT NULL,
    common_name character varying(100) NOT NULL,
    scientific_name character varying(100),
    description text,
    uses text[],
    region character varying(100),
    plant_type character varying(50),
    image_url character varying(255),
    three_d_model_url character varying(255)
);


ALTER TABLE public.plants OWNER TO postgres;

--
-- Name: plants_plant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.plants_plant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plants_plant_id_seq OWNER TO postgres;

--
-- Name: plants_plant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.plants_plant_id_seq OWNED BY public.plants.plant_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    google_id character varying(255) NOT NULL,
    email character varying(100) NOT NULL,
    first_name character varying(50),
    last_name character varying(50)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: bookmarks bookmark_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks ALTER COLUMN bookmark_id SET DEFAULT nextval('public.bookmarks_bookmark_id_seq'::regclass);


--
-- Name: plants plant_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants ALTER COLUMN plant_id SET DEFAULT nextval('public.plants_plant_id_seq'::regclass);


--
-- Data for Name: bookmarks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookmarks (bookmark_id, user_google_id, plant_id, bookmarked_at) FROM stdin;
\.


--
-- Data for Name: plants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plants (plant_id, common_name, scientific_name, description, uses, region, plant_type, image_url, three_d_model_url) FROM stdin;
2	Peppermint	Mentha piperita	A hybrid mint, a cross between watermint and spearmint. Known for its strong, fresh aroma.	{Digestion,Headaches,"Cold symptoms",Aromatherapy}	Europe, North America	Herb	https://wallpaperaccess.com/full/1463934.jpg	https://example.com/models/peppermint.glb
3	Turmeric	Curcuma longa	A flowering plant of the ginger family. The rhizomes are used in cooking and traditional medicine.	{Anti-inflammatory,Antioxidant,"Culinary spice","Wound healing"}	Southeast Asia, India	Herb	https://wallpaperaccess.com/full/1463934.jpg	https://example.com/models/turmeric.glb
4	Lavender	Lavandula angustifolia	A fragrant herb known for its calming properties.	{Relaxation,"Sleep aid",Aromatherapy}	Mediterranean	Herb	https://wallpaperaccess.com/full/1463934.jpg	\N
6	Dry1	Scidry1	A fragrant, flowering plant known for its calming properties and beautiful purple blooms. Widely used in aromatherapy and traditional medicine.	{Aromatherapy,Relaxation,"Sleep aid",Antiseptic,Perfumery}	Mediterranean	Shrub	https://wallpaperaccess.com/full/1463934.jpg	https://example.com/models/lavender.glb
7	Dry2	Scidry2	A fragrant, flowering plant known for its calming properties and beautiful purple blooms. Widely used in aromatherapy and traditional medicine.	{Aromatherapy,Relaxation,"Sleep aid",Antiseptic,Perfumery}	Mediterranean	Shrub	https://wallpaperaccess.com/full/1463934.jpg	https://example.com/models/lavender.glb
8	string	string	string	{string}	string	string	https://example.com/	https://example.com/
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (google_id, email, first_name, last_name) FROM stdin;
DAUutukDj0WQTxiffBjvQp1BTal2	dharshan122001@gmail.com	Dharshan	K
\.


--
-- Name: bookmarks_bookmark_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookmarks_bookmark_id_seq', 82, true);


--
-- Name: plants_plant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.plants_plant_id_seq', 8, true);


--
-- Name: bookmarks bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_pkey PRIMARY KEY (bookmark_id);


--
-- Name: bookmarks bookmarks_user_google_id_plant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_user_google_id_plant_id_key UNIQUE (user_google_id, plant_id);


--
-- Name: plants plants_common_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_common_name_key UNIQUE (common_name);


--
-- Name: plants plants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_pkey PRIMARY KEY (plant_id);


--
-- Name: plants plants_scientific_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_scientific_name_key UNIQUE (scientific_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (google_id);


--
-- Name: bookmarks bookmarks_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(plant_id) ON DELETE CASCADE;


--
-- Name: bookmarks bookmarks_user_google_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_user_google_id_fkey FOREIGN KEY (user_google_id) REFERENCES public.users(google_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

