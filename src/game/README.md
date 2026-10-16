# Gameplay boundary

Put new calculations and choice handling in `logic/`, gameplay progression state
in `state/`, and approved game rules in `rules/`. These are reserved directories,
not a new state-management framework. No Level 1–3 mechanics exist here yet.
Depend on `../shared/contracts/`; do not import cinematic internals.
