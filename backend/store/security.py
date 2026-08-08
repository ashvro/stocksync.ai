"""Lightweight security helpers for AS Footwear API.

- Signed, expiring admin tokens (HMAC-SHA256, keyed on Django's SECRET_KEY).
- Simple in-memory per-IP rate limiting (no external dependencies).
"""
import hashlib
import hmac
import time

from django.conf import settings

TOKEN_TTL = 12 * 3600  # 12 hours

def _sig(username, ts):
    message = f"{username}:{ts}".encode("utf-8")
    return hmac.new(settings.SECRET_KEY.encode("utf-8"), message, hashlib.sha256).hexdigest()

def issue_token(username):
    ts = str(int(time.time()))
    return f"{username}.{ts}.{_sig(username, ts)}"

def verify_token(token):
    try:
        username, ts, sig = token.split(".")
        if int(time.time()) - int(ts) > TOKEN_TTL:
            return None
        if not hmac.compare_digest(_sig(username, ts), sig):
            return None
        return username
    except (ValueError, AttributeError, TypeError):
        return None

class RateLimiter:
    """Sliding-window rate limiter keyed by arbitrary string (IP + path)."""

    def __init__(self, max_hits=30, window=60):
        self.max_hits = max_hits
        self.window = window
        self._hits = {}

    def hit(self, key):
        now = time.time()
        cutoff = now - self.window
        hits = [t for t in self._hits.get(key, []) if t > cutoff]
        if len(hits) >= self.max_hits:
            self._hits[key] = hits
            return False
        hits.append(now)
        self._hits[key] = hits
        return True

# General API throttle (chat etc.)
limiter = RateLimiter(max_hits=30, window=60)
# Stricter throttle for the login endpoint (anti brute-force)
auth_limiter = RateLimiter(max_hits=10, window=300)
