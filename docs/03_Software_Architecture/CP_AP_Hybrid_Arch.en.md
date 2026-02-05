# AUTOSAR CP/AP Hybrid Architecture Design

> This document details the hybrid communication architecture of AUTOSAR Classic Platform (CP) and Adaptive Platform (AP), including SOME/IP, DDS mapping, and Hypervisor isolation mechanisms.

---

!!! success "💡 Field Insight from Michael Lin"
    **Background**: AUTOSAR AP + CP hybrid deployment on a domain controller

    **Key Challenges**:

    - ASIL D safety functions and QM infotainment co-exist on the same SoC
    - SW/HW teams disagree on FFI (Freedom from Interference)
    - Hypervisor + MPU dual isolation approach disputed

    **My Solution**:

    1. Led **FFI verification plan**, defining time/space isolation test cases
    2. Designed **MPU region partitioning**, mapping ASIL D/B/QM to separate memory regions
    3. Coordinated hypervisor vendor and silicon supplier for **joint safety analysis**
    4. Built **inter-VM secure communication** using VirtIO + shared memory

    **Quantified Results**:

    | Metric | Improvement |
    |:-----|:--------:|
    | Architecture review pass rate | First-pass |
    | Architecture rework | -30% |
    | FFI test coverage | 100% |
    | Schedule risk | Eliminated |

---

## Architecture Overview

### CP vs AP Positioning

| Feature | Classic Platform (CP) | Adaptive Platform (AP) |
|------|----------------------|------------------------|
| **Target scenario** | Deeply embedded, real-time control | High-performance compute, service architecture |
| **OS** | OSEK/AUTOSAR OS | POSIX-based (Linux, QNX) |
| **Communication** | Signal-based | Service-oriented |
| **Scheduling** | Static, cyclic tasks | Dynamic, event-driven |
| **Update mechanism** | Fixed config | Runtime config, OTA |
| **Typical ECU** | Sensor/actuator nodes | Domain controller, HPC |
| **Safety level** | Up to ASIL D | Typically up to ASIL B |

---

## CP/AP Hybrid Communication Architecture

### Overall System Architecture

```mermaid
flowchart TB
    subgraph Vehicle[" Vehicle Architecture"]
        direction TB

        subgraph HPC["️ High-Performance Computing (HPC/Domain Controller)"]
            subgraph Hypervisor["Type-1 Hypervisor Layer"]
                direction LR

                subgraph VM_AP["VM1: Adaptive Platform"]
                    direction TB
                    subgraph AP_Apps["AP Applications"]
                        AD["Autonomous Driving Apps"]
                        DIAG["Diagnostics Services"]
                        OTA["OTA Manager"]
                    end
                    subgraph AP_Services["AP Services (ara::)"]
                        COM_AP["ara::com<br/>(SOME/IP + DDS)"]
                        DIAG_AP["ara::diag"]
                        UCM["ara::ucm"]
                        PHM["ara::phm"]
                    end
                    subgraph AP_OS["POSIX OS"]
                        LINUX["Linux / QNX"]
                    end
                    AP_Apps --> AP_Services --> AP_OS
                end

                subgraph VM_CP["VM2: Classic Platform (Safety)"]
                    direction TB
                    subgraph CP_SWC["CP SWCs"]
                        CTRL["Control Algorithm SWC"]
                        SAFETY["Safety Monitor SWC"]
                    end
                    subgraph CP_RTE["RTE Layer"]
                        RTE["Runtime Environment"]
                    end
                    subgraph CP_BSW["BSW Layer"]
                        COM_CP["COM Stack"]
                        PDUR["PduR"]
                        CANIF["CanIf"]
                    end
                    subgraph CP_MCAL["MCAL"]
                        CAN_DRV["CAN Driver"]
                        ETH_DRV["ETH Driver"]
                    end
                    CP_SWC --> CP_RTE --> CP_BSW --> CP_MCAL
                end

                subgraph VM_Safety["VM3: Safety Monitor"]
                    SM["Safety Manager<br/>(ASIL D)"]
                end
            end
        end

        subgraph Network[" In-Vehicle Network"]
            direction LR
            ETH["Automotive Ethernet<br/>(100BASE-T1/1000BASE-T1)"]
            CAN_FD["CAN FD Bus"]
            CAN_STD["CAN Bus"]
        end

        subgraph ECU_Zone[" Zone/Node ECUs"]
            direction LR
            subgraph Zone1["Zone ECU 1"]
                CP1["CP Stack"]
            end
            subgraph Zone2["Zone ECU 2"]
                CP2["CP Stack"]
            end
            subgraph Sensor["Sensor ECU"]
                SEN["Sensor Node"]
            end
            subgraph Actuator["Actuator ECU"]
                ACT["Actuator Node"]
            end
        end
    end

    VM_AP <-->|"Virtual Network"| VM_CP
    VM_AP <-->|"Health Monitoring"| VM_Safety
    VM_CP <-->|"Safety Status"| VM_Safety

    HPC <-->|"SOME/IP over Ethernet"| ETH
    ETH <--> Zone1 & Zone2
    Zone1 <--> CAN_FD
    Zone2 <--> CAN_STD
    CAN_FD <--> Sensor
    CAN_STD <--> Actuator

    style HPC fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Hypervisor fill:#fff3e0,stroke:#f57c00
    style VM_AP fill:#e8f5e9,stroke:#388e3c
    style VM_CP fill:#fff9c4,stroke:#f9a825
    style VM_Safety fill:#ffcdd2,stroke:#c62828
```

