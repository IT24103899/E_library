import urllib.request
import json
import traceback
import sys

try:
    req = urllib.request.Request('http://localhost:8080/api/search-history/1', method='GET')
    with urllib.request.urlopen(req) as response:
        print(response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.reason}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
