import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/bs-ui/dialog";
import { Download, Import } from "lucide-react";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSourceChunksApi, splitWordApi } from "../../../controllers/API";
import { downloadFile } from "../../../util/utils";
import FileView, { checkSassUrl } from "./FileView";

// 顶部答案区
const Anwser = ({ id, msg, onInit, onAdd }) => {
    const [html, setHtml] = useState('')
    const pRef = useRef(null)

    // init
    useEffect(() => {
        onInit([])
        const loadData = () => {
            splitWordApi(msg, id).then((res) => {
                // 匹配
                const reg = new RegExp(`(${res.join('|')})`, 'g')
                setHtml(msg.replace(reg, '<span>$1</span>'))
                onInit(res)
            }).catch(e => {
                // 自动重试
                e === '后台处理中，稍后再试' && setTimeout(() => {
                    loadData()
                }, 1800);
            })
        }
        msg && loadData()
    }, [])

    // add 
    useEffect(() => {
        const handleclick = (e) => {
            if (e.target.tagName === 'SPAN') {
                onAdd(e.target.innerText)
            }
        }
        pRef.current.addEventListener('click', handleclick)
        return () => pRef.current?.removeEventListener('click', handleclick)
    }, [])

    return <div className="bg-gray-100 rounded-md py-4 px-2 max-h-24 overflow-y-auto">
        <p ref={pRef} className="anwser-souce" dangerouslySetInnerHTML={{ __html: html }}></p>
    </div>
}

// 
let timer = null
const ResultPanne = ({ chatId, words, data, onClose, onAdd, children }: { chatId: string, words: string[], data: any, onClose: any, onAdd: any, children: any }) => {
    const { t } = useTranslation()
    const [editCustomKey, setEditCustomKey] = useState(false)
    const inputRef = useRef(null)

    const handleAddKeyword = (str: string) => {
        setEditCustomKey(false)
        if (!str) return
        if (inputRef.current) inputRef.current.value = ''
        onAdd(str)
    }

    // 文件s
    const [files, setFiles] = useState([])
    const [file, setFile] = useState(null)
    const loadFiles = () => {
        // if (!words.length) return setFiles([])
        clearTimeout(timer) // 简单防抖
        timer = setTimeout(() => {
            getSourceChunksApi(chatId, data.messageId, words.join(';')).then((_files) => {
                setFiles(_files)
                // 默认打开第一个文件
                _files && setFile(_files[0])
            })
        }, 200);
    }
    // console.log('files :>> ', files);

    useEffect(() => {
        loadFiles()
    }, [words])

    // input show
    const handleOpenInput = () => {
        setEditCustomKey(true)
        setTimeout(() => document.getElementById('taginput')?.focus(), 0);
    }

    return <div className="flex gap-4 mt-4" style={{ height: 'calc(100vh - 10rem)' }}>
        {/* left */}
        <div className="w-[300px] bg-gray-100 rounded-md py-4 px-2 h-full overflow-y-auto no-scrollbar">
            {/* label */}
            <div className="mb-4 text-sm font-bold">
                {t('chat.filterLabel')}
                <div className="tooltip fixed" data-tip={t('chat.tooltipText')}><span data-theme="light" className="badge cursor-pointer">?</span></div>
            </div>
            <div className="flex flex-wrap gap-2">
                {words.map((str, i) => <div key={str} className="badge badge-info h-[auto] gap-2 text-gray-600 bg-[rgba(53,126,249,.15)]">{str}<span className="cursor-pointer" onClick={() => onClose(i)}>x</span></div>)}
                {/* 自定义 */}
                {
                    editCustomKey ? <div className="badge badge-info gap-2 cursor-pointer bg-[rgba(53,126,249,.15)]"><input ref={inputRef} id="taginput" className="w-20 h-4 py-0 border-none outline-none bg-gray-50"
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                                handleAddKeyword(inputRef.current.value);
                            }
                        }}
                        onBlur={() => {
                            handleAddKeyword(inputRef.current.value);
                        }}></input></div> :
                        <div className="badge badge-info gap-2 cursor-pointer bg-[rgba(53,126,249,.86)] text-gray-50" onClick={handleOpenInput}><span>{t('chat.addCustomLabel')}</span></div>
                }
            </div>
            {/* files */}
            <div className="mt-4">
                <p className="mb-4 text-sm font-bold">{t('chat.sourceDocumentsLabel')}</p>
                {files.map(_file =>
                    _file.right ? <div key={_file.id} onClick={() => setFile(_file)} className={`group rounded-xl bg-[#fff] hover-bg-gray-200 flex items-center px-4 mb-2 relative min-h-16 cursor-pointer ${file?.id === _file.id && 'bg-gray-200'}`}>
                        <p className="text-sm break-all">{_file.fileName}</p>
                        <div className="absolute right-1 top-1 gap-2 hidden group-hover:flex">
                            {
                                _file.fileUrl && <div className="tooltip" data-tip={t('chat.downloadPDFTooltip')}>
                                    <a href="javascript:;" onClick={(event) => { downloadFile(checkSassUrl(_file.fileUrl), _file.fileName.replace(/\.[\w\d]+$/, '.pdf')); event.stopPropagation() }} >
                                        <Import color="rgba(53,126,249,1)" size={22} strokeWidth={1.5}></Import>
                                    </a>
                                </div>
                            }
                            {
                                _file.originUrl && <div className="tooltip tooltip-left" data-tip={t('chat.downloadOriginalTooltip')}>
                                    <a href="javascript:;" onClick={(event) => { downloadFile(checkSassUrl(_file.originUrl), _file.fileName); event.stopPropagation() }} >
                                        <Download color="rgba(53,126,249,1)" size={20} strokeWidth={1.5}></Download>
                                    </a>
                                </div>
                            }
                        </div>
                        <span className="absolute right-1 bottom-1 text-blue-400 text-sm">{_file.score}</span>
                    </div> :
                        <div key={_file.id} className={`msk group rounded-xl bg-[#fff] hover-bg-gray-200 flex items-center px-4 mb-2 relative min-h-16 cursor-pointer ${file?.id === _file.id && 'bg-gray-200'}`}>
                            <p className="text-sm blur-sm">是真的马赛克.msk</p>
                            <span className="absolute right-1 bottom-1 text-blue-400 text-sm">{_file.score}</span>
                        </div>
                )}
                {!files.length && <p className="text-sm text-center mt-10 text-gray-500">{t('chat.noMatchedFilesMessage')}</p>}
            </div>
        </div>
        {/* file pane */}
        {file && children(file)}
    </div>
}

