"""
Broken Key Protocol — DEL-based Bug Detection PoC
==================================================
Demonstrates how Dynamic Epistemic Logic captures a zero-knowledge
violation in a buggy variant of BKP.

Agents: P (prover), V (verifier)
Keys:   k1, k2  (V owns both; P knows exactly one)
Goal:   P proves it knows one key without revealing WHICH one.

ZK property (phi_ZK):
  V should NOT know whether P has k1 or P has k2 after the protocol.
  In DEL: in the final epistemic model, V's accessibility relation must
  still connect the "P-has-k1" world with the "P-has-k2" world.

Bug:
  Honest P sends just m (the decrypted plaintext).
  Buggy  P also sends the ciphertext it chose to decrypt,
         revealing which key it holds.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Callable, FrozenSet, Set, Dict, Tuple, List

# ---------------------------------------------------------------------------
# 1. ATOMS
# ---------------------------------------------------------------------------
# We represent world-state as a frozenset of true atoms (strings).
# False atoms are simply absent.

# Atoms used in BKP
HAS_P_K1 = "has_P(k1)"   # P holds key k1
HAS_P_K2 = "has_P(k2)"   # P holds key k2
HAS_V_K1 = "has_V(k1)"   # V holds key k1  (always true in our scenario)
HAS_V_K2 = "has_V(k2)"   # V holds key k2  (always true)
HAS_V_M  = "has_V(m)"    # V has seen the plaintext m back from P
# The "extra leak" atom — only present in buggy send
LEAKED_WHICH = "V_knows_which_key"

World = FrozenSet[str]


# ---------------------------------------------------------------------------
# 2. EPISTEMIC MODEL
# ---------------------------------------------------------------------------

@dataclass
class EpistemicModel:
    """
    ℳ = ⟨W, {R_i}, ev⟩

    worlds       : set of possible worlds (each a frozenset of true atoms)
    access       : access[agent][world] = set of worlds agent can't
                   distinguish from `world`  (reflexive by construction)
    actual_world : the world that is actually true (for display/checking)
    """
    worlds: Set[World]
    access: Dict[str, Dict[World, Set[World]]]
    actual_world: World

    # -- Formula evaluation -------------------------------------------------

    def holds(self, formula: Callable[["EpistemicModel", World], bool],
              world: World) -> bool:
        return formula(self, world)

    def valid(self, formula: Callable[["EpistemicModel", World], bool]) -> bool:
        """True iff formula holds in every world."""
        return all(formula(self, w) for w in self.worlds)

    def holds_at_actual(self, formula) -> bool:
        return self.holds(formula, self.actual_world)

    # -- Introspection helpers ----------------------------------------------

    def v_can_distinguish(self, w1: World, w2: World) -> bool:
        return w2 not in self.access["V"][w1]

    def print_accessibility(self, agent: str):
        print(f"\n  {agent} accessibility relation:")
        for w, reachable in self.access[agent].items():
            label_w  = world_label(w)
            labels_r = [world_label(r) for r in reachable]
            print(f"    {label_w:30s} ~{agent}~ {labels_r}")


# ---------------------------------------------------------------------------
# 3. ACTION MODEL
# ---------------------------------------------------------------------------

@dataclass
class ActionModel:
    """
    𝔄 = ⟨A, ≈, pre, post⟩

    events        : list of event names
    indisting     : indisting[agent] = set of (e1, e2) pairs that agent
                    cannot distinguish
    precondition  : precondition[event](world_atoms) -> bool
    postcondition : postcondition[event] = set of atoms to ADD to the world
                    (simplified: we only model monotone additions here)
    """
    events: List[str]
    indisting: Dict[str, Set[Tuple[str, str]]]
    precondition: Dict[str, Callable[[World], bool]]
    postcondition: Dict[str, Set[str]]   # atoms that become true after event


# ---------------------------------------------------------------------------
# 4. MODEL UPDATE  ℳ ⊗ 𝔄
# ---------------------------------------------------------------------------

def model_update(M: EpistemicModel, A: ActionModel) -> EpistemicModel:
    """
    Produces a new epistemic model 𝔄 ∘ ℳ.

    New worlds = {(w, e) : w ∈ M.worlds, e ∈ A.events, pre(e) holds at w}
    New atoms  = atoms(w) ∪ post(e)
    New access : (w1,e1) ~_i (w2,e2)  iff  w1 ~_i w2  AND  (e1,e2) ∈ ≈_i
    Actual     = (M.actual_world, event whose precondition holds there)
                 — we pick the first matching event as the "real" one.
    """
    # Build new world-pairs and their atom sets
    new_world_pairs: List[Tuple[World, str]] = []
    new_world_atoms: Dict[Tuple[World, str], World] = {}

    for w in M.worlds:
        for e in A.events:
            if A.precondition[e](w):
                new_atoms = frozenset(w | A.postcondition[e])
                new_world_pairs.append((w, e))
                new_world_atoms[(w, e)] = new_atoms

    new_worlds = set(new_world_atoms.values())

    # Build new accessibility
    agents = list(M.access.keys())
    new_access: Dict[str, Dict[World, Set[World]]] = {
        ag: {nw: set() for nw in new_worlds} for ag in agents
    }

    for (w1, e1) in new_world_pairs:
        for (w2, e2) in new_world_pairs:
            for ag in agents:
                # w1 ~_ag w2  in old model
                old_indist = w2 in M.access[ag][w1]
                # e1 ~_ag e2  in action model
                act_indist = (e1, e2) in A.indisting[ag] or (e2, e1) in A.indisting[ag]
                if old_indist and act_indist:
                    nw1 = new_world_atoms[(w1, e1)]
                    nw2 = new_world_atoms[(w2, e2)]
                    new_access[ag][nw1].add(nw2)
                    new_access[ag][nw2].add(nw1)

    # Determine actual world
    actual_pair = None
    for e in A.events:
        if A.precondition[e](M.actual_world):
            actual_pair = (M.actual_world, e)
            break
    new_actual = new_world_atoms[actual_pair]

    return EpistemicModel(
        worlds=new_worlds,
        access=new_access,
        actual_world=new_actual,
    )


# ---------------------------------------------------------------------------
# 5. EPISTEMIC FORMULAS
# ---------------------------------------------------------------------------

def atom(a: str):
    """Atomic formula: true iff atom a is in the world."""
    def f(M: EpistemicModel, w: World) -> bool:
        return a in w
    f.__name__ = a
    return f

def neg(phi):
    def f(M, w): return not phi(M, w)
    f.__name__ = f"¬{phi.__name__}"
    return f

def conj(phi, psi):
    def f(M, w): return phi(M, w) and psi(M, w)
    f.__name__ = f"({phi.__name__} ∧ {psi.__name__})"
    return f

def disj(phi, psi):
    def f(M, w): return phi(M, w) or psi(M, w)
    f.__name__ = f"({phi.__name__} ∨ {psi.__name__})"
    return f

def K(agent: str, phi):
    """K_agent(phi): agent knows phi — true iff phi holds in all accessible worlds."""
    def f(M: EpistemicModel, w: World) -> bool:
        return all(phi(M, w2) for w2 in M.access[agent][w])
    f.__name__ = f"K_{agent}({phi.__name__})"
    return f

# BKP security goals
phi_has_P_k1  = atom(HAS_P_K1)
phi_has_P_k2  = atom(HAS_P_K2)

# ZK: V should NOT know whether P has k1 or P has k2
phi_ZK = conj(
    neg(K("V", phi_has_P_k1)),
    neg(K("V", phi_has_P_k2))
)
phi_ZK.__name__ = "ZK: ¬K_V(has_P_k1) ∧ ¬K_V(has_P_k2)"

# PoK: V knows P has at least one key
phi_PoK = K("V", disj(phi_has_P_k1, phi_has_P_k2))
phi_PoK.__name__ = "PoK: K_V(has_P_k1 ∨ has_P_k2)"


# ---------------------------------------------------------------------------
# 6. INITIAL EPISTEMIC MODEL  ℐ_BKP
# ---------------------------------------------------------------------------

def build_initial_model() -> EpistemicModel:
    """
    Three worlds:
      w_k1 : P has k1  (and V has both — always)
      w_k2 : P has k2
      w_no : P has neither key

    P can distinguish all three (self-loops only for P).
    V cannot distinguish any of them — V sees the same state from outside.
    Actual world: P has k1 (our running scenario).
    """
    base = frozenset({HAS_V_K1, HAS_V_K2})
    w_k1 = base | {HAS_P_K1}
    w_k2 = base | {HAS_P_K2}
    w_no = base

    worlds = {w_k1, w_k2, w_no}

    # P knows which world it's in → only self-loops
    access_P = {w: {w} for w in worlds}

    # V cannot distinguish any world → full relation
    access_V = {w: set(worlds) for w in worlds}

    return EpistemicModel(
        worlds=worlds,
        access={"P": access_P, "V": access_V},
        actual_world=w_k1,
    )


# ---------------------------------------------------------------------------
# 7. ACTION MODELS FOR BKP
# ---------------------------------------------------------------------------

def build_honest_send_action() -> ActionModel:
    """
    Honest P sends just m back to V.

    Two events (from V's perspective):
      e_k1 : P decrypted using k1  (pre: P has k1)
      e_k2 : P decrypted using k2  (pre: P has k2)

    V CANNOT distinguish e_k1 from e_k2 — both look like "V receives m".
    P CAN distinguish them (P knows which key it used).
    Post: V now has m in both cases.
    """
    events = ["send_m_via_k1", "send_m_via_k2"]

    indisting = {
        "P": {("send_m_via_k1", "send_m_via_k1"),
              ("send_m_via_k2", "send_m_via_k2")},  # P knows which it did
        "V": {("send_m_via_k1", "send_m_via_k1"),
              ("send_m_via_k2", "send_m_via_k2"),
              ("send_m_via_k1", "send_m_via_k2"),    # V can't tell apart
              ("send_m_via_k2", "send_m_via_k1")},
    }

    pre = {
        "send_m_via_k1": lambda w: HAS_P_K1 in w,
        "send_m_via_k2": lambda w: HAS_P_K2 in w,
    }

    post = {
        "send_m_via_k1": {HAS_V_M},
        "send_m_via_k2": {HAS_V_M},
    }

    return ActionModel(events=events, indisting=indisting,
                       precondition=pre, postcondition=post)


def build_buggy_send_action() -> ActionModel:
    """
    BUGGY P leaks which ciphertext it decrypted alongside m.
    e.g. sends (m, "I used enc(k1,m)") or (m, "I used enc(k2,m)").

    Now V CAN distinguish the two events — the extra info collapses
    V's indistinguishability.
    Post: also adds LEAKED_WHICH to the world.
    """
    events = ["send_m_via_k1", "send_m_via_k2"]

    indisting = {
        "P": {("send_m_via_k1", "send_m_via_k1"),
              ("send_m_via_k2", "send_m_via_k2")},
        "V": {("send_m_via_k1", "send_m_via_k1"),
              ("send_m_via_k2", "send_m_via_k2")},   # V NOW distinguishes!
    }

    pre = {
        "send_m_via_k1": lambda w: HAS_P_K1 in w,
        "send_m_via_k2": lambda w: HAS_P_K2 in w,
    }

    post = {
        "send_m_via_k1": {HAS_V_M, LEAKED_WHICH},
        "send_m_via_k2": {HAS_V_M, LEAKED_WHICH},
    }

    return ActionModel(events=events, indisting=indisting,
                       precondition=pre, postcondition=post)


# ---------------------------------------------------------------------------
# 8. HELPERS
# ---------------------------------------------------------------------------

def world_label(w: World) -> str:
    parts = []
    if HAS_P_K1 in w:    parts.append("P:k1")
    if HAS_P_K2 in w:    parts.append("P:k2")
    if HAS_V_K1 in w:    parts.append("V:k1")
    if HAS_V_K2 in w:    parts.append("V:k2")
    if HAS_V_M  in w:    parts.append("V:m")
    if LEAKED_WHICH in w: parts.append("LEAKED")
    return "{" + ", ".join(parts) + "}" if parts else "{∅}"

def check_and_report(label: str, M: EpistemicModel, formulas):
    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"{'='*60}")
    print(f"  Worlds ({len(M.worlds)}):")
    for w in sorted(M.worlds, key=world_label):
        marker = " <-- actual" if w == M.actual_world else ""
        print(f"    {world_label(w)}{marker}")

    M.print_accessibility("V")

    print(f"\n  Formula evaluation at actual world:")
    all_ok = True
    for phi in formulas:
        result = M.holds_at_actual(phi)
        status = "PASS" if result else "FAIL"
        symbol = "✓" if result else "✗"
        print(f"    [{status}] {symbol}  {phi.__name__}")
        if not result:
            all_ok = False

    if not all_ok:
        print(f"\n  *** BUG DETECTED ***")
        print(f"  V's accessibility at actual world:")
        accessible = M.access["V"][M.actual_world]
        print(f"    V can see: {[world_label(w) for w in accessible]}")
        can_distinguish = [
            (world_label(w1), world_label(w2))
            for w1 in M.worlds for w2 in M.worlds
            if w1 != w2 and M.v_can_distinguish(w1, w2)
        ]
        if can_distinguish:
            print(f"  V CAN now distinguish:")
            seen = set()
            for a, b in can_distinguish:
                pair = tuple(sorted([a, b]))
                if pair not in seen:
                    seen.add(pair)
                    print(f"    {pair[0]}  vs  {pair[1]}")


# ---------------------------------------------------------------------------
# 9. MAIN DEMO
# ---------------------------------------------------------------------------

def main():
    print("\n" + "="*60)
    print("  BKP — DEL Bug Detection PoC")
    print("  Checking zero-knowledge property (phi_ZK) and")
    print("  proof-of-knowledge (phi_PoK) after P's final send.")
    print("="*60)

    formulas = [phi_ZK, phi_PoK]

    # -- Build initial model
    M0 = build_initial_model()
    print(f"\n[Initial model] {len(M0.worlds)} worlds.")
    print("  V cannot distinguish P-has-k1 / P-has-k2 / P-has-neither.")

    # -- Honest run
    honest_action = build_honest_send_action()
    M_honest = model_update(M0, honest_action)
    check_and_report("HONEST BKP — after correct final send", M_honest, formulas)

    # -- Buggy run
    buggy_action = build_buggy_send_action()
    M_buggy = model_update(M0, buggy_action)
    check_and_report("BUGGY BKP — P leaks which ciphertext it used", M_buggy, formulas)

    print(f"\n{'='*60}")
    print("  Summary")
    print(f"{'='*60}")
    print("  Honest:  ZK holds — V still cannot tell which key P has.")
    print("  Buggy:   ZK FAILS — V's accessibility collapses,")
    print("           worlds become distinguishable by key identity.")
    print()


if __name__ == "__main__":
    main()