import io
from pypdf import PdfReader

class PDFService:
    @staticmethod
    def extract_text_from_bytes(pdf_bytes: bytes) -> str:
        """
        Extract text cleanly from a PDF stream using pypdf.
        Avoids OCR engine bloat while handling native text documents.
        """
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text_chunks = []
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text_chunks.append(f"--- Page {i+1} ---\n{page_text}")
            
            full_text = "\n\n".join(text_chunks).strip()
            return full_text if full_text else "No extractable text found in PDF document."
        except Exception as e:
            return f"Error parsing PDF content: {str(e)}"

pdf_service = PDFService()
