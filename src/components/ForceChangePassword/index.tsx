import { useModel } from '@umijs/max';
import React, { useEffect, useState } from 'react';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { ARGUS_MUST_CHANGE_PASSWORD_KEY } from '@/constants/storage';

const mustChangePassword = () =>
  typeof localStorage !== 'undefined' &&
  localStorage.getItem(ARGUS_MUST_CHANGE_PASSWORD_KEY) === '1';

/** 首次登录使用初始密码后，全局强制改密 */
const ForceChangePassword: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (initialState?.currentUser && mustChangePassword()) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [initialState?.currentUser]);

  const handleSuccess = () => {
    localStorage.removeItem(ARGUS_MUST_CHANGE_PASSWORD_KEY);
    setOpen(false);
  };

  if (!open) {
    return null;
  }

  return <ChangePasswordModal open forced onSuccess={handleSuccess} />;
};

export default ForceChangePassword;
