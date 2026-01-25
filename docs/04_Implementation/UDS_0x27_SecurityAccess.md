# UDS 0x27 Security Access 服务实现

> 本文档详述 UDS 安全访问服务 (SID 0x27) 在 AUTOSAR Classic Platform 中的完整调用栈，包含 PduR → Dcm → Callout → Crypto Driver 的交互流程。

## 服务概述

### Security Access 机制

| 属性 | 描述 |
|------|------|
| **服务标识** | SID = 0x27 |
| **标准依据** | ISO 14229-1 |
| **目的** | 解锁受保护的诊断服务 |
| **机制** | Seed & Key 挑战-响应认证 |
| **安全等级** | 支持多个 Security Level (0x01-0x7E) |

### 子功能定义

| Sub-Function | 名称 | 描述 |
|--------------|------|------|
| 0x01 | requestSeed (Level 1) | 请求安全等级 1 的种子 |
| 0x02 | sendKey (Level 1) | 发送安全等级 1 的密钥 |
| 0x03 | requestSeed (Level 2) | 请求安全等级 2 的种子 |
| 0x04 | sendKey (Level 2) | 发送安全等级 2 的密钥 |
| ... | ... | 奇数=requestSeed, 偶数=sendKey |
| 0x7F | requestSeed (Level 64) | 最高安全等级种子请求 |

---

## AUTOSAR 模块架构

### 涉及模块

```mermaid
flowchart TB
    subgraph Application["应用层"]
        DIAG_APP["诊断应用"]
    end
    
    subgraph BSW["基础软件层 (BSW)"]
        direction TB
        
        subgraph COM_Stack["通信栈"]
            PDUR["PduR<br/>(PDU Router)"]
            DCM["Dcm<br/>(Diagnostic Communication Manager)"]
        end
        
        subgraph Security_Stack["安全栈"]
            CSM["Csm<br/>(Crypto Service Manager)"]
            CRYIF["CryIf<br/>(Crypto Interface)"]
        end
        
        subgraph Crypto_Driver["加密驱动"]
            CRY["Cry<br/>(Crypto Driver)"]
            HSM["HSM Driver"]
        end
    end
    
    subgraph MCAL["微控制器抽象层"]
        HSM_HW["HSM Hardware"]
    end
    
    subgraph Callout["Callout 接口"]
        SEED_CB["Dcm_GetSeed()"]
        KEY_CB["Dcm_CompareKey()"]
    end
    
    PDUR --> DCM
    DCM --> Callout
    Callout --> CSM
    CSM --> CRYIF --> CRY --> HSM --> HSM_HW
    
    style DCM fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Callout fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style CSM fill:#e8f5e9,stroke:#388e3c
```

---

## 完整调用栈序列图

### Phase 1: Request Seed (0x27 0x01)

