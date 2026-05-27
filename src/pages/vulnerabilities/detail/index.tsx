import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { Button, Empty, message, Spin, Tabs } from 'antd';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AuditChainFocusNodeRequest } from '@/components/AuditChainCanvas';
import { ensureTaskDetailPageStylesMounted } from '@/pages/tasks/detail/ensureTaskDetailPageStyles';
import TaskDetailAuditChainTray from '@/pages/tasks/detail/TaskDetailAuditChainTray';
import {
  getVulnerabilityDetail,
  type VulnerabilityDetail,
} from '@/services/vulnerabilities';
import type { AuditChainRawGraph } from '@/types/auditSessionDetail';
import {
  TASK_DETAIL_MAIN_COLUMNS_HEIGHT,
  TASK_DETAIL_MODULE_TABS_CLASS,
  VULN_DETAIL_REPORT_SCROLL_CLASS,
} from './detailStyles';
import ExploitationChainViewer from './ExploitationChainViewer';
import { ensureVulnDetailPageStylesMounted } from './ensureVulnDetailPageStyles';
import { resolveFindingAuditChainGraph } from './findingGraph';
import VulnerabilityReportTab from './VulnerabilityReportTab';
import VulnerabilitySummaryStrip from './VulnerabilitySummaryStrip';

const VulnerabilityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VulnerabilityDetail | null>(null);
  const [auditChainGraph, setAuditChainGraph] =
    useState<AuditChainRawGraph | null>(null);
  const [auditChainFocusRequest, setAuditChainFocusRequest] =
    useState<AuditChainFocusNodeRequest | null>(null);
  const [auditChainPageExpand, setAuditChainPageExpand] = useState(false);
  const [auditChainBrowserFullscreen, setAuditChainBrowserFullscreen] =
    useState(false);
  const auditChainTrayRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setData(null);
      setAuditChainGraph(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getVulnerabilityDetail(id);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setData(null);
        setAuditChainGraph(null);
        message.error('加载漏洞详情失败');
      }
    } catch {
      setData(null);
      setAuditChainGraph(null);
      message.error('加载漏洞详情失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!data?.neo4jElementId?.trim() || !data.taskId?.trim()) {
      setAuditChainGraph(null);
      return;
    }
    let cancelled = false;
    const resultNodeId = data.neo4jElementId.trim();
    void resolveFindingAuditChainGraph(data).then((result) => {
      if (cancelled) return;
      setAuditChainGraph(result?.graph ?? null);
      if (result?.graph.nodes.some((n) => n.elementId === resultNodeId)) {
        setAuditChainFocusRequest({
          elementId: resultNodeId,
          nonce: Date.now(),
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [data?.id, data?.neo4jElementId, data?.taskId]);

  const graphKey = useMemo(
    () => (data ? `${data.taskId}-${data.id}` : (id ?? '')),
    [data, id],
  );

  useEffect(() => {
    setAuditChainFocusRequest(null);
  }, [graphKey]);

  const toggleAuditChainPageExpand = useCallback(() => {
    setAuditChainPageExpand((v) => !v);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const el = auditChainTrayRef.current;
      setAuditChainBrowserFullscreen(
        Boolean(el && document.fullscreenElement === el),
      );
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleAuditChainBrowserFullscreen = useCallback(async () => {
    const el = auditChainTrayRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      message.error('无法进入全屏，请检查浏览器权限');
    }
  }, []);

  useEffect(() => {
    const el = auditChainTrayRef.current;
    if (el && document.fullscreenElement === el) {
      void document.exitFullscreen();
    }
    setAuditChainBrowserFullscreen(false);
  }, [id]);

  const moduleTabs = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: 'report',
        label: '报告',
        children: (
          <div
            className={VULN_DETAIL_REPORT_SCROLL_CLASS}
            style={{ height: '100%', minHeight: 0 }}
          >
            <VulnerabilityReportTab data={data} />
          </div>
        ),
      },
      {
        key: 'chain',
        label: '利用链',
        children: (
          <div
            className={VULN_DETAIL_REPORT_SCROLL_CLASS}
            style={{
              height: '100%',
              overflowY: 'auto',
              padding: '4px 8px 16px 4px',
            }}
          >
            <ExploitationChainViewer chain={data.exploitationChain} />
          </div>
        ),
      },
    ];
  }, [data]);

  if (!id) {
    return (
      <PageContainer title="漏洞详情">
        <Empty description="缺少漏洞 ID" />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      onBack={() => history.push('/vulnerabilities')}
      title="漏洞详情"
      subTitle={data?.title}
      extra={[
        <Button key="list" onClick={() => history.push('/vulnerabilities')}>
          返回列表
        </Button>,
        data?.taskId ? (
          <Button
            key="task"
            type="primary"
            href={`/tasks/${data.taskId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            打开关联任务
          </Button>
        ) : null,
      ]}
    >
      <Spin spinning={loading}>
        {!data && !loading ? (
          <Empty description="漏洞不存在" />
        ) : data ? (
          <>
            <VulnerabilitySummaryStrip data={data} />

            <div
              style={{
                display: 'flex',
                flexWrap: auditChainPageExpand ? 'nowrap' : 'wrap',
                gap: auditChainPageExpand ? 0 : 16,
                alignItems: 'stretch',
                minHeight: TASK_DETAIL_MAIN_COLUMNS_HEIGHT,
              }}
            >
              <div
                style={
                  auditChainPageExpand
                    ? { display: 'none' }
                    : {
                        flex: '1 1 520px',
                        minWidth: 0,
                        height: TASK_DETAIL_MAIN_COLUMNS_HEIGHT,
                        maxHeight: TASK_DETAIL_MAIN_COLUMNS_HEIGHT,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        overflow: 'hidden',
                        paddingRight: 4,
                      }
                }
              >
                <Tabs
                  rootClassName={TASK_DETAIL_MODULE_TABS_CLASS}
                  defaultActiveKey="report"
                  type="line"
                  size="middle"
                  items={moduleTabs}
                  tabBarGutter={20}
                  destroyInactiveTabPane={false}
                  style={{ height: '100%', minHeight: 0 }}
                />
              </div>

              <TaskDetailAuditChainTray
                trayRef={auditChainTrayRef}
                pageExpand={auditChainPageExpand}
                browserFullscreen={auditChainBrowserFullscreen}
                onTogglePageExpand={toggleAuditChainPageExpand}
                onToggleBrowserFullscreen={toggleAuditChainBrowserFullscreen}
                graphKey={graphKey}
                raw={auditChainGraph}
                taskName={data.taskName || data.title}
                focusNodeRequest={auditChainFocusRequest}
                showFilterAndFollowLatest={false}
              />
            </div>
          </>
        ) : null}
      </Spin>
    </PageContainer>
  );
};

ensureVulnDetailPageStylesMounted();
ensureTaskDetailPageStylesMounted();

export default VulnerabilityDetailPage;
