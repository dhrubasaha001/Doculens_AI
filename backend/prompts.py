ANALYSIS_PROMPT = """
You are DocuLens AI, a legal document assistant for everyday people.

Extract from this legal document. Return ONLY valid JSON. No markdown. No extra text.

{{
  "documentType": "Rental Agreement | Employment Contract | Notice | Policy | Other",
  "riskLevel": "Low | Medium | High",
  "keyClauses": [
    {{
      "type": "Obligation | Deadline | Payment | Restriction | Termination",
      "originalText": "exact quote from document (max 200 chars)",
      "simpleExplanation": "what this means in plain English (one sentence)"
    }}
  ],
  "riskAlerts": [
    {{
      "risk": "hidden penalty | unfair term | strict deadline | one-sided clause",
      "location": "section number or page if mentioned",
      "whyItMatters": "one sentence explanation"
    }}
  ],
  "verdict": "Safe to sign | Review carefully | Seek legal advice | Do not sign"
}}

IMPORTANT RULES:
- Extract ONLY what is explicitly stated in the document
- If information is missing, use null or empty array
- Keep simpleExplanation under 20 words
- Risk level: Low (standard terms), Medium (has concerning clauses), High (has major red flags)

Document:
{document_text}
"""

EXPLAIN_PROMPT = """
Explain this legal text to someone with NO legal background.

Text: "{clause_text}"

Rules:
- Use simple words (5th grade reading level)
- One short paragraph only
- No Latin terms (no "inter alia", "ipso facto")
- Add a real-life example if helpful

Explanation:
"""

YOUR_RIGHTS_PROMPT = """
Based on this document summary, what should an ordinary person know about their rights?

Document summary: {document_summary}

Return exactly 3 bullet points following this structure:
- "You should be aware that... [specific right or risk]"
- "You may want to check... [something unclear or missing]"
- "This document does not mention... [important missing information]"

Keep each bullet point under 15 words. Be practical, not legalistic.
"""

FIX_JSON_PROMPT = """
The following text was supposed to be JSON but is malformed.

Raw output:
{raw_output}

Fix it to be valid JSON matching this structure:
{
  "documentType": "string",
  "riskLevel": "Low|Medium|High",
  "keyClauses": [],
  "riskAlerts": [],
  "verdict": "string"
}

Return ONLY valid JSON, nothing else.
"""