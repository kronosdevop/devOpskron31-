<template>
  <div>
    <!--  eslint-disable 
 -->
    <v-dialog
      :model-value="ExportreportDialog"
      @update:model-value="$emit('update:ExportreportDialog', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Export Report</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <v-radio-group
              v-model="transactionType"
              inline
              color="blue"
              label="Transaction Type"
              :rules="[(v) => !!v || 'required ']"
              class="mt-n3"
            >
              <v-radio label="Expense" value="EXPENSE"></v-radio>
              <v-radio label="Petty Cash" value="PETTY_CASH"></v-radio>
            </v-radio-group>
            <v-radio-group
              v-model="toggle_exclusive"
              inline
              color="blue"
              label="Report By"
              :rules="[(v) => !!v || 'required ']"
            >
              <v-radio label="All" value="AllReport"></v-radio>
              <v-radio label="Monthly" value="MonthlyReport"></v-radio>
            </v-radio-group>
            
     
            
            <v-select
              density="compact"
              v-model="selectedUser"
              label="Filter By User"
              :items="userItems"
              item-text="title"
              item-value="value"
              variant="outlined"
              class="mt-n3"
            ></v-select>
            <v-text-field
              v-if="
                (selectedData == 'MyGroup' || selectedData == 'PROJECT') &&
                toggle_exclusive == 'MonthlyReport'
              "
              v-model="MonthYear"
              variant="outlined"
              readonly
              density="compact"
              label="Selected Month"
            ></v-text-field>
            <v-text-field
              v-if="
                selectedData == 'MyCategory' &&
                toggle_exclusive == 'MonthlyReport'
              "
              v-model="MonthYear1"
              variant="outlined"
              readonly
              density="compact"
              label="Selected Month"
            ></v-text-field>
            <v-select
              v-if="selectedData == 'MyGroup'"
              :items="groupItems"
              label="Group"
              item-title="department_name"
              item-value="department_id"
              :rules="[(v) => !!v || 'required ']"
              variant="outlined"
              density="compact"
              v-model="groupList"
            ></v-select>
            <v-select
              v-if="selectedData == 'MyCategory'"
              v-model="categoriesName"
              density="compact"
              label="Categories"
              :items="catergorieItems"
              item-title="expense_name"
              item-value="category_id"
              :rules="[(v) => !!v || 'required ']"
              variant="outlined"
            ></v-select>
            <v-select
              density="compact"
              v-model="projectName"
              label="Project"
              v-if="selectedData == 'PROJECT'"
              :items="projectItems"
              item-title="expense_name"
              item-value="category_id"
              :rules="
                selectedData == 'PROJECT' ? [(v) => !!v || 'required '] : []
              "
              variant="outlined"
              class="mt-2"
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
/* eslint-disable */
import { get_project_list } from "@/mixins/GetProjectList.js";
import { get_expense_categories } from "@/mixins/ExpenseCategories.js";
import { get_expense_groups_users } from "@/mixins/GetExpenseGroups.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { genrate_expense_reports_postgrace } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    selectedData: String,
    ExportreportDialog: Boolean,
    datevalue: String,
    datevalue1: String,
  },
  mixins: [get_expense_groups_users, get_expense_categories, get_project_list, get_all_org_users],

  data() {
    return {
      groupList: "",
      categoriesName: "",
      MonthYear: this.datevalue || "",
      MonthYear1: this.datevalue1 || "",
      groupItems: [],
      catergorieItems: [],
      buttonload: false,
      toggle_exclusive: "AllReport",
      projectName: "",
      projectItems: [],
      transactionType: "EXPENSE",
      selectedUser: "ALL",
      userItems: [],
    };
  },

  watch: {
    ExportreportDialog: {
      async handler() {
        if (this.ExportreportDialog == true) {
          await Promise.all([
            this.get_expense_groups_users(),
            this.get_expense_categories(),
            this.get_project_list(),
            this.get_all_org_users(),
          ]);
          this.fetch_details();
        }
      },
      immediate: true,
    },
    datevalue(newValue) {
      this.MonthYear = newValue;
    },
    datevalue1(newValue) {
      this.MonthYear1 = newValue;
    },
  },

  computed: {
    formattedmonth() {
      if (!this.datevalue) return "";

      // Extract "February" from "February 2025"
      let monthName = this.datevalue.split(" ")[0];

      // Convert month name to two-digit format
      const monthMap = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      };

      return monthMap[monthName] || "";
    },

    formattedyear() {
      if (!this.datevalue) return "";

      // Extract "2025" from "February 2025"
      return this.datevalue.split(" ")[1] || "";
    },

    formattedmonth1() {
      if (!this.datevalue1) return "";

      // Extract "February" from "February 2025"
      let monthName = this.datevalue1.split(" ")[0];

      // Convert month name to two-digit format
      const monthMap = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      };

      return monthMap[monthName] || "";
    },

    formattedyear1() {
      if (!this.datevalue1) return "";

      // Extract "2025" from "February 2025"
      return this.datevalue1.split(" ")[1] || "";
    },
  },

  methods: {
    fetch_details() {
      // Clear arrays before populating to prevent duplicates
      this.groupItems = [];
      this.catergorieItems = [];
      this.projectItems = [];
      this.userItems = [];

      this.listExpense.forEach((element) => {
        this.groupItems.push({
          department_name: element.expense_group_name,
          department_id: element.expense_group_id,
        });
      });
      this.groupItems.unshift({
        department_name: "All",
        department_id: undefined,
      });
      this.expenseCategoriesArray.forEach((element) => {
        this.catergorieItems.push({
          expense_name: element.expense_name,
          category_id: element.category_id,
        });
      });
      this.catergorieItems.unshift({
        expense_name: "All",
        category_id: undefined,
      });
      this.ProjectList.forEach((element) => {
        this.projectItems.push({
          expense_name: element.project_name,
          category_id: element.project_id,
        });
      });
      this.projectItems.unshift({
        expense_name: "All",
        category_id: undefined,
      });
      
      // Populate user items
      this.populateUserItems();
    },
    
    populateUserItems() {
      this.userItems = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userItems.push({
            title: element.full_user_name,
            value: element.user_email_id,
          });
        }
      });
      this.userItems.sort((a, b) => a.title.localeCompare(b.title));
      this.userItems.unshift({
        title: "All Users",
        value: "ALL",
      });
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.groupList = "";
      this.categoriesName = "";
      this.projectName = "";
      this.toggle_exclusive = "AllReport";
      this.transactionType = "EXPENSE";
      this.selectedUser = "ALL";
    },

    async generatereport() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        var data = this.$store.getters.GetUserObj;
        this.buttonload = true;

        try {
          let result = await API.graphql(
            graphqlOperation(genrate_expense_reports_postgrace, {
              input: {
                year:
                  this.toggle_exclusive == "AllReport"
                    ? undefined
                    : this.selectedData === "MyGroup" || this.selectedData === "PROJECT"
                    ? this.formattedyear
                    : this.formattedyear1,
                month:
                  this.toggle_exclusive == "AllReport"
                    ? undefined
                    : this.selectedData === "MyGroup" || this.selectedData === "PROJECT"
                    ? this.formattedmonth
                    : this.formattedmonth1,
                organization_id: data.organization.organization_id,
                user_email_id: data.user.user_email_id,
                transaction_status: "APPROVED",
                expense_group_id:
                  this.selectedData === "MyGroup"
                    ? this.groupList === "All"
                      ? undefined
                      : this.groupList
                    : undefined,
                category_id:
                  this.selectedData === "MyCategory"
                    ? this.categoriesName === "All"
                      ? undefined
                      : this.categoriesName
                    : undefined,
                action_type:
                  this.selectedData == "MyGroup"
                    ? "GROUP"
                    : this.selectedData == "MyCategory"
                    ? undefined
                    : "PROJECT",
                project_id:
                  this.selectedData == "PROJECT"
                    ? this.projectName == "All"
                      ? undefined
                      : this.projectName
                    : undefined,
                transaction_type: this.transactionType,
                user_email_id: this.selectedUser === "ALL" ? undefined : this.selectedUser,
              },
            })
          );

          var response = JSON.parse(
            result.data.genrate_expense_reports_postgrace
          );
          this.buttonload = false;

          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
            // console.log("Report URL:", response.url);
            this.$emit(
              "SuccessURL",
              response.url,
              this.toggle_exclusive,
              this.selectedData == "MyGroup" || this.selectedData == "PROJECT"
                ? this.MonthYear
                : this.selectedData == "MyCategory"
                ? this.MonthYear1
                : undefined
            );
            this.selectStatusTyp = "";
            this.groupList = "";
            this.categoriesName = "";
            this.transactionType = "EXPENSE";
            this.selectedUser = "ALL";
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          let errorMessage = "An error occurred while generating the report";

          if (error.errors && error.errors.length > 0) {
            errorMessage = error.errors[0].message;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (typeof error === "string") {
            errorMessage = error;
          }

          this.$emit("errorMsg", errorMessage);
          this.buttonload = false;
        }
      }
    },
  },
};
</script>