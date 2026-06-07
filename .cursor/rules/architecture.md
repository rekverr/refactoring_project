# AI Architecture Rules

This project uses layered in-memory architecture:
- Models describe domain data only.
- Storage contains in-memory repositories.
- Services contain business logic.
- Utilities contain reusable helpers and domain errors.

Forbidden:
- SQL databases.
- External HTTP APIs.
- Business logic inside repositories.
- Hidden global mutable state.

Required:
- Dependency injection through constructors.
- Repository abstraction for storage.
- Strategy for fine calculation.
- Observer for notifications.