const ResouceModal = forwardRef((props, ref) => {
    // labels
    const { t } = useTranslation()

    const [open, setOpen] = useState(false)
    const [keywords, setKeywords] = useState([])
    const handleAddWord = (word: string) => {
        // 去重 更新
        setKeywords(oldWords => oldWords.find(wd => wd === word) ? oldWords : [...oldWords, word])
    }

    const handleDelKeyword = (index: number) => {
        setKeywords(keywords.filter((wd, i) => i !== index))
    }

    const [data, setData] = useState<any>({})
    useImperativeHandle(ref, () => ({
        openModal: (data) => {
            setOpen(true)
            setData(data)
        }
    }));

    const MemoizedFileView = React.memo(FileView);

    return <Dialog open={open} onOpenChange={setOpen} >
        <DialogContent className="min-w-[80%]">
            {/* <DialogHeader>
                <DialogTitle>{t('chat.feedback')}</DialogTitle>
            </DialogHeader> */}
            {open && <div>
                <Anwser id={data.messageId} msg={data.message} onInit={setKeywords} onAdd={handleAddWord}></Anwser>
                <ResultPanne words={keywords} chatId={data.chatId} data={data} onClose={handleDelKeyword} onAdd={handleAddWord}>
                    {
                        (file) => file.fileUrl ?
                            <MemoizedFileView data={file}></MemoizedFileView> :
                            <div className="flex-1 bg-gray-100 rounded-md text-center">
                                <p className="text-gray-500 text-md mt-[40%]">{t('chat.fileStorageFailure')}</p>
                            </div>
                    }
                </ResultPanne>
            </div>}
        </DialogContent>
    </Dialog>
});

export default ResouceModal
