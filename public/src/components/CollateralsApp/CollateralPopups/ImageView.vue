<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="viewdailog" @update:model-value="$emit('update:viewdailog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">View Image</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <div class="mt-4">
            <v-row justify="center">
              <v-img
                contain
                class="ma-4"
                :height="height"
                :src="view_image(rowInfo)"
              ></v-img>
              <!-- <pdf :src="view_image(rowInfo)"></pdf> -->
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
import AWS from "aws-sdk";
//
export default {
  props: {
    viewdailog: Boolean,
    rowInfo: Object,
    s3Details: Object,
  },
  //   components: {
  //     pdf,
  //   },
  data() {
    return {
      height: 0,
    };
  },
  watch: {
    viewdailog: {
      async handler() {
        if (this.viewdailog == true) {
          this.height = window.innerHeight - 290;
          //  console.log(this.custom_details.dashboard_created_by)   ;
          //  console.log( this.$store.getters.GetUserObj.user.user_email_id);
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    view_image(item) {
      var data = this.s3Details;

      const s3 = new AWS.S3({
        region: data.s3_details.region,
        accessKeyId: data.s3_details.access_key,
        secretAccessKey: data.s3_details.secret_key,
      });
      const params = {
        Bucket: data.s3_details.bucket_name,
        Key: item.CurrentPath,
        Expires: 3600,
      };

      const presignedUrl = s3.getSignedUrl("getObject", params);
      const url = presignedUrl.toString();

      return url;
    },
  },
};
</script>