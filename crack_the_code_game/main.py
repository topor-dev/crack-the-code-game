import os
from flask import Flask

from crack_the_code_game import api

app = Flask(__name__)


@app.route('/')
def index():
    return app.send_static_file('index.html')


app.register_blueprint(api.bp, url_prefix='/api')

"""
get /api/game/ => id, game state
get /api/game/<id>/ => game state
post /api/game/<id>/ => cracking result
	body: state

// если стоит на нужном месте и нужный цвет - белый
// если нужный цвет но на ненужном месте - черный
"""
