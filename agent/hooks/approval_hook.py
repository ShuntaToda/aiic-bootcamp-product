from strands.hooks import HookProvider, HookRegistry
from strands.hooks.events import BeforeToolCallEvent

WRITE_TOOLS = {"lambda_invoke", "dynamodb_create", "dynamodb_update", "api_execute"}


class ApprovalHook(HookProvider):
    def register_hooks(self, registry: HookRegistry) -> None:
        registry.add_callback(BeforeToolCallEvent, self.require_approval)

    def require_approval(self, event: BeforeToolCallEvent) -> None:
        tool_name = event.tool_use.get("name", "")
        if tool_name not in WRITE_TOOLS:
            return

        tool_input = event.tool_use.get("input", {})
        approval = event.interrupt(
            name="tool_approval",
            reason={
                "tool_name": tool_name,
                "tool_input": tool_input,
                "message": f"ツール '{tool_name}' を実行します。承認しますか？",
            },
        )

        if approval and approval.lower() in ["y", "yes", "approve", "承認"]:
            return  # 承認 → 実行継続
        else:
            event.cancel_tool = f"ユーザーが '{tool_name}' の実行を拒否しました"
