<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="publishContent" @update:model-value="$emit('update:publishContent', $event)" persistent max-width="1000" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Publish Message</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  :rules="[(v) => !!v || 'Required']"
                  :counter="100"
                  outlined
                  dense
                  v-model="title"
                  maxlength="100"
                  label="Title"
                />
                <v-textarea
                  outlined
                  dense
                  v-model="imageurl"
                  rows="0"
                  :rules="[
                    (v) =>
                      !v ||
                      (!!v && v.length > 0, this.validateURL(v)) ||
                      'Invalid URL format',
                  ]"
                  maxlength="1000"
                  label="Image URL (optional)"
                ></v-textarea>
                <v-row class="mt-n6">
                  <v-col cols="12">
                    <label>Description :</label>
                    <div id="editor8"></div>
                  </v-col>
                </v-row>
                <!-- <v-textarea
                  :counter="500"
                  outlined
                  dense
                  class="mt-2"
                  height="150px"
                  v-model="decription"
                  maxlength="500"
                  label="Description"
                />
             -->
                <!-- <v-textarea
                  :counter="200"
                  outlined
                  dense
                  class=""
                  height="50px"
                  v-model="summary"
                  maxlength="200"
                  label="Summary(optional)"
                /> -->

                <!-- <v-text-field
                  outlined
                  dense
                  class="mt-8"
                  :rules="[
                    (v) =>
                      !v ||
                      (!!v && v.length > 0, this.validateURL(v)) ||
                      'Invalid URL format',
                  ]"
                  v-model="Information_url"
                  maxlength="1000"
                  label="Information URL(optional)"
                /> -->
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="publish_view()"
            dark
            class="cardCss text-capitalize button-corner"
          >
            Publish
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
            
            <script>
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
var axios = require("axios");
export default {
  props: {
    dashboarditems: Object,
    publishContent: Boolean,
  },
  mixins: [get_Org_details],
  data() {
    return {
      loading: false,
      Information_url: "",
      summary: "",
      decription: "",
      imageurl: "",
      SnackBarComponent: {},
      title: "",
      descriptionTemplate: "",
    };
  },
  watch: {
    publishContent: {
      async handler(newValue) {
        if (newValue) {
          // Wait for the next tick to ensure the dialog content is fully rendered
          this.$nextTick(() => {
            this.initCKEditor();
          });
        } else {
          // Clear the editor content or destroy the editor instance
          if (this.editor8) {
            this.editor8.setData(""); // Clear content
            // If CKEditor provides a method for destroying the instance, use it.
            // Example: this.editor8.destroy();
          }
        }
        await this.get_Org_details();
      },
      immediate: true,
    },
  },

  created() {},
  methods: {
    async initCKEditor() {
      const editorElement = document.querySelector("#editor8");

      // Check if the editor element exists
      if (!editorElement) {
        console.error("Editor element with ID 'editor8' not found.");
        return; // Exit the function if the editor element is not found
      }

      // Clear existing editor content or destroy existing instance
      if (this.editor8) {
        this.editor8.setData(""); // Clear content
        // If CKEditor provides a method for destroying the instance, use it.
        // Example: this.editor8.destroy();
      }

      // Create CKEditor instance if not already created
      if (!this.editor8) {
        try {
          this.editor8 = await ClassicEditor.create(editorElement, {
            toolbar: {
              // Toolbar configuration
              items: [
                "undo",
                "redo",
                "|",
                "heading",
                "|",
                "fontfamily",
                "fontsize",
                "fontColor",
                "fontBackgroundColor",
                "|",
                "bold",
                "italic",
                "strikethrough",
                "subscript",
                "superscript",
                "code",
                "|",

                "insertTable",
                "blockQuote",
                "codeBlock",
                "|",
                "alignment",
                "|",
                "bulletedList",
                "numberedList",
                "todoList",
                "outdent",
                "indent",
              ],
              shouldNotGroupWhenFull: true,
            },
          });
        } catch (error) {
          console.error("Error initializing CKEditor:", error);
        }
      }
    },
    close_dialog() {
      this.$refs.form.reset();

      this.$emit("clicked", 0);
    },
    validateURL(url) {
      if (url != "") {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
      }
    },

    publish_view() {
      if (this.$refs.form.validate()) {
        var descriptionDashboard = this.editor8.getData();
        descriptionDashboard = descriptionDashboard
          .replace(
            /<td>/g,
            "<td style='border: 1px solid black;  padding: 8px;text-align:center;'>"
          )
          .replace(
            /<th>/g,
            "<td style='border: 1px solid #555; padding: 8px; background-color:lightgrey'>"
          );
        this.loading = true;
        this.x_api_key = this.orgDetails.organization["x-api-key"];
        this.api_key = this.dashboarditems.dashboard_api_key;
        this.url = this.orgDetails.organization.invoke_url;
        axios({
          method: "post",
          maxBodyLength: Infinity,
          url: this.url,
          headers: {
            "x-api-key": this.x_api_key,
            "Content-Type": "application/json",
          },
          data: {
            dashboard_api_key: this.api_key,
            dashboard_message: {
              title: this.title,
              summary: this.summary,
              description: descriptionDashboard,
              image_url: this.imageurl,
              information_url: this.Information_url,
            },
            team_api_key: this.orgDetails.organization.team_api_key,
            content_type: "JSON",
            command: "dashboardMessagePublish",
          },
        })
          .then((res) => {
            if (res.data.Status == "SUCCESS") {
              this.loading = false;
              this.$emit("successMsg", res.data.Message);
              this.$refs.form.reset();
            } else {
              this.loading = false;
              this.$emit("errorMsg", res.data.Message);
            }
          })
          .catch((err) => {
            this.$emit("errorMsg", err.errors[0].message);
          });
      }
    },
  },
};
</script>
            
            <style>
</style>