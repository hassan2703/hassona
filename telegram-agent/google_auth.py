"""Google sign-in. Run `python google_auth.py` once to log in; it saves token.json."""
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# Read mail, create drafts (cannot send), and read Drive files.
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/drive.readonly",
]
HERE = Path(__file__).parent
CREDS_FILE = HERE / "credentials.json"
TOKEN_FILE = HERE / "token.json"


def get_credentials() -> Credentials:
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    if creds and creds.valid:
        return creds
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        if not CREDS_FILE.exists():
            raise SystemExit("credentials.json not found. See README.md step 4.")
        flow = InstalledAppFlow.from_client_secrets_file(str(CREDS_FILE), SCOPES)
        creds = flow.run_local_server(port=0)
    TOKEN_FILE.write_text(creds.to_json())
    return creds


if __name__ == "__main__":
    get_credentials()
    print("Logged in. token.json saved.")
