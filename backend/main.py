from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio

app = FastAPI()

# Allow cross-origin requests from the HTML preview
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExplainRequest(BaseModel):
    clause_text: str

@app.get("/health")
async def health():
    return {"status": "ready"}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    # Simulating some processing time
    await asyncio.sleep(2.5)
    
    # Dummy analysis data matching the frontend's layout requirements
    analysis = {
        "score": 78,
        "summary": f"This document ({file.filename}) appears to be a standard agreement. We've identified some critical elements and potential risks that need your attention.",
        "clauses": [
            {
                "id": 1,
                "title": "Indemnification Clause",
                "text": "The user agrees to indemnify and hold harmless the Company from any claims resulting from use of the service.",
                "highlight": True,
                "explanation": ""
            },
            {
                "id": 2,
                "title": "Auto-Renewal",
                "text": "This agreement shall automatically renew for successive one-year terms unless either party provides 30 days written notice.",
                "highlight": False,
                "explanation": ""
            }
        ],
        "risks": [
            {"title": "Uncapped Liability", "level": "High", "desc": "Financial liability is not capped."},
            {"title": "Governing Law", "level": "Medium", "desc": "Jurisdiction may be inconvenient."}
        ],
        "actions": [
            "Negotiate a cap on liability.",
            "Opt-out of auto-renewal within 30 days."
        ]
    }
    
    return {"success": True, "filename": file.filename, "analysis": analysis}

@app.post("/explain")
async def explain(req: ExplainRequest):
    await asyncio.sleep(1) # simulate AI thinking
    return {
        "explanation": f"AI Explanation for '{req.clause_text[:20]}...': This clause means you are accepting the conditions outlined in the text and assume the associated responsibilities. Ensure you understand all terms before proceeding."
    }

@app.get("/rights")
async def get_rights():
    await asyncio.sleep(0.5)
    return {
        "rights": [
            "Right to terminate agreement with 30 days notice",
            "Right to data portability upon request",
            "Right to seek arbitration in your state of residence"
        ]
    }

@app.get("/ask")
async def ask_question(question: str):
    await asyncio.sleep(1)
    return {
        "answer": f"Based on the document context, here is the answer to '{question}': The document generally supports your rights but remains ambiguous on certain specific liabilities. We recommend legal review for precise clarification."
    }

# To run:
# pip install fastapi uvicorn python-multipart
# uvicorn main:app --reload --port 8000
