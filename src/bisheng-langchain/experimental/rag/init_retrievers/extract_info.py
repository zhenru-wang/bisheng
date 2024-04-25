from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
import httpx

system_template = '''你是一个可靠的助理。你会收到一篇文档的主要内容，请根据这些内容生成这篇文档的标题。直接返回文档的标题即可。
'''
human_template = '''

{context}


'''

def extract(text : str, max_length : int) -> str:
    chat = ChatOpenAI(model='gpt-4-1106-preview', http_client=httpx.Client(proxies='http://192.168.106.20:1081'), 
                    openai_api_key='', temperature=0.0)
    messages = [
            SystemMessagePromptTemplate.from_template(system_template),
            HumanMessagePromptTemplate.from_template(human_template),
        ]
    chat_prompt = ChatPromptTemplate.from_messages(messages)
    chain = LLMChain(llm=chat, prompt=chat_prompt)
    if len(text) <= max_length:
        ans = chain.run(context=text)
    else:
        ans = chain.run(context=text[:max_length])
    return(ans)

# if __name__ == '__main__':
#     text = "江苏蔚蓝锂芯股份有限公司\n2021 年年度报告 \n2022 年 03 月\n\n 第一节 重要提示、目录和释义\n公司董事会、监事会及董事、监事、高级管理人员保证年度报告内容的真实、准确、完整，不存在虚假记载、误导性陈述或重大遗漏，并承担个别和连带的法律责任。\n公司负责人 CHEN KAI、主管会计工作负责人林文华及会计机构负责人(会计主管人员)张宗红声明：保证本年度报告中财务报告的真实、准确、完整。\n所有董事均已出席了审议本报告的董事会会议。"
#     ans = extract(text, max_length=10000)
#     print(ans)