<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="configureWebhookDialog"
      @update:model-value="$emit('update:configureWebhookDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card flat>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Configure</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row class="mt-4" no-gutters>
              <v-col cols="12">
                <v-textarea
                  :rules="[(v) => !!v || 'Required']"
                  density="compact"
                  variant="outlined"
                  label="Webhook URL"
                  auto-grow
                  rows="1"
                  row-height="10"
                  v-model="invokeUrl"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  variant="outlined"
                  label="Authorization Key"
                  v-model="webhoolAuth"
                  :rules="[(v) => !!v || 'Required']"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn size="small" @click="save_action()" class="text-white cardCss"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
export default {
  props: {
    configureWebhookDialog: Boolean,
    selecctehookItem: Object,
  },
  data() {
    return {
      invokeUrl: "",
      webhoolAuth: "",
    };
  },
  watch: {
    configureWebhookDialog: {
      async handler() {
        if (this.configureWebhookDialog == true) {
          // console.log(this.selecctehookItem.hooks_details);
          if (Object.keys(this.selecctehookItem.hooks_details).length != 0) {
            this.invokeUrl = this.selecctehookItem.hooks_details.url;
            this.webhoolAuth = this.selecctehookItem.hooks_details.auth;
          }
          // if(Object.keys(this.selecctehookItem.hooks_details).length)
        } else {
          this.invokeUrl = "";
          this.webhoolAuth = "";
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      // this.invokeUrl = "";
      // this.webhoolAuth = "";
    },

    async save_action() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        var data = {
          auth: this.webhoolAuth,
          url: this.invokeUrl,
        };
        this.$emit("saveAction", data);
      }
    },
  },
};
</script>