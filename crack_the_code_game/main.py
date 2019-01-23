from flask import Flask
from typing import Any

app = Flask(__name__)


@app.route("/")
def index():
    return "I want to see the world burn!"
