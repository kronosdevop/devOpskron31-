<template>
  <v-dialog
    :model-value="pettyCashAdd"
    @update:model-value="$emit('update:model-value', $event)"
    persistent
    max-width="500"
    transition="dialog-top-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark density="compact" class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">Log Petty Cash</div>
        </v-toolbar-title>
        <v-spacer />
        <v-icon class="icon-class mr-4" @click="close_dialog()"
          >mdi-close</v-icon
        >
      </v-toolbar>
      <v-card-text>
        <v-form ref="form">
          <v-radio-group
            v-model="toggle_exclusive"
            inline
            color="blue"
            :rules="[(v) => !!v || 'required ']"
            class="mb-4"
          >
            <v-radio label="Group" value="GROUP"></v-radio>
            <v-radio label="Project" value="PROJECT"></v-radio>
          </v-radio-group>
          <v-select
            v-if="toggle_exclusive == 'PROJECT'"
            density="compact"
            v-model="Projects"
            label="Project Name"
            :items="ProjectsItems"
            item-title="title"
            item-value="value"
            :rules="
              toggle_exclusive == 'PROJECT'
                ? [(v) => !!v || 'Project is required']
                : []
            "
            variant="outlined"
            return-object
            class="mb-4"
          ></v-select>
          <v-select
            v-if="toggle_exclusive == 'GROUP'"
            density="compact"
            v-model="formGroup"
            label="Group Name"
            :items="expenseGroupHead"
            item-title="title"
            item-value="value"
            :rules="
              toggle_exclusive == 'GROUP'
                ? [(v) => !!v || 'Group is required']
                : []
            "
            variant="outlined"
            class="mb-4"
          ></v-select>
          <v-select
            density="compact"
            v-model="category"
            label="Category"
            :items="categoryItems"
            item-title="title"
            item-value="value"
            :rules="[(v) => !!v || 'Category is required']"
            variant="outlined"
            class="mb-4"
          ></v-select>
          <v-menu
            v-model="showDatePicker"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ props }">
              <v-text-field
                v-model="displayDate"
                variant="outlined"
                label="Bill Date"
                readonly
                class="mb-4"
                density="compact"
                :rules="[(v) => !!v || 'Bill Date is required']"
                prepend-inner-icon="mdi-calendar"
                v-bind="props"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="billdate"
              :max="new Date().toISOString().substr(0, 10)"
              @update:model-value="showDatePicker = false"
            ></v-date-picker>
          </v-menu>
          <v-text-field
            v-model="billingNo"
            label="Billing No"
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model="formAmount"
            label="Amount"
            type="number"
            @keypress="is_number($event)"
            v-on:paste="process($event)"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            :rules="[(v) => !!v || 'Amount is required']"
          ></v-text-field>
          <v-textarea
            v-model="formComments"
            label="Comments"
            variant="outlined"
            density="comfortable"
            rows="2"
          ></v-textarea>
          <v-file-input
            v-model="documentFiles"
            label="Select file (optional)"
            variant="outlined"
            density="compact"
            show-size
            class="mb-4"
            @change="get_files(documentFiles)"
          ></v-file-input>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          size="small"
          dark
          @click="validate_data"
          :loading="loading"
          class="text-capitalize cardCss button-corner"
          >Submit</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { request_and_log_pettycash } from "@/graphql/mutations.js";
import { get_expense_groups_users } from "@/mixins/GetExpenseGroups.js";
import { get_project_list } from "@/mixins/GetProjectList.js";
import { list_expense_category } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";

