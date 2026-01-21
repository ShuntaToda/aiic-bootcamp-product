import boto3
import requests

def execute_api(api_url: str, method: str = "GET", headers: dict = None, params: dict = None, body: dict = None) -> dict:
    response = requests.request(method=method, url=api_url, headers=headers, params=params, json=body)
    return {"status_code": response.status_code, "body": response.json() if response.text else None}

def list_apis() -> list:
    result = []
    # REST APIs
    apigw = boto3.client('apigateway')
    rest_apis = apigw.get_rest_apis()
    for api in rest_apis.get('items', []):
        result.append({"type": "REST", "id": api['id'], "name": api['name']})
    # HTTP APIs
    apigwv2 = boto3.client('apigatewayv2')
    http_apis = apigwv2.get_apis()
    for api in http_apis.get('Items', []):
        result.append({"type": "HTTP", "id": api['ApiId'], "name": api['Name']})
    return result
