<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-tabs
          v-model="verifiyTab"
          align="left"
          class="my-tabs mt-n4"
          grow
          color="primary"
        >
          <v-tab value="0" class="text-capitalize">By Vendor</v-tab>
          <v-tab value="1" class="text-capitalize">By Group</v-tab>
          <v-tab value="2" class="text-capitalize">By Project</v-tab>
        </v-tabs>

        <v-window v-model="verifiyTab">
          <v-window-item value="0">
            <v-card flat>
              <VendorReport />
            </v-card>
          </v-window-item>
          
          <v-window-item value="1">
            <v-card flat>
              <ReportGroup />
            </v-card>
          </v-window-item>
          
          <v-window-item value="2">
            <v-card flat>
              <ReportProject />
            </v-card>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>
    <script>
import ReportProject from "@/components/VendorManagement/ReportProject.vue";
import ReportGroup from "@/components/VendorManagement/ReportGroup.vue";
import VendorReport from "@/components/VendorManagement/VendorReport.vue";

export default {
  components: {
    VendorReport,
    ReportGroup,

    ReportProject,
  },
  data() {
    return {
      verifiyTab: "0",
    };
  },
};
</script>