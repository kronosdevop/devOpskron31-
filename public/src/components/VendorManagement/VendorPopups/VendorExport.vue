<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="ExportreportDialog"
      @update:model-value="$emit('update:ExportreportDialog', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Export Report</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-text-field
              v-model="MonthYear"
              variant="outlined"
              readonly
              density="compact"
              label="Selected Month"
            ></v-text-field>

            <v-select
              :items="groupItems"
              v-if="reportType == 'VENDOR'"
              label="Vendor"
              item-title="department_name"
              item-value="department_id"
              :rules="reportType == 'VENDOR' ? [(v) => !!v || 'required '] : []"
              variant="outlined"
              density="compact"
              v-model="groupList"
            ></v-select>
            <v-select
              density="compact"
              v-model="expenseGroup"
              label="Group Name"
              class=""
              v-if="reportType == 'GROUP'"
              :items="expenseGroupHead"
              item-title="label"
              item-value="value"
              :rules="reportType == 'GROUP' ? [(v) => !!v || 'required '] : []"
              variant="outlined"
            ></v-select>
            <v-select
              v-model="Projects"
              v-if="reportType == 'PROJECT'"
              label="Project Name"
              :items="ProjectsItems"
              item-title="text"
              item-value="value"
              :rules="
                reportType == 'PROJECT' ? [(v) => !!v || 'required '] : []
              "
              variant="outlined"
              density="compact"
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="buttonload"
            @click="generatereport()"
            dark
            class="cardCss button-corner text-capitalize"
          >
            Export
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  
  <script>
/*eslint-disable*/
import { get_project_list } from "@/mixins/GetProjectList.js";
import { get_all_org_suppliers } from "@/mixins/GetSuppliers.js";
import { generate_vendor_reports } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_expense_groups_users } from "@/mixins/GetExpenseGroups.js";
export default {
  props: {
    ExportreportDialog: Boolean,
    datevalue: String,
    reportType: String,
  },
  mixins: [get_all_org_suppliers, get_expense_groups_users, get_project_list],

  data() {
    return {
      groupList: "",
      expenseGroup: "",
      MonthYear: this.datevalue || "",
      ProjectsItems: [],
      Projects: "",
      groupItems: [],
      expenseGroupHead: [],
      buttonload: false,
      toggle_exclusive: "AllReport",
    };
  },

  watch: {
    ExportreportDialog: {
      async handler() {
        if (this.ExportreportDialog == true) {
          this.expenseGroupHead = [];
          await Promise.all([
            this.get_all_org_suppliers(),
            this.get_expense_groups_users(),
            this.get_project_list(),
          ]);

          this.fetch_details();
        }
      },
      immediate: true,
    },
    datevalue(newValue) {
      this.MonthYear = newValue;
    },
  },

  computed: {
    formattedmonth() {
      if (!this.datevalue) return "";

      // Extract "February" from "February 2025"
      let monthName = this.datevalue.split(" ")[0];

      // Convert month name to two-digit format
      const monthMap = {
        January: "01",
        February: "02",
        March: "03",
        April: "04",
        May: "05",
        June: "06",
        July: "07",
        August: "08",
        September: "09",
        October: "10",
        November: "11",
        December: "12",
      };

      return monthMap[monthName] || "";
    },

    formattedyear() {
      if (!this.datevalue) return "";

      // Extract "2025" from "February 2025"
      return this.datevalue.split(" ")[1] || "";
    },
  },

  methods: {
    fetch_details() {
      this.groupItems = [];
      this.expenseGroupHead = [];
      this.ProjectsItems = [];

      this.orgSupplier.forEach((element) => {
        this.groupItems.push({
          department_name: element.supplier_name,
          department_id: element.suppliers_id,
        });
      });
      this.groupItems.unshift({
        department_name: "All",
        department_id: "ALL",
      });
      this.listExpense.forEach((element) => {
        this.expenseGroupHead.push({
          label: element.expense_group_name,
          value: element.expense_group_id,
        });
      });
      this.expenseGroupHead.unshift({
        label: "All",
        value: "ALL",
      });
      this.ProjectList.forEach((element) => {
        this.ProjectsItems.push({
          text: element.project_name,
          value: element.project_id,
        });
      });
      this.ProjectsItems.unshift({
        text: "All",
        value: "ALL",
      });
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.groupList = "";
    },

    async generatereport() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        var data = this.$store.getters.GetUserObj;
        this.buttonload = true;

        try {
          let result = await API.graphql(
            graphqlOperation(generate_vendor_reports, {
              input: {
                year: Number(this.formattedyear),
                month: Number(this.formattedmonth),
                organization_id: data.organization.organization_id,
                user_email_id: data.user.user_email_id,
                transaction_status: "APPROVED",
                suppliers_id:
                  this.reportType == "VENDOR" ? this.groupList : undefined,
                project_id:
                  this.reportType == "PROJECT" ? this.Projects : undefined,
                expense_group_id:
                  this.reportType == "GROUP" ? this.expenseGroup : undefined,
                action_type:
                  this.reportType == "VENDOR" ? undefined : this.reportType,
              },
            })
          );

          var response = JSON.parse(result.data.generate_vendor_reports);
          this.buttonload = false;

          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
            // console.log("Report URL:", response.url);
            this.$emit("SuccessURL", response.url);
            this.selectStatusTyp = "";
            this.groupList = "";
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.$emit("errorMsg", error.errors[0].message);
          this.buttonload = false;
        }
      }
    },
  },
};
</script>