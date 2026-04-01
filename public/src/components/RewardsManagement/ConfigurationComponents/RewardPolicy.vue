<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat class="ma-2" >
      <!-- <v-row
        class="align-center px-6 pt-6 pb-2"
        
      >
        <v-col cols="auto" class="d-flex align-center">
          <v-icon class="mr-3" color="primary" size="large"
            >mdi-file-document</v-icon
          >
          <span class="font-weight-bold text-h6">Reward Policy</span>
        </v-col>
      </v-row> -->

      <v-card-text class="pa-6">
        <v-form ref="form">
          <v-row>
            <v-col cols="12">
              <v-card variant="outlined" class="pa-4 mb-4">
                <div class="d-flex align-center mb-3">
                  <v-icon size="20" color="primary" class="mr-2"
                    >mdi-image</v-icon
                  >
                  <span class="text-subtitle-2 font-weight-medium"
                    >Policy Image</span
                  >
                </div>

                <input
                  type="file"
                  ref="fileInput"
                  @change="handleFileChange"
                  style="display: none"
                  accept="image/*"
                />
                <v-btn
                  v-show="!signimagesarrayurls"
                  dark
                  elevation="0"
                  class="text-capitalize cardCss text-white mb-3"
                  @click="$refs.fileInput.click()"
                  size="small"
                  :loading="uploadload"
                >
                  <v-icon>mdi-plus</v-icon>
                  Choose Image
                </v-btn>

                <div v-if="signimagesarrayurls" class="mt-3">
                  <v-card
                    variant="outlined"
                    class="pa-3"
                    style="max-width: 300px; margin: 0 auto"
                  >
                    <div class="d-flex align-center justify-end mb-2">
                      <!-- <div class="font-weight-medium text-caption">
                        {{
                          signimagesarrayurls.substring(
                            signimagesarrayurls.lastIndexOf("/") + 1,
                            signimagesarrayurls.indexOf("?") !== -1
                              ? signimagesarrayurls.indexOf("?")
                              : undefined
                          )
                        }}
                      </div> -->
                      <v-btn
                        icon
                        size="small"
                        @click="delete_item(signimagesarrayurls)"
                        :loading="delLoading"
                      >
                        <v-icon color="red" size="small">mdi-delete</v-icon>
                      </v-btn>
                    </div>
                    <img
                      :src="signimagesarrayurls"
                      alt="Policy Image"
                      style="
                        max-width: 180px;
                        max-height: 180px;
                        border-radius: 8px;
                        border: 1px solid #e0e0e0;
                        background: #fafbfc;
                        display: block;
                        margin: 0 auto;
                      "
                    />
                  </v-card>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined" class="pa-4 mb-4">
                <div class="d-flex align-center mb-3">
                  <v-icon size="20" color="primary" class="mr-2"
                    >mdi-text</v-icon
                  >
                  <span class="text-subtitle-2 font-weight-medium"
                    >Policy Description</span
                  >
                </div>

                <div class="html-editor-container">
                  <div class="toolbar">
                    <v-btn-group
                      variant="outlined"
                      density="compact"
                      class="mr-2"
                    >
                      <v-btn
                        size="small"
                        @click="formatText('bold')"
                        prepend-icon="mdi-format-bold"
                      ></v-btn>
                      <v-btn
                        size="small"
                        @click="formatText('italic')"
                        prepend-icon="mdi-format-italic"
                      ></v-btn>
                      <v-btn
                        size="small"
                        @click="formatText('underline')"
                        prepend-icon="mdi-format-underline"
                      ></v-btn>
                    </v-btn-group>

                    <v-btn-group
                      variant="outlined"
                      density="compact"
                      class="mr-2"
                    >
                      <v-btn size="small" @click="formatText('h1')">H1</v-btn>
                      <v-btn size="small" @click="formatText('h2')">H2</v-btn>
                      <v-btn size="small" @click="formatText('h3')">H3</v-btn>
                    </v-btn-group>

                    <v-btn-group
                      variant="outlined"
                      density="compact"
                      class="mr-2"
                    >
                      <v-btn
                        size="small"
                        @click="formatText('insertUnorderedList')"
                        prepend-icon="mdi-format-list-bulleted"
                      ></v-btn>
                      <v-btn
                        size="small"
                        @click="formatText('insertOrderedList')"
                        prepend-icon="mdi-format-list-numbered"
                      ></v-btn>
                    </v-btn-group>

                    <v-btn-group variant="outlined" density="compact">
                      <v-btn
                        size="small"
                        @click="formatText('justifyLeft')"
                        prepend-icon="mdi-format-align-left"
                      ></v-btn>
                      <v-btn
                        size="small"
                        @click="formatText('justifyCenter')"
                        prepend-icon="mdi-format-align-center"
                      ></v-btn>
                      <v-btn
                        size="small"
                        @click="formatText('justifyRight')"
                        prepend-icon="mdi-format-align-right"
                      ></v-btn>
                    </v-btn-group>
                  </div>

                  <div
                    ref="editor"
                    class="html-editor"
                    contenteditable="true"
                    @input="updateContent"
                    @paste="handlePaste"
                    placeholder="Enter policy description here..."
                  ></div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4 justify-end">
        <v-btn variant="text" @click="resetForm" class="mr-3"> Reset </v-btn>
        <v-btn
          variant="elevated"
          :loading="loading"
          @click="savePolicy"
          color="primary"
          prepend-icon="mdi-content-save"
          class="text-capitalize"
        >
          Save Policy
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { deleteS3SignedUrl } from "@/mixins/S3DeleteStorageFile";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import { API, graphqlOperation } from "aws-amplify";
import { manage_awards_policies } from "@/graphql/mutations.js";

