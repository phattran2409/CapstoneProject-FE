import type { MatchFormat } from '../types/room.types';

export const MATCH_FORMAT_VS_LABEL: Record<MatchFormat, string> = {
  FiveVsFive: '5 vs 5',
  SevenVsSeven: '7 vs 7',
  ElevenVsEleven: '11 vs 11',
};

/** Nhãn hiển thị dạng "5 vs 5" cho giá trị API / matchFormat. */
export function formatMatchFormatVsLabel(format: MatchFormat): string {
  return MATCH_FORMAT_VS_LABEL[format];
}

export function matchFormatToUi(format: MatchFormat): string {
  switch (format) {
    case 'FiveVsFive':
      return '5vs5';
    case 'SevenVsSeven':
      return '7vs7';
    case 'ElevenVsEleven':
      return '11vs11';
    default:
      return '5vs5';
  }
}