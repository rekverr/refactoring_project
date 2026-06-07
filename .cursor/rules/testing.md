# AI Testing Strategy

Testing stack:
- Jest + ts-jest for TypeScript tests.
- Istanbul coverage through Jest.
- jest-junit for XML test report.

Required reports:
- coverage/lcov.info for SonarQube/SonarCloud.
- coverage/cobertura-coverage.xml for XML coverage artifact.
- coverage/lcov-report/index.html for visual HTML report.
- reports/junit/junit.xml for CI and Sonar integration.

Rules for generated tests:
1. Cover positive, negative and edge cases.
2. Use parametrized tests for many business-rule branches.
3. Mock or replace dependencies when testing service isolation.
4. Keep global coverage above 70%.
5. Prefer meaningful assertions over snapshot-only tests.
