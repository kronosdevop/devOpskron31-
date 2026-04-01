<template>
  <div>
    <v-row class="mt-2" no-gutters>
      <!-- eslint-disable -->
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <div class="mt-n3">
        <b>Form Name :{{ formInfo.form_name }}</b>
      </div>
      <v-spacer />
      <v-btn small @click="back_step()" class="mt-n3 white--text cardCss"
        >Back</v-btn
      >

      <v-btn small @click="next_option()" class="mt-n3 ml-2 white--text cardCss"
        >Next</v-btn
      >
    </v-row>
    <v-card class="mt-2" max-width="700">
      <v-card-title>Webhook</v-card-title>
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="12">
            <v-text-field outlined label="URL" v-model="invokeUrl" dense />
          </v-col>
          <v-col cols="12">
            <v-text-field
              outlined
              label="Authorization"
              v-model="webhoolAuth"
              dense
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    SnackBar,
  },
  props: {
    formInfo: Object,
    flowSteps: Array,
    currentWeebhookData: Object,
  },
  data() {
    return {
      SnackBarComponent: {},
      invokeUrl: "",
      webhoolAuth: "",
    };
  },
  created() {
    if (Object.keys(this.currentWeebhookData).length != 0) {
      this.invokeUrl =
        this.currentWeebhookData.invoke_url == "N/A"
          ? ""
          : this.currentWeebhookData.invoke_url;
      this.webhoolAuth =
        this.currentWeebhookData.authorization == "N/A"
          ? ""
          : this.currentWeebhookData.authorization;
    }
  },
  methods: {
    next_option() {
      var data = {};
      data = {
        invoke_url: this.invokeUrl == "" ? "N/A" : this.invokeUrl,
        authorization: this.webhoolAuth == "" ? "N/A" : this.webhoolAuth,
      };
      this.$emit("webhookInfo", data);
    },
    back_step() {
      this.$emit("configStep", this.flowSteps);
    },
  },
};
</script>