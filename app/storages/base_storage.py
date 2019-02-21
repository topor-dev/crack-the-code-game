from typing import Optional

from flask import Flask


class BaseStorage:
    def __init__(self, app: Optional[Flask] = None) -> None:
        if app:
            self.init_app(app)

    def new_game_id(self):
        raise NotImplementedError()

    def set(self, key, value):
        raise NotImplementedError()

    def get(self, key):
        raise NotImplementedError()

    def init_app(self, app: Flask) -> None:
        """if we need initialization after constructor"""
