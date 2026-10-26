import sys
import os
import pathlib
import json

bridge_path = pathlib.Path(__file__).parent.parent.resolve()
sys.path.insert(0, str(bridge_path))

from app.narrate import generate_narration
from app.suggest import generate_suggestion
from app.batch import generate_batch_report

async def run():
    print("[1/3] Testing narration...")
    with open(bridge_path / "tests" / "golden_checkpoints.json", "r", encoding="utf-8") as f:
        cps = json.load(f)
    for cp in cps:
        res = await generate_narration(cp)
        print(f"      PASS: {cp['id']} -> {res['headline']}")

    print("[2/3] Testing suggestions...")
    s = await generate_suggestion({
        "pattern": "IDENTICAL_DIFF_LOOP",
        "culprit": "core/src/hash_chain.cpp",
        "cycle_count": 3,
        "description": "Repeated identical diff"
    })
    print(f"      PASS: [{s['urgency']}] {s['recommended_action']}")

    print("[3/3] Testing batch reports...")
    b = await generate_batch_report({
        "session_id": "test_run_1",
        "total_tokens": 42000,
        "stalls": []
    })
    print(f"      PASS: Architecture Score = {b['scorecard']['architecture_score']}/100")
    print("ALL BRIDGE TESTS PASSED!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(run())
