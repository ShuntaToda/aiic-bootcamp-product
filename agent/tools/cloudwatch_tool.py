import boto3
from datetime import datetime, timedelta

logs_client = boto3.client('logs')


def list_log_groups(prefix: str = None) -> list:
    """CloudWatch Logsのロググループ一覧を取得します"""
    params = {}
    if prefix:
        params['logGroupNamePrefix'] = prefix

    response = logs_client.describe_log_groups(**params)
    return [group['logGroupName'] for group in response.get('logGroups', [])]


def list_log_streams(log_group_name: str, limit: int = 10) -> list:
    """指定したロググループのログストリーム一覧を取得します"""
    response = logs_client.describe_log_streams(
        logGroupName=log_group_name,
        orderBy='LastEventTime',
        descending=True,
        limit=limit
    )
    return [stream['logStreamName'] for stream in response.get('logStreams', [])]


def get_logs(log_group_name: str, log_stream_name: str = None,
             start_time_minutes_ago: int = 60, limit: int = 100) -> list:
    """CloudWatch Logsからログを取得します

    Args:
        log_group_name: ロググループ名
        log_stream_name: ログストリーム名（省略時は最新のストリームから取得）
        start_time_minutes_ago: 何分前からのログを取得するか（デフォルト: 60分）
        limit: 取得するログの最大数（デフォルト: 100）

    Returns:
        ログイベントのリスト
    """
    start_time = int((datetime.utcnow() - timedelta(minutes=start_time_minutes_ago)).timestamp() * 1000)
    end_time = int(datetime.utcnow().timestamp() * 1000)

    params = {
        'logGroupName': log_group_name,
        'startTime': start_time,
        'endTime': end_time,
        'limit': limit
    }

    if log_stream_name:
        params['logStreamNames'] = [log_stream_name]

    response = logs_client.filter_log_events(**params)

    logs = []
    for event in response.get('events', []):
        timestamp = datetime.fromtimestamp(event['timestamp'] / 1000).strftime('%Y-%m-%d %H:%M:%S')
        logs.append({
            'timestamp': timestamp,
            'message': event['message'],
            'logStreamName': event.get('logStreamName', '')
        })

    return logs


def get_agent_core_logs(start_time_minutes_ago: int = 60, limit: int = 100) -> dict:
    """Agent Core関連のログを取得します

    Args:
        start_time_minutes_ago: 何分前からのログを取得するか（デフォルト: 60分）
        limit: 取得するログの最大数（デフォルト: 100）

    Returns:
        ロググループごとのログイベント
    """
    prefixes = ['/aws/bedrock', 'bedrock-agentcore', '/ecs/', 'agent_simple']

    all_log_groups = []
    for prefix in prefixes:
        try:
            groups = list_log_groups(prefix)
            all_log_groups.extend(groups)
        except Exception:
            pass

    all_log_groups = list(set(all_log_groups))

    result = {
        'found_log_groups': all_log_groups,
        'logs': {}
    }

    for log_group in all_log_groups:
        try:
            logs = get_logs(log_group, start_time_minutes_ago=start_time_minutes_ago, limit=limit)
            if logs:
                result['logs'][log_group] = logs
        except Exception as e:
            result['logs'][log_group] = f"Error: {str(e)}"

    return result
