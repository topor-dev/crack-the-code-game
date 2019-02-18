from enum import IntEnum
import random
import itertools

from flask import abort, Blueprint, jsonify, request
from typing import List, Any, Dict


class NoMoreAttempsException(Exception):
    pass


class ValidationResult(IntEnum):
    ColorAndPlaceMatch = 0
    ColorMatch = 1


class GameState:
    def __init__(self, variants_count=3, cell_count=3, max_attempts=8, **kwargs):
        variants_count, cell_count, max_attempts = map(
            int, (variants_count, cell_count, max_attempts)
        )

        if any(map(lambda v: v < 0, (variants_count, cell_count, max_attempts))):
            raise ValueError('Params must be positive numbers')

        self.state = [random.randint(0, variants_count - 1) for _ in range(cell_count)]
        self.max_attempts = max_attempts
        self.attempts = []
        self.variants_count = variants_count
        self.cell_count = cell_count

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
