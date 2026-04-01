<template>
  <div>
    <v-card flat >
      <v-card-text>
        <v-tabs v-model="verifiyTab" align="left" class="my-tabs mt-n4" grow>
          <v-tab value="0" class="text-capitalize">By Group</v-tab>
          <v-tab value="1" class="text-capitalize">By Category</v-tab>
          <v-tab value="2" class="text-capitalize">By Project</v-tab>
          <v-tab value="3" class="text-capitalize">Last 6 Months</v-tab>
          <v-tab value="4" class="text-capitalize">Generate Report</v-tab>
        </v-tabs>

        <v-window v-model="verifiyTab">
          <v-window-item value="0">
            <v-card flat >
              <ReportGroup />
            </v-card>
          </v-window-item>

          <v-window-item value="1">
            <v-card flat >
              <ReportCategories />
            </v-card>
          </v-window-item>

          <v-window-item value="2">
            <v-card flat >
              <ReportProject />
            </v-card>
          </v-window-item>

          <v-window-item value="3">
            <v-card flat >
              <LastMonthreport />
            </v-card>
          </v-window-item>

          <v-window-item value="4">
            <v-card flat >
              <ExpenseReport />
            </v-card>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>
    <script>
import ReportProject from "@/components/ExpensesManagement/ReportProject.vue";
import LastMonthreport from "@/components/ExpensesManagement/LastMonthreport.vue";
import ReportCategories from "@/components/ExpensesManagement/ReportCategories.vue";
import ReportGroup from "@/components/ExpensesManagement/ReportGroup.vue";
import ExpenseReport from "@/components/ExpensesManagement/ExpenseReport.vue";
export default {
  components: {
    ExpenseReport,
    ReportGroup,
    ReportCategories,
    LastMonthreport,
    ReportProject,
  },
  data() {
    return {
      verifiyTab: "0",
    };
  },
};
</script>