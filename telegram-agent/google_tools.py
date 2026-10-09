"""Gmail and Drive helpers. These are plain blocking functions."""
import base64
from email.message import EmailMessage

from googleapiclient.discovery import build

from google_auth import get_credentials


def _gmail():
    return build("gmail", "v1", credentials=get_credentials(), cache_discovery=False)


def _drive():
    return build("drive", "v3", credentials=get_credentials(), cache_discovery=False)


def list_unread_emails(max_results: int = 10) -> list[dict]:
    gmail = _gmail()
    resp = gmail.users().messages().list(
        userId="me", q="is:unread in:inbox", maxResults=min(max_results, 20)
    ).execute()
    out = []
    for ref in resp.get("messages", []):
        msg = gmail.users().messages().get(
            userId="me", id=ref["id"], format="metadata",
            metadataHeaders=["From", "Subject", "Date"],
        ).execute()
        headers = {h["name"]: h["value"] for h in msg["payload"]["headers"]}
        out.append({
            "id": msg["id"],
            "from": headers.get("From", ""),
            "subject": headers.get("Subject", "(no subject)"),
            "date": headers.get("Date", ""),
            "snippet": msg.get("snippet", ""),
        })
    return out


def search_drive(query: str, max_results: int = 10) -> list[dict]:
    safe = query.replace("\\", "\\\\").replace("'", "\\'")
    resp = _drive().files().list(
        q=f"fullText contains '{safe}' and trashed = false",
        pageSize=min(max_results, 20),
        fields="files(id,name,mimeType,modifiedTime,webViewLink)",
    ).execute()
    return resp.get("files", [])


def create_draft(to: str, subject: str, body: str) -> dict:
    msg = EmailMessage()
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    draft = _gmail().users().drafts().create(
        userId="me", body={"message": {"raw": raw}}
    ).execute()
    return {"draft_id": draft["id"], "status": "saved in Gmail Drafts (not sent)"}
