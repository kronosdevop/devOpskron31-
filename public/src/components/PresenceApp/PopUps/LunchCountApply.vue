  <template>
    <div>
      <v-dialog
        :model-value="lunchCountDialog"
        persistent
        max-width="420"
        transition="dialog-top-transition"
      >
        <v-card class="pa-6 rounded-xl elevation-10 text-center">
          <!-- Close -->
          <div class="d-flex justify-end">
            <v-icon class="cursor-pointer" @click="close_dialog">
              mdi-close
            </v-icon>
          </div>

          <!-- Icon Circle -->
          <div class="icon-wrapper mx-auto mb-4">
            <v-icon size="40" color="white">mdi-food</v-icon>
          </div>

          <!-- Title -->
          <div class="text-h5 font-weight-bold mb-2">Lunch Update 🍱</div>

          <!-- Message -->
          <div class="text-body-2 text-medium-emphasis mb-6">
            Not planning to have lunch today? Please take a moment to update your
            lunch count. This helps us manage meals better for everyone.
          </div>

          <!-- Actions -->
          <div class="d-flex justify-center">
            <v-btn variant="text" class="mr-3 text-grey" @click="close_dialog">
              Maybe Later
            </v-btn>

            <v-btn
              color="primary"
              class="px-6 text-white rounded-lg"
              :loading="loading"
              @click="initiateLunch"
            >
              Update Now
            </v-btn>
          </div>
        </v-card>
      </v-dialog>
    </div>
  </template>

  <script>
  export default {
    props: {
      lunchCountDialog: Boolean,
    },

    data() {
      return {
        loading: false,
      };
    },

    methods: {
      close_dialog() {
        this.$emit("clicked", 0);
      },

  async initiateLunch() {
    this.loading = true;

    // ✅ USE VALID ID FROM API RESPONSE
    localStorage.setItem(
      "AUTO_OPEN_WORKFLOW_ID",
      "cb8472e6-3206-4beb-8786-0b19ed064921"
    );

    this.$emit("clicked", 0);

    await this.$router.push("/home/UserForms");

    this.loading = false;
  }
    },
  };
  </script>

  <style scoped>
  .cursor-pointer {
    cursor: pointer;
  }

  /* Icon circle styling */
  .icon-wrapper {
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, #ff9800, #ff5722);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 20px rgba(255, 87, 34, 0.3);
  }
  </style>