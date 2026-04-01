<template>
  <div>
    <v-card  flat>
      <OverlayComp :overlay="overlay" />

      <v-card-text>
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        <v-toolbar class="mt-4" dense>
          <v-tabs v-model="allChannelSettings">
            <v-tab
              ><i>{{ channelName }}</i></v-tab
            >
            <v-tab>Publish Message</v-tab>

            <v-tab v-show="channelDetails.team_visibility == 'RESTRICTED'"
              >Members</v-tab
            >
            <v-tab>API</v-tab>
          </v-tabs>
          <v-spacer />

          <v-btn
            v-show="allChannelSettings == 2"
            class="mx-2"
            dark
            small
            color="primaryColor"
            @click="add_users_list()"
          >
            <v-icon dark> mdi-plus </v-icon>
          </v-btn>

          <v-btn dark class="text-capitalize cardCss" @click="back_call()">
            <v-icon class="mr-2">mdi-step-backward</v-icon>
            Back
          </v-btn>
        </v-toolbar>
        <div v-if="allChannelSettings == 0">
          <ChannelsInfo />
        </div>
        <div v-if="allChannelSettings == 1">
          <ChannelPublish />
        </div>
        <div v-if="allChannelSettings == 2">
          <ChannelsMembers :key="channelAddMembers" />
        </div>

        <div v-if="allChannelSettings == 3">
          <ChannelsAPI />
        </div>

        <div v-if="componentCheck == 1">
          <AddDeleteMembers
            :addDeleteMember="addDeleteMember"
            :actionType="actionType"
            :rowInfo="rowInfo"
            @clicked="addDeleteMember = false"
            v-on:successMsg="succes_info"
            v-on:errorMsg="error_info"
            v-on:validattions="error_info"
          />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
import OverlayComp from "@/components/OverlayComp.vue";
import SnackBar from "@/components/SnackBar.vue";
import ChannelsInfo from "@/components/Channels/AllDialogs/ChannelsInfo.vue";
import ChannelsMembers from "@/components/Channels/AllDialogs/ChannelsMembers.vue";
import ChannelPublish from "@/components/Channels/AllDialogs/ChannelPublish.vue";
import AddDeleteMembers from "@/components/Channels/AllDialogs/AddDeleteMembers.vue";
import ChannelsAPI from "@/components/Channels/AllDialogs/ChannelsAPI.vue";

export default {
  components: {
    OverlayComp,
    SnackBar,
    ChannelsInfo,
    ChannelsMembers,
    ChannelPublish,
    AddDeleteMembers,
    ChannelsAPI,
  },
  data() {
    return {
      channelName: "",
      allChannelSettings: 0,
      overlay: false,
      SnackBarComponent: {},
      entryKey: 0,
      componentCheck: 0,
      addDeleteMember: false,
      rowInfo: {},
      channelAddMembers: 0,
      actionType: "Add",
      channelDetails: {},
    };
  },

  created() {
    var fetchName = JSON.parse(localStorage.getItem("channelInfo"));
    this.channelDetails = fetchName;
    this.channelName = fetchName.team_name;
  },
  methods: {
    back_call() {
      this.$router.push("/ChannelList");
    },

    add_users_list() {
      this.componentCheck = 1;
      this.addDeleteMember = true;
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

    succes_info(val) {
      this.addDeleteMember = false;
      this.channelAddMembers++;
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },
  },
};
</script>