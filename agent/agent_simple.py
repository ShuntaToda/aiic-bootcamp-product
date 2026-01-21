import json
import logging
import traceback

from bedrock_agentcore.runtime import BedrockAgentCoreApp
from strands import Agent
from strands.models import BedrockModel
from strands.tools import tool

from hooks.approval_hook import ApprovalHook
from tools.apigateway_tool import execute_api, list_apis
from tools.cloudwatch_tool import (
    get_agent_core_logs,
    get_logs,
    list_log_groups,
    list_log_streams,
)
from tools.dynamodb_tool import (
    create_item,
    list_tables,
    query_items,
    read_item,
    update_item,
)
from tools.lambda_tool import get_lambda_code, invoke_lambda, list_lambdas

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = BedrockAgentCoreApp()

bedrock_model = BedrockModel(
    model_id="global.anthropic.claude-sonnet-4-20250514-v1:0",
    temperature=0.7,
    streaming=True,
)


@tool
def lambda_invoke(
    function_name: str, payload: dict, invocation_type: str = "RequestResponse"
) -> dict:
    """AWS Lambda関数を実行します"""
    return invoke_lambda(function_name, payload, invocation_type)


@tool
def lambda_get_code(function_name: str) -> str:
    """Lambda関数のソースコードURLを取得します"""
    return get_lambda_code(function_name)


@tool
def lambda_list() -> list:
    """Lambda関数の一覧を取得します"""
    return list_lambdas()


@tool
def dynamodb_create(table_name: str, item: dict) -> str:
    """DynamoDBテーブルにアイテムを作成します"""
    return create_item(table_name, item)


@tool
def dynamodb_read(table_name: str, key: dict) -> dict:
    """DynamoDBテーブルからアイテムを取得します"""
    return read_item(table_name, key)


@tool
def dynamodb_update(table_name: str, key: dict, updates: dict) -> str:
    """DynamoDBテーブルのアイテムを更新します"""
    return update_item(table_name, key, updates)


@tool
def dynamodb_query(table_name: str, key_condition: str, expr_attr_values: dict) -> list:
    """DynamoDBテーブルをクエリします"""
    return query_items(table_name, key_condition, expr_attr_values)


@tool
def dynamodb_list() -> list:
    """DynamoDBテーブルの一覧を取得します"""
    return list_tables()


@tool
def api_execute(
    api_url: str,
    method: str = "GET",
    headers: dict = None,
    params: dict = None,
    body: dict = None,
) -> dict:
    """API Gatewayエンドポイントを実行します"""
    return execute_api(api_url, method, headers, params, body)


@tool
def api_list() -> list:
    """API Gatewayの一覧を取得します"""
    return list_apis()


@tool
def cloudwatch_list_log_groups(prefix: str = None) -> list:
    """CloudWatch Logsのロググループ一覧を取得します"""
    return list_log_groups(prefix)


@tool
def cloudwatch_list_log_streams(log_group_name: str, limit: int = 10) -> list:
    """指定したロググループのログストリーム一覧を取得します"""
    return list_log_streams(log_group_name, limit)


@tool
def cloudwatch_get_logs(
    log_group_name: str,
    log_stream_name: str = None,
    start_time_minutes_ago: int = 60,
    limit: int = 100,
) -> list:
    """CloudWatch Logsからログを取得します"""
    return get_logs(log_group_name, log_stream_name, start_time_minutes_ago, limit)


@tool
def cloudwatch_get_agent_core_logs(
    start_time_minutes_ago: int = 60, limit: int = 100
) -> dict:
    """Agent Core関連のログを取得します"""
    return get_agent_core_logs(start_time_minutes_ago, limit)


@app.entrypoint
async def run_agent(payload):
    try:
        user_input = payload.get("prompt")
        interrupt_responses = payload.get("interrupt_responses")
        logger.info(f"User input: {user_input}")

        custom_tools = [
            lambda_invoke,
            lambda_get_code,
            lambda_list,
            dynamodb_create,
            dynamodb_read,
            dynamodb_update,
            dynamodb_query,
            dynamodb_list,
            api_execute,
            api_list,
            cloudwatch_list_log_groups,
            cloudwatch_list_log_streams,
            cloudwatch_get_logs,
            cloudwatch_get_agent_core_logs,
        ]

        agent = Agent(
            tools=custom_tools,
            model=bedrock_model,
            system_prompt="Please respond flexibly according to the user's content.",
            hooks=[ApprovalHook()],
        )

        if interrupt_responses:
            logger.info(f"Resuming with interrupt responses: {interrupt_responses}")
            async for event in agent.stream_async(
                user_input, interrupt_responses=interrupt_responses
            ):
                if "data" in event:
                    yield event["data"]
                elif "complete" in event:
                    complete_data = event["complete"]
                    if complete_data.get("stop_reason") == "interrupt":
                        interrupts = complete_data.get("interrupts", [])
                        yield json.dumps(
                            {"type": "interrupt", "interrupts": interrupts}
                        )
        else:
            async for event in agent.stream_async(user_input):
                if "data" in event:
                    yield event["data"]
                elif "complete" in event:
                    complete_data = event["complete"]
                    if complete_data.get("stop_reason") == "interrupt":
                        interrupts = complete_data.get("interrupts", [])
                        yield json.dumps(
                            {"type": "interrupt", "interrupts": interrupts}
                        )
    except Exception as e:
        error_msg = f"Error in run_agent: {str(e)}"
        logger.error(error_msg)
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise


if __name__ == "__main__":
    app.run()
