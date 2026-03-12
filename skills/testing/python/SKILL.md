---
name: python
description: Testing strategy and patterns. Use when writing, reviewing, or generating tests for any language.
metadata:
  domain: testing
  id: testing/python
  concept: testing
  language: python
  category: engineering
  version: 1.0.0
  category: engineering
  tags: [testing, tdd, unit-testing, mocking]
---

# Testing — Python

## Framework
- **pytest** for all projects. Avoid `unittest` for new code.
- Run: `pytest` / `pytest --cov=src --cov-report=term-missing`

## File Conventions
- Test files: `tests/test_<module>.py` or co-located `src/utils/test_format.py`.
- Conftest: shared fixtures in `tests/conftest.py`.

## Test Structure
```python
def test_format_date_returns_iso_string_for_valid_date():
    # Arrange
    date = datetime(2026, 1, 15)

    # Act
    result = format_date(date)

    # Assert
    assert result == "2026-01-15"
```

## Fixtures
```python
# conftest.py
@pytest.fixture
def db_session():
    session = create_test_session()
    yield session
    session.rollback()
    session.close()

# test file
def test_user_created(db_session):
    user = create_user(db_session, name="Alice")
    assert user.id is not None
```

## Parametrize
```python
@pytest.mark.parametrize("value,expected", [
    ("", True),
    ("  ", True),
    ("hello", False),
])
def test_is_blank(value, expected):
    assert is_blank(value) == expected
```

## Mocking
```python
from unittest.mock import patch, MagicMock

def test_sends_email_on_signup(mock_smtp):
    with patch("myapp.mailer.smtplib.SMTP") as mock_smtp:
        send_welcome_email("user@example.com")
        mock_smtp.return_value.sendmail.assert_called_once()
```

## Coverage Targets
- Business logic: 85%+ branch coverage.
- Run `pytest --cov` in CI; fail below threshold with `--cov-fail-under=80`.
