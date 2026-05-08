# PKCS11-Proxy Refactoring - Mapping Table & Development Order

## Tổng quan

Dự án refactor pkcs11-proxy từ repository gốc `https://github.com/iksaif/pkcs11-proxy` thành cấu trúc module hóa với 16 bước phát triển.

## Cấu trúc thư mục mới

```
new_structure/
├── 01_util/           # gck-rpc-util.c utilities (logging, mechanism helpers)
├── 02_buffer/         # egg-buffer.c/h - Generic data buffer
├── 03_message/        # gck-rpc-message.c - Message marshalling/unmarshalling
├── 04_rpc_common/     # gck-rpc-private.h, gck-rpc-layer.h - Common definitions
├── 05_ck_wrappers/    # C_* wrapper functions from gck-rpc-module.c
├── 06_routing/        # Call routing logic (dispatch_call switch statement)
├── 07_unix_socket/    # Unix socket handling from gck-rpc-module.c
├── 08_tcp_socket/     # TCP socket handling from gck-rpc-module.c
├── 09_dlopen_loader/  # dlopen logic from gck-rpc-daemon-standalone.c
├── 10_ck_helpers/     # CK_* helper functions from gck-rpc-dispatch.c
├── 11_dispatch_router/# Dispatch routing from gck-rpc-dispatch.c
├── 12_client/         # Client-side PKCS11 module
├── 13_server/         # Server-side dispatcher
├── 14_standalone/     # Standalone daemon entry point
├── 15_rpc_send/       # RPC send logic (call_send_recv write part)
└── 16_rpc_recv/       # RPC receive logic (call_read, parsing)
```

## Bảng Mapping File Gốc → File Mới

### File đơn giản (không cần tách)

| Bước | File gốc | File mới | Ghi chú |
|------|----------|----------|---------|
| 1 | egg-buffer.h | 02_buffer/egg-buffer.h | Copy nguyên |
| 2 | egg-buffer.c | 02_buffer/egg-buffer.c | Copy nguyên |
| 3 | gck-rpc-layer.h | 04_rpc_common/gck-rpc-layer.h | Copy nguyên |
| 4 | gck-rpc-private.h | 04_rpc_common/gck-rpc-private.h | Copy nguyên (chứa gck_rpc_calls[] array) |

### File phức tạp (cần tách)

#### Bước 5-6: gck-rpc-util.c → 01_util/

| Bước | Nội dung | Hàm/Code |
|------|----------|----------|
| 5 | Logging utilities | `gck_rpc_log()`, `gck_rpc_warn()`, `gck_rpc_debug()`, `do_log()` |
| 6 | Mechanism helpers | `gck_rpc_mechanism_is_supported()`, `gck_rpc_mechanism_list_purge()`, `gck_rpc_mechanism_has_sane_parameters()`, `gck_rpc_mechanism_has_pointer_parameters()`, `gck_rpc_mechanism_has_no_parameters()`, `gck_rpc_has_ulong_parameter()` |

#### Bước 7-8, 15-16: gck-rpc-module.c (2287 dòng) → 4 files

File gốc chứa đồng thời:
- C_* wrapper functions (~80 RPC call wrappers)
- Socket unix/tcp connection code
- RPC send/receive logic
- Call state management

| Bước | File mới | Nội dung tách từ gck-rpc-module.c | Dòng ước lượng |
|------|----------|-----------------------------------|---------------|
| 7 | 05_ck_wrappers/rpc_wrappers.c | Tất cả hàm `rpc_C_*()` (C_Initialize, C_Finalize, C_GetInfo, ...) | ~800 dòng |
| 8 | 07_unix_socket/unix_socket.c | `call_connect()` phần AF_UNIX, socket path handling | ~150 dòng |
| 15 | 08_tcp_socket/tcp_socket.c | `call_connect()` phần TCP/IP, `tcp://` parsing | ~150 dòng |
| 16 | 15_rpc_send/rpc_send.c | `call_write()`, `call_send_recv()` phần write | ~100 dòng |
| 17 | 16_rpc_recv/rpc_recv.c | `call_read()`, `call_connect()` common, call state pool | ~200 dòng |

**Các hàm cụ thể trong gck-rpc-module.c:**

