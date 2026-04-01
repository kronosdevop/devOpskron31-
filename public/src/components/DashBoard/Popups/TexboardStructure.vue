<template>
  <div>
    <v-card class="mt-2">
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="7">
            <v-row no-gutters>
              <v-col cols="12">
                <v-textarea
                  :counter="200"
                  variant="outlined"
                  density="compact"
                  v-model="titleinput"
                  maxlength="200"
                  label="Title"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  :counter="200"
                  variant="outlined"
                  density="compact"
                  v-model="summaryOptional"
                  maxlength="200"
                  label="Summary (Optional)"
                />
              </v-col>

              <v-col cols="12">
                <v-row no-gutters>
                  <v-btn
                    size="small"
                    variant="outlined"
                    color="primary"
                    @click="apply_formating('bold')"
                  >
                    B
                  </v-btn>
                  <v-btn
                    size="small"
                    class="ml-2"
                    variant="outlined"
                    @click="apply_formating('italic')"
                  >
                    I
                  </v-btn>
                </v-row>
                <div
                  ref="editor"
                  class="mt-2 editor"
                  placeholder="Message Body(Optional)"
                  contenteditable="true"
                  @input="update_content"
                ></div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="justify-start mt-2">
        <v-btn
          :loading="loading"
          @click="publish_data()"
          color="primary"
          variant="flat"
          class="cardCss ml-4 text-capitalize"
        >
          Publish
        </v-btn>
      </v-card-actions>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
/*eslint-disable*/
var axios = require("axios");
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
  },
  data() {
    return {
      titleinput: "",
      summaryOptional: "",
      messageBody: "",
      formatType: "",
      sectionType: "",
      sectionTitle: "",
      loading: false,
      sectionArray: [],
      subtype: "",
      SnackBarComponent: {},
    };
  },

  methods: {
    apply_formating(command) {
      // Apply the formatting command to the contenteditable div
      document.execCommand(command, false, null);
    },

    update_content() {
      this.messageBody = this.$refs.editor.innerHTML;
      //   console.log(this.messageBody);
    },

    publish_data() {
      if (this.titleinput == "" && this.$refs.editor.innerHTML == "") {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Enter title and  body",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.loading = true;

        axios({
          method: "post",
          maxBodyLength: Infinity,
          url: this.$store.getters.GetOrgDetails.organization.invoke_url,
          headers: {
            "x-api-key":
              this.$store.getters.GetOrgDetails.organization["x-api-key"],
            "Content-Type": "application/json",
          },
          data: {
            dashboard_api_key:
              this.$store.getters.GetdashboardDetails.dashboard_api_key,
            section_data: this.fetch_section_data(),
            team_api_key:
              this.$store.getters.GetOrgDetails.organization.team_api_key,
            content_type: "JSON",
            command: "dashboardMessagePublish",
          },
        })
          .then((res) => {
            // console.log(res);
            if (res.data.Status == "SUCCESS") {
              this.loading = false;

              this.SnackBarComponent = {
                SnackbarVmodel: true,
                SnackbarColor: "green",
                SnackbarText: res.data.Message,
                timeout: 5000,
                Top: true,
              };

              this.titleinput = "";
              this.messageBody = "";
              this.summaryOptional = "";
              this.$refs.editor.innerHTML = "";

              //   this.editor8.setData("");
              // this.get_dashboard();
            } else {
              this.loading = false;
              this.$emit("erroMsg", res.data.Message);

              this.SnackBarComponent = {
                SnackbarVmodel: true,
                SnackbarColor: "red",
                SnackbarText: res.data.Message,
                timeout: 5000,
                Top: true,
              };
            }
          })
          .catch((err) => {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: err.errors[0].message,
              timeout: 5000,
              Top: true,
            };
          });
      }
    },

    fetch_section_data() {
      var data = [];
      data.push({
        section_name: this.titleinput,
        section_type: "TEXT",
        body: this.$refs.editor.innerHTML,
        summary: this.summaryOptional,
        section_image_url: "",
      });
      // console.log(data);
      return data;
    },
  },
};
</script>
<style scoped>
.editor {
  border: 1px solid #ccc;
  padding: 10px;
  min-height: 200px;
  overflow-y: auto; /* Ensures scroll if content overflows */
}
</style>