```mermaid
sequenceDiagram
    autonumber
    participant Tester as 🔧 Tester
    participant CanIf as CanIf
    participant PduR as PduR
    participant Dcm as Dcm
    participant DspInternal as Dcm Internal<br/>(DSP Layer)
    participant Callout as Dcm_GetSeed<br/>(Callout)
    participant Csm as Csm
    participant CryDrv as Crypto Driver
    participant HSM as HSM

    Note over Tester,HSM: ═══ Phase 1: Request Seed ═══

    rect rgb(227, 242, 253)
        Note over Tester: 构造请求<br/>27 01
        Tester->>CanIf: CAN Frame<br/>[27 01]
        
        CanIf->>PduR: PduR_CanIfRxIndication()<br/>RxPduId, PduInfoPtr
        
        Note over PduR: 路由查找<br/>确定目标模块
        
        PduR->>Dcm: Dcm_StartOfReception()<br/>DcmRxPduId, TpSduLength
        
        Dcm-->>PduR: BUFREQ_OK
        
        PduR->>Dcm: Dcm_CopyRxData()<br/>PduInfoPtr, BufferSizePtr
        
        PduR->>Dcm: Dcm_TpRxIndication()<br/>Result = E_OK
    end
    
    rect rgb(255, 243, 224)
        Note over Dcm: 解析 SID = 0x27<br/>SubFunction = 0x01
        
        Dcm->>DspInternal: DspInternal_SecurityAccess()
        
        Note over DspInternal: 检查会话状态<br/>检查安全延时
        
        alt 安全延时有效
            DspInternal-->>Dcm: NRC 0x37<br/>(requiredTimeDelayNotExpired)
        else 会话检查失败
            DspInternal-->>Dcm: NRC 0x7F<br/>(serviceNotSupportedInActiveSession)
        else 检查通过
            DspInternal->>Callout: Dcm_GetSeed()<br/>SecurityLevel, SeedLen, *Seed, OpStatus
        end
    end
    
    rect rgb(232, 245, 233)
        Note over Callout: 生成随机种子<br/>可调用 Csm
        
        Callout->>Csm: Csm_RandomGenerate()<br/>JobId, ResultPtr, ResultLengthPtr
        
        Csm->>CryDrv: Cry_RandomGenerate()
        
        CryDrv->>HSM: HSM_GenerateRandom()
        
        HSM-->>CryDrv: Random Bytes
        CryDrv-->>Csm: E_OK
        Csm-->>Callout: E_OK, Seed Data
        
        Note over Callout: 保存 Seed 供后续验证
        
        Callout-->>DspInternal: E_OK, Seed[N]
    end
    
    rect rgb(252, 228, 236)
        DspInternal-->>Dcm: Positive Response Ready
        
        Dcm->>PduR: PduR_DcmTransmit()<br/>TxPduId, PduInfoPtr
        
        Note over Dcm: 响应: 67 01 [Seed]
        
        PduR->>CanIf: CanIf_Transmit()
        
        CanIf->>Tester: CAN Frame<br/>[67 01 XX XX XX XX]
    end
```

### Phase 2: Send Key (0x27 0x02)

```mermaid
sequenceDiagram
    autonumber
    participant Tester as 🔧 Tester
    participant CanIf as CanIf
    participant PduR as PduR
    participant Dcm as Dcm
    participant DspInternal as Dcm Internal<br/>(DSP Layer)
    participant Callout as Dcm_CompareKey<br/>(Callout)
    participant Csm as Csm
    participant CryDrv as Crypto Driver
    participant HSM as HSM

    Note over Tester,HSM: ═══ Phase 2: Send Key ═══

    rect rgb(227, 242, 253)
        Note over Tester: 根据算法计算 Key<br/>Key = f(Seed, Secret)
        
        Tester->>CanIf: CAN Frame<br/>[27 02 KEY...]
        
        CanIf->>PduR: PduR_CanIfRxIndication()
        
        PduR->>Dcm: Dcm_StartOfReception()
        Dcm-->>PduR: BUFREQ_OK
        PduR->>Dcm: Dcm_CopyRxData()
        PduR->>Dcm: Dcm_TpRxIndication()
    end
    
    rect rgb(255, 243, 224)
        Note over Dcm: 解析 SID = 0x27<br/>SubFunction = 0x02
        
        Dcm->>DspInternal: DspInternal_SecurityAccess()
        
        Note over DspInternal: 验证序列<br/>(必须先 requestSeed)
        
        alt 未先请求 Seed
            DspInternal-->>Dcm: NRC 0x24<br/>(requestSequenceError)
        else 序列正确
            DspInternal->>Callout: Dcm_CompareKey()<br/>SecurityLevel, Key, KeyLen, OpStatus
        end
    end
    
    rect rgb(232, 245, 233)
        Note over Callout: 使用保存的 Seed<br/>计算期望 Key
        
        Callout->>Csm: Csm_MacGenerate()<br/>JobId, DataPtr, DataLen, MacPtr, MacLenPtr
        Note right of Callout: 或其他加密算法<br/>AES, SHA256 等
        
        Csm->>CryDrv: Cry_MacGenerate()
        CryDrv->>HSM: HSM_ComputeMAC()
        HSM-->>CryDrv: Expected Key
        CryDrv-->>Csm: E_OK
        Csm-->>Callout: E_OK, ComputedKey
        
        Note over Callout: 比较 ReceivedKey<br/>与 ComputedKey
        
        alt Key 匹配
            Callout-->>DspInternal: DCM_E_COMPARE_KEY_OK
            Note over DspInternal: 设置 SecurityLevel<br/>解锁受保护服务
        else Key 不匹配
            Callout-->>DspInternal: DCM_E_COMPARE_KEY_FAILED
            Note over DspInternal: 增加失败计数<br/>可能触发延时
        end
    end
    
    rect rgb(252, 228, 236)
        alt 验证成功
            Dcm->>PduR: PduR_DcmTransmit()
            Note over Dcm: 响应: 67 02
            PduR->>CanIf: CanIf_Transmit()
            CanIf->>Tester: [67 02]
            Note over Tester: 安全解锁成功!
        else 验证失败
            Dcm->>PduR: PduR_DcmTransmit()
            Note over Dcm: 否定响应: 7F 27 35<br/>(invalidKey)
            PduR->>CanIf: CanIf_Transmit()
            CanIf->>Tester: [7F 27 35]
        else 超过重试次数
            Dcm->>PduR: PduR_DcmTransmit()
            Note over Dcm: 否定响应: 7F 27 36<br/>(exceededNumberOfAttempts)
            PduR->>CanIf: CanIf_Transmit()
            CanIf->>Tester: [7F 27 36]
            Note over Dcm: 启动安全延时定时器
        end
    end
```