```
Lines 1-200:    Includes, globals, logging, argument parsing
Lines 200-450:  CallState struct, call_allocator, call_disconnect, call_write, call_read
Lines 450-550:  call_connect (UNIX + TCP), call_destroy, call_lookup
Lines 550-650:  call_prepare, call_send_recv, call_run, call_done
Lines 650-800:  proto_read_attribute_array, proto_read_byte_array, proto_read_ulong_array
Lines 800-950:  proto_write_mechanism, proto_read_info, proto_read_slot_info, proto_read_token_info, proto_read_mechanism_info, proto_read_sesssion_info
Lines 950-1100: CALL MACROS (BEGIN_CALL, PROCESS_CALL, IN_*, OUT_*)
Lines 1100-1300: rpc_C_Initialize (complex initialization logic)
Lines 1300-1350: rpc_C_Finalize
Lines 1350-1400: rpc_C_GetFunctionList, rpc_C_GetSlotList, rpc_C_GetSlotInfo, rpc_C_GetTokenInfo
Lines 1400-1450: rpc_C_GetMechanismList, rpc_C_GetMechanismInfo, rpc_C_InitToken, rpc_C_WaitForSlotEvent
Lines 1450-1500: rpc_C_OpenSession, rpc_C_CloseSession, rpc_C_CloseAllSessions
Lines 1500-1550: rpc_C_GetFunctionStatus, rpc_C_CancelFunction, rpc_C_GetSessionInfo
Lines 1550-1600: rpc_C_InitPIN, rpc_C_SetPIN, rpc_C_GetOperationState, rpc_C_SetOperationState
Lines 1600-1650: rpc_C_Login, rpc_C_Logout
Lines 1650-1700: rpc_C_CreateObject, rpc_C_CopyObject, rpc_C_DestroyObject, rpc_C_GetObjectSize
Lines 1700-1750: rpc_C_GetAttributeValue, rpc_C_SetAttributeValue, rpc_C_FindObjectsInit, rpc_C_FindObjects, rpc_C_FindObjectsFinal
Lines 1750-1800: rpc_C_EncryptInit, rpc_C_Encrypt, rpc_C_EncryptUpdate, rpc_C_EncryptFinal
Lines 1800-1850: rpc_C_DecryptInit, rpc_C_Decrypt, rpc_C_DecryptUpdate, rpc_C_DecryptFinal
Lines 1850-1900: rpc_C_DigestInit, rpc_C_Digest, rpc_C_DigestUpdate, rpc_C_DigestKey, rpc_C_DigestFinal
Lines 1900-1950: rpc_C_SignInit, rpc_C_Sign, rpc_C_SignUpdate, rpc_C_SignFinal
Lines 1950-2000: rpc_C_SignRecoverInit, rpc_C_SignRecover, rpc_C_VerifyInit, rpc_C_Verify
Lines 2000-2050: rpc_C_VerifyUpdate, rpc_C_VerifyFinal, rpc_C_VerifyRecoverInit, rpc_C_VerifyRecover
Lines 2050-2100: rpc_C_DigestEncryptUpdate, rpc_C_DecryptDigestUpdate, rpc_C_SignEncryptUpdate, rpc_C_DecryptVerifyUpdate
Lines 2100-2150: rpc_C_GenerateKey, rpc_C_GenerateKeyPair, rpc_C_WrapKey
Lines 2150-2200: rpc_C_UnwrapKey, rpc_C_DeriveKey, rpc_C_SeedRandom, rpc_C_GenerateRandom
Lines 2200-2287: functionList, C_GetFunctionList
```

#### Bước 9-11: gck-rpc-dispatch.c (2460 dòng) → 3 files

File gốc chứa:
- dlopen loading logic (từ main standalone)
- CK_* helper functions (proto_read_*, proto_write_*)
- Routing logic (dispatch_call switch)
- Thread/dispatch loop

| Bước | File mới | Nội dung tách từ gck-rpc-dispatch.c | Dòng ước lượng |
|------|----------|-------------------------------------|---------------|
| 9 | 09_dlopen_loader/dlopen_loader.c | Loading logic từ gck-rpc-daemon-standalone.c (dlopen, C_GetFunctionList lookup) | ~100 dòng |
| 10 | 10_ck_helpers/ck_helpers.c | Tất cả hàm `proto_read_*`, `proto_write_*` helpers | ~600 dòng |
| 11 | 11_dispatch_router/dispatch_router.c | `dispatch_call()`, `run_dispatch_loop()`, thread handling, `gck_rpc_layer_*` functions | ~800 dòng |

