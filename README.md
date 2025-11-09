# Rize

Rize is a web app that records calls, transcribes them in real time, and generates smart follow-up emails based on the conversation. It’s built to help professionals turn voice interactions into meaningful summaries and next steps with minimal effort.

---

# Overview

Rize captures both microphone and system audio, transcribes speech using the **AssemblyAI API**, and sends the transcript to **NeuralSeek** for in-depth analysis. The system extracts key discussion points, identifies action items, and generates a natural, context-aware follow-up email draft—helping users turn conversations into meaningful outcomes.  
Secure authentication and user management are handled through **Auth0**, ensuring privacy and controlled access across devices.

Within a modern work ecosystem, Rize acts as an intelligent productivity companion. It streamlines post-call workflows by automatically capturing meeting insights, summarizing discussions, and generating follow-ups without manual intervention. This makes it ideal for sales, customer success, and operations teams—enhancing efficiency, accountability, and collaboration across organizations.

---

# Features

## Call Listener Portal:

### 1. Call Summary Agent

The Call Summary Agent processes a recorded or transcribed call and extracts the key takeaways automatically. It identifies main discussion points, action items, decisions made, and any follow-up commitments. The output includes a concise summary, a list of next steps, and high-level insights about tone, sentiment, or priorities — giving users a clear picture of what happened in the call without replaying it.

---

### 2. Sales Follow-Up Platform

**Category:** Sales Productivity  
This AI agent takes in `.txt` call transcripts and extracts a detailed call summary, key discussion points, and next steps. It then generates a personalized follow-up email that matches the tone and context of the conversation.  
**Outputs:**

- A structured JSON object with summary, key points, and action items
- A ready-to-send email body in plain text  
  Optional recipient lists (CSV or array) can be provided to automate follow-ups and ensure no next step is missed.

---

### 3. Talk Track Heatmap

**Category:** Sales Enablement  
Analyzes multiple sales or support call transcripts to identify recurring topics and visualize them as a heatmap. The visualization helps sales leaders understand which talk tracks resonate, which objections trend, and where coaching is needed—without manually reviewing transcripts.

---

### 4. Feature High-Request Tracker

**Category:** Product Intelligence  
Scans multiple call transcripts or summaries to extract mentions of product features or enhancement requests. It builds a **feature request leaderboard**, showing which ideas are most discussed. Product teams can use this data to prioritize the roadmap based on real customer feedback, filtered by segment, tier, or feature category.

---

### 5. Single Call Review Dashboard

**Category:** Sales Productivity  
Processes individual call transcripts to generate an interactive post-call dashboard.  
Includes:

- A detailed call summary and sentiment timeline
- A topic heatmap showing dominant discussion themes
- Talk-to-listen ratio, objection detection, and action items
- Highlighted customer hesitation moments  
  This gives sales managers fast, data-driven insight into each call’s quality and deal progression.

---

### 6. Individual Call Scoring

**Category:** Performance Coaching  
Analyzes a call transcript to generate a **performance score** based on talk-to-listen ratio, sentiment shifts, objection handling, and closing strength. The output includes:

- A numeric score
- Strengths and weaknesses
- Targeted coaching suggestions  
  Delivered as structured JSON, ideal for performance tracking.

---

### 7. Pipeline Momentum Analyzer

**Category:** Forecasting & Risk Detection  
Ingests a CSV with deal information (name, account, stage, rep, activity, next steps, amount) and identifies pipeline momentum. It flags stalled deals, highlights fast-moving ones, and uncovers risk trends by analyzing activity velocity and engagement patterns.  
Outputs can be delivered as a Slack message, email report, or Google Sheet—perfect for deal reviews or QBRs.

---

### 8. Listener Bot with PII Redaction

**Category:** Universal  
Before processing any call transcript, this agent automatically removes personally identifiable information (PII) using NeuralSeek’s redaction tools. It ensures data privacy and compliance while maintaining the accuracy of AI-driven summaries and analyses.

---

### We also developed a **mobile application** that includes all the above call recording and analysis features, making Rize easily accessible in both workplace and work-from-home environments.

## Sales Tax Portal:

### Agent: California Tax Authority & Rate Mapper

This agent identifies all taxing authorities in California, scrapes their income or local tax rates, and links them to real addresses.

#### Workflow

1. **Discover Authorities** – Gather official state, county, city, and special district tax sources.
2. **Scrape Rates** – Extract and normalize rate data with source tracking.
3. **Enrich Addresses** – Use USPS ZIP+4 flatfile to append +4 digits and validate each sample address.
4. **Map Jurisdictions** – Associate each address with its correct taxing authority using spatial or ZIP-based matching.
5. **Output** – Produce clean CSV/JSON files mapping `{address → tax authority → rate}` for analysis or audits.

#### Goal

Create an up-to-date, verifiable dataset of all California taxing authorities, their rates, and the addresses they govern.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Auth0
- **Backend:** Node.js (API proxy for NeuralSeek and AssemblyAI), Express.js
- **APIs:** AssemblyAI, NeuralSeek

## Platforms Used

- **Gemini API** – Integrated into the mobile app for real-time Text-to-Speech generation.
- **Auth0** – Used as the authentication and user management system for the web application.
- **ElevenLabs** – Powers Speech-to-Text conversion within the web app for accurate voice processing.
- **Vultr** – Provides high-performance cloud computing resources for deploying the Pacman game.

---
