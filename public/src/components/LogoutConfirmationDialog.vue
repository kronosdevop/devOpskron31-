<template>
  <v-dialog v-model="dialog" max-width="400" persistent>
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        <v-icon color="warning" class="mr-2">mdi-logout</v-icon>
        Confirm Logout
      </v-card-title>
      
      <v-card-text class="pt-4">
        <p class="text-body-1">
          Are you sure you want to logout from the application?
        </p>
        <!-- <p class="text-caption text-grey-darken-1 mt-2">
          You will be redirected to the login page and all unsaved changes will be lost.
        </p> -->
      </v-card-text>
      
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          @click="cancelLogout"
          class="mr-2"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          variant="elevated"
          @click="confirmLogout"
          :loading="loading"
        >
          <v-icon left>mdi-logout</v-icon>
          Logout
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'LogoutConfirmationDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {
    dialog: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  methods: {
    cancelLogout() {
      this.dialog = false
      this.$emit('cancel')
    },
    async confirmLogout() {
      this.loading = true
      try {
        // Emit the confirm event to parent component
        this.$emit('confirm')
        this.dialog = false
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.v-card-title {
  border-bottom: 1px solid #e0e0e0;
}
</style> 