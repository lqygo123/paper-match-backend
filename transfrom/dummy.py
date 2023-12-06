from typing import Optional, List, Any, Tuple
from pickle import load
import json

import sys

def get_scan_pdf_compare_result():
    with open("./output_scan.json", 'r') as f:
        return json.load(f)

def get_digital_pdf_compare_result():
    with open("./output_digital.json", 'r') as f:
        return json.load(f)

def get_scan_pdf_compare_result_json(*args, **kwargs):
    return json.dumps(get_scan_pdf_compare_result())

def get_digital_pdf_compare_result_json(*args, **kwargs):
    return json.dumps(get_digital_pdf_compare_result())

args_from_node = sys.argv[1:]

print(get_digital_pdf_compare_result())

# 从Node.js传递的参数
args_from_node = sys.argv[1:]

if (args_from_node[0] == 'get_scan_pdf_compare_result'):
    print(get_scan_pdf_compare_result_json(args_from_node[1], args_from_node[2]))

