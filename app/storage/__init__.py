from enum import IntEnum

from typing import Any

from .memory_storage import MemoryStorage
from .redis_storage import RedisStorage


class StorageType(IntEnum):
    memory = 0
    redis = 1


def make_storage(type_: StorageType = StorageType.memory) -> Any:
    if type_ == StorageType.memory:
        return MemoryStorage()
    if type_ == StorageType.redis:
        return RedisStorage()
    raise NotImplementedError()


__all__ = ['make_storage', 'StorageType']