**Các hàm cụ thể trong gck-rpc-dispatch.c:**

```
Lines 1-100:   Includes, globals (pkcs11_module, dispatchers list), logging
Lines 100-200: call_init, call_alloc, call_reset, call_uninit
Lines 200-350: proto_read_byte_buffer, proto_read_byte_array, proto_write_byte_array
Lines 350-450: proto_read_ulong_buffer, proto_write_ulong_array
Lines 450-550: proto_read_attribute_buffer, proto_read_attribute_array, proto_write_attribute_array
Lines 550-650: proto_read_null_string, proto_read_mechanism (với CKM_AES_GCM special case)
Lines 650-750: proto_write_info, proto_write_slot_info, proto_write_token_info
Lines 750-850: proto_write_mechanism_info, proto_write_session_info
Lines 850-950: CALL MACROS (BEGIN_CALL, IN_*, OUT_*)
Lines 950-1050: rpc_C_Initialize (server-side), rpc_C_Finalize (cleanup resources)
Lines 1050-1150: rpc_C_GetInfo, rpc_C_GetSlotList, rpc_C_GetSlotInfo, rpc_C_GetTokenInfo
Lines 1150-1250: rpc_C_GetMechanismList, rpc_C_GetMechanismInfo, rpc_C_InitToken, rpc_C_WaitForSlotEvent
Lines 1250-1350: rpc_C_OpenSession, rpc_C_CloseSession, rpc_C_CloseAllSessions
Lines 1350-1450: rpc_C_GetFunctionStatus, rpc_C_CancelFunction, rpc_C_GetSessionInfo
Lines 1450-1550: rpc_C_InitPIN, rpc_C_SetPIN, rpc_C_GetOperationState, rpc_C_SetOperationState
Lines 1550-1650: rpc_C_Login, rpc_C_Logout
Lines 1650-1750: OBJECT OPERATIONS: Create, Copy, Destroy, GetSize, GetAttributeValue, SetAttributeValue
Lines 1750-1850: FIND OPERATIONS: FindObjectsInit, FindObjects, FindObjectsFinal
Lines 1850-1950: ENCRYPT OPERATIONS: EncryptInit, Encrypt, EncryptUpdate, EncryptFinal
Lines 1950-2050: DECRYPT OPERATIONS: DecryptInit, Decrypt, DecryptUpdate, DecryptFinal
Lines 2050-2100: DIGEST OPERATIONS: DigestInit, Digest, DigestUpdate, DigestKey, DigestFinal
Lines 2100-2150: SIGN OPERATIONS: SignInit, Sign, SignUpdate, SignFinal
Lines 2150-2200: SIGN_RECOVER/VERIFY: SignRecoverInit, SignRecover, VerifyInit, Verify, VerifyUpdate, VerifyFinal
Lines 2200-2250: VERIFY_RECOVER: VerifyRecoverInit, VerifyRecover
Lines 2250-2300: COMBINED OPS: DigestEncryptUpdate, DecryptDigestUpdate, SignEncryptUpdate, DecryptVerifyUpdate
Lines 2300-2400: KEY OPERATIONS: GenerateKey, GenerateKeyPair, WrapKey, UnwrapKey, DeriveKey
Lines 2400-2460: RANDOM: SeedRandom, GenerateRandom
Lines 2460-2550: dispatch_call() - THE BIG SWITCH STATEMENT
Lines 2550-2650: read_all(), write_all() helpers
Lines 2650-2750: run_dispatch_loop(), run_dispatch_thread()
Lines 2750-2850: gck_rpc_layer_accept() - thread management
Lines 2850-2950: gck_rpc_layer_initialize() - socket setup (UNIX + TCP)
Lines 2950-3000: gck_rpc_layer_uninitialize() - cleanup
```

#### Bước 12-14: Assembly files

| Bước | File mới | Nội dung |
|------|----------|----------|
| 12 | 12_client/pkcs11_module.c | Assembly file cho client-side, export C_GetFunctionList |
| 13 | 13_server/server.c | Assembly file cho server-side dispatcher |
| 14 | 14_standalone/daemon.c | Main entry point từ gck-rpc-daemon-standalone.c |

