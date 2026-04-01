<template>
  <div>
    <v-toolbar flat>
      <v-toolbar-title>Cabinet</v-toolbar-title>
      <v-spacer />

      <v-btn @click="upload_file()" dark class="text-capitalize cardCss">
        <v-icon left> mdi-cloud-upload </v-icon>
        Upload File
      </v-btn>

      <v-btn
        dark
        @click="create_folder()"
        class="ml-2 text-capitalize cardCss mr-2"
      >
        <v-icon left> mdi-folder </v-icon> Create Folder</v-btn
      >
      <!-- <v-btn dark @click="add_data()" class="text-capitalize cardCss"
        >Create Folder</v-btn
      > -->
      <v-btn dark class="text-capitalize cardCss" @click="back_call()">
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-toolbar>
    <v-breadcrumbs class="mt-n2" :items="breadcrumbsItems">
      <template #divider>
        <v-icon color="black" large>mdi-chevron-right</v-icon>
      </template>
      <template #item="{ item }">
        <v-breadcrumbs-item @click="previous_data(item, breadcrumbsItems)">
          <!-- <v-icon v-if="item.name == 'MyDocs'" class="mr-1" color="primary"
          >mdi-home</v-icon
        > -->
          <div>{{ item.text }}</div>
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>
    <v-card class="mt-n1" flat>
      <v-card-text>
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        <v-data-table
          :headers="headers"
          :items="tableData"
          :loading="tableLoading"
          :height="height"
          :fixed-header="fixed"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 dtwidth"
          @click:row="handleRowClick"
        >
          <template v-slot:[`item.FileName`]="{ item }">
            <v-icon color="black" small>{{ item.fileIcon }}</v-icon>
            <span class="caption ml-2">{{ item.FileName }}</span>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              v-if="item.fileIcon != 'mdi-folder'"
              :loading="loadingDel"
              small
              color="red"
              @click="delete_action(item)"
            >
              mdi-delete
            </v-icon>
            <v-icon
              v-if="item.fileIcon != 'mdi-folder'"
              :loading="loadingDel"
              small
              color="primaryColor"
              @click="download_actions(item)"
            >
              mdi-download
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <CreateFolder
        :createFolderDialog="createFolderDialog"
        :primaryKey="primaryKey"
        :orgResponse="orgResponse"
        @clicked="createFolderDialog = false"
        v-on:folderSuccess="new_folder_creation"
      />
    </div>
    <div v-if="componentCheck == 2">
      <UploadFileDialog
        :uploadFileDialog="uploadFileDialog"
        :primaryKey="primaryKey"
        :orgResponse="orgResponse"
        @clicked="uploadFileDialog = false"
        v-on:fileSuccess="new_folder_creation"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import CreateFolder from "@/components/CollateralsApp/CollateralPopups/CreateFolder.vue";
import UploadFileDialog from "@/components/CollateralsApp/CollateralPopups/UploadFileDialog.vue";
import SnackBar from "@/components/SnackBar.vue";
import AWS from "aws-sdk";

