<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="expenseAdd"
      @update:model-value="$emit('update:expenseAdd', $event)"
      persistent
      max-width="550"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Initiate Expense</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="">
              <v-col cols="12">
                <v-col cols="12">
                  <v-select
                    density="compact"
                    v-model="expensecategory"
                    label="Expense Category"
                    :items="expensecategoryitems"
                    item-text="title"
                    item-value="value"
                    :rules="[(v) => !!v || 'required ']"
                    variant="outlined"
                  ></v-select>
                </v-col>
                <v-col cols="12" class="mt-n6">
                  <v-radio-group
                    v-model="toggle_exclusive"
                    inline
                    color="blue"
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
                    class="mt-n4"
                    :items="ProjectsItems"
                    item-text="title"
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
                    item-title="title"
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
                        class="mt-n6"
                        density="compact"
                        :rules="[(v) => !!v || 'required ']"
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
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    density="compact"
                    v-model="billingNo"
                    label="Billing No"
                    variant="outlined"
                    class="mt-n4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    density="compact"
                    v-model="amount"
                    label="Amount"
                    :rules="billing_amount_rule"
                    variant="outlined"
                    class="mt-n4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    density="compact"
                    v-model="description"
                    label="Description"
                    variant="outlined"
                    rows="0"
                    class="mt-n4"
                    :rules="[(v) => !!v || 'required ']"
                  ></v-textarea>
                </v-col>
                <v-col cols="12" class="mt-n4">
                  <v-file-input
                    v-model="documentFiles"
                    label="Select file"
                    variant="outlined"
                    :rules="
                      this.$store.getters.GetOrgDetails?.organization
                        ?.is_expense_attachment_required
                        ? [(v) => !!v || 'required ']
                        : []
                    "
                    accept="image/*,application/pdf"
                    density="compact"
                    show-size
                    @change="get_files(documentFiles)"
                  ></v-file-input>
                  <!-- <v-file-input
                    small-chips
                    outlined
                    dense
                    label="Upload Documents"
                    accept="image/*,application/pdf"
                    class="mt-n8"
                    v-model="documentFiles"
                    @click="get_files(documentFiles)"
                  ></v-file-input> -->
                </v-col>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            size="small"
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
import { list_expense_category } from "@/graphql/queries.js";
import { initiate_expense } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_expense_groups_users } from "@/mixins/GetExpenseGroups.js";
// import { uploadData } from "@aws-amplify/storage";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
import { Storage, Auth } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";