## Thứ tự phát triển (Development Order)

### Phase 1: Foundation (Bước 1-6)
1. **Bước 1**: Setup cấu trúc thư mục, copy egg-buffer.h/c
2. **Bước 2**: Copy gck-rpc-layer.h, gck-rpc-private.h
3. **Bước 3**: Tách gck-rpc-util.c thành logging utilities
4. **Bước 4**: Tách mechanism helpers từ gck-rpc-util.c
5. **Bước 5**: Copy gck-rpc-message.c (message marshalling)
6. **Bước 6**: Review và test các utility functions

### Phase 2: Core RPC Logic (Bước 7-11)
7. **Bước 7**: Tách C_* wrappers từ gck-rpc-module.c → 05_ck_wrappers/
8. **Bước 8**: Tách Unix socket code → 07_unix_socket/
9. **Bước 9**: Tách TCP socket code → 08_tcp_socket/
10. **Bước 10**: Tách CK_* helpers từ gck-rpc-dispatch.c → 10_ck_helpers/
11. **Bước 11**: Tách dispatch routing → 11_dispatch_router/

### Phase 3: Send/Receive (Bước 12-13)
12. **Bước 12**: Tách RPC send logic → 15_rpc_send/
13. **Bước 13**: Tách RPC receive logic → 16_rpc_recv/

### Phase 4: Assembly (Bước 14-16)
14. **Bước 14**: Tạo client module assembly → 12_client/
15. **Bước 15**: Tạo server module assembly → 13_server/
16. **Bước 16**: Tạo standalone daemon → 14_standalone/

## Các điểm quan trọng cần lưu ý

### 1. Dependencies giữa các file

```
egg-buffer.h/c (no deps)
    ↓
gck-rpc-private.h (depends on egg-buffer.h, pkcs11.h)
    ↓
gck-rpc-message.c (depends on egg-buffer.h, gck-rpc-private.h)
    ↓
gck-rpc-util.c (depends on gck-rpc-private.h)
    ↓
gck-rpc-module.c (depends on all above + pthread, socket)
gck-rpc-dispatch.c (depends on all above + pthread, socket, dlfcn)
```

### 2. Global variables cần extract

**Từ gck-rpc-module.c:**
- `init_mutex`, `pkcs11_initialized`, `pkcs11_initialized_pid`, `pkcs11_app_id`
- `pkcs11_socket_path`
- `call_state_pool`, `n_call_state_pool`, `call_state_mutex`

**Từ gck-rpc-dispatch.c:**
- `pkcs11_module` (CK_FUNCTION_LIST_PTR)
- `pkcs11_dispatchers`, `pkcs11_dispatchers_mutex`
- `pkcs11_socket`, `pkcs11_socket_path`

### 3. Call macros cần preserve

Cả hai file đều dùng macro pattern:
```c
#define BEGIN_CALL(call_id) { ... }
#define PROCESS_CALL { ... }
#define END_CALL }
#define IN_BYTE(val) { ... }
#define OUT_ULONG(val) { ... }
```

Các macro này phải được giữ nguyên hoặc refactor cẩn thận để không breaking changes.

### 4. Special handling cho mechanisms

CKM_AES_GCM có custom serialization:
```c
if (mech->mechanism == CKM_AES_GCM) {
    CK_GCM_PARAMS *p = ...;
    // Serialize iv, iv_bits, aad, tag_bits separately
}
```

Code này xuất hiện ở cả module.c (write) và dispatch.c (read).

## Checklist cho mỗi bước

- [ ] Extract code từ file gốc
- [ ] Update includes cho đúng path mới
- [ ] Declare extern cho global variables shared
- [ ] Tạo header file tương ứng nếu cần
- [ ] Compile test riêng lẻ
- [ ] Update documentation

## Notes

- File `gck-rpc-module.c` là phức tạp nhất với 2287 dòng, chứa nhiều logic lồng ghép
- File `gck-rpc-dispatch.c` dài hơn (2460 dòng) nhưng có cấu trúc rõ ràng hơn
- Cần特别注意 call state management và thread safety với pthread mutexes
- Socket handling code (UNIX vs TCP) nên được tách thành abstraction layer
