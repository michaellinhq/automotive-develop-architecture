# MISRA C++ 核心规则与代码规范

> 本文档汇总 MISRA C++:2008 / MISRA C++:2023 中最致命的违规项，提供 Bad Code vs Good Code 对比，帮助开发者编写安全关键软件。

---

!!! success "💡 Michael Lin 的实战经验"
    **项目背景**: 某 ECU 量产代码 MISRA C++ 合规整改
    
    **核心挑战**: 
    
    - 遗留代码存在 **5000+ MISRA 违规**，开发团队抵触情绪严重
    - 缺乏优先级策略，团队不知道从何处着手
    - Deviation 管理流程缺失，导致合理豁免无法落地
    
    **我的解决方案**:
    
    1. 制定 **"10 条致命规则优先"** 策略，聚焦动态内存、未初始化指针等高风险违规
    2. 设计 **MISRA Deviation 管理流程**，建立评审-审批-追踪机制
    3. 组织 **代码规范培训 Workshop**，用 Bad vs Good 实例提升团队意识
    4. 引入 **静态分析 CI/CD 集成**，增量代码零容忍策略
    
    **量化成果**:
    
    | 指标 | 改进前 | 改进后 | 提升 |
    |:-----|:------:|:------:|:----:|
    | 致命规则违规 | 847 | 0 | -100% |
    | 整改周期 | 预估 6 个月 | 实际 2 个月 | -67% |
    | 增量代码违规 | 未监控 | 零容忍 | ✅ |
    | 团队 MISRA 认知 | 低 | 高 | 显著提升 |

---

## MISRA C++ 概述

### 标准版本

| 版本 | 发布年份 | 基于语言标准 | 规则数量 |
|------|----------|--------------|----------|
| MISRA C++:2008 | 2008 | C++03 | 228 |
| MISRA C++:2023 | 2023 | C++17 | 179 |

### 规则分类

| 类别 | 强制性 | 描述 |
|------|--------|------|
| **Required** | 必须遵守 | 除非有正式偏离流程 |
| **Advisory** | 建议遵守 | 应尽量遵守 |
| **Mandatory** | 强制遵守 | 不允许偏离 (仅 MISRA C) |

---

## 🔴 Rule 1: 禁止动态内存分配

### 规则说明

| 规则 ID | MISRA C++:2008 Rule 18-4-1 |
|---------|----------------------------|
| 分类 | Required |
| 描述 | Dynamic heap memory allocation shall not be used |
| 原理 | 动态内存可能导致碎片化、耗尽、不确定性延迟 |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: 使用 new/delete 动态分配
#include <string>
#include <vector>

class SensorData {
public:
    void processData() {
        // ❌ 动态分配数组
        int* buffer = new int[100];
        
        // ❌ 使用 STL 容器 (内部动态分配)
        std::vector<int> readings;
        readings.push_back(42);
        
        // ❌ 使用 std::string (内部动态分配)
        std::string sensorName = "Temperature";
        
        // ... 处理数据 ...
        
        delete[] buffer;  // 可能忘记释放!
    }
};
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: 使用静态分配和固定容器
#include <array>
#include <cstdint>

// 固定大小的字符串替代
template<std::size_t N>
class FixedString {
public:
    char data[N];
    std::size_t length;
};

class SensorData {
private:
    // ✅ 编译时确定大小的数组
    static constexpr std::size_t BUFFER_SIZE = 100U;
    std::array<int32_t, BUFFER_SIZE> buffer_;
    
    // ✅ 固定容量容器
    static constexpr std::size_t MAX_READINGS = 50U;
    std::array<int32_t, MAX_READINGS> readings_;
    std::size_t readingsCount_;
    
