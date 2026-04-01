<template>
  <div>
    <v-card flat >
      <v-card-title class="">
        <v-spacer />
        <v-btn
          @click="validate_actions"
          :loading="loading"
          small
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
                small-chips
                outlined
                dense
                deletable-chips
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
                dense
                outlined
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
              outlined
              dense
              class="ml-3 mt-n4"
              label="Placeholder for Body"
              :search-input.sync="search"
              @input="search = ''"
            />
            <v-btn
              @click="insertSelectedItem"
              class="white--text text-capitalize cardCss ml-8 mt-n3"
              dark
              small
            >
              Add
            </v-btn>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12">
              <label>Body:</label>
              <div id="editor13"></div>
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
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { update_list_email_templates } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
  },
  data() {
    return {
      ccEmails: [],
      selectedItem: null,
      search: "",
      subjectValue: "",
      dropdownItems: [
        { text: "Total Amount", value: "{{total_amount}}" },
        { text: "Quatation Number", value: "{{quatation_no}}" },
        { text: "Customer Name", value: "{{customer_name}}" },
        { text: "Entity Name", value: "{{entity_name}}" },
        { text: "Entity Address", value: "{{entity_address}}" },
        { text: "Customer Email-ID", value: "{{to_address}}" },
      ],
      editor13: null,
      loading: false,
      ccError: "",
      bodyValue: "", // Stores latest CKEditor content
      bodyError: "",
      SnackBarComponent: {},
    };
  },
  async mounted() {
    try {
      this.editor13 = await ClassicEditor.create(
        document.querySelector("#editor13"),
        {
          toolbar: {
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
              "link",
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
            shouldNotGroupWhenFull: false,
          },
        }
      );

      // Set initial value
      this.editor13.setData(this.bodyValue);

      // Listen for changes and update bodyValue
      this.editor13.model.document.on("change:data", () => {
        this.bodyValue = this.editor13.getData();
      });
    } catch (error) {
      console.error("CKEditor initialization failed:", error);
    }
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
    insertSelectedItem() {
      if (this.selectedItem) {
        this.editor13.model.change((writer) => {
          writer.insertText(
            this.selectedItem,
            this.editor13.model.document.selection.getFirstPosition()
          );
        });
        this.bodyError = "";
      }
    },
    async fetch_templatelist() {
      try {
        let result = await API.graphql(
          graphqlOperation(update_list_email_templates, {
            input: {
              action_type: "LIST",
              email_template_type: "PROFORMA",
            },
          })
        );

        let response = JSON.parse(result.data.update_list_email_templates);

        if (response.Status === "SUCCESS" && response.data.length > 0) {
          const emailTemplate = response.data[0].email_template;

          this.ccEmails = emailTemplate.cc || [];
          this.subjectValue = emailTemplate.subject || "";

          if (this.editor13) {
            this.editor13.setData(emailTemplate.body || "");
          } else {
            this.$nextTick(() => {
              if (this.editor13) {
                this.editor13.setData(emailTemplate.body || "");
              }
            });
          }
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
    validate_actions() {
      const emailBody = this.editor13.getData().trim(); // Get editor content

      if (!emailBody) {
        this.bodyError = "Email body cannot be empty";
      } else {
        this.bodyError = "";
      }
      if (this.$refs.form.validate() && emailBody) {
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
              email_template_type: "PROFORMA",
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
        body: this.bodyValue, // Always holds latest CKEditor content
        subject: this.subjectValue,
        cc: this.ccEmails.map((email) => email.trim()), // Ensure each value is a separate string
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
</style>
