"""Independent dense gate matrices via tensor products and projectors.

No use of the pairwise simulator; qubits ordered n..1 in tensor products.
"""
from math import sqrt

I = [[1, 0], [0, 1]]
X = [[0, 1], [1, 0]]
H = [[1/sqrt(2), 1/sqrt(2)], [1/sqrt(2), -1/sqrt(2)]]
P0 = [[1, 0], [0, 0]]
P1 = [[0, 0], [0, 1]]


def kron(a, b):
    return [[a[i // len(b)][j // len(b[0])] * b[i % len(b)][j % len(b[0])]
             for j in range(len(a[0])*len(b[0]))] for i in range(len(a)*len(b))]


def tensor(n, assignments):
    result = [[1]]
    for qubit in range(n, 0, -1):
        result = kron(result, assignments.get(qubit, I))
    return result


def matrix(n, gate):
    if gate.name == 'CX':
        off = tensor(n, {gate.control: P0})
        on = tensor(n, {gate.control: P1, gate.target: X})
        return [[a+b for a,b in zip(x,y)] for x,y in zip(off,on)]
    return tensor(n, {gate.target: {'X': X, 'H': H}[gate.name]})


def run(n, gates):
    state = [1+0j] + [0j]*(2**n-1)
    for gate in gates:
        m = matrix(n, gate)
        state = [sum(a*b for a,b in zip(row,state)) for row in m]
    return state
