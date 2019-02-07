from enum import Enum
import random
import itertools

from flask import abort, Blueprint, jsonify, request
from typing import Dict

from .gamestate import GameState


storage = {}  # type: Dict[int, GameState]

api_blueprint = Blueprint('api', __name__)


def counting(f):
    counter = itertools.count()

    def closure():
        return counter.__next__()

    return closure


@counting
def new_game_id():
    pass


del counting


@api_blueprint.route('/game/')
def new_game():
    id = new_game_id()
    kwargs = request.args.to_dict()

    try:
        gs = GameState(**kwargs)
    except ValueError:
        abort(400)
    storage[id] = gs

    res = {'id': id}
    res.update(gs.game_state_dict)

    return jsonify(res)


@api_blueprint.route('/game/<int:game_id>/', methods=['GET'])
def get_game(game_id):
    if game_id not in storage.keys():
        abort(404)
    return jsonify(storage[game_id].game_state_dict)


@api_blueprint.route('/game/<int:game_id>/', methods=['POST'])
def validate(game_id):
    if not request.is_json:
        abort(400)

    state = request.json.get('state', '')
    try:
        state = list(map(int, state.split(',')))
    except ValueError:
        abort(400)

    if game_id not in storage:
        abort(404)

    gstate = storage[game_id]

    if len(state) != len(gstate.state):
        abort(400)

    return jsonify(
        {
            'validation_result': (
                gstate.validate(state) if gstate.can_attempt() else []
            ),
            'attempts_remind': gstate.attempts_remind,
        }
    )
