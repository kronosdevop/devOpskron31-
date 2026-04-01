<template>
  <div>
    <v-toolbar class="mt-4" dense flat>
      <!-- <v-toolbar-title>Cabinet</v-toolbar-title> -->
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
    <v-breadcrumbs class="mt-n4" :items="breadcrumbsItems">
      <template #divider>
        <v-icon color="primary">mdi-chevron-right</v-icon>
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
            <!-- <v-icon
              v-if="item.fileIcon != 'mdi-folder'"
              small
              color="primaryColor"
              @click="view_image(item)"
            >
              mdi-eye
            </v-icon> -->
            <!--  -->
            <!-- v-if="item.fileIcon != 'mdi-folder'" :height="height" -->
            <v-icon
              :loading="loadingDel"
              small
              v-if="item.fileIcon == 'mdi-folder'"
              color="red"
              @click.stop="deleteFolderFromS3(item)"
              class="mr-2"
            >
              mdi-delete
            </v-icon>
            <v-icon
              :loading="loadingDel"
              small
              v-else
              color="red"
              class="mr-2"
              @click.stop="delete_action(item)"
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
            <v-icon
              v-if="isImage(item.FileName)"
              small
              color="primaryColor"
              class="ml-2"
              @click="view_image(item)"
            >
              mdi-eye
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
    <div v-if="componentCheck == 3">
      <FileView
        :rowInfo="rowInfo"
        :imageView="imageView"
        :s3Details="s3Details"
        @clicked="imageView = false"
      />
    </div>
    <div v-if="componentCheck == 4">
      <ImageView
        :rowInfo="rowInfo"
        :viewdailog="viewdailog"
        :s3Details="s3Details"
        @clicked="viewdailog = false"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import ImageView from "@/components/CollateralsApp/CollateralPopups/ImageView.vue";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import CreateFolder from "@/components/CollateralsApp/CollateralPopups/CreateFolder.vue";
import UploadFileDialog from "@/components/CollateralsApp/CollateralPopups/UploadFileDialog.vue";
import FileView from "@/components/CollateralsApp/CollateralPopups/FileView.vue";
import SnackBar from "@/components/SnackBar.vue";
import AWS from "aws-sdk";
import axios from "axios";
const FileSaver = require("file-saver");
export default {
  components: {
    SnackBar,
    CreateFolder,
    UploadFileDialog,
    FileView,
    ImageView,
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
      imageView: false,
      rowInfo: {},
      s3Details: {},
      viewdailog: false,
    };
  },
  async created() {
    this.height = window.innerHeight - 320;
    this.firstCheck = 0;
    await this.get_Org_details();
    this.get_details();
    this.s3Details = this.orgDetails;
    this.breadcrumbsItems = this.dynamicBreadcrumbs;
    this.fetch_folders("dd");
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
    isImage(fileName) {
      const imageExtensions = ["png", "jpeg", "jpg"]; // Add more extensions if needed
      const ext = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);

      return imageExtensions.includes(ext.toLowerCase());
    },
    back_call() {
      this.$router.push("/UserlevelApp");
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

    // view_image(item) {
    //   this.rowInfo = item;
    //   this.imageView = true;
    //   this.componentCheck = 3;
    // },
    view_image(item) {
      this.rowInfo = item;
      this.viewdailog = true;
      this.componentCheck = 4;
    },

    previous_data(item, allValues) {
      var index = null;
      index = this.breadcrumbsItems.findIndex((obj) => obj.text === item.text);
      const lastIndex = this.breadcrumbsItems.length - 1;
      const previousIndex = index + 1;
      if (lastIndex == previousIndex) {
        this.breadcrumbsItems.splice(previousIndex, 1);
        this.firstCheck = 1;
        this.fetch_folders(item.CurrentPath);
      }
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
    deleteFolderFromS3(folder) {
      // Configure the AWS SDK with your credentials
      var data = this.orgDetails;
      const AWS = require("aws-sdk");
      AWS.config.update({
        region: data.s3_details.region,
        accessKeyId: data.s3_details.access_key,
        secretAccessKey: data.s3_details.secret_key,
      });

      // Create a new instance of the S3 class
      const s3 = new AWS.S3();

      // Define parameters for the delete operation
      const params = {
        Bucket: data.s3_details.bucket_name,
        Prefix: folder.CurrentPath,
      };

      // Call the deleteObjects method to delete the folder and its contents
      s3.listObjectsV2(params, (err, data) => {
        if (err) {
          console.error("Error listing objects: ", err);
        } else {
          // console.log(data);
          if (data.Contents.length > 0) {
            const objects = data.Contents.map((obj) => ({ Key: obj.Key }));
            const deleteParams = {
              Bucket: params.Bucket,
              Delete: { Objects: objects },
            };
            s3.deleteObjects(deleteParams, (err, data) => {
              if (err) {
                console.error("Error deleting objects: ", err);
              } else {
                // console.log(folder.CurrentPath.replace(/\/[^\/]+\/?$/, "/"));
                this.fetch_folders(
                  folder.CurrentPath.replace(/\/[^\/]+\/?$/, "/")
                );

                // Perform any additional actions after successful deletion
              }
            });
          } else {
          }
        }
      });
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

          self.fetch_folders(item.CurrentPath.replace(/\/[^\/]+\/?$/, "/"));
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
        Expires: 3600,
      };

      const presignedUrl = s3.getSignedUrl("getObject", params);
      const url = presignedUrl.toString();
      // this.dwonload_pdf(url);
      if (item.fileIcon == "mdi-file-document") {
        this.dwonload_pdf(url, "File.pdf");
      } else if (item.fileIcon == "mdi-video") {
        this.dwonload_pdf(url, "Video.mp3");
      } else if (item.fileIcon == "mdi-camera-image") {
        this.dwonload_pdf(url, "Image.jpeg");
      } else if (item.fileIcon === "mdi-folder-zip") {
        this.dwonload_pdf(url, "folder.zip");
      } else if (item.fileIcon === "mdi-square-rounded-badge") {
        this.dwonload_pdf(url, "Icon.icon");
      } else if (item.fileIcon === "mdi-file-chart") {
        this.dwonload_pdf(url, "file.xlsx");
      }

      // window.open(url, "_blank");
    },

    async dwonload_pdf(url, fileName) {
      axios({
        url: url,
        method: "GET",
        responseType: "blob", // Set the response type to blob
      })
        .then((response) => {
          // Create a blob from the response
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Use the FileSaver library to save the file
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
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
          fileIcon = "mdi-file-chart";
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
        case "bin":
          fileIcon = "mdi-file-document";
          break;
        case "zip":
          fileIcon = "mdi-folder-zip";
          break;
        case "ico":
          fileIcon = "mdi-square-rounded-badge";
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