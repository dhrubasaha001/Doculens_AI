# ⚖️ DocuLens AI

> **Understand legal documents without a lawyer.**

DocuLens AI is an AI-powered web application that helps users analyze and understand legal documents such as contracts, agreements, and notices. It simplifies complex legal language, highlights potential risks, and provides clear, actionable insights — all in seconds.

---

## 🚀 Problem

Millions of people sign legal documents without fully understanding them:

* Rental agreements
* Job contracts
* Terms & conditions
* Legal notices

Legal consultation is often expensive, time-consuming, or inaccessible—especially for students and individuals.

---

## 💡 Solution

DocuLens AI bridges this gap by making legal understanding simple and accessible.

Upload a document or paste text, and instantly receive:

* 📄 A simplified summary
* ⚠️ Risk analysis (high, medium, low)
* 📌 Key clauses extracted
* 🧭 Rights and important considerations
* ✅ Suggested next actions

---

## 🧠 Key Features

### 📤 Document Input

* Upload PDF files
* Paste raw legal text
* Sample document support for quick demo

---

### 📊 AI-Powered Analysis

* Extracts key clauses (obligations, deadlines, payments)
* Identifies risky or unfair terms
* Converts complex legal language into plain English

---

### ⚠️ Risk Detection System

* 🔴 High Risk
* 🟡 Medium Risk
* 🟢 Low Risk

Includes a **Document Risk Score (0–100)** for quick evaluation.

---

### 🧭 Rights & Guidance

* Highlights what the user should be aware of
* Suggests practical next steps

---

### 🔍 Interactive Explanation

* Click any clause
* Instantly get a simplified explanation in a popup

---

## 🖥️ Tech Stack

### Frontend

* React (Vite / Next.js structure)
* Tailwind CSS
* Component-based architecture

### Backend

* Python (FastAPI)

### AI Layer

* LLM-based structured prompting
* Chunked document processing for large inputs

### Document Processing

* PDF text extraction (pdfplumber / PyPDF2)

---

## 📂 Project Structure

```
DocuLens_AI/
│
├── backend/
│   ├── app.py
│   ├── main.py
│   ├── prompts.py
│   ├── rag.py
│   └── requirements.txt
│
├── src/
│   ├── components/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── README.md
├── index.html
└── doculens-preview.html
```

---

## ⚙️ How It Works

1. User uploads a document or pastes text
2. Backend extracts and processes text
3. Content is sent to an AI model using structured prompts
4. AI returns:

   * Summary
   * Risks
   * Key clauses
   * Rights
   * Actions
5. Frontend displays results in a clean dashboard

---

## 🧪 Running the Project

### 🔹 Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

---

### 🔹 Frontend

```bash
cd src
npm install
npm run dev
```

---

## 📈 Scalability

* Handles large documents using chunk-based processing
* Modular backend architecture for easy scaling
* Can be extended to support more legal document types

---

## 💰 Business Model

DocuLens AI is designed as a scalable SaaS platform:

* **Freemium Model**

  * Free: Limited document analysis
  * Premium: Unlimited usage + advanced insights

* **Future Opportunities**

  * Integration with education platforms
  * Tools for freelancers and small businesses

---

## 🎯 Use Cases

* Students reviewing agreements
* Freelancers checking contracts
* Tenants understanding rental terms
* Anyone dealing with legal documents

---

## ⚠️ Disclaimer

DocuLens AI is designed to assist in understanding legal documents.
It does **not replace professional legal advice**.

---


Focus areas:

* Technical execution
* User experience
* Real-world impact
* Clear communication

---

## 👨‍💻 Team

* Frontend Developer: Hina Hanif
* Backend Developer: Dhruba Saha

---

## 🌟 Vision

We believe legal understanding should not be limited by cost or complexity.

**DocuLens AI aims to make legal knowledge accessible to everyone.**
