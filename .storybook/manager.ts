import { addons } from '@storybook/manager-api'
import { themes } from '@storybook/theming'
import { create } from '@storybook/theming/create'

const theme = create({
  base: 'light',
  
  // Brand
  brandTitle: 'Viport Design System',
  brandUrl: 'https://viport.com',
  brandTarget: '_self',

  // Colors
  colorPrimary: '#2563eb',
  colorSecondary: '#64748b',

  // UI
  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appBorderColor: '#e2e8f0',
  appBorderRadius: 6,

  // Text
  textColor: '#0f172a',
  textInverseColor: '#ffffff',

  // Toolbar
  barTextColor: '#64748b',
  barSelectedColor: '#2563eb',
  barBg: '#f8fafc',

  // Form
  inputBg: '#ffffff',
  inputBorder: '#d1d5db',
  inputTextColor: '#0f172a',
  inputBorderRadius: 6,
})

addons.setConfig({
  theme,
  panelPosition: 'bottom',
  selectedPanel: 'controls',
})