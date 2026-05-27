import { EllipsisOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Popconfirm } from 'antd';
import React from 'react';
import type { ProjectListItem } from '@/services/projects';
import { useProjectPageStyles } from '../projectStyles';
import {
  countLanguages,
  formatCount,
  formatLastScanned,
  getLanguageMeta,
  getPrimaryLanguageName,
  getSourceTypeLabel,
} from '../projectUtils';
import LanguageBar from './LanguageBar';

type ProjectCardProps = {
  project: ProjectListItem;
  onDelete: (id: string) => void;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const { styles } = useProjectPageStyles();
  const primaryLang = getPrimaryLanguageName(project.language);
  const langMeta = getLanguageMeta(primaryLang);
  const codeTotal = project.language?.total?.code ?? project.lineCount;
  const langCount = countLanguages(project.language);

  const menuItems: MenuProps['items'] = [
    {
      key: 'delete',
      label: (
        <Popconfirm
          title="确认删除该项目？"
          description="删除后无法恢复"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(project.id)}
        >
          <span className={styles.dangerText}>删除项目</span>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className={styles.projectCard}>
      <div className={styles.cardTop}>
        <div className={styles.projectTitle}>
          <div className={styles.projectIcon} style={{ color: langMeta.color }}>
            {langMeta.icon}
          </div>
          <div className={styles.titleText}>
            <div className={styles.projectName} title={project.name}>
              {project.name}
            </div>
            {project.sourceType ? (
              <div className={styles.tags}>
                <span className={`${styles.tag} ${styles.tag_path}`}>
                  {getSourceTypeLabel(project.sourceType)}
                </span>
              </div>
            ) : null}
          </div>
        </div>
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <button
            type="button"
            className={styles.moreBtn}
            aria-label="更多操作"
          >
            <EllipsisOutlined />
          </button>
        </Dropdown>
      </div>

      <div className={styles.infoRow}>
        <div className={styles.infoCell}>
          <div className={styles.infoLabel}>仓库路径</div>
          <div className={styles.infoValue} title={project.repoPath}>
            {project.repoPath || '—'}
          </div>
        </div>
        <div className={styles.infoCellBranch}>
          <div className={styles.infoLabel}>分支</div>
          <div className={styles.infoValue}>{project.branch ?? '—'}</div>
        </div>
      </div>

      <div className={styles.riskBox}>
        <RiskItem
          label="漏洞数"
          value={formatCount(project.vulnerabilityCount)}
          styles={styles}
        />
        <RiskItem
          label="高危/严重"
          value={formatCount(project.highRiskCount)}
          danger={project.highRiskCount > 0}
          styles={styles}
        />
      </div>

      <div className={styles.codeMeta}>
        <MetaItem
          label="代码数量"
          value={formatCount(codeTotal)}
          styles={styles}
        />
        <MetaItem
          label="文件数量"
          value={formatCount(project.fileCount)}
          styles={styles}
        />
        <MetaItem
          label="涉及语言"
          value={String(langCount || '—')}
          styles={styles}
        />
      </div>

      <LanguageBar language={project.language} />

      <div className={styles.cardFooter}>
        <span className={styles.footerScan}>
          最近扫描：{formatLastScanned(project.lastScannedAt)}
        </span>
        <Button
          className={styles.linkBtn}
          onClick={() => {
            const q = new URLSearchParams({ projectId: project.id });
            history.push(`/vulnerabilities?${q.toString()}`);
          }}
        >
          查看漏洞
        </Button>
      </div>
    </div>
  );
};

function RiskItem({
  label,
  value,
  danger,
  styles,
}: {
  label: string;
  value: string;
  danger?: boolean;
  styles: ReturnType<typeof useProjectPageStyles>['styles'];
}) {
  return (
    <div className={styles.riskItem}>
      <div className={styles.riskLabel}>{label}</div>
      <div className={danger ? styles.riskValueDanger : styles.riskValue}>
        {value}
      </div>
    </div>
  );
}

function MetaItem({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof useProjectPageStyles>['styles'];
}) {
  return (
    <div className={styles.metaItem}>
      <div className={styles.metaTitle}>{label}</div>
      <div className={styles.metaValue}>{value}</div>
    </div>
  );
}

export default ProjectCard;
