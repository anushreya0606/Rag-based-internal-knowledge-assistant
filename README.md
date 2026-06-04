# RAG-Powered Internal Knowledge Assistant

A Generative AI project that uses **Retrieval-Augmented Generation (RAG)** to answer questions from internal knowledge-base documents.

The system retrieves relevant document chunks using **BM25 retrieval** and passes them as context to an LLM to generate grounded, document-aware answers.

> This is a simulated finance-domain/internal knowledge assistant built for learning and demonstration purposes. It does not use confidential or official company data.

---

## Problem Statement

Organizations store important information across long policy documents, compliance manuals, FAQs, and internal knowledge-base files. Searching through these documents manually can be slow and inefficient.

This project solves that problem by allowing users to ask questions in natural language and receive answers based on the available knowledge-base content.

Instead of reading multiple documents manually, the user can ask a question and get a direct answer generated using retrieved document context.

---

## Project Objective

The main objective of this project is to build an intelligent assistant that can:

* Understand a user’s natural language question
* Retrieve relevant information from a knowledge base
* Pass the retrieved context to an LLM
* Generate a grounded and useful answer
* Reduce hallucination by restricting the answer to retrieved context

---

## Domain

**Generative AI (GenAI)**

This project belongs to the Generative AI domain because it uses a Large Language Model to generate answers. It also uses retrieval techniques to provide external knowledge to the model before answer generation.

---

## Key Features

* Natural language question-answering
* Retrieval-Augmented Generation pipeline
* BM25-based document retrieval
* LLM-powered answer generation
* Context-grounded responses
* Reduced hallucination using retrieved knowledge
* Simple and easy-to-use interface
* Finance/compliance knowledge-base use case
* End-to-end GenAI application workflow

---

## AI / ML Concepts Used

* Retrieval-Augmented Generation
* Large Language Models
* Information Retrieval
* BM25 Ranking Algorithm
* Prompt Engineering
* Natural Language Processing
* Context-Aware Question Answering
* Hallucination Reduction
* Top-K Document Retrieval

---

## System Architecture

```text
User Question
     |
     v
Query Processing
     |
     v
BM25 Retriever
     |
     v
Top Relevant Document Chunks
     |
     v
Prompt Construction
     |
     v
LLM / Claude API
     |
     v
Grounded Answer
```

---

## How the Project Works

1. The user enters a question in natural language.
2. The system processes the query.
3. BM25 retrieval is used to find the most relevant document chunks.
4. The top retrieved chunks are added as context.
5. A prompt is created using the user question and retrieved context.
6. The prompt is sent to the LLM.
7. The LLM generates an answer based on the given context.
8. The final answer is displayed to the user.

---

## What is RAG?

RAG stands for **Retrieval-Augmented Generation**.

It is a technique where a system first retrieves relevant information from external documents and then uses a generative model to produce an answer.

A normal LLM may answer using only its pre-trained knowledge. This can sometimes lead to incorrect or made-up answers.

RAG improves this by giving the model relevant information before it generates the answer.

In simple terms:

```text
RAG = Retrieval + Generation
```

Retrieval finds the useful information.
Generation creates the final answer using that information.

---

## Why RAG is Useful

RAG is useful because it helps make LLM-based systems more reliable.

Benefits of RAG:

* It allows the model to answer from specific documents.
* It reduces hallucination.
* It makes answers more grounded.
* It can be used for company documents, policies, FAQs, and knowledge bases.
* It allows the system to use updated information without retraining the model.

---

## What is BM25?

BM25 is an information retrieval algorithm used to rank documents based on how relevant they are to a user query.

It checks how important query words are in a document and gives a relevance score.

BM25 considers:

* How often a query term appears in a document
* How rare or important the term is across all documents
* The length of the document

In this project, BM25 is used to retrieve the most relevant knowledge-base chunks before sending them to the LLM.

---

## Why BM25 was Used

BM25 was used because it is simple, fast, and effective for keyword-based search.

It is useful when the user query contains important words that match the documents directly.

For example, if the user asks:

```text
What is the policy for customer data handling?
```

BM25 can retrieve document chunks containing words like:

```text
policy, customer, data, handling
```

These chunks are then passed to the LLM for final answer generation.

---

## How RAG Reduces Hallucination

Hallucination happens when an LLM generates information that sounds correct but is not actually true.

This project reduces hallucination by giving the model retrieved document context and instructing it to answer using that context.

Instead of asking the model:

```text
Answer this question from your own knowledge.
```

the system asks:

```text
Use the following retrieved context to answer the question.
```

This makes the answer more grounded and document-aware.

---

## Tech Stack

* **Frontend:** React / Web Interface
* **Backend:** API Layer
* **Retrieval:** BM25
* **LLM:** Claude API
* **Language:** JavaScript / TypeScript
* **Domain:** Finance / Compliance Knowledge Assistant
* **AI Technique:** Retrieval-Augmented Generation

---

## Project Workflow

```text
Step 1: User asks a question
Step 2: Query is processed
Step 3: BM25 retrieves relevant document chunks
Step 4: Retrieved chunks are added to the prompt
Step 5: Prompt is sent to the LLM
Step 6: LLM generates a grounded response
Step 7: Final answer is shown to the user
```

---

## Example Use Case

A user can ask:

```text
What are the rules for handling customer data?
```

The system retrieves relevant knowledge-base content related to customer data handling and generates an answer based on that retrieved context.

This can be useful for:

* Internal company policy search
* Compliance document Q&A
* Finance-domain knowledge assistant
* HR policy assistant
* FAQ automation
* Legal or administrative document search

---

## Key Metrics / Achievements

* Implemented Top-K document retrieval using BM25
* Built a complete RAG pipeline for question-answering
* Generated context-grounded answers using retrieved documents
* Reduced hallucination by restricting answers to retrieved context
* Tested the system using sample finance/compliance knowledge-base queries
* Created an end-to-end GenAI application with retrieval and answer generation

---

## Screenshots

Add project screenshots here.

```text
/images/screenshot-1.png
/images/screenshot-2.png
```

---

## Future Improvements

* Replace BM25 with vector embeddings for semantic search
* Use FAISS, ChromaDB, or Pinecone for vector storage
* Add hybrid search using BM25 and embeddings
* Add source citations in generated answers
* Add PDF upload and automatic document chunking
* Add authentication and user-based chat history
* Add evaluation metrics such as retrieval accuracy and answer relevance
* Deploy the project online
* Improve UI/UX for better user interaction

---

## Learning Outcomes

Through this project, I learned how retrieval and generation can be combined to build practical GenAI applications.

I understood:

* How RAG pipelines work
* How BM25 retrieves relevant documents
* How prompts are constructed using retrieved context
* How LLMs generate answers from external knowledge
* How RAG can reduce hallucination
* How GenAI can be used in real-world knowledge assistant systems

---

## Why This Project is Important

This project shows how Generative AI can be used beyond simple chatbots.

Instead of only generating general answers, the assistant uses a knowledge base to provide more useful and grounded responses.

Such systems can be applied in real-world organizations for:

* Policy search
* Compliance support
* Internal documentation assistance
* Customer support automation
* Knowledge management

---

## Disclaimer

This project is built only for educational and demonstration purposes.

It is a simulated internal knowledge assistant and does not represent any official company system. It does not use confidential or private company data.

---

## Author

**Anushreya Tomar**

GitHub: [anushreya0606](https://github.com/anushreya0606)