export default {
  components: {
    SnackBar,
  },
  data() {
    return {
      loading: false,
      uploadload: false,
      delLoading: false,
      documentFiles: null,
      signimagesarrayurls: "",
      actualURLs: "",
      editorContent: "",
      SnackBarComponent: {},
      policyData: null,
    };
  },
  mounted() {
    this.getPolicy();
  },


  methods: {
    async getPolicy() {
      try {
        const result = await API.graphql(
          graphqlOperation(manage_awards_policies, {
            input: { action_type: "LIST" },
          })
        );
        const response = JSON.parse(result.data.manage_awards_policies);
        this.policyData = response.data[0];
        this.editorContent = typeof this.policyData.policy_document === 'string' ? this.policyData.policy_document : ''  ;
        // console.log(this.editorContent, "editorContent");
        // console.log("Editor ref exists:", !!this.$refs.editor);
        
        // Update the editor content in the DOM with multiple attempts
        await this.$nextTick();
        if (this.$refs.editor && this.editorContent) {
          this.$refs.editor.innerHTML = this.editorContent;
          // console.log("Editor content set successfully");
        } else {
          // console.log("Editor ref or content not available");
        }
        
        this.actualURLs = this.policyData.policy_image_url || "";
        const orgDetails = this.$store.getters.GetOrgDetails;
        if(this.actualURLs){
        const signedUrl = await getS3SignedUrl(
            this.actualURLs,
            orgDetails.s3_details
          );
          if (signedUrl) {
            this.signimagesarrayurls = signedUrl;
          }
        }
        // console.log(this.signimagesarrayurls, "signimagesarrayurls");
      } catch (error) {
        console.error('Error fetching policy:', error);
      }
    },
    async handleFileChange(event) {
      const files = event.target.files;
      this.documentFiles = files[0];
      await this.upload_new_func();
    },

    async upload_new_func() {
      if (!this.documentFiles) return;
      this.uploadload = true;
      const orgDetails = this.$store.getters.GetOrgDetails;

      const userId = this.$store.getters.GetUserObj.user.user_id;
      const Key = [
        "reward_policies",
        orgDetails.organization.organization_id,
        userId,
        Date.now(),
        this.replaceSpecialCharacters(this.documentFiles.name),
      ].join("/");

      try {
        const fileUrl = await uploadToS3(
          this.documentFiles,
          orgDetails.s3_details,
          Key
        );
        if (fileUrl) {
          // Store single file URLs
          this.actualURLs = fileUrl;

          const signedUrl = await getS3SignedUrl(
            fileUrl,
            orgDetails.s3_details
          );
          if (signedUrl) {
            this.signimagesarrayurls = signedUrl;
            this.uploadload = false;
          }
        }
      } catch (err) {
        this.uploadload = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          Top: true,
          SnackbarText: "Upload failed. Please try again.",
        };
      }
    },

    formatText(command, value = null) {
      document.execCommand(command, false, value);
      this.$refs.editor.focus();
    },

    updateContent() {
      this.editorContent = this.$refs.editor.innerHTML;
    },

    handlePaste(event) {
      event.preventDefault();
      const text = event.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    },

    async delete_item(val) {
      this.delLoading = true;
      try {
        const urlObj = new URL(val);
        const key = urlObj.pathname.slice(1);

        const result = await deleteS3SignedUrl(key);
        if (result) {
          this.signimagesarrayurls = "";
          this.actualURLs = "";
        }
        this.delLoading = false;
      } catch (err) {
        this.delLoading = false;
        console.error("Delete error:", err);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          Top: true,
          SnackbarText: "Failed to delete file",
        };
      }
    },

    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
    },

    async savePolicy() {
      if (!this.editorContent.trim()) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          Top: true,
          SnackbarText: "Please enter policy description",
        };
        return;
      }

      this.loading = true;

      try {
        const userData = this.$store.getters.GetUserObj;
        const orgDetails = this.$store.getters.GetOrgDetails;

        const input = {
          policy_type:'AWARDS',
          policy_status: 'ACTIVE',
         
          policy_document: this.editorContent,
          policy_image_url: this.actualURLs || "",
          action_type: "UPDATE",
        };

        const result = await API.graphql(
          graphqlOperation(manage_awards_policies, { input })
        );

        const response = JSON.parse(result.data.manage_awards_policies);

        if (response.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            Top: true,
            SnackbarText: response.Message || "Policy saved successfully!",
          };
          this.getPolicy();
          this.resetForm();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            Top: true,
            SnackbarText: response.Message || "Failed to save policy",
          };
        }
      } catch (error) {
        console.error("Error saving policy:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          Top: true,
          SnackbarText: error.errors?.[0]?.message || "Failed to save policy",
        };
      } finally {
        this.loading = false;
      }
    },

    updateEditorContent() {
      if (this.editorContent && this.$refs.editor) {
        this.$refs.editor.innerHTML = this.editorContent;
        //  console.log("Editor content updated via updateEditorContent method");
      }
    },
    
    resetForm() {
      this.documentFiles = null;
      this.signimagesarrayurls = "";
      this.actualURLs = "";
      this.editorContent = "";
      if (this.$refs.editor) {
        this.$refs.editor.innerHTML = "";
      }
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    },
  },
};
</script>

<style scoped>
.html-editor-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.toolbar {
  background: #f5f5f5;
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.html-editor {
  min-height: 200px;
  max-height: 400px;
  padding: 16px;
  outline: none;
  overflow-y: auto;
  background: white;
}

.html-editor:empty:before {
  content: attr(placeholder);
  color: #999;
  font-style: italic;
}

.html-editor:focus {
  border-color: #1976d2;
}

.image-preview-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.v-text-field,
.v-textarea,
.v-file-input,
.v-select {
  transition: all 0.2s ease;
}

.v-text-field:focus-within,
.v-textarea:focus-within,
.v-file-input:focus-within,
.v-select:focus-within {
  transform: translateY(-1px);
}

.v-btn {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cardCss {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar .v-btn-group {
    justify-content: center;
  }
}
</style> 