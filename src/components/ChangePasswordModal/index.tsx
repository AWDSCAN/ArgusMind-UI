import { Alert, App, Form, Input, Modal } from 'antd';
import React, { useEffect } from 'react';
import { DEFAULT_INITIAL_PASSWORD } from '@/constants/auth';
import { changePasswordApiAuthChangePasswordPost } from '@/services/swagger/auth';

export type ChangePasswordFormValues = {
  old_password: string;
  new_password: string;
  confirm_password: string;
};

export type ChangePasswordModalProps = {
  open: boolean;
  /** 首次登录强制改密：不可关闭，隐藏当前密码并自动使用初始密码 */
  forced?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
};

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  forced = false,
  onCancel,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (forced) {
      form.setFieldsValue({ old_password: DEFAULT_INITIAL_PASSWORD });
    }
  }, [open, forced, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await changePasswordApiAuthChangePasswordPost({
        old_password: values.old_password,
        new_password: values.new_password,
      });
      message.success(forced ? '密码已更新，请妥善保管新密码' : '密码修改成功');
      form.resetFields();
      onSuccess?.();
    } catch (error: any) {
      if (error?.errorFields) return;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (forced) return;
    form.resetFields();
    onCancel?.();
  };

  return (
    <Modal
      title={forced ? '首次登录，请修改密码' : '修改密码'}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnHidden
      okText="确定"
      cancelText="取消"
      cancelButtonProps={forced ? { style: { display: 'none' } } : undefined}
      closable={!forced}
      maskClosable={!forced}
      keyboard={!forced}
    >
      {forced && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="检测到您正在使用系统初始密码"
          description="为保障账号安全，请立即设置新密码后再继续使用系统。"
        />
      )}
      <Form form={form} layout="vertical" preserve={false}>
        {!forced && (
          <Form.Item
            name="old_password"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password
              placeholder="请输入当前密码"
              autoComplete="current-password"
            />
          </Form.Item>
        )}
        {forced && (
          <Form.Item name="old_password" hidden>
            <Input />
          </Form.Item>
        )}
        <Form.Item
          name="new_password"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '新密码至少 6 位' },
            {
              validator: (_, value) => {
                if (!value || value !== DEFAULT_INITIAL_PASSWORD) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('新密码不能与初始密码相同'));
              },
            },
          ]}
        >
          <Input.Password
            placeholder="请输入新密码"
            autoComplete="new-password"
          />
        </Form.Item>
        <Form.Item
          name="confirm_password"
          label="确认新密码"
          dependencies={['new_password']}
          rules={[
            { required: true, message: '请再次输入新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('new_password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的新密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="请再次输入新密码"
            autoComplete="new-password"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
