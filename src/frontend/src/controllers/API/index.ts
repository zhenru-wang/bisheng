import { AppConfig } from "../../types/api/app";
import { FlowType } from "../../types/flow";
import axios from "../request";
import {
  APIClassType,
  BuildStatusTypeAPI,
  InitTypeAPI,
  RTServer
} from "./../../types/api/index";

const GITHUB_API_URL = "https://api.github.com";

export async function getRepoStars(owner, repo) {
  try {
    const response = await axios.get(
      `${GITHUB_API_URL}/repos/${owner}/${repo}`
    );
    return response.data.stargazers_count;
  } catch (error) {
    console.error("Error fetching repository data:", error);
    return null;
  }
}


/**
 * Fetches all objects from the API endpoint.
 *
 * @returns  A promise that resolves to an AxiosResponse containing all the objects.
 */
export async function getAll() {
  return await axios.get(`/api/v1/all`);
}

/**
 * 读取 saved 组件s
 */
export async function getComponents(): Promise<any[]> {
  return await axios.get(`/api/v1/component`);
}
/**
 * save 组件
 */
export async function saveComponent(data): Promise<any[]> {
  return await axios.post(`/api/v1/component`, data);
}
/**
 * 覆盖 组件
 */
export async function overridComponent(data): Promise<any[]> {
  return await axios.patch(`/api/v1/component`, data);
}
/**
 * 删除 组件
 */
export async function delComponentApi(name): Promise<any> {
  return await axios.delete(`/api/v1/component`, { data: { name } });
}
/**
 * 获取平台配置
 */
export async function getAppConfig(): Promise<AppConfig> {
  return await axios.get(`/api/v1/env`);
}

/**
 * Reads all templates from the database.
 *
 * @returns The flows data.
 * @throws Will throw an error if reading fails.
 */
export async function readTempsDatabase(id?: number): Promise<FlowType[]> {
  return await axios.get(`/api/v1/skill/template${id ? '?id=' + id : ''}`);
}

/**
 * 创建模板.
 *
 * @param data {flow_id name description}
 * @returns  null.
 */
export function createTempApi(params) {
  return axios.post(`/api/v1/skill/template/create`, params);
}

/**
 * 删除模板.
 *
 * @param data {flow_id name description}
 * @returns  null.
 */
export function deleteTempApi(temp_id) {
  return axios.delete(`/api/v1/skill/template/${temp_id}`);
}

/**
 * 修改模板.
 *
 * @param data {flow_id name description}
 * @returns  null.
 */
export function updateTempApi(temp_id, data) {
  return axios.post(`/api/v1/skill/template/${temp_id}`, data);
}

/**
 * 获取知识库列表
 *
 */
