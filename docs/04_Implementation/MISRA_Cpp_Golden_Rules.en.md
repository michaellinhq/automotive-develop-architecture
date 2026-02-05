# MISRA C++ Core Rules & Coding Standards

> This document summarizes the most critical violations from MISRA C++:2008 / MISRA C++:2023, with Bad vs Good code examples to help developers write safety-critical software.

---

!!! success "💡 Field Insight from Michael Lin"
    **Background**: MISRA C++ compliance remediation for a production ECU codebase

    **Key Challenges**:

    - Legacy code had **5000+ MISRA violations**, with strong team resistance
    - No prioritization strategy, unclear where to start
    - Deviation process missing, making justified exceptions impossible

    **My Solution**:

    1. Established **“Top 10 critical rules first”** strategy, focusing on high-risk issues
    2. Designed **MISRA deviation management process** with review/approval/traceability
    3. Ran **coding standards workshops** using Bad vs Good examples
    4. Introduced **static analysis CI/CD integration** with zero-tolerance for new issues

    **Quantified Results**:

    | Metric | Before | After | Improvement |
    |:-----|:------:|:------:|:----:|
    | Critical rule violations | 847 | 0 | -100% |
    | Remediation cycle | Estimated 6 months | Actual 2 months | -67% |
    | New code violations | Not monitored | Zero tolerance | ✅ |
    | Team MISRA awareness | Low | High | Significantly improved |

---

## MISRA C++ Overview

### Standard Versions

| Version | Year | Language Standard | Rule Count |
|------|----------|--------------|----------|
| MISRA C++:2008 | 2008 | C++03 | 228 |
| MISRA C++:2023 | 2023 | C++17 | 179 |

### Rule Categories

| Category | Mandatory | Description |
|------|--------|------|
| **Required** | Must comply | Unless formally deviated |
| **Advisory** | Should comply | Best effort |
| **Mandatory** | Must comply | No deviation (MISRA C only) |

---

## 🔴 Rule 1: No Dynamic Memory Allocation

### Rule Summary

| Rule ID | MISRA C++:2008 Rule 18-4-1 |
|---------|----------------------------|
| Category | Required |
| Description | Dynamic heap memory allocation shall not be used |
| Rationale | Dynamic memory leads to fragmentation, exhaustion, and nondeterminism |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: using new/delete
#include <string>
#include <vector>

class SensorData {
public:
    void processData() {
        // ❌ dynamic array
        int* buffer = new int[100];

        // ❌ STL vector (dynamic allocation)
        std::vector<int> readings;
        readings.push_back(42);

        // ❌ std::string (dynamic allocation)
        std::string sensorName = "Temperature";

        // ... process data ...

        delete[] buffer;  // easy to forget!
    }
};
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: static allocation and fixed containers
#include <array>
#include <cstdint>

// Fixed-size string
template<std::size_t N>
class FixedString {
public:
    char data[N];
    std::size_t length;
};

class SensorData {
private:
    static constexpr std::size_t BUFFER_SIZE = 100U;
    std::array<int32_t, BUFFER_SIZE> buffer_;

    static constexpr std::size_t MAX_READINGS = 50U;
    std::array<int32_t, MAX_READINGS> readings_;
    std::size_t readingsCount_;

    FixedString<32> sensorName_;

public:
    SensorData() : readingsCount_(0U) {
        buffer_.fill(0);
        readings_.fill(0);
    }

    bool addReading(int32_t value) {
        bool result = false;
        if (readingsCount_ < MAX_READINGS) {
            readings_[readingsCount_] = value;
            ++readingsCount_;
            result = true;
        }
        return result;
    }
};
```

---

## 🔴 Rule 2: Pointers Must Be Initialized

### Rule Summary

| Rule ID | MISRA C++:2008 Rule 8-5-1 |
|---------|---------------------------|
| Category | Required |
| Description | All variables shall have a defined value before use |
| Rationale | Uninitialized pointers cause undefined behavior |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: uninitialized pointer
void processMessage() {
    uint8_t* msgPtr;           // ❌ uninitialized
    uint32_t* dataBuffer;      // ❌ uninitialized

    if (someCondition()) {
        msgPtr = getMessage();
    }
    // ❌ msgPtr may be uninitialized
    processData(msgPtr);

    // ❌ dataBuffer never initialized
    *dataBuffer = 0x12345678U;  // undefined behavior!
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: initialize all pointers
#include <cstdint>

void processMessage() {
    uint8_t* msgPtr = nullptr;
    uint32_t* dataBuffer = nullptr;

    if (someCondition()) {
        msgPtr = getMessage();
    }

    if (nullptr != msgPtr) {
        processData(msgPtr);
    }

    uint32_t localBuffer = 0U;
    dataBuffer = &localBuffer;
    *dataBuffer = 0x12345678U;
}

// ✅ Better: use reference
void processMessageBetter(const uint8_t& msg) {
    doSomething(msg);
}
```

