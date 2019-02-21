import os
from typing import Type, Optional

from flask import Flask, render_template

from app import api
from config import Config


def create_app(config_class: Type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    if app.config['USE_REDIS_STORAGE']:
        from app.storages import RedisStorage

        app.storage = RedisStorage(app)
    else:
        from app.storages import MemoryStorage

        app.storage = MemoryStorage(app)

    @app.route('/')
    def index():
        return render_template('index.html')

    app.register_blueprint(api.bp, url_prefix='/api')
    return app


"""
get /api/game/ => id, game state
get /api/game/<id>/ => game state
post /api/game/<id>/ => cracking result
	body: state

// если стоит на нужном месте и нужный цвет - белый
// если нужный цвет но на ненужном месте - черный
"""

__all__ = ["create_app"]