---

## SOME/IP Communication Mechanism

### SOME/IP Stack Positioning

```mermaid
flowchart TB
    subgraph AP_Stack["Adaptive Platform"]
        direction TB
        APP_AP["Application Layer"]
        ARA_COM["ara::com API"]
        SOMEIP_AP["SOME/IP Binding"]
        UDP_TCP["UDP/TCP"]
        ETH_AP["Ethernet Driver"]

        APP_AP --> ARA_COM --> SOMEIP_AP --> UDP_TCP --> ETH_AP
    end

    subgraph CP_Stack["Classic Platform"]
        direction TB
        SWC["SWC Layer"]
        RTE["RTE"]
        SOMEIP_CP["SomeIpXf + SomeIpTp"]
        SOAD["SoAd (Socket Adaptor)"]
        TCPIP["TcpIp Stack"]
        ETHIF["EthIf"]
        ETH_CP["Eth Driver"]

        SWC --> RTE --> SOMEIP_CP --> SOAD --> TCPIP --> ETHIF --> ETH_CP
    end

    ETH_AP <-.->|"SOME/IP Messages"| ETH_CP

    style AP_Stack fill:#e8f5e9,stroke:#388e3c
    style CP_Stack fill:#fff9c4,stroke:#f9a825
```

### SOME/IP Service Discovery Flow

```mermaid
sequenceDiagram
    participant Server as Service Provider<br/>(AP/CP)
    participant SD as SOME/IP-SD<br/>(Multicast)
    participant Client as Service Consumer<br/>(AP/CP)

    Note over Server,Client: Service discovery

    Server->>SD: OfferService (Multicast)
    SD-->>Client: OfferService

    Client->>SD: FindService (Multicast)
    SD-->>Server: FindService

    Server->>Client: OfferService (Unicast)

    Note over Server,Client: Subscription

    Client->>Server: SubscribeEventgroup
    Server->>Client: SubscribeEventgroupAck

    Note over Server,Client: Communication

    Client->>Server: Request (Method Call)
    Server->>Client: Response

    Server->>Client: Event Notification
    Server->>Client: Event Notification
```

### SOME/IP Message Format

| Field | Size | Description |
|------|------|------|
| Service ID | 16 bit | Service identifier |
| Method ID | 16 bit | Method/event identifier |
| Length | 32 bit | Message length |
| Client ID | 16 bit | Client identifier |
| Session ID | 16 bit | Session identifier |
| Protocol Version | 8 bit | Protocol version |
| Interface Version | 8 bit | Interface version |
| Message Type | 8 bit | Request/Response/Notification |
| Return Code | 8 bit | Return code |
| Payload | Variable | Serialized data |

