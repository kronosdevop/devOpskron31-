<template>
  <div>
    <v-card flat class="pa-3">
      <!-- Header with Back Button -->
      <v-card-title class="d-flex align-center justify-space-between pa-2">
        <div class="d-flex align-center">
          <v-icon class="mr-2" color="#DB4C77" size="20">mdi-file-document-multiple-outline</v-icon>
          <span class="text-h6">Proforma Email Template</span>
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
          <v-btn text @click="goBack" class="back-link" color="primary" size="small">
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
                  <label class="text-caption font-weight-medium mb-1 d-block">Template Name *</label>
                  <v-text-field
                    v-model="templateName"
                    variant="outlined"
                    density="compact"
                    readonly
                    placeholder="Enter template name"
                    hide-details
                    :rules="[v => !!v || 'Template name is required']"
                    required
                  />
                </div>

                <!-- Subject Line -->
                <div class="mb-3">
                  <label class="text-caption font-weight-medium mb-1 d-block">Email Subject *</label>
                  <v-text-field
                    v-model="emailSubject"
                    variant="outlined"
                    density="compact"
                    placeholder="Enter email subject"
                    hide-details
                    :rules="[v => !!v || 'Email subject is required']"
                    required
                  />
                </div>

                <!-- Sender Name -->
                <div class="mb-3">
                  <label class="text-caption font-weight-medium mb-1 d-block">Sender Name *</label>
                  <v-text-field
                    v-model="senderName"
                    variant="outlined"
                    density="compact"
                    placeholder="Enter sender name"
                    hide-details
                    :rules="[v => !!v || 'Sender name is required']"
                    required
                  />
                </div>

                <!-- Sender Email -->
                <div class="mb-3">
                  <label class="text-caption font-weight-medium mb-1 d-block">Sender Email</label>
                  <v-text-field
                    v-model="senderEmail"
                    variant="outlined"
                    density="compact"
                    placeholder="Enter sender email"
                    type="email"
                    hide-details
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
              <v-card class="preview-card pa-3" elevation="0" style="border: 1px solid #e0e0e0">
                <div class="preview-header mb-2">
                  <strong>From:</strong> {{ senderName || 'Your Company' }} &lt;{{ senderEmail || 'noreply@company.com' }}&gt;
                </div>
                <div class="preview-header mb-2">
                  <strong>Subject:</strong> {{ emailSubject || 'Proforma Invoice - {proforma_number}' }}
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
                <v-icon class="mr-1" color="#DB4C77" size="16">mdi-pencil</v-icon>
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
  </div>
</template>

<script>
import { VueEditor } from "vue3-editor";

export default {
  name: "ProformaTemplate",
  
  components: {
    VueEditor,
  },
  
  data() {
    return {
      saving: false,
      isFormValid: false,
      
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
      templateName: "Proforma Template",
      emailSubject: "Proforma Invoice - {{proforma_number}}",
      senderName: "Sales Team",
      senderEmail: "sales@company.com",
      emailContent: "Dear {{customer_name}},\n\nPlease find attached the proforma invoice for your order.\n\n**Proforma Details:**\n- Proforma Number: {{proforma_number}}\n- Date: {{proforma_date}}\n- Due Date: {{due_date}}\n- Total Amount: {{total_amount}}\n\n**Important Notes:**\n- This is a proforma invoice and not a tax invoice\n- Payment is required before goods/services are delivered\n- Please review all details carefully\n\n**Payment Instructions:**\n- Bank: {{bank_name}}\n- Account: {{account_number}}\n- Reference: {{proforma_number}}\n\nIf you have any questions or need to make changes, please contact us immediately.\n\nBest regards,\n{{sender_name}}\n{{company_name}}",

      // Available variables for template
      availableVariables: [
        { key: "{{customer_name}}", label: "Customer Name" },
        { key: "{{proforma_number}}", label: "Proforma Number" },
        { key: "{{proforma_date}}", label: "Proforma Date" },
        { key: "{{due_date}}", label: "Due Date" },
        { key: "{{total_amount}}", label: "Total Amount" },
        { key: "{{bank_name}}", label: "Bank Name" },
        { key: "{{account_number}}", label: "Account Number" },
        { key: "{{sender_name}}", label: "Sender Name" },
        { key: "{{company_name}}", label: "Company Name" },
        { key: "{{company_address}}", label: "Company Address" },
        { key: "{{company_phone}}", label: "Company Phone" },
        { key: "{{company_email}}", label: "Company Email" }
      ],
      
      quill: null
    };
  },

  methods: {
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Save template logic here
        // console.log("Saving proforma template:", {
        //   name: this.templateName,
        //   subject: this.emailSubject,
        //   senderName: this.senderName,
        //   senderEmail: this.senderEmail,
        //   content: this.emailContent
        // });

        // Show success message
        this.$toast?.success("Template saved successfully!");
      } catch (error) {
        console.error("Error saving template:", error);
        this.$toast?.error("Failed to save template");
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
.preview-card {
  background-color: #f8f9fa;
  font-family: 'Courier New', monospace;
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
