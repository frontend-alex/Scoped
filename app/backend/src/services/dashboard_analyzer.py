from pathlib import Path
import json
import base64

import cv2
import numpy as np
from groq import Groq
from ultralytics import YOLO

from src.config.config import settings


SRC_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = SRC_DIR.parent

MODEL_PATH = SRC_DIR / "ml" / "model" / "best.pt"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"YOLO model not found at: {MODEL_PATH}")

MODEL = YOLO(str(MODEL_PATH))

UPLOADS_DIR = BACKEND_DIR / "uploads"
ANNOTATED_DIR = UPLOADS_DIR / "annotated"
CROPS_DIR = UPLOADS_DIR / "crops"

ANNOTATED_DIR.mkdir(parents=True, exist_ok=True)
CROPS_DIR.mkdir(parents=True, exist_ok=True)

AUDITABLE_CHART_CLASSES = {
    "bar_chart",
    "chart",
    "line_chart",
    "stacked_bar_chart",
    "column_chart",
}

GROQ_MODEL_ID = settings.GROQ_MODEL_ID

LONG_SYSTEM_PROMPT = """
You are a Senior IBCS Certified Auditor. Your task is to provide a granular "Compliance Score" (0-100%) for a chart crop based on the strict IBCS UNIFY Scenario Rules.

### KNOWLEDGE BASE: THE UNIFY RULE IN DETAIL
IBCS requires strict semantic notation so readers instantly understand data categories without reading labels.
1. MEASURED DATA (Materialized/Past):
   - Actual (AC): MUST be a SOLID DARK FILL (Black or very dark grey).
   - Previous Year (PY): MUST be a SOLID LIGHT GREY FILL.
2. FICTITIOUS DATA (Planned/Intended Future):
   - Plan (PL) or Budget (BU): MUST be HOLLOW/OUTLINED.
3. EXPECTED DATA (Probable Future):
   - Forecast (FC): MUST be HATCHED.
4. STACKED CHART EXCEPTION:
   - The lowest segment resting on the axis carries the primary scenario fill.
   - All upper segments must use different solid shades of grey.
5. DEFAULT ASSUMPTION:
   - If the chart does not explicitly label time period or scenario type, assume Actual data.

### SCORING ALGORITHM:
- NOTATION PENALTY:
    - Deduct 15 if Actual data is present and is NOT solid dark.
    - Deduct 15 if Plan/Budget data is present and is NOT hollow with dark outline.
    - Deduct 10 if Forecast data is present and is NOT hatched.
    - Deduct 10 if Previous Year data is present and is NOT solid light grey.
- METADATA PENALTY:
    - Deduct 10 if there is NO unified title.
    - Deduct 10 if there is a separate legend box.
    - Deduct 10 if x-axis labels are rotated, overlapping, or cut off.
- VISUALS PENALTY:
    - Deduct 10 if there are visible gridlines.
    - Deduct 10 if bars have visibly different widths.

### OUTPUT STRUCTURE:
Return ONLY valid JSON:
{
  "is_chart": boolean,
  "identified_scenarios": ["AC", "PL"],
  "step_1_visual_analysis": "Physical description of the chart.",
  "step_2_rule_evaluation": "Rule comparison.",
  "feedback_points": [
    "1. Rule name: issue -> status -> Deduct X points."
  ],
  "penalties": {
    "notation": integer,
    "metadata": integer,
    "visuals": integer
  },
  "remediation_plan": "Specific steps to reach 100%"
}
"""


def to_public_upload_path(path: Path) -> str:
    relative_path = path.relative_to(BACKEND_DIR)
    return str(relative_path).replace("\\", "/")


def encode_image(image_np: np.ndarray) -> str:
    success, buffer = cv2.imencode(".jpg", image_np)

    if not success:
        raise ValueError("Could not encode image crop.")

    return base64.b64encode(buffer).decode("utf-8")


def get_result_status(score: int) -> str:
    if score >= 80:
        return "compliant"

    if score >= 60:
        return "partial"

    return "non_compliant"


def build_feedback_from_vlm(chart_number: int, vlm_result: dict) -> list[dict]:
    penalties = vlm_result.get("penalties", {})

    notation_penalty = int(penalties.get("notation", 0) or 0)
    metadata_penalty = int(penalties.get("metadata", 0) or 0)
    visuals_penalty = int(penalties.get("visuals", 0) or 0)

    feedback = [
        {
            "category": f"Chart {chart_number} - Notation",
            "score": max(0, 50 - notation_penalty) * 2,
            "status": "pass" if notation_penalty == 0 else "warning",
            "message": vlm_result.get(
                "step_2_rule_evaluation",
                "No notation evaluation returned."
            )
        },
        {
            "category": f"Chart {chart_number} - Metadata",
            "score": round((max(0, 30 - metadata_penalty) / 30) * 100),
            "status": "pass" if metadata_penalty == 0 else "warning",
            "message": (
                f"Metadata penalty: {metadata_penalty}. "
                f"{vlm_result.get('step_1_visual_analysis', '')}"
            )
        },
        {
            "category": f"Chart {chart_number} - Visuals",
            "score": round((max(0, 20 - visuals_penalty) / 20) * 100),
            "status": "pass" if visuals_penalty == 0 else "warning",
            "message": (
                f"Visuals penalty: {visuals_penalty}. "
                f"{vlm_result.get('remediation_plan', '')}"
            )
        }
    ]

    for item in feedback:
        if item["score"] < 60:
            item["status"] = "fail"

    return feedback


