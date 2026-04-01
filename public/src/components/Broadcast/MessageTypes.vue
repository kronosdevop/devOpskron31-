<template>
  <div>
    <v-toolbar dense flat>
      <!-- <v-toolbar-title>Messages</v-toolbar-title> -->

      <v-row class="ml-4">
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
          <!-- <v-btn small class="black--text" text value="broadcast_view">
            Broadcast
          </v-btn> -->
          <v-btn small class="black--text" text value="broadchat_view">
            Broadcast
          </v-btn>
          <v-btn small class="black--text" text value="groupchat_view">
            Notifications
          </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-spacer />
      <!-- <v-btn
        dark
        @click="createGroup()"
        class="text-capitalize cardCss mr-2"
        v-if="toggle_exclusive == 'groupchat_view'"
        >Create</v-btn
      >
      <v-btn
        dark
        @click="create_annoucement()"
        class="text-capitalize cardCss mr-2"
        v-if="toggle_exclusive == 'broadchat_view'"
        >Create</v-btn
      > -->
      <!-- <v-btn dark class="text-capitalize cardCss" @click="back_call()">
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn> -->
    </v-toolbar>
    <div class="text-left" v-if="toggle_exclusive == 'broadcast_view'">
      <BroadcastMessages />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'groupchat_view'">
      <GroupChat :key="chatgroup" />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'broadchat_view'">
      <BroadcastChatview :key="messagehat" />
    </div>
    <div v-if="componentCheck == 1">
      <CreateBroadcast
        :annoucementDialog="annoucementDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="annoucementDialog = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <CreateGroupchat
        :groupDialog="groupDialog"
        v-on:errorMsg="error_info"
        v-on:successMsggroup="success_infogroup"
        @clicked="groupDialog = false"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
        
        <script>
import SnackBar from "@/components/SnackBar.vue";
import CreateBroadcast from "@/components/Broadcast/BroadcastPopups/CreateBroadcast.vue";
import BroadcastChatview from "./BroadcastChatview.vue";
import BroadcastMessages from "./BroadcastMessages.vue";
import GroupChat from "./GroupChat.vue";
import CreateGroupchat from "./BroadcastPopups/CreateGroupchat.vue";

export default {
  components: {
    GroupChat,
    SnackBar,
    BroadcastMessages,
    BroadcastChatview,
    CreateGroupchat,
    CreateBroadcast,
  },
  data: () => ({
    toggle_exclusive: "broadchat_view",
    annoucementDialog: false,
    groupDialog: false,
    componentCheck: 0,
    messagehat: 0,
    chatgroup: 0,
    SnackBarComponent: {},
  }),
  methods: {
    createGroup() {
      this.componentCheck = 2;
      this.groupDialog = true;
    },
    create_annoucement() {
      this.componentCheck = 1;
      this.annoucementDialog = true;
    },
    back_call() {
      this.$router.push("/UserlevelApp");
    },
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.messagehat++;
      this.annoucementDialog = false;
    },
    success_infogroup(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.chatgroup++;
      this.groupDialog = false;
    },
  },
};
</script>
        
        <style>
</style>