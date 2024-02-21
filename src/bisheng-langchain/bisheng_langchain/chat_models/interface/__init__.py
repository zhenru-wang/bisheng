from .minimaxprorag import ChatCompletion as MinimaxChatCompletion
from .openai import ChatCompletion as OpenaiChatCompletion
from .wenxin import ChatCompletion as WenxinChatCompletion
from .xunfei import ChatCompletion as XunfeiChatCompletion
from .zhipuairag import ChatCompletion as ZhipuaiChatCompletion

__all__ = [
    'MinimaxChatCompletion', 'OpenaiChatCompletion', 'WenxinChatCompletion',
    'XunfeiChatCompletion', 'ZhipuaiChatCompletion'
]
