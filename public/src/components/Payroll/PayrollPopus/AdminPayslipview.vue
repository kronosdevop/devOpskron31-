<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="payslipadmin" @update:model-value="$emit('update:payslipadmin', $event)" persistent max-width="700" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Payslip of {{ rowInfo.employee_name }}</div></v-toolbar-title
          >
          <v-spacer />

          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="text-left mt-5">
          <div id="dataContainer">
            <div v-for="(value, key) in transformedData" :key="key">
              <strong>{{ key }}:</strong> {{ value }}
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
  
  <script>
/* eslint-disable */
export default {
  props: {
    payslipadmin: Boolean,
    rowInfo: Object,
  },
  data() {
    return {};
  },
  computed: {
    transformedData() {
      const excludedKeys = [
        "organization_id",
        "employee_name",
        "month_year",
        "month",
        "payslip_created_on",
        "email_id",
        "year",
        "payslip_id",
      ];
      const result = {};
      for (const [key, value] of Object.entries(this.rowInfo)) {
        if (!excludedKeys.includes(key)) {
          const label = this.transformKeyToLabel(key);
          result[label] = value;
        }
      }
      return result;
    },
  },
  watch: {
    payslipadmin: {
      async handler() {
        // console.log(this.rowInfo);
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    transformKeyToLabel(key) {
      return key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
  },
};
</script>
<style scoped>
#dataContainer {
  font-family: Arial, sans-serif;
  margin: 20px;
}
#dataContainer div {
  margin: 5px 0;
}
#dataContainer strong {
  color: #333;
}
</style>
