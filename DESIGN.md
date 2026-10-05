# Design Document — AI Image Matching Engine

## Problem
Match blog post articles to the most relevant image from a library of ~50 images,
using AI vision tagging and semantic similarity. Reject wrong matches with explanations.

## Dataset
~50 images across 5 categories: red fox, wolf, dog, bear, deer (from Unsplash, free license).
~10 blog posts, one per animal topic, written manually as seed data.

## Data Model
- images — stores image file metadata
- image_tags — structured vision output per image (subject, category, attributes, caption, confidence)
- image_vectors — embedding vectors for image captions
- posts — blog post title + content
- post_vectors — embedding vectors for post content
- suggestions — ranked matches with guard result and review status

## API Surface
- POST /ingest/batch — trigger batch vision processing
- GET /ingest/status — batch job progress
- GET /posts/:id/images — ranked + guarded image suggestions for a post
- POST /suggestions/:id/approve — approve a suggestion
- POST /suggestions/:id/reject — reject a suggestion
- GET /suggestions/:id/explain — explanation for suggestion or rejection

## Mismatch Guard Rules
Reject if:
1. Cosine similarity < 0.7 (tuned later with eval set)
2. Subject category mismatch between post topic and image tag
3. Image confidence score < 0.6

## Non-goals
- No frontend UI (API + simple table only)
- No multi-user auth
- No model comparison (one vision model, one embedding model)