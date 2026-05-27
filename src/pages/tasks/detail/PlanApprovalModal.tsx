import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Empty,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Spin,
  Table,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { buildOrderedLanguageGroups, type PlanRow } from './planModel';

export type PlanApprovalModalProps = {
  open: boolean;
  onCancel: () => void;
  title: string;
  loading: boolean;
  planRows: PlanRow[];
  /** Returns new group id so the modal can select it */
  addPlanLanguage: () => string;
  addPlanCategory: (languageGroupId: string) => void;
  setLanguageGroupLanguage: (languageGroupId: string, language: string) => void;
  setLanguageGroupLevel: (
    languageGroupId: string,
    languageLevel: number,
  ) => void;
  removeLanguageGroup: (languageGroupId: string) => void;
  onSaveDraft: () => void;
  onReject: () => void;
  onApprove: () => void;
  updatePlanRow: (
    rowId: string,
    key: keyof PlanRow,
    value: string | number,
  ) => void;
  removePlanRow: (rowId: string) => void;
};

export const PlanApprovalModal: React.FC<PlanApprovalModalProps> = ({
  open,
  onCancel,
  title,
  loading,
  planRows,
  addPlanLanguage,
  addPlanCategory,
  setLanguageGroupLanguage,
  setLanguageGroupLevel,
  removeLanguageGroup,
  onSaveDraft,
  onReject,
  onApprove,
  updatePlanRow,
  removePlanRow,
}) => {
  const [langSearch, setLangSearch] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const groups = useMemo(
    () => buildOrderedLanguageGroups(planRows),
    [planRows],
  );

  const filteredGroups = useMemo(() => {
    const q = langSearch.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => {
      const label = (g.language || '').toLowerCase();
      return label.includes(q);
    });
  }, [groups, langSearch]);

  const sidebarGroups = useMemo(() => {
    const sel = groups.find((g) => g.language_group_id === selectedGroupId);
    if (!sel) return filteredGroups;
    if (filteredGroups.some((g) => g.language_group_id === selectedGroupId)) {
      return filteredGroups;
    }
    return [sel, ...filteredGroups];
  }, [filteredGroups, groups, selectedGroupId]);

  useEffect(() => {
    if (!open) return;
    const ids = groups.map((g) => g.language_group_id);
    if (ids.length === 0) {
      setSelectedGroupId('');
      return;
    }
    const fallback = ids[0];
    if (fallback === undefined) return;
    setSelectedGroupId((prev) =>
      prev && ids.includes(prev) ? prev : fallback,
    );
  }, [open, groups]);

  const selectedGroup = useMemo(
    () => groups.find((g) => g.language_group_id === selectedGroupId),
    [groups, selectedGroupId],
  );

  const handleAddLanguage = () => {
    const gid = addPlanLanguage();
    setSelectedGroupId(gid);
    setLangSearch('');
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      width={1180}
      footer={[
        <Button key="save" onClick={onSaveDraft}>
          保存
        </Button>,
        <Button key="reject" danger onClick={onReject}>
          拒绝
        </Button>,
        <Button key="approve" type="primary" onClick={onApprove}>
          接受
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <div
          style={{
            display: 'flex',
            gap: 0,
            minHeight: 440,
            border: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: 220,
              flexShrink: 0,
              borderRight:
                '1px solid var(--ant-color-border-secondary, #f0f0f0)',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--ant-color-fill-alter, #fafafa)',
            }}
          >
            <div
              style={{
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <Input
                allowClear
                placeholder="搜索语言…"
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
              />
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                block
                onClick={handleAddLanguage}
              >
                新增语言
              </Button>
            </div>
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: '0 8px 12px',
              }}
            >
              {sidebarGroups.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="无匹配语言"
                />
              ) : (
                sidebarGroups.map((g) => {
                  const active = g.language_group_id === selectedGroupId;
                  const display = g.language.trim() || '（未命名）';
                  return (
                    <div
                      key={g.language_group_id}
                      style={{
                        padding: '10px 10px',
                        marginBottom: 6,
                        borderRadius: 6,
                        border: `1px solid ${active ? 'var(--ant-color-primary, #1677ff)' : 'transparent'}`,
                        background: active
                          ? 'var(--ant-color-primary-bg, #e6f4ff)'
                          : '#fff',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedGroupId(g.language_group_id)}
                        style={{
                          minWidth: 0,
                          flex: 1,
                          margin: 0,
                          padding: 0,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          font: 'inherit',
                          color: 'inherit',
                        }}
                      >
                        <Typography.Text
                          ellipsis
                          style={{ display: 'block', fontWeight: 500 }}
                        >
                          {display}
                        </Typography.Text>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          语言优先级 {g.language_level} · {g.rows.length} 个类别
                        </Typography.Text>
                      </button>
                      <Popconfirm
                        title="删除该语言及其下全部类别？"
                        okText="删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                        onConfirm={(e) => {
                          e?.stopPropagation?.();
                          removeLanguageGroup(g.language_group_id);
                        }}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {!selectedGroup ? (
              <Empty description="请新增或选择一个语言" />
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <Typography.Text strong>风险类别</Typography.Text>
                  <Input
                    style={{ width: 200 }}
                    placeholder="language"
                    value={selectedGroup.language}
                    onChange={(e) =>
                      setLanguageGroupLanguage(
                        selectedGroup.language_group_id,
                        e.target.value,
                      )
                    }
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: 'var(--ant-color-text-secondary)',
                    }}
                  >
                    语言优先级
                  </span>
                  <InputNumber
                    min={1}
                    max={100}
                    value={selectedGroup.language_level}
                    onChange={(v) =>
                      setLanguageGroupLevel(
                        selectedGroup.language_group_id,
                        Number(v ?? 1),
                      )
                    }
                  />
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      addPlanCategory(selectedGroup.language_group_id)
                    }
                  >
                    新增类别
                  </Button>
                </div>
                <Table<PlanRow>
                  size="small"
                  rowKey="id"
                  pagination={false}
                  scroll={{ y: 340, x: 980 }}
                  dataSource={selectedGroup.rows}
                  columns={[
                    {
                      title: 'category_name',
                      dataIndex: 'category_name',
                      width: 180,
                      render: (value, row) => (
                        <Input
                          value={value}
                          onChange={(e) =>
                            updatePlanRow(
                              row.id,
                              'category_name',
                              e.target.value,
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: '类别优先级 (1高,100低)',
                      dataIndex: 'level',
                      width: 130,
                      render: (value, row) => (
                        <InputNumber
                          min={1}
                          max={100}
                          style={{ width: '100%' }}
                          value={value}
                          onChange={(v) =>
                            updatePlanRow(row.id, 'level', Number(v ?? 1))
                          }
                        />
                      ),
                    },
                    {
                      title: 'risk_description',
                      dataIndex: 'risk_description',
                      width: 260,
                      render: (value, row) => (
                        <Input
                          value={value}
                          onChange={(e) =>
                            updatePlanRow(
                              row.id,
                              'risk_description',
                              e.target.value,
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: 'reasoning_basis',
                      dataIndex: 'reasoning_basis',
                      width: 260,
                      render: (value, row) => (
                        <Input
                          value={value}
                          onChange={(e) =>
                            updatePlanRow(
                              row.id,
                              'reasoning_basis',
                              e.target.value,
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: '操作',
                      width: 72,
                      fixed: 'right',
                      render: (_, row) => (
                        <Button
                          danger
                          type="link"
                          size="small"
                          onClick={() => removePlanRow(row.id)}
                        >
                          删除
                        </Button>
                      ),
                    },
                  ]}
                />
              </>
            )}
          </div>
        </div>
      </Spin>
    </Modal>
  );
};