---

## DDS Integration & Mapping

### DDS Positioning in AP

```mermaid
flowchart TB
    subgraph AP_DDS["Adaptive Platform with DDS"]
        direction TB

        subgraph Apps["Applications"]
            AD_App["AD Planning"]
            Perception["Perception"]
            Fusion["Sensor Fusion"]
        end

        subgraph ARA["ara::com Layer"]
            PROXY["Service Proxy"]
            SKEL["Service Skeleton"]
        end

        subgraph Binding["Communication Binding"]
            direction LR
            SOMEIP_B["SOME/IP Binding"]
            DDS_B["DDS Binding"]
        end

        subgraph DDS_Stack["DDS Middleware"]
            direction TB
            DDS_API["DDS API (DCPS)"]
            RTPS["RTPS Protocol"]
            QOS["QoS Policies"]
        end

        subgraph Transport["Transport Layer"]
            UDP_M["UDP Multicast"]
            SHM["Shared Memory"]
        end

        Apps --> ARA --> Binding
        SOMEIP_B --> ETH_OUT["Ethernet"]
        DDS_B --> DDS_Stack --> Transport
    end

    style DDS_Stack fill:#e1f5fe,stroke:#0288d1
    style Binding fill:#fff3e0,stroke:#f57c00
```

### SOME/IP vs DDS

| Feature | SOME/IP | DDS |
|------|---------|-----|
| **Discovery** | SOME/IP-SD | RTPS Discovery |
| **Communication** | Request/Response, Pub/Sub | Pub/Sub (data-centric) |
| **QoS support** | Limited | Rich (22+ QoS policies) |
| **Serialization** | SOME/IP Serialization | CDR (Common Data Representation) |
| **Use cases** | SOA service calls | High-rate data distribution |
| **Typical usage** | Diagnostics, OTA, remote services | Sensor data, point clouds, images |
| **Real-time** | Medium | High (configurable) |

### Key DDS QoS Policies

| QoS Policy | Description | ADAS Example |
|----------|------|---------------|
| **Reliability** | Reliable/best effort | Perception data: BEST_EFFORT |
| **Durability** | Data persistence | Map data: TRANSIENT_LOCAL |
| **Deadline** | Update deadline | Radar data: 50 ms |
| **Liveliness** | Liveness detection | Sensor health monitoring |
| **History** | History depth | Point cloud cache: KEEP_LAST(5) |
| **Ownership** | Data ownership | Primary/backup sensor switching |

---

## Hypervisor Isolation Mechanisms

### Type-1 Hypervisor Architecture

```mermaid
flowchart TB
    subgraph Hardware[" Hardware Platform"]
        CPU["Multi-core CPU<br/>(ARM/x86)"]
        MEM["Physical memory"]
        IO["I/O devices"]
        IOMMU["IOMMU/SMMU"]
    end

    subgraph Hypervisor["️ Type-1 Hypervisor"]
        direction TB
        SCHED["Partitioning Scheduler"]
        MMU["Memory virtualization<br/>(Stage-2 Translation)"]
        VIRT_IO["I/O virtualization<br/>(Para-virtualization)"]
        HEALTH["Health Monitor"]
    end

    subgraph VMs["️ VM Partitions"]
        direction LR

        subgraph VM1["VM1: Safety Critical"]
            OS1["AUTOSAR OS"]
            APP1["ASIL D SWC"]
        end

        subgraph VM2["VM2: Performance"]
            OS2["Linux"]
            APP2["AD Stack"]
        end

        subgraph VM3["VM3: Connectivity"]
            OS3["Linux"]
            APP3["Telematics"]
        end
    end

    Hardware --> Hypervisor --> VMs

    VM1 <-.->|"Virtual Network"| VM2
    VM2 <-.->|"Virtual Network"| VM3

    style VM1 fill:#ffcdd2,stroke:#c62828
    style VM2 fill:#e8f5e9,stroke:#388e3c
    style VM3 fill:#e3f2fd,stroke:#1976d2
    style Hypervisor fill:#fff3e0,stroke:#f57c00,stroke-width:2px
```

