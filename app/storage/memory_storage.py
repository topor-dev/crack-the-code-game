import itertools

import attr

from .base_storage import BaseStorage


@attr.s
class MemoryStorage(BaseStorage):
    counter = attr.ib(factory=itertools.count, init=False)
    storage = attr.ib(factory=dict, init=False)

    def new_game_id(self):
        return self.counter.__next__()

    def set(self, key, value):
        self.storage[key] = value

    def get(self, key):
        return self.storage.get(key)

    def __contains__(self, key):
        return key in self.storage
