<template>
  <div>
    <v-card flat class="pa-3 overflow-y-auto" :height="windowHeight">
      <!-- Header with Back Button -->
      <v-card-title class="d-flex align-center justify-space-between pa-2">
        <div class="d-flex align-center">
          <v-icon class="mr-2" color="#DB4C77" size="20"
            >mdi-receipt-outline</v-icon
          >
          <span class="text-h6">Invoice Email Template</span>
        </div>
        <div class="d-flex align-center">
          <v-btn
            color="#DB4C77"
            @click="saveTemplate"
            :loading="saving"
            :disabled="!isFormValid"
            size="small"
            class="mr-2"
          >
            Save Template
          </v-btn>
          <v-btn
            text
            @click="goBack"
            class="back-link"
            color="primary"
            size="small"
          >
            <v-icon left>mdi-arrow-left</v-icon>
            Back
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-2">
        <v-row>
          <!-- Left Column: Template Settings -->
          <v-col cols="12" md="4">
            <v-card class="pa-3" elevation="1">
              <v-card-title class="text-subtitle-1 mb-2">
                <v-icon class="mr-1" color="#DB4C77" size="16">mdi-cog</v-icon>
                Template Settings
              </v-card-title>

              <v-form ref="templateForm" v-model="isFormValid">
                <!-- Template Name -->
                <div class="mb-3">
                  <label class="text-caption font-weight-medium mb-1 d-block"
                    >Template Name *</label
                  >
                  <v-text-field
                    v-model="templateName"
                    variant="outlined"
                    density="compact"
                    readonly
                    placeholder="Enter template name"
                    hide-details
                    :rules="[(v) => !!v || 'Template name is required']"
                    required
                  />
                </div>

                <!-- Subject Line -->
                <div class="mb-3">
                  <label class="text-caption font-weight-medium mb-1 d-block"
                    >Email Subject *</label
                  >
                  <v-text-field
                    v-model="emailSubject"
                    variant="outlined"
                    density="compact"
                    placeholder="Enter email subject"
                    hide-details
                    :rules="[(v) => !!v || 'Email subject is required']"
                    required
                  />
                </div>

              </v-form>
            </v-card>
          </v-col>

          <!-- Right Column: Template Preview -->
          <v-col cols="12" md="8">
            <v-card class="pa-3" elevation="1">
              <v-card-title class="text-subtitle-1 mb-2">
                <v-icon class="mr-1" color="#DB4C77" size="16">mdi-eye</v-icon>
                Template Preview
              </v-card-title>

              <!-- Preview Card -->
              <v-card
                class="preview-card pa-3"
                elevation="0"
                style="border: 1px solid #e0e0e0"
              >
                <div class="preview-header mb-2">
                  <strong>From:</strong>
                  Your Company &lt;noreply@company.com&gt;
                </div>
                <div class="preview-header mb-2">
                  <strong>Subject:</strong>
                  {{ emailSubject || "Invoice - {invoice_number}" }}
                </div>
                <div class="preview-header mb-2">
                  <strong>To:</strong> [Customer Email]
                </div>
                <v-divider class="mb-2"></v-divider>
                <div class="preview-content" v-html="emailContent"></div>
              </v-card>
            </v-card>
          </v-col>
        </v-row>

        <!-- Email Content Editor -->
        <v-row class="mt-3">
          <v-col cols="12">
            <v-card class="pa-3" elevation="1">
              <v-card-title class="text-subtitle-1 mb-2">
                <v-icon class="mr-1" color="#DB4C77" size="16"
                  >mdi-pencil</v-icon
                >
                Email Content
              </v-card-title>

              <!-- Available Variables -->
              <div class="mb-3">
                <v-chip-group>
                  <v-chip
                    v-for="variable in availableVariables"
                    :key="variable.key"
                    @click="insertVariable(variable.key)"
                    color="#DB4C77"
                    variant="outlined"
                    size="x-small"
                    class="mr-1 mb-1"
                  >
                    {{ variable.label }}
                  </v-chip>
                </v-chip-group>
              </div>

              <!-- Rich Text Editor -->
              <div class="editor-container">
                <VueEditor
                  v-model="emailContent"
                  :editor-toolbar="customToolbar"
                  :editor-options="editorOptions"
                  @ready="onEditorReady"
                  @input="onEditorInput"
                />
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";
import { update_list_email_templates } from "@/graphql/mutations.js";
import SnackBar from "@/components/SnackBar.vue";
import { VueEditor } from "vue3-editor";

