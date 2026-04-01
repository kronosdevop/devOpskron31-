<template>
  <div>
    <v-card flat class="ma-2" :style="{ backgroundColor: '#f8f9fa' }">
      <!-- Simple Header -->
      <v-card-title class="d-flex align-center px-6 pt-6 pb-4" style="background: #f5f5f5; border-bottom: 1px solid #e0e0e0;">
        <v-icon size="24" color="primary" class="mr-3">mdi-api</v-icon>
        <span class="text-h6 font-weight-bold">Dashboard API Configuration</span>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- API Key Section -->
        <div class="mb-6">
          <div class="d-flex align-center mb-3">
            <v-icon size="20" color="primary" class="mr-2">mdi-key</v-icon>
            <span class="text-h6 font-weight-bold">Dashboard API Key</span>
          </div>
          <div class="d-flex align-center">
            <v-text-field
              :model-value="api_key"
              readonly
              variant="outlined"
              density="compact"
              class="mr-3"
              style="max-width: 400px;"
            ></v-text-field>
            <v-btn
              size="small"
              @click="copyToClipboard_api_key()"
              variant="outlined"
              color="primary"
            >
              <v-icon size="small" class="mr-1">mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </div>
        </div>

        <!-- URL Section -->
        <div class="mb-6">
          <div class="d-flex align-center mb-3">
            <v-icon size="20" color="primary" class="mr-2">mdi-web</v-icon>
            <span class="text-h6 font-weight-bold">POST Publish Message URL</span>
            <v-chip size="small" color="green" variant="flat" class="ml-2">POST</v-chip>
          </div>
          <div class="d-flex align-center">
            <v-text-field
              :model-value="url"
              readonly
              variant="outlined"
              density="compact"
              class="mr-3"
              style="max-width: 400px;"
            ></v-text-field>
            <v-btn
              size="small"
              @click="copyToClipboard_url()"
              variant="outlined"
              color="primary"
            >
              <v-icon size="small" class="mr-1">mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </div>
        </div>

        <!-- Team API Key Section -->
        <div class="mb-6">
          <div class="d-flex align-center mb-3">
            <v-icon size="20" color="primary" class="mr-2">mdi-shield-key</v-icon>
            <span class="text-h6 font-weight-bold">Team API Key</span>
          </div>
          <div class="d-flex align-center">
            <v-text-field
              :model-value="teamApiKey"
              readonly
              variant="outlined"
              density="compact"
              class="mr-3"
              style="max-width: 400px;"
            ></v-text-field>
            <v-btn
              size="small"
              @click="copyToClipboard_x_api_key(teamApiKey)"
              variant="outlined"
              color="primary"
            >
              <v-icon size="small" class="mr-1">mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </div>
        </div>

        <!-- Command Section -->
        <div class="mb-6">
          <div class="d-flex align-center mb-3">
            <v-icon size="20" color="primary" class="mr-2">mdi-console</v-icon>
            <span class="text-h6 font-weight-bold">Command</span>
          </div>
          <div class="d-flex align-center">
            <v-text-field
              :model-value="commandKey"
              readonly
              variant="outlined"
              density="compact"
              class="mr-3"
              style="max-width: 400px;"
            ></v-text-field>
            <v-btn
              size="small"
              @click="copyToClipboard_x_api_key(commandKey)"
              variant="outlined"
              color="primary"
            >
              <v-icon size="small" class="mr-1">mdi-content-copy</v-icon>
              Copy
            </v-btn>
          </div>
        </div>

        <!-- Request Body Section -->
        <div>
          <div class="d-flex align-center mb-3">
            <v-icon size="20" color="primary" class="mr-2">mdi-code-json</v-icon>
            <span class="text-h6 font-weight-bold">Request Body (JSON)</span>
            <v-chip size="small" color="primary" variant="flat" class="ml-2">RAW</v-chip>
          </div>
          <v-textarea
            readonly
            v-model="content"
            variant="outlined"
            class="font-family-monospace"
            rows="20"
            hide-details
          ></v-textarea>
          <div class="d-flex justify-end mt-3">
            <v-btn
              size="small"
              @click="copyToClipboard_x_api_key(content)"
              variant="outlined"
              color="primary"
            >
              <v-icon size="small" class="mr-1">mdi-content-copy</v-icon>
              Copy JSON
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";

