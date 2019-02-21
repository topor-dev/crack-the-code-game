import os


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'hackme')
    REDIS_URL = os.environ.get('REDIS_URL')
    USE_REDIS_STORAGE = REDIS_URL is not None
