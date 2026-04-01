<template>
  <div>
    <v-card flat >
      <v-card-title class="">
        <v-spacer />
        <v-btn
          @click="validate_actions"
          :loading="loading"
          size="small"
          dark
          class="white--text text-capitalize cardCss mr-2"
        >
          Save
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-form ref="form">
          <v-row>
            <v-col cols="12">
              <v-combobox
                v-model="ccEmails"
                label="CC"
                multiple
                chips
                closable-chips
                variant="outlined"
                density="compact"
                hide-selected
                :rules="[
                  (v) => (v && v.length > 0) || 'CC is required',
                  (v) =>
                    v.every((email) => /\S+@\S+\.\S+/.test(email)) ||
                    'Enter valid email(s)',
                ]"
              />
              <span v-if="ccError" class="error-message">{{ ccError }}</span>
            </v-col>
            <v-col cols="12" class="mt-n6">
              <label>Subject:</label>
              <v-textarea
                density="compact"
                variant="outlined"
                rows="1"
                auto-grow
                v-model="subjectValue"
                :rules="[(v) => !!v || 'Subject is required']"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-autocomplete
              v-model="selectedItem"
              :items="dropdownItems"
              style="max-width: 350px"
              item-text="text"
              item-value="value"
              variant="outlined"
              density="compact"
              class="ml-3 mt-n4"
              label="Placeholder for Body"
              :search-input.sync="search"
              @input="search = ''"
            />
            <v-btn
              @click="insertSelectedItem"
              class="white--text text-capitalize cardCss ml-8 mt-n3"
              dark
              size="small"
            >
              Add
            </v-btn>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12">
              <label>Body:</label>
              <div class="editor-container">
                <VueEditor
                  v-model="bodyValue"
                  :editor-toolbar="customToolbar"
                  :editor-options="editorOptions"
                  @ready="onEditorReady"
                  @input="onEditorInput"
                />
              </div>
              <span v-if="bodyError" class="error-message">{{
                bodyError
              }}</span>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { VueEditor } from "vue3-editor";
import { update_list_email_templates } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
    VueEditor,
  },
  data() {
    return {
      ccEmails: [],
      selectedItem: null,
      search: "",
      subjectValue: "",
      dropdownItems: [
        { title: "Total Amount", value: "{{total_amount}}" },
        { title: "Quatation Number", value: "{{quatation_no}}" },
        { title: "Customer Name", value: "{{customer_name}}" },
        { title: "Entity Name", value: "{{entity_name}}" },
        { title: "Entity Address", value: "{{entity_address}}" },
        { title: "Customer Email-ID", value: "{{to_address}}" },
      ],
      bodyValue: "",
      loading: false,
      ccError: "",
      bodyError: "",
      SnackBarComponent: {},
      customToolbar: [
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ header: 1 }, { header: 2 }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ["clean"],
        ["link", "image"],
      ],
      editorOptions: {
        placeholder: "Enter email body content...",
        theme: "snow",
      },
    };
  },

  created() {
    this.fetch_templatelist();
  },

  methods: {
    validateEmails(value) {
      const emailPattern = /\S+@\S+\.\S+/;
      return (
        value.every((email) => emailPattern.test(email)) || "Enter valid emails"
      );
    },

    onEditorReady(quill) {
      this.quill = quill;
    
    },

    onEditorInput(html) {
      this.bodyValue = html;
      this.bodyError = "";
    },

    insertSelectedItem() {
      if (this.selectedItem && this.quill) {
        const range = this.quill.getSelection();
        if (range) {
          this.quill.insertText(range.index, this.selectedItem);
        } else {
          this.quill.insertText(this.quill.getLength(), this.selectedItem);
        }
        this.bodyError = "";
      }
    },

    async fetch_templatelist() {
      try {
        let result = await API.graphql(
          graphqlOperation(update_list_email_templates, {
            input: {
              action_type: "LIST",
              email_template_type: "QUOTATION",
            },
          })
        );

        let response = JSON.parse(result.data.update_list_email_templates);

        if (response.Status === "SUCCESS" && response.data.length > 0) {
          const emailTemplate = response.data[0].email_template;

          this.ccEmails = emailTemplate.cc || [];
          this.subjectValue = emailTemplate.subject || "";
          this.bodyValue = emailTemplate.body || "";
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors?.[0]?.message || "Error fetching template",
          timeout: 5000,
          Top: true,
        };
      }
    },

    async validate_actions() {
      const emailBody = this.bodyValue.trim();

      if (!emailBody) {
        this.bodyError = "Email body cannot be empty";
      } else {
        this.bodyError = "";
      }

      const { valid } = await this.$refs.form.validate();
      if (valid && emailBody) {
        this.loading = true;
        this.saveEmailTemplate();
      }
    },

    async saveEmailTemplate() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(update_list_email_templates, {
            input: {
              action_type: "UPDATE",
              email_template_type: "QUOTATION",
              email_template: this.all_data_template(),
            },
          })
        );

        let response = JSON.parse(result.data.update_list_email_templates);

        if (response.Status == "SUCCESS") {
          this.loading = false;
          this.fetch_templatelist();
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors?.[0]?.message || "Error fetching template",
          timeout: 5000,
          Top: true,
        };
      }
    },

    all_data_template() {
      var data = {
        body: this.bodyValue,
        subject: this.subjectValue,
        cc: this.ccEmails.map((email) => email.trim()),
      };
      return JSON.stringify(data);
    },
  },
};
</script>

<style scoped>
.error-message {
  color: red;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 8px;
}

.editor-container .ql-editor {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.editor-container .ql-toolbar {
  border-bottom: 1px solid #ccc;
  background-color: #f8f9fa;
}
</style>
