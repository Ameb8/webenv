# my_app/signals.py

from allauth.socialaccount.signals import social_account_added, social_account_updated
from allauth.socialaccount.models import SocialToken
from django.dispatch import receiver

@receiver(social_account_added)
def handle_social_account_added(request, sociallogin, **kwargs):
    print(f"[SIGNAL] Social account added for user: {sociallogin.user}")
    token = SocialToken.objects.filter(account=sociallogin.account).first()
    print(f"[SIGNAL] Token stored: {token}")

@receiver(social_account_updated)
def handle_social_account_updated(request, sociallogin, **kwargs):
    print(f"[SIGNAL] Social account updated for user: {sociallogin.user}")
