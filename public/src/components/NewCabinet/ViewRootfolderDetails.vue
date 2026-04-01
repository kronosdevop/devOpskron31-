<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="viewFootfolderDetails"
      @update:model-value="$emit('update:viewFootfolderDetails', $event)"
      max-width="500px"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="custom-title">File Details</v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="closeDialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text>
          <v-overlay :value="loading">
            <v-progress-circular
              indeterminate
              class="icon-class"
              size="44"
            ></v-progress-circular>
          </v-overlay>
          <div>
            <v-row class="justify-center">
              <iframe
                :src="FileUrl"
                width="100%"
                height="500px"
                allowfullscreen
                class="mt-10 justify-center"
                frameborder="0"
              ></iframe>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { get_s3_files_download } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    rowInfo: Object,
    viewFootfolderDetails: Boolean,
  },

  data() {
    return {
      FileUrl: "",
      loading: false,
    };
  },
  watch: {
    viewFootfolderDetails: {
      async handler() {
        if (this.viewFootfolderDetails == true) {
          const data = this.$store.getters.GetUserObj;
          this.get_fileurl(data);
        }
      },

      immediate: true,
    },
  },
  // watch: {
  //     viewFootfolderDetails(newVal) {
  //         if (newVal) {
  //             const data = this.$store.getters.GetUserObj;
  //             this.get_fileurl(data);
  //         } else {
  //             this.FileUrl = '';
  //             this.loading = false;
  //         }
  //     },
  // },
  methods: {
    closeDialog() {
      this.FileUrl = "";
      this.loading = false;
      this.$emit("clicked", 0);
    },
    async get_fileurl(data) {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(get_s3_files_download, {
            input: {
              organization_id: data.organization.organization_id,
              key: this.rowInfo.Key,
            },
          })
        );
        var response = JSON.parse(result.data.get_s3_files_download);
        this.FileUrl = response.data;
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>
<style scoped>
.navBar {
  background-color: #3f51b5;
}
.iframe-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 500px;
  overflow: hidden;
  background-color: #f5f5f5;
}
</style>
