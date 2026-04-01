<template>
  <div>
    <v-toolbar flat>
      <v-toolbar-title>Chat GPT</v-toolbar-title>

      <v-row class="ml-4">
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
          <v-btn small class="black--text" text value="settings">
            Settings
          </v-btn>
          <v-btn small class="black--text" text value="usage"> Usage </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-spacer/>
      <v-btn  dark class="text-capitalize cardCss" @click="back_call()"> <v-icon class="mr-2">mdi-step-backward</v-icon>
       Back
        </v-btn>
    </v-toolbar>
    <!-- <v-card class="" flat>
      <v-card-text>
        <v-tabs class="" v-model="settingsTab">
          <v-tab>Settings</v-tab>
          <v-tab-item>
            <GPTSettings />
          </v-tab-item>
          <v-tab>Usage</v-tab>
          <v-tab-item>
            <GPTUsage />
          </v-tab-item>
        </v-tabs>
      </v-card-text>
    </v-card> -->
    <div class="text-left" v-if="toggle_exclusive == 'settings'">
      <GPTSettings />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'usage'">
      <GPTUsage />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import GPTSettings from "@/components/OrgGptComponents/AdminComponent/GPTSettings.vue";
import GPTUsage from "@/components/OrgGptComponents/AdminComponent/GPTUsage.vue";

export default {
  components: {
    GPTSettings,
    GPTUsage,
  },
  data() {
    return {
      toggle_exclusive: "Settings",
      // settingsTab: "Settings",
    };
  },
  methods:{
    back_call(){
         this.$router.push("/AppList")
      },
  }
};
</script>