---

## 🔴 Rule 3: No Implicit Narrowing Conversions

### Rule Summary

| Rule ID | MISRA C++:2008 Rule 5-0-3 |
|---------|---------------------------|
| Category | Required |
| Description | Implicit conversions that lose information shall not be used |
| Rationale | Truncation can cause logic errors |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: implicit narrowing
void calculateSpeed() {
    uint32_t sensorValue = 70000U;

    uint16_t speed = sensorValue;  // ❌ truncates to 4464

    int32_t offset = -100;
    uint32_t result = sensorValue + offset;  // ❌ may overflow

    float temperature = 36.7F;
    int32_t tempInt = temperature;  // ❌ loses 0.7
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: explicit conversion with checks
#include <cstdint>
#include <limits>

void calculateSpeed() {
    uint32_t sensorValue = 70000U;

    uint16_t speed = 0U;
    if (sensorValue <= static_cast<uint32_t>(
            std::numeric_limits<uint16_t>::max())) {
        speed = static_cast<uint16_t>(sensorValue);
    } else {
        speed = std::numeric_limits<uint16_t>::max();
    }

    int32_t offset = -100;
    int32_t signedSensor = static_cast<int32_t>(sensorValue);
    int32_t result = 0;

    if ((offset > 0) || (signedSensor >= -offset)) {
        result = signedSensor + offset;
    }

    float temperature = 36.7F;
    int32_t tempInt = static_cast<int32_t>(temperature + 0.5F);
}
```

---

## 🔴 Rule 4: Avoid goto

### Rule Summary

| Rule ID | MISRA C++:2008 Rule 6-6-1 |
|---------|---------------------------|
| Category | Required |
| Description | Any label referenced by goto shall be declared in the same block |
| Rationale | goto breaks structured flow and is hard to analyze |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: goto usage
Std_ReturnType processFrame(const uint8_t* data, uint32_t len) {
    Std_ReturnType result = E_NOT_OK;

    if (nullptr == data) {
        goto error;
    }

    if (len < MIN_FRAME_SIZE) {
        goto error;
    }

    if (!validateChecksum(data, len)) {
        goto error;
    }

    result = E_OK;

error:
    cleanup();
    return result;
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: structured control flow
Std_ReturnType processFrame(const uint8_t* data, uint32_t len) {
    Std_ReturnType result = E_NOT_OK;
    bool isValid = true;

    if (nullptr == data) {
        isValid = false;
    } else if (len < MIN_FRAME_SIZE) {
        isValid = false;
    } else if (!validateChecksum(data, len)) {
        isValid = false;
    }

    if (isValid) {
        result = E_OK;
    }

    cleanup();
    return result;
}

bool validateFrame(const uint8_t* data, uint32_t len) {
    bool valid = false;

    if ((nullptr != data) &&
        (len >= MIN_FRAME_SIZE) &&
        validateChecksum(data, len)) {
        valid = true;
    }

    return valid;
}

Std_ReturnType processFrameBetter(const uint8_t* data, uint32_t len) {
    Std_ReturnType result = E_NOT_OK;

    if (validateFrame(data, len)) {
        result = doProcessing(data, len);
    }

    cleanup();
    return result;
}
```

---

## 🔴 Rule 5: Avoid Recursion

### Rule Summary

| Rule ID | MISRA C++:2008 Rule 7-5-4 |
|---------|---------------------------|
| Category | Required |
| Description | Functions shall not call themselves, directly or indirectly |
| Rationale | Recursion can cause stack overflow and nondeterminism |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: direct recursion
uint32_t factorial(uint32_t n) {
    if (n <= 1U) {
        return 1U;
    }
    return n * factorial(n - 1U);
}

// ❌ VIOLATION: indirect recursion
void funcA(int32_t depth);
void funcB(int32_t depth);

void funcA(int32_t depth) {
    if (depth > 0) {
        funcB(depth - 1);
    }
}

void funcB(int32_t depth) {
    if (depth > 0) {
        funcA(depth - 1);
    }
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: iterative approach
uint32_t factorial(uint32_t n) {
    uint32_t result = 1U;
    uint32_t i;

    for (i = 2U; i <= n; ++i) {
        if (result > (UINT32_MAX / i)) {
            result = UINT32_MAX;  // saturate
            break;
        }
        result *= i;
    }

    return result;
}

// ✅ COMPLIANT: explicit stack
struct TreeNode {
    int32_t value;
    TreeNode* left;
    TreeNode* right;
};

void traverseTree(TreeNode* root) {
    static constexpr std::size_t MAX_DEPTH = 32U;
    std::array<TreeNode*, MAX_DEPTH> stack;
    std::size_t stackTop = 0U;

    TreeNode* current = root;

    while ((nullptr != current) || (stackTop > 0U)) {
        while (nullptr != current) {
            if (stackTop < MAX_DEPTH) {
                stack[stackTop] = current;
                ++stackTop;
                current = current->left;
            } else {
                current = nullptr;
            }
        }

        if (stackTop > 0U) {
            --stackTop;
            current = stack[stackTop];
            processNode(current);
            current = current->right;
        }
    }
}
```

---

## 🔴 Rule 6: Floating-Point Comparison

### Rule Summary

| Rule ID | MISRA C++:2008 Rule 6-2-2 |
|---------|---------------------------|
| Category | Required |
| Description | Floating-point expressions shall not be tested for equality/inequality |
| Rationale | Floating-point precision makes direct comparison unreliable |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: direct float compare
void checkTemperature(float temp) {
    if (temp == 36.5F) {
        // normal temperature
    }

    if (temp != 0.0F) {
        calculate(temp);
    }

    float a = 0.1F + 0.2F;
    if (a == 0.3F) {
        doSomething();
    }
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: tolerance-based compare
#include <cmath>
#include <cfloat>

bool floatEquals(float a, float b, float epsilon = FLT_EPSILON) {
    float diff = std::fabs(a - b);
    float maxVal = std::fmax(std::fabs(a), std::fabs(b));
    float tolerance = epsilon * std::fmax(1.0F, maxVal);
    return diff <= tolerance;
}

bool floatIsZero(float value, float epsilon = FLT_EPSILON) {
    return std::fabs(value) <= epsilon;
}

void checkTemperature(float temp) {
    if (floatEquals(temp, 36.5F, 0.1F)) {
        // within normal range
    }

    if (!floatIsZero(temp)) {
        calculate(temp);
    }

    if ((temp >= 36.4F) && (temp <= 36.6F)) {
        // within range
    }
}
```

---

## 🔴 Rule 7: Array Bounds Protection

### Rule Summary

| Rule ID | MISRA C++:2008 Rule 5-0-16 |
|---------|----------------------------|
| Category | Required |
| Description | Pointer arithmetic must stay within same array |
| Rationale | Out-of-bounds access corrupts memory |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: no bounds check
void processArray(const int32_t* data, uint32_t index) {
    int32_t value = data[index];
    doSomething(value);
}

void fillBuffer() {
    int32_t buffer[10];

    for (uint32_t i = 0U; i <= 10U; ++i) {  // ❌ should be <
        buffer[i] = static_cast<int32_t>(i);
    }

    uint32_t userIndex = getUserInput();
    buffer[userIndex] = 0;
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: std::array + checks
#include <array>
#include <cstdint>

static constexpr std::size_t BUFFER_SIZE = 10U;

void processArray(const std::array<int32_t, BUFFER_SIZE>& data,
                  std::size_t index) {
    if (index < data.size()) {
        int32_t value = data[index];
        doSomething(value);
    }
}

void fillBuffer() {
    std::array<int32_t, BUFFER_SIZE> buffer{};

    for (std::size_t i = 0U; i < buffer.size(); ++i) {
        buffer[i] = static_cast<int32_t>(i);
    }

    uint32_t userIndex = getUserInput();
    if (userIndex < buffer.size()) {
        buffer[userIndex] = 0;
    } else {
        reportError(ERR_INDEX_OUT_OF_RANGE);
    }
}

template<std::size_t N>
bool safeArrayAccess(std::array<int32_t, N>& arr,
                     std::size_t index,
                     int32_t& outValue) {
    bool success = false;
    if (index < N) {
        outValue = arr[index];
        success = true;
    }
    return success;
}
```

---

## 🔴 Rule 8: Avoid Exceptions

### Rule Summary

| Rule ID | MISRA C++:2008 Rule 15-0-1 |
|---------|----------------------------|
| Category | Document (debatable) |
| Description | Exceptions should not be used for control flow |
| Rationale | Exceptions add overhead and timing nondeterminism |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: exceptions for error handling
#include <stdexcept>

class Sensor {
public:
    int32_t readValue() {
        if (!isConnected_) {
            throw std::runtime_error("Sensor not connected");
        }

        int32_t value = readHardware();
        if (value < 0) {
            throw std::out_of_range("Invalid reading");
        }

        return value;
    }

    void process() {
        try {
            int32_t val = readValue();
            doProcessing(val);
        } catch (const std::exception& e) {
            handleError();
        }
    }
};
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: return codes and status
#include <cstdint>

enum class SensorStatus : uint8_t {
    OK = 0U,
    NOT_CONNECTED = 1U,
    INVALID_READING = 2U,
    TIMEOUT = 3U
};

struct SensorResult {
    SensorStatus status;
    int32_t value;
};

class Sensor {
public:
    SensorResult readValue() {
        SensorResult result = {SensorStatus::OK, 0};

        if (!isConnected_) {
            result.status = SensorStatus::NOT_CONNECTED;
        } else {
            int32_t rawValue = readHardware();
            if (rawValue < 0) {
                result.status = SensorStatus::INVALID_READING;
            } else {
                result.value = rawValue;
            }
        }

        return result;
    }

    SensorStatus readValueAlt(int32_t& outValue) {
        SensorStatus status = SensorStatus::OK;
        outValue = 0;

        if (!isConnected_) {
            status = SensorStatus::NOT_CONNECTED;
        } else {
            int32_t rawValue = readHardware();
            if (rawValue < 0) {
                status = SensorStatus::INVALID_READING;
            } else {
                outValue = rawValue;
            }
        }

        return status;
    }

    void process() {
        SensorResult result = readValue();

        if (SensorStatus::OK == result.status) {
            doProcessing(result.value);
        } else {
            handleError(result.status);
        }
    }

private:
    bool isConnected_;
    int32_t readHardware();
};
```

---

## 🔴 Rule 9: Bitwise Operation Type Safety

### Rule Summary

| Rule ID | MISRA C++:2008 Rule 5-0-10 |
|---------|----------------------------|
| Category | Required |
| Description | Result of ~ and << shall not be implicitly converted to a different type |
| Rationale | Integer promotion can lead to unexpected results |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: unsafe bit ops
void configureRegister() {
    uint8_t mask = 0x0FU;
    uint8_t reg = 0xFFU;

    uint8_t invMask = ~mask;  // implicit promotion/truncation

    uint8_t value = 1U;
    uint8_t shifted = value << 8;  // overflow

    int8_t signedVal = -1;
    int8_t result = signedVal >> 2;  // implementation-defined
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: safe bit ops
#include <cstdint>

void configureRegister() {
    uint8_t mask = 0x0FU;
    uint8_t reg = 0xFFU;

    uint8_t invMask = static_cast<uint8_t>(~static_cast<uint32_t>(mask));

    uint32_t value = 1U;
    uint32_t shifted = value << 8U;

    uint8_t unsignedVal = 0xF0U;
    uint8_t result = unsignedVal >> 2U;

    constexpr uint8_t BIT_0 = (1U << 0U);
    constexpr uint8_t BIT_1 = (1U << 1U);
    constexpr uint8_t BIT_7 = (1U << 7U);

    uint8_t flags = 0U;
    flags |= BIT_0;
    flags &= static_cast<uint8_t>(~BIT_1);

    bool isBit7Set = ((flags & BIT_7) != 0U);
}

// ✅ helpers
template<typename T>
constexpr T setBit(T value, uint8_t bit) {
    static_assert(std::is_unsigned<T>::value, "Must use unsigned type");
    return value | static_cast<T>(1U << bit);
}

template<typename T>
constexpr T clearBit(T value, uint8_t bit) {
    static_assert(std::is_unsigned<T>::value, "Must use unsigned type");
    return value & static_cast<T>(~static_cast<T>(1U << bit));
}
```

---

## 🔴 Rule 10: switch Completeness

### Rule Summary

| Rule ID | MISRA C++:2008 Rule 6-4-6 |
|---------|---------------------------|
| Category | Required |
| Description | Final clause of switch shall be default |
| Rationale | Ensure all cases handled |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: incomplete switch
enum class State : uint8_t {
    IDLE = 0U,
    RUNNING = 1U,
    ERROR = 2U,
    SHUTDOWN = 3U
};

void handleState(State state) {
    switch (state) {
        case State::IDLE:
            doIdle();
            break;
        case State::RUNNING:
            doRunning();
            // ❌ missing break
        case State::ERROR:
            doError();
            break;
        // ❌ missing SHUTDOWN and default
    }
}

void processValue(int32_t value) {
    switch (value) {
        case 1:
            action1();
            break;
        case 2:
            action2();
            break;
        // ❌ no default
    }
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: complete switch
enum class State : uint8_t {
    IDLE = 0U,
    RUNNING = 1U,
    ERROR = 2U,
    SHUTDOWN = 3U
};

void handleState(State state) {
    switch (state) {
        case State::IDLE:
            doIdle();
            break;

        case State::RUNNING:
            doRunning();
            break;

        case State::ERROR:
            doError();
            break;

        case State::SHUTDOWN:
            doShutdown();
            break;

        default:
            handleUnexpectedState();
            break;
    }
}

void processValue(int32_t value) {
    switch (value) {
        case 1:
            action1();
            break;

        case 2:
            action2();
            break;

        default:
            handleUnknownValue(value);
            break;
    }
}

// ✅ Intentional fall-through in C++17
void processWithFallthrough(int32_t level) {
    switch (level) {
        case 3:
            actionLevel3();
            [[fallthrough]];
        case 2:
            actionLevel2();
            [[fallthrough]];
        case 1:
            actionLevel1();
            break;
        default:
            defaultAction();
            break;
    }
}
```

---

## Quick Reference Table

| # | Rule | Severity | Quick Fix |
|---|----------|----------|----------|
| 1 | No dynamic memory | 🔴 High | Use std::array, static allocation |
| 2 | Initialize pointers | 🔴 High | Initialize to nullptr |
| 3 | Avoid implicit narrowing | 🔴 High | static_cast + range check |
| 4 | No goto | 🟡 Medium | Structured if-else |
| 5 | No recursion | 🔴 High | Iteration + explicit stack |
| 6 | No direct float compare | 🔴 High | Use epsilon |
| 7 | Bounds check | 🔴 High | std::array.at() |
| 8 | Avoid exceptions | 🟡 Medium | Error code structs |
| 9 | Bitwise type safety | 🟡 Medium | Unsigned + explicit casts |
| 10 | Complete switch | 🟡 Medium | Add default + break |

---

## Static Analysis Tooling

### Common Tools

| Tool | Standards | Integration |
|------|----------|----------|
| PC-lint Plus | MISRA C++:2008/2023 | IDE plugin, CI/CD |
| Polyspace | MISRA C++:2008 | MATLAB integration |
| QA·C++ | MISRA C++:2008/2023 | Standalone/CI |
| Parasoft C/C++test | MISRA C++:2008 | IDE/CI |
| Clang-Tidy | Partial | Open source/CI |

### CI/CD Example

```yaml
# .gitlab-ci.yml
misra_check:
  stage: static_analysis
  script:
    - pc-lint-plus -b config/pclint.lnt src/*.cpp
    - if [ $? -ne 0 ]; then exit 1; fi
  artifacts:
    reports:
      misra: lint_report.xml
```

---

*Last updated: 2026-01-25*
