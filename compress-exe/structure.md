Cấu trúc dữ liệu nhúng

[FILE_EXE_GỐC]
[LZMA_DATA]
[MAGIC_BYTES = "EMBED_LZMA_V1"]
[DATA_SIZE u64]


Bên trong LZMA_DATA là:
[ENTRY]
- path (String)
- is_dir (bool)
- file_size (u64, nếu là file)
- file_content (nếu là file)

