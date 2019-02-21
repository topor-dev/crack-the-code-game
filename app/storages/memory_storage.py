import itertools

import attr

from .base_storage import BaseStorage


@attr.s(init=False)
class MemoryStorage(BaseStorage):
    counter = attr.ib(factory=itertools.count)
    storage = attr.ib(factory=dict)

    def new_game_id(self):
        return self.counter.__next__()

    def set(self, key, value):
        self.storage[key] = value

    def get(self, key):
        return self.storage.get(key)

    def __contains__(self, key):
        return key in self.storage