import { Buffer } from "buffer";
export default {
  props: {
    expenseAdd: Boolean,
  },
  mixins: [
    get_expense_groups_users,
    get_project_list,
    // update_audit_logs
  ],

  data() {
    return {
      billingNo: "",
      fileloding: false,
      passfinalDocs: [],
      urls: "",
      amount: null,
      showDatePicker: false,
      expensecategory: "",
      expensecategoryitems: [],
      loading: false,
      array13: [],
      delLoading: false,
      array11: [],
      array12: [],
      billdate: "",
      description: "",
      toggle_exclusive: "",
      billing_amount_rule: [
        (v) => !!v || "required ",
        (value) => /^\d+$/.test(value) || "Only numbers are allowed",
        (value) => parseInt(value) > 0 || "Value must be greater than zero",
      ],
      uploadedFiles: [],
      expenseGroupHead: [],
      ProjectsItems: [],
      Projects: "",
      expenseGroup: "",
      documentFiles: null,
    };
  },

  watch: {
    expenseAdd: {
      async handler() {
        if (this.expenseAdd == true) {
          const credentials = await Auth.currentCredentials();
          // console.log(credentials);
          // console.log(this.$store.getters.GetOrgDetails);
          this.uploadedFiles = [];
          // Clear all dropdown arrays
          this.expensecategoryitems = [];
          this.expenseGroupHead = [];
          this.ProjectsItems = [];

          this.fetch_expenses();
          await this.get_project_list();
          await this.get_expense_groups_users();
          this.fetch_all_groups();
        }
      },
      immediate: true,
    },
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

  methods: {
    get_files(files) {
      // console.log(files);
      this.uploadedFiles = files;
    },

    add_documents_upload() {
      this.fileloding = true;
      let self = this;

      self.upload_S3(this.uploadedFiles);
    },
    async fetch_all_groups() {
      // Clear arrays before populating
      this.ProjectsItems = [];
      this.expenseGroupHead = [];

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
      if (this.listExpense.length == 0) {
        this.expenseGroupHead.push({
          title: "DEFAULT",
          value: "DEFAULT",
        });
      } else {
        this.listExpense.forEach((element) => {
          this.expenseGroupHead.push({
            title: element.expense_group_name,
            value: element.expense_group_id,
          });
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
          "EXPENSE_REIMBURSEMENT" +
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

    close_dialog() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.urls = "";
      this.uploadedFiles = [];
      this.$emit("clicked", 0);
    },
    async fetch_expenses() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_expense_category, {
            input: {
              organization_id: data.organization.organization_id,
              nextToken: null,
              limit: 100,
            },
          })
        );

        this.tableLoading = false;
        this.tableData = [];

        var response = JSON.parse(result.data.list_expense_category);
        this.loading = false;

        if (response.Status == "SUCCESS") {
          // Clear array before populating
          this.expensecategoryitems = [];

          var tableData = [];
          tableData = response.data;
          // console.log(tableData);
          tableData.forEach((element) => {
            this.expensecategoryitems.push({
              title: element.expense_name,
              value: element.category_id,
            });
          });
        } else {
        }
      } catch (error) {
        this.tableLoading = false;

        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        if (this.uploadedFiles.length == 0) {
          this.create_expense();
        } else {
          this.loading = true;
          // console.log(this.documentFiles);
          this.upload_new_func();
          // this.add_documents_upload();
        }
      }
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
        // this.uploadStatus = "❌ Upload failed. Check console.";
        // this.uploadStatusType = "error";
        this.loading = false;
      }

      // if (!this.documentFiles) return;

      // const details = this.$store.getters.GetOrgDetails;
      // console.log(details);
      // const userId = details.owner.user_id;

      // try {
      //   await Auth.currentCredentials();

      //   const bucket = details.s3_details.bucket_name;

      //   const region = details.s3_details.region;

      //   const key = [
      //     "workflow",
      //     details.organization.organization_id,
      //     "EXPENSE_REIMBURSEMENT",
      //     userId,
      //     `${Date.now()}__${this.documentFiles.name.split(" ").join("")}`,
      //   ].join("/");

      //   const result = await Storage.put(key, this.documentFiles, {
      //     contentType: this.documentFiles.type,
      //     bucket,
      //     region,
      //     level: "public",
      //     customPrefix: {
      //       public: "", // this removes `private/username/` from path
      //     },
      //   });

      //   const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${result.key}`;
      //   console.log(fileUrl);
      //   // const signedUrl = await Storage.get(result.key, { level: "public" });
      //   // console.log(signedUrl);
      //   await this.create_expense(fileUrl);

      //   // this.uploadStatus = `✅ Uploaded: ${result.key}`;
      //   // this.uploadStatusType = "success";
      //   this.documentFiles = null;
      // } catch (err) {
      //   console.error("Upload error:", err);
      //   this.uploadStatus = "❌ Upload failed. Check console.";
      //   this.uploadStatusType = "error";
      // }
    },
    async create_expense(url) {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(initiate_expense, {
            input: {
              bill_date: this.SendDate,
              category_id: this.expensecategory,
              bill_no: this.billingNo == null ? "" : this.billingNo,
              amount: this.amount,
              organization_id: data.organization.organization_id,
              expense_description: this.description,
              user_email_id: data.user.user_email_id,
              media_keys: url,
              expense_group_name:
                this.toggle_exclusive == "GROUP"
                  ? this.expenseGroup.title
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
                  ? this.Projects.title
                  : undefined,
            },
          })
        );
        var response = JSON.parse(result.data.initiate_expense);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          // this.fetch_audit_message();
          this.$emit("successMsg", response.Message);
          this.$emit("myexpense", "refresh");
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