export default {
  mixins: [get_Org_details],
  components: {
    SnackBar,
  },
  data: () => ({
    api_key: "",
    url: "",
    x_api_key: "",
    content: "",
    teamApiKey: "",
    commandKey: "",
    SnackBarComponent: {},
  }),
  async created() {
    await this.get_Org_details();

    this.x_api_key = this.orgDetails.organization["x-api-key"];
    this.api_key = this.$store.getters.GetdashboardDetails.dashboard_api_key;
    this.teamApiKey = this.orgDetails.organization.team_api_key;
    this.commandKey = "dashboardMessagePublish";
    this.url = this.orgDetails.organization.invoke_url;
    
    if (
      this.$store.getters.GetdashboardDetails.dashboard_publish_type == "TEXT"
    ) {
      this.content = `{
      "dashboard_api_key": "${this.$store.getters.GetdashboardDetails.dashboard_api_key}",
       "command": "dashboardMessagePublish",
      "section_data":
     [
      {
       "body": "Enter the text body",
       "section_name": "Enter the section title",
       "section_type": "TEXT",
       "summary":"Enter the summary"
      },
      ],
     
  }`;
    } else {
      this.content = `{
      "dashboard_api_key": "${this.$store.getters.GetdashboardDetails.dashboard_api_key}",
      "dashboard_summary":"Enter the summary"
       "command": "dashboardMessagePublish",
      "section_data": [
     // Text View //
    {
      "body": "Enter the text body",
      "section_name": "Enter the section title",
      "section_type": "TEXT"
    },
     // Tabular  View //
    {
      "section_name": "Enter the section name",
      "section_type": "TABULAR",
      "section_value": [
        {
          "headers": [
            "Enter the header title 1",
            "Enter the header title 2",
            "Enter the header title 3"
          ],
          "rows": [
            [
              "Enter the value of header 1",
              "Enter the value of header 2",
              "Enter the value of header 3"
            ],
            [
             "Enter the value of header 1",
              "Enter the value of header 2",
              "Enter the value of header 3"
            ]
          ]
        }
      ]
    },
     // Pie , Donut View //
    {
      "section_name": "Enter the section name",
      "section_type": "PIE_CHART / DONUT_CHART",
      "section_value": [
        {
          "label": "Enter the label 1",
          "value": "Enter the value of label 1"
        },
        {
          "label": "Enter the label 2",
          "value": "Enter the value of label 2"
        }
      ]
    },
    // Line (LINE_CHART) ,Vertical (BAR_CHART),Horizontal (COLUMN_CHART)  View //
    {
      "section_name": "Enter the section name",
      "section_type": "LINE_CHART / BAR_CHART / COLUMN_CHART",
      "section_value": [
        {
          "label": "Enter the label 1 ",
          "x": [
            "Enter the  title 1",
            "Enter the title 2"
          ],
          "y": [
            "Enter the value of title 1",
            "Enter the value of title 2"
          ]
        },
           {
          "label": "Enter the label 2 ",
          "x": [
            "Enter the  title 1",
            "Enter the title 2"
          ],
          "y": [
            "Enter the value of title 1",
            "Enter the value of title 2"
          ]
        }
      ]
    }
  ],
      
  }`;
    }
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    copyToClipboard_x_api_key(value) {
      const text = value;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: "Text copied to clipboard",
              timeout: 5000,
              Top: true,
            };
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
          });
      } else {
        console.error("Clipboard API not supported in this browser.");
      }
    },

    copyToClipboard_api_key() {
      const text = this.api_key;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: "API key copied to clipboard",
              timeout: 5000,
              Top: true,
            };
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
          });
      } else {
        console.error("Clipboard API not supported in this browser.");
      }
    },

    copyToClipboard_url() {
      const text = this.url;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: "URL copied to clipboard",
              timeout: 5000,
              Top: true,
            };
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
          });
      } else {
        console.error("Clipboard API not supported in this browser.");
      }
    },
  },
};
</script>
  
<style scoped>
.font-family-monospace {
  font-family: 'Courier New', Courier, monospace;
}

.v-textarea {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>