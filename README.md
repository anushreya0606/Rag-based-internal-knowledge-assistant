# RAG-Powered Internal Knowledge Assistant

A Generative AI project that uses Retrieval-Augmented Generation (RAG) to answer questions from internal knowledge-base documents.  
The system retrieves relevant document chunks using BM25 and passes them as context to an LLM to generate grounded, document-aware answers.

> This is a simulated finance-domain/internal knowledge assistant built for learning purposes. It does not use confidential or official company data.

---

## Problem Statement

Large organizations often store important information across long policy documents, compliance manuals, FAQs, and internal knowledge bases.  
Searching these documents manually is slow and inefficient.

This project solves that problem by allowing users to ask questions in natural language and receive answers based only on the available knowledge-base content.

Example:

```text
User: What is the policy for customer data handling?
Assistant: According to the retrieved policy document, customer data must be...
