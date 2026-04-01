<template>
  <div>
    <v-card flat class="mt-2">
      <v-card-text>
        <v-row class="ml-2 mt-5">
          <v-col cols="12">
            <label class="font-weight-bold">Tv Board API key : </label>
            <span ref="textInputapi">{{ api_key }}</span>
            <v-btn x-small @click="copyToClipboard_api_key()" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
          </v-col>
        </v-row>
        <v-row class="ml-2">
          <v-col cols="12" class="mt-n3">
            <label class="font-weight-bold"
              ><label style="color: green">POST</label> Publish Message :</label
            >
            <v-icon small color="green" class="mt-n1">mdi-lock-outline</v-icon
            ><br />
            <span ref="textInputurl">{{ url }}</span>
            <v-btn x-small @click="copyToClipboard_url()" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
          </v-col>
        </v-row>
        <v-row class="ml-2">
          <v-col cols="12" class="mt-n2 mb-5">
            <label class="font-weight-bold">Team-API-Key :</label>
            <v-icon small color="green">mdi-key</v-icon><br />
            <span ref="mySpan">{{ teamapi }}</span>
            <v-btn x-small @click="copyToClipboard_x_api_key()" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
          </v-col>
        </v-row>
        <v-row class="ml-2">
          <v-col cols="12" class="mt-n8 mb-5">
            <label class="font-weight-bold">Command :</label>
            <v-icon small color="green">mdi-comment</v-icon><br />
            <span ref="mySpan">{{ commandKey }}</span>
            <v-btn x-small @click="copyToClipboard_x_api_key(commandKey)" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
          </v-col>
        </v-row>
        <v-row class="ml-2">
          <v-col cols="12" class="mt-n6">
            <label class="font-weight-bold">BODY raw</label>

            <v-textarea readonly v-model="content" outlined height="430px">
            </v-textarea>
          </v-col>
        </v-row>
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
    teamapi: "",
    url: "",
    x_api_key: "",
    content: "",
    commandKey: "",

    SnackBarComponent: {},
  }),
  async created() {
    await this.get_Org_details();

    this.x_api_key = this.orgDetails.organization["x-api-key"];
    this.api_key = this.$store.getters.GetTvdetails.tv_board_api_key;
    this.teamapi = this.orgDetails.organization.team_api_key;
    this.url = this.orgDetails.organization.invoke_url;
    this.commandKey = "tvboardMessagePublish";
    this.content = `{
        "command": "tvboardMessagePublish"
        "tv_board_api_key":  "${this.$store.getters.GetTvdetails.tv_board_api_key}",
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
        "team_api_key":  "${this.orgDetails.organization.team_api_key}",
        "content_type": "JSON",
        
    }`;
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    copyToClipboard_x_api_key() {
      const spanElement = this.$refs.mySpan;
      const text = spanElement.innerText;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            // console.log("Text copied to clipboard");
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
      const spanElement = this.$refs.textInputapi;
      const text = spanElement.innerText;

      // Use the Clipboard API to copy text to the clipboard
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            // console.log("Text copied to clipboard");
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
        // console.error("Clipboard API not supported in this browser.");
      }
    },

    copyToClipboard_url() {
      const spanElement = this.$refs.textInputurl;
      const text = spanElement.innerText;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            // console.log("Text copied to clipboard");
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
  },
};
</script>
    
    <style>
</style>