### Isolation Layers

| Isolation Layer | Mechanism | Function |
|----------|------|------|
| **Time isolation** | Partitioning scheduler | Deterministic CPU time for each VM |
| **Space isolation** | Stage-2 MMU | Memory isolation between VMs |
| **I/O isolation** | IOMMU/SMMU | DMA access isolation |
| **Interrupt isolation** | Virtual interrupt controller | Interrupt routing isolation |
| **Communication isolation** | Virtual network | Controlled inter-VM communication |

### Inter-VM Communication

```mermaid
flowchart LR
    subgraph VM_A["VM A (AP)"]
        APP_A["Application"]
        VIRTIO_A["VirtIO Driver"]
    end

    subgraph Hypervisor["Hypervisor"]
        direction TB
        VSWITCH["Virtual Switch"]
        SHM["Shared Memory Region"]
        DOORBELL["Doorbell Interrupt"]
    end

    subgraph VM_B["VM B (CP)"]
        VIRTIO_B["VirtIO Driver"]
        APP_B["Application"]
    end

    APP_A --> VIRTIO_A
    VIRTIO_A -->|"1. Write Data"| SHM
    VIRTIO_A -->|"2. Notify"| DOORBELL
    DOORBELL -->|"3. Interrupt"| VIRTIO_B
    SHM -->|"4. Read Data"| VIRTIO_B
    VIRTIO_B --> APP_B

    VSWITCH -.->|"Manage"| SHM
    VSWITCH -.->|"Manage"| DOORBELL

    style Hypervisor fill:#fff3e0,stroke:#f57c00
```

---

## MPU Memory Isolation (Spatial Isolation)

### ASIL D and QM Coexistence

```mermaid
flowchart TB
    subgraph CPU_Core["CPU Core with MPU"]
        direction TB

        subgraph MPU["Memory Protection Unit"]
            REG["MPU Regions (8-16)"]
        end

        subgraph Memory_Map["Memory Layout"]
            direction TB

            subgraph ASIL_D_Region[" ASIL D Region"]
                ASIL_CODE["ASIL D Code<br/>(R-X)"]
                ASIL_DATA["ASIL D Data<br/>(R-W)"]
                ASIL_STACK["ASIL D Stack<br/>(R-W)"]
            end

            subgraph ASIL_B_Region[" ASIL B Region"]
                ASILB_CODE["ASIL B Code<br/>(R-X)"]
                ASILB_DATA["ASIL B Data<br/>(R-W)"]
            end

            subgraph QM_Region[" QM Region"]
                QM_CODE["QM Code<br/>(R-X)"]
                QM_DATA["QM Data<br/>(R-W)"]
                QM_STACK["QM Stack<br/>(R-W)"]
            end

            subgraph Shared_Region[" Shared Region"]
                SHARED["Exchange Buffer<br/>(Controlled Access)"]
            end
        end
    end

    MPU -->|"Protect"| Memory_Map

    style ASIL_D_Region fill:#ffcdd2,stroke:#c62828
    style ASIL_B_Region fill:#fff9c4,stroke:#f9a825
    style QM_Region fill:#c8e6c9,stroke:#388e3c
    style Shared_Region fill:#e0e0e0,stroke:#757575
```

### MPU Configuration Table

| MPU Region | Start Address | Size | Attribute | ASIL | Access | Notes |
|------------|----------|------|------|-----------|----------|------|
| Region 0 | 0x0000_0000 | 4KB | Code | ASIL D | R-X (Privileged) | ASIL D boot code |
| Region 1 | 0x0000_1000 | 32KB | Code | ASIL D | R-X | ASIL D app code |
| Region 2 | 0x0000_9000 | 16KB | Data | ASIL D | R-W (No Execute) | ASIL D data |
| Region 3 | 0x0000_D000 | 4KB | Stack | ASIL D | R-W (No Execute) | ASIL D stack |
| Region 4 | 0x0001_0000 | 16KB | Code | ASIL B | R-X | ASIL B app code |
| Region 5 | 0x0001_4000 | 8KB | Data | ASIL B | R-W (No Execute) | ASIL B data |
| Region 6 | 0x0002_0000 | 64KB | Code | QM | R-X | QM app code |
| Region 7 | 0x0003_0000 | 32KB | Data | QM | R-W (No Execute) | QM data |
| Region 8 | 0x0004_0000 | 4KB | Shared | Mixed | R-W (Controlled) | Data exchange buffer |
| Region 9 | 0x0005_0000 | 8KB | Peripheral | - | R-W (Device) | Peripheral registers |

