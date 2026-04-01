<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="tranferOwnerDialog" @update:model-value="$emit('update:tranferOwnerDialog', $event)" persistent max-width="450" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Transfer Ownership</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <v-form ref="forms">
            <div class="text-left">
              Are you sure you want to transfer ownership of
              <b>{{ rowInfo.directory_name }}</b> to ?
            </div>
            <div>
              <v-select
                density="compact"
                variant="outlined"
                v-model="selectUser"
                class="mt-2"
                item-title="full_user_name"
                item-value="user_email_id"
                label="Select User"
                :rules="[(v) => !!v || 'Required']"
                :items="userItems"
              />
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="validate_data()"
            dark
            class="cardCss"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { change_directory_of_owner_ship } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    tranferOwnerDialog: Boolean,
    rowInfo: Object,
    allusers: Array,
  },

  data() {
    return {
      selectUser: "",
      userItems: [],
      loading: false,
    };
  },

  watch: {
    tranferOwnerDialog: {
      async handler() {
        if (this.tranferOwnerDialog == true) {
          this.userItems = [];
          this.allusers.forEach((element) => {
            if (
              element.user_status == "ACTIVE" &&
              element.user_type != "CHATBOT" &&
              element.user_email_id != this.rowInfo.directory_created_by
            ) {
              this.userItems.push({
                full_user_name: element.full_user_name,
                user_email_id: element.user_email_id,
              });
            }
          });
        }
      },
      immediate: true,
    },
  },
  methods: {
    async validate_data() {
      const { valid } = await this.$refs.forms.validate();
      if (valid) {
        this.transfer_ownership();
      }
    },

    close_dialog() {
      this.$emit("clicked", 0);
      if (this.$refs.forms) {
        this.$refs.forms.reset();
      }
    },

    async transfer_ownership() {
      this.loading = true;

      var userId = [];
      userId.push(this.rowInfo.user_id);
      // console.log(this.entryInfo.responseObject.directory_id);
      try {
        let result = await API.graphql(
          graphqlOperation(change_directory_of_owner_ship, {
            input: {
              directory_id: this.rowInfo.directory_id,
              user_email_id: this.selectUser,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.change_directory_of_owner_ship);

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>