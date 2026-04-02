<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="delete_customdashboard" @update:model-value="$emit('update:delete_customdashboard', $event)" persistent max-width="400" transition="dialog-top-transition">
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">
          {{
          dashboarditems.dashboard_type == "CUSTOM"
            ? "Delete Custom Dashboard "
            : " System Dashboard "
        }}
        </div></v-toolbar-title>
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>
      <div
        v-if="
          dashboarditems.dashboard_type == 'CUSTOM' &&
          dashboarditems.dashboard_created_by !=
            $store.getters.GetUserObj.user?.user_email_id
        "
      >
        <v-card-text class="text-left mt-4 pb-8"
          ><div>Access Denied</div></v-card-text
        >
      </div>
      <div v-else-if="dashboarditems.dashboard_type == 'CUSTOM'">
        <v-card-title class="text-center">
          <v-img
            :src="require('@/assets/trash.png')"
            alt="Stichh Logo"
            max-width="800"
            height="150"
            contain
            class="rotate-swing"
          />
        </v-card-title>
        <v-card-text class="mt-4">
          <div class="text-left">
            Are you sure you want to delete
            <b> {{ dashboarditems.dashboard_name }}</b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="delete_mutation()"
            dark
            class="cardCss button-corner text-capitalize"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </div>

      <div v-else-if="dashboarditems.dashboard_type != 'CUSTOM'">
        <v-card-text class="text-left mt-4 pb-8"
          ><div>System Dashboard Can't Be <b>Deleted</b></div></v-card-text
        >
      </div>
    </v-card>
  </v-dialog>
</template>
  
  <script>
import { edit_or_delete_dashboard_topic } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    dashboarditems: Object,
    delete_customdashboard: Boolean,
  },
  data() {
    return {
      loading: false,
    };
  },
  watch: {
    delete_customdashboard: {
      async handler() {
        if (this.delete_customdashboard == true) {
          //  console.log(this.dashboarditems.dashboard_created_by)   ;
          //  console.log( this.$store.getters.GetUserObj.user.user_email_id);
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      // console.log(this.dashboarditems);
      this.$emit("clicked", 0);
    },
    async delete_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_or_delete_dashboard_topic, {
            input: {
              action_type: "DELETE",
              dashboard_id: this.dashboarditems.dashboard_id,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
            },
          })
        );
        var response = JSON.parse(result.data.edit_or_delete_dashboard_topic);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsgdelete", response.Message);
          this.$emit("deleteMSg", 0);
          // this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>
  
  <style>
</style>