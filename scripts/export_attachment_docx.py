"""Export the practical attachment narrative report to Word."""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))

from export_proposal_docx import ROOT, convert

MD_PATH = ROOT / "Practical_Attachment_Report.md"
WORD_NAMES = [
    "NARRATIVE REPORT ON PRACTICAL ATTACHMENT - ADAMA STO.docx",
]


if __name__ == "__main__":
    convert(
        md_path=MD_PATH,
        word_names=WORD_NAMES,
        roman_heading="Abstract (Executive Summary)",
        arabic_heading="Introduction",
        extra_fallbacks=[
            ROOT / "NARRATIVE REPORT ON PRACTICAL ATTACHMENT.docx",
        ],
    )
