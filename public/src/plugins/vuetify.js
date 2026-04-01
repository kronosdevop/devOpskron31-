// src/plugins/vuetify.js
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Import VTimePicker from labs
import { VTimePicker } from 'vuetify/labs/VTimePicker'
import { VDateInput } from 'vuetify/labs/VDateInput';

export default createVuetify({
  components: {
    ...components,
    VTimePicker,
    VDateInput, // ✅ Add VTimePicker to the list
  },
  directives,
  theme: {
    themes: {
      light: {
        colors: {
          primary: "#DB4C77",
          secondary: '#10559A',
          // background: '#DB4C77',
        }
      },
    }
  },
})
