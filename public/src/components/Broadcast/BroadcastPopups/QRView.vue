<template>
  <!-- eslint-disable -->
  <v-dialog
    :model-value="brodcastListview"
    @update:model-value="$emit('update:brodcastListview', $event)"
    persistent
    :max-width="dialogWidth"
    transition="dialog-top-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">View Subscribers</div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>
      <v-card :loading="loading" v-if="broadcast_info.label == 'QR'">
        <v-card-text align="center">
          <div
            style="border: 1px solid black; max-width: fit-content"
            class="pa-3 mt-8 mb-8"
          >
            <VueQRCodeComponent
              :text="member_qr"
              error-level="H"
              :size="150"
            ></VueQRCodeComponent>
          </div>
          <span class="font-weight-bold">{{
            broadcast_info.item.team_name
          }}</span>
        </v-card-text>
      </v-card>
      <v-card v-else :loading="loading">
        <v-card-text class="">
          <v-text-field
            v-model="searchText"
            outlined
            style="max-width: 450px"
            dense
            append-icon="mdi-magnify"
            @input="filterItems"
          ></v-text-field>
          <div class="text-left">
            The following users have subscribed for the
            {{ broadcast_info.item.team_name }}
          </div>
          <v-card flat :height="300" class="overflow-auto">
            <v-list three-line>
              <!-- <v-list-item-subtitle class="text-left mt-2 mb-2">
                The following users have registered for the
                <b>  </b> event</v-list-item-subtitle
              > -->
              <template
                v-for="(item, index) in filteredItems"
                :key="item.full_user_name"
              >
                <v-list-item class="">
                  <v-avatar size="32" class="mr-2 mt-n14" color="#117658">
                    <span class="white--text">
                      {{ item.full_user_name.substring(0, 1) }}</span
                    >
                  </v-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="mt-n6"
                      >{{ item.full_user_name }}
                      <v-icon
                        class="ml-2"
                        color="pink"
                        v-if="item.is_admin == true"
                        >mdi-account</v-icon
                      >
                    </v-list-item-title>
                    <v-list-item-title
                      v-html="item.user_email_id"
                      class="text-left mt-n8"
                    ></v-list-item-title>
                    <v-divider
                      class="mt-n8 mb-2"
                      v-if="index < items.length - 1"
                      :key="index"
                    ></v-divider>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list>
          </v-card>
        </v-card-text>
      </v-card>
    </v-card>
  </v-dialog>
</template>
      
      <script>
/*eslint-disable*/
import { get_particular_broadcast_details } from "@/graphql/queries.js";
import VueQRCodeComponent from "vue-qrcode-component";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    brodcastListview: Boolean,
    broadcast_info: Object,
  },
  components: { VueQRCodeComponent },
  data() {
    return {
      member_qr: "",
      items: [],
      loading: false,
      searchText: "",
    };
  },
  watch: {
    brodcastListview: {
      async handler() {
        if (this.brodcastListview == true) {
          this.get_broadcastlist();
        }
      },
      immediate: true,
    },
  },
  computed: {
    filteredItems() {
      if (!this.searchText) {
        return this.items; // Return all items if search text is empty
      }
      const searchTerm = this.searchText.toLowerCase();
      return this.items.filter((item) => {
        const fullName = item.full_user_name.toLowerCase();
        const email = item.user_email_id.toLowerCase();
        return fullName.includes(searchTerm) || email.includes(searchTerm);
      });
    },
    dialogWidth() {
      return this.broadcast_info.label == "QR" ? "300px" : "500px";
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async get_broadcastlist() {
      this.loading = true;
      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_broadcast_details, {
            input: {
              user_email_id: this.$store.getters.GetUserObj.user.user_email_id,
              team_id: this.broadcast_info.item.team_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_particular_broadcast_details);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.member_qr = response.data[0].qr_link;
          this.items = response.data[0].team_users_list;
          this.filteredItems = this.items;

          this.loading = false;
        }

        this.tableData = response.details;
      } catch (error) {
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>
      
      <style>
</style>