---

## Callout 函数实现

### Dcm_GetSeed 实现模板

```c
/* ============================================================
 * File: Dcm_SecurityAccess_Callout.c
 * Description: Security Access Callout Implementation
 * MISRA C:2012 Compliant
 * ============================================================ */

#include "Dcm.h"
#include "Csm.h"
#include "Rte_Dcm.h"

/* 存储生成的 Seed，供 CompareKey 使用 */
static uint8 Dcm_SecuritySeed[DCM_SECURITY_SEED_SIZE];
static boolean Dcm_SeedGenerated = FALSE;

/**
 * @brief Generate security seed for the requested security level
 * @param[in]  SecurityAccessType - Security level requested
 * @param[in]  SeedLen - Expected seed length
 * @param[out] Seed - Buffer to store generated seed
 * @param[in]  OpStatus - Operation status (initial, pending, cancel)
 * @return Std_ReturnType - E_OK, E_NOT_OK, DCM_E_PENDING
 */
Std_ReturnType Dcm_GetSeed(
    uint8 SecurityAccessType,
    uint8 SeedLen,
    uint8* Seed,
    Dcm_OpStatusType OpStatus)
{
    Std_ReturnType retVal = E_NOT_OK;
    Csm_ResultType csmResult;
    uint32 seedLength = (uint32)SeedLen;
    
    /* 参数有效性检查 */
    if (NULL_PTR == Seed)
    {
        /* MISRA Rule 15.5: 单一出口点 - 使用 retVal */
        retVal = E_NOT_OK;
    }
    else if (SeedLen > DCM_SECURITY_SEED_SIZE)
    {
        retVal = E_NOT_OK;
    }
    else
    {
        switch (OpStatus)
        {
            case DCM_INITIAL:
                /* 调用 Csm 生成随机数 */
                csmResult = Csm_RandomGenerate(
                    CSM_JOB_ID_RANDOM_SEED,
                    Seed,
                    &seedLength);
                
                if (CSM_E_OK == csmResult)
                {
                    /* 保存 Seed 供后续验证 */
                    (void)memcpy(Dcm_SecuritySeed, Seed, SeedLen);
                    Dcm_SeedGenerated = TRUE;
                    retVal = E_OK;
                }
                else if (CSM_E_BUSY == csmResult)
                {
                    retVal = DCM_E_PENDING;
                }
                else
                {
                    retVal = E_NOT_OK;
                }
                break;
                
            case DCM_PENDING:
                /* 检查异步操作结果 */
                csmResult = Csm_RandomGenerate(
                    CSM_JOB_ID_RANDOM_SEED,
                    Seed,
                    &seedLength);
                    
                if (CSM_E_OK == csmResult)
                {
                    (void)memcpy(Dcm_SecuritySeed, Seed, SeedLen);
                    Dcm_SeedGenerated = TRUE;
                    retVal = E_OK;
                }
                else if (CSM_E_BUSY == csmResult)
                {
                    retVal = DCM_E_PENDING;
                }
                else
                {
                    retVal = E_NOT_OK;
                }
                break;
                
            case DCM_CANCEL:
                /* 取消操作 */
                (void)Csm_CancelJob(CSM_JOB_ID_RANDOM_SEED);
                Dcm_SeedGenerated = FALSE;
                retVal = E_OK;
                break;
                
            default:
                /* 不应到达此处 */
                retVal = E_NOT_OK;
                break;
        }
    }
    
    return retVal;
}
```

