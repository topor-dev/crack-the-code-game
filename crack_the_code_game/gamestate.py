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
    def __init__(self, max_color=3, cell_count=3, max_attempts=8, **kwargs):
        max_color, cell_count, max_attempts = map(
            int, (max_color, cell_count, max_attempts)
        )

        if any(map(lambda v: v < 0, (max_color, cell_count, max_attempts))):
            raise ValueError('Params must be positive numbers')

        self.state = [random.randint(0, max_color) for _ in range(cell_count)]
        self.max_attempts = max_attempts
        self.attempts = []
        self.max_color = max_color
        self.cell_count = cell_count

    def can_attempt(self):
        # type: (GameState) -> bool
        if len(self.attempts) > self.max_attempts - 1:
            return False
        return True

    @staticmethod
    def __crack(orig, key):
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

    def crack(self, state):
        # type: (GameState, List[int]) -> List[Any]
        if not self.can_attempt():
            raise NoMoreAttempsException()

        crack_result = self.__crack(self.state, state)
        self.attempts.append({'state': state, 'crack_result': crack_result})
        return crack_result

    @property
    def attempts_remind(self):
        return self.max_attempts - len(self.attempts)

    @property
    def game_state_dict(self):
        return {
            'attempts_remind': self.attempts_remind,
            'max_color': self.max_color,
            'cell_count': self.cell_count,
            'attempts': self.attempts,
        }
