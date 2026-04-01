<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="vendorInitate"
      @update:model-value="$emit('update:vendorInitate', $event)"
      persistent
      max-width="550"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Vendor Payment</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-col cols="12">
                  <v-autocomplete
                    density="compact"
                    v-model="suplliersName"
                    label="Vendor Name"
                    :search-input.sync="searchF"
                    class="mt-n2"
                    :items="supplierItems"
                    item-title="label"
                    item-value="value"
                    :rules="[(v) => !!v || 'required ']"
                    variant="outlined"
                    :loading="supplierLoading"
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" class="mt-n8">
                  <v-radio-group
                    v-model="toggle_exclusive"
                    inline
                    :rules="[(v) => !!v || 'required ']"
                  >
                    <v-radio label="Group" value="GROUP"></v-radio>
                    <v-radio label="Project" value="PROJECT"></v-radio>
                  </v-radio-group>
                </v-col>
                <v-col cols="12" v-if="toggle_exclusive == 'PROJECT'">
                  <v-select
                    density="compact"
                    v-model="Projects"
                    label="Project Name"
                    class="mt-n8"
                    :items="ProjectsItems"
                    item-title="text"
                    item-value="value"
                    :rules="
                      toggle_exclusive == 'PROJECT'
                        ? [(v) => !!v || 'required ']
                        : []
                    "
                    variant="outlined"
                    return-object
                  ></v-select>
                </v-col>
                <v-col cols="12" v-if="toggle_exclusive == 'GROUP'">
                  <v-select
                    density="compact"
                    v-model="expenseGroup"
                    label="Group Name"
                    class="mt-n8"
                    :items="expenseGroupHead"
                    item-title="label"
                    item-value="value"
                    :rules="
                      toggle_exclusive == 'GROUP'
                        ? [(v) => !!v || 'required ']
                        : []
                    "
                    variant="outlined"
                    return-object
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="computedDateDisplay"
                    variant="outlined"
                    label="Bill Date"
                    readonly
                    class="mt-n8"
                    density="compact"
                    :rules="[(v) => !!v || 'required ']"
                    append-inner-icon="mdi-calendar"
                    persistent-hint
                    @click="datePicker = true"
                  >
                    <v-dialog v-model="datePicker" persistent max-width="325">
                      <v-card>
                        <v-date-picker
                          v-model="tempDate"
                          :max="new Date().toISOString().substr(0, 10)"
                          color="#DB4C77"
                          class="primaryColor"
                        ></v-date-picker>
                        <v-card-actions>
                          <v-spacer />
                          <v-btn
                            text
                            color="primaryColor"
                            @click="datePicker = false"
                            >Cancel</v-btn
                          >
                          <v-btn text color="primaryColor" @click="saveDate"
                            >OK</v-btn
                          >
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    density="compact"
                    v-model="billingNo"
                    label="Billing No"
                    variant="outlined"
                    class="mt-n8"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    density="compact"
                    v-model="amount"
                    label="Amount"
                    :rules="billing_amount_rule"
                    variant="outlined"
                    class="mt-n8"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    density="compact"
                    v-model="description"
                    label="Description"
                    variant="outlined"
                    rows="0"
                    class="mt-n8"
                    :rules="[(v) => !!v || 'required ']"
                  ></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-file-input
                    small-chips
                    variant="outlined"
                    density="compact"
                    label="Upload Documents"
                    accept="image/*,application/pdf"
                    class="mt-n8"
                    v-model="documentFiles"
                    @update:model-value="get_files"
                  ></v-file-input>
                </v-col>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
    <script>
