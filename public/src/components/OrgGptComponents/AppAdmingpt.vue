<template>
  <div>
    <v-toolbar flat>
      <v-row class="ml-4">
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
          <v-btn small class="black--text" text value="chat_gpt">
            Chat GPT
          </v-btn>
          <v-btn small class="black--text" text value="settings_gpt">
            Settings
          </v-btn>
          <v-btn small class="black--text" text value="Usage"> Usage </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-spacer />
      <v-btn dark class="text-capitalize cardCss" @click="back_call()">
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-toolbar>
    <div class="text-left" v-if="toggle_exclusive == 'chat_gpt'">
      <UserChatgpt />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'settings_gpt'">
      <GPTSettings />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'Usage'">
      <GPTUsage />
    </div>
  </div>
</template>

<script>
import GPTSettings from "@/components/OrgGptComponents/AdminComponent/GPTSettings.vue";
import GPTUsage from "@/components/OrgGptComponents/AdminComponent/GPTUsage.vue";
import UserChatgpt from "@/components/OrgGptComponents/UserChatgpt.vue";

export default {
  components: {
    GPTSettings,
    GPTUsage,
    UserChatgpt,
  },
  data: () => ({
    toggle_exclusive: "chat_gpt",
  }),
  methods: {
    back_call() {
      this.$router.push("/UserlevelApp");
    },
  },
};
</script>

<style>
</style>