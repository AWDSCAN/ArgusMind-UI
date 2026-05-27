import { Tooltip } from 'antd';
import React from 'react';
import type { ProjectLanguageStats } from '@/services/projects';
import { useProjectPageStyles } from '../projectStyles';
import {
  formatCount,
  getLanguageBreakdown,
  getLanguageLegendItems,
} from '../projectUtils';

type LanguageBarProps = {
  language: ProjectLanguageStats | null;
};

const LanguageBar: React.FC<LanguageBarProps> = ({ language }) => {
  const { styles } = useProjectPageStyles();
  const slices = getLanguageBreakdown(language);
  const legend = getLanguageLegendItems(language);

  if (!slices.length && !legend.length) {
    return (
      <div className={styles.langSection}>
        <div className={styles.langTitle}>语言分布</div>
        <div className={styles.langBarEmpty}>语言统计待采集</div>
      </div>
    );
  }

  return (
    <div className={styles.langSection}>
      <div className={styles.langTitle}>语言分布</div>
      <Tooltip
        title={
          slices.length ? (
            <div className={styles.langTooltip}>
              {slices.map((s) => (
                <div key={s.name} className={styles.langTooltipRow}>
                  <span
                    className={styles.langDot}
                    style={{ background: s.color }}
                  />
                  <span>
                    {s.name} {s.percent.toFixed(1)}% · {formatCount(s.code)}{' '}
                    行代码
                  </span>
                </div>
              ))}
            </div>
          ) : null
        }
      >
        <div className={styles.langBarTrack} role="img" aria-label="语言构成">
          {slices.map((s) => (
            <span
              key={s.name}
              className={styles.langBarSegment}
              style={{
                width: `${Math.max(s.percent, 0.5)}%`,
                backgroundColor: s.color,
              }}
            />
          ))}
        </div>
      </Tooltip>
      <div className={styles.langList}>
        {legend.map((item) => (
          <span key={item.name} className={styles.langListItem}>
            <i className={styles.langDot} style={{ background: item.color }} />
            {item.name} {item.display}
            {item.suffix}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LanguageBar;