export async function readFileLibDatabase(page = 1, pageSize = 40, name = '') {
  try {
    const response: { data: any[], total: number } = await axios.get(`/api/v1/knowledge/?page_num=${page}&page_size=${pageSize}&name=${name}`);
    // const { data, total } = response
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * 获取知识库下文件列表
 *
 */
export async function readFileByLibDatabase({ id, page, pageSize = 40, name = '', status }) {
  const statusStr = status === 999 ? '' : `&status=${status}`;
  const response: { data: any[], total: number, writeable: any } = await axios.get(`/api/v1/knowledge/file_list/${id}?page_size=${pageSize}&page_num=${page}&file_name=${name}${statusStr}`);
  return response
  // return { data, writeable, pages: Math.ceil(total / pageSize) }
}

/**
 * 重试解析文件
 */
export async function retryKnowledgeFileApi(objs) {
  await axios.post(`/api/v1/knowledge/retry`, { file_objs: objs });
}

/**
 * 上传文件
 */
export async function uploadLibFile(data, config) {
  return await axios.post(`/api/v1/knowledge/upload`, data, config);
}

/**
 * 确定上传文件
 * file_path knowledge_id chunck_size
 */
export async function subUploadLibFile(data) {
  return await axios.post(`/api/v1/knowledge/process`, data);
}

/**
 * 创建支持库
 *
 */
export async function createFileLib(data) {
  return await axios.post(`/api/v1/knowledge/create`, data);
}

/**
 * 删除支持库
 *
 */
export async function deleteFileLib(id) {
  return await axios.delete(`/api/v1/knowledge/${id}`);
}

/**
 * 删除知识库下文件
 *
 */
export async function deleteFile(id) {
  return await axios.delete(`/api/v1/knowledge/file/${id}`);
}

/**
 * 获取模型列表
 */
export async function getEmbeddingModel(): Promise<{ models: string[] }> {
  return await axios.get(`/api/v1/knowledge/embedding_param`);
}

/**
 * 获取RT服务列表Ï
 */
export async function getServicesApi(): Promise<RTServer[]> {
  return await axios.get(`/api/v1/server/list_server`);
}

/**
 * 获取RT服务列表（包含已删除data）
 */
export async function getAllServicesApi(): Promise<any[]> {
  return await axios.get(`/api/v1/finetune/server/filters`);
}

/**
 * 添加服务
 */
export async function addServiceApi(name: string, url: string, ftUrl: string): Promise<{ id: number }> {
  return await axios.post(`/api/v1/server/add`,
    { endpoint: url, sft_endpoint: ftUrl, server: name, remark: 'RT模块创建' });
}

/**
 * 删除知识库下文件
 *
 */
export async function deleteServiceApi(id) {
  return await axios.delete(`/api/v1/server/${id}`);
}

/**
 * 获取发布模型的状态信息
 */
export async function getModelInfoApi(id) {
  return await axios.get(`/api/v1/server/model/${id}`);
}


export async function postValidateCode(
  code: string
): Promise<any> {
  return await axios.post("/api/v1/validate/code", { code });
}

/**
 * Checks the prompt for the code block by sending it to an API endpoint.
 * @param {string} name - The name of the field to check.
 * @param {string} template - The template string of the prompt to check.
 * @param {APIClassType} frontend_node - The frontend node to check.
 * @returns A promise that resolves to an AxiosResponse containing the validation results.
 */
export async function postValidatePrompt(
  name: string,
  template: string,
  frontend_node: APIClassType
): Promise<any> {
  return await axios.post("/api/v1/validate/prompt", {
    name: name,
    template: template,
    frontend_node: frontend_node,
  });
}

/**
 * 获取会话列表
 */
export const getChatsApi = (page) => {
  return (axios.get(`/api/v1/chat/list?page=${page}&limit=40`) as Promise<any[]>).then(res =>
    res?.filter((el,i) => el.chat_id) || []
  )
};

/**
 * 删除会话
 */
export const deleteChatApi = (chatId) => {
  return axios.delete(`/api/v1/chat/${chatId}`)
};


/**
 * 获取会话消息记录
 *
 * @param id flow_id chat_id - .
 * @returns {Promise<any>} his data.
 */
export interface MessageDB {
  /** 场景 */
  category: string;
  chat_id: string;
  create_time: string;
  extra: string;
  /** 文件列表 */
  files: string;
  flow_id: string;
  id: number;
  /** 日志 */
  intermediate_steps: string;
  /** 机器人回复 */
  is_bot: boolean;
  /** 已点赞 */
  liked: number;
  /** 消息内容 */
  message: string;
  receiver: null;
  remark: null;
  sender: string;
  solved: number;
  /** 有溯源 */
  source: number;
  type: string;
  update_time: string;
  user_id: number;
}

export async function getChatHistory(flowId: string, chatId: string, pageSize: number, id?: number): Promise<MessageDB[]> {
  return await axios.get(`/api/v1/chat/history?flow_id=${flowId}&chat_id=${chatId}&page_size=${pageSize}&id=${id || ''}`);
}

/**
 * 赞 踩消息
 */
export const likeChatApi = (chatId, liked) => {
  return axios.post(`/api/v1/liked`, { message_id: chatId, liked });
};

/**
 * 踩消息反馈
 */
export const disLikeCommentApi = (message_id, comment) => {
  return axios.post(`/api/v1/chat/comment`, { message_id, comment });
};

/**
 * Fetches the version of the API.
 *
 * @returns {Promise<AxiosResponse<any>>} A promise that resolves to an AxiosResponse containing the version information.
 */
export async function getVersion() {
  const respnose = await axios.get("/api/v1/version");
  return respnose.data;
}

/**
 * Fetches the build status of a flow.
 * @param {string} flowId - The ID of the flow to fetch the build status for.
 * @returns {Promise<BuildStatusTypeAPI>} A promise that resolves to an AxiosResponse containing the build status.
 *
 */
export async function getBuildStatus(
  flowId: string,
  versionId?: number
): Promise<BuildStatusTypeAPI> {
  const qstr = versionId ? `?version_id=${versionId}` : "";
  return await axios.get(`/api/v1/build/${flowId}/status${qstr}`);
}

//docs for postbuildinit
/**
 * Posts the build init of a flow.
 * @param {string} flowId - The ID of the flow to fetch the build status for.
 * @returns {Promise<InitTypeAPI>} A promise that resolves to an AxiosResponse containing the build status.
 *
 */
export async function postBuildInit(data: {
  flow: FlowType
  chatId?: string
  versionId?: number
}): Promise<any> {
  const { flow, chatId, versionId } = data;
  const qstr = versionId ? `?version_id=${versionId}` : ''
  return await axios.post(`/api/v1/build/init/${flow.id}${qstr}`, chatId ? { chat_id: chatId } : flow);
}

// fetch(`/upload/${id}`, {
//   method: "POST",
//   body: formData,
// });
/**
 * Uploads a file to the server.
 * @param {File} file - The file to upload.
 * @param {string} id - The ID of the flow to upload the file to.
 */
export async function uploadFile(
  file: File,
  id: string
): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  return await axios.post(`/api/v1/upload/${id}`, formData);
}

/***************************
 * ************ model ************ 
 */
/**
 * 获取知识库下文件列表
 *
 */
export async function serverListApi(byRtName?: string): Promise<any[]> {
  return await axios.get(`/api/v1/server/list`).then((list: any) => {
    return byRtName ? list.filter(item => item.server === byRtName) : list
  });
}

/**
 * 上下线
 */
export async function switchOnLineApi(id, on) {
  return await axios.post(`/api/v1/server/${on ? 'load' : 'unload'}`, { deploy_id: id });
}

/**
 * 修改配置
 */
export async function updateConfigApi(id, config) {
  return await axios.post(`/api/v1/server/update`, { id, config });
}

/**
 * 获取gpu
 *
 */
export async function GPUlistApi(): Promise<any> {
  return await axios.get(`/api/v1/server/GPU`);
}
export async function GPUlistByFinetuneApi(): Promise<any> {
  return await axios.get(`/api/v1/finetune/gpu`);
}

/***************************
 * ************ 溯源 ************ 
 */
// 分词
export async function splitWordApi(word: string, messageId: string): Promise<string[]> {
  return await axios.get(`/api/v1/qa/keyword?answer=${encodeURIComponent(word)}&message_id=${messageId}`)
}

// 获取 chunks
export async function getSourceChunksApi(chatId: string, messageId: number, keys: string) {
  try {
    let chunks: any[] = await axios.get(`/api/v1/qa/chunk?chat_id=${chatId}&message_id=${messageId}&keys=${keys}`)

    const fileMap = {}
    chunks.forEach(chunk => {
      const list = fileMap[chunk.file_id]
      if (list) {
        fileMap[chunk.file_id].push(chunk)
      } else {
        fileMap[chunk.file_id] = [chunk]
      }
    });

    return Object.keys(fileMap).map(fileId => {
      const { file_id: id, source: fileName, source_url: fileUrl, original_url: originUrl, ...other } = fileMap[fileId][0]

      const chunks = fileMap[fileId].sort((a, b) => b.score - a.score)
        .map(chunk => ({
          box: chunk.chunk_bboxes,
          score: chunk.score
        }))
      const score = chunks[0].score

      return { id, fileName, fileUrl, originUrl, chunks, ...other, score }
    }).sort((a, b) => b.score - a.score)
  } catch (error) {
    console.error(error);
    throw error;
  }
}