/* eslint-disable */
import { get_project_list } from "@/mixins/GetProjectList.js";
import { get_expense_groups_users } from "@/mixins/GetExpenseGroups.js";
import { initiate_vendor_reimbursement } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_suppliers } from "@/mixins/GetSuppliers.js";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
import { Auth } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { Buffer } from "buffer";
export default {
  props: {
    vendorInitate: Boolean,
  },
  mixins: [
    get_all_org_suppliers,
    get_expense_groups_users,
    get_project_list,
    // update_audit_logs
  ],

  data() {
    let today = new Date();
    return {
      billingNo: "",
      expenseGroup: "",
      fileloding: false,
      passfinalDocs: [],
      expenseGroupHead: [],
      urls: "",
      amount: null,
      fromMenu: false,
      suplliersName: "",
      expenseGroupHead: [],
      toggle_exclusive: "",
      loading: false,
      documentFiles: [],
      array13: [],
      delLoading: false,
      array11: [],
      array12: [],
      billdate: today.toISOString().substr(0, 10),
      description: "",
      ProjectsItems: [],
      Projects: "",
      billing_amount_rule: [
        (v) => !!v || "required ",
        (value) => /^\d+$/.test(value) || "Only numbers are allowed",
        (value) => parseInt(value) > 0 || "Value must be greater than zero",
      ],
      uploadedFiles: [],
      supplierItems: [],
      datePicker: false,
      tempDate: today.toISOString().substr(0, 10),
      computedDateFormatted: this.formatDate(today),
      searchF: "",
      supplierLoading: false,
    };
  },

  watch: {
    vendorInitate: {
      async handler() {
        if (this.vendorInitate == true) {
          // console.log(this.$store.getters.GetOrgDetails);
          this.uploadedFiles = [];
          this.expenseGroupHead = [];
          this.supplierLoading = true;
          await this.get_all_org_suppliers();
          await this.get_project_list();
          await this.get_expense_groups_users();
          this.fetch_all_groups();
        }
      },
      immediate: true,
    },
  },
  computed: {
    computedDateDisplay() {
      return this.displayFormatDate(this.computedDateFormatted);
    },
  },
  methods: {
    displayFormatDate(date) {
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },

    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    saveDate() {
      this.billdate = this.tempDate;
      this.computedDateFormatted = this.tempDate
        ? this.formatDate(this.tempDate)
        : "";
      this.datePicker = false;
    },
    get_files(files) {
      this.uploadedFiles = files;
    },
    add_documents_upload() {
      this.fileloding = true;
      let self = this;

      self.upload_S3(this.uploadedFiles);
    },
    fetch_all_groups() {
      this.searchF = "";

      this.supplierItems = [];
      this.expenseGroupHead = [];
      this.ProjectsItems = [];
      this.orgSupplier.forEach((element) => {
        this.supplierItems.push({
          label: element.supplier_name,
          value: element.suppliers_id,
        });
      });
      this.supplierLoading = false;
      if (this.listExpense.length == 0) {
        this.expenseGroupHead.push({
          label: "DEFAULT",
          value: "DEFAULT",
        });
      } else {
        this.listExpense.forEach((element) => {
          this.expenseGroupHead.push({
            label: element.expense_group_name,
            value: element.expense_group_id,
          });
        });
      }
      if (this.ProjectList && this.ProjectList.length > 0) {
        this.ProjectsItems = this.ProjectList.map((element) => ({
          text: element.project_name,
          value: element.project_id,
        }));
      } else {
        this.ProjectsItems.push({
          text: "DEFAULT",
          value: "DEFAULT",
        });
      }
    },
    async upload_S3(files) {
      var imageUrl = [];
      var newUrl = [];
      var baseData = [];
      var file = files;
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.addEventListener("load", () => {
        imageUrl = fr.result;
        newUrl = imageUrl;
        newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");

        baseData.push(newUrl);

        this.upload_S3_bucket(baseData[0], file);
      });
    },
    async upload_S3_bucket(baseData, file) {
      var self = this;
      var deatils = self.$store.getters.GetOrgDetails;
      // var data = this.$store.getters.GetUserObj;
      var buf = Buffer.from(baseData, "base64");

      var s3Bucket = new AWS.S3({
        region: deatils.s3_details.region,
        accessKeyId: deatils.s3_details.access_key,
        secretAccessKey: deatils.s3_details.secret_key,
      });
      var bucketName = deatils.s3_details.bucket_name;
      var useridd = self.$store.getters.GetOrgDetails.owner.user_id;
      var params = {
        Bucket: bucketName,

        // workflow/organization_id/uniqui_id/user_id/timestmap__filename
        Key:
          "workflow" +
          "/" +
          deatils.organization.organization_id +
          "/" +
          "VENDOR_MANAGEMENT" +
          "/" +
          useridd +
          "/" +
          Date.now() +
          "__" +
          file.name.split(" ").join(""),

        Body: buf,
        ContentType: file.type,
      };
      var bucketurl =
        "https://" +
        bucketName +
        ".s3." +
        deatils.s3_details.region +
        ".amazonaws.com/" +
        params.Key;

      await s3Bucket.putObject(params, function (err, data) {
        if (err) {
          self.loading1 = false;
        } else if (data) {
          bucketurl;
          self.urls = bucketurl;
        }
        self.create_expense();

        self.fileloding = false;
      });
    },

    async upload_new_func() {
      if (!this.documentFiles) return;
      await Auth.currentCredentials();
      const orgDetails = this.$store.getters.GetOrgDetails;

      const userId = this.$store.getters.GetUserObj.user.user_id;

      const key = [
        "workflow",
        orgDetails.organization.organization_id,
        "EXPENSE_REIMBURSEMENT",
        userId,
        `${Date.now()}__${this.documentFiles.name.replace(/\s+/g, "")}`,
      ].join("/");
      try {
        const fileUrl = await uploadToS3(
          this.documentFiles,
          orgDetails.s3_details,
          key
        );
        if (fileUrl) {
          // console.log("✅ Uploaded file URL:", fileUrl);
          await this.create_expense(fileUrl);
          this.documentFiles = null;
        }
      } catch (err) {
        this.$emit("errorMsg", "Upload failed. Check console");
        this.loading = false;
      }
    },

    close_dialog() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.urls = "";
      this.uploadedFiles = [];
      let today = new Date();
      this.billdate = today.toISOString().substr(0, 10);
      this.tempDate = today.toISOString().substr(0, 10);
      this.computedDateFormatted = this.formatDate(today);
      this.datePicker = false;
      this.$emit("clicked", 0);
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        if (this.uploadedFiles.length == 0) {
          this.create_expense();
        } else {
          this.upload_new_func();
        }
      }
    },

    async create_expense(url) {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(initiate_vendor_reimbursement, {
            input: {
              suppliers_id: this.suplliersName,
              bill_date: this.formatDate(this.billdate),
              bill_no: this.billingNo,
              amount: this.amount,
              vendor_description: this.description,
              media_keys: url,
              expense_group_name:
                this.toggle_exclusive == "GROUP"
                  ? this.expenseGroup.label
                  : undefined,
              expense_group_id:
                this.toggle_exclusive == "GROUP"
                  ? this.expenseGroup.value
                  : undefined,
              expense_type: this.toggle_exclusive,
              project_id:
                this.toggle_exclusive == "PROJECT"
                  ? this.Projects.value
                  : undefined,
              project_name:
                this.toggle_exclusive == "PROJECT"
                  ? this.Projects.text
                  : undefined,
            },
          })
        );
        var response = JSON.parse(result.data.initiate_vendor_reimbursement);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          // this.fetch_audit_message();
          this.$emit("successMsg", response.Message);
          this.$emit("categoeryRefresh", "refresh");
          this.urls = "";
          this.uploadedFiles = [];
          this.$refs.form.reset();
        } else {
          this.urls = "";
          this.uploadedFiles = [];
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },

    async fetch_audit_message() {
      var data = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "EXPENSE_ACTION",
        AuditAction: "ADD_EXPENSE",
        AuditMessage: `${data.user.full_user_name} initiated  Expense workflow`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>