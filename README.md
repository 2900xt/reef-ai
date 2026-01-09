Reef: Personal Research Assistant ai that helps people track new papers in areas of their interest by webscraping common popular journal websites and notifying them sounds interesting

Phase 1: MVP (1-2 weeks)
1. Supabase Schema Setup

-- papers table
id, title, abstract, authors, arxiv_id, published_date, pdf_url, source, embedding

-- user_interests table  
user_id, interest_keywords, topic_embeddings, notification_frequency

-- user_papers table (tracking what they've seen/clicked)
user_id, paper_id, relevance_score, clicked, dismissed, saved

-- paper_tags table
paper_id, tag (auto-generated + user-added)

2. Backend: Paper Discovery (start simple)**
- Create a Supabase Edge Function that runs daily
- Scrape arXiv API (easiest to start - they have a clean API, no scraping needed)
  - Focus on cs.AI, cs.CR, cs.DS, cs.LG initially
- Store new papers in database
- Generate embeddings for abstracts (OpenAI's text-embedding-3-small is cheap)

3. LangGraph Pipeline (core logic)**
Fetch New Papers → Generate Embeddings → Score Relevance → Analyze Top Papers → Generate Digest

Create this as a separate service/edge function. Key nodes:

Paper Fetcher: Query arXiv API
Embedding Generator: Batch embed abstracts
Relevance Scorer: Cosine similarity against user interests
Analyzer (for top 10): LLM generates summary + tags
Digest Builder: Format email/notification

4. Simple Next.js Frontend

Landing page explaining Reef AI
Onboarding: user enters research interests (free text → convert to embeddings)
Dashboard showing daily digest with relevance scores
Paper cards: title, authors, summary, tags, "Save" / "Dismiss" buttons

5. Email Notifications

Use Resend (you already know this from MobyLabs)
Daily/weekly digest option
Simple HTML email with top 5-10 papers

Phase 2: Expansion (weeks 3-4)
Add more sources:

Google Scholar (harder - needs Playwright for JS rendering)
Specific conference proceedings
RSS feeds from security blogs for CTF/security papers

Improve relevance:

Feedback loop: learn from clicks/dismisses
Multi-interest tracking (separate feeds for ML vs Security vs CP)
Author following

Better UX:

Reading list / saved papers
Paper annotations
Citation alerts

Immediate Next Steps (This Week):

Set up Supabase tables - 30 min
Create simple arXiv fetcher - test with their API, store in DB - 1-2 hours
Build LangGraph script - get basic flow working locally - 2-3 hours
Create minimal Next.js pages - onboarding + digest view - 2-3 hours
Deploy Edge Function - schedule daily runs - 1 hour

Want me to help you write the Supabase schema SQL or the initial LangGraph structure? We could start with whichever piece you find most interesting.