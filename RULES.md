# Vortex - Development Rules

## Overview
This document establishes the rules and principles to follow when working on the Vortex REST Client project.

---

## 0. Package Manager (IMPORTANT)

**Always use Yarn, NOT npm**

```bash
# Correct
yarn install
yarn add <package>
yarn dev
yarn build

# Wrong
npm install
npm run dev
```

**Why Yarn?**
- Faster installation
- Better lockfile handling
- Consistent across team
- Required for this project

---

## 1. Always Check CHANGELOG First

Before starting any task:
1. Read `CHANGELOG.md` to understand current project status
2. Review completed features and known issues
3. Understand the current architecture state

---

## 2. SOLID Principles

### Single Responsibility Principle (SRP)
- Each component/function has one reason to change
- Example: `UrlBar.tsx` handles URL input and sending, nothing else

### Open/Closed Principle (OCP)
- Open for extension, closed for modification
- Add new features by extending, not modifying existing code
- Use composition over inheritance

### Liskov Substitution Principle (LSP)
- Subtypes must be substitutable for their base types
- Components should work with any valid implementation

### Interface Segregation Principle (ISP)
- Prefer small, focused interfaces
- Don't force unnecessary dependencies

### Dependency Inversion Principle (DIP)
- Depend on abstractions, not concretions
- Use dependency injection
- Example: Stores define interfaces, components use hooks

---

## 3. KISS (Keep It Simple, Stupid)

- Write simple, readable code
- Avoid unnecessary complexity
- If it's complex, document why
- First make it work, then optimize if needed

---

## 4. Clean Architecture

```
src/
├── domain/           # Business rules (innermost)
│   ├── types/        # Entities and interfaces
│   ├── constants/    # Immutable values
│   └── utils/        # Pure functions
├── application/      # Use cases
│   ├── stores/      # State management (Zustand)
│   └── hooks/        # Reusable logic
├── infrastructure/   # External concerns
│   ├── electron/     # Electron API
│   └── storage/      # LocalStorage
└── components/       # UI (outermost)
    ├── layout/        # TitleBar, BottomBar
    ├── request/      # UrlBar, Editors
    ├── response/     # ResponsePanel
    └── shared/       # Sidebar, TabBar, Panels
```

**Rule**: Dependencies point inward. Inner layers don't know about outer layers.

---

## 5. Refactoring (Martin Fowler)

### When to Refactor
- After completing a feature, refactor if code is messy
- When adding new features is difficult due to existing code
- When you understand the code better

### Safe Refactoring Steps
1. Identify what needs to change
2. Write tests if possible
3. Make small, incremental changes
4. Test after each change
5. Commit after successful refactor

### Key Refactoring Patterns to Use
- **Extract Function**: Long function → smaller functions
- **Rename Variable**: Clear, descriptive names
- **Move Function**: To a more appropriate layer
- **Inline Function**: Replace simple delegation
- **Replace Conditional with Polymorphism**: When many conditions exist

### When NOT to Refactor
- Don't refactor code that works and won't change
- Don't refactor without tests or a way to verify
- Don't mix refactoring with new features (separate commits)

---

## 6. Best Practices

### Naming Conventions
- Components: PascalCase (e.g., `UrlBar.tsx`)
- Functions: camelCase (e.g., `sendRequest`)
- Files: kebab-case for non-components
- Boolean: `isLoading`, `hasError`, `canSend`

### Component Structure
```tsx
// 1. Imports (external, then internal)
// 2. Types/Interfaces
// 3. Helper functions
// 4. Main component
//   - State (if needed)
//   - Effects (if needed)
//   - Event handlers
//   - Render
// 5. Export default
```

### State Management
- Local state: `useState` inside component
- Shared state: Use Zustand stores
- Derived state: Calculate during render, don't duplicate

### Error Handling
- Try-catch for async operations
- User-friendly error messages
- Log errors for debugging

### Testing
- Test happy path first
- Test edge cases
- Test error states

