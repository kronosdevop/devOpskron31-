<template>
  <div>
    <v-toolbar flat>
      <v-row class="ml-4">
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
          <v-btn small class="black--text" text value="form_designer">
            Form Designer
          </v-btn>
          <v-btn small class="black--text" text value="flow_designer">
            Flow Designer
          </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-spacer />
      <v-btn dark class="text-capitalize cardCss ml-2" @click="back_call()">
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-toolbar>
    <div class="text-left" v-if="toggle_exclusive == 'form_designer'">
      <AdminFormDesigner />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'flow_designer'">
      <AdminFlowDesigner />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import AdminFormDesigner from "@/components/FormDesigner/AdminFormDesigner.vue";
import AdminFlowDesigner from "@/components/FormDesigner/AdminFlowDesigner.vue";

export default {
  components: {
    AdminFormDesigner,
    AdminFlowDesigner,
  },
  data() {
    return {
      toggle_exclusive: "form_designer",
    };
  },
  methods: {
    back_call() {
      this.$router.push({
        name: "AdminFormTemplate",
        params: {
          formMethod: "AllFlows",
        },
      });
      // this.$router.push("/AdminFormTemplate");
    },
  },
};
</script>