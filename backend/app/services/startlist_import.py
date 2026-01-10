import base64
import csv
import io
import re
import subprocess
import tempfile
from dataclasses import dataclass
from typing import Iterable, List, Optional


@dataclass
class StartlistRow:
    name: str
    country_code: str
    ranking_position: Optional[int]
    source_line: str
    row_index: int


@dataclass
class StartlistIssue:
    row_index: int
    field: str
    message: str
    source_line: str


def decode_base64(content_base64: str) -> bytes:
    return base64.b64decode(content_base64)


def parse_startlist(filename: str, content: bytes, content_type: Optional[str]) -> tuple[List[StartlistRow], List[StartlistIssue]]:
    ext = (filename.rsplit(".", 1)[-1] if "." in filename else "").lower()
    if content_type == "text/csv" or ext == "csv":
        return parse_startlist_csv(content)
    if content_type == "application/pdf" or ext == "pdf":
        return parse_startlist_pdf(content)
    raise ValueError("Unsupported file type. Use PDF or CSV.")


def parse_startlist_pdf(content: bytes) -> tuple[List[StartlistRow], List[StartlistIssue]]:
    text = _pdftotext_layout(content)
    return _parse_startlist_text(text)


def _pdftotext_layout(content: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".pdf") as temp:
        temp.write(content)
        temp.flush()
        result = subprocess.run(
            ["pdftotext", "-layout", temp.name, "-"],
            capture_output=True,
            text=True,
            check=False,
        )
    if result.returncode != 0:
        stderr = result.stderr.strip() or "pdftotext failed"
        raise RuntimeError(stderr)
    return result.stdout


def _parse_startlist_text(text: str) -> tuple[List[StartlistRow], List[StartlistIssue]]:
    rows: List[StartlistRow] = []
    issues: List[StartlistIssue] = []
    line_re = re.compile(
        r"^\s*(?P<order>\d+)\s+\d+\s+(?P<name>.+?)\s+(?P<country>[A-Z]{3})\s+(?P<ranking>\d+|-)\s+\d{2}:\d{2}:\d{2}\s*$"
    )
    row_index = 0
    for raw_line in text.splitlines():
        line = raw_line.rstrip()
        if not line.strip():
            continue
        match = line_re.match(line)
        if not match:
            continue
        row_index += 1
        name = _normalize_name(match.group("name"))
        country = match.group("country").strip()
        ranking_raw = match.group("ranking").strip()
        ranking = _parse_ranking(ranking_raw)
        row = StartlistRow(
            name=name,
            country_code=country,
            ranking_position=ranking,
            source_line=line,
            row_index=row_index,
        )
        rows.append(row)
        issues.extend(_validate_row(row))
    issues.extend(_dedupe_issues(rows))
    return rows, issues


def parse_startlist_csv(content: bytes) -> tuple[List[StartlistRow], List[StartlistIssue]]:
    text = content.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise ValueError("CSV is missing headers.")

    field_map = _map_csv_fields(reader.fieldnames)
    rows: List[StartlistRow] = []
    issues: List[StartlistIssue] = []
    for idx, row in enumerate(reader, start=1):
        name = _normalize_name(row.get(field_map["name"], ""))
        country = (row.get(field_map["country"], "") or "").strip().upper()
        ranking_raw = (row.get(field_map["ranking"], "") or "").strip()
        ranking = _parse_ranking(ranking_raw)
        source_line = ",".join(row.get(h, "") or "" for h in reader.fieldnames)
        parsed = StartlistRow(
            name=name,
            country_code=country,
            ranking_position=ranking,
            source_line=source_line,
            row_index=idx,
        )
        rows.append(parsed)
        issues.extend(_validate_row(parsed))
    issues.extend(_dedupe_issues(rows))
    return rows, issues


def _map_csv_fields(headers: Iterable[str]) -> dict:
    normalized = {h.lower().strip(): h for h in headers}
    def pick(*candidates: str) -> str:
        for candidate in candidates:
            if candidate in normalized:
                return normalized[candidate]
        raise ValueError(f"CSV missing required column: {candidates[0]}")

    return {
        "name": pick("name", "athlete", "competitor"),
        "country": pick("ctry", "country", "country_code"),
        "ranking": pick("icf world ranking", "ranking", "rank"),
    }


def _normalize_name(name: str) -> str:
    return " ".join(name.split()).strip()


def _parse_ranking(value: str) -> Optional[int]:
    if not value or value == "-":
        return None
    try:
        return int(value)
    except ValueError:
        return None


def _validate_row(row: StartlistRow) -> List[StartlistIssue]:
    issues: List[StartlistIssue] = []
    if not row.name:
        issues.append(StartlistIssue(row.row_index, "name", "Missing athlete name.", row.source_line))
    if not row.country_code:
        issues.append(StartlistIssue(row.row_index, "country_code", "Missing country code.", row.source_line))
    elif len(row.country_code) != 3:
        issues.append(StartlistIssue(row.row_index, "country_code", "Country code must have 3 letters.", row.source_line))
    if row.ranking_position is None:
        issues.append(StartlistIssue(row.row_index, "ranking_position", "Missing ICF world ranking.", row.source_line))
    return issues


def _dedupe_issues(rows: List[StartlistRow]) -> List[StartlistIssue]:
    issues: List[StartlistIssue] = []
    seen = set()
    for row in rows:
        key = (row.name.lower(), row.country_code.upper(), row.ranking_position)
        if key in seen:
            issues.append(StartlistIssue(row.row_index, "duplicate", "Duplicate athlete row.", row.source_line))
            continue
        seen.add(key)
    return issues

