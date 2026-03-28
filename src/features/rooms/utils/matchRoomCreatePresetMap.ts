import type { MatchFormat } from '../types/room.types';

/** Giá trị UI trùng với CreateRoomScreen */
export type UiMatchFormat = '5vs5' | '7vs7' | '11vs11';

export function matchFormatToUi(m: MatchFormat): UiMatchFormat {
  switch (m) {
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

export function uiToMatchFormat(u: UiMatchFormat): MatchFormat {
  switch (u) {
    case '5vs5':
      return 'FiveVsFive';
    case '7vs7':
      return 'SevenVsSeven';
    case '11vs11':
      return 'ElevenVsEleven';
  }
}
