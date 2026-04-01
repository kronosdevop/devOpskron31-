<template>
  <div>
    <v-card flat class="mt-n2">
      <v-card-title>{{
        $store.getters.Getdashboarditems.dashboard_name
      }}</v-card-title>
      <v-card-text>
        <v-row class="ml-2 mt-n6">
          <v-col cols="6">
            <label class="font-weight-bold">Dashboard API key : </label>
            <span ref="textInputapi">{{ api_key }}</span>
            <v-btn x-small @click="copyToClipboard_api_key()" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
          </v-col>
        </v-row>
        <v-row class="ml-2">
          <v-col cols="6" class="mt-n3">
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
          <v-col cols="6" class="mt-n2 mb-5">
            <label class="font-weight-bold">X-API-Key :</label>
            <v-icon small color="green">mdi-key</v-icon><br />
            <span ref="mySpan">{{ x_api_key }}</span>
            <v-btn x-small @click="copyToClipboard_x_api_key()" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
          </v-col>
        </v-row>
        <v-row class="ml-2">
          <v-col cols="7" class="mt-n6">
            <label class="font-weight-bold">BODY raw</label>

            <v-textarea readonly v-model="content" outlined height="220px">
            </v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
export default {
  // props: {
  //   rowInfo: Object,
  // },
  mixins: [get_Org_details],
  data: () => ({
    api_key: "",
    url: "",
    x_api_key: "",
    content: "",
    minWidth: 100,
    maxWidth: 800,
  }),
  async created() {
    await this.get_Org_details();

    this.x_api_key = this.orgDetails.organization["x-api-key"];
    this.api_key = this.$store.getters.Getdashboarditems.dashboard_api_key;
    this.url = this.orgDetails.organization.invoke_url;
    this.content = `{
    "dashboard_api_key": ${this.$store.getters.Getdashboarditems.dashboard_api_key},
    "dashboard_message": {
        "title": "Hello Stichh",
        "summary": "This Text Is Shown As Sumamry Text Below dashboard Name In Dashboard List",
        "description": "This text is body of the message",
        "image_url": "https://thumbs.dreamstime.com/b/environment-earth-day-hands-trees-growing-seedlings-bokeh-green-background-female-hand-holding-tree-nature-field-gra-130247647.jpg",
        "information_url": "www.google.com"
    },
    "team_api_key":${this.orgDetails.organization.team_api_key},
    "content_type": "JSON",
    "command": "dashboardMessagePublish"
}`;
  },
  methods: {
    copyToClipboard_x_api_key() {
      const spanElement = this.$refs.mySpan;
      const text = spanElement.innerText;

      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      this.$emit("clicked", 0);
    },
    copyToClipboard_api_key() {
      const spanElement = this.$refs.textInputapi;
      const text = spanElement.innerText;

      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      this.$emit("clicked", 0);
    },
    copyToClipboard_url() {
      const spanElement = this.$refs.textInputurl;
      const text = spanElement.innerText;

      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      this.$emit("clicked", 0);
    },
  },
};
</script>

<style>
</style>