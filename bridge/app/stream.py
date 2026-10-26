import asyncio
import json
from typing import AsyncGenerator, Dict, Any

async def stream_tokens(narration_data: Dict[str, Any]) -> AsyncGenerator[str, None]:
    headline = narration_data.get("headline", "")
    causal_chain = narration_data.get("causal_chain", "")
    hypothesis = narration_data.get("hypothesis", "")
    verdict = narration_data.get("verdict", "FIXED")

    full_text = (
        f"### {headline}\n\n"
        f"**Causal Chain**: {causal_chain}\n\n"
        f"**Hypothesis**: {hypothesis}\n\n"
        f"**Verdict**: `{verdict}`"
    )

    words = full_text.split(" ")
    for i, word in enumerate(words):
        chunk = {
            "token": word + (" " if i + 1 < len(words) else ""),
            "done": (i + 1 == len(words)),
            "index": i
        }
        yield f"data: {json.dumps(chunk)}\n\n"
        await asyncio.sleep(0.02)
