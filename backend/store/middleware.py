"""Security middleware for the AS Footwear API.

- AdminTokenMiddleware: requires a valid signed admin token on MUTATING calls
  to /api/inventory/ and /api/orders/ (POST/PUT/PATCH/DELETE). Reads stay
  public so the storefront keeps working. Local behavior is unchanged because
  the frontend attaches the token after a successful admin login.
- RateLimitMiddleware: throttles /api/auth/ (anti brute-force) and /api/chat/.
"""
from django.http import JsonResponse

from .security import verify_token, limiter, auth_limiter

PROTECTED_PREFIXES = ('/api/inventory/', '/api/orders/')
WRITE_METHODS = ('POST', 'PUT', 'PATCH', 'DELETE')


class AdminTokenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if (
            request.path.startswith(PROTECTED_PREFIXES)
            and request.method in WRITE_METHODS
        ):
            auth_header = request.headers.get('Authorization', '')
            token = auth_header[7:] if auth_header.startswith('Bearer ') else ''
            if not token or verify_token(token) is None:
                return JsonResponse(
                    {'error': 'Unauthorized. Admin login required to modify store data.'},
                    status=403,
                )
        return self.get_response(request)


class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path
        ip = request.META.get('REMOTE_ADDR', 'unknown')
        if path.startswith('/api/auth/'):
            if not auth_limiter.hit(f'{ip}:{path}'):
                return JsonResponse(
                    {'error': 'Too many attempts. Please wait a few minutes and try again.'},
                    status=429,
                )
        elif path.startswith('/api/chat/'):
            if not limiter.hit(f'{ip}:{path}'):
                return JsonResponse(
                    {'error': 'Rate limit exceeded. Please slow down.'},
                    status=429,
                )
        return self.get_response(request)
