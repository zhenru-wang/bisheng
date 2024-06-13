import { JSEncrypt } from 'jsencrypt';
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import json from "../../../package.json";
import { Button } from "../../components/bs-ui/button";
import { Input } from "../../components/bs-ui/input";
import { GithubIcon } from '@/components/bs-icons/github';
import { BookOpenIcon } from '@/components/bs-icons/bookOpen';
// import { alertContext } from "../contexts/alertContext";
import { getPublicKeyApi, loginApi, getCaptchaApi, registerApi } from "../../controllers/API/user";
import { captureAndAlertRequestErrorHoc } from "../../controllers/request";
import { useToast } from "@/components/bs-ui/toast/use-toast";
import { useNavigate } from 'react-router-dom';
import LoginBridge from './loginBridge';
export const LoginPage = () => {
    // const { setErrorData, setSuccessData } = useContext(alertContext);
    const { t, i18n } = useTranslation();
    const { message, toast } = useToast()
    const navigate = useNavigate()

    const isLoading = false

    const mailRef = useRef(null)
    const pwdRef = useRef(null)
    const agenPwdRef = useRef(null)

    // login or register
    const [showLogin, setShowLogin] = useState(true)

    // captcha
    const captchaRef = useRef(null)
    const [captchaData, setCaptchaData] = useState({ captcha_key: '', user_capthca: false, captcha: '' });

    useEffect(() => {
        fetchCaptchaData();
    }, []);

    const fetchCaptchaData = () => {
        getCaptchaApi().then(setCaptchaData)
    };

    const handleLogin = async () => {
        const error = []
        const [mail, pwd] = [mailRef.current.value, pwdRef.current.value]
        if (!mail) error.push(t('login.pleaseEnterAccount'))
        if (!pwd) error.push(t('login.pleaseEnterPassword'))
        if (captchaData.user_capthca && !captchaRef.current.value) error.push(t('login.pleaseEnterCaptcha'))
        if (error.length) return message({
            title: `${t('prompt')}`,
            variant: 'warning',
            description: error
        })
        // if (error.length) return setErrorData({
        //     title: `${t('prompt')}:`,
        //     list: error,
        // });

        const encryptPwd = await handleEncrypt(pwd)
        captureAndAlertRequestErrorHoc(loginApi(mail, encryptPwd, captchaData.captcha_key, captchaRef.current?.value).then((res: any) => {
            // setUser(res.data)
            localStorage.setItem('ws_token', res.access_token)
            localStorage.setItem('isLogin', '1')
            location.href = '/'
        }), (error) => {
            if (error === '密码不正确') {
                localStorage.setItem('account', mail)
                navigate('/reset', { state: { noback: true } })
            }
        })

        fetchCaptchaData()
    }

    const handleRegister = async () => {
        const error = []
        const [mail, pwd, apwd] = [mailRef.current.value, pwdRef.current.value, agenPwdRef.current.value]
        if (!mail) {
            error.push(t('login.pleaseEnterAccount'))
        }
        if (mail.length < 3) {
            error.push(t('login.accountTooShort'))
        }
        if (!/.{8,}/.test(pwd)) {
            error.push(t('login.passwordTooShort'))
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pwd)) {
            error.push(t('login.passwordError'))
        }
        if (pwd !== apwd) {
            error.push(t('login.passwordMismatch'))
        }
        if (captchaData.user_capthca && !captchaRef.current.value) {
            error.push(t('login.pleaseEnterCaptcha'))
        }
        if (error.length) {
            return message({
                title: `${t('prompt')}`,
                variant: 'warning',
                description: error
            })
        }
        const encryptPwd = await handleEncrypt(pwd)
        captureAndAlertRequestErrorHoc(registerApi(mail, encryptPwd, captchaData.captcha_key, captchaRef.current?.value).then(res => {
            // setSuccessData({ title: t('login.registrationSuccess') })
            message({
                title: `${t('prompt')}`,
                variant: 'success',
                description: [t('login.registrationSuccess')]
            })
            pwdRef.current.value = ''
            setShowLogin(true)
        }))

        fetchCaptchaData()
    }

    const handleEncrypt = async (pwd) => {
        const { public_key } = await getPublicKeyApi()
        const encrypt = new JSEncrypt()
        encrypt.setPublicKey(public_key)
        return encrypt.encrypt(pwd) as string
    }

    return <div className='w-full h-full bg-background-dark'>
        <div className='fixed z-10 sm:w-[1280px] w-full sm:h-[720px] h-full translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%] border rounded-lg shadow-xl overflow-hidden bg-background-login'>
            <div className='w-[420px] h-[704px] m-[8px] hidden sm:block'>
                <img src="/login-logo-big.png" alt="logo_picture" className='w-full h-full dark:hidden' />
                <img src="/login-logo-dark.png" alt="logo_picture" className='w-full h-full hidden dark:block' />
            </div>
            <div className='absolute w-full h-full z-10 flex justify-end top-0'>
                <div className='w-[852px] sm:px-[266px] px-[20px] pyx-[200px] bg-background-login relative'>
                    <div>
                        <img src="/login-logo-small.png" alt="small_logo" className='block w-[114px] h-[36px] m-auto mt-[140px]' />
                        <span className='block w-fit m-auto font-normal text-[14px] text-tx-color mt-[24px]'>{t('login.slogen')}</span>
                    </div>
                    <div className="grid gap-[12px] mt-[68px]">
                        <div className="grid">
                            <Input
                                id="email"
                                className='h-[48px] dark:bg-login-input'
                                ref={mailRef}
                                placeholder={t('login.account')}
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                            />
                        </div>
                        <div className="grid">
                            <Input
                                id="pwd"
                                className='h-[48px] dark:bg-login-input'
                                ref={pwdRef}
                                placeholder={t('login.password')}
                                type="password"
                                onKeyDown={e => e.key === 'Enter' && showLogin && handleLogin()} />
                        </div>
                        {
                            !showLogin && <div className="grid">
                                <Input id="pwd"
                                    className='h-[48px] dark:bg-login-input'
                                    ref={agenPwdRef}
                                    placeholder={t('login.confirmPassword')}
                                    type="password" />
                            </div>
                        }
                        {
                            captchaData.user_capthca && (<div className="flex items-center gap-4">
                                <Input
                                    type="text"
                                    ref={captchaRef}
                                    placeholder={t('login.pleaseEnterCaptcha')}
                                    className="form-input px-4 py-2 border border-gray-300 focus:outline-none"
                                />
                                <img
                                    src={'data:image/jpg;base64,' + captchaData.captcha} // 这里应该是你的验证码图片的URL
                                    alt="captcha"
                                    onClick={fetchCaptchaData} // 这里应该是你的刷新验证码函数
                                    className="cursor-pointer h-10 bg-gray-100 border border-gray-300"
                                    style={{ width: '120px' }} // 根据需要调整宽度
                                />
                            </div>
                            )
                        }
                        {
                            showLogin ? <>
                                <div className="text-center">
                                    <a href="javascript:;" className=" text-blue-500 text-sm hover:underline" onClick={() => setShowLogin(false)}>{t('login.noAccountRegister')}</a>
                                </div>
                                <Button
                                    className='h-[48px] mt-[32px] dark:bg-button'
                                    disabled={isLoading} onClick={handleLogin} >{t('login.loginButton')}</Button>
                            </> :
                                <>
                                    <div className="text-center">
                                        <a href="javascript:;" className=" text-blue-500 text-sm hover:underline" onClick={() => setShowLogin(true)}>{t('login.haveAccountLogin')}</a>
                                    </div>
                                    <Button
                                        className='h-[48px] mt-[32px] dark:bg-button'
                                        disabled={isLoading} onClick={handleRegister} >{t('login.registerButton')}</Button>
                                </>
                        }
                        <LoginBridge />
                    </div>
                    <div className=" absolute right-[16px] bottom-[16px] flex">
                        <span className="mr-4 text-sm text-gray-400 relative top-2">v{json.version}</span>
                        <div className='help flex'>
                            <a href={"https://github.com/dataelement/bisheng"} target="_blank">
                                <GithubIcon className="block h-[40px] w-[40px] gap-1 border p-[10px] rounded-[8px] mx-[8px] hover:bg-[#1b1f23] hover:text-[white] hover:cursor-pointer" />
                            </a>
                            <a href={"https://m7a7tqsztt.feishu.cn/wiki/ZxW6wZyAJicX4WkG0NqcWsbynde"} target="_blank">
                                <BookOpenIcon className="block h-[40px] w-[40px] gap-1 border p-[10px] rounded-[8px]  hover:bg-[#0055e3] hover:text-[white] hover:cursor-pointer" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
};