from typing import Callable

from flask import Flask

from app import api


def create_app():
    # type: () -> Flask
    app = Flask(__name__)

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

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
