<template>
  <!-- eslint-disable -->
  <v-dialog
    :model-value="reportexpense"
    @update:model-value="$emit('update:reportexpense', $event)"
    persistent
    max-width="400"
    transition="dialog-top-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">
            Generate Expense Report
          </div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>

      <v-card-text class="mt-4">
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
          <v-menu
            v-model="monthPicker"
            :close-on-content-click="false"
            persistent
            max-width="350"
            transition="scale-transition"
            scroll-strategy="none"
          >
            <template #activator="{ props }">
              <v-text-field
                v-model="datedisplay"
                label="Select a Month"
                readonly
                density="compact"
                variant="outlined"
                class=""
                v-show="toggle_exclusive == 'MonthlyReport'"
                v-bind="props"
              />
            </template>

            <v-card>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="7" class="">
                    <span class="ml-6" style="font-size: 19px"
                      ><b>{{ datedisplayMonth }}</b></span
                    >
                  </v-col>
                  <v-col>
                    <v-select
                      label="Select Year"
                      v-model="yearfilter"
                      :items="itemyears"
                      density="compact"
                      variant="outlined"
                      style="max-width: 100px"
                      class=""
                    ></v-select>
                  </v-col>
                </v-row>

                <v-row class="ml-n2" dense>
                  <v-col
                    v-for="(month, index) in monthNames"
                    :key="index"
                    cols="4"
                    class="d-flex justify-center"
                  >
                    <v-btn
                      class="ma-1"
                      :class="{ 'active-btn': month === monthfilter }"
                      density="compact"
                      :disabled="isMonthDisabled(index)"
                      @click="selectMonth(month)"
                    >
                      {{ month }}
                    </v-btn>
                  </v-col>
                </v-row>

                <v-row class="mt-4 justify-end">
                  <v-btn
                    text
                    class="ma-1"
                    density="compact"
                    @click="closedialog()"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="primary"
                    text
                    class="ma-1 mr-8"
                    density="compact"
                    @click="saveSelection"
                  >
                    Save
                  </v-btn>
                </v-row>
              </v-card-text>
            </v-card>
          </v-menu>
          <!-- <v-select
            v-model="selectStatusType"
            :items="[
              { text: 'ALL', value: 'ALL' },
              { text: 'Pending', value: 'PENDING' },
              { text: 'Approved', value: 'APPROVED' },
              { text: 'Rejected', value: 'REJECTED' },
              { text: 'Withdrawn', value: 'WITHDRAWN' },
            ]"
            item-text="text"
            item-value="value"
            label="Filter By"
            :rules="[(v) => !!v || 'Required']"
            outlined
            :menu-props="{ contentClass: 'select-items' }"
            dense
          /> -->
          <v-radio-group
            v-model="reportType"
            inline
            color="blue"
            label="Report Type"
            :rules="[(v) => !!v || 'required ']"
            class="mt-n3"
          >
            <v-radio label="Group" value="GROUP"></v-radio>
            <v-radio label="Project" value="PROJECT"></v-radio>
          </v-radio-group>
          
     
          <v-select
            density="compact"
            v-model="groupList"
            v-if="reportType == 'GROUP'"
            label="Group"
            :items="groupItems"
            item-text="title"
            item-value="value"
            :rules="[(v) => !!v || 'required ']"
            variant="outlined"
          ></v-select>
          <v-select
            density="compact"
            v-model="projectName"
            label="Project"
            v-if="reportType == 'PROJECT'"
            :items="projectItems"
            item-text="title"
            item-value="value"
            :rules="[(v) => !!v || 'required ']"
            variant="outlined"
          ></v-select>
          <v-select
            density="compact"
            v-model="categoriesName"
            label="Categories"
            :items="catergorieItems"
            item-text="title"
            item-value="value"
            :rules="[(v) => !!v || 'required ']"
            variant="outlined"
          ></v-select>
          
          <v-select
            density="compact"
            v-model="selectedUser"
            label="Filter By User"
            :items="userItems"
            item-text="title"
            item-value="value"
            variant="outlined"
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
          Generate
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
    
