import itertools
import random
from enum import Enum
from typing import Dict

from flask import Blueprint, abort, jsonify, request

from app.gamestate import GameState
from app.storage_holder import storage

bp = Blueprint('api', __name__)


@bp.route('/game/')
def new_game():
    id = storage.new_game_id()
    req_args = request.args.to_dict()

    kwargs = {}
    for param in ('variants_count', 'cell_count', 'max_attempts'):
        if param in req_args:
            kwargs[param] = int(req_args[param])
    try:
        gs = GameState(**kwargs)
    except (ValueError, TypeError) as e:
        abort(400)
    storage.set(id, gs)

    res = {'id': id}
    res.update(gs.game_state_dict)

    return jsonify(res)


@bp.route('/game/<int:game_id>/', methods=['GET'])
def get_game(game_id):
    game = storage.get(game_id)
    if not game:
        abort(404)
    return jsonify(game.game_state_dict)


@bp.route('/game/<int:game_id>/', methods=['POST'])
def validate(game_id):
    if not request.is_json:
        abort(400)

    state = request.json.get('state', '')
    try:
        state = list(map(int, state.split(',')))
    except ValueError:
        abort(400)

    gstate = storage.get(game_id)
    if not gstate:
        abort(404)

    if len(state) != len(gstate.state):
        abort(400)

    res = jsonify(
        {
            'validation_result': (
                gstate.validate(state) if gstate.can_attempt() else []
            ),
            'attempts_remind': gstate.attempts_remind,
        }
    )
    storage.set(game_id, gstate)
    return res


@bp.route('/debug/<int:game_id>/', methods=['GET'])
def debug_state(game_id):
    game = storage.get(game_id)
    if not game:
        abort(404)
    return jsonify({'game': game.game_state_dict, 'state': game.state})
