---
name: java
description: Testing strategy and patterns. Use when writing, reviewing, or generating tests for any language.
metadata:
  domain: testing
  id: testing/java
  concept: testing
  language: java
  category: engineering
  version: 1.0.0
  category: engineering
  tags: [testing, tdd, unit-testing, mocking]
---

# Testing — Java

## Framework
- **JUnit 5** (`@Test`, `@BeforeEach`, `@AfterEach`, `@ParameterizedTest`).
- **Mockito** for mocking.
- Run: `mvn test` / `gradle test`

## Test Structure
```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private PaymentGateway paymentGateway;

    @InjectMocks
    private OrderService orderService;

    @Test
    void shouldThrowOrderExceptionWhenPaymentFails() {
        // Arrange
        when(paymentGateway.charge(any())).thenThrow(new PaymentException("Declined"));

        // Act & Assert
        assertThrows(OrderException.class, () -> orderService.placeOrder(testOrder()));
    }
}
```

## Parameterized Tests
```java
@ParameterizedTest
@ValueSource(strings = {"", " ", "\t"})
void shouldReturnTrueForBlankStrings(String value) {
    assertTrue(StringUtils.isBlank(value));
}
```

## Mocking Rules
- Use `@Mock` and `@InjectMocks` with `MockitoExtension` — avoid `Mockito.mock()` in tests.
- Verify critical interactions: `verify(paymentGateway, times(1)).charge(expectedAmount)`.
- Use `@Captor` to capture and assert arguments passed to mocks.

## Integration Tests
- Annotate with `@SpringBootTest` for full context; `@WebMvcTest` for controller slice only.
- Use an in-memory DB (H2) for repository tests.
- Separate integration tests into `src/integrationTest/` and run in a separate Gradle task.

## Coverage
- Target 80%+ line coverage on service/domain layers.
- Use JaCoCo: `gradle jacocoTestReport` and enforce with `jacocoTestCoverageVerification`.
