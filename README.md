# Library Refactoring Architecture

![CI](https://github.com/rekverr/refactoring_project/actions/workflows/ci-pipeline.yml/badge.svg)
![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=library-refactoring-architecture&metric=alert_status)
![Coverage](https://sonarcloud.io/api/project_badges/measure?project=library-refactoring-architecture&metric=coverage)

University project for **Architecture / Refactoring**. The system models a library with in-memory storage, layered architecture, SOLID principles, GoF patterns, automated tests, coverage reports, CI artifacts and SonarQube/SonarCloud integration.

## Features

- Borrowing books by active readers.
- Returning books with fine calculation.
- Reservation queue with priority calculation.
- User blocking and unblocking.
- Notifications when a book becomes available or a fine is created.
- In-memory repositories without external DB/API dependencies.

## Architecture

Repository structure:

```text
|-- src/
|   |-- models/
|   |-- services/
|   |-- storage/
|   |-- utils/
|-- tests/
|-- docs/
|   |-- diagrams/
|-- .cursor/rules/
|-- .github/workflows/
|-- .cursorrules
|-- Dockerfile
|-- sonar-project.properties
|-- README.md
```

Layers:

- `models` — domain entities.
- `storage` — in-memory repositories.
- `services` — business logic.
- `utils` — errors and date helpers.

Patterns:

- **Strategy**: `FineStrategy` with `StandardFineStrategy`, `ProgressiveFineStrategy`, `StudentFineStrategy`.
- **Observer**: `LibraryEventBus` and `NotificationObserver`.

## Business rules

- Blocked users cannot borrow or reserve books.
- A user cannot exceed the active loan limit.
- Only available books can be borrowed directly.
- Only unavailable books can be reserved.
- Reservation priority depends on role, loyalty points, waiting time and active loans.
- A fine is generated when the return date is later than the due date.

## UML documentation

- [Use Case Diagram](docs/diagrams/use-case.md)
- [Domain Model](docs/diagrams/domain-model.md)
- [Class Diagram](docs/diagrams/class-diagram.md)
- [Architecture](docs/architecture.md)
- [Requirements](docs/requirements.md)

## Local setup

```bash
npm install
npm run build
npm run test:coverage
```

Generated reports:

- `reports/junit/junit.xml`
- `coverage/lcov.info`
- `coverage/cobertura-coverage.xml`
- `coverage/lcov-report/index.html`

## Docker

```bash
docker build -t library-refactoring-architecture .
docker run --rm library-refactoring-architecture
```

## SonarCloud / SonarQube

The project contains `sonar-project.properties` and GitHub Actions integration.

Required GitHub secrets:

- `SONAR_TOKEN`
- `SONAR_ORGANIZATION`
- `SONAR_PROJECT_KEY`

Quality Gate target:

- Coverage: at least 70%.
- Bugs: 0.
- Vulnerabilities: 0.
- Code smells: A or B.

## CI/CD artifacts

After every push or pull request, GitHub Actions uploads a ZIP artifact named `test-coverage-reports` containing:

- HTML coverage report.
- XML coverage report.
- JUnit XML test report.