### Dcm_CompareKey 实现模板

```c
/**
 * @brief Compare received key with expected key
 * @param[in] SecurityAccessType - Security level
 * @param[in] Key - Received key from tester
 * @param[in] KeyLen - Key length
 * @param[in] OpStatus - Operation status
 * @return Dcm_CompareKeyResultType
 */
Std_ReturnType Dcm_CompareKey(
    uint8 SecurityAccessType,
    const uint8* Key,
    uint8 KeyLen,
    Dcm_OpStatusType OpStatus)
{
    Std_ReturnType retVal = E_NOT_OK;
    uint8 expectedKey[DCM_SECURITY_KEY_SIZE];
    uint32 expectedKeyLen = DCM_SECURITY_KEY_SIZE;
    Csm_ResultType csmResult;
    uint8 idx;
    boolean keyMatch = TRUE;
    
    /* 参数检查 */
    if ((NULL_PTR == Key) || (FALSE == Dcm_SeedGenerated))
    {
        retVal = E_NOT_OK;
    }
    else
    {
        switch (OpStatus)
        {
            case DCM_INITIAL:
                /* 使用 Seed + Secret 计算期望 Key */
                /* 这里使用 HMAC-SHA256 作为示例 */
                csmResult = Csm_MacGenerate(
                    CSM_JOB_ID_SECURITY_MAC,
                    CRYPTO_OPERATIONMODE_SINGLECALL,
                    Dcm_SecuritySeed,
                    DCM_SECURITY_SEED_SIZE,
                    expectedKey,
                    &expectedKeyLen);
                
                if (CSM_E_OK == csmResult)
                {
                    /* 常数时间比较，防止时序攻击 */
                    for (idx = 0U; idx < KeyLen; idx++)
                    {
                        if (Key[idx] != expectedKey[idx])
                        {
                            keyMatch = FALSE;
                            /* 继续比较，不提前退出 */
                        }
                    }
                    
                    if (TRUE == keyMatch)
                    {
                        retVal = E_OK;
                    }
                    else
                    {
                        retVal = DCM_E_COMPARE_KEY_FAILED;
                    }
                    
                    /* 清除 Seed，一次性使用 */
                    Dcm_SeedGenerated = FALSE;
                    (void)memset(Dcm_SecuritySeed, 0x00U, 
                                 DCM_SECURITY_SEED_SIZE);
                }
                else if (CSM_E_BUSY == csmResult)
                {
                    retVal = DCM_E_PENDING;
                }
                else
                {
                    retVal = E_NOT_OK;
                }
                break;
                
            case DCM_PENDING:
                /* 处理异步响应 */
                /* ... 类似逻辑 ... */
                break;
                
            case DCM_CANCEL:
                (void)Csm_CancelJob(CSM_JOB_ID_SECURITY_MAC);
                retVal = E_OK;
                break;
                
            default:
                retVal = E_NOT_OK;
                break;
        }
    }
    
    return retVal;
}
```

---

## 状态机设计

