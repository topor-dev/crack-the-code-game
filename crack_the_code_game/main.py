import os
from flask import Flask, render_template

from .api import api_blueprint

app = Flask(__name__)


@app.route("/")
def index():
    return open(app.jinja_env.get_template("index.html").filename, "r").read()


app.register_blueprint(api_blueprint, url_prefix="/api")

"""
new_game() => game_id
get_game(game_id) => state
test_it(game_id, state) => cracking result

// если стоит на нужном месте и нужный цвет - белый
// если нужный цвет но на ненужном месте - черный
"""
