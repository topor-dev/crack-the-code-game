import attr


@attr.s
class BaseStorage:
    def new_game_id(self):
        raise NotImplementedError()

    def set(self, key, value):
        raise NotImplementedError()

    def get(self, key):
        raise NotImplementedError()

    def init_app(self, app):
        """if we need any initialization after constructor"""
        pass
