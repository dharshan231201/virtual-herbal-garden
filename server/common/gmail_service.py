import os
import base64
import json
from email.mime.text import MIMEText

from google.oauth2 import service_account
from googleapiclient.discovery import build


SCOPES = ["https://www.googleapis.com/auth/gmail.send"]


def get_gmail_service():
    """
    Build and return Gmail API service using Base64 service account credentials
    """
    b64_creds = os.getenv("GMAIL_SERVICE_ACCOUNT_B64")
    sender = os.getenv("MAIL_FROM")

    if not b64_creds:
        raise RuntimeError("GMAIL_SERVICE_ACCOUNT_B64 not set")
    if not sender:
        raise RuntimeError("MAIL_FROM not set")

    service_account_info = json.loads(
        base64.b64decode(b64_creds).decode("utf-8")
    )

    credentials = service_account.Credentials.from_service_account_info(
        service_account_info,
        scopes=SCOPES,
    ).with_subject(sender)

    return build("gmail", "v1", credentials=credentials)


def send_email(to: str, subject: str, html: str):
    """
    Send an HTML email using Gmail API
    """
    service = get_gmail_service()

    message = MIMEText(html, "html")
    message["to"] = to
    message["from"] = os.getenv("MAIL_FROM")
    message["subject"] = subject

    raw_message = {"raw": base64.urlsafe_b64encode(message.as_bytes()).decode()}

    service.users().messages().send(
        userId="me",
        body=raw_message
    ).execute()