---

## 7. Testing Strategy

### Testing Pyramid

```
        /\
       /  \      E2E Tests (Playwright/Cypress)
      /----\     Few, slow, expensive
     /      \
    /--------\   Integration Tests
   /          \  Medium amount
  /------------\ Unit Tests
 /              \ Many, fast, cheap
```

---

### React + TypeScript Testing (Frontend)

#### Tools
- **Vitest** - Fast unit test runner (use with Vite)
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **MSW** - Mock Service Worker for API mocking

#### Unit Tests (Vitest + React Testing Library)
```typescript
// Test file: components/request/UrlBar.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { UrlBar } from './UrlBar';
import { useRequestStore } from '../../application/stores/requestStore';

// Setup: reset store before each test
beforeEach(() => {
  useRequestStore.setState({
    url: '',
    method: 'GET',
    loading: false,
  });
});

describe('UrlBar', () => {
  it('renders URL input', () => {
    render(<UrlBar />);
    expect(screen.getByPlaceholderText(/https:\/\/api/)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    useRequestStore.setState({ loading: true });
    render(<UrlBar />);
    expect(screen.getByText(/SENDING/)).toBeInTheDocument();
  });

  it('calls send on Enter key', async () => {
    const { container } = render(<UrlBar />);
    const input = container.querySelector('input');
    
    fireEvent.keyDown(input!, { key: 'Enter' });
    // Verify store was called
  });
});
```

#### Test Organization
```
src/
├── components/
│   └── request/
│       ├── UrlBar.tsx
│       └── UrlBar.test.tsx    # Same location
├── application/
│   └── stores/
│       ├── requestStore.ts
│       └── requestStore.test.ts
└── domain/
    └── utils/
        ├── highlight.ts       # Pure function
        └── highlight.test.ts
```

#### What to Test (Priority Order)
1. **Business logic** (domain/utils) - 100% coverage target
2. **Store functions** - Actions, selectors
3. **Utility functions** - Parsing, formatting
4. **Components** - Critical user flows only

#### What NOT to Test
- Implementation details (CSS classes, internal state)
- Third-party libraries
- Simple presentational components

#### Mocking Guidelines
```typescript
// Bad: Over-mocking
vi.mock('../../infrastructure/storage', () => ({
  saveToStorage: vi.fn(),
  loadFromStorage: vi.fn(() => ({ theme: 'cyberpunk' })),
}));

// Good: Mock only what you need, use real store
vi.mock('../../application/stores/requestStore', () => ({
  useRequestStore: vi.fn((selector) => {
    const state = { url: '', method: 'GET', loading: false };
    return selector ? selector(state) : state;
  }),
}));
```

---

### .NET Web API Testing (Backend)

#### Tools
- **xUnit** - Test framework
- **Moq** - Mocking framework
- **FluentAssertions** - Assertion library
- **TestServer** - Integration testing
- **SQLite In-Memory** - Database testing

#### Test Project Structure
```
src/
├── MyApi/
│   ├── Controllers/
│   ├── Services/
│   └── Models/
└── MyApi.Tests/
    ├── Unit/
    │   └── Services/
    │       └── UserServiceTests.cs
    ├── Integration/
    │   └── UserControllerTests.cs
    └── Helpers/
        └── TestDatabase.cs
```

#### Unit Tests (xUnit + Moq)
```csharp
public class UserServiceTests
{
    private readonly Mock<IUserRepository> _userRepo;
    private readonly UserService _service;

    public UserServiceTests()
    {
        _userRepo = new Mock<IUserRepository>();
        _service = new UserService(_userRepo.Object);
    }

    [Fact]
    public async Task GetUserById_ReturnsUser_WhenExists()
    {
        // Arrange
        var userId = 1;
        var expectedUser = new User { Id = 1, Name = "John" };
        _userRepo.Setup(r => r.GetByIdAsync(userId))
            .ReturnsAsync(expectedUser);

        // Act
        var result = await _service.GetUserById(userId);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("John");
    }

    [Fact]
    public async Task GetUserById_ReturnsNull_WhenNotFound()
    {
        // Arrange
        _userRepo.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _service.GetUserById(999);

        // Assert
        result.Should().BeNull();
    }
}
```

