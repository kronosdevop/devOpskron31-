<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog 
      :model-value="tranferOwnerDialog" 
      @update:model-value="$emit('update:tranferOwnerDialog', $event)"
      persistent 
      max-width="450" 
      transition="dialog-top-transition"
    >
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
              <b>{{ rowInfo.project_name }}</b>  ?
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
                :rules="[(v) => !!v || 'required ']"
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
import { initiate_project_transfer_ownership } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    tranferOwnerDialog: Boolean,
    rowInfo: Object,
    allUSersNames: Array,
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
          this.allUSersNames.forEach((element) => {
            if (
              element.user_status == "ACTIVE" &&
              element.user_type != "CHATBOT" &&
              element.user_email_id != this.rowInfo.dashboard_created_by
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
  async  validate_data() {
    const isValid = await this.$refs.forms.validate();
      if (isValid) {
        await this.transfer_ownership();
      }
     
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.forms.reset();
      this.$refs.forms.resetValidation();
    },

    async transfer_ownership() {
      this.loading = true;

    //   var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(initiate_project_transfer_ownership, {
            input: {
            //   organization_id: data.organization.organization_id,
              project_id: this.rowInfo.project_id,
              transfer_to_email: this.selectUser,
            //   current_user_email:data.user.user_email_id,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.initiate_project_transfer_ownership);

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.forms.reset();
          this.$refs.forms.resetValidation();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>