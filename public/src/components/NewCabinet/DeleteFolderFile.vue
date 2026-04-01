<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="deleteFolderDialog"
      @update:model-value="$emit('update:deleteFolderDialog', $event)"
      persistent
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-title class="text-center">
          <v-img
            :src="require('@/assets/trash.png')"
            alt="Delete Icon"
            max-width="800"
            height="150"
            contain
            class="rotate-swing"
          />
        </v-card-title>
        <v-card-text class="mt-6">
          <div class="text-center">
            Are you sure you want to delete
            <b>{{ rowInfo.FileName }}</b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            :loading="loading"
            @click="delete_dailog()"
            dark
            class="text-capitalize cardCss button-corner text-white"
          >
            Yes, Delete It!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { delete_cabinet } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    deleteFolderDialog: Boolean,
    selectedPath: String,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
      selectedFolderPath: "",
    };
  },

  methods: {
    close_dialog() {
      this.selectedFolderPath = "";
      this.$emit("clicked", 0);
    },

    async delete_dailog() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(delete_cabinet, {
            input: {
              organization_id: data.organization.organization_id,
              file_name:
                this.rowInfo.Size != "-" ? this.rowInfo.FileName : undefined,
              folder_name: await this.fetch_folder_names(),
            },
          })
        );
        var response = JSON.parse(result.data.delete_cabinet);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          var trimFolderData = this.selectedFolderPath.split("/");

          var trimData =
            trimFolderData.length > 1
              ? trimFolderData[trimFolderData.length - 1]
              : trimFolderData[0];
          // console.log(trimData);
          var filetype = this.rowInfo.Size != "-" ? "file" : "folder";
          this.$emit(
            "sucessmsg",
            response.Message,
            this.selectedFolderPath,
            filetype
          );
          //   this.$emit("deltetedPath", this.selectedFolderPath);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },

    fetch_folder_names() {
      var data = this.rowInfo.Key.split("/");
      //   console.log(data);
      var folderName = "";

      if (data.length == 1) {
        folderName = this.rowInfo.Key;
      } else {
        if (this.rowInfo.Size != "-") {
          var trim = data.slice(2, -1);
          var trimmedLength = trim.length == 1 ? trim[0] : trim.join("/");
          folderName = trimmedLength;
        } else {
          var urlParts = data;
          urlParts = urlParts.slice(2);
          urlParts = urlParts.filter((part) => part !== "");
          let path = urlParts.join("/");
          folderName = path;
        }
      }
      this.selectedFolderPath = folderName;
      return folderName;
    },
  },
};
</script>