<script>
import { get_project_list } from "@/mixins/GetProjectList.js";
import { get_expense_categories } from "@/mixins/ExpenseCategories.js";
import { get_expense_groups_users } from "@/mixins/GetExpenseGroups.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { genrate_expense_reports_postgrace } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    reportexpense: Boolean,
  },
  mixins: [get_expense_groups_users, get_expense_categories, get_project_list, get_all_org_users],
  data() {
    return {
      groupList: "",
      projectName: "",
      toggle_exclusive: "AllReport",
      categoriesName: "",
      groupItems: [],
      projectItems: [],
      catergorieItems: [],
      buttonload: false,
      monthPicker: false,
      datedisplay: "",
      datedisplayMonth: "",
      yearfilter: new Date().getFullYear(),
      monthfilter: "",
      monthNames: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      itemyears: [],
      reportType: "GROUP",
      transactionType: "EXPENSE",
      selectedUser: "ALL",
      userItems: [],
      updatekey: 0,
      selectStatusType: "",
      formattedmonth: null,
      formattedyear: null,
    };
  },
  watch: {
    reportexpense: {
      async handler() {
        if (this.reportexpense == true) {
          this.populateYearItems();
          this.setInitialFilters();
          await this.fecth_date();
          await this.get_expense_groups_users();
          await this.get_expense_categories();
          await this.get_project_list();
          await this.get_all_org_users();
          
          // Clear arrays before populating
          this.groupItems = [];
          this.projectItems = [];
          this.catergorieItems = [];
          this.userItems = [];
          
          // Reset updatekey for fresh graph refresh
          this.updatekey = 0;
          
          this.fetch_details();
          this.populateUserItems();
        }
      },
      immediate: true,
    },
    yearfilter() {
      this.monthfilter = "";
      this.updateMonthItems(this.yearfilter);
      this.updateDatedisplayMonth();
    },
    monthfilter() {
      this.updateDatedisplayMonth();
    },
    datedisplay(val) {
      this.datedisplayMonth = val;
    },
  },
  methods: {
    fetch_details() {
      this.listExpense.forEach((element) => {
        this.groupItems.push({
          title: element.expense_group_name,
          value: element.expense_group_id,
        });
      });
      this.groupItems.unshift({
        title: "All",
        value: undefined,
      });
      this.expenseCategoriesArray.forEach((element) => {
        this.catergorieItems.push({
          title: element.expense_name,
          value: element.category_id,
        });
      });
      this.catergorieItems.unshift({
        title: "All",
        value: undefined,
      });
      this.ProjectList.forEach((element) => {
        this.projectItems.push({
          title: element.project_name,
          value: element.project_id,
        });
      });
      this.projectItems.unshift({
        title: "All",
        value: undefined,
      });
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
      this.selectStatusType = "";
      this.groupList = "";
      this.categoriesName = "";
      this.transactionType = "EXPENSE";
      this.selectedUser = "ALL";
    },
    fecth_date() {
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

      // Add null checks and default values
      if (!this.monthfilter || !this.yearfilter) {
        const currentDate = new Date();
        this.monthfilter = this.monthNames[currentDate.getMonth()];
        this.yearfilter = currentDate.getFullYear();
      }

      this.formattedmonth = parseInt(monthMap[this.monthfilter], 10);
      this.formattedyear = parseInt(this.yearfilter, 10);
    },
    async generatereport() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        var data = this.$store.getters.GetUserObj;
        this.buttonload = true;
        
        // Increment updatekey to force graph refresh
        this.updatekey++;

        try {
          let result = await API.graphql(
            graphqlOperation(genrate_expense_reports_postgrace, {
              input: {
                year:
                  this.toggle_exclusive == "AllReport"
                    ? undefined
                    : this.formattedyear,
                month:
                  this.toggle_exclusive == "AllReport"
                    ? undefined
                    : this.formattedmonth,
                organization_id: data.organization.organization_id,
                user_email_id: data.user.user_email_id,
                transaction_status: "APPROVED",
                expense_group_id:
                  this.reportType != "PROJECT"
                    ? this.groupList == "All"
                      ? undefined
                      : this.groupList
                    : undefined,
                category_id:
                  this.categoriesName == "All"
                    ? undefined
                    : this.categoriesName,
                action_type: this.reportType,
                project_id:
                  this.reportType == "PROJECT"
                    ? this.projectName == "All"
                      ? undefined
                      : this.projectName
                    : undefined,
                transaction_by: this.selectedUser == "ALL" ? undefined : this.selectedUser,
                transaction_type: this.transactionType,
              },
            })
          );
          // console.log(result);
          var response = JSON.parse(
            result.data.genrate_expense_reports_postgrace
          );
          this.buttonload = false;
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
            this.selectStatusTyp = "";
            this.groupList = "";
            this.categoriesName = "";
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.$emit("errorMsg", error.errors[0].message);
          this.buttonload = false;
        }
      }
    },
    selectMonth(month) {
      this.monthfilter = month;
    },
    closedialog() {
      this.monthPicker = false;
    },
    saveSelection() {
      this.datedisplay = this.monthfilter + " " + this.yearfilter;
      this.monthPicker = false;
      this.fecth_date();
    },
    isMonthDisabled(index) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      if (this.yearfilter === currentYear && index > currentMonth) {
        return true;
      }
      return false;
    },
    populateYearItems() {
      const currentYear = new Date().getFullYear();
      this.itemyears = Array.from(
        { length: 10 },
        (_, index) => currentYear - index
      );
    },
    setInitialFilters() {
      const currentYear = new Date().getFullYear();
      this.yearfilter = currentYear;
      this.updateMonthItems(currentYear);
      this.monthfilter = this.monthNames[new Date().getMonth()] || "Jan";
      this.updateDatedisplayMonth();
      this.datedisplay =
        this.datedisplayMonth || `${this.monthfilter} ${this.yearfilter}`;
    },
    updateMonthItems(year) {
      const currentYear = new Date().getFullYear();
      if (year === currentYear) {
        this.monthitems = this.monthNames.slice(0, new Date().getMonth() + 1);
      } else {
        this.monthitems = [...this.monthNames];
      }
    },
    updateDatedisplayMonth() {
      if (this.yearfilter && this.monthfilter) {
        this.datedisplayMonth = `${this.monthfilter} ${this.yearfilter}`;
      } else {
        const currentDate = new Date();
        this.datedisplayMonth = `${
          this.monthNames[currentDate.getMonth()]
        } ${currentDate.getFullYear()}`;
      }
    },
  },
};
</script>
    
<style scoped>
.active-btn {
  color: white !important;
  background-color: #1e3e5c !important;
  border-radius: 10px !important;
}
</style>