### Security Access 状态机

```mermaid
stateDiagram-v2
    [*] --> Locked: 初始状态

    Locked --> WaitForKey: requestSeed<br/>生成 Seed 成功
    Locked --> Locked: requestSeed<br/>生成失败

    WaitForKey --> Unlocked: sendKey<br/>Key 验证成功
    WaitForKey --> Locked: sendKey<br/>Key 验证失败<br/>(未超次数)
    WaitForKey --> Delayed: sendKey<br/>超过最大尝试次数
    WaitForKey --> Locked: 超时未收到 Key

    Delayed --> Locked: 延时期满
    Delayed --> Delayed: 任何请求<br/>返回 NRC 0x37

    Unlocked --> Locked: 会话超时/复位
    Unlocked --> Unlocked: 已解锁<br/>Seed = 0x00...

    note right of Delayed: 安全延时状态<br/>防止暴力攻击
```

### 否定响应码 (NRC)

| NRC | 名称 | 触发条件 |
|-----|------|----------|
| 0x12 | subFunctionNotSupported | 不支持的安全等级 |
| 0x13 | incorrectMessageLengthOrInvalidFormat | 消息格式错误 |
| 0x22 | conditionsNotCorrect | 条件不满足 |
| 0x24 | requestSequenceError | 未先请求 Seed |
| 0x35 | invalidKey | Key 验证失败 |
| 0x36 | exceededNumberOfAttempts | 超过最大尝试次数 |
| 0x37 | requiredTimeDelayNotExpired | 安全延时未到期 |

---

## 安全考量

### 防护措施

| 威胁 | 防护措施 | 实现位置 |
|------|----------|----------|
| **暴力破解** | 失败计数 + 指数延时 | Dcm 配置 |
| **时序攻击** | 常数时间比较 | CompareKey |
| **重放攻击** | 一次性 Seed | GetSeed |
| **Seed 预测** | HSM 真随机数 | Crypto Driver |
| **内存泄露** | 使用后清零 Seed/Key | Callout |

### Dcm 安全配置

```xml
<!-- Dcm 安全访问配置示例 -->
<ECUC-CONTAINER-VALUE>
  <SHORT-NAME>DcmDspSecurityRow_Level1</SHORT-NAME>
  <PARAMETER-VALUES>
    <ECUC-NUMERICAL-PARAM-VALUE>
      <DEFINITION-REF>/Dcm/DcmDspSecurityRow/DcmDspSecurityLevel</DEFINITION-REF>
      <VALUE>1</VALUE>
    </ECUC-NUMERICAL-PARAM-VALUE>
    <ECUC-NUMERICAL-PARAM-VALUE>
      <DEFINITION-REF>/Dcm/DcmDspSecurityRow/DcmDspSecuritySeedSize</DEFINITION-REF>
      <VALUE>4</VALUE>
    </ECUC-NUMERICAL-PARAM-VALUE>
    <ECUC-NUMERICAL-PARAM-VALUE>
      <DEFINITION-REF>/Dcm/DcmDspSecurityRow/DcmDspSecurityKeySize</DEFINITION-REF>
      <VALUE>4</VALUE>
    </ECUC-NUMERICAL-PARAM-VALUE>
    <ECUC-NUMERICAL-PARAM-VALUE>
      <DEFINITION-REF>/Dcm/DcmDspSecurityRow/DcmDspSecurityNumAttDelay</DEFINITION-REF>
      <VALUE>3</VALUE>
    </ECUC-NUMERICAL-PARAM-VALUE>
    <ECUC-NUMERICAL-PARAM-VALUE>
      <DEFINITION-REF>/Dcm/DcmDspSecurityRow/DcmDspSecurityDelayTime</DEFINITION-REF>
      <VALUE>10.0</VALUE> <!-- 10 秒延时 -->
    </ECUC-NUMERICAL-PARAM-VALUE>
  </PARAMETER-VALUES>
</ECUC-CONTAINER-VALUE>
```

---

*最后更新: 2026-01-25*
