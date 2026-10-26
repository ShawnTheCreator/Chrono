import os
import json
import urllib.request
from typing import Dict, Any, Optional

SUGGEST_SYSTEM_PROMPT = """You are the Chrono Flight Instructor.
When an AI coding agent encounters repeated errors, stalls, or divergent paths, you formulate a SURGICAL, CONCRETE INTERVENTION PROMPT that a human operator can inject into the agent's context to break the stall and restore forward velocity.

Rules for interventions:
1. Pinpoint the exact file and erroneous assumption.
2. Tell the agent exactly what diagnostic command to run or what conceptual misconception to discard.
3. Be commanding, precise, and unambiguous."""

def generate_suggestion(stall_data: Dict[str, Any], api_key: Optional[str] = None) -> Dict[str, Any]:
    api_key = api_key or os.getenv("META_MODEL_API_KEY") or os.getenv("BASETEN_API_KEY")
    pattern = stall_data.get("pattern", "UNKNOWN_STALL")
    culprit = stall_data.get("culprit", "")
    description = stall_data.get("description", "")
    cycle_count = stall_data.get("cycle_count", 3)

    user_prompt = f"""Stall Pattern: {pattern}
Culprit: {culprit}
Cycle Count: {cycle_count}
Description: {description}

Formulate surgical intervention in JSON format:
{{
  "urgency": "HIGH | CRITICAL | MEDIUM",
  "recommended_action": "<1-line instruction>",
  "prompt_injection": "<exact string to send to the agent>",
  "explanation": "<why this breaks the cycle>"
}}"""

    endpoint = os.getenv("META_MODEL_API_ENDPOINT")
    if api_key and endpoint:
        try:
            req_data = json.dumps({
                "model": "muse-spark-1026",
                "messages": [
                    {"role": "system", "content": SUGGEST_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.1,
                "response_format": {"type": "json_object"}
            }).encode("utf-8")
            req = urllib.request.Request(
                endpoint,
                data=req_data,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=10.0) as resp:
                return json.loads(resp.read().decode("utf-8"))["choices"][0]["message"]["content"]
        except Exception:
            pass

    if pattern == "IDENTICAL_DIFF_LOOP":
        return {
            "urgency": "HIGH",
            "recommended_action": "Halt identical patch attempts; revise type definition in header first.",
            "prompt_injection": (
                "INTERVENTION: You have attempted the exact same code diff 3 times. "
                "The compilation error is caused by a type mismatch in include/chrono/event.h, not the implementation file. "
                "Inspect EventWireHeader alignment and verify struct size before retrying."
            ),
            "explanation": "Agent is stuck in local edit loop because the real bug is in an un-opened header file."
        }
    elif pattern == "TOOL_EXECUTION_FAILURE_LOOP":
        return {
            "urgency": "CRITICAL",
            "recommended_action": "Break repeated test command execution and run diagnostic verbose trace.",
            "prompt_injection": (
                "INTERVENTION: Stop re-running the test suite unchanged. Run `ctest --verbose -R <TestName>` "
                "to isolate stdout/stderr and examine memory assertions."
            ),
            "explanation": "Agent repeatedly triggers same timeout without checking granular failure stack."
        }
    else:
        return {
            "urgency": "MEDIUM",
            "recommended_action": "Direct agent to pause exploratory reads and synthesize plan.",
            "prompt_injection": (
                "INTERVENTION: You have performed repeated read-only inspections without writing code. "
                "Summarize your findings in 3 bullet points and implement the fix."
            ),
            "explanation": "Agent entered exploratory thrashing without committing changes."
        }