export default {
  name: "InvoiceTemplate",

  components: {
    SnackBar,
    VueEditor,
  },

  data() {
    return {
      saving: false,
      isFormValid: false,
      windowHeight: 0,
      SnackBarComponent: {},
      // VueEditor properties
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
        placeholder: "Enter email content...",
        theme: "snow",
      },

      // Template data
      templateName: "Invoice Template",
      emailSubject: "Invoice - {{invoice_number}}",
      emailContent:
        "Dear {{customer_name}},\n\nPlease find attached the invoice for your recent purchase.\n\n**Invoice Details:**\n- Invoice Number: {{invoice_number}}\n- Invoice Date: {{invoice_date}}\n- Due Date: {{due_date}}\n- Total Amount: {{total_amount}}\n- Tax Amount: {{tax_amount}}\n\n**Payment Instructions:**\n- Bank: {{bank_name}}\n- Account: {{account_number}}\n- Reference: {{invoice_number}}\n\n**Payment Terms:**\n{{payment_terms}}\n\nPlease ensure payment is made by the due date to avoid any late payment charges.\n\nIf you have any questions about this invoice, please contact our accounts team.\n\nThank you for your business!\n\nBest regards,\n{{sender_name}}\n{{company_name}}",

      // Available variables for template
      availableVariables: [
        { key: "{{customer_name}}", label: "Customer Name" },
        { key: "{{invoice_number}}", label: "Invoice Number" },
        { key: "{{invoice_date}}", label: "Invoice Date" },
        { key: "{{due_date}}", label: "Due Date" },
        { key: "{{total_amount}}", label: "Total Amount" },
        // { key: "{{tax_amount}}", label: "Tax Amount" },
        // { key: "{{bank_name}}", label: "Bank Name" },
        // { key: "{{account_number}}", label: "Account Number" },
        // { key: "{{payment_terms}}", label: "Payment Terms" },
        // { key: "{{sender_name}}", label: "Sender Name" },
        { key: "{{company_name}}", label: "Company Name" },
        { key: "{{company_address}}", label: "Company Address" },
        { key: "{{company_phone}}", label: "Company Phone" },
        { key: "{{company_email}}", label: "Company Email" },
      ],

      quill: null,
    };
  },
  mounted() {
    this.windowHeight = window.innerHeight - 150;
    this.loadTemplate();
  },
  methods: {
    async loadTemplate() {
      try {
        let result = await API.graphql(
          graphqlOperation(update_list_email_templates, {
            input: {
              action_type: "LIST",
              email_template_type: "SALE",
            },
          })
        );
        // console.log("Result:", result);
        let response = JSON.parse(result.data.update_list_email_templates);
        if (response.Status === "SUCCESS" && response.data.length > 0) {
          const emailTemplate = response.data[0].email_template;
          this.emailSubject = emailTemplate.subject || "";
          this.emailContent = emailTemplate.body || "";
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
    goBack() {
      this.$emit("backAction");
    },

    onEditorReady(quill) {
      this.quill = quill;
    },

    onEditorInput(html) {
      this.emailContent = html;
    },

    insertVariable(variable) {
      if (this.quill) {
        const range = this.quill.getSelection();
        if (range) {
          this.quill.insertText(range.index, variable);
        } else {
          this.quill.insertText(this.quill.getLength(), variable);
        }
      }
    },

    async saveTemplate() {
      // Validate form before saving
      const { valid } = await this.$refs.templateForm.validate();
      if (!valid) {
        this.$toast?.error("Please fix validation errors before saving");
        return;
      }

      this.saving = true;
      try {
        let result = await API.graphql(
          graphqlOperation(update_list_email_templates, {
            input: {
              action_type: "UPDATE",
              email_template_type: "SALE",
              email_template: this.all_data_template(),
            },
          })
        );
        let response = JSON.parse(result.data.update_list_email_templates);
        if (response.Status === "SUCCESS") {
          this.saving = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors?.[0]?.message || "Error saving template",
          timeout: 5000,
          Top: true,
        };
      } finally {
        this.saving = false;
      }
    },
    all_data_template() {
      var data = {
        body: this.emailContent,
        subject: this.emailSubject,
        cc: [],
      };
      return JSON.stringify(data);
    },
  },
};
</script>

     


<style scoped>
.preview-card {
  background-color: #f8f9fa;
  font-family: "Courier New", monospace;
  font-size: 12px;
}

.preview-header {
  color: #6c757d;
  font-size: 11px;
}

.preview-content {
  color: #2c3e50;
  line-height: 1.4;
  white-space: pre-wrap;
}

.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 4px;
}

.editor-container .ql-editor {
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
}

.editor-container .ql-toolbar {
  border-bottom: 1px solid #ccc;
  background-color: #f8f9fa;
}

.back-link {
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
