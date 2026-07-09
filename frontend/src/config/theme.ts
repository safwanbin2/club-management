import type { ThemeConfig } from 'antd'
import { theme } from 'antd'

export const brandTheme = {
  background: '#ffffff',
  border: '#e4e7ec',
  danger: '#c52222',
  info: '#2563eb',
  primary: '#6a0032',
  primaryHover: '#560029',
  primarySoft: '#f7e9f0',
  secondaryBackground: '#f7f8fa',
  success: '#16803c',
  surface: '#ffffff',
  text: '#26313f',
  textMuted: '#98a2b3',
  textSoft: '#667085',
  violet: '#7c3aed',
  warning: '#b76e00'
} as const

export const antdTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  cssVar: {
    key: 'ucms'
  },
  components: {
    Button: {
      borderRadius: 8,
      colorPrimary: brandTheme.primary,
      colorPrimaryActive: brandTheme.primaryHover,
      colorPrimaryHover: brandTheme.primaryHover,
      primaryShadow: 'none'
    },
    Card: {
      borderRadiusLG: 8,
      colorBgContainer: brandTheme.surface
    },
    Form: {
      labelColor: brandTheme.textSoft
    },
    Input: {
      activeBorderColor: brandTheme.primary,
      activeShadow: `0 0 0 2px ${brandTheme.primarySoft}`,
      hoverBorderColor: brandTheme.primary
    },
    Layout: {
      bodyBg: brandTheme.background,
      headerBg: brandTheme.surface,
      siderBg: brandTheme.surface
    },
    Menu: {
      itemBorderRadius: 8,
      itemColor: brandTheme.textSoft,
      itemHoverBg: brandTheme.secondaryBackground,
      itemSelectedBg: brandTheme.primarySoft,
      itemSelectedColor: brandTheme.primary
    },
    Modal: {
      borderRadiusLG: 8,
      titleColor: brandTheme.text
    },
    Select: {
      activeBorderColor: brandTheme.primary,
      activeOutlineColor: brandTheme.primarySoft,
      hoverBorderColor: brandTheme.primary,
      optionSelectedBg: brandTheme.primarySoft
    },
    Table: {
      borderColor: brandTheme.border,
      headerBg: brandTheme.secondaryBackground,
      headerColor: brandTheme.textSoft,
      rowHoverBg: brandTheme.secondaryBackground
    },
    Tabs: {
      inkBarColor: brandTheme.primary,
      itemActiveColor: brandTheme.primary,
      itemHoverColor: brandTheme.primary,
      itemSelectedColor: brandTheme.primary
    },
    Tag: {
      borderRadiusSM: 8
    }
  },
  token: {
    borderRadius: 8,
    colorBgBase: brandTheme.background,
    colorBgContainer: brandTheme.surface,
    colorBgElevated: brandTheme.surface,
    colorBgLayout: brandTheme.background,
    colorBorder: brandTheme.border,
    colorError: brandTheme.danger,
    colorInfo: brandTheme.info,
    colorLink: brandTheme.primary,
    colorLinkActive: brandTheme.primaryHover,
    colorLinkHover: brandTheme.primaryHover,
    colorPrimary: brandTheme.primary,
    colorPrimaryActive: brandTheme.primaryHover,
    colorPrimaryBg: brandTheme.primarySoft,
    colorPrimaryHover: brandTheme.primaryHover,
    colorSuccess: brandTheme.success,
    colorText: brandTheme.text,
    colorTextDescription: brandTheme.textMuted,
    colorTextSecondary: brandTheme.textSoft,
    colorWarning: brandTheme.warning,
    controlHeight: 40,
    controlOutline: brandTheme.primarySoft,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    wireframe: false
  }
}
