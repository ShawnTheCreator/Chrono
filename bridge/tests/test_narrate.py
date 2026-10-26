import json
import pathlib
import sys

# Add bridge directory to sys.path
BRIDGE_DIR = pathlib.Path(__file__).parent.parent.resolve()
sys.path.insert(0, str(BRIDGE_DIR))

from app.narrate import generate_narration
from app.suggest import generate_suggestion
from app.batch import generate_batch_report

GOLDEN_FILE = pathlib.Path(__file__).parent / "golden_checkpoints.json"

def test_narrate_golden_checkpoints():
    with open(GOLDEN_FILE, "r", encoding="utf-8") as f:
        checkpoints = json.load(f)

    assert len(checkpoints) >= 2

    for cp in checkpoints:
        narration = generate_narration(cp)
        assert "headline" in narration
        assert "causal_chain" in narration
        assert "hypothesis" in narration
        assert "verdict" in narration
        assert "risk_score" in narration
        assert isinstance(narration["risk_score"], (int, float))
        assert narration["verdict"] in ["FIXED", "PARTIAL", "REGRESSION", "STALL_RISK"]
        print(f"[TEST PASS] Narrated {cp['id']}: {narration['headline']}")

def test_suggest_intervention():
    stall_data = {
        "pattern": "IDENTICAL_DIFF_LOOP",
        "culprit": "core/src/hash_chain.cpp",
        "cycle_count": 3,
        "description": "Agent repeated identical diff 3 times."
    }
    suggestion = generate_suggestion(stall_data)
    assert "urgency" in suggestion
    assert "recommended_action" in suggestion
    assert "prompt_injection" in suggestion
    assert "explanation" in suggestion
    assert "INTERVENTION:" in suggestion["prompt_injection"]
    print(f"[TEST PASS] Suggestion urgency: {suggestion['urgency']}")

def test_batch_report():
    session_summary = {
        "session_id": "test_session_001",
        "task_name": "Build Chrono Ingest",
        "total_records": 100,
        "total_tokens": 32000,
        "stalls": [{"pattern": "IDENTICAL_DIFF_LOOP"}],
        "checkpoints": [{"id": "chk_1"}],
        "net_diff": {"additions": 120, "deletions": 10}
    }
    report = generate_batch_report(session_summary)
    assert "session_id" in report
    assert "scorecard" in report
    assert "architecture_score" in report["scorecard"]
    assert report["scorecard"]["architecture_score"] >= 70
    assert len(report["guardrail_recommendations"]) >= 1
    print(f"[TEST PASS] Batch report score: {report['scorecard']['architecture_score']}")

if __name__ == "__main__":
    test_narrate_golden_checkpoints()
    test_suggest_intervention()
    test_batch_report()
    print("ALL BRIDGE UNIT TESTS PASSED!")
