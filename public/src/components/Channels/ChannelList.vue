<template>
  <div>
    <v-card flat class="mt-n4" >
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <!-- <v-card-title>Channels</v-card-title> -->
      <v-toolbar class="mt-4"  dense flat>
        <v-btn-toggle dense v-model="channelsToggle" color="grey" mandatory>
          <v-btn small class="black--text" text value="subscribed">
            Subscribed Channels
          </v-btn>
          <v-btn small class="black--text" text value="all">
            Other Channels
          </v-btn>
        </v-btn-toggle>
        <v-spacer />

        <v-btn
          v-show="channelsToggle == 'subscribed'"
          small
          dark
          @click="create_channel()"
          class="ml-2 text-capitalize cardCss mr-2"
        >
          Create
        </v-btn>

        <v-btn dark small class="text-capitalize cardCss" @click="back_call()">
          <v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-toolbar>
    </v-card>
    <div class="text-left" v-if="channelsToggle == 'subscribed'">
      <MyChannels :key="countCheck" />
    </div>
    <div class="text-left" v-if="channelsToggle == 'all'">
      <OtherChannelList />
    </div>
    <div v-if="componentCheck == 1">
      <CreateChannel
        :createChannelDialog="createChannelDialog"
        @clicked="createChannelDialog = false"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import MyChannels from "@/components/Channels/MyChannels.vue";
import OtherChannelList from "@/components/Channels/OtherChannelList.vue";
import CreateChannel from "@/components/Channels/AllDialogs/CreateChannel.vue";

export default {
  components: {
    SnackBar,
    MyChannels,
    OtherChannelList,
    CreateChannel,
  },
  data() {
    return {
      channelsToggle: "subscribed",
      SnackBarComponent: {},
      createChannelDialog: false,
      componentCheck: 0,
      countCheck: 0,
      isVisible: false,
    };
  },
  methods: {
    back_call() {
      this.$router.push("/DashboardView");
    },
    create_channel() {
      this.isVisible = true;
      this.createChannelDialog = true;
      this.componentCheck = 1;
    },
    success_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.createChannelDialog = false;
      this.countCheck += 1;
    },

    error_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },
  },
};
</script>