    // ✅ 固定长度字符串
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

## 🔴 Rule 2: 指针必须初始化

### 规则说明

| 规则 ID | MISRA C++:2008 Rule 8-5-1 |
|---------|---------------------------|
| 分类 | Required |
| 描述 | All variables shall have a defined value before use |
| 原理 | 未初始化指针访问导致未定义行为 |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: 未初始化的指针
void processMessage() {
    uint8_t* msgPtr;           // ❌ 未初始化
    uint32_t* dataBuffer;      // ❌ 未初始化
    
    if (someCondition()) {
        msgPtr = getMessage();
    }
    // ❌ msgPtr 可能未初始化就使用
    processData(msgPtr);
    
    // ❌ dataBuffer 从未初始化
    *dataBuffer = 0x12345678U;  // 未定义行为!
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: 所有指针在声明时初始化
#include <cstdint>

void processMessage() {
    // ✅ 初始化为 nullptr
    uint8_t* msgPtr = nullptr;
    uint32_t* dataBuffer = nullptr;
    
    if (someCondition()) {
        msgPtr = getMessage();
    }
    
    // ✅ 使用前检查
    if (nullptr != msgPtr) {
        processData(msgPtr);
    }
    
    // ✅ 分配后再使用
    uint32_t localBuffer = 0U;
    dataBuffer = &localBuffer;
    *dataBuffer = 0x12345678U;
}

// ✅ 更好的做法：使用引用而非指针
void processMessageBetter(const uint8_t& msg) {
    // 引用必须初始化，无法为 null
    doSomething(msg);
}
```

---

## 🔴 Rule 3: 禁止隐式类型转换 (Narrowing)

### 规则说明

| 规则 ID | MISRA C++:2008 Rule 5-0-3 |
|---------|---------------------------|
| 分类 | Required |
| 描述 | Implicit conversions which may result in loss of information shall not be used |
| 原理 | 数据截断可能导致逻辑错误 |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: 隐式窄化转换
void calculateSpeed() {
    uint32_t sensorValue = 70000U;
    
    // ❌ 隐式截断: uint32 -> uint16 (值变为 4464)
    uint16_t speed = sensorValue;
    
    // ❌ 有符号/无符号混合
    int32_t offset = -100;
    uint32_t result = sensorValue + offset;  // ❌ 可能溢出
    
    // ❌ 浮点转整数丢失精度
    float temperature = 36.7F;
    int32_t tempInt = temperature;  // ❌ 丢失 0.7
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: 显式转换并验证
#include <cstdint>
#include <limits>

void calculateSpeed() {
    uint32_t sensorValue = 70000U;
    
    // ✅ 显式检查范围后转换
    uint16_t speed = 0U;
    if (sensorValue <= static_cast<uint32_t>(
            std::numeric_limits<uint16_t>::max())) {
        speed = static_cast<uint16_t>(sensorValue);
    } else {
        // 处理溢出情况
        speed = std::numeric_limits<uint16_t>::max();
    }
    
    // ✅ 使用相同符号类型
    int32_t offset = -100;
    int32_t signedSensor = static_cast<int32_t>(sensorValue);
    int32_t result = 0;
    
    // ✅ 检查是否会溢出
    if ((offset > 0) || 
        (signedSensor >= -offset)) {
        result = signedSensor + offset;
    }
    
    // ✅ 显式四舍五入
    float temperature = 36.7F;
    int32_t tempInt = static_cast<int32_t>(temperature + 0.5F);
}
```

---

## 🔴 Rule 4: 禁止使用 goto 语句

### 规则说明

| 规则 ID | MISRA C++:2008 Rule 6-6-1 |
|---------|---------------------------|
| 分类 | Required |
| 描述 | Any label referenced by a goto statement shall be declared in the same block |
| 原理 | goto 破坏结构化流程，难以分析 |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: 使用 goto
Std_ReturnType processFrame(const uint8_t* data, uint32_t len) {
    Std_ReturnType result = E_NOT_OK;
    
    if (nullptr == data) {
        goto error;  // ❌ goto 跳转
    }
    
    if (len < MIN_FRAME_SIZE) {
        goto error;  // ❌ goto 跳转
    }
    
    if (!validateChecksum(data, len)) {
        goto error;  // ❌ goto 跳转
    }
    
    // 处理数据...
    result = E_OK;
    
error:
    cleanup();
    return result;
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: 使用结构化控制流
Std_ReturnType processFrame(const uint8_t* data, uint32_t len) {
    Std_ReturnType result = E_NOT_OK;
    bool isValid = true;
    
    // ✅ 使用 if-else 链
    if (nullptr == data) {
        isValid = false;
    } else if (len < MIN_FRAME_SIZE) {
        isValid = false;
    } else if (!validateChecksum(data, len)) {
        isValid = false;
    } else {
        // 所有检查通过
    }
    
    if (isValid) {
        // 处理数据...
        result = E_OK;
    }
    
    // ✅ 单一清理点
    cleanup();
    
    return result;  // ✅ 单一出口点
}

// ✅ 更好的做法：提取验证函数
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

## 🔴 Rule 5: 避免递归

### 规则说明

| 规则 ID | MISRA C++:2008 Rule 7-5-4 |
|---------|---------------------------|
| 分类 | Required |
| 描述 | Functions shall not call themselves, either directly or indirectly |
| 原理 | 递归可能导致栈溢出，不可预测的内存使用 |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: 直接递归
uint32_t factorial(uint32_t n) {
    if (n <= 1U) {
        return 1U;
    }
    return n * factorial(n - 1U);  // ❌ 递归调用
}

// ❌ VIOLATION: 间接递归
void funcA(int32_t depth);
void funcB(int32_t depth);

void funcA(int32_t depth) {
    if (depth > 0) {
        funcB(depth - 1);  // ❌ 调用 B
    }
}

void funcB(int32_t depth) {
    if (depth > 0) {
        funcA(depth - 1);  // ❌ 调用 A，形成间接递归
    }
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: 使用迭代替代递归
uint32_t factorial(uint32_t n) {
    uint32_t result = 1U;
    uint32_t i;
    
    // ✅ 迭代计算
    for (i = 2U; i <= n; ++i) {
        // ✅ 检查溢出
        if (result > (UINT32_MAX / i)) {
            result = UINT32_MAX;  // 饱和处理
            break;
        }
        result *= i;
    }
    
    return result;
}

// ✅ COMPLIANT: 使用显式栈替代递归
struct TreeNode {
    int32_t value;
    TreeNode* left;
    TreeNode* right;
};

void traverseTree(TreeNode* root) {
    // ✅ 使用显式栈
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
                // 栈满，停止遍历
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

## 🔴 Rule 6: 浮点数比较

### 规则说明

| 规则 ID | MISRA C++:2008 Rule 6-2-2 |
|---------|---------------------------|
| 分类 | Required |
| 描述 | Floating-point expressions shall not be tested for equality or inequality |
| 原理 | 浮点数精度问题导致直接比较不可靠 |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: 浮点数直接比较
void checkTemperature(float temp) {
    // ❌ 直接相等比较
    if (temp == 36.5F) {
        // 正常体温
    }
    
    // ❌ 直接不等比较
    if (temp != 0.0F) {
        calculate(temp);
    }
    
    float a = 0.1F + 0.2F;
    // ❌ 可能失败! 0.1 + 0.2 != 0.3 (浮点精度)
    if (a == 0.3F) {
        doSomething();
    }
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: 使用容差比较
#include <cmath>
#include <cfloat>

// ✅ 定义比较函数
bool floatEquals(float a, float b, float epsilon = FLT_EPSILON) {
    float diff = std::fabs(a - b);
    
    // 使用相对容差和绝对容差
    float maxVal = std::fmax(std::fabs(a), std::fabs(b));
    float tolerance = epsilon * std::fmax(1.0F, maxVal);
    
    return diff <= tolerance;
}

bool floatIsZero(float value, float epsilon = FLT_EPSILON) {
    return std::fabs(value) <= epsilon;
}

void checkTemperature(float temp) {
    // ✅ 使用容差比较
    if (floatEquals(temp, 36.5F, 0.1F)) {
        // 正常体温 (±0.1 度容差)
    }
    
    // ✅ 检查是否接近零
    if (!floatIsZero(temp)) {
        calculate(temp);
    }
    
    // ✅ 对于精确值，使用范围比较
    if ((temp >= 36.4F) && (temp <= 36.6F)) {
        // 在正常范围内
    }
}
```

---

## 🔴 Rule 7: 数组越界防护

### 规则说明

| 规则 ID | MISRA C++:2008 Rule 5-0-16 |
|---------|----------------------------|
| 分类 | Required |
| 描述 | A pointer operand and any pointer resulting from pointer arithmetic shall both address elements of the same array |
| 原理 | 数组越界导致内存损坏 |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: 缺少边界检查
void processArray(const int32_t* data, uint32_t index) {
    // ❌ 不知道数组大小，无法验证
    int32_t value = data[index];
    doSomething(value);
}

void fillBuffer() {
    int32_t buffer[10];
    
    // ❌ 越界写入
    for (uint32_t i = 0U; i <= 10U; ++i) {  // ❌ <= 应为 <
        buffer[i] = static_cast<int32_t>(i);
    }
    
    // ❌ 使用用户输入的索引
    uint32_t userIndex = getUserInput();
    buffer[userIndex] = 0;  // ❌ 可能越界
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: 使用 std::array 和边界检查
#include <array>
#include <cstdint>

static constexpr std::size_t BUFFER_SIZE = 10U;

// ✅ 传递数组引用，编译时已知大小
void processArray(const std::array<int32_t, BUFFER_SIZE>& data, 
                  std::size_t index) {
    // ✅ 边界检查
    if (index < data.size()) {
        int32_t value = data[index];  // ✅ 或使用 data.at(index)
        doSomething(value);
    }
}

void fillBuffer() {
    std::array<int32_t, BUFFER_SIZE> buffer{};
    
    // ✅ 使用 size() 确保不越界
    for (std::size_t i = 0U; i < buffer.size(); ++i) {
        buffer[i] = static_cast<int32_t>(i);
    }
    
    // ✅ 验证用户输入
    uint32_t userIndex = getUserInput();
    if (userIndex < buffer.size()) {
        buffer[userIndex] = 0;
    } else {
        // 处理无效索引
        reportError(ERR_INDEX_OUT_OF_RANGE);
    }
}

// ✅ 使用模板确保编译时安全
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

## 🔴 Rule 8: 禁止使用异常

### 规则说明

| 规则 ID | MISRA C++:2008 Rule 15-0-1 |
|---------|----------------------------|
| 分类 | Document (有争议) |
| 描述 | Exceptions should not be used for control flow |
| 原理 | 异常的资源开销和时序不确定性 |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: 使用异常处理错误
#include <stdexcept>

class Sensor {
public:
    int32_t readValue() {
        if (!isConnected_) {
            throw std::runtime_error("Sensor not connected");  // ❌
        }
        
        int32_t value = readHardware();
        if (value < 0) {
            throw std::out_of_range("Invalid reading");  // ❌
        }
        
        return value;
    }
    
    void process() {
        try {  // ❌ try-catch 块
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
// ✅ COMPLIANT: 使用返回值和错误码
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
    // ✅ 返回结果结构体
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
    
    // ✅ 另一种方式：输出参数
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
        
        // ✅ 显式错误处理
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

## 🔴 Rule 9: 位操作符类型要求

### 规则说明

| 规则 ID | MISRA C++:2008 Rule 5-0-10 |
|---------|----------------------------|
| 分类 | Required |
| 描述 | The result of the ~ and << operators shall not be implicitly converted to a different underlying type |
| 原理 | 整数提升可能导致意外结果 |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: 位操作符使用不当
void configureRegister() {
    uint8_t mask = 0x0FU;
    uint8_t reg = 0xFFU;
    
    // ❌ ~ 操作符导致整数提升到 int
    // ~mask = 0xFFFFFFF0 (32位), 赋值给 uint8_t 截断
    uint8_t invMask = ~mask;  // 结果正确但有隐式转换
    
    // ❌ 左移可能溢出
    uint8_t value = 1U;
    uint8_t shifted = value << 8;  // ❌ 溢出
    
    // ❌ 有符号数的位操作
    int8_t signedVal = -1;
    int8_t result = signedVal >> 2;  // ❌ 实现定义的行为
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: 安全的位操作
#include <cstdint>

void configureRegister() {
    uint8_t mask = 0x0FU;
    uint8_t reg = 0xFFU;
    
    // ✅ 显式转换，保证结果在目标类型范围内
    uint8_t invMask = static_cast<uint8_t>(~static_cast<uint32_t>(mask));
    
    // ✅ 使用足够宽的类型
    uint32_t value = 1U;
    uint32_t shifted = value << 8U;  // ✅ 不会溢出
    
    // ✅ 只对无符号类型使用位操作
    uint8_t unsignedVal = 0xF0U;
    uint8_t result = unsignedVal >> 2U;  // ✅ 明确定义
    
    // ✅ 使用位域宏确保安全
    constexpr uint8_t BIT_0 = (1U << 0U);
    constexpr uint8_t BIT_1 = (1U << 1U);
    constexpr uint8_t BIT_7 = (1U << 7U);
    
    uint8_t flags = 0U;
    flags |= BIT_0;  // 设置位
    flags &= static_cast<uint8_t>(~BIT_1);  // 清除位
    
    bool isBit7Set = ((flags & BIT_7) != 0U);  // 测试位
}

// ✅ 安全的位操作辅助函数
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

## 🔴 Rule 10: switch 语句完整性

### 规则说明

| 规则 ID | MISRA C++:2008 Rule 6-4-6 |
|---------|---------------------------|
| 分类 | Required |
| 描述 | The final clause of a switch statement shall be the default clause |
| 原理 | 确保所有情况都被处理 |

### ❌ Bad Code

```cpp
// ❌ VIOLATION: switch 不完整
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
            // ❌ 缺少 break，会 fall-through
        case State::ERROR:
            doError();
            break;
        // ❌ 没有处理 SHUTDOWN
        // ❌ 没有 default
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
        // ❌ 没有 default 处理其他值
    }
}
```

### ✅ Good Code

```cpp
// ✅ COMPLIANT: 完整的 switch 语句
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
            break;  // ✅ 显式 break
            
        case State::ERROR:
            doError();
            break;
            
        case State::SHUTDOWN:  // ✅ 处理所有枚举值
            doShutdown();
            break;
            
        default:
            // ✅ 防御性编程：处理意外值
            // 这对于枚举可能由外部输入填充的情况很重要
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
            
        default:  // ✅ 必须有 default
            // 记录日志或处理未预期的值
            handleUnknownValue(value);
            break;
    }
}

// ✅ 对于故意的 fall-through，使用属性标注 (C++17)
void processWithFallthrough(int32_t level) {
    switch (level) {
        case 3:
            actionLevel3();
            [[fallthrough]];  // ✅ 显式标注意图
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

## 规则速查表

| # | 规则要点 | 严重程度 | 快速修复 |
|---|----------|----------|----------|
| 1 | 禁止动态内存 | 🔴 高 | 使用 std::array, 静态分配 |
| 2 | 指针必须初始化 | 🔴 高 | 声明时 = nullptr |
| 3 | 避免隐式窄化 | 🔴 高 | static_cast + 范围检查 |
| 4 | 禁止 goto | 🟡 中 | 使用结构化 if-else |
| 5 | 禁止递归 | 🔴 高 | 使用迭代 + 显式栈 |
| 6 | 浮点不直接比较 | 🔴 高 | 使用 epsilon 容差 |
| 7 | 数组边界检查 | 🔴 高 | 使用 std::array.at() |
| 8 | 避免异常 | 🟡 中 | 返回错误码结构体 |
| 9 | 位操作类型安全 | 🟡 中 | 使用无符号 + 显式转换 |
| 10 | switch 必须完整 | 🟡 中 | 添加 default + break |

---

## 静态分析工具配置

### 常用工具

| 工具 | 支持标准 | 集成方式 |
|------|----------|----------|
| PC-lint Plus | MISRA C++:2008/2023 | IDE 插件, CI/CD |
| Polyspace | MISRA C++:2008 | MATLAB 集成 |
| QA·C++ | MISRA C++:2008/2023 | 独立/CI |
| Parasoft C/C++test | MISRA C++:2008 | IDE/CI |
| Clang-Tidy | 部分规则 | 开源/CI |

### CI/CD 集成示例

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

*最后更新: 2026-01-25*