### Access Rights Matrix

| Accessor \ Region | ASIL D Code | ASIL D Data | ASIL B Code | ASIL B Data | QM Code | QM Data | Shared |
|---------------------|-------------|-------------|-------------|-------------|---------|---------|--------|
| **ASIL D Task** | R-X | R-W | R | R | R | R | R-W |
| **ASIL B Task** | - | - | R-X | R-W | R | R | R-W |
| **QM Task** | - | - | - | - | R-X | R-W | R-W |
| **ISR (ASIL D)** | R-X | R-W | R | R | R | R | R-W |

> **Note**: "-" means no access. MPU violations trigger exceptions.

### Freedom from Interference (FFI) Implementation

```mermaid
flowchart TB
    subgraph FFI["Freedom from Interference"]
        direction TB

        subgraph Spatial["Spatial Isolation"]
            S1["MPU memory protection"]
            S2["Stack overflow detection"]
            S3["NULL pointer protection"]
        end

        subgraph Temporal["Temporal Isolation"]
            T1["Watchdog monitoring"]
            T2["Execution time monitoring"]
            T3["Scheduling protection"]
        end

        subgraph Communication["Communication Isolation"]
            C1["Data exchange validation"]
            C2["CRC checks"]
            C3["Sequence number checks"]
        end
    end

    subgraph Protection["Violation Handling"]
        P1["MPU exception"]
        P2["Watchdog reset"]
        P3["Error reporting"]
    end

    Spatial & Temporal & Communication --> Protection

    style Spatial fill:#ffcdd2,stroke:#c62828
    style Temporal fill:#fff9c4,stroke:#f9a825
    style Communication fill:#c8e6c9,stroke:#388e3c
```

### ASIL Decomposition & Isolation Strategy

| Isolation Strategy | Implementation | ISO 26262 Requirement |
|----------|----------|----------------|
| **Same ASIL co-existence** | Software partition + MPU | Part 6 requirement |
| **Different ASIL co-existence** | MPU + FFI evidence | ASIL decomposition evidence |
| **ASIL D + QM** | Strict MPU isolation + diagnostics | QM must not affect ASIL D |
| **Multi-core allocation** | Core isolation + shared memory protection | Multi-core safety manual |

### MPU Best Practices

| Practice | Recommendation | Rationale |
|--------|------|------|
| Least privilege | Grant only necessary access | Reduce fault propagation |
| No-write code region | Prevent runtime code modification | Prevent code injection |
| No-execute data | Prevent data execution | Prevent buffer attacks |
| Stack guard page | Read-only guard page at stack base | Detect stack overflow |
| Peripheral isolation | Partition peripheral access by ASIL | Prevent misoperation |
| Default deny | Unconfigured regions have no access | Catch illegal access |

---

## Summary: Hybrid Architecture Key Points

```mermaid
mindmap
  root((CP/AP Hybrid Architecture))
    Communication
      SOME/IP
        Service discovery
        Method calls
        Event notification
      DDS
        High-rate data
        QoS policies
        Zero-copy
      CAN/CAN-FD
        Signal transport
        Real-time
    Isolation
      Hypervisor
        Time isolation
        Space isolation
        I/O isolation
      MPU
        ASIL/QM isolation
        FFI implementation
        Violation detection
    Safety
      ASIL D on CP
      ASIL B on AP
      Safety monitor VM
```

---

*Last updated: 2026-01-25*
