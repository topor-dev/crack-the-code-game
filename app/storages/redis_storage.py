import json
import os

import attr
import redis
from flask import current_app

from app.gamestate import GameState

from .base_storage import BaseStorage


@attr.s(init=False)
class RedisStorage(BaseStorage):
    redis_connection = attr.ib(default=None)

    def init_app(self, app):
        u = app.config['REDIS_URL']
        self.redis_connection = redis.from_url(u)
        r = self.redis_connection
        if not r.get('gid'):
            r.set('gid', -1)

    def new_game_id(self):
        return self.redis_connection.incr('gid')

    def set(self, key, gamestate):
        self.redis_connection.set(key, json.dumps(attr.asdict(gamestate)), ex=60 * 60)

    def get(self, key):
        val = self.redis_connection.get(key)
        if not val:
            return None
        return GameState.from_dict(json.loads(val))

    def __contains__(self, key):
        return self.redis_connection.exists(key) == 1
