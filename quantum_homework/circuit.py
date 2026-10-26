"""Circuit transcribed from browser-visible homework; not an original export."""
from dataclasses import dataclass

@dataclass(frozen=True)
class Gate:
    name: str
    target: int
    control: int = 0

    @property
    def label(self):
        return f'CX{self.control}→{self.target}' if self.name == 'CX' else f'{self.name}{self.target}'

N_QUBITS = 4
GATES = (
    Gate('X', 1), Gate('H', 2), Gate('H', 3), Gate('H', 4),
    Gate('CX', 1, 2), Gate('CX', 3, 4), Gate('CX', 1, 3),
    Gate('CX', 3, 4), Gate('H', 1), Gate('H', 2), Gate('H', 3), Gate('H', 4),
)
