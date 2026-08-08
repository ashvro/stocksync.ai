from django.urls import path, include

urlpatterns = [
    # Django admin is unused by this app and disabled to reduce attack surface.
    path('api/', include('store.urls')),
]