def audit_chart_crop(client: Groq, crop_rgb: np.ndarray) -> dict:
    crop_large = cv2.resize(
        crop_rgb,
        None,
        fx=2.0,
        fy=2.0,
        interpolation=cv2.INTER_CUBIC
    )

    crop_bgr = cv2.cvtColor(crop_large, cv2.COLOR_RGB2BGR)
    b64_image = encode_image(crop_bgr)

    response = client.chat.completions.create(
        model=GROQ_MODEL_ID,
        messages=[
            {
                "role": "system",
                "content": LONG_SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Analyze this chart crop for IBCS UNIFY compliance. Output strict JSON."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{b64_image}"
                        }
                    }
                ]
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.0,
        seed=42
    )

    return json.loads(response.choices[0].message.content)


def calculate_chart_score(vlm_result: dict) -> int:
    penalties = vlm_result.get("penalties", {})

    notation_score = max(0, 50 - int(penalties.get("notation", 0) or 0))
    metadata_score = max(0, 30 - int(penalties.get("metadata", 0) or 0))
    visuals_score = max(0, 20 - int(penalties.get("visuals", 0) or 0))

    return notation_score + metadata_score + visuals_score


def analyze_dashboard_real(file_path: str) -> dict:
    groq_api_key = settings.GROQ_API_KEY

    if not groq_api_key:
        raise ValueError("GROQ_API_KEY is missing from environment variables.")

    client = Groq(api_key=groq_api_key)

    image_bgr = cv2.imread(file_path)

    if image_bgr is None:
        raise ValueError(f"Could not read image: {file_path}")

    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

    results = MODEL(image_rgb)

    detections = []
    chart_audits = []
    feedback = []

    annotated_image_path = None
    image_height, image_width, _ = image_rgb.shape

    for result in results:
        output_path = ANNOTATED_DIR / Path(file_path).name
        result.save(filename=str(output_path))
        annotated_image_path = to_public_upload_path(output_path)

        if result.boxes is None or len(result.boxes) == 0:
            continue

        for index, box in enumerate(result.boxes, start=1):
            cls_id = int(box.cls.item())
            confidence = float(box.conf.item())
            class_name = result.names[cls_id]

            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

            detection = {
                "class_name": class_name,
                "confidence": round(confidence, 4),
                "box": [x1, y1, x2, y2]
            }

            detections.append(detection)

            if class_name not in AUDITABLE_CHART_CLASSES:
                continue

            padding_y = int((y2 - y1) * 0.2)
            padding_x = int((x2 - x1) * 0.2)

            crop = image_rgb[
                max(0, y1 - padding_y):min(image_height, y2 + padding_y),
                max(0, x1 - padding_x):min(image_width, x2 + padding_x)
            ]

            crop_filename = f"{Path(file_path).stem}_chart_{index}.jpg"
            crop_path = CROPS_DIR / crop_filename

            cv2.imwrite(
                str(crop_path),
                cv2.cvtColor(crop, cv2.COLOR_RGB2BGR)
            )

            try:
                vlm_result = audit_chart_crop(client, crop)

                if not vlm_result.get("is_chart", True):
                    continue

                chart_score = calculate_chart_score(vlm_result)

                chart_audits.append({
                    "chart_number": index,
                    "class_name": class_name,
                    "confidence": round(confidence, 4),
                    "box": [x1, y1, x2, y2],
                    "crop_path": to_public_upload_path(crop_path),
                    "score": chart_score,
                    "result": get_result_status(chart_score),
                    "vlm_result": vlm_result
                })

                feedback.extend(
                    build_feedback_from_vlm(
                        chart_number=index,
                        vlm_result=vlm_result
                    )
                )

            except Exception as exc:
                chart_audits.append({
                    "chart_number": index,
                    "class_name": class_name,
                    "confidence": round(confidence, 4),
                    "box": [x1, y1, x2, y2],
                    "error": str(exc)
                })

    valid_scores = [
        item["score"]
        for item in chart_audits
        if "score" in item
    ]

    if valid_scores:
        overall_score = round(sum(valid_scores) / len(valid_scores))
        overall_result = get_result_status(overall_score)

        summary = (
            f"Detected {len(detections)} dashboard element(s). "
            f"Audited {len(valid_scores)} chart(s). "
            f"Average IBCS compliance score: {overall_score}%."
        )

        confidence = str(round(
            sum(detection["confidence"] for detection in detections) / len(detections),
            4
        )) if detections else "0.0"

    else:
        overall_score = 40
        overall_result = "non_compliant"
        confidence = str(detections[0]["confidence"]) if detections else "0.0"
        summary = "No auditable chart was detected."
        feedback = [
            {
                "category": "Chart Detection",
                "score": 40,
                "status": "fail",
                "message": (
                    "No auditable chart was detected. Check whether the image "
                    "contains a clear chart or whether the YOLO model class names "
                    "match AUDITABLE_CHART_CLASSES."
                )
            }
        ]

    return {
        "overall_result": overall_result,
        "overall_score": overall_score,
        "confidence": confidence,
        "summary": summary,
        "feedback_json": feedback,
        "annotated_image_path": annotated_image_path,
        "detections_json": {
            "detections": detections,
            "chart_audits": chart_audits
        }
    }