#### Integration Tests (TestServer)
```csharp
public class UserControllerTests : IClassFixture<WebApiFactory>
{
    private readonly HttpClient _client;

    public UserControllerTests(WebApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetUsers_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/users");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CreateUser_ReturnsCreated()
    {
        // Arrange
        var newUser = new { Name = "Jane", Email = "jane@test.com" };
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/users", newUser);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}
```

#### Test Database Setup
```csharp
public class TestDatabase : IDisposable
{
    private readonly ApplicationDbContext _context;

    public TestDatabase()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
    }

    public ApplicationDbContext Context => _context;

    public void Dispose() => _context.Dispose();
}
```

---

### Testing Best Practices (Both Frontend & Backend)

#### Test Naming Convention
```
[Method]_[Scenario]_[ExpectedResult]

// Examples:
CreateUser_WithValidData_ReturnsCreatedUser
GetUser_NotFound_ReturnsNull
SendRequest_Timeout_ShowsErrorMessage
```

#### AAA Pattern
```typescript
// Arrange - Set up test data and dependencies
const mockResponse = { status: 200, body: '{}' };

// Act - Execute the behavior being tested
const result = await sendRequest('https://api.test', 'GET');

// Assert - Verify the expected outcome
expect(result.status).toBe(200);
```

#### Test Isolation
- Each test is independent
- No shared state between tests
- Clean up after each test (mock reset, database cleanup)
- Use `beforeEach` to reset state

#### Code Coverage (Guidelines)
| Layer | Target | Reason |
|-------|--------|--------|
| Domain/Utils | 90%+ | Critical business logic |
| Services | 80%+ | Business rules |
| Controllers/API | 70%+ | Integration points |
| UI Components | 50%+ | Focus on critical paths |

#### When to Write Tests
1. **New feature** - Write tests before code (TDD) or after
2. **Bug fix** - Add regression test
3. **Refactor** - Ensure tests pass after

#### When NOT to Write Tests
- Quick prototypes
- Code that will be deleted
- Trivial code (simple getters/setters)

---

### Running Tests

#### Frontend
```bash
# Unit tests
yarn test

# Watch mode
yarn test:watch

# E2E tests
yarn test:e2e

# Coverage
yarn test:coverage
```

#### Backend (.NET)
```bash
# Run all tests
dotnet test

# With coverage
dotnet test --collect:"XPlat Code Coverage"

# Specific test class
dotnet test --filter "FullyQualifiedName~UserServiceTests"
```

---

## 8. Git Workflow

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Be specific: "Fix sidebar resize bug" not "Fix bugs"
- Structure: "type: description"

### Before Commit
1. Run lint/typecheck (if available)
2. Test the app works
3. Review changes

---

## 8. File Structure Template

```
src/
├── components/
│   ├── layout/
│   │   └── TitleBar.tsx       # Header component
│   ├── request/
│   │   ├── UrlBar.tsx         # URL input + send button
│   │   └── ParamsEditor.tsx    # Query params editor
│   └── shared/
│       └── Sidebar.tsx        # History sidebar
├── domain/
│   └── types/index.ts        # All TypeScript interfaces
└── application/
    └── stores/
        └── settingsStore.ts  # Settings state
```

---

## Summary

1. **Check CHANGELOG** before starting
2. **SOLID** principles for design
3. **KISS** - keep code simple
4. **Clean Architecture** - layer properly
5. **Refactor** safely using Martin Fowler patterns
6. **Testing** - Unit, Integration, E2E with proper tools
7. **Best practices** - naming, structure, testing
8. **Git** - clear commits, test before pushing

---

*Last Updated: 2026-03-04*