export default {
  name: "AddPettyCashDialog",
  mixins: [get_expense_groups_users, get_project_list],
  props: {
    modelValue: Boolean,
  },
  data() {
    return {
      pettyCashAdd: false,
      loading: false,
      expenseGroupHead: [],
      formGroup: "",
      formAmount: "",
      formComments: "",
      documentFiles: null,
      billdate: "",
      billingNo: "",
      uploadedFiles: [],
      showDatePicker: false,
      category: "",
      categoryItems: [],
      toggle_exclusive: "GROUP",
      Projects: "",
      ProjectsItems: [],
    };
  },
  computed: {
    displayDate() {
      if (!this.billdate) return "";
      const date = new Date(this.billdate);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
    SendDate() {
      if (!this.billdate) return "";
      const date = new Date(this.billdate);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      async handler(val) {
        this.pettyCashAdd = val;
        if (val) {
          // Call the data fetching logic when dialog opens
          await this.get_expense_groups_users();
          await this.get_project_list();
          // Clear arrays before populating
          this.expenseGroupHead = [];
          this.categoryItems = [];
          this.ProjectsItems = [];
          
          // Populate expense groups
          if (this.listExpense && this.listExpense.length > 0) {
            this.listExpense.forEach((element) => {
              this.expenseGroupHead.push({
                title: element.expense_group_name,
                value: String(element.expense_group_id),
              });
            });
            if (!this.formGroup) {
              this.formGroup = this.expenseGroupHead[0].value;
            }
          } else {
            this.expenseGroupHead.push({ title: "DEFAULT", value: "DEFAULT" });
            this.formGroup = "DEFAULT";
          }
          
          // Populate projects
          if (this.ProjectList && this.ProjectList.length > 0) {
            this.ProjectsItems = this.ProjectList.map((element) => ({
              title: element.project_name,
              value: element.project_id,
            }));
          } else {
            this.ProjectsItems.push({
              title: "DEFAULT",
              value: "DEFAULT",
            });
          }
          
          await this.fetchCategories();
        }
      },
    },
    pettyCashAdd(val) {
      if (!val) this.resetForm();
      this.$emit("update:model-value", val);
    },
  },
  methods: {
    get_files(files) {
      this.uploadedFiles = files;
    },
    async upload_new_func() {
      if (!this.uploadedFiles || this.uploadedFiles.length === 0) {
        this.submitPettyCash();
        return;
      }
      this.loading = true;
      try {
        const orgDetails = this.$store.getters.GetOrgDetails;
        const userId = this.$store.getters.GetUserObj.user?.user_id;
        const file = Array.isArray(this.uploadedFiles)
          ? this.uploadedFiles[0]
          : this.uploadedFiles;
        const key = [
          "workflow",
          orgDetails.organization.organization_id,
          "PETTY_CASH",
          userId,
          `${Date.now()}__${file.name.replace(/\s+/g, "")}`,
        ].join("/");
        const fileUrl = await uploadToS3(file, orgDetails.s3_details, key);
        if (fileUrl) {
          await this.submitPettyCash(fileUrl);
        } else {
          this.loading = false;
          this.$emit("errorMsg", "File upload failed");
        }
      } catch (err) {
        this.loading = false;
        this.$emit("errorMsg", "Upload failed. Check console");
      }
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        if (!this.uploadedFiles || this.uploadedFiles.length === 0) {
          this.submitPettyCash();
        } else {
          this.loading = true;
          this.upload_new_func();
        }
      }
    },
    async fetchCategories() {
      const data = this.$store.getters.GetUserObj;
      let result = await API.graphql(
        graphqlOperation(list_expense_category, {
          input: {
            organization_id: data.organization.organization_id,
            nextToken: null,
            limit: 100,
          },
        })
      );
      var response = JSON.parse(result.data.list_expense_category);
      if (response.Status === "SUCCESS") {
        // Clear array before populating
        this.categoryItems = [];
        
        this.categoryItems = response.data.map((element) => ({
          title: element.expense_name,
          value: element.category_id,
        }));
      }
    },
    is_number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    process(event) {
      if (event.type == "paste") {
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("Text");
        if (isNaN(pastedData)) {
          event.preventDefault();
        } else {
          return;
        }
      }
      var keyCode = event.keyCode || event.which;
      if (keyCode >= 96 && keyCode <= 105) {
        keyCode -= 48;
      }
      var charValue = String.fromCharCode(keyCode);
      if (isNaN(parseInt(charValue)) && event.keyCode != 8) {
        event.preventDefault();
      }
    },
    async submitPettyCash(url) {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(request_and_log_pettycash, {
            input: {
              action_type: "EXPENSE_LOG",
              expense_group_id: this.toggle_exclusive == "GROUP" ? this.formGroup : undefined,
              // expense_group_name: this.toggle_exclusive == "GROUP" ? this.expenseGroupHead.find(g => g.value === this.formGroup)?.title : undefined,
              project_id: this.toggle_exclusive == "PROJECT" ? this.Projects.value : undefined,
              project_name: this.toggle_exclusive == "PROJECT" ? this.Projects.title : undefined,
              expense_type: this.toggle_exclusive,
              requested_amount: Number(this.formAmount),
              expense_description: this.formComments,
              bill_date: this.SendDate,
              bill_no: this.billingNo,
              category_id: this.category,
              media_keys: url,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.request_and_log_pettycash);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.resetForm();
          this.close_dialog();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors?.[0]?.message || error.message);
      }
    },
    close_dialog() {
      this.pettyCashAdd = false;
      this.$emit("clicked");
    },
    resetForm() {
      this.formGroup = "";
      this.formAmount = "";
      this.formComments = "";
      this.documentFiles = null;
      this.billdate = "";
      this.billingNo = "";
      this.category = "";
      this.toggle_exclusive = "GROUP";
      this.Projects = "";
      this.uploadedFiles = [];
      // Clear dropdown arrays when resetting form
      this.expenseGroupHead = [];
      this.categoryItems = [];
      this.ProjectsItems = [];
    },
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 18px !important;
  box-shadow: 0 4px 24px 0 rgba(60, 60, 60, 0.1),
    0 2px 8px 0 rgba(60, 60, 60, 0.06);
}
.v-card-title {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #222 !important;
  letter-spacing: 0.01em;
  font-family: "Inter", "Segoe UI", Arial, sans-serif;
}
.v-btn[variant="text"] {
  color: #888;
}
</style> 