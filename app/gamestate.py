import itertools
import random
from enum import IntEnum
from typing import Any, Dict, List

import attr
from flask import Blueprint, abort, jsonify, request


class NoMoreAttempsException(Exception):
    pass


class ValidationResult(IntEnum):
    ColorAndPlaceMatch = 0
    ColorMatch = 1


@attr.s
class GameState:
    variants_count = attr.ib(
        default=3, validator=attr.validators.instance_of(int)
    )  # type: int
    cell_count = attr.ib(
        default=3, validator=attr.validators.instance_of(int)
    )  # type: int
    max_attempts = attr.ib(
        default=8, validator=attr.validators.instance_of(int)
    )  # type: int

    attempts = attr.ib(init=False, factory=list)  # type: List[Dict]
    state = attr.ib(init=False)  # type: List[int]

    @variants_count.validator
    @cell_count.validator
    @max_attempts.validator
    def _(self, attribute, value):
        if value < 1:
            raise ValueError('%s must be greater than one' % attribute.name)
        max_value = 25
        if value > max_value:
            raise ValueError(
                '%s must be smaller or equal to %d' % (attribute.name, max_value)
            )

    @staticmethod
    def from_dict(state: Dict) -> 'GameState':
        """Build GameState from dict, which got from attr.asdict(inst)
        Works only with builtin attribute types

        if need non builtin attribute (ex: class) see:
        cattr, 
        https://github.com/python-attrs/attrs/issues/140#issuecomment-277106952
        """
        gs = GameState()
        for field in attr.fields(GameState):
            if not field.name in state:
                raise ValueError('%s field required' % field.name)
            setattr(gs, field.name, state[field.name])
        attr.validate(gs)
        return gs

    def __attrs_post_init__(self):
        self.state = [  # not set in default, because before it need to call validators
            random.randint(0, self.variants_count - 1) for _ in range(self.cell_count)
        ]

    def can_attempt(self):
        # type: (GameState) -> bool
        if len(self.attempts) > self.max_attempts - 1:
            return False
        return True

    @staticmethod
    def __validate(orig, key):
        # type: (List[int], List[int]) -> List[ValidationResult]
        orig, key = orig[:], key[:]
        res = []

        i = 0
        while i < len(orig):  # searching for full match
            if orig[i] == key[i]:
                res.append(ValidationResult.ColorAndPlaceMatch)
                key.pop(i)
                orig.pop(i)
                continue
            i += 1

        i = 0
        while i < len(orig):  # searching for match by color
            if orig[i] in key:
                res.append(ValidationResult.ColorMatch)
                key.remove(orig[i])
                orig.pop(i)
                continue
            i += 1

        return res

    def validate(self, state):
        # type: (GameState, List[int]) -> List[Any]
        if not self.can_attempt():
            raise NoMoreAttempsException()

        validation_result = self.__validate(self.state, state)
        self.attempts.append({'state': state, 'validation_result': validation_result})
        return validation_result

    @property
    def attempts_remind(self):
        return self.max_attempts - len(self.attempts)

    @property
    def game_state_dict(self):
        return {
            'attempts_remind': self.attempts_remind,
            'variants_count': self.variants_count,
            'cell_count': self.cell_count,
            'attempts': self.attempts,
        }