export default {
  components: {
    SnackBar,
    CreateFolder,
    UploadFileDialog,
  },
  mixins: [get_Org_details],
  data() {
    return {
      SnackBarComponent: {},
      headers: [
        { text: "Folder", value: "FileName", sortable: false },
        // {
        //   text: "Owner",
        //   value: "workflow_description",
        //   sortable: false,
        // },
        { text: "File Size", value: "FileSize", sortable: false },
        { text: "Last Modified", value: "LastModified", sortable: false },
        { text: "Actions", value: "actions", sortable: false },
        // { text: "#Txs", value: "total_counts_of_workflows", sortable: false },
      ],
      tableData: [],
      tableLoading: false,
      orgResponse: {},
      createFolderDialog: false,
      componentCheck: 0,
      uploadFileDialog: false,
      loadingDel: false,
      breadcrumbs: [],
      firstCheck: 0,
      primaryKey: "",
      breadcrumbsItems: [],
      currentPathInfo: "",
      fixed: true,
      height: 0,
    };
  },
  async created() {
    this.firstCheck = 0;
    await this.get_Org_details();
    this.get_details();
    this.breadcrumbsItems = this.dynamicBreadcrumbs;
    this.fetch_folders("dd");
    this.height = window.innerHeight - 280;
  },
  computed: {
    dynamicBreadcrumbs() {
      const breadcrumbs = this.currentPathInfo.split("/").filter(Boolean);

      const firstBreadcrumb = {
        text: "My Docs",
        disabled: false,
        CurrentPath:
          "Cabinet" + "/" + this.orgDetails.organization.organization_id + "/",
      };
      const dynamicBreadcrumbs = breadcrumbs.map((breadcrumb, index) => ({
        text: breadcrumb,
        disabled: index === breadcrumbs.length - 1, // Disable the last breadcrumb
      }));

      return [firstBreadcrumb, ...dynamicBreadcrumbs];
    },
  },
  // watch: {
  //   currentPathInfo() {
  //     this.breadcrumbsItems = this.dynamicBreadcrumbs;
  //   },
  // },
  methods: {
    back_call() {
      this.$router.push("/AppList");
    },
    get_details() {},
    create_folder() {
      this.createFolderDialog = true;
      this.componentCheck = 1;
      this.orgResponse = this.orgDetails;
    },
    upload_file() {
      this.uploadFileDialog = true;
      this.componentCheck = 2;
      this.orgResponse = this.orgDetails;
    },

    async fetch_folders(value) {
      this.tableLoading = true;
      var data = this.orgDetails;
      var self = this;
      this.tableData = [];
      var folders = [];
      var contents = [];
      const s3 = new AWS.S3({
        region: data.s3_details.region,
        accessKeyId: data.s3_details.access_key,
        secretAccessKey: data.s3_details.secret_key,
      }); //
      var prefixData =
        this.firstCheck == 1
          ? value
          : "Cabinet" + "/" + data.organization.organization_id + "/";
      this.primaryKey = prefixData;
      const params = {
        Bucket: data.s3_details.bucket_name,
        Prefix: prefixData,
        Delimiter: "/",
      };

      return new Promise((resolve, reject) => {
        s3.listObjects(params, (err, data) => {
          if (err) {
            self.tableLoading = false;
            self.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: "Error Occured!! Please try again",
              Top: true,
            };
          } else {
            self.tableData = [];

            self.tableLoading = false;
            if (data.CommonPrefixes.length > 0) {
              data.CommonPrefixes.forEach(function (folder) {
                folders.unshift({
                  FileName: folder.Prefix.replace(params.Prefix, "").split(
                    "/"
                  )[0],
                  CurrentPath: folder.Prefix,
                  FileSize: 0,
                  LastModified: "-",
                  fileIcon: "mdi-folder",
                });
              });
            }

            if (data.Contents.length > 0) {
              contents = data.Contents.filter(
                (item) => item.Key !== params.Prefix
              ).map((item) => ({
                FileName: item.Key.replace(params.Prefix, ""),
                CurrentPath: item.Key,
                FileSize: this.formatBytes(item.Size),
                LastModified: new Date(item.LastModified).toLocaleString(),
                fileIcon: this.getFileIcon(item.Key),
              }));
            }
            this.tableData = [...folders, ...contents];
          }
        });
      });
    },
    previous_data(item, allValues) {
      var index = null;
      index = this.breadcrumbsItems.findIndex((obj) => obj.text === item.text);
      const previousIndex = index + 1;
      this.breadcrumbsItems.splice(previousIndex, 1);
      this.firstCheck = 1;
      this.fetch_folders(item.CurrentPath);
    },

    formatBytes(bytes, decimals = 2) {
      if (bytes === 0) {
        return "0 Bytes";
      }
      const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
      const base = 1024;
      const exponent = Math.floor(Math.log(bytes) / Math.log(base));
      const size = (bytes / Math.pow(base, exponent)).toFixed(2);

      return size + " " + units[exponent];
    },

    handleRowClick(value) {
      if (value.FileSize == 0) {
        this.primaryKey = value.CurrentPath;
        this.breadcrumbsItems.push({
          text: "My Docs",
          disabled: false,
          CurrentPath: this.currentPathInfo,
          CurrentPath: value.CurrentPath,
          text: value.FileName,
          LastModified: 0,
          // fileIcon: "",
        });
        this.firstCheck = 1;
        this.fetch_folders(value.CurrentPath);
      }
    },

    async delete_action(item) {
      this.loadingDel = true;
      var data = this.orgDetails;
      var self = this;
      var s3Bucket = new AWS.S3({
        region: data.s3_details.region,
        accessKeyId: data.s3_details.access_key,
        secretAccessKey: data.s3_details.secret_key,
      });
      var params = {
        Bucket: data.s3_details.bucket_name,
        Key: item.CurrentPath,
      };

      await s3Bucket.deleteObject(params, function (err, data) {
        if (err) {
          self.loadingDel = false;
        } else if (data) {
          self.loadingDel = false;
          this.firstCheck = 1;
          self.fetch_folders(item.CurrentPath);
        }
      });
    },

    async download_actions(item) {
      var data = this.orgDetails;

      const s3 = new AWS.S3({
        region: data.s3_details.region,
        accessKeyId: data.s3_details.access_key,
        secretAccessKey: data.s3_details.secret_key,
      });
      const params = {
        Bucket: data.s3_details.bucket_name,
        Key: item.CurrentPath,
        Expires: 36000,
      };

      const presignedUrl = s3.getSignedUrl("getObject", params);
      const url = presignedUrl.toString();
      window.open(url, "_blank");
    },

    getFileIcon(key) {
      var ext = key.split(".").pop();

      var fileIcon = "mdi-folder";
      switch (ext) {
        case "png":
          fileIcon = "mdi-camera-image";
          break;
        case "jpg":
          fileIcon = "mdi-camera-image";
          break;
        case "jpeg":
          fileIcon = "mdi-camera-image";
          break;
        case "csv":
          fileIcon = "mdi-file-document";
          break;
        case "pdf":
          fileIcon = "mdi-file-document";
          break;
        case "docx":
          fileIcon = "mdi-file-document";
          break;
        case "xlsx":
          fileIcon = "mdi-file-document";
          break;
        case "pptx":
          fileIcon = "mdi-file-document";
          break;
        case "mp3":
          fileIcon = "mdi-video";
          break;
        case "mp4":
          fileIcon = "mdi-video";
          break;
        case "xls":
          fileIcon = "mdi-file-document";
          break;
      }

      return fileIcon;
    },

    new_folder_creation(values) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: values,
        timeout: 5000,
        Top: true,
      };
      this.createFolderDialog = false;
      this.uploadFileDialog = false;
      this.firstCheck = 1;
      this.fetch_folders(this.primaryKey);
    },

    fetch_value(val) {
      const d = new Date(parseInt(val) * 1000);
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year
      );
    },
  },
};
</script>