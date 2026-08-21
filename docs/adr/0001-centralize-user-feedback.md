---
status: accepted
---

# Centralize user feedback at action boundaries

Wage App Web will route feedback for user-initiated actions through one typed frontend facade instead of calling Chakra UI, interpreting Axios errors, or logging independently in each component. The HTTP boundary will normalize failures, while the action boundary will select a contextual Russian message and the appropriate presentation: inline validation, a transient toast, a persistent in-page alert, or an accessible confirmation dialog. This keeps action context out of the interceptor, prevents raw backend details from reaching users, and allows Chakra UI to remain an implementation detail without changing the backend OpenAPI contract.
