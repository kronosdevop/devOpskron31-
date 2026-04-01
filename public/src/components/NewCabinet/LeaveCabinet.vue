<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="leaveCabinetDialog"
      @update:model-value="$emit('update:leaveCabinetDialog', $event)"
      persistent
      max-width="450"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Leave Cabinet</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()">
            mdi-close
          </v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <div class="text-left">
            Are you sure you want to leave the cabinet
            <b>{{ rowInfo.Key }}</b>?
          </div>
          <div class="text-caption text-grey mt-2">
            You will no longer have access to this cabinet and its contents.
          </div>
        </v-card-text>

        <v-card-actions class="justify-end">
         
          <v-btn
            size="small"
            :loading="loading"
            @click="leave_cabinet()"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Leave Cabinet
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { add_remove_member_cabinet } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    leaveCabinetDialog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async leave_cabinet() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(add_remove_member_cabinet, {
            input: {
              folder_id: this.rowInfo.folder_id,
              user_id: [data.user.user_id],
              action_type: "LEAVE",
            },
          })
        );

        var response = JSON.parse(result.data.add_remove_member_cabinet);
        this.loading = false;

        if (response.Status === "SUCCESS") {
          this.$emit("successMsg", "You have successfully left the cabinet!");
          this.close_dialog();
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

<style scoped>
.navBar {
  background: #f8f9fa !important;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-title {
  color: black !important;
  font-weight: 600;
  font-size: 18px;
}

.icon-class {
  color: black !important;
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-class:hover {
  transform: scale(1.1);
  color: #db4c77 !important;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 4px;
}

.cardCss {
  background: #db4c77;
  border-radius: 8px;
}

.button-corner {
  border-radius: 8px;
  padding: 0 24px;
  font-weight: 600;
}
</style> 