<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat>
      <v-card-text class="mt-4">
        <v-form ref="form">
          <v-row>
            <v-col cols="6">
              <v-text-field
                outlined
                dense
                label="Title"
                :rules="[(v) => !!v || 'Required']"
                :counter="25"
                v-model="broadcastName"
                maxlength="25"
              />
              <v-textarea
                outlined
                dense
                :rules="[(v) => !!v || 'Required']"
                height="250"
                :counter="500"
                label="Description"
                v-model="description"
                maxlength="500"
              />
            </v-col>
            <v-col cols="6">
              <v-textarea
                v-model="imageUrl"
                rows="0"
                auto-grow
                dense
                outlined
                :rules="[
                  (v) =>
                    !v ||
                    (!!v && v.length > 0, this.validateURL(v)) ||
                    'Invalid URL format',
                ]"
                label="Image Url"
                maxlength="1000"
              />
              <v-textarea
                v-model="sourceInfo"
                dense
                auto-grow
                rows="0"
                outlined
                :rules="[
                  (v) =>
                    !v ||
                    (!!v && v.length > 0, this.validateURL(v)) ||
                    'Invalid URL format',
                ]"
                label="Source Info"
                maxlength="1000"
              />
            </v-col>
            <v-col cols="6"> </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          depressed
          :loading="loading"
          @click="validate_data()"
          dark
          class="cardCss text-capitalize button-corner"
        >
          Publish
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
    
    <script>
import SnackBar from "@/components/SnackBar.vue";
import { publish_broadcast_messages } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  // props: {
  //   broadcast_info: Object,
  // },
  components: {
    SnackBar,
  },
  data() {
    return {
      loading: false,
      broadcastName: "",
      description: "",
      dashboard_type: "",
      Password: "",
      SnackBarComponent: {},
      sourceInfo: "",
      imageUrl: "",
    };
  },

  created() {},
  methods: {
    // close_dialog() {
    //   this.$refs.form.reset();

    //   this.$emit("clicked", 0);
    // },
    validateURL(url) {
      if (url != "") {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
      }
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        this.Create_broadcast_message();
      }
    },
    async Create_broadcast_message() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(publish_broadcast_messages, {
            input: {
              broadcast_title: this.broadcastName,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              broadcast_description: this.description,
              broadcast_media_url: this.imageUrl == "" ? "N/A" : this.imageUrl,
              broadcast_source_url:
                this.sourceInfo == "" ? "N/A" : this.sourceInfo,

              broadcast_api_key: data.organization.team_api_key,
              team_topic_id: this.$store.getters.GetMessageitems.team_topic_id,
            },
          })
        );
        var response = JSON.parse(result.data.publish_broadcast_messages);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            Top: true,
            SnackbarText: response.Message,
          };
          this.imageUrl = "";
          // this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            Top: true,
            SnackbarText: response.Message,
          };
          // this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>
    
    <style>
</style>