<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="createFolderDialog" @update:model-value="$emit('update:createFolderDialog', $event)" persistent max-width="450" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            >
            <div class="custom-title"> Create Folder 
              </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-5">
              <v-col cols="12">
                <v-text-field
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Required']"
                  v-model="folderName"
                  label="Folder Name"
                />
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
            >Create</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import AWS from "aws-sdk";
export default {
  props: {
    createFolderDialog: Boolean,
    orgResponse: Object,
    primaryKey: String,
  },
  watch: {
    createFolderDialog: {
      async handler() {
        if (this.createFolderDialog == true) {
          //   this.$refs.form.reset();
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      folderName: "",
      loading: false,
    };
  },
  methods: {
    close_dialog() {
      this.folderName = "";
      this.$emit("clicked", 0);
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        this.create_folder();
      }
    },
    create_folder() {
      var self = this;
      const s3 = new AWS.S3({
        region: this.orgResponse.s3_details.region,
        accessKeyId: this.orgResponse.s3_details.access_key,
        secretAccessKey: this.orgResponse.s3_details.secret_key,
      }); // Replace with your S3 region
      const params = {
        Bucket: this.orgResponse.s3_details.bucket_name,
        Key:
          this.primaryKey != ""
            ? this.primaryKey + this.folderName + "/"
            : "Cabinet" +
              "/" +
              this.orgResponse.organization.organization_id +
              "/",
        Body: "",
      };

      s3.upload(params, (err, data) => {
        if (err) {
          self.loading = false;
        } else {
          self.$emit("folderSuccess", "Created Successfully");
          self.folderName = "";
          self.loading = false;
        }
      });
    },
  },
};
</script>