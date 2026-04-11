
import { createVuetify } from 'vuetify'

import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#2563EB',
          secondary: '#F59E0B',
          background: '#F5F6F8',
          surface: '#FFFFFF',
          'on-surface': '#374151',
          'surface-variant': '#E5E7EB',
        },
      },
    },
  },
})
