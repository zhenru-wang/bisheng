import { useToast } from "@/components/bs-ui/toast/use-toast";
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { useRef } from "react";
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "../../components/bs-ui/button";
import { Input } from "../../components/bs-ui/input";
import { changePasswordApi } from "../../controllers/API/user";
import { captureAndAlertRequestErrorHoc } from "../../controllers/request";
import { PWD_RULE, handleEncrypt } from './utils';

export const ResetPwdPage = () => {
    const { t } = useTranslation();
    const { message } = useToast();
    const { state } = useLocation()
    const navigate = useNavigate()

    const currentPwdRef = useRef<HTMLInputElement>(null);
    const newPwdRef = useRef<HTMLInputElement>(null);
    const confirmPwdRef = useRef<HTMLInputElement>(null);

    const handleResetPassword = async () => {
        const errors: string[] = [];
        const [currentPwd, newPwd, confirmPwd] = [
            currentPwdRef.current?.value,
            newPwdRef.current?.value,
            confirmPwdRef.current?.value
        ];

        if (!currentPwd) errors.push(t('resetPassword.pleaseEnterCurrentPassword'));
        if (!newPwd) errors.push(t('resetPassword.pleaseEnterNewPassword'));
        if (!confirmPwd) errors.push(t('resetPassword.pleaseEnterConfirmPassword'));
        if (!/.{8,}/.test(newPwd)) errors.push(t('resetPassword.newPasswordTooShort'));
        if (!PWD_RULE.test(newPwd)) errors.push(t('login.passwordError'))
        if (newPwd !== confirmPwd) errors.push(t('resetPassword.passwordMismatch'));

        if (errors.length) {
            return message({
                title: `${t('prompt')}`,
                variant: 'warning',
                description: errors
            });
        }

        const account = localStorage.getItem('account');
        const encryptCurrentPwd = await handleEncrypt(currentPwd);
        const encryptNewPwd = await handleEncrypt(newPwd);

        const res = await captureAndAlertRequestErrorHoc(changePasswordApi(account, encryptCurrentPwd, encryptNewPwd))
        if (res) {
            message({
                title: `${t('prompt')}`,
                variant: 'success',
                description: [t('resetPassword.passwordResetSuccess')]
            });
            // Clear input fields
            if (currentPwdRef.current) currentPwdRef.current.value = '';
            if (newPwdRef.current) newPwdRef.current.value = '';
            if (confirmPwdRef.current) confirmPwdRef.current.value = '';
            // if (!state?.noback) {
            navigate(-1);
            // }
        }
        // }));
    };

    return (
        <div className='w-full h-full bg-background-dark'>
            <div className='fixed z-10 sm:w-[600px] px-[120px] w-full sm:h-[720px] h-full translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%] border rounded-lg shadow-xl overflow-hidden bg-background-login'>
                {!state?.noback && <Button
                    variant='outline'
                    size='icon'
                    className='absolute left-4 top-4'
                    onClick={() => navigate(-1)}
                ><ArrowLeftIcon /></Button>}
                <div className='bg-background-login relative'>
                    <div>
                        <img src="/login-logo-small.png" alt="small_logo" className='block w-[114px] h-[36px] m-auto mt-[140px]' />
                        <span className='block w-fit m-auto font-normal text-[14px] text-tx-color mt-[24px]'>{t('resetPassword.slogen')}</span>
                    </div>
                    <div className="grid gap-[12px] mt-[68px]">
                        <div className="grid">
                            <Input
                                id="currentPassword"
                                className='h-[48px] dark:bg-login-input'
                                ref={currentPwdRef}
                                placeholder={t('resetPassword.currentPassword')}
                                type="password"
                            />
                        </div>
                        <div className="grid">
                            <Input
                                id="newPassword"
                                className='h-[48px] dark:bg-login-input'
                                ref={newPwdRef}
                                placeholder={t('resetPassword.newPassword')}
                                type="password"
                            />
                        </div>
                        <div className="grid">
                            <Input
                                id="confirmNewPassword"
                                className='h-[48px] dark:bg-login-input'
                                ref={confirmPwdRef}
                                placeholder={t('resetPassword.confirmNewPassword')}
                                type="password"
                            />
                        </div>
                        <Button
                            className='h-[48px] mt-[32px] dark:bg-button'
                            onClick={handleResetPassword}
                        >
                            {t('resetPassword.resetButton')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPwdPage;
