import pytest
import yaml
import requests
import os

# Get directory of the current script
here = os.path.dirname(os.path.abspath(__file__))

# Build path relative to the script location
yaml_path = os.path.abspath(os.path.join(here, "../test_cases/test_cases.yaml"))

# Load YAML test cases once
with open(yaml_path) as f:
    test_cases = yaml.safe_load(f)

@pytest.mark.parametrize("case", test_cases)
def test_jwt_gateway(case):
    url = "http://localhost/validate"

    # If there's a setup key, call that function to get token
    if "setup" in case:
        func_name = case["setup"]
        if func_name in SETUP_FUNCTIONS:
            token = SETUP_FUNCTIONS[func_name]()
        else:
            raise ValueError(f"Setup function '{func_name}' not found")
    else:
        token = case.get("token", "")

    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = requests.get(url, headers=headers)
    
    assert response.status_code == case["expected_status"]
    assert case["expected_body_contains"].lower() in response.text.lower()
