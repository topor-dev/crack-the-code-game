import os

from app.storage import make_storage, StorageType

storage = make_storage(StorageType.memory)

if os.environ['REDIS_URL']:
    storage = make_storage(StorageType.redis)


__all__ = ['storage']
