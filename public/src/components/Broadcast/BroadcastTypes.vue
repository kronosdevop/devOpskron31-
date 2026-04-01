<template>
  <div>
    <v-card flat>
      <v-card-text >
        <v-toolbar flat>
          <!-- <v-toolbar-title>Select AI</v-toolbar-title> -->

          <v-row class="ml-4">
            <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
              <v-btn
                small
                class="black--text"
                text
                value="broadcast_publishmessage"
              >
                Broadcasts
              </v-btn>
              <v-btn small class="black--text" text value="edit_broadcast">
                Edit Details
              </v-btn>
              <v-btn
                small
                class="black--text"
                text
                value="publish_broadcast"
                v-if=" $store.getters.GetMessageitems.team_action_type == 'BROAD_CAST'"
              >
                Publish
              </v-btn>
              <v-btn
                small
                class="black--text"
                text
                value="api_broadcast"
                v-if=" $store.getters.GetMessageitems.team_action_type == 'GROUP_CAST'"
              >
                API
              </v-btn>
              <v-btn small class="black--text" text value="subscriber_list">
                Subscribers
              </v-btn>
            </v-btn-toggle>
          </v-row>
          <v-spacer />
          <v-btn depressed @click="back_mutation()" dark class="cardCss"
            ><v-icon class="mr-2">mdi-step-backward</v-icon>
            Back
          </v-btn>
        </v-toolbar>
        <div class="text-left" v-if="toggle_exclusive == 'api_broadcast'">
          <BroadcastApi  />
        </div>
        <div class="text-left" v-if="toggle_exclusive == 'edit_broadcast'">
          <EditBroadcast />
        </div>
        <div class="text-left" v-if="toggle_exclusive == 'publish_broadcast'">
          <BroadcastPublish  />
          <!-- v-on:errorMsg="error_info" -->
          <!-- v-on:successMsg="success_info" -->
        </div>
        <div class="text-left" v-if="toggle_exclusive == 'subscriber_list'">
          <SubcribersList  />
        </div>
        <div
          class="text-left"
          v-if="toggle_exclusive == 'broadcast_publishmessage'"
        >
          <PublishedMessages />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import BroadcastApi from "@/components/Broadcast/BroadcastApi.vue";
import EditBroadcast from "@/components/Broadcast/BroadcastPopups/EditBroadcast.vue";
import BroadcastPublish from "./BroadcastPublish.vue";
import SubcribersList from "./SubcribersList.vue";
import PublishedMessages from "./PublishedMessages.vue";
export default {
    components: {
        BroadcastApi,
        EditBroadcast,
        BroadcastPublish,
        PublishedMessages,
        SubcribersList
    },
  data() {
    return {
      toggle_exclusive: "broadcast_publishmessage",
    };
  },
  methods:{
    back_mutation(){
        this.$router.push("MessageTypes")
    }
  }
};
</script>

<style>
</style>