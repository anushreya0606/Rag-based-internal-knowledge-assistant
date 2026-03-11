# RAG-based Internal Knowledge Assistant

An AI-powered policy search tool for JPMorgan built with React and Claude API.

## What it does
Employees can ask plain-English questions about compliance and regulatory 
policies and get accurate answers grounded in source documents.

## Tech Stack
- React
- Claude API (Anthropic)
- RAG Architecture (BM25 retrieval)

## Documents Covered
AML, Basel III, GDPR, Volcker Rule, Dodd-Frank, MiFID II, Operational Risk, Cloud Security

## How RAG works
User Query → BM25 Retrieval → Top 3 Docs → Claude API → Grounded Answer
