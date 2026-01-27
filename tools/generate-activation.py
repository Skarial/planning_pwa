#!/usr/bin/env python3

import sys
import hashlib

SECRET = "PLANNING_PWA_SECRET_V1"

if len(sys.argv) < 2:
    print("Usage : ./gen-code DEVICE_ID")
    sys.exit(1)

device_id = sys.argv[1]
input_str = f"{SECRET}:{device_id}"

hash_hex = hashlib.sha256(input_str.encode("utf-8")).hexdigest()[:12]

print(hash_hex)
